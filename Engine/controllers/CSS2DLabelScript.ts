import { THREE } from "../core/global.ts";
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { ScriptBase } from '../core/ScriptBase';

/**
 * 2D标签配置接口
 * 定义创建2D标签所需的所有配置参数
 */
export interface Label2DConfig {
    /** 标签文本内容 */
    content: string;
    /** 标签的CSS类名，用于自定义样式 */
    className?: string;
    /** 直接应用的内联样式对象 */
    style?: Partial<CSSStyleDeclaration>;
    /** 标签相对于目标对象的偏移位置 */
    offset?: THREE.Vector3;
    /** 是否可点击交互 */
    clickable?: boolean;
    /** 是否始终显示在最前面 */
    alwaysOnTop?: boolean;
    /** 标签可见性 */
    visible?: boolean;
    /** 点击事件回调函数 */
    onClick?: (event: MouseEvent, label: CSS2DLabel) => void;
    /** 鼠标悬停进入回调 */
    onMouseEnter?: (event: MouseEvent, label: CSS2DLabel) => void;
    /** 鼠标悬停离开回调 */
    onMouseLeave?: (event: MouseEvent, label: CSS2DLabel) => void;
}

/**
 * CSS2D标签脚本的全局配置接口
 */
export interface CSS2DLabelScriptConfig {
    /** 渲染器容器元素 */
    container?: HTMLElement;
    /** 是否自动调整大小 */
    autoResize?: boolean;
    /** CSS2D渲染器的层级 */
    zIndex?: number;
    /** 是否启用标签系统 */
    enabled?: boolean;
    /** 默认标签样式 */
    defaultLabelStyle?: Partial<CSSStyleDeclaration>;
}

/**
 * CSS2D标签类
 * 封装单个2D标签的创建、管理和交互功能
 */
export class CSS2DLabel {
    /** 标签的唯一标识符 */
    public readonly id: string;
    /** 标签附着的3D目标对象 */
    public readonly targetObject: THREE.Object3D;
    /** Three.js的CSS2DObject实例 */
    public readonly css2dObject: CSS2DObject;
    /** 实际的HTML DOM元素 */
    public readonly element: HTMLElement;
    /** 标签的配置信息 */
    private config: Label2DConfig & {
        content: string;
        className: string;
        style: Partial<CSSStyleDeclaration>;
        offset: THREE.Vector3;
        clickable: boolean;
        alwaysOnTop: boolean;
        visible: boolean;
    };

    constructor(id: string, targetObject: THREE.Object3D, config: Label2DConfig) {
        this.id = id;
        this.targetObject = targetObject;

        // 合并默认配置和用户配置
        this.config = {
            content: config.content,
            className: config.className || '',
            style: config.style || {},
            offset: config.offset || new THREE.Vector3(0, 0, 0),
            clickable: config.clickable || false,
            alwaysOnTop: config.alwaysOnTop || false,
            visible: config.visible !== false,
            onClick: config.onClick || undefined,
            onMouseEnter: config.onMouseEnter || undefined,
            onMouseLeave: config.onMouseLeave || undefined
        };

        // 创建HTML元素
        this.element = this.createElement();

        // 创建CSS2DObject
        this.css2dObject = new CSS2DObject(this.element);
        this.css2dObject.position.copy(this.config.offset);
        this.css2dObject.visible = this.config.visible;

        // 添加到目标对象
        this.targetObject.add(this.css2dObject);

        // 设置事件监听器
        this.setupEventListeners();
    }

    /**
     * 创建HTML标签元素
     *
     * @returns 配置好的HTML元素
     */
    private createElement(): HTMLElement {
        const element = document.createElement('div');
        element.className = `css2d-label ${this.config.className}`;
        element.textContent = this.config.content;

        // 设置默认样式 - 现代化的标签外观
        const defaultStyle: Partial<CSSStyleDeclaration> = {
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            pointerEvents: this.config.clickable ? 'auto' : 'none',
            userSelect: 'none',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            cursor: this.config.clickable ? 'pointer' : 'default',
            zIndex: this.config.alwaysOnTop ? '9999' : 'auto'
        };

        // 应用样式：默认样式 + 用户自定义样式
        Object.assign(element.style, defaultStyle, this.config.style);

        return element;
    }

    /**
     * 设置事件监听器
     * 处理鼠标交互事件
     */
    private setupEventListeners(): void {
        if (this.config.clickable && this.config.onClick) {
            this.element.addEventListener('click', (event) => {
                event.stopPropagation();
                this.config.onClick!(event, this);
            });
        }

        if (this.config.onMouseEnter) {
            this.element.addEventListener('mouseenter', (event) => {
                this.config.onMouseEnter!(event, this);
            });
        }

        if (this.config.onMouseLeave) {
            this.element.addEventListener('mouseleave', (event) => {
                this.config.onMouseLeave!(event, this);
            });
        }

        // 添加悬停效果
        if (this.config.clickable) {
            this.element.addEventListener('mouseenter', () => {
                this.element.style.transform = 'scale(1.05)';
                this.element.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5)';
            });

            this.element.addEventListener('mouseleave', () => {
                this.element.style.transform = 'scale(1)';
                this.element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
            });
        }
    }

    /**
     * 更新标签内容
     *
     * @param content - 新的文本内容
     */
    updateContent(content: string): void {
        this.config.content = content;
        this.element.textContent = content;
    }

    /**
     * 更新标签样式
     *
     * @param style - 要应用的样式对象
     */
    updateStyle(style: Partial<CSSStyleDeclaration>): void {
        Object.assign(this.config.style, style);
        Object.assign(this.element.style, style);
    }

    /**
     * 设置标签位置偏移
     *
     * @param offset - 相对于目标对象的偏移量
     */
    setOffset(offset: THREE.Vector3): void {
        this.config.offset = offset.clone();
        this.css2dObject.position.copy(offset);
    }

    /**
     * 显示标签
     */
    show(): void {
        this.config.visible = true;
        this.css2dObject.visible = true;
        this.element.style.display = 'block';
    }

    /**
     * 隐藏标签
     */
    hide(): void {
        this.config.visible = false;
        this.css2dObject.visible = false;
        this.element.style.display = 'none';
    }

    /**
     * 切换标签可见性
     *
     * @returns 切换后的可见状态
     */
    toggle(): boolean {
        if (this.config.visible) {
            this.hide();
        } else {
            this.show();
        }
        return this.config.visible;
    }

    /**
     * 获取标签当前配置
     *
     * @returns 配置对象的副本
     */
    getConfig(): Label2DConfig {
        return { ...this.config };
    }

    /**
     * 销毁标签
     * 清理所有资源和事件监听器
     */
    destroy(): void {
        // 从目标对象移除
        if (this.targetObject && this.css2dObject) {
            this.targetObject.remove(this.css2dObject);
        }

        // 移除DOM元素
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
}

/**
 * CSS2D标签脚本 - 基于IScript接口实现的2D标签系统
 *
 * 该脚本提供了在3D场景中创建和管理2D HTML标签的完整功能：
 *
 * 主要功能：
 * 1. CSS2DRenderer的创建和管理
 * 2. 2D标签的生命周期管理
 * 3. 自动处理窗口大小调整
 * 4. 与Aether3D引擎的无缝集成
 * 5. 支持丰富的交互事件
 *
 * 使用场景：
 * - 设备标识和信息显示
 * - 用户界面元素叠加
 * - 交互式标注系统
 * - 数据可视化标签
 * - 操作指引和提示
 *
 * @example
 * ```typescript
 * // 创建标签脚本
 * const labelScript = new CSS2DLabelScript({
 *   autoResize: true,
 *   zIndex: 1000
 * });
 *
 * // 绑定到场景
 * engine.bindScriptToScene({
 *   name: 'CSS2DLabelScript',
 *   sceneName: 'default',
 *   script: labelScript
 * });
 *
 * // 添加标签
 * labelScript.addLabel('device-1', meshObject, {
 *   content: '设备状态：正常',
 *   clickable: true,
 *   onClick: (event, label) => showDeviceDetails()
 * });
 * ```
 *
 * @author Aether3D Team
 * @version 1.0.0
 */
export class CSS2DLabelScript extends ScriptBase {
    /** 脚本名称，用于在引擎中标识该脚本 */
    name = 'CSS2DLabelScript';

    // ===========================================
    // 核心组件和配置
    // ===========================================

    /** CSS2D渲染器实例，负责渲染HTML标签到屏幕上 */
    private css2dRenderer: CSS2DRenderer | null = null;

    /** 标签管理容器，使用Map提供高效的标签查找 */
    private labels = new Map<string, CSS2DLabel>();

    /** 渲染器的DOM容器元素 */
    private container: HTMLElement | null = null;

    /** 脚本配置参数 */
    private config: Required<CSS2DLabelScriptConfig>;

    /** 窗口大小调整事件的绑定引用，用于事件清理 */
    private boundResizeHandler: (() => void) | null = null;

    /**
     * 构造函数 - 初始化CSS2D标签脚本
     *
     * @param options - 可选的配置参数
     */
    constructor(options?: CSS2DLabelScriptConfig) {
        super();
        // 合并默认配置和用户配置
        this.config = {
            container: options?.container || document.body,
            autoResize: options?.autoResize !== false,
            zIndex: options?.zIndex || 1000,
            enabled: options?.enabled !== false,
            defaultLabelStyle: options?.defaultLabelStyle || {}
        };
    }

    // ===========================================
    // IScript 生命周期方法
    // ===========================================

    /**
     * 脚本唤醒 - IScript 生命周期的第一个阶段
     * 在脚本被添加到引擎时调用
     */
    public override awake(): void {
        super.awake?.();
        console.log('[CSS2DLabelScript] CSS2D标签脚本唤醒');
    }

    /**
     * 脚本启用 - 在脚本被激活时调用
     * 用于恢复脚本的正常工作状态
     */
    public override onEnable(): void {
        super.onEnable?.();
        console.log('[CSS2DLabelScript] CSS2D标签脚本启用');
        if (this.css2dRenderer) {
            this.setVisible(true);
        }
    }

    /**
     * 脚本初始化 - 核心初始化逻辑
     *
     * 主要任务：
     * 1. 获取场景、相机和渲染器的引用
     * 2. 创建和配置CSS2DRenderer
     * 3. 设置事件监听器
     * 4. 准备标签系统的运行环境
     *
     * @returns Promise<void> - 异步初始化完成的Promise
     */
    public override async start(): Promise<void> {
        super.start?.();
        console.log('[CSS2DLabelScript] 开始初始化CSS2D标签脚本');

        // 创建CSS2DRenderer
        this.createRenderer();

        // 设置事件监听器
        this.setupEventListeners();

        console.log('[CSS2DLabelScript] CSS2D标签脚本初始化完成');
    }

    /**
     * 每帧更新 - 在每次渲染循环中调用
     *
     * 当前实现为空，因为CSS2DRenderer的渲染在onPostRender中处理
     *
     * @param deltaTime - 上一帧到当前帧的时间间隔（秒）
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
        // CSS2D标签的更新逻辑在onPostRender中处理
        // 这里可以添加标签动画或其他需要每帧更新的逻辑
    }

    /**
     * 渲染后调用 - 在主渲染完成后执行CSS2D渲染
     *
     * 这是CSS2D标签渲染的关键时机，确保标签正确叠加在3D场景之上
     */
    public override onPostRender(): void {
        super.onPostRender?.();
        if (this.config.enabled && this.css2dRenderer) {
            // 渲染CSS2D标签层
            this.css2dRenderer.render(this.scene, this.camera);
        }
    }

    public override onResize(): void {
        super.onResize();
    }

    /**
     * 脚本禁用 - 在脚本被停用时调用
     */
    public override onDisable(): void {
        super.onDisable?.();
        console.log('[CSS2DLabelScript] CSS2D标签脚本禁用');
        this.setVisible(false);
    }

    /**
     * 脚本销毁 - 清理所有资源和事件监听器
     */
    public override destroy(): void {
        super.destroy?.();
        console.log('[CSS2DLabelScript] CSS2D标签脚本销毁');

        // 清除所有标签
        this.clearLabels();

        // 移除事件监听器
        this.removeEventListeners();

        // 销毁CSS2DRenderer
        this.destroyRenderer();
    }

    // ===========================================
    // 核心功能方法
    // ===========================================

    /**
     * 创建CSS2DRenderer
     *
     * 初始化CSS2DRenderer并设置其样式和位置，确保正确叠加在主渲染器之上
     */
    private createRenderer(): void {
        this.css2dRenderer = new CSS2DRenderer();

        // 获取主渲染器的尺寸
        const size = new THREE.Vector2();
        this.webGLRenderer.getSize(size);

        // 设置CSS2DRenderer大小
        this.css2dRenderer.setSize(size.x, size.y);

        // 配置CSS2DRenderer的DOM样式
        const domElement = this.css2dRenderer.domElement;
        domElement.style.position = 'absolute';
        domElement.style.top = '0';
        domElement.style.left = '0';
        domElement.style.pointerEvents = 'none';
        domElement.style.zIndex = this.config.zIndex.toString();
        domElement.style.width = '100%';
        domElement.style.height = '100%';

        // 添加到指定容器
        this.container = this.config.container;
        this.container.appendChild(domElement);

        console.log('[CSS2DLabelScript] CSS2DRenderer创建完成并添加到DOM');
    }

    /**
     * 销毁CSS2DRenderer
     * 清理渲染器及其DOM元素
     */
    private destroyRenderer(): void {
        if (this.css2dRenderer && this.container) {
            this.container.removeChild(this.css2dRenderer.domElement);
            this.css2dRenderer = null;
        }
    }

    /**
     * 设置事件监听器
     * 主要处理窗口大小调整事件
     */
    private setupEventListeners(): void {
        if (this.config.autoResize) {
            this.boundResizeHandler = this.handleResize.bind(this);
            if (this.boundResizeHandler) {
                window.addEventListener('resize', this.boundResizeHandler);
            }
        }
    }

    /**
     * 移除事件监听器
     */
    private removeEventListeners(): void {
        if (this.boundResizeHandler) {
            window.removeEventListener('resize', this.boundResizeHandler);
            this.boundResizeHandler = null;
        }
    }

    /**
     * 处理窗口大小调整事件
     * 同步更新CSS2DRenderer的尺寸
     */
    private handleResize(): void {
        if (!this.css2dRenderer) return;

        const size = new THREE.Vector2();
        this.webGLRenderer.getSize(size);

        this.css2dRenderer.setSize(size.x, size.y);
    }

    /**
     * 根据距离相机的远近对标签进行排序
     *
     * @param ascending - 是否按距离升序排列（近到远）
     * @returns 排序后的标签数组
     */
    sortLabelsByDistance(ascending: boolean = true): CSS2DLabel[] {
        const cameraPosition = this.camera.position;
        const sortedLabels = this.getAllLabels().sort((a, b) => {
            const distanceA = a.targetObject.position.distanceTo(cameraPosition);
            const distanceB = b.targetObject.position.distanceTo(cameraPosition);
            return ascending ? distanceA - distanceB : distanceB - distanceA;
        });

        return sortedLabels;
    }

    // ===========================================
    // 公共API方法 - 标签管理
    // ===========================================

    addLabel(id: string, targetObject: THREE.Object3D, config: Label2DConfig): CSS2DLabel {
        if (this.labels.has(id)) {
            console.warn(`[CSS2DLabelScript] 标签 '${id}' 已存在，返回现有标签`);
            return this.labels.get(id)!;
        }

        // 合并默认样式
        const finalConfig = {
            ...config,
            style: { ...this.config.defaultLabelStyle, ...config.style }
        };

        const label = new CSS2DLabel(id, targetObject, finalConfig);
        this.labels.set(id, label);

        console.log(`[CSS2DLabelScript] 添加标签: ${id}`);
        return label;
    }

    /**
     * 移除2D标签
     *
     * @param id - 要移除的标签ID
     * @returns 是否成功移除
     */
    removeLabel(id: string): boolean {
        const label = this.labels.get(id);
        if (!label) {
            console.warn(`[CSS2DLabelScript] 标签 '${id}' 不存在`);
            return false;
        }

        label.destroy();
        this.labels.delete(id);

        console.log(`[CSS2DLabelScript] 移除标签: ${id}`);
        return true;
    }

    /**
     * 获取指定标签
     *
     * @param id - 标签ID
     * @returns 对应的CSS2DLabel实例，如果不存在则返回undefined
     */
    getLabel(id: string): CSS2DLabel | undefined {
        return this.labels.get(id);
    }

    /**
     * 获取所有标签
     *
     * @returns 所有标签的数组
     */
    getAllLabels(): CSS2DLabel[] {
        return Array.from(this.labels.values());
    }

    /**
     * 获取标签数量
     *
     * @returns 当前管理的标签总数
     */
    getLabelCount(): number {
        return this.labels.size;
    }

    /**
     * 检查标签是否存在
     *
     * @param id - 标签ID
     * @returns 标签是否存在
     */
    hasLabel(id: string): boolean {
        return this.labels.has(id);
    }

    /**
     * 清除所有标签
     * 销毁所有标签实例并清空管理容器
     */
    clearLabels(): void {
        for (const label of this.labels.values()) {
            label.destroy();
        }
        this.labels.clear();
        console.log('[CSS2DLabelScript] 所有标签已清除');
    }

    /**
     * 显示/隐藏所有标签
     *
     * @param visible - 是否可见
     */
    setVisible(visible: boolean): void {
        if (this.css2dRenderer) {
            this.css2dRenderer.domElement.style.display = visible ? 'block' : 'none';
        }
        console.log(`[CSS2DLabelScript] 标签系统${visible ? '显示' : '隐藏'}`);
    }

    /**
     * 切换标签系统可见性
     *
     * @returns 切换后的可见状态
     */
    toggleVisible(): boolean {
        const isVisible = this.css2dRenderer?.domElement.style.display !== 'none';
        this.setVisible(!isVisible);
        return !isVisible;
    }

    /**
     * 启用/禁用标签系统
     *
     * @param enabled - 是否启用
     */
    setEnabled(enabled: boolean): void {
        this.config.enabled = enabled;
        console.log(`[CSS2DLabelScript] 标签系统${enabled ? '启用' : '禁用'}`);
    }

    /**
     * 批量更新标签样式
     *
     * @param style - 要应用到所有标签的样式
     */
    updateAllLabelsStyle(style: Partial<CSSStyleDeclaration>): void {
        for (const label of this.labels.values()) {
            label.updateStyle(style);
        }
        console.log('[CSS2DLabelScript] 已更新所有标签样式');
    }

    /**
     * 获取当前配置
     *
     * @returns 配置对象的副本
     */
    getConfig(): CSS2DLabelScriptConfig {
        return { ...this.config };
    }

    /**
     * 更新脚本配置
     *
     * @param newConfig - 新的配置参数
     */
    updateConfig(newConfig: Partial<CSS2DLabelScriptConfig>): void {
        Object.assign(this.config, newConfig);
        console.log('[CSS2DLabelScript] 配置已更新');
    }
}
