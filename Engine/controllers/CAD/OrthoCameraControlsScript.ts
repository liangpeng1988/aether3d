import { THREE, TWEEN } from "../../core/global";
import { ScriptBase } from "../../core/ScriptBase";

/**
 * 正交相机控制配置接口
 */
export interface OrthoCameraControlsConfig {
    /** 是否启用阻尼 */
    enableDamping?: boolean;
    /** 阻尼系数 */
    dampingFactor?: number;
    /** 是否启用缩放 */
    enableZoom?: boolean;
    /** 缩放速度 */
    zoomSpeed?: number;
    /** 是否启用平移 */
    enablePan?: boolean;
    /** 平移速度 */
    panSpeed?: number;
    /** 最小缩放值 */
    minZoom?: number;
    /** 最大缩放值 */
    maxZoom?: number;
    /** 目标位置 */
    target?: THREE.Vector3;
}

export class OrthoCameraControlsScript extends ScriptBase {
    name = 'OrthoCameraControlsScript';
    
    /** 配置参数 */
    private config: Required<OrthoCameraControlsConfig>;

    /** 相机引用 */
    private cameraRef: THREE.Camera | null = null;

    /** 渲染器引用 */
    private rendererRef: THREE.WebGLRenderer | null = null;

    /** 是否启用状态 */
    private _enabled = true;

    /** 平移相关 */
    private targetPosition: THREE.Vector3;
    private targetZoom: number;
    private currentPosition: THREE.Vector3;
    private currentZoom: number;
    
    /** 阻尼相关 */
    private dampingPosition: THREE.Vector3;
    private dampingZoom: number;

    /** 交互状态 */
    private isPanning = false;
    private isZooming = false;
    private previousMousePosition = { x: 0, y: 0 };
    
    /** 相机边界 */
    private panBoundaryMin: THREE.Vector3 | null = null;
    private panBoundaryMax: THREE.Vector3 | null = null;

    /**
     * 构造函数 - 初始化正交相机控制脚本
     *
     * @param options - 可选的配置参数
     */
    constructor(options?: OrthoCameraControlsConfig) {
        super();
        // 合并默认配置和用户配置
        this.config = {
            enableDamping: true,
            dampingFactor: 0.08,
            enableZoom: true,
            zoomSpeed: 1.0,
            enablePan: true,
            panSpeed: 1.0,
            minZoom: 0.5,
            maxZoom: 2.0,
            target: new THREE.Vector3(0, 0, 0),
            ...options
        };
        
        // 初始化状态
        this.targetPosition = this.config.target.clone();
        this.targetZoom = 1.0;
        this.currentPosition = this.config.target.clone();
        this.currentZoom = 1.0;
        this.dampingPosition = new THREE.Vector3();
        this.dampingZoom = 0;
    }

    /**
     * 脚本启用
     */
    public override onEnable(): void {
        super.onEnable?.();
        this._enabled = true;
    }

    /**
     * 脚本初始化 - 核心初始化逻辑
     */
    public override async start(): Promise<void> {
        super.start?.();
        // 获取相机和渲染器
        try {
            this.cameraRef = this.camera;  // 通过getter获取相机
            this.rendererRef = this.webGLRenderer;  // 通过getter获取渲染器
        } catch (error) {
            console.warn('[OrthoCameraControlsScript] 无法直接获取相机或渲染器:', error);
        }

        if (!this.cameraRef || !this.rendererRef) {
            console.warn('[OrthoCameraControlsScript] 无法获取相机或渲染器，将在后续自动检测');
        } else {
            // 添加事件监听器
            this.addEventListeners();
        }
    }

    /**
     * 每帧更新 - 更新相机控制
     *
     * @param deltaTime - 上一帧到当前帧的时间间隔（秒）
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
        // 如果相机或渲染器还未获取，尝试重新获取
        if (!this.cameraRef || !this.rendererRef) {
            this.tryAutoSetup();
        }

        // 更新相机位置和缩放
        this.updateCamera();
    }

    /**
     * 脚本禁用
     */
    public override onDisable(): void {
        super.onDisable?.();
        this._enabled = false;
    }

    /**
     * 脚本销毁 - 清理所有资源
     */
    public override destroy(): void {
        super.destroy?.();
        // 移除事件监听器
        this.removeEventListeners();
    }

    // ===========================================
    // 公共方法
    // ===========================================

    /**
     * 设置默认相机位置和目标点
     * @param position 相机位置
     * @param target 相机目标点
     */
    setDefaultCameraPosition(position: THREE.Vector3, target: THREE.Vector3): void {
        this.targetPosition.copy(target);
        this.currentPosition.copy(target);
        this.updateCamera();
    }

    /**
     * 获取当前相机位置
     */
    getCameraPosition(): THREE.Vector3 | null {
        return this.cameraRef ? this.cameraRef.position.clone() : null;
    }

    /**
     * 获取当前目标位置
     */
    getTargetPosition(): THREE.Vector3 {
        return this.targetPosition.clone();
    }

    /**
     * 获取控制器是否启用
     */
    getEnabled(): boolean {
        return this._enabled;
    }

    /**
     * 启用控制器
     */
    enable(): void {
        this._enabled = true;
    }

    /**
     * 禁用控制器
     */
    disable(): void {
        this._enabled = false;
    }

    /**
     * 重置控制器
     */
    reset(): void {
        this.targetPosition.copy(this.config.target);
        this.targetZoom = 1.0;
        this.currentPosition.copy(this.config.target);
        this.currentZoom = 1.0;
        this.dampingPosition.set(0, 0, 0);
        this.dampingZoom = 0;
        this.updateCamera();
    }

    /**
     * 更新配置
     * @param newConfig 新的配置选项
     */
    updateConfig(newConfig: Partial<OrthoCameraControlsConfig>): void {
        Object.assign(this.config, newConfig);
    }

    /**
     * 获取当前配置
     */
    getConfig(): OrthoCameraControlsConfig {
        return { ...this.config };
    }

    /**
     * 设置平移边界
     * @param min 最小边界
     * @param max 最大边界
     */
    setPanBoundary(min: THREE.Vector3 | null, max: THREE.Vector3 | null): void {
        this.panBoundaryMin = min ? min.clone() : null;
        this.panBoundaryMax = max ? max.clone() : null;
    }

    /**
     * 公共平移方法
     * @param deltaX X轴偏移
     * @param deltaY Y轴偏移
     */
    public pan(deltaX: number, deltaY: number): void {
        this.panInternal(deltaX, deltaY);
    }

    // ===========================================
    // 私有方法
    // ===========================================

    /**
     * 尝试自动设置相机和渲染器
     */
    private tryAutoSetup(): void {
        try {
            if (!this.cameraRef) {
                this.cameraRef = this.camera;  // 通过getter获取相机
            }

            if (!this.rendererRef) {
                this.rendererRef = this.webGLRenderer;  // 通过getter获取渲染器
            }

            // 如果都获取到了，添加事件监听器
            if (this.cameraRef && this.rendererRef) {
                this.addEventListeners();
            }
        } catch (error) {
            // 静默处理，避免在每次更新时都打印错误
            console.warn('[OrthoCameraControlsScript] 自动设置相机和渲染器时出错:', error);
        }
    }

    /**
     * 添加事件监听器
     */
    private addEventListeners(): void {
        if (!this.rendererRef) return;
        
        const element = this.rendererRef.domElement;
        element.addEventListener('mousedown', this.onMouseDown);
        element.addEventListener('wheel', this.onMouseWheel);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        element.addEventListener('contextmenu', this.onContextMenu);
    }

    /**
     * 移除事件监听器
     */
    private removeEventListeners(): void {
        if (!this.rendererRef) return;
        
        const element = this.rendererRef.domElement;
        element.removeEventListener('mousedown', this.onMouseDown);
        element.removeEventListener('wheel', this.onMouseWheel);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        element.removeEventListener('contextmenu', this.onContextMenu);
    }

    /**
     * 鼠标按下事件处理
     */
    private onMouseDown = (event: MouseEvent) => {
        if (!this._enabled || !this.cameraRef || !this.rendererRef) return;
        
        // 只处理鼠标中键和右键
        if (event.button !== 1 && event.button !== 2) return;
        
        event.preventDefault();
        
        this.isPanning = true;
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }

    /**
     * 鼠标移动事件处理
     */
    private onMouseMove = (event: MouseEvent) => {
        if (!this._enabled || !this.isPanning || !this.cameraRef || !this.rendererRef) return;
        
        const deltaX = event.clientX - this.previousMousePosition.x;
        const deltaY = event.clientY - this.previousMousePosition.y;
        
        if (deltaX === 0 && deltaY === 0) return;
        
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
        
        // 平移相机
        this.pan(deltaX, deltaY);
    }

    /**
     * 鼠标抬起事件处理
     */
    private onMouseUp = (event: MouseEvent) => {
        if (!this._enabled) return;
        
        this.isPanning = false;
        this.isZooming = false;
    }

    /**
     * 鼠标滚轮事件处理
     */
    private onMouseWheel = (event: WheelEvent) => {
        if (!this._enabled || !this.config.enableZoom || !this.cameraRef || !this.rendererRef) return;
        
        event.preventDefault();
        
        // 缩放相机
        this.zoom(event.deltaY);
    }

    /**
     * 右键菜单事件处理
     */
    private onContextMenu = (event: MouseEvent) => {
        if (!this._enabled) return;
        event.preventDefault();
    }

    /**
     * 平移相机
     * @param deltaX X轴偏移
     * @param deltaY Y轴偏移
     */
    private panInternal(deltaX: number, deltaY: number): void {
        if (!this.config.enablePan || !this.cameraRef) return;
        
        const panSpeed = this.config.panSpeed * 0.01;
        const element = this.rendererRef?.domElement;
        if (!element) return;
        
        // 计算平移向量
        const panVector = new THREE.Vector3();
        panVector.set(deltaX * panSpeed, -deltaY * panSpeed, 0);
        
        // 转换到世界坐标系
        panVector.applyQuaternion(this.cameraRef.quaternion);
        
        // 应用缩放因子
        panVector.multiplyScalar(this.currentZoom);
        
        // 更新目标位置
        this.targetPosition.sub(panVector);
        
        // 应用边界限制
        if (this.panBoundaryMin || this.panBoundaryMax) {
            this.applyBoundaryConstraints();
        }
    }

    /**
     * 缩放相机
     * @param delta 滚轮偏移量
     */
    private zoom(delta: number): void {
        if (!this.config.enableZoom || !this.cameraRef) return;
        
        const zoomSpeed = this.config.zoomSpeed * 0.001;
        const factor = 1 + delta * zoomSpeed;
        
        // 更新目标缩放
        this.targetZoom *= factor;
        
        // 应用缩放限制
        this.targetZoom = Math.max(this.config.minZoom, Math.min(this.config.maxZoom, this.targetZoom));
    }

    /**
     * 应用边界约束
     */
    private applyBoundaryConstraints(): void {
        if (this.panBoundaryMin) {
            this.targetPosition.x = Math.max(this.panBoundaryMin.x, this.targetPosition.x);
            this.targetPosition.y = Math.max(this.panBoundaryMin.y, this.targetPosition.y);
            this.targetPosition.z = Math.max(this.panBoundaryMin.z, this.targetPosition.z);
        }
        
        if (this.panBoundaryMax) {
            this.targetPosition.x = Math.min(this.panBoundaryMax.x, this.targetPosition.x);
            this.targetPosition.y = Math.min(this.panBoundaryMax.y, this.targetPosition.y);
            this.targetPosition.z = Math.min(this.panBoundaryMax.z, this.targetPosition.z);
        }
    }

    /**
     * 更新相机
     */
    private updateCamera(): void {
        if (!this.cameraRef) return;
        
        if (this.config.enableDamping) {
            // 使用阻尼更新
            this.dampingPosition.subVectors(this.targetPosition, this.currentPosition);
            this.dampingPosition.multiplyScalar(this.config.dampingFactor);
            this.currentPosition.add(this.dampingPosition);
            
            const zoomDelta = this.targetZoom - this.currentZoom;
            this.dampingZoom = zoomDelta * this.config.dampingFactor;
            this.currentZoom += this.dampingZoom;
        } else {
            // 直接更新
            this.currentPosition.copy(this.targetPosition);
            this.currentZoom = this.targetZoom;
        }
        
        // 更新相机位置
        this.cameraRef.position.copy(this.currentPosition);
        
        // 更新正交相机的缩放
        if (this.cameraRef instanceof THREE.OrthographicCamera) {
            const scale = 1 / this.currentZoom;
            this.cameraRef.zoom = this.currentZoom;
            this.cameraRef.updateProjectionMatrix();
        }
    }
}