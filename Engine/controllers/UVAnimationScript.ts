import { ScriptBase } from "../core/ScriptBase";
import { THREE } from "../core/global";

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

/**
 * 场景创建配置接口
 */
export interface SceneCreationConfig {
    /** 纹理URL */
    textureUrl: string;
    /** 对象配置数组 */
    objects: Array<{
        /** 对象类型 ('plane' | 'cylinder' | 'box') */
        type: 'plane' | 'cylinder' | 'box';
        /** 对象名称 */
        name: string;
        /** 位置 */
        position?: [number, number, number];
        /** 旋转 */
        rotation?: [number, number, number];
        /** 尺寸参数 */
        size?: number[];
    }>;
    /** 是否启用渐变透明效果 */
    enableGradientAlpha?: boolean;
    /** 渐变方向 ('bottomToTop' | 'topToBottom' | 'leftToRight' | 'rightToLeft') */
    gradientDirection?: 'bottomToTop' | 'topToBottom' | 'leftToRight' | 'rightToLeft';
    /** 外部alpha贴图URL（如果提供，将优先使用） */
    alphaMapUrl?: string;
    /** 灯光配置 */
    lights?: Array<{
        /** 灯光类型 ('ambient' | 'directional' | 'point' | 'spot') */
        type: 'ambient' | 'directional' | 'point' | 'spot';
        /** 灯光颜色 */
        color?: number | string;
        /** 灯光强度 */
        intensity?: number;
        /** 灯光位置（点光源和聚光灯） */
        position?: [number, number, number];
        /** 灯光方向（方向光） */
        direction?: [number, number, number];
    }>;
    /** 雾配置 */
    fog?: {
        /** 雾颜色 */
        color: number | string;
        /** 雾近端 */
        near: number;
        /** 雾远端 */
        far: number;
    };
}

/**
 * UV动画脚本
 * 用于创建纹理UV动画效果，如滚动、缩放、旋转等
 */
export class UVAnimationScript extends ScriptBase {
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

    private sceneCreationConfig: SceneCreationConfig | null = null;
    private sharedTexture: THREE.Texture | null = null;
    private alphaMap: THREE.Texture | null = null;

    constructor(configs?: UVAnimationConfig | UVAnimationConfig[]) {
        super();
        this.name = "UVAnimationScript";

        if (configs) {
            if (Array.isArray(configs)) {
                configs.forEach(config => this.addAnimation(config));
            } else {
                this.addAnimation(configs);
            }
        }
    }

    /**
     * 设置场景创建配置
     * @param config 场景创建配置
     */
    public setSceneCreationConfig(config: SceneCreationConfig): void {
        this.sceneCreationConfig = config;
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
                    texture.format = THREE.RGBAFormat;                    // 启用透明贴图支持
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

    /**
     * 创建场景对象
     */
    private async createSceneObjects(): Promise<void> {
        if (!this.sceneCreationConfig || !this.renderer) return;

        try {
            // 加载纹理
            this.sharedTexture = await this.loadTexture(this.sceneCreationConfig.textureUrl);

            // 创建或加载alpha贴图
            if (this.sceneCreationConfig.alphaMapUrl) {
                // 如果提供了外部alpha贴图URL，尝试加载外部贴图
                try {
                    this.alphaMap = await this.loadAlphaMap(this.sceneCreationConfig.alphaMapUrl);
                    if (!this.alphaMap) {
                        // 如果加载失败且启用了渐变透明效果，创建程序化渐变贴图
                        if (this.sceneCreationConfig.enableGradientAlpha) {
                            console.warn('[UVAnimationScript] 外部alpha贴图加载失败，使用程序生成的渐变贴图');
                            this.alphaMap = this.createGradientAlphaMap(this.sceneCreationConfig.gradientDirection);
                        }
                    } else {
                        console.log('[UVAnimationScript] 成功加载外部alpha贴图');
                    }
                } catch (error) {
                    // 如果加载失败且启用了渐变透明效果，创建程序化渐变贴图
                    if (this.sceneCreationConfig.enableGradientAlpha) {
                        console.warn('[UVAnimationScript] 外部alpha贴图加载失败，使用程序生成的渐变贴图:', error);
                        this.alphaMap = this.createGradientAlphaMap(this.sceneCreationConfig.gradientDirection);
                    }
                }
            } else if (this.sceneCreationConfig.enableGradientAlpha) {
                // 如果启用渐变透明效果，创建程序化渐变贴图
                this.alphaMap = this.createGradientAlphaMap(this.sceneCreationConfig.gradientDirection);
            }

            // 创建材质
            const material = new THREE.MeshStandardMaterial({
                color: '#ffffff',         // 材质基础颜色
                transparent: true,        // 开启透明混合
                map: this.sharedTexture,  // 绑定基础纹理
                alphaMap: this.alphaMap || undefined, // 绑定alpha贴图
                opacity: 1,               // 全局透明度
                depthWrite: true,        // 透明物体关闭深度写入
                blending: THREE.AdditiveBlending // 发光效果混合
            });

            // 创建对象
            for (const objConfig of this.sceneCreationConfig.objects) {
                let geometry: THREE.BufferGeometry;
                let mesh: THREE.Mesh;

                switch (objConfig.type) {
                    case 'plane':
                        geometry = new THREE.PlaneGeometry(
                            objConfig.size?.[0] || 2,
                            objConfig.size?.[1] || 2,
                            objConfig.size?.[2] || 1
                        );
                        mesh = new THREE.Mesh(geometry, material);
                        if (objConfig.rotation) {
                            mesh.rotation.set(...objConfig.rotation);
                        }
                        break;

                    case 'cylinder':
                        geometry = new THREE.CylinderGeometry(
                            objConfig.size?.[0] || 0.5,  // topRadius
                            objConfig.size?.[1] || 0.5,  // bottomRadius
                            objConfig.size?.[2] || 1,    // height
                            objConfig.size?.[3] || 32    // radialSegments
                        );
                        mesh = new THREE.Mesh(geometry, material);
                        break;

                    case 'box':
                        geometry = new THREE.BoxGeometry(
                            objConfig.size?.[0] || 1,
                            objConfig.size?.[1] || 1,
                            objConfig.size?.[2] || 1
                        );
                        mesh = new THREE.Mesh(geometry, material);
                        break;

                    default:
                        console.warn(`[UVAnimationScript] Unsupported object type: ${objConfig.type}`);
                        continue;
                }

                // 设置位置
                if (objConfig.position) {
                    mesh.position.set(...objConfig.position);
                }

                // 设置名称
                mesh.name = objConfig.name;

                // 添加到场景
                this.addObject(mesh);

                // 如果这个对象需要UV动画，添加到动画列表
                if (this.animations.has(objConfig.name)) {
                    const animation = this.animations.get(objConfig.name)!;
                    animation.mesh = mesh;
                    this.applyMaterialConfig(animation);
                }

                console.log(`[UVAnimationScript] Created object: ${objConfig.name}`);
            }

            // 创建灯光
            if (this.sceneCreationConfig.lights) {
                for (const lightConfig of this.sceneCreationConfig.lights) {
                    let light: THREE.Light;

                    switch (lightConfig.type) {
                        case 'ambient':
                            light = new THREE.AmbientLight(
                                lightConfig.color || 0x404040,
                                lightConfig.intensity || 0.5
                            );
                            break;

                        case 'directional':
                            light = new THREE.DirectionalLight(
                                lightConfig.color || 0xffffff,
                                lightConfig.intensity || 1
                            );
                            if (lightConfig.direction) {
                                light.position.set(...lightConfig.direction);
                            } else {
                                light.position.set(5, 10, 7); // 默认方向
                            }
                            light.castShadow = true;
                            break;

                        case 'point':
                            light = new THREE.PointLight(
                                lightConfig.color || 0xffffff,
                                lightConfig.intensity || 1,
                                100, // 距离
                                1    // 衰减
                            );
                            if (lightConfig.position) {
                                light.position.set(...lightConfig.position);
                            } else {
                                light.position.set(0, 5, 0); // 默认位置
                            }
                            light.castShadow = true;
                            break;

                        case 'spot':
                            light = new THREE.SpotLight(
                                lightConfig.color || 0xffffff,
                                lightConfig.intensity || 1,
                                100,  // 距离
                                Math.PI / 4, // 角度
                                0.5,  // 衰减
                                1     // 聚光灯指数
                            );
                            if (lightConfig.position) {
                                light.position.set(...lightConfig.position);
                            } else {
                                light.position.set(0, 10, 0); // 默认位置
                            }
                            // 修复SpotLight target设置问题
                            if (lightConfig.direction) {
                                // 创建一个新的Object3D作为target
                                const targetObject = new THREE.Object3D();
                                targetObject.position.set(...lightConfig.direction);
                                this.addObject(targetObject);
                                (light as THREE.SpotLight).target = targetObject;
                            }
                            light.castShadow = true;
                            break;

                        default:
                            console.warn(`[UVAnimationScript] Unsupported light type: ${lightConfig.type}`);
                            continue;
                    }

                    light.name = `${lightConfig.type}Light`;
                    this.addObject(light);
                    console.log(`[UVAnimationScript] Created light: ${lightConfig.type}`);
                }
            }

            // 添加标题文字（如果在主场景中）
            if (this.scene.name === 'main') {
                this.addTitleElement();
            }
        } catch (error) {
            console.error('[UVAnimationScript] Failed to create scene objects:', error);
        }
    }

    /**
     * 添加标题元素
     */
    private addTitleElement(): void {
        const title = document.createElement('div');
        title.innerHTML = `
            <h1 style="color: white; text-align: center; margin-top: 20px;">UV动画测试 - 镂空贴图效果</h1>
            <p style="color: #ccc; text-align: center;">黑色部分形成镂空效果，可以透过看到背景</p>
            <p style="color: #ccc; text-align: center;">常用于制作树叶、栅栏、装饰图案等</p>
            <p style="color: #ccc; text-align: center;">使用鼠标拖拽旋转视角，滚动缩放</p>
        `;
        title.style.position = 'absolute';
        title.style.top = '0';
        title.style.width = '100%';
        title.style.zIndex = '100';
        title.style.pointerEvents = 'none'; // 不拦截鼠标事件
        document.body.appendChild(title);
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
     * 初始化脚本
     */
    public override start(): void {
        super.start?.();

        // 创建场景对象
        this.createSceneObjects().then(() => {
            // 查找并初始化所有动画目标
            this.animations.forEach((animation, targetName) => {
                // 如果mesh还没有设置（可能是在createSceneObjects中设置的）
                if (!animation.mesh) {
                    const object = this.scene.getObjectByName(targetName);
                    if (object && object instanceof THREE.Mesh) {
                        animation.mesh = object as THREE.Mesh;
                        // 应用材质配置
                        this.applyMaterialConfig(animation);
                        console.log(`[UVAnimationScript] Found target mesh: ${targetName}`);
                    } else {
                        console.warn(`[UVAnimationScript] Target mesh not found: ${targetName}`);
                    }
                }
            });
        });
    }

    /**
     * 应用材质配置
     * @param animation 动画数据
     */
    private applyMaterialConfig(animation: {
        mesh: THREE.Mesh;
        config: Required<UVAnimationConfig>;
    }): void {
        const material = animation.mesh.material;

        const applyToMaterial = (mat: THREE.Material) => {
            // 设置透明度
            if (animation.config.transparent !== undefined) {
                mat.transparent = animation.config.transparent;
            }

            if (animation.config.opacity !== undefined) {
                mat.opacity = animation.config.opacity;
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
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);

        this.animations.forEach(animation => {
            // 检查动画是否启用且mesh存在
            if (!animation.config.enabled || !animation.mesh) return;

            // 更新偏移
            animation.offset.x += animation.config.scrollSpeedX! * deltaTime;
            animation.offset.y += animation.config.scrollSpeedY! * deltaTime;

            // 更新缩放
            animation.scale.x += animation.config.scaleSpeedX! * deltaTime;
            animation.scale.y += animation.config.scaleSpeedY! * deltaTime;

            // 更新旋转
            animation.rotation += animation.config.rotationSpeed! * deltaTime;

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

    /**
     * 销毁脚本
     */
    public override destroy(): void {
        super.destroy?.();

        // 移除标题元素
        const titles = document.querySelectorAll('div h1, div p');
        titles.forEach(element => {
            if (element.textContent?.includes('UV动画测试')) {
                element.parentElement?.remove();
            }
        });

        // 重置所有材质的UV变换
        this.animations.forEach(animation => {
            if (animation.mesh && animation.mesh.material) {
                this.resetMaterialUV(animation.mesh.material);
            }
        });

        // 销毁纹理
        if (this.sharedTexture) {
            this.sharedTexture.dispose();
        }
        if (this.alphaMap) {
            this.alphaMap.dispose();
        }

        this.animations.clear();
    }
}
