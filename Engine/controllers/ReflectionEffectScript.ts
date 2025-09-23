import { ScriptBase } from "../core/ScriptBase";
import { THREE, SSRPass, ReflectorForSSRPass } from '../core/global';

/**
 * 反射效果脚本
 * 实现基于屏幕空间反射(SSR)的反射效果
 */
export class ReflectionEffectScript extends ScriptBase {
    // SSR效果参数
    private resolutionScale: number = 0.5; // 降低分辨率以提高性能
    private thickness: number = 0.018;
    private infiniteThick: boolean = false;
    private fresnel: boolean = true;
    private distanceAttenuation: boolean = true;
    private maxDistance: number = 0.1;
    private opacity: number = 1.0;
    private bouncing: boolean = false; // 关闭反弹以提高性能
    private output: number = SSRPass.OUTPUT.Default;

    // 通道和反射器
    private pass: any = null;
    private reflector: any = null;
    private groundReflector: boolean = true;

    // 选择的对象列表
    private selects: THREE.Mesh[] = [];

    constructor(options?: {
        resolutionScale?: number;
        thickness?: number;
        infiniteThick?: boolean;
        fresnel?: boolean;
        distanceAttenuation?: boolean;
        maxDistance?: number;
        opacity?: number;
        bouncing?: boolean;
        output?: number;
        groundReflector?: boolean;
    }) {
        super();
        this.name = "ReflectionEffectScript";

        if (options) {
            if (options.resolutionScale !== undefined) this.resolutionScale = options.resolutionScale;
            if (options.thickness !== undefined) this.thickness = options.thickness;
            if (options.infiniteThick !== undefined) this.infiniteThick = options.infiniteThick;
            if (options.fresnel !== undefined) this.fresnel = options.fresnel;
            if (options.distanceAttenuation !== undefined) this.distanceAttenuation = options.distanceAttenuation;
            if (options.maxDistance !== undefined) this.maxDistance = options.maxDistance;
            if (options.opacity !== undefined) this.opacity = options.opacity;
            if (options.bouncing !== undefined) this.bouncing = options.bouncing;
            if (options.output !== undefined) this.output = options.output;
            if (options.groundReflector !== undefined) this.groundReflector = options.groundReflector;
        }
    }

    /**
     * 当脚本被添加到渲染器时调用
     */
    public override awake(): void {
        super.awake?.();

        // 创建反射通道
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

        // 清理反射器资源
        if (this.reflector && typeof this.reflector.dispose === 'function') {
            this.reflector.dispose();
            this.reflector = null;
        }
    }

    /**
     * 创建反射通道
     */
    private createPass(): void {
        try {
            if (this.renderer) {
                // 创建地面反射器
                if (this.groundReflector) {
                    const geometry = new THREE.PlaneGeometry(8, 8);
                    this.reflector = new ReflectorForSSRPass(geometry, {
                        clipBias: 0.0003,
                        textureWidth: Math.min(window.innerWidth, 1024), // 限制纹理大小
                        textureHeight: Math.min(window.innerHeight, 1024), // 限制纹理大小
                        color: 0x888888,
                        useDepthTexture: true,
                    });
                    this.reflector.material.depthWrite = false;
                    this.reflector.rotation.x = -Math.PI / 2;
                    this.reflector.visible = false;
                    this.reflector.name = 'Reflection';
                    // 将反射器添加到场景中
                    this.addObject(this.reflector);
                }

                // 创建SSR通道
                this.pass = new SSRPass({
                    renderer: this.renderer.renderer,
                    scene: this.renderer.scene,
                    camera: this.renderer.camera,
                    width: window.innerWidth,
                    height: window.innerHeight,
                    groundReflector: this.groundReflector ? this.reflector : null,
                    selects: this.groundReflector ? this.selects : null
                });

                // 设置参数
                this.pass.resolutionScale = this.resolutionScale;
                this.pass.thickness = this.thickness;
                this.pass.infiniteThick = this.infiniteThick;
                this.pass.fresnel = this.fresnel;
                this.pass.distanceAttenuation = this.distanceAttenuation;
                this.pass.maxDistance = this.maxDistance;
                this.pass.opacity = this.opacity;
                this.pass.bouncing = this.bouncing;
                this.pass.output = this.output;

                // 如果脚本已经启用，立即将通道添加到composer中
                if (this.renderer.isPostProcessingEnabled()) {
                    this.renderer.addPostProcessingPass(this.pass);
                }

                console.log('[ReflectionEffectScript] SSR pass created successfully');
            }
        } catch (error) {
            console.error('[ReflectionEffectScript] Failed to create SSR pass:', error);
        }
    }

    /**
     * 更新反射参数
     */
    public updateParameters(options: {
        resolutionScale?: number;
        thickness?: number;
        infiniteThick?: boolean;
        fresnel?: boolean;
        distanceAttenuation?: boolean;
        maxDistance?: number;
        opacity?: number;
        bouncing?: boolean;
        output?: number;
    }): void {
        let needsUpdate = false;

        if (options.resolutionScale !== undefined) {
            this.resolutionScale = options.resolutionScale;
            needsUpdate = true;
        }
        if (options.thickness !== undefined) {
            this.thickness = options.thickness;
            needsUpdate = true;
        }
        if (options.infiniteThick !== undefined) {
            this.infiniteThick = options.infiniteThick;
            needsUpdate = true;
        }
        if (options.fresnel !== undefined) {
            this.fresnel = options.fresnel;
            needsUpdate = true;
        }
        if (options.distanceAttenuation !== undefined) {
            this.distanceAttenuation = options.distanceAttenuation;
            needsUpdate = true;
        }
        if (options.maxDistance !== undefined) {
            this.maxDistance = options.maxDistance;
            needsUpdate = true;
        }
        if (options.opacity !== undefined) {
            this.opacity = options.opacity;
            needsUpdate = true;
        }
        if (options.bouncing !== undefined) {
            this.bouncing = options.bouncing;
            needsUpdate = true;
        }
        if (options.output !== undefined) {
            this.output = options.output;
            needsUpdate = true;
        }

        // 只有在参数改变时才更新通道参数
        if (needsUpdate && this.pass) {
            if (options.resolutionScale !== undefined) this.pass.resolutionScale = options.resolutionScale;
            if (options.thickness !== undefined) this.pass.thickness = options.thickness;
            if (options.infiniteThick !== undefined) this.pass.infiniteThick = options.infiniteThick;
            if (options.fresnel !== undefined) this.pass.fresnel = options.fresnel;
            if (options.distanceAttenuation !== undefined) this.pass.distanceAttenuation = options.distanceAttenuation;
            if (options.maxDistance !== undefined) this.pass.maxDistance = options.maxDistance;
            if (options.opacity !== undefined) this.pass.opacity = options.opacity;
            if (options.bouncing !== undefined) this.pass.bouncing = options.bouncing;
            if (options.output !== undefined) this.pass.output = options.output;
        }

        // 更新反射器参数
        if (this.reflector) {
            if (options.fresnel !== undefined) this.reflector.fresnel = options.fresnel;
            if (options.distanceAttenuation !== undefined) this.reflector.distanceAttenuation = options.distanceAttenuation;
            if (options.maxDistance !== undefined) this.reflector.maxDistance = options.maxDistance;
            if (options.opacity !== undefined) this.reflector.opacity = options.opacity;
        }
    }

    /**
     * 添加反射对象到选择列表
     * @param object 要添加到反射计算中的对象
     */
    public addSelectObject(object: THREE.Mesh): void {
        this.selects.push(object);
        if (this.pass) {
            this.pass.selects = this.selects;
        }
    }

    /**
     * 从选择列表中移除反射对象
     * @param object 要从反射计算中移除的对象
     */
    public removeSelectObject(object: THREE.Mesh): void {
        const index = this.selects.indexOf(object);
        if (index !== -1) {
            this.selects.splice(index, 1);
            if (this.pass) {
                this.pass.selects = this.selects;
            }
        }
    }

    /**
     * 获取反射器实例
     */
    public getReflector(): any {
        return this.reflector;
    }

    /**
     * 获取通道实例
     */
    public getPass(): any {
        return this.pass;
    }
}
