import { ScriptBase } from "../core/ScriptBase";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { THREE } from "../core/global.ts";
/**
 * 环境贴图预设类型
 */
export type EnvironmentPresetsType = 'hdr';

/**
 * 色调映射类型
 */
export type ToneMappingType = 'None' | 'Linear' | 'Reinhard' | 'Cineon' | 'ACESFilmic' | 'AgX' | 'Neutral' | 'Custom';

/**
 * 环境贴图配置接口
 */
export interface EnvironmentConfig {
    /** 环境贴图预设模式 */
    envPreset?: EnvironmentPresetsType;
    /** HDR环境贴图路径 */
    hdrPath?: string;
    /** 是否启用环境贴图 */
    enabled?: boolean;
    /** 环境贴图强度 (0-2) */
    envMapIntensity?: number;
    /** 色调映射类型 */
    toneMapping?: ToneMappingType;
    /** 色调映射曝光 (0-2) */
    toneMappingExposure?: number;
    /** 背景模糊度 (0-1) */
    backgroundBlurriness?: number;
    /** 背景强度 (0-2) */
    backgroundIntensity?: number;
    /** 环境强度 (0-2) */
    environmentIntensity?: number;
    /** 是否显示背景 (true: 显示背景, false: 只影响材质) */
    showBackground?: boolean;
}

export class EnvironmentMapScript extends ScriptBase {
    name = 'EnvironmentMapScript';

    // 环境贴图相关属性
    private config: Required<EnvironmentConfig>;
    private currentEnvironment: THREE.Texture | null = null;
    private originalEnvironment: THREE.Texture | null = null;
    private originalBackground: THREE.Color | THREE.Texture | THREE.CubeTexture | null = null;

    // HDR加载器
    private hdrLoader: RGBELoader;
    // HDR纹理缓存
    private static hdrCache = new Map<string, THREE.Texture>();

    // 色调映射选项
    private static toneMappingOptions = {
        None: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        ACESFilmic: THREE.ACESFilmicToneMapping,
        AgX: THREE.AgXToneMapping,
        Neutral: THREE.NeutralToneMapping,
        Custom: THREE.CustomToneMapping
    };

    // 性能优化：设备性能检测缓存
    private isHighPerformanceDeviceCached: boolean | null = null;

    // 性能优化：纹理质量设置
    private maxTextureSize: number = 2048;

    constructor(options?: EnvironmentConfig) {
        super();

        this.config = {
            envPreset: 'hdr',
            hdrPath: options?.hdrPath || '/hdr/plac_wolnosci_4k.hdr',
            enabled: true,
            envMapIntensity: 1.0,
            toneMapping: 'Neutral',
            toneMappingExposure: 1.0,
            backgroundBlurriness: 0.5,
            backgroundIntensity: 1.0,
            environmentIntensity: 1.5,
            showBackground: false, // 默认不显示背景
            ...options
        };

        // 初始化HDR加载器
        this.hdrLoader = new RGBELoader();

        // 根据预设应用初始配置
        this.applyEnvironmentPreset(this.config.envPreset);

        // 根据设备性能调整纹理质量
        this.adjustTextureQuality();
    }

    /**
     * 检测是否为高性能设备
     */
    private isHighPerformanceDevice(): boolean {
        if (this.isHighPerformanceDeviceCached !== null) {
            return this.isHighPerformanceDeviceCached;
        }

        // 检测设备性能
        const isHighPerformance = (
            window.devicePixelRatio <= 2 &&
            navigator.hardwareConcurrency >= 4 &&
            !(navigator as any).connection?.saveData // 不在省电模式下
        );

        this.isHighPerformanceDeviceCached = isHighPerformance;
        return isHighPerformance;
    }

    /**
     * 根据设备性能调整纹理质量
     */
    private adjustTextureQuality(): void {
        this.maxTextureSize = this.isHighPerformanceDevice() ? 2048 : 1024;
    }

    /**
     * 脚本初始化时调用
     */
    public override async start(): Promise<void> {
        super.start?.();
        this.initializeRenderer();
        if (this.config.enabled) {
            setTimeout(async () => {
                await this.createEnvironment();
            }, 0);
        }
    }

    /**
     * 每帧更新时调用
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
    }

    /**
     * 每帧在 update 调用之后调用
     */
    public override lateUpdate(deltaTime: number): void {
        super.lateUpdate?.(deltaTime);
    }

    /**
     * 在每一帧渲染前调用
     */
    public override onPreRender(): void {
        super.onPreRender?.();
    }

    /**
     * 在每一帧渲染后调用
     */
    public override onPostRender(): void {
        super.onPostRender?.();
    }

    public override onResize(): void {
        super.onResize();
    }

    /**
     * 当脚本变为禁用或非激活状态时调用
     */
    public override onDisable(): void {
        super.onDisable?.();
        this.removeEnvironment();
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();
        this.dispose();
    }

    /**
     * 初始化渲染器配置
     */
    private initializeRenderer(): void {
        try {
            // 配置色调映射
            this.webGLRenderer.toneMapping = EnvironmentMapScript.toneMappingOptions[this.config.toneMapping];
            this.webGLRenderer.toneMappingExposure = this.config.toneMappingExposure;
            if (this.config.toneMapping === 'Custom') {
                this.setupCustomToneMapping();
            }
        } catch (error) {
            console.error('[EnvironmentMapScript] 初始化渲染器失败:', error);
        }
    }

    /**
     * 设置自定义色调映射为Uncharted2
     */
    private setupCustomToneMapping(): void {
        try {
            THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace(
                'vec3 CustomToneMapping( vec3 color ) { return color; }',
                `#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
                
                float toneMappingWhitePoint = 1.0;
                
                vec3 CustomToneMapping( vec3 color ) {
                    color *= toneMappingExposure;
                    return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );
                }`
            );
        } catch (error) {
            console.error('[EnvironmentMapScript] 设置自定义色调映射失败:', error);
        }
    }

    /**
     * 创建环境贴图
     */
    private async createEnvironment(): Promise<void> {
        try {
            // 保存原始环境设置
            this.saveOriginalEnvironmentSettings(this.scene);
            // 根据预设类型创建环境贴图
            if (this.config.envPreset === 'hdr' && this.config.hdrPath) {
                await this.createHDREnvironment(this.scene);
            } else {
                console.warn('[EnvironmentMapScript] HDR路径未设置，跳过创建环境贴图');
            }
            this.applyEnvironmentSettings(this.scene);
        } catch (error) {
            console.error('[EnvironmentMapScript] 创建环境贴图失败:', error);
        }
    }

    /**
     * 保存原始环境设置
     */
    private saveOriginalEnvironmentSettings(scene: THREE.Scene): void {
        if (!this.originalEnvironment && scene.environment) {
            this.originalEnvironment = this.scene.environment;
        }
        if (this.originalBackground === undefined) {
            this.originalBackground = this.scene.background;
        }
    }

    /**
     * 应用环境贴图设置
     */
    private applyEnvironmentSettings(scene: THREE.Scene): void {
        if (this.currentEnvironment) {
            // 始终设置环境贴图以影响材质
            scene.environment = this.currentEnvironment;
            
            // 根据配置决定是否显示背景
            if (this.config.showBackground) {
                scene.background = this.currentEnvironment;
                scene.backgroundBlurriness = this.config.backgroundBlurriness || 0.5;
                scene.backgroundIntensity = this.config.backgroundIntensity || 1.0;
            } else {
                // 不显示背景时，恢复原始背景或设置为null
                scene.background = this.originalBackground || null;
            }
            
            // 设置环境强度
            scene.environmentIntensity = this.config.environmentIntensity || 1.5;
            
            // 更新所有材质的环境贴图强度
            scene.traverse((object: THREE.Object3D) => {
                if (object instanceof THREE.Mesh && object.material) {
                    const materials = Array.isArray(object.material) ? object.material : [object.material];
                    materials.forEach((material: THREE.Material) => {
                        if (material instanceof THREE.MeshStandardMaterial ||
                            material instanceof THREE.MeshPhysicalMaterial) {
                            material.envMapIntensity = this.config.envMapIntensity;
                        }
                    });
                }
            });
        }
    }

    /**
     * 创建HDR环境贴图
     */
    private async createHDREnvironment(scene: THREE.Scene): Promise<void> {
        try {
            if (this.currentEnvironment && this.config.hdrPath !== this.currentEnvironment.userData?.path) {
                this.removeEnvironment();
            }
            const cacheKey = this.config.hdrPath;
            let hdrTexture: THREE.Texture;

            // 检查缓存
            if (EnvironmentMapScript.hdrCache.has(cacheKey)) {
                hdrTexture = EnvironmentMapScript.hdrCache.get(cacheKey)!;
            } else {
                // 加载HDR纹理
                hdrTexture = await new Promise<THREE.Texture>((resolve, reject) => {
                    this.hdrLoader.load(
                        this.config.hdrPath,
                        (texture: THREE.Texture) => {
                            // 性能优化：根据设备性能调整纹理大小
                            if (texture.image.width > this.maxTextureSize) {
                                // 这里可以添加纹理压缩逻辑，简化处理
                                texture.userData.originalWidth = texture.image.width;
                                texture.userData.originalHeight = texture.image.height;
                            }

                            texture.userData = { path: this.config.hdrPath };
                            EnvironmentMapScript.hdrCache.set(cacheKey, texture);
                            resolve(texture);
                        },
                        undefined,
                        (error: any) => {
                            console.error('[EnvironmentMapScript] HDR纹理加载失败:', error);
                            reject(error);
                        }
                    );
                });
            }

            // 如果当前环境贴图与新加载的纹理相同，则不需要重新设置
            if (this.currentEnvironment === hdrTexture) {
                return;
            }

            // 设置等矩形映射
            hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

            // 设置为场景环境（始终设置以影响材质）
            scene.environment = hdrTexture;
            this.currentEnvironment = hdrTexture;

            // 根据配置决定是否设置为背景
            if (this.config.showBackground) {
                scene.background = hdrTexture;
                scene.backgroundBlurriness = this.config.backgroundBlurriness || 0.5;
                scene.backgroundIntensity = this.config.backgroundIntensity || 1.0;
            } else {
                // 不显示背景时，恢复原始背景或设置为null
                scene.background = this.originalBackground || null;
            }

            // 应用环境光参数
            scene.environmentIntensity = this.config.environmentIntensity || 1.5;
        } catch (error) {
            console.error('[EnvironmentMapScript] 创建HDR环境贴图失败:', error);
            throw error;
        }
    }

    /**
     * 移除环境贴图
     */
    private removeEnvironment(): void {
        try {
            // 移除环境贴图
            if (this.currentEnvironment) {
                // 恢复原始环境
                this.scene.environment = this.originalEnvironment;

                // 恢复原始背景
                this.scene.background = this.originalBackground;

                this.currentEnvironment = null;
                this.originalEnvironment = null;
            }
        } catch (error) {
            console.error('[EnvironmentMapScript] 移除环境贴图失败:', error);
        }
    }

    /**
     * 释放资源
     */
    private dispose(): void {
        this.removeEnvironment();
    }

    /**
     * 应用环境贴图预设配置
     */
    private applyEnvironmentPreset(preset: EnvironmentPresetsType): void {
        switch (preset) {
            case 'hdr':
            default:
                // HDR模式使用默认环境贴图设置
                this.config.envMapIntensity = 1.0;
                break;
        }
    }

    /**
     * 更新配置
     */
    async updateConfig(newConfig: Partial<EnvironmentConfig>): Promise<void> {
        const oldEnvPreset = this.config.envPreset;

        // 合并新配置
        this.config = { ...this.config, ...newConfig };

        // 检查环境贴图相关配置变化
        const envPresetChanged = newConfig.envPreset !== undefined && newConfig.envPreset !== oldEnvPreset;
        const enabledChanged = newConfig.enabled !== undefined && newConfig.enabled !== this.config.enabled;
        const showBackgroundChanged = newConfig.showBackground !== undefined && newConfig.showBackground !== this.config.showBackground;

        // 当启用状态改变时，创建或移除环境贴图
        if (enabledChanged) {
            if (this.config.enabled) {
                await this.createEnvironment();
            } else {
                this.removeEnvironment();
            }
        }

        // 当预设改变时，重新创建环境贴图
        if (envPresetChanged && this.config.enabled) {
            await this.createEnvironment();
        }

        // 当背景显示设置改变时，重新应用环境设置
        if (showBackgroundChanged && this.config.enabled && this.currentEnvironment) {
            this.applyEnvironmentSettings(this.scene);
        }
    }

    /**
     * 应用环境贴图预设
     */
    async applyPreset(preset: EnvironmentPresetsType): Promise<void> {
        await this.updateConfig({ envPreset: preset });
    }

    /**
     * 设置HDR环境贴图路径
     */
    setHDRPath(path: string): void {
        this.updateConfig({ hdrPath: path, envPreset: 'hdr' }).then(() => {});
    }

    /**
     * 设置环境贴图强度
     */
    setEnvironmentMapIntensity(intensity: number): void {
        this.config.envMapIntensity = Math.max(0, Math.min(2, intensity));
        // 更新场景环境强度（如果支持）
        if (this.scene.environmentIntensity !== undefined) {
            this.scene.environmentIntensity = this.config.envMapIntensity;
        }

        // 更新所有材质的环境贴图强度
        this.applyEnvironmentSettings(this.scene);
    }

    /**
     * 设置背景模糊度
     */
    setBackgroundBlurriness(blurriness: number): void {
        this.config.backgroundBlurriness = Math.max(0, Math.min(1, blurriness));
        // 仅在显示背景时应用
        if (this.config.showBackground) {
            this.scene.backgroundBlurriness = this.config.backgroundBlurriness;
        }
    }

    /**
     * 设置背景强度
     */
    setBackgroundIntensity(intensity: number): void {
        this.config.backgroundIntensity = Math.max(0, Math.min(2, intensity));
        // 仅在显示背景时应用
        if (this.config.showBackground) {
            this.scene.backgroundIntensity = this.config.backgroundIntensity;
        }
    }

    /**
     * 设置环境强度
     */
    setEnvironmentIntensity(intensity: number): void {
        this.config.environmentIntensity = Math.max(0, Math.min(2, intensity));
        this.scene.environmentIntensity = this.config.environmentIntensity;
    }

    /**
     * 设置是否显示背景
     */
    setShowBackground(show: boolean): void {
        this.config.showBackground = show;
        // 重新应用环境设置以更新背景显示
        if (this.currentEnvironment) {
            this.applyEnvironmentSettings(this.scene);
        }
    }

    /**
     * 设置色调映射类型
     */
    setToneMapping(toneMapping: ToneMappingType): void {
        this.config.toneMapping = toneMapping;
        this.webGLRenderer.toneMapping = EnvironmentMapScript.toneMappingOptions[toneMapping];

        // 如果设置为自定义，应用Uncharted2色调映射
        if (toneMapping === 'Custom') {
            this.setupCustomToneMapping();
        }
    }

    /**
     * 设置色调映射曝光
     */
    setToneMappingExposure(exposure: number): void {
        this.config.toneMappingExposure = Math.max(0, Math.min(2, exposure));
        this.webGLRenderer.toneMappingExposure = this.config.toneMappingExposure;
    }

    /**
     * 获取当前配置
     */
    getConfig(): Required<EnvironmentConfig> {
        return { ...this.config };
    }

    /**
     * 清除HDR纹理缓存
     */
    static clearTextureCache(): void {
        EnvironmentMapScript.hdrCache.clear();
    }

    /**
     * 获取当前缓存的HDR纹理数量
     */
    static getTextureCacheSize(): number {
        return EnvironmentMapScript.hdrCache.size;
    }

    /**
     * 获取缓存统计信息
     */
    static getCacheStats(): { hdrTextures: number } {
        return {
            hdrTextures: EnvironmentMapScript.hdrCache.size
        };
    }
}
