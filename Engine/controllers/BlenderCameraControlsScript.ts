import { ScriptBase } from '../core/ScriptBase';
import { THREE } from '../core/global';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Blender风格相机控制配置接口
 */
export interface BlenderCameraControlsConfig {
    /** 启用阻尼效果 */
    enableDamping?: boolean;
    /** 阻尼系数 */
    dampingFactor?: number;
    /** 旋转速度 */
    rotateSpeed?: number;
    /** 缩放速度 */
    zoomSpeed?: number;
    /** 平移速度 */
    panSpeed?: number;
    /** 最小极角(弧度)*/
    minPolarAngle?: number;
    /** 最大极角(弧度)*/
    maxPolarAngle?: number;
    /** 最小距离 */
    minDistance?: number;
    /** 最大距离 */
    maxDistance?: number;
    /** 启用旋转 */
    enableRotate?: boolean;
    /** 启用缩放 */
    enableZoom?: boolean;
    /** 启用平移 */
    enablePan?: boolean;
    /** 启用键盘快捷键 */
    enableKeys?: boolean;
    /** 目标位置 */
    target?: THREE.Vector3;
}

/**
 * Blender风格相机控制脚本
 * 基于OrbitControls封装，修改鼠标按键映射为Blender风格：
 * - 鼠标中键拖动：旋转视图
 * - Shift+鼠标中键：平移视图
 * - 鼠标滚轮：缩放视图
 * - 小键盘1/3/7：前/右/顶视图
 * - Ctrl+小键盘1/3/7：后/左/底视图
 */
export class BlenderCameraControlsScript extends ScriptBase {
    name = 'BlenderCameraControlsScript';
    
    /** 配置参数 */
    private config: Required<BlenderCameraControlsConfig>;
    
    /** OrbitControls实例 */
    private controls: OrbitControls | null = null;
    
    /** 相机引用 */
    private _camera: THREE.Camera | null = null;
    
    /** 渲染器引用 */
    private _renderer: THREE.WebGLRenderer | null = null;
    
    /** DOM元素 */
    private domElement: HTMLElement | null = null;
    
    /** 是否启用键盘快捷键 */
    private enableKeys: boolean;

    constructor(config: BlenderCameraControlsConfig = {}) {
        super();
        
        // 初始化配置
        this.config = {
            enableDamping: config.enableDamping ?? true,
            dampingFactor: config.dampingFactor ?? 0.05,
            rotateSpeed: config.rotateSpeed ?? 1.0,
            zoomSpeed: config.zoomSpeed ?? 1.0,
            panSpeed: config.panSpeed ?? 1.0,
            minPolarAngle: config.minPolarAngle ?? 0,
            maxPolarAngle: config.maxPolarAngle ?? Math.PI,
            minDistance: config.minDistance ?? 0,
            maxDistance: config.maxDistance ?? Infinity,
            enableRotate: config.enableRotate ?? true,
            enableZoom: config.enableZoom ?? true,
            enablePan: config.enablePan ?? true,
            enableKeys: config.enableKeys ?? true,
            target: config.target ?? new THREE.Vector3(0, 0, 0)
        };
        
        this.enableKeys = this.config.enableKeys;
    }

    public override async start(): Promise<void> {
        super.start?.();
        
        try {
            this._camera = this.camera;
            this._renderer = this.webGLRenderer;
        } catch (error) {
            console.warn('[BlenderCameraControlsScript] 无法直接获取相机或渲染器:', error);
        }

        if (!this._camera || !this._renderer) {
            console.warn('[BlenderCameraControlsScript] 无法获取相机或渲染器，将在后续自动检测');
        } else {
            this.createControls();
        }
    }

    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
        
        // 尝试自动设置
        if (!this._camera || !this._renderer) {
            this.tryAutoSetup();
        }

        // 更新控制器
        if (this.controls) {
            this.controls.update();
        }
    }

    public override destroy(): void {
        super.destroy?.();
        
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }
        
        if (this.domElement) {
            this.domElement.removeEventListener('pointerdown', this.onPointerDown);
        }
        
        if (this.enableKeys) {
            window.removeEventListener('keydown', this.onKeyDown);
        }

        console.log('[BlenderCameraControlsScript] 已销毁');
    }

    // ===========================================
    // 私有方法
    // ===========================================

    /**
     * 尝试自动设置相机和渲染器
     */
    private tryAutoSetup(): void {
        try {
            if (!this._camera) {
                this._camera = this.camera;
            }

            if (!this._renderer) {
                this._renderer = this.webGLRenderer;
            }

            if (this._camera && this._renderer && !this.controls) {
                this.createControls();
            }
        } catch (error) {
            // 静默处理
        }
    }

    /**
     * 创建OrbitControls并修改为Blender风格
     */
    private createControls(): void {
        if (!this._camera || !this._renderer) {
            console.warn('[BlenderCameraControlsScript] 相机或渲染器不可用');
            return;
        }

        try {
            // 销毁旧的控制器
            if (this.controls) {
                this.controls.dispose();
            }

            // 创建OrbitControls
            this.controls = new OrbitControls(this._camera, this._renderer.domElement);
            this.domElement = this._renderer.domElement;

            // 应用配置
            this.applyConfig();
            
            // 修改鼠标按键映射为Blender风格
            this.setupBlenderMouseControls();
            
            // 设置键盘快捷键
            if (this.enableKeys) {
                window.addEventListener('keydown', this.onKeyDown);
            }

            console.log('[BlenderCameraControlsScript] 已启动');
        } catch (error) {
            console.error('[BlenderCameraControlsScript] 创建失败:', error);
        }
    }

    /**
     * 应用配置到OrbitControls
     */
    private applyConfig(): void {
        if (!this.controls) return;

        this.controls.enableDamping = this.config.enableDamping;
        this.controls.dampingFactor = this.config.dampingFactor;
        this.controls.rotateSpeed = this.config.rotateSpeed;
        this.controls.zoomSpeed = this.config.zoomSpeed;
        this.controls.panSpeed = this.config.panSpeed;
        this.controls.minPolarAngle = this.config.minPolarAngle;
        this.controls.maxPolarAngle = this.config.maxPolarAngle;
        this.controls.minDistance = this.config.minDistance;
        this.controls.maxDistance = this.config.maxDistance;
        this.controls.enableRotate = this.config.enableRotate;
        this.controls.enableZoom = this.config.enableZoom;
        this.controls.enablePan = this.config.enablePan;
        this.controls.target.copy(this.config.target);
        this.controls.update();
    }

    /**
     * 设置Blender风格鼠标控制
     * 修改OrbitControls的鼠标按键映射
     */
    private setupBlenderMouseControls(): void {
        if (!this.controls) return;

        // 修改鼠标按键映射
        // Blender风格：中键旋转，Shift+中键平移
        this.controls.mouseButtons = {
            LEFT: undefined as any,      // 禁用左键
            MIDDLE: THREE.MOUSE.ROTATE,  // 中键旋转
            RIGHT: undefined as any       // 禁用右键
        };

        // 设置触摸板手势
        this.controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };

        // 监听Shift键实现Shift+中键平移
        if (this.domElement) {
            this.domElement.addEventListener('pointerdown', this.onPointerDown);
        }
    }

    private onPointerDown = (event: PointerEvent) => {
        if (!this.controls) return;

        // 处理Shift+中键 = 平移
        if (event.button === 1 && event.shiftKey) {
            // 临时修改中键为平移
            this.controls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
        } else if (event.button === 1) {
            // 恢复中键为旋转
            this.controls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
        }

        // 监听鼠标释放来恢复设置
        const onPointerUp = () => {
            if (this.controls) {
                this.controls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
            }
            this.domElement?.removeEventListener('pointerup', onPointerUp);
        };
        this.domElement?.addEventListener('pointerup', onPointerUp);
    };

    private onKeyDown = (event: KeyboardEvent) => {
        if (!this.enableKeys || !this._camera || !this.controls) return;

        const isCtrl = event.ctrlKey || event.metaKey;

        switch (event.code) {
            case 'Numpad1': // 前视图/后视图
                event.preventDefault();
                this.setViewAngle(isCtrl ? 'back' : 'front');
                break;
            case 'Numpad3': // 右视图/左视图
                event.preventDefault();
                this.setViewAngle(isCtrl ? 'left' : 'right');
                break;
            case 'Numpad7': // 顶视图/底视图
                event.preventDefault();
                this.setViewAngle(isCtrl ? 'bottom' : 'top');
                break;
            case 'NumpadPeriod': // 聚焦到目标
            case 'Period':
                event.preventDefault();
                this.focusOnTarget();
                break;
        }
    };

    /**
     * 视角切换
     */
    private setViewAngle(view: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'): void {
        if (!this._camera || !this.controls) return;

        const distance = this._camera.position.distanceTo(this.controls.target);
        const target = this.controls.target;
        
        switch (view) {
            case 'front': // 前视图 (Z轴正方向)
                this._camera.position.set(target.x, target.y, target.z + distance);
                break;
            case 'back': // 后视图 (Z轴负方向)
                this._camera.position.set(target.x, target.y, target.z - distance);
                break;
            case 'right': // 右视图 (X轴正方向)
                this._camera.position.set(target.x + distance, target.y, target.z);
                break;
            case 'left': // 左视图 (X轴负方向)
                this._camera.position.set(target.x - distance, target.y, target.z);
                break;
            case 'top': // 顶视图 (Y轴正方向)
                this._camera.position.set(target.x, target.y + distance, target.z);
                break;
            case 'bottom': // 底视图 (Y轴负方向)
                this._camera.position.set(target.x, target.y - distance, target.z);
                break;
        }

        this._camera.lookAt(target);
        this.controls.update();
    }

    /**
     * 聚焦到目标
     */
    private focusOnTarget(): void {
        if (!this.controls) return;
        console.log('[BlenderCameraControlsScript] 聚焦到目标:', this.controls.target);
    }

    // ===========================================
    // 公共API
    // ===========================================

    /**
     * 设置目标点
     */
    public setTarget(target: THREE.Vector3): void {
        this.config.target = target.clone();
        if (this.controls) {
            this.controls.target.copy(target);
            this.controls.update();
        }
    }

    /**
     * 获取目标点
     */
    public getTarget(): THREE.Vector3 {
        return this.controls ? this.controls.target.clone() : this.config.target.clone();
    }

    /**
     * 重置相机
     */
    public reset(): void {
        if (this.controls) {
            this.controls.reset();
        }
    }

    /**
     * 更新配置
     */
    public updateConfig(config: Partial<BlenderCameraControlsConfig>): void {
        Object.assign(this.config, config);
        this.applyConfig();
    }

    /**
     * 启用控制器
     */
    public enable(): void {
        if (this.controls) {
            this.controls.enabled = true;
        }
    }

    /**
     * 禁用控制器
     */
    public disable(): void {
        if (this.controls) {
            this.controls.enabled = false;
        }
    }

    /**
     * 获取OrbitControls实例
     */
    public getControls(): OrbitControls | null {
        return this.controls;
    }
}