import { THREE } from "../core/global";
import { CanvasTexture } from "three";

/**
 * UV动画材质类
 * 专门用于处理UV动画的材质
 */
export class AnimationMaterial extends THREE.MeshStandardMaterial {
    private _uvOffset: THREE.Vector2 = new THREE.Vector2(0, 0);
    private _uvScale: THREE.Vector2 = new THREE.Vector2(1, 1);
    private _uvRotation: number = 0;

    constructor(config?: {
        depthWrite?: boolean;
        color?: number | string;
        texture?: THREE.Texture;
        alphaMap?: CanvasTexture;
        doubleSided?: boolean;
        opacity?: number;
        uvScale?: THREE.Vector2;
        uvOffset?: THREE.Vector2;
        transparent?: boolean;
    }) {
        // 处理透明度相关配置
        const isTransparent = config?.transparent ?? false;
        const hasAlphaMap = !!config?.alphaMap;
        const opacity = config?.opacity ?? 1.0;

        // 对于透明材质，通常需要关闭深度写入以避免遮挡问题
        const depthWrite = config?.depthWrite ?? !(isTransparent || hasAlphaMap || opacity < 1.0);

        super({
            color: config?.color,
            transparent: isTransparent,
            opacity: opacity,
            map: config?.texture,
            alphaTest: 0.05,
            alphaMap: config?.alphaMap,
            side: config?.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            depthWrite: depthWrite
        });

        // 对于透明材质，设置渲染顺序以确保在不透明对象之后渲染
        if (isTransparent || hasAlphaMap || opacity < 1.0) {
            this.depthWrite = false;
            // 设置透明对象的渲染顺序，确保在不透明对象之后渲染
            this.transparent = true;
        }

        // 正确处理uvOffset配置
        if (config?.uvOffset) {
            this._uvOffset.copy(config.uvOffset);
        }

        // 正确处理uvScale配置
        if (config?.uvScale) {
            this._uvScale.copy(config.uvScale);
        }

        // 确保纹理使用重复包装模式
        if (this.map) {
            this.map.wrapS = THREE.RepeatWrapping;
            this.map.wrapT = THREE.RepeatWrapping;
        }

        if (this.alphaMap) {
            this.alphaMap.wrapS = THREE.RepeatWrapping;
            this.alphaMap.wrapT = THREE.RepeatWrapping;
        }
    }

    /**
     * 获取UV偏移
     */
    get uvOffset(): THREE.Vector2 {
        return this._uvOffset.clone();
    }

    /**
     * 设置UV偏移
     */
    set uvOffset(value: THREE.Vector2) {
        this._uvOffset.copy(value);
        this.updateUVTransform();
    }

    /**
     * 获取UV缩放
     */
    get uvScale(): THREE.Vector2 {
        return this._uvScale.clone();
    }

    /**
     * 设置UV缩放
     */
    set uvScale(value: THREE.Vector2) {
        this._uvScale.copy(value);
        this.updateUVTransform();
    }

    /**
     * 获取UV旋转角度
     */
    get uvRotation(): number {
        return this._uvRotation;
    }

    /**
     * 设置UV旋转角度
     */
    set uvRotation(value: number) {
        this._uvRotation = value;
        this.updateUVTransform();
    }

    /**
     * 更新UV变换
     */
    private updateUVTransform(): void {
        if (this.map) {
            this.map.offset.copy(this._uvOffset);
            this.map.repeat.copy(this._uvScale);
            this.map.needsUpdate = true;
        }
    }

    /**
     * 应用UV滚动
     * @param deltaX X轴偏移增量
     * @param deltaY Y轴偏移增量
     */
    public scrollUV(deltaX: number, deltaY: number): void {
        this._uvOffset.x += deltaX;
        this._uvOffset.y += deltaY;
        this.updateUVTransform();
    }

    /**
     * 应用UV缩放
     * @param scaleX X轴缩放增量
     * @param scaleY Y轴缩放增量
     */
    public scaleUV(scaleX: number, scaleY: number): void {
        this._uvScale.x += scaleX;
        this._uvScale.y += scaleY;
        this.updateUVTransform();
    }

    /**
     * 重置UV变换到初始状态
     */
    public resetUV(): void {
        this._uvOffset.set(0, 0);
        this._uvScale.set(1, 1);
        this._uvRotation = 0;
        this.updateUVTransform();
    }

    /**
     * 设置UV变换参数
     * @param offset UV偏移
     * @param scale UV缩放
     * @param rotation UV旋转角度
     */
    public setUVTransform(offset?: THREE.Vector2, scale?: THREE.Vector2, rotation?: number): void {
        if (offset) {
            this._uvOffset.copy(offset);
        }
        if (scale) {
            this._uvScale.copy(scale);
        }
        if (rotation !== undefined) {
            this._uvRotation = rotation;
        }
        this.updateUVTransform();
    }

    /**
     * 获取当前UV变换状态
     */
    public getUVTransform(): { offset: THREE.Vector2; scale: THREE.Vector2; rotation: number } {
        return {
            offset: this._uvOffset.clone(),
            scale: this._uvScale.clone(),
            rotation: this._uvRotation
        };
    }
}

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
    /** 是否启用透明度 */
    transparent?: boolean;
    /** 透明度值 */
    opacity?: number;
    /** 是否使用双面材质 */
    doubleSided?: boolean;
}

export class UVAnimationScript {
    private animations: Map<string, {
        mesh: THREE.Mesh;
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
        enabled: true,
        transparent: false,
        opacity: 1.0,
        doubleSided: false
    };

    constructor(configs?: UVAnimationConfig | UVAnimationConfig[]) {
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
            console.warn(`[UVAnimationScript] Animation for target "${fullConfig.targetName}" already exists`);
            return;
        }

        this.animations.set(fullConfig.targetName, {
            mesh: null as any, // 将在start中初始化
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
            // 重置材质的UV变换
            if (animation.mesh && animation.mesh.material) {
                this.resetMaterialUV(animation.mesh.material);
            }
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
     * 重置材质的UV变换
     * @param material 材质
     */
    private resetMaterialUV(material: THREE.Material | THREE.Material[]): void {
        if (Array.isArray(material)) {
            material.forEach(mat => this.resetSingleMaterialUV(mat));
        } else {
            this.resetSingleMaterialUV(material);
        }
    }

    /**
     * 重置单个材质的UV变换
     * @param material 材质
     */
    private resetSingleMaterialUV(material: THREE.Material): void {
        if ((material as any).map) {
            const texture = (material as any).map;
            texture.offset.set(0, 0);
            texture.repeat.set(1, 1);
        }
    }

    /**
     * 加载纹理的辅助函数
     * @param url 纹理文件路径
     * @returns Promise<THREE.Texture>
     */
    private loadTexture(url: string): Promise<THREE.Texture> {
        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    // 启用透明贴图支持
                    texture.format = THREE.RGBAFormat;
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error('[UVAnimationScript] 纹理加载失败:', error);
                    reject(error);
                }
            );
        });
    }

    /**
     * 创建渐变透明贴图
     * @param direction 渐变方向
     * @returns Canvas纹理
     */
    private createGradientAlphaMap(direction: 'bottomToTop' | 'topToBottom' | 'leftToRight' | 'rightToLeft' = 'bottomToTop'): THREE.CanvasTexture {
        const gradientCanvas = document.createElement('canvas');
        gradientCanvas.width = 256;
        gradientCanvas.height = 256;
        const ctx = gradientCanvas.getContext('2d')!;

        let gradient;
        switch (direction) {
            case 'bottomToTop':
                gradient = ctx.createLinearGradient(0, gradientCanvas.height, 0, 0);
                break;
            case 'topToBottom':
                gradient = ctx.createLinearGradient(0, 0, 0, gradientCanvas.height);
                break;
            case 'leftToRight':
                gradient = ctx.createLinearGradient(0, 0, gradientCanvas.width, 0);
                break;
            case 'rightToLeft':
                gradient = ctx.createLinearGradient(gradientCanvas.width, 0, 0, 0);
                break;
            default:
                gradient = ctx.createLinearGradient(0, gradientCanvas.height, 0, 0);
        }

        // 创建渐变（从透明到不透明）
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');   // 完全透明
        gradient.addColorStop(1, 'rgba(255, 255, 255, 1)'); // 完全不透明

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, gradientCanvas.width, gradientCanvas.height);

        const alphaMap = new THREE.CanvasTexture(gradientCanvas);
        alphaMap.wrapS = THREE.RepeatWrapping;
        alphaMap.wrapT = THREE.RepeatWrapping;

        return alphaMap;
    }

    /**
     * 加载外部alpha贴图
     * @param url 贴图URL
     * @returns Promise<THREE.Texture>
     */
    private loadAlphaMap(url: string): Promise<THREE.Texture | null> {
        return new Promise((resolve) => {
            const loader = new THREE.TextureLoader();
            loader.load(
                url,
                (texture) => {
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.format = THREE.RedFormat; // Alpha贴图通常只需要红色通道
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error('[UVAnimationScript] Alpha贴图加载失败:', error);
                    // 如果外部贴图加载失败，返回null，后续会使用程序生成的渐变贴图
                    resolve(null);
                }
            );
        });
    }

    private MeshStandardUVMaterial(sharedTexture: THREE.Texture, alphaMap: THREE.Texture | null): THREE.MeshStandardMaterial {
        // 对于透明材质，通常需要关闭深度写入以避免遮挡问题
        const hasAlphaMap = !!alphaMap;
        const isTransparent = true; // 明确设置为透明
        const depthWrite = !(isTransparent || hasAlphaMap);

        const material = new THREE.MeshStandardMaterial({
            color: '#fff300',                   // 材质基础颜色
            transparent: isTransparent,         // 开启透明混合
            map: sharedTexture,                 // 绑定基础纹理
            alphaMap: alphaMap || undefined,    // 绑定alpha贴图
            opacity: 1,                         // 全局透明度
            depthWrite: depthWrite,             // 透明物体关闭深度写入
            blending: THREE.AdditiveBlending,   // 发光效果混合
            side: THREE.DoubleSide              // 双面渲染
        });

        // 确保透明材质正确渲染
        if (isTransparent || hasAlphaMap) {
            material.depthWrite = false;
        }

        return material;
    }

    /**
     * 应用材质配置
     * @param animation 动画数据
     */
    private applyMaterialConfig(animation: { mesh: THREE.Mesh; config: Required<UVAnimationConfig>; }): void {
        const material = animation.mesh.material;
        const applyToMaterial = (mat: THREE.Material) => {
            // 设置透明度
            if (animation.config.transparent !== undefined) {
                mat.transparent = animation.config.transparent;
            }

            if (animation.config.opacity !== undefined) {
                mat.opacity = animation.config.opacity;
            }

            // 正确处理深度写入设置，避免透明材质遮挡问题
            if (mat.constructor === THREE.Material) {
                // 对于透明材质，通常需要关闭深度写入以避免遮挡问题
                const isTransparent = mat.transparent || (mat.opacity !== undefined && mat.opacity < 1.0);
                if (mat.depthWrite !== undefined) {
                    mat.depthWrite = !isTransparent;
                }

                // 确保透明对象在不透明对象之后渲染
                if (isTransparent && mat.transparent !== undefined) {
                    mat.transparent = true;
                }
            }

            // 设置双面材质
            if (animation.config.doubleSided !== undefined) {
                mat.side = animation.config.doubleSided ? THREE.DoubleSide : THREE.FrontSide;
            }
        };

        // 处理单个材质或材质数组
        if (Array.isArray(material)) {
            material.forEach(applyToMaterial);
        } else {
            applyToMaterial(material);
        }
    }

    /**
     * 更新动画
     * @param deltaTime 帧时间
     */
    public update(deltaTime: number): void {
        this.animations.forEach(animation => {
            // 检查动画是否启用且mesh存在
            if (!animation.config.enabled || !animation.mesh) return;

            // 更新偏移
            animation.offset.x += animation.config.scrollSpeedX * deltaTime;
            animation.offset.y += animation.config.scrollSpeedY * deltaTime;

            // 更新缩放
            animation.scale.x += animation.config.scaleSpeedX * deltaTime;
            animation.scale.y += animation.config.scaleSpeedY * deltaTime;

            // 更新旋转
            animation.rotation += animation.config.rotationSpeed * deltaTime;

            // 应用UV变换到材质
            this.applyUVTransform(animation);
        });
    }

    /**
     * 应用UV变换到材质
     * @param animation 动画数据
     */
    private applyUVTransform(animation: {
        mesh: THREE.Mesh;
        offset: THREE.Vector2;
        scale: THREE.Vector2;
        rotation: number;
    }): void {
        const material = animation.mesh.material;
        if (!material) return;

        const applyToMaterial = (mat: THREE.Material) => {
            // 检查材质是否有纹理
            if ((mat as any).map) {
                const texture = (mat as any).map;

                // 确保设置了重复包装模式，这对于UV动画是必需的
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;

                // 应用偏移
                texture.offset.x = animation.offset.x;
                texture.offset.y = animation.offset.y;

                // 应用缩放
                texture.repeat.x = animation.scale.x;
                texture.repeat.y = animation.scale.y;

                // 标记纹理需要更新
                texture.needsUpdate = true;
            }
        };

        // 处理单个材质或材质数组
        if (Array.isArray(material)) {
            material.forEach(applyToMaterial);
        } else {
            applyToMaterial(material);
        }
    }
}
