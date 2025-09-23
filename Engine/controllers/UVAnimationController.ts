import { ScriptBase } from "../core/ScriptBase";
import { THREE } from "../core/global";
import { AnimationMaterial } from "../materials/AnimationMaterial";

/**
 * UV动画配置接口
 */
export interface UVAnimationConfig {
    /** 动画目标对象名称 */
    targetName: string;
    /** UV滚动速度 X轴 */
    scrollSpeedX?: number;
    /** UV滚动速度 Y轴 */
    scrollSpeedY?: number;
    /** UV缩放速度 X轴 */
    scaleSpeedX?: number;
    /** UV缩放速度 Y轴 */
    scaleSpeedY?: number;
    /** UV旋转速度 */
    rotationSpeed?: number;
    /** 是否启用 */
    enabled?: boolean;
}

/**
 * UV动画控制器
 * 用于控制使用AnimationMaterial的对象的UV动画
 */
export class UVAnimationController extends ScriptBase {
    private animations: Map<string, {
        mesh: THREE.Mesh;
        material: AnimationMaterial;
        config: Required<UVAnimationConfig>;
        offset: THREE.Vector2;
        scale: THREE.Vector2;
        rotation: number;
    }> = new Map();

    private defaultConfig: Required<UVAnimationConfig> = {
        targetName: '',
        scrollSpeedX: 0,
        scrollSpeedY: 0,
        scaleSpeedX: 0,
        scaleSpeedY: 0,
        rotationSpeed: 0,
        enabled: true
    };

    constructor(configs?: UVAnimationConfig | UVAnimationConfig[]) {
        super();
        this.name = "UVAnimationController";

        if (configs) {
            if (Array.isArray(configs)) {
                configs.forEach(config => this.addAnimation(config));
            } else {
                this.addAnimation(configs);
            }
        }
    }

    /**
     * 添加UV动画
     * @param config 动画配置
     */
    public addAnimation(config: UVAnimationConfig): void {
        const fullConfig = { ...this.defaultConfig, ...config };
        
        // 检查是否已存在同名动画
        if (this.animations.has(fullConfig.targetName)) {
            console.warn(`[UVAnimationController] Animation for target "${fullConfig.targetName}" already exists`);
            return;
        }

        this.animations.set(fullConfig.targetName, {
            mesh: null as any, // 将在start中初始化
            material: null as any, // 将在start中初始化
            config: fullConfig,
            offset: new THREE.Vector2(0, 0),
            scale: new THREE.Vector2(1, 1),
            rotation: 0
        });
    }

    /**
     * 移除UV动画
     * @param targetName 目标对象名称
     */
    public removeAnimation(targetName: string): void {
        const animation = this.animations.get(targetName);
        if (animation) {
            this.animations.delete(targetName);
        }
    }

    /**
     * 更新动画配置
     * @param targetName 目标对象名称
     * @param config 新的配置
     */
    public updateAnimation(targetName: string, config: Partial<UVAnimationConfig>): void {
        const animation = this.animations.get(targetName);
        if (animation) {
            Object.assign(animation.config, config);
        }
    }

    /**
     * 启用动画
     * @param targetName 目标对象名称
     */
    public enableAnimation(targetName: string): void {
        const animation = this.animations.get(targetName);
        if (animation) {
            animation.config.enabled = true;
        }
    }

    /**
     * 禁用动画
     * @param targetName 目标对象名称
     */
    public disableAnimation(targetName: string): void {
        const animation = this.animations.get(targetName);
        if (animation) {
            animation.config.enabled = false;
        }
    }

    /**
     * 获取动画配置
     * @param targetName 目标对象名称
     */
    public getAnimationConfig(targetName: string): UVAnimationConfig | undefined {
        const animation = this.animations.get(targetName);
        return animation ? animation.config : undefined;
    }

    /**
     * 初始化脚本
     */
    public override start(): void {
        super.start?.();

        // 查找并初始化所有动画目标
        this.animations.forEach((animation, targetName) => {
            // 查找场景中的对象
            const object = this.scene.getObjectByName(targetName);
            if (object && object instanceof THREE.Mesh) {
                animation.mesh = object;
                
                // 检查材质是否为AnimationMaterial
                if (object.material instanceof AnimationMaterial) {
                    animation.material = object.material;
                } else if (Array.isArray(object.material)) {
                    // 如果是材质数组，查找第一个AnimationMaterial
                    const animMaterial = object.material.find(mat => mat instanceof AnimationMaterial);
                    if (animMaterial) {
                        animation.material = animMaterial as AnimationMaterial;
                    }
                }
                
                if (animation.material) {
                    console.log(`[UVAnimationController] Found target mesh with AnimationMaterial: ${targetName}`);
                } else {
                    console.warn(`[UVAnimationController] Target mesh does not use AnimationMaterial: ${targetName}`);
                }
            } else {
                console.warn(`[UVAnimationController] Target mesh not found: ${targetName}`);
            }
        });
    }

    /**
     * 更新动画
     * @param deltaTime 帧时间
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);

        this.animations.forEach(animation => {
            // 检查动画是否启用且material存在
            if (!animation.config.enabled || !animation.material) return;

            // 更新偏移
            if (animation.config.scrollSpeedX !== 0 || animation.config.scrollSpeedY !== 0) {
                animation.offset.x += animation.config.scrollSpeedX! * deltaTime;
                animation.offset.y += animation.config.scrollSpeedY! * deltaTime;
                animation.material.scrollUV(
                    animation.config.scrollSpeedX! * deltaTime,
                    animation.config.scrollSpeedY! * deltaTime
                );
            }

            // 更新缩放
            if (animation.config.scaleSpeedX !== 0 || animation.config.scaleSpeedY !== 0) {
                animation.scale.x += animation.config.scaleSpeedX! * deltaTime;
                animation.scale.y += animation.config.scaleSpeedY! * deltaTime;
                animation.material.scaleUV(
                    animation.config.scaleSpeedX! * deltaTime,
                    animation.config.scaleSpeedY! * deltaTime
                );
            }

            // 更新旋转
            if (animation.config.rotationSpeed !== 0) {
                animation.rotation += animation.config.rotationSpeed! * deltaTime;
                // 注意：Three.js材质不直接支持旋转，需要通过自定义着色器实现
            }
        });
    }

    /**
     * 销毁脚本
     */
    public override destroy(): void {
        super.destroy?.();
        this.animations.clear();
    }
}