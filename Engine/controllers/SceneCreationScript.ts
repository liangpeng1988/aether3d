import { ScriptBase } from "../core/ScriptBase";
import { THREE } from "../core/global";

/**
 * 场景对象配置接口
 */
export interface SceneObjectConfig {
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
}

/**
 * 灯光配置接口
 */
export interface LightConfig {
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
}

/**
 * 场景创建配置接口
 */
export interface SceneCreationConfig {
    /** 纹理URL */
    textureUrl: string;
    /** 对象配置数组 */
    objects: SceneObjectConfig[];
    /** 是否启用渐变透明效果 */
    enableGradientAlpha?: boolean;
    /** 渐变方向 ('bottomToTop' | 'topToBottom' | 'leftToRight' | 'rightToLeft') */
    gradientDirection?: 'bottomToTop' | 'topToBottom' | 'leftToRight' | 'rightToLeft';
    /** 外部alpha贴图URL（如果提供，将优先使用） */
    alphaMapUrl?: string;
    /** 灯光配置 */
    lights?: LightConfig[];
    /** 纹理重复次数，默认为[2, 2] */
    textureRepeat?: [number, number];
}

/**
 * 场景创建脚本
 * 用于创建场景对象、灯光和纹理
 */
export class SceneCreationScript extends ScriptBase {
    private sceneCreationConfig: SceneCreationConfig | null = null;
    private sharedTexture: THREE.Texture | null = null;
    private alphaMap: THREE.Texture | null = null;
    private createdObjects: THREE.Object3D[] = [];

    constructor(config?: SceneCreationConfig) {
        super();
        this.name = "SceneCreationScript";

        if (config) {
            this.sceneCreationConfig = config;
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
                    // 设置纹理包裹模式为重复，实现无缝效果
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.anisotropy = 16; // 设置各向异性过滤以提高纹理质量
                    
                    // 启用透明贴图支持
                    texture.format = THREE.RGBAFormat;
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error('[SceneCreationScript] 纹理加载失败:', error);
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
                    console.error('[SceneCreationScript] Alpha贴图加载失败:', error);
                    // 如果外部贴图加载失败，返回null，后续会使用程序生成的渐变贴图
                    resolve(null);
                }
            );
        });
    }

    /**
     * 创建材质
     */
    private async createMaterial(): Promise<THREE.MeshStandardMaterial> {
        if (!this.sceneCreationConfig) {
            throw new Error('[SceneCreationScript] Scene creation config is not set');
        }

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
                        console.warn('[SceneCreationScript] 外部alpha贴图加载失败，使用程序生成的渐变贴图');
                        this.alphaMap = this.createGradientAlphaMap(this.sceneCreationConfig.gradientDirection);
                    }
                } else {
                    console.log('[SceneCreationScript] 成功加载外部alpha贴图');
                }
            } catch (error) {
                // 如果加载失败且启用了渐变透明效果，创建程序化渐变贴图
                if (this.sceneCreationConfig.enableGradientAlpha) {
                    console.warn('[SceneCreationScript] 外部alpha贴图加载失败，使用程序生成的渐变贴图:', error);
                    this.alphaMap = this.createGradientAlphaMap(this.sceneCreationConfig.gradientDirection);
                }
            }
        } else if (this.sceneCreationConfig.enableGradientAlpha) {
            // 如果启用渐变透明效果，创建程序化渐变贴图
            this.alphaMap = this.createGradientAlphaMap(this.sceneCreationConfig.gradientDirection);
        }
        
        // 创建材质
        const material = new THREE.MeshStandardMaterial({
            color: '#fff300',         // 材质基础颜色
            transparent: true,        // 开启透明混合
            map: this.sharedTexture,  // 绑定基础纹理
            alphaMap: this.alphaMap || undefined, // 绑定alpha贴图
            opacity: 1,               // 全局透明度
            depthWrite: false,        // 透明物体关闭深度写入
            blending: THREE.AdditiveBlending // 发光效果混合
        });
        
        // 如果有共享纹理，设置其重复属性以实现无缝效果
        if (this.sharedTexture && this.sceneCreationConfig) {
            // 使用配置中的重复设置，如果没有配置则默认为[2, 2]
            const repeat = this.sceneCreationConfig.textureRepeat || [2, 2];
            this.sharedTexture.repeat.set(repeat[0], repeat[1]);
        }

        return material;
    }

    /**
     * 创建场景对象
     */
    private async createSceneObjects(material: THREE.MeshStandardMaterial): Promise<void> {
        if (!this.sceneCreationConfig) return;
        
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
                    console.warn(`[SceneCreationScript] Unsupported object type: ${objConfig.type}`);
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
            this.createdObjects.push(mesh);
            
            console.log(`[SceneCreationScript] Created object: ${objConfig.name}`);
        }
    }

    /**
     * 创建灯光
     */
    private createLights(): void {
        if (!this.sceneCreationConfig || !this.sceneCreationConfig.lights) return;
        
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
                    if (lightConfig.direction) {
                        (light as THREE.SpotLight).target.position.set(...lightConfig.direction);
                    }
                    light.castShadow = true;
                    break;
                    
                default:
                    console.warn(`[SceneCreationScript] Unsupported light type: ${lightConfig.type}`);
                    continue;
            }
            
            light.name = `${lightConfig.type}Light`;
            this.addObject(light);
            this.createdObjects.push(light);
            console.log(`[SceneCreationScript] Created light: ${lightConfig.type}`);
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
        this.createdObjects.push(title as any);
    }

    /**
     * 初始化脚本
     */
    public override start(): void {
        super.start?.();

        // 创建场景内容
        this.createSceneContent();
    }

    /**
     * 创建场景内容
     */
    private async createSceneContent(): Promise<void> {
        if (!this.sceneCreationConfig || !this.renderer) return;
        
        try {
            // 创建材质
            const material = await this.createMaterial();
            
            // 创建对象
            await this.createSceneObjects(material);
            
            // 创建灯光
            this.createLights();
            
            // 添加标题文字（如果在主场景中）
            if (this.scene.name === 'main') {
                this.addTitleElement();
            }
        } catch (error) {
            console.error('[SceneCreationScript] Failed to create scene content:', error);
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

        // 销毁纹理
        if (this.sharedTexture) {
            this.sharedTexture.dispose();
        }
        if (this.alphaMap) {
            this.alphaMap.dispose();
        }

        this.createdObjects = [];
    }
}