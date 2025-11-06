import { THREE,TWEEN,TweenGroup} from "../core/global.ts";
import { ScriptBase } from "../core/ScriptBase";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * OrbitControls配置接口
 * 定义轨道控制器的所有可配置参数
 */
export interface OrbitControlsConfig {
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
    /** 是否启用旋转 */
    enableRotate?: boolean;
    /** 旋转速度 */
    rotateSpeed?: number;
    /** 是否自动旋转 */
    autoRotate?: boolean;
    /** 自动旋转速度 */
    autoRotateSpeed?: number;
    /** 最小距离 */
    minDistance?: number;
    /** 最大距离 */
    maxDistance?: number;
    /** 最小极角 */
    minPolarAngle?: number;
    /** 最大极角 */
    maxPolarAngle?: number;
    /** 最小方位角 */
    minAzimuthAngle?: number;
    /** 最大方位角 */
    maxAzimuthAngle?: number;
    /** 目标位置 */
    target?: THREE.Vector3;
}

/**
 * 聚焦选项扩展接口
 */
export interface FocusOptions {
    /** 聚焦动画持续时间（毫秒） */
    duration?: number;
    /** 相机距离目标的距离 */
    distance?: number;
    /** 相机的方向（相对于目标的偏移） */
    direction?: THREE.Vector3;
    /** 是否使用平滑动画 */
    smooth?: boolean;
    /** 动画缓动函数类型 */
    easing?: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
    /** 完成回调 */
    onComplete?: () => void;
    /** 聚焦模式 */
    mode?: 'center' | 'front' | 'back' | 'top' | 'bottom' | 'left' | 'right';
    /** 偏移量 */
    offset?: THREE.Vector3;
}

/**
 * 预设配置类型
 */
export type PresetName = 'smooth' | 'responsive' | 'presentation' | 'cinema' | 'gaming';


export class OrbitControlsScript extends ScriptBase {
    name = 'OrbitControlsScript';
    /** OrbitControls配置参数 */
    private config: Required<OrbitControlsConfig>;

    /** Three.js OrbitControls实例 */
    private orbitControls: OrbitControls | null = null;

    /** 相机引用 */
    private cameraRef: THREE.Camera | null = null;

    /** 渲染器引用 */
    private rendererRef: THREE.WebGLRenderer | null = null;

    /** 是否启用状态 */
    private _enabled = true;

    /** 动画相关 */
    private isAnimating = false;

    private tween:  TWEEN.Tween | null = null;

    private tweenBack:  TWEEN.Tween | null = null;

    private lodPosition: THREE.Vector3 | null = null;

    /** 预设配置 */
    private presets: Record<PresetName, Partial<OrbitControlsConfig>> = {
        smooth: {
            enableDamping: true,
            dampingFactor: 0.12,
            rotateSpeed: 0.3,
            panSpeed: 1.5,
            zoomSpeed: 0.8
        },
        responsive: {
            enableDamping: true,
            dampingFactor: 0.06,
            rotateSpeed: 0.5,
            panSpeed: 2.5,
            zoomSpeed: 1.2
        },
        presentation: {
            autoRotate: true,
            autoRotateSpeed: 1.0,
            enableDamping: true,
            dampingFactor: 0.08,
            rotateSpeed: 0.4,
            panSpeed: 1.8
        },
        cinema: {
            enableDamping: true,
            dampingFactor: 0.15,
            rotateSpeed: 0.2,
            autoRotateSpeed: 0.5,
            minPolarAngle: Math.PI / 6,
            maxPolarAngle: Math.PI * 5 / 6,
            panSpeed: 1.2
        },
        gaming: {
            enableDamping: true,
            dampingFactor: 0.04,
            rotateSpeed: 0.8,
            panSpeed: 3.5,
            zoomSpeed: 1.5,
            autoRotateSpeed: 2.0
        }
    };

    /**
     * 构造函数 - 初始化OrbitControls脚本
     *
     * @param options - 可选的配置参数
     */
    constructor(options?: OrbitControlsConfig) {
        super();
        // 合并默认配置和用户配置
        this.config = {
            enableDamping: true,
            dampingFactor: 0.08,
            enableZoom: true,
            zoomSpeed: 1.0,
            enablePan: true,
            panSpeed: 2.0,
            enableRotate: true,
            rotateSpeed: 0.5,
            autoRotate: false,
            autoRotateSpeed: 2.0,
            minDistance: 1,
            maxDistance: 100,
            minPolarAngle: 0,
            maxPolarAngle: Math.PI,
            minAzimuthAngle: -Infinity,
            maxAzimuthAngle: Infinity,
            target: new THREE.Vector3(0, 0, 0),
            ...options
        };
    }

    /**
     * 脚本启用
     */
    public override onEnable(): void {
        super.onEnable?.();
        if (this.orbitControls) {
            this.orbitControls.enabled = true;
        }
    }

    /**
     * 脚本初始化 - 核心初始化逻辑
     *
     * 主要任务：
     * 1. 获取场景、相机和渲染器的引用
     * 2. 创建和配置OrbitControls
     * 3. 设置事件监听器
     *
     * @returns Promise<void> - 异步初始化完成的Promise
     */
    public override async start(): Promise<void> {
        super.start?.();
        // 获取相机和渲染器
        try {
            this.cameraRef = this.camera;  // 通过getter获取相机
            this.rendererRef = this.webGLRenderer;  // 通过getter获取渲染器
            // 只有当lodPosition还没有被设置时，才将其初始化为相机的当前位置
            if (!this.lodPosition && this.cameraRef) {
                this.lodPosition = this.cameraRef.position.clone();
            }
        } catch (error) {
            console.warn('[OrbitControlsScript] 无法直接获取相机或渲染器:', error);
        }

        if (!this.cameraRef || !this.rendererRef) {
            console.warn('[OrbitControlsScript] 无法获取相机或渲染器，将在后续自动检测');
        } else {
            // 创建OrbitControls
            this.createOrbitControls();
        }
    }

    /**
     * 每帧更新 - 更新OrbitControls
     *
     * @param deltaTime - 上一帧到当前帧的时间间隔（秒）
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
        // 如果相机或渲染器还未获取，尝试重新获取
        if (!this.cameraRef || !this.rendererRef) {
            this.tryAutoSetup();
        }

        // 更新OrbitControls
        if (this.orbitControls && this._enabled) {
            this.orbitControls.update();
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
        if (this.orbitControls) {
            this.orbitControls.enabled = false;
        }
    }

    /**
     * 脚本销毁 - 清理所有资源
     */
    public override destroy(): void {
        super.destroy?.();
        // 停止所有动画
        this.stopAnimation();

        // 销毁OrbitControls
        if (this.orbitControls) {
            this.orbitControls.dispose();
            this.orbitControls = null;
        }
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

            // 如果都获取到了，创建OrbitControls
            if (this.cameraRef && this.rendererRef && !this.orbitControls) {
                this.createOrbitControls();
            }
        } catch (error) {
            // 静默处理，避免在每次更新时都打印错误
            console.warn('[OrbitControlsScript] 自动设置相机和渲染器时出错:', error);
        }
    }

    /**
     * 创建OrbitControls
     */
    private createOrbitControls(): void {
        if (!this.cameraRef || !this.rendererRef) {
            console.warn('[OrbitControlsScript] 相机或渲染器不可用');
            return;
        }

        try {
            // 销毁旧的控制器
            if (this.orbitControls) {
                this.orbitControls.dispose();
            }

            // 创建新的OrbitControls
            this.orbitControls = new OrbitControls(this.cameraRef, this.rendererRef.domElement);

            // 应用配置
            this.applyConfig();
        } catch (error) {
            console.error('[OrbitControlsScript] 创建OrbitControls失败:', error);
        }
    }

    /**
     * 应用配置到OrbitControls
     */
    private applyConfig(): void {
        if (!this.orbitControls) return;

        const controls = this.orbitControls;
        const config = this.config;

        // 基本设置
        controls.enableDamping = config.enableDamping;
        controls.dampingFactor = config.dampingFactor;
        controls.enableZoom = config.enableZoom;
        controls.zoomSpeed = config.zoomSpeed;
        controls.enablePan = config.enablePan;
        controls.panSpeed = config.panSpeed;
        controls.enableRotate = config.enableRotate;
        controls.rotateSpeed = config.rotateSpeed;
        controls.autoRotate = config.autoRotate;
        controls.autoRotateSpeed = config.autoRotateSpeed;

        // 距离限制
        controls.minDistance = config.minDistance;
        controls.maxDistance = config.maxDistance;

        // 角度限制
        controls.minPolarAngle = config.minPolarAngle;
        controls.maxPolarAngle = config.maxPolarAngle;
        controls.minAzimuthAngle = config.minAzimuthAngle;
        controls.maxAzimuthAngle = config.maxAzimuthAngle;

        // 目标位置
        controls.target.copy(config.target);
        controls.update();
    }

    /**
     * 停止当前动画
     */
    stopAnimation(): void {
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
        if (this.tweenBack) {
            this.tweenBack.stop();
            this.tweenBack = null;
        }
        this.isAnimating = false;
    }

    /**
     * 动画到指定位置和目标
     */
    private animateToPosition(targetPosition: THREE.Vector3,targetCenter: THREE.Vector3,options: Required<FocusOptions>): void {
        if (!this.cameraRef || !this.orbitControls) return;
        this.stopAnimation();
        this.isAnimating = true;
        const startPosition = this.cameraRef.position.clone();
        const startTarget = this.orbitControls.target.clone();
        this.tween = new TWEEN.Tween({
          x: startPosition.x,
          y: startPosition.y,
          z: startPosition.z,
          targetX: startTarget.x,
          targetY: startTarget.y,
          targetZ: startTarget.z
        },TweenGroup)
          .to({
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            targetX: targetCenter.x,
            targetY: targetCenter.y,
            targetZ: targetCenter.z
          }, options.duration)
          .easing(this.getTweenEasing(options.easing))
          .onUpdate((object) => {
            this.cameraRef!.position.set(object.x, object.y, object.z);
            this.orbitControls!.target.set(object.targetX, object.targetY, object.targetZ);
            this.orbitControls!.update();
          })
          .onComplete(() => {
            this.isAnimating = false;
            this.config.target.copy(targetCenter);
            options.onComplete();
          });

        this.tween.start();
    }

    private getTweenEasing(easing: FocusOptions['easing']): (amount: number) => number {
        switch (easing) {
          case 'linear':
            return TWEEN.Easing.Linear.None;
          case 'easeIn':
            return TWEEN.Easing.Quadratic.In;
          case 'easeOut':
            return TWEEN.Easing.Quadratic.Out;
          case 'easeInOut':
            return TWEEN.Easing.Quadratic.InOut;
          default:
            return TWEEN.Easing.Quadratic.InOut;
        }
    }

    private calculateBoundingBox(object: THREE.Object3D): THREE.Box3 {
        const box = new THREE.Box3();

        // 遍历所有子对象来计算包围盒
        object.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                if (mesh.geometry) {
                    // 更新矩阵
                    mesh.updateWorldMatrix(true, false);
                    const geometry = mesh.geometry;
                    if (geometry.boundingBox) {
                        box.union(geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld));
                    } else {
                        const boundingBox = new THREE.Box3().setFromObject(mesh);
                        box.union(boundingBox);
                    }
                }
            }
        });

        // 如果没有找到网格对象，回退到原始对象
        if (box.isEmpty()) {
            box.setFromObject(object);
        }

        return box;
    }

    enable(): void {
        this._enabled = true;
        if (this.orbitControls) {
            this.orbitControls.enabled = true;
        }
    }

    disable(): void {
        this._enabled = false;
        if (this.orbitControls) {
            this.orbitControls.enabled = false;
        }
    }

    reset(): void {
        if (this.orbitControls) {
            this.orbitControls.reset();
        }
    }

    /**
     * 设置缩放限制（参考示例代码）
     * @param minZoom 最小缩放值
     * @param maxZoom 最大缩放值
     */
    setZoomLimits(minZoom: number = 0.5, maxZoom: number = 2): void {
        if (this.orbitControls) {
            this.orbitControls.minZoom = minZoom;
            this.orbitControls.maxZoom = maxZoom;
        }
    }

    /**
     * 更新控制器配置
     * @param newConfig 新的配置选项
     */
    updateConfig(newConfig: Partial<OrbitControlsConfig>): void {
        Object.assign(this.config, newConfig);
        this.applyConfig();
    }

    /**
     * 获取当前配置
     */
    getConfig(): OrbitControlsConfig {
        return { ...this.config };
    }

    /**
     * 应用预设配置
     * @param presetName 预设名称
     */
    applyPreset(presetName: PresetName): void {
        const preset = this.presets[presetName];
        if (preset) {
            this.updateConfig(preset);
        } else {
            console.warn(`[OrbitControlsScript] 未知的预设: ${presetName}`);
        }
    }

    /**
     * 获取所有可用预设
     */
    getPresets(): PresetName[] {
        return Object.keys(this.presets) as PresetName[];
    }

    backLodPosition(targetPosition?: THREE.Vector3, options?: FocusOptions): void {
        // 如果没有提供目标位置，则使用存储的lodPosition
        const positionToUse = targetPosition || this.lodPosition;

        if (positionToUse && this.cameraRef && this.orbitControls) {
            // 合并默认选项和用户提供的选项
            const focusOptions: FocusOptions = {
                duration: 1000,
                distance: 10,
                direction: new THREE.Vector3(1, 1, 1).normalize(),
                smooth: true,
                easing: 'easeInOut',
                onComplete: () => {},
                mode: 'center',
                offset: new THREE.Vector3(0, 0, 0),
                ...options
            };

            // 停止当前动画
            this.stopAnimation();
            this.isAnimating = true;

            // 获取当前位置和目标
            const startPosition = this.cameraRef.position.clone();
            const startTarget = this.orbitControls.target.clone();

            // 计算目标位置和目标点
            const targetPositionVec = positionToUse.clone();
            // 将目标点设置为原点(0, 0, 0)，与Canvas3D.tsx中设置的一致
            const targetCenter = new THREE.Vector3(0, 0, 0);

            this.tweenBack = new TWEEN.Tween({
              x: startPosition.x,
              y: startPosition.y,
              z: startPosition.z,
              targetX: startTarget.x,
              targetY: startTarget.y,
              targetZ: startTarget.z
            },TweenGroup)
              .to({
                x: targetPositionVec.x,
                y: targetPositionVec.y,
                z: targetPositionVec.z,
                targetX: targetCenter.x,
                targetY: targetCenter.y,
                targetZ: targetCenter.z
              }, focusOptions.duration)
              .easing(this.getTweenEasing(focusOptions.easing))
              .onUpdate((object) => {
                this.cameraRef!.position.set(object.x, object.y, object.z);
                this.orbitControls!.target.set(object.targetX, object.targetY, object.targetZ);
                this.orbitControls!.update();
              })
              .onComplete(() => {
                this.isAnimating = false;
                this.config.target.copy(targetCenter);
                focusOptions.onComplete?.();
              });

            this.tweenBack.start();
        } else {
            console.warn('[OrbitControlsScript] 无法退回指定位置，缺少必要参数');
        }
    }

    /**
     * 聚焦到指定对象
     *
     * @param object - 要聚焦的3D对象
     * @param options - 聚焦选项
     */
    focusOnObject(object: THREE.Object3D, options: FocusOptions = {}): void {
        if (!this.cameraRef || !this.orbitControls) {
            console.warn('[OrbitControlsScript] 相机或控制器不可用');
            return;
        }
        const defaultOptions: Required<FocusOptions> = {
            duration: 1000,
            distance: 10,
            direction: new THREE.Vector3(1, 1, 1).normalize(),
            smooth: true,
            easing: 'easeInOut',
            onComplete: () => {},
            mode: 'center',
            offset: new THREE.Vector3(0, 0, 0)
        };

        const finalOptions = { ...defaultOptions, ...options };

        // 计算对象的包围盒和中心点
        const boundingBox = this.calculateBoundingBox(object);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        // 根据模式计算相机位置
        let targetPosition: THREE.Vector3;
        const cameraOffset = finalOptions.offset || new THREE.Vector3(0, 0, 0);

        // 计算合适的距离，确保对象完整显示在视图中
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = (this.cameraRef as THREE.PerspectiveCamera).fov || 50;
        const autoDistance = maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2)) * 1.5;
        const targetDistance = finalOptions.distance === 10 ? autoDistance : finalOptions.distance;

        switch (finalOptions.mode) {
            case 'front':
                targetPosition = center.clone().add(new THREE.Vector3(0, 0, 1).multiplyScalar(targetDistance)).add(cameraOffset);
                break;
            case 'back':
                targetPosition = center.clone().add(new THREE.Vector3(0, 0, -1).multiplyScalar(targetDistance)).add(cameraOffset);
                break;
            case 'top':
                targetPosition = center.clone().add(new THREE.Vector3(0, 1, 0).multiplyScalar(targetDistance)).add(cameraOffset);
                break;
            case 'bottom':
                targetPosition = center.clone().add(new THREE.Vector3(0, -1, 0).multiplyScalar(targetDistance)).add(cameraOffset);
                break;
            case 'left':
                targetPosition = center.clone().add(new THREE.Vector3(-1, 0, 0).multiplyScalar(targetDistance)).add(cameraOffset);
                break;
            case 'right':
                targetPosition = center.clone().add(new THREE.Vector3(1, 0, 0).multiplyScalar(targetDistance)).add(cameraOffset);
                break;
            case 'center':
            default:
                targetPosition = center.clone().add(
                    finalOptions.direction.clone().multiplyScalar(targetDistance)
                ).add(cameraOffset);
                break;
        }
        if (!finalOptions.smooth) {
            this.cameraRef.position.copy(targetPosition);
            this.orbitControls.target.copy(center);
            this.orbitControls.update();
            finalOptions.onComplete();
            return;
        }
        this.animateToPosition(targetPosition, center, finalOptions);
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
    getTargetPosition(): THREE.Vector3 | null {
        return this.orbitControls ? this.orbitControls.target.clone() : null;
    }

    /**
     * 获取当前是否正在执行动画
     */
    getIsAnimating(): boolean {
        return this.isAnimating;
    }

    /**
     * 获取控制器是否启用
     */
    getEnabled(): boolean {
        return this._enabled && this.orbitControls !== null;
    }

    getControls(): OrbitControls | null {
        return this.orbitControls;
    }

    /**
     * 设置默认位置
     * @param position - 要设置为默认位置的向量
     */
    setDefaultPosition(position: THREE.Vector3): void {
        this.lodPosition = position.clone();
    }

    /**
     * 获取默认位置
     */
    getDefaultPosition(): THREE.Vector3 | null {
        return this.lodPosition ? this.lodPosition.clone() : null;
    }

    /**
     * 更新相机初始位置为当前相机位置
     */
    updateInitialPosition(): void {
        if (this.cameraRef) {
            this.lodPosition = this.cameraRef.position.clone();
        }
    }

    /**
     * 设置默认相机位置和目标点
     * @param position 相机位置
     * @param target 相机目标点
     */
    setDefaultCameraPosition(position: THREE.Vector3, target: THREE.Vector3): void {
        this.lodPosition = position.clone();
        this.config.target = target.clone();
        if (this.orbitControls) {
            this.orbitControls.target.copy(target);
            this.orbitControls.update();
        }
    }

    /**
     * 设置为CAD模式（正交视图，限制旋转，仅XY平面移动）
     */
    setCadMode(): void {
        // 更新配置以适应CAD模式
        this.updateConfig({
            // 限制极角，使用户无法将视角旋转到侧面或底部
            minPolarAngle: Math.PI / 2 - 0.1,
            maxPolarAngle: Math.PI / 2 + 0.1,
            // 启用阻尼以获得更平滑的体验
            enableDamping: true,
            dampingFactor: 0.05,
            // 调整旋转速度
            rotateSpeed: 0.3,
            // 调整缩放速度
            zoomSpeed: 0.8,
            // 允许平移
            enablePan: true,
            // 允许缩放
            enableZoom: true,
            // 禁用自动旋转
            autoRotate: false
        });
        
        console.log('[OrbitControlsScript] 已设置为CAD模式');
    }

    /**
     * 限制相机移动到XY平面
     * @param enable 是否启用XY平面限制
     */
    setXYPlaneConstraint(enable: boolean): void {
        if (!this.orbitControls) return;
        
        if (enable) {
            // 限制相机只能在XY平面上移动（Z坐标为0）
            // 通过限制目标点的Z坐标来实现
            const originalUpdate = this.orbitControls.update.bind(this.orbitControls);
            this.orbitControls.update = () => {
                // 调用原始更新方法
                const result = originalUpdate();
                
                // 限制相机位置在XY平面上
                if (this.cameraRef) {
                    this.cameraRef.position.y = 0;
                }
                
                // 限制目标点在XY平面上
                this.orbitControls!.target.y = 0;
                
                return result;
            };
        } else {
            // 恢复原始的更新方法
            // 注意：由于JavaScript的限制，我们无法完全恢复原始方法
            // 但在大多数情况下这不是问题
        }
    }

    /**
     * 切换到顶视图（现在是正面视图，看向XY平面）
     * @param target 目标点，默认为(0, 0, 0)
     */
    switchToTopView(target?: THREE.Vector3): void {
        if (!this.cameraRef || !this.orbitControls) {
            console.warn('[OrbitControlsScript] 相机或控制器不可用');
            return;
        }
        
        const targetPosition = target || new THREE.Vector3(0, 0, 0);
        
        // 设置相机位置到正面视角（看向XY平面）
        this.cameraRef.position.set(targetPosition.x, targetPosition.y, targetPosition.z + 10);
        this.orbitControls.target.copy(targetPosition);
        
        // 应用CAD模式配置
        this.setCadMode();
        
        // 启用XY平面约束
        this.setXYPlaneConstraint(true);
        
        // 设置缩放限制
        this.setZoomLimits(0.5, 2);
        
        // 更新控制器
        this.orbitControls.update();
        
        console.log('[OrbitControlsScript] 已切换到正面视图并启用XY平面约束');
    }
}
