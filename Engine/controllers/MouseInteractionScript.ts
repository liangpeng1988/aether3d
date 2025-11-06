import { THREE } from "../core/global.ts";
import { ScriptBase } from "../core/ScriptBase";
import { ObjectPool, LayerManager } from "../core";
import { LayerManagerService } from "../../src/cad/controllers/LayerManagerService";

/**
 * 鼠标交互配置接口
 * 定义鼠标交互的所有可配置参数，支持多种交互模式
 */
export interface MouseInteractionConfig {
    /** 交互模式：'hover'(悬停) | 'click'(点击) | 'both'(两者皆支持) */
    interactionMode?: 'hover' | 'click' | 'both';
    /** 是否启用鼠标交互功能 */
    enabled?: boolean;
    /** 鼠标悬停延迟（毫秒），用于避免频繁触发悬停事件 */
    hoverDelay?: number;
    /** 是否显示鼠标悬停提示（预留功能） */
    showTooltip?: boolean;
    /** 可交互的对象层级掩码 */
    layerMask?: number;
    /** 要排除的对象名称数组 */
    excludeObjects?: string[];
    /** 要排除的对象类型数组 */
    excludeTypes?: string[];
    /** 性能优化：射线检测频率（毫秒），默认为16ms（约60FPS） */
    raycastInterval?: number;
    /** 图层ID排除列表，用于基于图层的排除机制 */
    excludeLayerIds?: string[];
    /** 是否启用图层可见性检查 */
    checkLayerVisibility?: boolean;
}

export class MouseInteractionScript extends ScriptBase {
    name = 'MouseInteractionScript';

    /** 鼠标交互的配置参数 */
    private config: Required<MouseInteractionConfig>;

    /** 射线投射器，用于检测鼠标与3D对象的交叉 */
    private raycaster: THREE.Raycaster;

    /** 鼠标在屏幕上的标准化坐标（-1到1范围） */
    private mouse: THREE.Vector2;

    /** 当前鼠标悬停的对象，只能有一个 */
    private hoveredObject: THREE.Object3D | null = null;

    /** 当前被选中的对象数组，支持多选 */
    private selectedObjects: THREE.Object3D[] = [];

    /** 悬停延迟的定时器ID，用于实现悬停延迟 */
    private hoverTimeout: number = 0;

    // 事件回调函数数组，支持多个回调
    private onObjectSelectedCallbacks: Array<(object: THREE.Object3D | null) => void> = [];
    private onObjectHoveredCallbacks: Array<(object: THREE.Object3D | null) => void> = [];
    private onObjectDeselectedCallbacks: Array<(object: THREE.Object3D | null) => void> = [];

    // 性能优化：添加时间戳用于节流
    private lastHoverCheck: number = 0;
    private lastClickCheck: number = 0;

    // 性能优化：添加对象池
    private vector2Pool: ObjectPool<THREE.Vector2>;
    private intersectionPool: ObjectPool<THREE.Intersection[]>;

    // 性能优化：射线检测控制
    private raycastTimer: number = 0;

    constructor(options?: MouseInteractionConfig) {
        super();

        // 合并默认配置和用户配置
        this.config = {
            interactionMode: 'hover',     // 默认使用悬停模式，提供最直观的交互体验
            enabled: true,                // 默认启用交互功能
            hoverDelay: 0,                // 默认无延迟，立即响应
            showTooltip: false,           // 默认不显示提示（预留功能）
            layerMask: 0xFFFFFFFF,        // 默认所有层级都可以交互
            excludeObjects: [],           // 默认不排除任何对象
            excludeTypes: [],             // 默认不排除任何对象类型
            raycastInterval: 16,          // 默认射线检测间隔16ms（约60FPS）
            excludeLayerIds: [],          // 默认不排除任何图层
            checkLayerVisibility: true,   // 默认检查图层可见性
            ...options                    // 覆盖用户指定的配置
        };

        // 初始化射线投射器和鼠标坐标
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 设置射线投射器的精度参数，提高检测准确性
        this.raycaster.params.Line = { threshold: 0.01 };      // 线条检测阈值
        this.raycaster.params.Points = { threshold: 0.01 };    // 点检测阈值

        // 初始化对象池
        this.vector2Pool = new ObjectPool<THREE.Vector2>(
            () => new THREE.Vector2(),
            (vec) => vec.set(0, 0)
        );

        this.intersectionPool = new ObjectPool<THREE.Intersection[]>(
            () => [],
            (arr) => arr.length = 0
        );

        // 初始化节流的鼠标移动处理函数
        this.throttledOnMouseMove = this.throttle(this.onMouseMove.bind(this), this.config.raycastInterval);
    }

    /**
     * 节流函数
     */
    private throttle<T extends (...args: any[]) => any>(
        func: T,
        delay: number
    ): (...args: any[]) => void {
        let lastCall = 0;
        return (...args: any[]) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func(...args);
            }
        };
    }

    /**
     * 节流的鼠标移动处理函数
     */
    private throttledOnMouseMove: ((event: MouseEvent) => void) | null = null;

    public override async start(): Promise<void> {
        super.start?.();
        this.setupEventListeners();
    }

    /**
     * 每帧更新 - 处理持续性的交互检测
     *
     * 主要负责在悬停模式下处理鼠标悬停检测，
     * 点击模式下由事件监听器直接处理
     *
     * @param deltaTime - 上一帧到当前帧的时间间隔（秒）
     */
    public override update(deltaTime: number): void {
        const startTime = performance.now();
        super.update?.(deltaTime);

        if (!this.config.enabled) return;

        // 在悬停模式下处理鼠标悬停逻辑
        if (this.config.interactionMode === 'hover' || this.config.interactionMode === 'both') {
            this.handleMouseHover();
        }

        // 性能分析：记录脚本执行时间
        const executionTime = performance.now() - startTime;
        if (this.renderer && (this.renderer as any).performanceAnalyzer) {
            (this.renderer as any).performanceAnalyzer.recordScriptExecution('MouseInteractionScript', executionTime);
        }
    }

    public override onResize(): void {
        super.onResize();
    }

    /**
     * 脚本禁用
     */
    public override onDisable(): void {
        super.onDisable?.();
        this.clearAllInteractions();
        this.removeEventListeners();
    }

    /**
     * 脚本销毁
     */
    public override destroy(): void {
        super.destroy?.();
        this.removeEventListeners();
        this.clearAllInteractions();
        // 清理悬停延迟定时器
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = 0;
        }
    }

    /**
     * 设置对象选择事件回调
     * @param callback 回调函数
     */
    public setOnObjectSelectedCallback(callback: (object: THREE.Object3D | null) => void): void {
        this.onObjectSelectedCallbacks = [callback];
    }

    /**
     * 添加对象选择事件回调
     * @param callback 回调函数
     */
    public addOnObjectSelectedCallback(callback: (object: THREE.Object3D | null) => void): void {
        this.onObjectSelectedCallbacks.push(callback);
    }

    /**
     * 移除对象选择事件回调
     * @param callback 回调函数
     */
    public removeOnObjectSelectedCallback(callback: (object: THREE.Object3D | null) => void): void {
        const index = this.onObjectSelectedCallbacks.indexOf(callback);
        if (index > -1) {
            this.onObjectSelectedCallbacks.splice(index, 1);
        }
    }

    /**
     * 设置对象悬停事件回调
     * @param callback 回调函数
     */
    public setOnObjectHoveredCallback(callback: (object: THREE.Object3D | null) => void): void {
        this.onObjectHoveredCallbacks = [callback];
    }

    /**
     * 添加对象悬停事件回调
     * @param callback 回调函数
     */
    public addOnObjectHoveredCallback(callback: (object: THREE.Object3D | null) => void): void {
        this.onObjectHoveredCallbacks.push(callback);
    }

    /**
     * 移除对象悬停事件回调
     * @param callback 回调函数
     */
    public removeOnObjectHoveredCallback(callback: (object: THREE.Object3D | null) => void): void {
        const index = this.onObjectHoveredCallbacks.indexOf(callback);
        if (index > -1) {
            this.onObjectHoveredCallbacks.splice(index, 1);
        }
    }

    /**
     * 设置对象取消选择事件回调
     * @param callback 回调函数
     */
    public setOnObjectDeselectedCallback(callback: (object: THREE.Object3D | null) => void): void {
        this.onObjectDeselectedCallbacks = [callback];
    }

    /**
     * 添加对象取消选择事件回调
     * @param callback 回调函数
     */
    public addOnObjectDeselectedCallback(callback: (object: THREE.Object3D | null) => void): void {
        this.onObjectDeselectedCallbacks.push(callback);
    }

    /**
     * 移除对象取消选择事件回调
     * @param callback 回调函数
     */
    public removeOnObjectDeselectedCallback(callback: (object: THREE.Object3D | null) => void): void {
        const index = this.onObjectDeselectedCallbacks.indexOf(callback);
        if (index > -1) {
            this.onObjectDeselectedCallbacks.splice(index, 1);
        }
    }

    /**
     * 更新鼠标交互配置
     * @param newConfig 新的配置
     */
    public updateConfig(newConfig: Partial<MouseInteractionConfig>): void {
        // 合并新配置到现有配置
        Object.assign(this.config, newConfig);
        
        // 如果射线检测间隔发生变化，更新节流函数
        if (newConfig.raycastInterval !== undefined) {
            this.throttledOnMouseMove = this.throttle(this.onMouseMove.bind(this), this.config.raycastInterval);
        }
    }

    /**
     * 添加要排除的对象名称
     * @param objectName 对象名称
     */
    public addExcludedObject(objectName: string): void {
        if (!this.config.excludeObjects.includes(objectName)) {
            this.config.excludeObjects.push(objectName);
        }
    }

    /**
     * 移除要排除的对象名称
     * @param objectName 对象名称
     */
    public removeExcludedObject(objectName: string): void {
        const index = this.config.excludeObjects.indexOf(objectName);
        if (index > -1) {
            this.config.excludeObjects.splice(index, 1);
        }
    }

    /**
     * 设置要排除的对象名称列表
     * @param objectNames 对象名称数组
     */
    public setExcludedObjects(objectNames: string[]): void {
        this.config.excludeObjects = [...objectNames];
    }

    /**
     * 获取要排除的对象名称列表
     * @returns 对象名称数组
     */
    public getExcludedObjects(): string[] {
        return [...this.config.excludeObjects];
    }

    /**
     * 添加要排除的图层ID
     * @param layerId 图层ID
     */
    public addExcludedLayer(layerId: string): void {
        if (!this.config.excludeLayerIds.includes(layerId)) {
            this.config.excludeLayerIds.push(layerId);
            console.log(`[MouseInteractionScript] 添加排除图层: ${layerId}`);
        } else {
            console.log(`[MouseInteractionScript] 图层已存在于排除列表中: ${layerId}`);
        }
    }

    /**
     * 移除要排除的图层ID
     * @param layerId 图层ID
     */
    public removeExcludedLayer(layerId: string): void {
        const index = this.config.excludeLayerIds.indexOf(layerId);
        if (index > -1) {
            this.config.excludeLayerIds.splice(index, 1);
        }
    }

    /**
     * 设置要排除的图层ID列表
     * @param layerIds 图层ID数组
     */
    public setExcludedLayers(layerIds: string[]): void {
        this.config.excludeLayerIds = [...layerIds];
    }

    /**
     * 获取要排除的图层ID列表
     * @returns 图层ID数组
     */
    public getExcludedLayers(): string[] {
        console.log(`[MouseInteractionScript] 获取排除的图层列表:`, [...this.config.excludeLayerIds]);
        return [...this.config.excludeLayerIds];
    }

    /**
     * 设置是否检查图层可见性
     * @param check 是否检查
     */
    public setCheckLayerVisibility(check: boolean): void {
        this.config.checkLayerVisibility = check;
    }

    /**
     * 检查对象是否可以交互
     * 使用引擎核心中的图层管理功能
     * @param object 要检查的对象
     * @returns 对象是否可以交互
     */
    private isObjectInteractable(object: THREE.Object3D): boolean {
        // console.log(`[MouseInteractionScript] 检查对象交互性: ${object.name}, type: ${object.type}, layerId: ${object.userData?.layerId}`);
        
        // 检查对象名称排除列表
        if (this.config.excludeObjects.includes(object.name)) {
            // console.log(`[MouseInteractionScript] 对象被名称排除: ${object.name}`);
            return false;
        }

        // 检查对象类型排除列表
        const objectType = object.type;
        if (this.config.excludeTypes.includes(objectType)) {
            // console.log(`[MouseInteractionScript] 对象被类型排除: ${objectType}`);
            return false;
        }

        // 使用引擎核心中的图层管理功能检查图层ID排除列表
        if (object.userData && object.userData.layerId) {
            if (this.config.excludeLayerIds.includes(object.userData.layerId)) {
                // console.log(`[MouseInteractionScript] 对象被图层排除: ${object.name}, layerId: ${object.userData.layerId}`);
                return false;
            }
            
            // 检查图层可见性（如果启用）
            if (this.config.checkLayerVisibility && LayerManagerService.isObjectLocked(object)) {
                // console.log(`[MouseInteractionScript] 对象被锁定: ${object.name}, layerId: ${object.userData?.layerId}`);
                return false;
            }
        }

        // 检查对象是否为Mesh且具有材质
        if (object instanceof THREE.Mesh) {
            // 检查材质是否存在
            if (!object.material) {
                return false;
            }

            // 如果材质是数组，检查每个材质
            if (Array.isArray(object.material)) {
                for (const mat of object.material) {
                    if (!mat) {
                        return false;
                    }
                }
            }
        }

        // console.log(`[MouseInteractionScript] 对象可以交互: ${object.name}`);
        return true;
    }

    /**
     * 过滤可交互的对象
     * @param intersects 射线检测结果
     * @returns 过滤后的对象数组
     */
    private filterInteractableObjects(intersects: THREE.Intersection[]): THREE.Intersection[] {
        // console.log(`[MouseInteractionScript] 开始过滤 ${intersects.length} 个交集对象`);
        const filtered = intersects.filter(intersect => {
            // 检查交集对象是否存在
            if (!intersect.object) {
                // console.log(`[MouseInteractionScript] 交集对象不存在`);
                return false;
            }

            // 检查对象是否可以交互
            return this.isObjectInteractable(intersect.object);
            // if (!isInteractable) {
            //     // console.log(`[MouseInteractionScript] 对象被过滤: ${intersect.object.name}, layerId: ${intersect.object.userData?.layerId}`);
            // }
            // return isInteractable;
        });
        // console.log(`[MouseInteractionScript] 过滤后剩余 ${filtered.length} 个对象`);
        return filtered;
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        try {
            const canvas = this.webGLRenderer.domElement;

            if (this.config.interactionMode === 'hover' || this.config.interactionMode === 'both') {
                if (this.throttledOnMouseMove) {
                    canvas.addEventListener('mousemove', this.throttledOnMouseMove);
                }
            }

            if (this.config.interactionMode === 'click' || this.config.interactionMode === 'both') {
                canvas.addEventListener('click', this.onClickHandler);
                // 添加触摸事件支持
                canvas.addEventListener('touchstart', this.onTouchStartHandler);
            }

            // 添加触摸移动和结束事件监听器，用于更好的触摸体验
            canvas.addEventListener('touchmove', this.onTouchMoveHandler);
            canvas.addEventListener('touchend', this.onTouchEndHandler);
        } catch (error) {
            console.error('[MouseInteractionScript] 设置事件监听器时出错:', error);
        }
    }

    /**
     * 移除事件监听器
     */
    private removeEventListeners(): void {
        try {
            const canvas = this.webGLRenderer.domElement;

            if (this.throttledOnMouseMove) {
                canvas.removeEventListener('mousemove', this.throttledOnMouseMove);
            }
            canvas.removeEventListener('click', this.onClickHandler);
            // 移除触摸事件监听器
            canvas.removeEventListener('touchstart', this.onTouchStartHandler);
            canvas.removeEventListener('touchmove', this.onTouchMoveHandler);
            canvas.removeEventListener('touchend', this.onTouchEndHandler);
        } catch (error) {
            console.error('[MouseInteractionScript] 移除事件监听器时出错:', error);
        }
    }

    // 事件处理函数的包装器，用于确保正确的this绑定
    private onMouseMoveHandler = (event: MouseEvent) => {
        this.onMouseMove(event);
    };

    private onClickHandler = (event: MouseEvent) => {
        this.onClick(event);
    };

    private onTouchStartHandler = (event: TouchEvent) => {
        this.onTouchStart(event);
    };

    private onTouchMoveHandler = (event: TouchEvent) => {
        // 触摸移动事件处理，可以用于拖拽等操作
        event.preventDefault(); // 阻止默认行为
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private onTouchEndHandler = (event: TouchEvent) => {
        // 触摸结束事件处理
    };

    // ===========================================
    // 鼠标事件处理方法
    // ===========================================
    private onMouseMove(event: MouseEvent): void {
        try {
            const rect = this.webGLRenderer.domElement.getBoundingClientRect();

            // 从对象池获取Vector2对象
            const mouse = this.vector2Pool.acquire();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            this.mouse.copy(mouse);

            // 释放对象回对象池
            this.vector2Pool.release(mouse);
        } catch (error) {
            console.error('[MouseInteractionScript] 处理鼠标移动事件时出错:', error);
        }
    }

    /**
     * 处理鼠标悬停逻辑
     */
    private handleMouseHover(): void {
        // 性能优化：节流悬停检查
        const now = performance.now();
        if (now - this.lastHoverCheck < this.config.raycastInterval) {
            return;
        }
        this.lastHoverCheck = now;

        try {
            // 更新射线投射器
            this.raycaster.setFromCamera(this.mouse, this.camera);

            // 执行射线检测
            // console.log(`[MouseInteractionScript] 执行射线检测`);
            const intersects = this.raycaster.intersectObjects(this.scene.children, true);
            // console.log(`[MouseInteractionScript] 射线检测找到 ${intersects.length} 个交集对象`);

            // 过滤可交互的对象
            const interactableIntersects = this.filterInteractableObjects(intersects);

            let newHoveredObject: THREE.Object3D | null = null;

            // 如果有交集对象，选择第一个（最靠近相机的）
            if (interactableIntersects.length > 0) {
                newHoveredObject = interactableIntersects[0].object;
                // console.log(`[MouseInteractionScript] 选择悬停对象: ${newHoveredObject.name}`);
            } 
            // else {
            //     console.log(`[MouseInteractionScript] 没有可交互的对象`);
            // }

            // 如果悬停对象发生变化
            if (newHoveredObject !== this.hoveredObject) {
                // 清除之前的悬停对象
                if (this.hoveredObject) {
                    // console.log(`[MouseInteractionScript] 清除之前的悬停对象: ${this.hoveredObject.name}`);
                    this.onObjectHoveredCallbacks.forEach(callback => callback(null));
                }

                // 设置新的悬停对象
                this.hoveredObject = newHoveredObject;

                // 触发悬停事件
                if (this.hoveredObject) {
                    // console.log(`[MouseInteractionScript] 触发悬停事件: ${this.hoveredObject.name}`);
                    this.onObjectHoveredCallbacks.forEach(callback => callback(this.hoveredObject));
                }
            }
        } catch (error) {
            console.error('[MouseInteractionScript] 处理鼠标悬停时出错:', error);
        }
    }

    /**
     * 触摸开始事件处理器
     *
     * 处理触摸事件，实现与鼠标点击相同的功能
     *
     * @param event - 触摸事件对象
     */
    private onTouchStart(event: TouchEvent): void {
        try {
            // 只有当event具有preventDefault方法时才调用
            if (event && typeof event.preventDefault === 'function') {
                event.preventDefault();
            }

            // 使用第一个触摸点
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                const mouseEvent = {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                } as MouseEvent;

                // 复用点击处理逻辑
                this.onClick(mouseEvent);
            }
        } catch (error) {
            console.error('[MouseInteractionScript] 处理触摸事件时出错:', error);
        }
    }

    /**
     * 点击事件处理器
     *
     * 处理鼠标点击事件，实现对象的选择和取消选择。
     * 支持多选模式：再次点击已选中的对象可以取消选择。
     * 点击空白区域将清除所有选择。
     *
     * @param event - 鼠标点击事件对象
     */
    private onClick(event: MouseEvent): void {
        try {
            // 性能优化：节流点击事件
            const now = performance.now();
            if (now - this.lastClickCheck < this.config.raycastInterval) {
                return;
            }
            this.lastClickCheck = now;

            // 只有当event具有preventDefault方法时才调用
            if (event && typeof event.preventDefault === 'function') {
                event.preventDefault();
            }

            // 计算鼠标位置
            const canvas = this.webGLRenderer.domElement;
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // 更新射线投射器
            this.raycaster.setFromCamera(this.mouse, this.camera);

            // 执行射线检测
            // console.log(`[MouseInteractionScript] 执行点击射线检测`);
            const intersects = this.raycaster.intersectObjects(this.scene.children, true);
            // console.log(`[MouseInteractionScript] 点击射线检测找到 ${intersects.length} 个交集对象`);

            // 过滤可交互的对象
            const interactableIntersects = this.filterInteractableObjects(intersects);

            let clickedObject: THREE.Object3D | null = null;

            // 如果有交集对象，选择第一个（最靠近相机的）
            if (interactableIntersects.length > 0) {
                clickedObject = interactableIntersects[0].object;
                // console.log(`[MouseInteractionScript] 点击对象: ${clickedObject.name}`);
            } 
            // else {
            //     console.log(`[MouseInteractionScript] 没有可交互的对象被点击`);
            // }

            // 处理对象选择逻辑
            if (clickedObject) {
                // 检查是否已经选中了该对象
                const isSelected = this.selectedObjects.includes(clickedObject);

                if (isSelected) {
                    // 如果已经选中，取消选择
                    const index = this.selectedObjects.indexOf(clickedObject);
                    this.selectedObjects.splice(index, 1);
                    this.onObjectDeselectedCallbacks.forEach(callback => callback(clickedObject));
                } else {
                    // 如果未选中，添加到选中列表
                    this.selectedObjects.push(clickedObject);
                    this.onObjectSelectedCallbacks.forEach(callback => callback(clickedObject));
                }
            } else {
                // 点击空白区域，清除所有选择
                if (this.selectedObjects.length > 0) {
                    this.selectedObjects.forEach(obj => {
                        this.onObjectDeselectedCallbacks.forEach(callback => callback(obj));
                    });
                    this.selectedObjects = [];
                }
                this.onObjectSelectedCallbacks.forEach(callback => callback(null));
            }
        } catch (error) {
            console.error('[MouseInteractionScript] 处理点击事件时出错:', error);
        }
    }

    /**
     * 清除所有交互状态
     */
    private clearAllInteractions(): void {
        // 清除悬停状态
        if (this.hoveredObject) {
            this.hoveredObject = null;
            this.onObjectHoveredCallbacks.forEach(callback => callback(null));
        }

        // 清除选择状态
        if (this.selectedObjects.length > 0) {
            this.selectedObjects.forEach(obj => {
                this.onObjectDeselectedCallbacks.forEach(callback => callback(obj));
            });
            this.selectedObjects = [];
        }
    }

    /**
     * 获取当前选中的对象
     * @returns 当前选中的对象数组
     */
    public getSelectedObjects(): THREE.Object3D[] {
        return [...this.selectedObjects];
    }

    /**
     * 获取当前悬停的对象
     * @returns 当前悬停的对象
     */
    public getHoveredObject(): THREE.Object3D | null {
        return this.hoveredObject;
    }
}