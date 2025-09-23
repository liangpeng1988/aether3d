import { ScriptBase } from "../core/ScriptBase";
import { THREE, CSS2DObject } from "../core/global.ts";

/**
 * 场景灯光配置接口
 */
export interface SceneLightingConfig {
    /** 是否启用环境光 */
    enableAmbientLight?: boolean;
    /** 环境光颜色 */
    ambientLightColor?: number;
    /** 环境光地面颜色 */
    ambientLightGroundColor?: number;
    /** 环境光强度 */
    ambientLightIntensity?: number;
    
    /** 是否启用聚光灯 */
    enableSpotLight?: boolean;
    /** 聚光灯颜色 */
    spotLightColor?: number;
    /** 聚光灯强度 */
    spotLightIntensity?: number;
    /** 聚光灯位置 */
    spotLightPosition?: [number, number, number];
    /** 聚光灯目标位置 */
    spotLightTarget?: [number, number, number];
    /** 聚光灯角度 */
    spotLightAngle?: number;
    /** 聚光灯半影 */
    spotLightPenumbra?: number;
    /** 聚光灯衰减 */
    spotLightDecay?: number;
    /** 聚光灯距离 */
    spotLightDistance?: number;
    /** 聚光灯贴图 */
    spotLightMap?: string;
    
    /** 聚光灯阴影设置 */
    spotLightShadow?: {
        enabled?: boolean;
        mapSizeWidth?: number;
        mapSizeHeight?: number;
        cameraNear?: number;
        cameraFar?: number;
        focus?: number;
    };
    
    /** 是否显示灯光辅助器 */
    showLightHelpers?: boolean;
    
    /** 是否显示标签 */
    showLabels?: boolean;
    /** 标签文本 */
    labelContent?: string;
    /** 标签是否可点击 */
    clickableLabels?: boolean;
}

/**
 * 场景灯光脚本类
 * 用于在场景中添加和控制环境光和聚光灯
 */
export class SceneLightingScript extends ScriptBase {
    name = 'SceneLightingScript';

    // 灯光相关属性
    private config: Required<SceneLightingConfig>;
    private ambientLight: THREE.HemisphereLight | null = null;
    private spotLight: THREE.SpotLight | null = null;
    private spotLightHelper: THREE.SpotLightHelper | null = null;
    private textures: { [key: string]: THREE.Texture | null } = { none: null };
    private label: CSS2DObject | null = null;
    private labelElement: HTMLElement | null = null;
    private isLightEnabled: boolean = true;

    constructor(options?: SceneLightingConfig) {
        super();

        this.config = {
            enableAmbientLight: true,
            ambientLightColor: 0xffffff,
            ambientLightGroundColor: 0x8d8d8d,
            ambientLightIntensity: 4,
            
            enableSpotLight: true,
            spotLightColor: 0xffffff,
            spotLightIntensity: 100,
            spotLightPosition: [2.5, 5, 2.5],
            spotLightTarget: [0, 0, 0],  // 默认聚焦在地面中心
            spotLightAngle: Math.PI / 2,
            spotLightPenumbra: 1,
            spotLightDecay: 2,
            spotLightDistance: 0,
            spotLightMap: 'colors.jpg',
            
            spotLightShadow: {
                enabled: true,
                mapSizeWidth: 2024,
                mapSizeHeight: 2024,
                cameraNear: 1,
                cameraFar: 0,
                focus: 0
            },
            
            showLightHelpers: true,
            showLabels: true,
            labelContent: '灯光',
            clickableLabels: true,
            ...options
        };
    }

    /**
     * 脚本初始化时调用
     */
    public override start(): void {
        super.start?.();
        
        // 加载纹理
        this.loadTextures();
        
        // 创建环境光
        if (this.config.enableAmbientLight) {
            this.createAmbientLight();
        }
        
        // 创建聚光灯
        if (this.config.enableSpotLight) {
            this.createSpotLight();
        }
        
        // 创建标签
        if (this.config.showLabels) {
            this.createLabel();
        }
    }

    /**
     * 每帧更新时调用
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
        
        // 更新灯光辅助器
        if (this.spotLightHelper) {
            this.spotLightHelper.update();
        }
        
        // 更新标签位置
        if (this.label && this.spotLight) {
            this.label.position.copy(this.spotLight.position);
        }
    }

    /**
     * 加载纹理
     */
    private loadTextures(): void {
        try {
            const loader = new THREE.TextureLoader().setPath('/textures/');
            const filenames = ['colors.png','disturb.jpg','uv_grid_opengl.jpg'];

            for (let i = 0; i < filenames.length; i++) {
                const filename = filenames[i];
                const texture = loader.load(filename);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = false;
                texture.colorSpace = THREE.SRGBColorSpace;
                this.textures[filename] = texture;
            }
        } catch (error) {
            console.error('[SceneLightingScript] 加载纹理失败:', error);
        }
    }

    /**
     * 创建环境光
     */
    private createAmbientLight(): void {
        try {
            if (this.scene) {
                this.ambientLight = new THREE.HemisphereLight(
                    this.config.ambientLightColor,
                    this.config.ambientLightGroundColor,
                    this.config.ambientLightIntensity
                );
                this.scene.add(this.ambientLight);
            }
        } catch (error) {
            console.error('[SceneLightingScript] 创建环境光失败:', error);
        }
    }

    /**
     * 创建聚光灯
     */
    private createSpotLight(): void {
        try {
            if (this.scene) {
                this.spotLight = new THREE.SpotLight(
                    this.config.spotLightColor,
                    this.config.spotLightIntensity
                );
                
                // 设置位置
                this.spotLight.position.set(
                    this.config.spotLightPosition[0],
                    this.config.spotLightPosition[1],
                    this.config.spotLightPosition[2]
                );
                
                // 设置聚光灯参数
                this.spotLight.angle = this.config.spotLightAngle;
                this.spotLight.penumbra = this.config.spotLightPenumbra;
                this.spotLight.decay = this.config.spotLightDecay;
                this.spotLight.distance = this.config.spotLightDistance;
                
                // 设置聚光灯贴图
                if (this.config.spotLightMap && this.textures[this.config.spotLightMap]) {
                    this.spotLight.map = this.textures[this.config.spotLightMap];
                }
                
                // 设置阴影
                if (this.config.spotLightShadow?.enabled) {
                    this.spotLight.castShadow = true;
                    this.spotLight.shadow.mapSize.width = this.config.spotLightShadow.mapSizeWidth || 2024;
                    this.spotLight.shadow.mapSize.height = this.config.spotLightShadow.mapSizeHeight || 2024;
                    this.spotLight.shadow.camera.near = this.config.spotLightShadow.cameraNear || 1;
                    this.spotLight.shadow.camera.far = this.config.spotLightShadow.cameraFar || 0;
                    this.spotLight.shadow.focus = this.config.spotLightShadow.focus || 0;
                }
                
                // 添加目标对象，使灯光面向指定位置
                const targetObject = new THREE.Object3D();
                targetObject.position.set(
                    this.config.spotLightTarget[0],
                    this.config.spotLightTarget[1],
                    this.config.spotLightTarget[2]
                );
                this.scene.add(targetObject);
                this.spotLight.target = targetObject;
                
                this.scene.add(this.spotLight);
                
                // 创建灯光辅助器
                if (this.config.showLightHelpers && this.spotLight) {
                    this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
                    this.scene.add(this.spotLightHelper);
                }
            }
        } catch (error) {
            console.error('[SceneLightingScript] 创建聚光灯失败:', error);
        }
    }

    /**
     * 创建标签
     */
    private createLabel(): void {
        try {
            if (this.spotLight && this.scene) {
                // 创建标签元素
                this.labelElement = document.createElement('div');
                this.labelElement.className = 'scene-light-label';
                this.labelElement.textContent = this.config.labelContent || '灯光';
                this.labelElement.style.padding = '8px 12px';
                this.labelElement.style.background = 'rgba(0, 0, 0, 0.85)';
                this.labelElement.style.color = '#ffffff';
                this.labelElement.style.borderRadius = '8px';
                this.labelElement.style.fontSize = '14px';
                this.labelElement.style.fontFamily = 'Arial, "Microsoft YaHei", sans-serif';
                this.labelElement.style.fontWeight = '500';
                this.labelElement.style.whiteSpace = 'nowrap';
                this.labelElement.style.userSelect = 'none';
                this.labelElement.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                this.labelElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                this.labelElement.style.backdropFilter = 'blur(8px)';
                this.labelElement.style.pointerEvents = this.config.clickableLabels ? 'auto' : 'none';
                this.labelElement.style.zIndex = '1000';
                this.labelElement.style.cursor = this.config.clickableLabels ? 'pointer' : 'default';

                // 添加悬停效果
                if (this.config.clickableLabels) {
                    this.labelElement.addEventListener('mouseenter', () => {
                        this.labelElement!.style.transform = 'scale(1.05)';
                        this.labelElement!.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5)';
                    });

                    this.labelElement.addEventListener('mouseleave', () => {
                        this.labelElement!.style.transform = 'scale(1)';
                        this.labelElement!.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                    });

                    // 添加点击事件
                    this.labelElement.addEventListener('click', (event) => {
                        event.stopPropagation();
                        this.toggleLight();
                    });
                }

                // 创建CSS2DObject
                this.label = new CSS2DObject(this.labelElement);
                this.label.position.copy(this.spotLight.position);
                
                // 将标签添加到场景中
                this.scene.add(this.label);
            }
        } catch (error) {
            console.error('[SceneLightingScript] 创建标签失败:', error);
        }
    }

    /**
     * 更新环境光配置
     */
    public updateAmbientLightConfig(newConfig: Partial<{
        color: number;
        groundColor: number;
        intensity: number;
    }>): void {
        if (!this.ambientLight) return;
        
        if (newConfig.color !== undefined) {
            this.ambientLight.color.set(newConfig.color);
        }
        
        if (newConfig.groundColor !== undefined) {
            this.ambientLight.groundColor.set(newConfig.groundColor);
        }
        
        if (newConfig.intensity !== undefined) {
            this.ambientLight.intensity = newConfig.intensity;
        }
    }

    /**
     * 更新聚光灯目标位置
     */
    public updateSpotLightTarget(target: [number, number, number]): void {
        if (this.spotLight) {
            (this.spotLight.target as THREE.Object3D).position.set(target[0], target[1], target[2]);
        }
    }

    /**
     * 更新聚光灯配置
     */
    public updateSpotLightConfig(newConfig: Partial<{
        color: number;
        intensity: number;
        position: [number, number, number];
        target: [number, number, number];
        angle: number;
        penumbra: number;
        decay: number;
        distance: number;
    }>): void {
        if (!this.spotLight) return;
        
        if (newConfig.color !== undefined) {
            this.spotLight.color.set(newConfig.color);
        }
        
        if (newConfig.intensity !== undefined) {
            this.spotLight.intensity = newConfig.intensity;
        }
        
        if (newConfig.position !== undefined) {
            this.spotLight.position.set(
                newConfig.position[0],
                newConfig.position[1],
                newConfig.position[2]
            );
            // 更新标签位置
            if (this.label) {
                this.label.position.copy(this.spotLight.position);
            }
        }
        
        if (newConfig.target !== undefined) {
            (this.spotLight.target as THREE.Object3D).position.set(
                newConfig.target[0],
                newConfig.target[1],
                newConfig.target[2]
            );
        }
        
        if (newConfig.angle !== undefined) {
            this.spotLight.angle = newConfig.angle;
        }
        
        if (newConfig.penumbra !== undefined) {
            this.spotLight.penumbra = newConfig.penumbra;
        }
        
        if (newConfig.decay !== undefined) {
            this.spotLight.decay = newConfig.decay;
        }
        
        if (newConfig.distance !== undefined) {
            this.spotLight.distance = newConfig.distance;
        }
    }

    /**
     * 更新聚光灯阴影配置
     */
    public updateSpotLightShadowConfig(newConfig: Partial<{
        enabled: boolean;
        mapSizeWidth: number;
        mapSizeHeight: number;
        cameraNear: number;
        cameraFar: number;
        focus: number;
    }>): void {
        if (!this.spotLight) return;
        
        if (newConfig.enabled !== undefined) {
            this.spotLight.castShadow = newConfig.enabled;
        }
        
        if (newConfig.mapSizeWidth !== undefined) {
            this.spotLight.shadow.mapSize.width = newConfig.mapSizeWidth;
        }
        
        if (newConfig.mapSizeHeight !== undefined) {
            this.spotLight.shadow.mapSize.height = newConfig.mapSizeHeight;
        }
        
        if (newConfig.cameraNear !== undefined) {
            this.spotLight.shadow.camera.near = newConfig.cameraNear;
        }
        
        if (newConfig.cameraFar !== undefined) {
            this.spotLight.shadow.camera.far = newConfig.cameraFar;
        }
        
        if (newConfig.focus !== undefined) {
            this.spotLight.shadow.focus = newConfig.focus;
        }
    }

    /**
     * 设置标签内容
     */
    public setLabelContent(content: string): void {
        this.config.labelContent = content;
        if (this.labelElement) {
            this.labelElement.textContent = content;
        }
    }

    /**
     * 显示/隐藏标签
     */
    public setShowLabels(show: boolean): void {
        this.config.showLabels = show;
        if (this.label) {
            this.label.visible = show;
        }
    }

    /**
     * 设置标签是否可点击
     */
    public setClickableLabels(clickable: boolean): void {
        this.config.clickableLabels = clickable;
        if (this.labelElement) {
            this.labelElement.style.pointerEvents = clickable ? 'auto' : 'none';
            this.labelElement.style.cursor = clickable ? 'pointer' : 'default';
        }
    }

    /**
     * 设置聚光灯聚焦到特定对象
     */
    public focusSpotLightOn(object: THREE.Object3D): void {
        if (this.spotLight) {
            this.spotLight.target = object;
            // 更新辅助器
            if (this.spotLightHelper) {
                this.spotLightHelper.update();
            }
        }
    }

    /**
     * 获取聚光灯对象
     */
    public getSpotLight(): THREE.SpotLight | null {
        return this.spotLight;
    }

    /**
     * 获取聚光灯辅助器对象
     */
    public getSpotLightHelper(): THREE.SpotLightHelper | null {
        return this.spotLightHelper;
    }

    /**
     * 启用或禁用环境光
     */
    public setAmbientLightEnabled(enabled: boolean): void {
        if (enabled && !this.ambientLight) {
            this.createAmbientLight();
        } else if (!enabled && this.ambientLight) {
            if (this.scene) {
                this.scene.remove(this.ambientLight);
            }
            this.ambientLight = null;
        }
    }

    /**
     * 启用或禁用聚光灯
     */
    public setSpotLightEnabled(enabled: boolean): void {
        if (enabled && !this.spotLight) {
            this.createSpotLight();
        } else if (!enabled && this.spotLight) {
            if (this.scene) {
                this.scene.remove(this.spotLight);
                if (this.spotLightHelper) {
                    this.scene.remove(this.spotLightHelper);
                    this.spotLightHelper = null;
                }
                if (this.label) {
                    this.scene.remove(this.label);
                    this.label = null;
                    this.labelElement = null;
                }
            }
            this.spotLight = null;
        }
        
        // 更新灯光状态
        this.isLightEnabled = enabled;
        this.updateLabelStyle();
    }

    /**
     * 获取环境光对象
     */
    public getAmbientLight(): THREE.HemisphereLight | null {
        return this.ambientLight;
    }

    /**
     * 切换灯光开关
     */
    public toggleLight(): void {
        this.isLightEnabled = !this.isLightEnabled;
        
        // 控制环境光
        if (this.ambientLight) {
            this.ambientLight.visible = this.isLightEnabled;
        }
        
        // 控制聚光灯
        if (this.spotLight) {
            this.spotLight.visible = this.isLightEnabled;
            this.spotLight.intensity = this.isLightEnabled ? this.config.spotLightIntensity : 0;
        }
        
        // 控制辅助器
        if (this.spotLightHelper) {
            this.spotLightHelper.visible = this.isLightEnabled;
        }
        
        // 更新标签样式
        this.updateLabelStyle();
        
        console.log(`[SceneLightingScript] 灯光已${this.isLightEnabled ? '开启' : '关闭'}`);
    }

    /**
     * 更新标签样式以反映灯光状态
     */
    private updateLabelStyle(): void {
        if (this.labelElement) {
            // 根据灯光状态更新背景色
            if (this.isLightEnabled) {
                this.labelElement.style.background = 'rgba(0, 0, 0, 0.85)';
                this.labelElement.style.border = '1px solid rgba(255, 255, 255, 0.15)';
            } else {
                this.labelElement.style.background = 'rgba(100, 100, 100, 0.85)';
                this.labelElement.style.border = '1px solid rgba(150, 150, 150, 0.15)';
            }
        }
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();
        
        // 清理环境光
        if (this.ambientLight && this.scene) {
            this.scene.remove(this.ambientLight);
        }
        
        // 清理聚光灯
        if (this.spotLight && this.scene) {
            // 清理目标对象
            if (this.spotLight.target && this.spotLight.target !== this.scene) {
                this.scene.remove(this.spotLight.target);
            }
            this.scene.remove(this.spotLight);
        }
        
        // 清理聚光灯辅助器
        if (this.spotLightHelper && this.scene) {
            this.scene.remove(this.spotLightHelper);
        }
        
        // 清理标签
        if (this.label && this.scene) {
            this.scene.remove(this.label);
        }
        
        // 清理纹理
        for (const key in this.textures) {
            if (this.textures[key]) {
                this.textures[key]?.dispose();
            }
        }
        
        this.ambientLight = null;
        this.spotLight = null;
        this.spotLightHelper = null;
        this.label = null;
        this.labelElement = null;
        this.textures = { none: null };
    }
}