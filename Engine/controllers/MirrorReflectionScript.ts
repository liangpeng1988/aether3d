import { ScriptBase } from "../core/ScriptBase";
import { Reflector, THREE, HorizontalBlurShader, VerticalBlurShader } from '../core/global';

/**
 * 镜面反射效果脚本 - 支持从清晰到模糊的渐变效果
 * 实现基于平面反射的镜面效果，支持中心清晰边缘模糊的渐变反射
 */
export class MirrorReflectionScript extends ScriptBase {
    // 镜面反射参数
    private clipBias: number = 0.003;
    private textureWidth: number = 1024; // 提高默认分辨率以获得更好效果
    private textureHeight: number = 1024;
    private color: number = 0x7f7f7f;
    private opacity: number = 1.0;
    private blurStrength: number = 0.0; // 默认不模糊
    private blurRadius: number = 5; // 模糊半径
    private gradientBlur: boolean = false; // 默认不启用渐变模糊
    private blurCenter: THREE.Vector2 = new THREE.Vector2(0.5, 0.5); // 模糊中心点(归一化坐标)

    // 反射器
    private reflector: Reflector | null = null;
    private geometry: THREE.BufferGeometry | null = null;
    private reflectorObject: Reflector | null = null; // 修复类型为Reflector

    // 模糊效果相关
    private blurRenderTarget1: THREE.WebGLRenderTarget | null = null;
    private blurRenderTarget2: THREE.WebGLRenderTarget | null = null;
    private blurPlane: THREE.Mesh | null = null;
    private blurMaterial1: THREE.ShaderMaterial | null = null;
    private blurMaterial2: THREE.ShaderMaterial | null = null;
    private needsBlurUpdate: boolean = false;

    constructor(options?: {
        clipBias?: number;
        textureWidth?: number;
        textureHeight?: number;
        color?: number;
        opacity?: number;
        blurStrength?: number;
        blurRadius?: number;
        gradientBlur?: boolean;
        blurCenter?: THREE.Vector2;
    }) {
        super();
        this.name = "MirrorReflectionScript";

        if (options) {
            // 修复参数赋值
            if (options.clipBias !== undefined) this.clipBias = options.clipBias;
            if (options.textureWidth !== undefined) this.textureWidth = options.textureWidth;
            if (options.textureHeight !== undefined) this.textureHeight = options.textureHeight;
            if (options.color !== undefined) this.color = options.color;
            if (options.opacity !== undefined) this.opacity = options.opacity;
            if (options.blurStrength !== undefined) this.blurStrength = options.blurStrength;
            if (options.blurRadius !== undefined) this.blurRadius = options.blurRadius;
            if (options.gradientBlur !== undefined) this.gradientBlur = options.gradientBlur;
            // 添加对options.blurCenter的null检查
            if (options.blurCenter !== undefined) this.blurCenter.copy(options.blurCenter);
        }
    }

    /**
     * 启动脚本时调用
     */
    public start(): void {
        // this.createReflector();
        // this.createBlurComponents();
    }

    public meshReflector(geometry:THREE.BufferGeometry): void {
        try {
            // 修复条件检查
            if (this.renderer) {
                this.geometry = geometry;
                // 添加对this.geometry的null检查
                if (this.geometry) {
                    this.reflector = new Reflector(this.geometry, {
                        clipBias: this.clipBias,
                        textureWidth: this.textureWidth,
                        textureHeight: this.textureHeight,
                        color: new THREE.Color(this.color)
                    });

                    // Reflector本身就是一个Mesh对象
                    this.reflectorObject = this.reflector;
                    this.reflectorObject.position.set(0, 0, 0);
                    // this.reflectorObject.rotation.x = -Math.PI / 2;
                    this.reflectorObject.visible = true;
                    this.reflectorObject.name = 'Reflection';

                    // 设置材质属性
                    // 添加对this.reflectorObject.material的null检查
                    if (this.reflectorObject && this.reflectorObject.material) {
                        const material = this.reflectorObject.material;
                        if (Array.isArray(material)) {
                            material.forEach(mat => {
                                if (mat instanceof THREE.MeshBasicMaterial || mat instanceof THREE.ShaderMaterial) {
                                    mat.transparent = true;
                                    mat.opacity = this.opacity;
                                }
                            });
                        } else {
                            if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.ShaderMaterial) {
                                material.transparent = true;
                                material.opacity = this.opacity;
                            }
                        }
                    }

                    // 添加到场景
                    // 添加对this.scene的null检查
                    if (this.scene) {
                        this.scene.add(this.reflectorObject);
                    }
                    console.log('[MirrorReflectionScript] Gradient blur mirror reflector created successfully');
                }
            }
        } catch (error) {
            console.error('[MirrorReflectionScript] Failed to create mirror reflector:', error);
        }
    }

    /**
     * 创建镜面反射器 - 修改为支持渐变模糊
     */
    private createReflector(): void {
        try {
            // 修复条件检查
            if (this.renderer) {
                this.geometry = new THREE.PlaneGeometry(1000, 1000);

                // 添加对this.geometry的null检查
                if (this.geometry) {
                    this.reflector = new Reflector(this.geometry, {
                        clipBias: this.clipBias,
                        textureWidth: this.textureWidth,
                        textureHeight: this.textureHeight,
                        color: new THREE.Color(this.color)
                    });

                    // Reflector本身就是一个Mesh对象
                    this.reflectorObject = this.reflector;
                    this.reflectorObject.position.set(0, 0, 0);
                    this.reflectorObject.rotation.x = -Math.PI / 2;
                    this.reflectorObject.visible = true;
                    this.reflectorObject.name = 'Reflection';

                    // 设置材质属性
                    // 添加对this.reflectorObject.material的null检查
                    if (this.reflectorObject && this.reflectorObject.material) {
                        const material = this.reflectorObject.material;
                        if (Array.isArray(material)) {
                            material.forEach(mat => {
                                if (mat instanceof THREE.MeshBasicMaterial || mat instanceof THREE.ShaderMaterial) {
                                    mat.transparent = true;
                                    mat.opacity = this.opacity;
                                }
                            });
                        } else {
                            if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.ShaderMaterial) {
                                material.transparent = true;
                                material.opacity = this.opacity;
                            }
                        }
                    }

                    // 添加到场景
                    // 添加对this.scene的null检查
                    if (this.scene) {
                        this.scene.add(this.reflectorObject);
                    }
                    console.log('[MirrorReflectionScript] Gradient blur mirror reflector created successfully');
                }
            }
        } catch (error) {
            console.error('[MirrorReflectionScript] Failed to create mirror reflector:', error);
        }
    }

    /**
     * 创建模糊效果组件
     */
    public createBlurComponents(): void {
        if (!this.renderer) return;

        // 创建渲染目标
        this.blurRenderTarget1 = new THREE.WebGLRenderTarget(this.textureWidth, this.textureHeight);
        this.blurRenderTarget2 = new THREE.WebGLRenderTarget(this.textureWidth, this.textureHeight);

        // 创建模糊着色器材质
        this.blurMaterial1 = new THREE.ShaderMaterial({
            name: 'HorizontalBlurMaterial',
            uniforms: {
                tDiffuse: { value: null },
                h: { value: this.blurRadius / this.textureWidth }
            },
            vertexShader: HorizontalBlurShader.vertexShader,
            fragmentShader: HorizontalBlurShader.fragmentShader
        });

        this.blurMaterial2 = new THREE.ShaderMaterial({
            name: 'VerticalBlurMaterial',
            uniforms: {
                tDiffuse: { value: null },
                v: { value: this.blurRadius / this.textureHeight }
            },
            vertexShader: VerticalBlurShader.vertexShader,
            fragmentShader: VerticalBlurShader.fragmentShader
        });

        // 创建用于应用模糊效果的平面
        const blurPlaneGeometry = new THREE.PlaneGeometry(2, 2);
        this.blurPlane = new THREE.Mesh(blurPlaneGeometry, this.blurMaterial1);
        this.blurPlane.visible = false;
    }

    /**
     * 应用模糊效果
     */
    private applyBlur(renderer: THREE.WebGLRenderer): void {
        if (!this.reflector || !this.blurRenderTarget1 || !this.blurRenderTarget2 ||
            !this.blurMaterial1 || !this.blurMaterial2 || !this.blurPlane) {
            return;
        }

        // 如果模糊强度为0，直接使用原始反射纹理
        if (this.blurStrength <= 0) {
            // 恢复原始纹理
            if (this.reflector.material) {
                const material = this.reflector.material as THREE.ShaderMaterial;
                if (material.uniforms && material.uniforms.tDiffuse) {
                    material.uniforms.tDiffuse.value = this.reflector.getRenderTarget().texture;
                }
            }
            return;
        }

        // 获取反射器的渲染目标纹理
        const reflectorTexture = this.reflector.getRenderTarget().texture;

        // 水平模糊
        this.blurMaterial1.uniforms.tDiffuse.value = reflectorTexture;
        this.blurMaterial1.uniforms.h.value = this.blurRadius / this.textureWidth * this.blurStrength;

        renderer.setRenderTarget(this.blurRenderTarget1);
        renderer.render(this.blurPlane, this.camera);

        // 垂直模糊
        this.blurMaterial2.uniforms.tDiffuse.value = this.blurRenderTarget1.texture;
        this.blurMaterial2.uniforms.v.value = this.blurRadius / this.textureHeight * this.blurStrength;

        renderer.setRenderTarget(this.blurRenderTarget2);
        renderer.render(this.blurPlane, this.camera);

        // 将模糊后的纹理应用到反射器材质
        if (this.reflector.material) {
            const material = this.reflector.material as THREE.ShaderMaterial;
            if (material.uniforms && material.uniforms.tDiffuse) {
                material.uniforms.tDiffuse.value = this.blurRenderTarget2.texture;
            }
        }

        this.needsBlurUpdate = false;
    }

    /**
     * 更新镜面反射参数 - 添加模糊参数支持
     */
    public updateParameters(options: {
        clipBias?: number;
        textureWidth?: number;
        textureHeight?: number;
        color?: number;
        opacity?: number;
        blurStrength?: number;
        blurRadius?: number;
        gradientBlur?: boolean;
        blurCenter?: THREE.Vector2;
    }): void {
        let needsRecreate = false;

        // 检查是否需要重新创建反射器
        if (options.textureWidth !== undefined && options.textureWidth !== this.textureWidth) {
            this.textureWidth = options.textureWidth;
            needsRecreate = true;
        }
        if (options.textureHeight !== undefined && options.textureHeight !== this.textureHeight) {
            this.textureHeight = options.textureHeight;
            needsRecreate = true;
        }

        // 更新其他参数
        if (options.clipBias !== undefined) this.clipBias = options.clipBias;
        if (options.color !== undefined) this.color = options.color;
        if (options.opacity !== undefined) this.opacity = options.opacity;
        if (options.blurStrength !== undefined) {
            this.blurStrength = options.blurStrength;
            this.needsBlurUpdate = true;
        }
        if (options.blurRadius !== undefined) {
            this.blurRadius = options.blurRadius;
            this.needsBlurUpdate = true;
        }
        if (options.gradientBlur !== undefined) this.gradientBlur = options.gradientBlur;
        if (options.blurCenter !== undefined) this.blurCenter.copy(options.blurCenter);

        // 如果需要重新创建反射器
        if (needsRecreate) {
            this.dispose();
            this.createReflector();
            this.createBlurComponents();
        } else {
            // 更新现有反射器的参数
            this.updateReflectorParameters();
            // 更新模糊参数
            this.updateBlurParameters();
        }
    }

    /**
     * 更新模糊参数
     */
    private updateBlurParameters(): void {
        if (this.blurMaterial1 && this.blurMaterial2) {
            this.blurMaterial1.uniforms.h.value = this.blurRadius / this.textureWidth * this.blurStrength;
            this.blurMaterial2.uniforms.v.value = this.blurRadius / this.textureHeight * this.blurStrength;
            this.needsBlurUpdate = true;
        }
    }

    /**
     * 更新反射器参数
     */
    private updateReflectorParameters(): void {
        // 添加对this.reflectorObject和this.reflectorObject.material的null检查
        if (!this.reflectorObject || !this.reflectorObject.material) return;

        const material = this.reflectorObject.material;
        if (Array.isArray(material)) {
            material.forEach(mat => {
                if (mat instanceof THREE.MeshBasicMaterial || mat instanceof THREE.ShaderMaterial) {
                    mat.transparent = true;
                    mat.opacity = this.opacity;
                }
            });
        } else {
            if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.ShaderMaterial) {
                material.transparent = true;
                material.opacity = this.opacity;
            }
        }
    }

    /**
     * 设置模糊强度
     */
    public setBlurStrength(strength: number): void {
        this.blurStrength = Math.max(0, Math.min(1, strength)); // 限制在0-1范围内
        this.needsBlurUpdate = true;
        this.updateBlurParameters();
        console.log(`[MirrorReflectionScript] Blur strength set to: ${this.blurStrength}`);
    }

    /**
     * 设置模糊半径
     */
    public setBlurRadius(radius: number): void {
        this.blurRadius = Math.max(0, radius); // 确保半径不为负数
        this.needsBlurUpdate = true;
        this.updateBlurParameters();
        console.log(`[MirrorReflectionScript] Blur radius set to: ${this.blurRadius}`);
    }

    /**
     * 设置渐变模糊中心点
     */
    public setBlurCenter(x: number, y: number): void {
        this.blurCenter.set(x, y);
        console.log(`[MirrorReflectionScript] Blur center set to: (${x}, ${y})`);
    }

    /**
     * 启用或禁用渐变模糊
     */
    public setGradientBlurEnabled(enabled: boolean): void {
        this.gradientBlur = enabled;
        this.needsBlurUpdate = true;
        console.log(`[MirrorReflectionScript] Gradient blur ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * 设置反射透明度
     */
    public setOpacity(opacity: number): void {
        this.opacity = opacity;
        this.updateReflectorParameters();
    }

    /**
     * 设置反射颜色
     */
    public setColor(color: number): void {
        this.color = color;
        // 更新反射器的颜色
        if (this.reflector && this.reflector.material) {
            const material = this.reflector.material;
            if (!Array.isArray(material) &&
                (material as any).uniforms &&
                (material as any).uniforms.color) {
                (material as any).uniforms.color.value = new THREE.Color(color);
            }
        }
    }

    /**
     * 获取反射器对象
     */
    public getReflectorObject(): Reflector | null {
        return this.reflectorObject;
    }

    /**
     * 更新函数 - 每帧调用
     */
    public update(): void {
        // 可以在这里添加每帧更新的逻辑
    }

    /**
     * 渲染前调用 - 应用模糊效果
     */
    public onPreRender(): void {
        // 在渲染前应用模糊效果
        if (this.renderer && this.needsBlurUpdate) {
            this.applyBlur(this.renderer.renderer);
        }
    }

    /**
     * 清理资源
     */
    public dispose(): void {
        // 添加对this.reflectorObject和this.scene的null检查
        if (this.reflectorObject && this.scene) {
            this.scene.remove(this.reflectorObject);
        }

        // 添加对this.geometry的null检查
        if (this.geometry) {
            this.geometry.dispose();
        }

        // 添加对this.reflector的null检查
        if (this.reflector && typeof this.reflector.dispose === 'function') {
            this.reflector.dispose();
        }

        // 清理模糊相关资源
        if (this.blurRenderTarget1) {
            this.blurRenderTarget1.dispose();
        }
        if (this.blurRenderTarget2) {
            this.blurRenderTarget2.dispose();
        }
        if (this.blurMaterial1) {
            this.blurMaterial1.dispose();
        }
        if (this.blurMaterial2) {
            this.blurMaterial2.dispose();
        }
        if (this.blurPlane) {
            this.blurPlane.geometry.dispose();
        }

        this.reflector = null;
        this.reflectorObject = null;
        this.geometry = null;
        this.blurRenderTarget1 = null;
        this.blurRenderTarget2 = null;
        this.blurPlane = null;
        this.blurMaterial1 = null;
        this.blurMaterial2 = null;
    }
}
