import { THREE } from "../core/global.ts";
import { ScriptBase } from "../core/ScriptBase";
import { UnrealBloomPass } from '../core/global';

/**
 * Bloom效果脚本
 * 演示如何创建一个具体后处理效果脚本
 */
export class BloomEffectScript extends ScriptBase {
    // Bloom效果参数
    private strength: number = 0.5;
    private radius: number = 0.4;
    private threshold: number = 0.85;
    private pass: any = null;

    constructor(strength?: number, radius?: number, threshold?: number) {
        super();
        this.name = "BloomEffectScript";

        if (strength !== undefined) this.strength = strength;
        if (radius !== undefined) this.radius = radius;
        if (threshold !== undefined) this.threshold = threshold;
    }

    /**
     * 当脚本被添加到渲染器时调用
     */
    public override awake(): void {
        super.awake?.();

        // 创建Bloom通道
        this.createPass();
    }

    /**
     * 当脚本变为启用和激活状态时调用
     */
    public override onEnable(): void {
        super.onEnable?.();

        // 如果通道已创建，添加到Composer中
        if (this.pass && this.renderer) {
            const composer = this.renderer.getPostProcessingComposer();
            if (composer) {
                this.renderer.addPostProcessingPass(this.pass);
                console.log('[BloomEffectScript] Bloom pass enabled and added to composer');
            }
        }
    }

    /**
     * 当脚本变为禁用或非激活状态时调用
     */
    public override onDisable(): void {
        super.onDisable?.();

        // 从Composer中移除通道
        if (this.pass && this.renderer) {
            this.renderer.removePostProcessingPass(this.pass);
            console.log('[BloomEffectScript] Bloom pass disabled and removed from composer');
        }
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();

        // 从Composer中移除通道
        if (this.pass && this.renderer) {
            this.renderer.removePostProcessingPass(this.pass);
        }

        // 清理通道资源
        if (this.pass && typeof this.pass.dispose === 'function') {
            this.pass.dispose();
            this.pass = null;
        }

        console.log('[BloomEffectScript] Bloom pass destroyed');
    }

    /**
     * 创建Bloom通道
     */
    private createPass(): void {
        try {
            if (this.renderer) {
                // 创建Vector2对象而不是使用字面量对象
                const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
                console.log('[BloomEffectScript] Creating Bloom pass with params:', {
                    size: `${size.x}x${size.y}`,
                    strength: this.strength,
                    radius: this.radius,
                    threshold: this.threshold
                });

                this.pass = new UnrealBloomPass(
                    size,
                    this.strength,
                    this.radius,
                    this.threshold
                );

                // 如果脚本已经启用，立即将通道添加到composer中
                if (this.renderer.isPostProcessingEnabled()) {
                    this.renderer.addPostProcessingPass(this.pass);
                    console.log('[BloomEffectScript] Bloom pass created and added to composer');
                } else {
                    console.log('[BloomEffectScript] Bloom pass created but post-processing is not enabled');
                }
            } else {
                console.warn('[BloomEffectScript] Renderer not available when creating Bloom pass');
            }
        } catch (error) {
            console.error('[BloomEffectScript] Failed to create Bloom pass:', error);
        }
    }

    /**
     * 更新Bloom参数
     */
    public updateParameters(strength?: number, radius?: number, threshold?: number): void {
        if (strength !== undefined) this.strength = strength;
        if (radius !== undefined) this.radius = radius;
        if (threshold !== undefined) this.threshold = threshold;

        // 更新通道参数
        if (this.pass) {
            if (strength !== undefined) this.pass.strength = strength;
            if (radius !== undefined) this.pass.radius = radius;
            if (threshold !== undefined) this.pass.threshold = threshold;

            console.log('[BloomEffectScript] Bloom parameters updated:', {
                strength: strength !== undefined ? strength : this.strength,
                radius: radius !== undefined ? radius : this.radius,
                threshold: threshold !== undefined ? threshold : this.threshold
            });
        }
    }

    /**
     * 每一帧更新时调用
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);

        // 可以在这里添加基于时间的动画效果
        // 例如：动态调整Bloom强度
    }

    /**
     * 每一帧在 update 调用之后调用
     */
    public override lateUpdate(deltaTime: number): void {
        super.lateUpdate?.(deltaTime);
    }

    /**
     * 获取通道实例
     */
    public getPass(): any {
        return this.pass;
    }
}
