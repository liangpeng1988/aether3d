import { ScriptBase } from "../core/ScriptBase.ts";
import { THREE, CSS2DObject, TWEEN, TweenGroup } from "../core/global.ts";

/**
 * 场景灯光配置接口
 */
export interface SpotlightConfig {
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
    /** 标签图标URL */
    labelIcon?: string;
    /** 是否启用强度缓动动画 */
    enableTweenAnimation?: boolean;
    /** 强度缓动动画持续时间(毫秒) */
    animationDuration?: number;
    /** 外部传入的标签DOM元素 */
    externalLabelElement?: HTMLElement;
    /** 标签开关回调函数 */
    onToggle?: (isEnabled: boolean, script: SpotlightScript) => void;
}

/**
 * 场景灯光脚本类
 * 用于在场景中添加和控制环境光和聚光灯
 */
export class SpotlightScript extends ScriptBase {
    name = 'SpotlightScript';
    // 灯光相关属性
    private config: SpotlightConfig;
    private ambientLight: THREE.HemisphereLight | null = null;
    private spotLight: THREE.SpotLight | null = null;
    private spotLightHelper: THREE.SpotLightHelper | null = null;
    private textures: { [key: string]: THREE.Texture | null } = { none: null };
    private label: CSS2DObject | null = null;
    private labelElement: HTMLElement | null = null;
    private isLightEnabled: boolean = true;
    private isTweenEnabled: boolean = true;
    private intensityTween: TWEEN.Tween | null = null;
    private currentIntensity: number = 0;
    private targetIntensity: number = 0;

    // 性能优化：缓存DOM元素引用
    private iconElement: HTMLImageElement | null = null;
    private textElement: HTMLElement | null = null;
    
    // 性能优化：位置变化检测
    private lastPosition: THREE.Vector3 = new THREE.Vector3();
    private positionUpdateThreshold: number = 0.001; // 位置变化阈值
    
    // 性能优化：减少更新频率
    private frameCount: number = 0;
    private updateInterval: number = 0.02; // 每2帧更新一次标签位置

    // 标签开关回调函数
    private onToggleCallback?: (isEnabled: boolean, script: SpotlightScript) => void;

    constructor(options?: SpotlightConfig) {
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
            spotLightMap: 'uv_grid_opengl.jpg',
            
            spotLightShadow: {
                enabled: true,
                mapSizeWidth: 512,
                mapSizeHeight: 512,
                cameraNear: 1,
                cameraFar: 0,
                focus: 0
            },
            
            showLightHelpers: true,
            showLabels: true,
            labelContent: '灯光',
            clickableLabels: true,
            labelIcon: 'https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG242ac23827c6159d8038b7d4dbbc8937.png',
            enableTweenAnimation: true,
            animationDuration: 500,
            ...options
        };

        // 保存标签开关回调函数
        this.onToggleCallback = options?.onToggle;

        // 初始化动画相关设置
        this.isTweenEnabled = this.config.enableTweenAnimation || false;

        // 默认情况下灯光是关闭的
        this.isLightEnabled = false;
        this.currentIntensity = 0;
        this.targetIntensity = this.config.spotLightIntensity || 100;
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
            // 确保灯光初始化为关闭状态
            if (this.spotLight) {
                this.spotLight.visible = false;
                this.spotLight.intensity = 0;
            }
        }
        
        // 创建标签
        if (this.config.showLabels) {
            this.createLabel();
            // 更新标签样式以反映初始关闭状态
            this.updateLabelStyle();
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
        
        // 性能优化：减少标签位置更新频率
        this.frameCount++;
        if (this.frameCount >= this.updateInterval) {
            this.frameCount = 0;
            this.updateLabelPosition();
        }
    }
    
    /**
     * 性能优化：智能标签位置更新
     */
    private updateLabelPosition(): void {
        if (this.label && this.spotLight) {
            const currentPos = this.spotLight.position;
            if (this.lastPosition.distanceTo(currentPos) > this.positionUpdateThreshold) {
                this.label.position.set(currentPos.x, currentPos.y, currentPos.z);
                this.lastPosition.copy(currentPos);
            }
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
                const position = this.config.spotLightPosition || [2.5, 5, 2.5];
                this.spotLight.position.set(
                    position[0],
                    position[1],
                    position[2]
                );
                
                // 设置聚光灯参数
                this.spotLight.angle = this.config.spotLightAngle || Math.PI / 2;
                this.spotLight.penumbra = this.config.spotLightPenumbra || 1;
                this.spotLight.decay = this.config.spotLightDecay || 2;
                this.spotLight.distance = this.config.spotLightDistance || 0;
                
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
                const target = this.config.spotLightTarget || [0, 0, 0];
                targetObject.position.set(
                    target[0],
                    target[1],
                    target[2]
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
                // 检查是否有外部传入的标签元素
                if (this.config.externalLabelElement) {
                    console.log('[SpotlightScript] 使用外部标签元素');
                    this.labelElement = this.config.externalLabelElement;
                    // 使用外部元素创建标签
                    this.createLabelFromExternalElement();
                } else {
                    console.log('[SpotlightScript] 使用内部创建标签元素');
                    // 内部创建标签元素
                    this.createInternalLabelElement();
                }

                // 创建CSS2DObject
                if (this.labelElement) {
                    console.log('[SpotlightScript] 创建CSS2DObject');
                    this.label = new CSS2DObject(this.labelElement);
                    this.label.position.copy(this.spotLight.position);

                    // 将标签添加到场景中
                    this.scene.add(this.label);
                    console.log('[SpotlightScript] 标签添加到场景中');

                    // 初始化标签状态
                    this.updateLabelStyle();
                } else {
                    console.error('[SpotlightScript] labelElement 创建失败');
                }
            } else {
                console.error('[SpotlightScript] spotLight 或 scene 不存在，无法创建标签');
            }
        } catch (error) {
            console.error('[SpotlightScript] 创建标签失败:', error);
        }
    }
    
    /**
     * 使用外部元素创建标签
     */
    private createLabelFromExternalElement(): void {
        if (!this.labelElement) return;
        
        // 在外部元素中查找或创建图标和文本元素
        let iconElement = this.labelElement.querySelector('.spotlight-icon') as HTMLImageElement;
        let textElement = this.labelElement.querySelector('.spotlight-text') as HTMLElement;
        
        // 如果外部元素中没有这些元素，则创建它们
        if (!iconElement) {
            iconElement = document.createElement('img');
            iconElement.className = 'spotlight-icon';
            this.labelElement.appendChild(iconElement);
        }
        
        if (!textElement) {
            textElement = document.createElement('span');
            textElement.className = 'spotlight-text';
            textElement.textContent = this.config.labelContent || '灯光';
            this.labelElement.appendChild(textElement);
        }
        
        // 缓存DOM元素引用
        this.iconElement = iconElement;
        this.textElement = textElement;
        
        // 确保外部元素有基础的 CSS 类名
        if (!this.labelElement.classList.contains('spotlight-label')) {
            this.labelElement.classList.add('spotlight-label');
        }
        
        // 添加点击事件
        if (this.config.clickableLabels) {
            this.labelElement.addEventListener('click', (event) => {
                console.log('[SpotlightScript] 标签被点击（外部元素）');
                event.stopPropagation();
                this.toggleLight();
            });
        }
    }

    /**
     * 内部创建标签元素
     */
    private createInternalLabelElement(): void {
        console.log('[SpotlightScript] 开始创建内部标签元素');
        console.log('[SpotlightScript] clickableLabels 配置:', this.config.clickableLabels);
        
        // 创建标签元素
        this.labelElement = document.createElement('div');
        this.labelElement.className = 'spotlight-label';
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
        this.labelElement.style.zIndex = '1000';
        this.labelElement.style.display = 'flex';
        this.labelElement.style.alignItems = 'center';
        this.labelElement.style.gap = '8px';
        // this.labelElement.style.transition = 'all 0.01s ease';

        // 创建图标元素
        const iconElement = document.createElement('img');
        iconElement.className = 'spotlight-icon';
        iconElement.style.width = '16px';
        iconElement.style.height = '16px';
        iconElement.style.transition = 'opacity 0.3s ease';
        if (this.config.labelIcon) {
            iconElement.src = this.config.labelIcon;
        }

        // 创建文本元素
        const textElement = document.createElement('span');
        textElement.className = 'spotlight-text';
        textElement.textContent = this.config.labelContent || '灯光';

        // 性能优化：缓存DOM元素引用
        this.iconElement = iconElement;
        this.textElement = textElement;

        // 将图标和文本添加到标签元素中
        this.labelElement.appendChild(iconElement);
        this.labelElement.appendChild(textElement);

        // 添加点击事件
        if (this.config.clickableLabels) {
            console.log('[SpotlightScript] 正在添加点击事件监听器');
            this.labelElement.addEventListener('click', (event) => {
                console.log('[SpotlightScript] 标签被点击（内部元素）');
                event.stopPropagation();
                this.toggleLight();
            });
            
            // 设置点击相关样式
            this.labelElement.style.pointerEvents = 'auto';
            this.labelElement.style.cursor = 'pointer';
            
            // 添加悬停效果
            this.labelElement.addEventListener('mouseenter', () => {
                if (this.labelElement) {
                    // this.labelElement.style.transform = 'scale(1.05)';
                    this.labelElement.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5)';
                }
            });

            this.labelElement.addEventListener('mouseleave', () => {
                if (this.labelElement) {
                    // this.labelElement.style.transform = 'scale(1)';
                    this.labelElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
                }
            });
            
            console.log('[SpotlightScript] 点击事件监听器添加完成');
        } else {
            console.log('[SpotlightScript] clickableLabels 为 false，跳过添加点击事件');
            this.labelElement.style.pointerEvents = 'none';
            this.labelElement.style.cursor = 'default';
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
        // 性能优化：使用缓存的DOM元素引用
        if (this.textElement) {
            this.textElement.textContent = content;
        }
    }

    /**
     * 设置标签图标
     */
    public setLabelIcon(iconUrl: string): void {
        this.config.labelIcon = iconUrl;
        // 性能优化：使用缓存的DOM元素引用
        if (this.iconElement) {
            this.iconElement.src = iconUrl;
        }
    }
    
    /**
     * 设置外部标签元素
     */
    public setExternalLabelElement(element: HTMLElement): void {
        this.config.externalLabelElement = element;
        
        // 如果已经有标签，先移除旧的
        if (this.label && this.scene) {
            this.scene.remove(this.label);
        }
        
        // 重新创建标签
        if (this.config.showLabels) {
            this.createLabel();
        }
    }
    
    /**
     * 获取当前标签元素
     */
    public getLabelElement(): HTMLElement | null {
        return this.labelElement;
    }
    
    /**
     * 检查是否使用外部标签元素
     */
    public isUsingExternalLabel(): boolean {
        return !!this.config.externalLabelElement;
    }

    /**
     * 显示/隐藏标签
     */
    public setShowLabels(show: boolean): void {
        this.config.showLabels = show;
        if (this.label && this.labelElement) {
            if (show) {
                // 渐显效果
                this.label.visible = true;
                // 使用微任务而非 requestAnimationFrame 来避免性能问题
                Promise.resolve().then(() => {
                    if (this.labelElement) {
                        this.labelElement.style.opacity = '1';
                    }
                });
            } else {
                // 渐隐效果
                this.labelElement.style.opacity = '0';

                // 延迟隐藏标签，等动画完成
                setTimeout(() => {
                    if (this.label) {
                        this.label.visible = false;
                    }
                }, 300);
            }
        } else if (this.label) {
            // 如果没有labelElement，直接设置visible属性
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
        } else {
            console.warn('[SpotlightScript] labelElement 不存在，无法设置点击性');
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
        // 触发标签开关回调
        this.triggerToggleCallback();

        // 控制聚光灯
        if (this.spotLight) {
            this.spotLight.visible = true; // 始终可见，通过强度控制
            
            if (this.isTweenEnabled) {
                // 使用缓动过渡强度 - 开关时使用更快的动画
                const baseDuration = this.config.animationDuration || 500;
                const duration = this.isLightEnabled ? baseDuration * 1.2 : baseDuration * 0.8; // 开灯稍慢，关灯更快
                const targetIntensity = this.isLightEnabled ? (this.config.spotLightIntensity || 100) : 0;
                this.animateIntensity(targetIntensity, duration);
            } else {
                // 直接设置强度
                const targetIntensity = this.isLightEnabled ? (this.config.spotLightIntensity || 100) : 0;
                this.spotLight.intensity = targetIntensity;
                this.currentIntensity = this.spotLight.intensity;
                if (targetIntensity === 0) {
                    this.spotLight.visible = false;
                }
            }
        } else {
            console.warn('[SpotlightScript] spotLight 不存在，无法切换灯光');
        }

        // 控制辅助器 - 添加延迟动画
        if (this.spotLightHelper) {
            if (this.isLightEnabled) {
                // 开灯时立即显示辅助器
                this.spotLightHelper.visible = this.config.showLightHelpers || false;
            } else {
                // 关灯时延迟隐藏辅助器，等强度动画完成
                setTimeout(() => {
                    if (this.spotLightHelper && !this.isLightEnabled) {
                        this.spotLightHelper.visible = false;
                    }
                }, this.isTweenEnabled ? 450 : 0);
            }
        }

        // 更新标签样式
        this.updateLabelStyle();
        
        console.log(`[SpotlightScript] toggleLight 完成`);
    }

    /**
     * 开灯
     */
    public turnOn(): void {
        if (!this.isLightEnabled) {
            this.toggleLight();
        }
    }

    /**
     * 关灯
     */
    public turnOff(): void {
        if (this.isLightEnabled) {
            this.toggleLight();
        }
    }

    /**
     * 快速开关（无动画）
     */
    public toggleLightInstant(): void {
        const wasEnabled = this.isTweenEnabled;
        this.isTweenEnabled = false;
        this.toggleLight();
        this.isTweenEnabled = wasEnabled;
    }

    /**
     * 检查灯光是否开启
     */
    public isLightOn(): boolean {
        return this.isLightEnabled;
    }

    /**
     * 更新标签样式和图标状态
     */
    private updateLabelStyle(): void {
        if (!this.labelElement) {
            console.warn('[SpotlightScript] labelElement 不存在，无法更新样式');
            return;
        }
        
        console.log(`[SpotlightScript] 更新标签样式，灯光状态: ${this.isLightEnabled}`);
        
        // 根据灯光状态更新 CSS 类名
        if (this.isLightEnabled) {
            this.labelElement.classList.add('light-on');
            this.labelElement.classList.remove('light-off');
            this.labelElement.style.background = 'rgba(0, 0, 0, 0.85)';
            this.labelElement.style.border = '1px solid rgba(255, 255, 255, 0.15)';
        } else {
            this.labelElement.classList.add('light-off');
            this.labelElement.classList.remove('light-on');
            this.labelElement.style.background = 'rgba(100, 100, 100, 0.85)';
            this.labelElement.style.border = '1px solid rgba(150, 150, 150, 0.15)';
        }

        // 更新图标状态
        this.updateLabelIcon();
    }

    /**
     * 动画过程中实时更新标签透明度
     */
    private updateLabelOpacityDuringAnimation(progress: number): void {
        if (!this.labelElement) return;
        
        // 根据强度进度调整标签的视觉效果
        const opacity = 0.7 + (progress * 0.3); // 0.7 到 1.0 之间
        this.labelElement.style.opacity = opacity.toString();
    }

    /**
     * 更新标签图标
     */
    private updateLabelIcon(): void {
        if (this.iconElement) {
            // 根据灯光状态设置图标
            if (this.config.labelIcon) {
                this.iconElement.src = this.config.labelIcon;
            }
            
            if (this.isLightEnabled) {
                // 开启状态 - 移除暗淡样式
                this.iconElement.style.opacity = '1';
                this.iconElement.classList.remove('light-off');
            } else {
                // 关闭状态 - 添加暗淡样式
                this.iconElement.style.opacity = '0.5';
                this.iconElement.classList.add('light-off');
            }
        }
    }

    /**
     * 强度缓动动画
     */
    private animateIntensity(targetIntensity: number, duration?: number): void {
        if (!this.spotLight || !this.isTweenEnabled) {
            // 如果没有启用动画，直接设置强度
            if (this.spotLight) {
                this.spotLight.intensity = targetIntensity;
                this.currentIntensity = targetIntensity;
                if (targetIntensity === 0) {
                    this.spotLight.visible = false;
                } else {
                    this.spotLight.visible = true;
                }
            }
            return;
        }

        // 使用传入的持续时间或配置中的默认值
        const animationDuration = duration || this.config.animationDuration || 500;

        // 停止当前的强度动画
        if (this.intensityTween) {
            this.intensityTween.stop();
            this.intensityTween = null;
        }

        this.targetIntensity = targetIntensity;
        const startIntensity = this.currentIntensity;
        // 根据开关状态选择不同的缓动效果
        const easingFunction = targetIntensity > 0 
            ? TWEEN.Easing.Cubic.Out    // 开灯：快速启动，缓慢结束
            : TWEEN.Easing.Cubic.In;    // 关灯：缓慢启动，快速结束

        // 性能优化：预计算分母避免重复计算
        const intensityDivisor = (this.config.spotLightIntensity || 100);

        // 创建强度缓动动画 - 使用新的 TWEEN API
        try {
            this.intensityTween = new TWEEN.Tween({ intensity: startIntensity }, TweenGroup)
                .to({ intensity: targetIntensity }, animationDuration)
                .easing(easingFunction)
                .onUpdate((object) => {
                    if (this.spotLight) {
                        this.currentIntensity = object.intensity;
                        this.spotLight.intensity = object.intensity;
                        this.spotLight.visible = true; // 确保灯光可见
                        this.updateLabelOpacityDuringAnimation(object.intensity / intensityDivisor);
                    }
                })
                .onComplete(() => {
                    this.currentIntensity = targetIntensity;
                    this.intensityTween = null;
                    if (targetIntensity === 0 && this.spotLight) {
                        this.spotLight.visible = false;
                    }
                })
                .start();
                
            console.log(`[SpotlightScript] 动画创建成功: ${startIntensity} -> ${targetIntensity}`);
        } catch (error) {
            console.error('[SpotlightScript] 创建动画失败:', error);            
            // 如果动画创建失败，直接设置强度
            if (this.spotLight) {
                this.spotLight.intensity = targetIntensity;
                this.currentIntensity = targetIntensity;
                if (targetIntensity === 0) {
                    this.spotLight.visible = false;
                } else {
                    this.spotLight.visible = true;
                }
            }
        }
    }

    /**
     * 启用/禁用强度缓动
     */
    public setTweenEnabled(enabled: boolean): void {
        this.isTweenEnabled = enabled;
        
        // 如果禁用缓动，停止当前动画并直接设置强度
        if (!enabled && this.intensityTween) {
            this.intensityTween.stop();
            this.intensityTween = null;
            
            if (this.spotLight) {
                this.spotLight.intensity = this.isLightEnabled ? (this.config.spotLightIntensity || 100) : 0;
                this.currentIntensity = this.spotLight.intensity;
            }
        }
    }

    /**
     * 获取当前强度值
     */
    public getCurrentIntensity(): number {
        return this.currentIntensity;
    }

    /**
     * 获取目标强度值
     */
    public getTargetIntensity(): number {
        return this.targetIntensity;
    }

    /**
     * 设置强度（支持缓动）
     */
    public setIntensity(intensity: number, animated: boolean = true): void {
        if (this.config.spotLightIntensity !== undefined) {
            this.config.spotLightIntensity = intensity;
        }
        this.targetIntensity = intensity;
        
        if (this.spotLight && this.isLightEnabled) {
            if (animated && this.isTweenEnabled) {
                this.animateIntensity(intensity);
            } else {
                this.spotLight.intensity = intensity;
                this.currentIntensity = intensity;
            }
        }
    }

    /**
     * 设置动画持续时间
     */
    /**
     * 调试方法：检查标签点击功能
     */
    public debugLabelClick(): void {
        console.log('[SpotlightScript] Debug 信息:');
        console.log('- labelElement 存在:', !!this.labelElement);
        console.log('- clickableLabels 配置:', this.config.clickableLabels);
        console.log('- 灯光当前状态:', this.isLightEnabled);
        console.log('- spotLight 存在:', !!this.spotLight);
        console.log('- spotLight 强度:', this.spotLight?.intensity);
        console.log('- spotLight 可见性:', this.spotLight?.visible);
        
        if (this.labelElement) {
            console.log('- 标签元素 CSS 类:', this.labelElement.className);
            console.log('- 标签元素样式:', {
                pointerEvents: this.labelElement.style.pointerEvents,
                cursor: this.labelElement.style.cursor,
                opacity: this.labelElement.style.opacity
            });
        }
    }
    
    /**
     * 调试方法：模拟标签点击
     */
    public simulateLabelClick(): void {
        console.log('[SpotlightScript] 模拟标签点击');
        if (this.labelElement) {
            // 创建一个模拟的点击事件
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            this.labelElement.dispatchEvent(clickEvent);
        } else {
            console.error('[SpotlightScript] labelElement 不存在，无法模拟点击');
        }
    }

    /**
     * 更新配置
     */
    public updateConfig(newConfig: Partial<SpotlightConfig>): void {
        // 更新配置
        Object.assign(this.config, newConfig);

        // 更新动画设置
        if (newConfig.enableTweenAnimation !== undefined) {
            this.isTweenEnabled = newConfig.enableTweenAnimation;
        }

        // 更新标签图标
        if (newConfig.labelIcon !== undefined) {
            this.setLabelIcon(newConfig.labelIcon);
        }

        // 更新标签内容
        if (newConfig.labelContent !== undefined) {
            this.setLabelContent(newConfig.labelContent);
        }

        // 更新回调函数
        if (newConfig.onToggle !== undefined) {
            this.onToggleCallback = newConfig.onToggle;
        }

        // 更新聚光灯属性
        if (this.spotLight) {
            if (newConfig.spotLightColor !== undefined) {
                this.spotLight.color.set(newConfig.spotLightColor);
            }

            if (newConfig.spotLightIntensity !== undefined && this.isLightEnabled) {
                this.targetIntensity = newConfig.spotLightIntensity;
                
                if (this.isTweenEnabled) {
                    this.animateIntensity(newConfig.spotLightIntensity);
                } else {
                    this.spotLight.intensity = newConfig.spotLightIntensity;
                    this.currentIntensity = newConfig.spotLightIntensity;
                }
            }

            if (newConfig.spotLightPosition !== undefined) {
                this.spotLight.position.set(
                    newConfig.spotLightPosition[0],
                    newConfig.spotLightPosition[1],
                    newConfig.spotLightPosition[2]
                );
                // 更新标签位置
                if (this.label) {
                    this.label.position.copy(this.spotLight.position);
                }
            }

            if (newConfig.spotLightTarget !== undefined) {
                (this.spotLight.target as THREE.Object3D).position.set(
                    newConfig.spotLightTarget[0],
                    newConfig.spotLightTarget[1],
                    newConfig.spotLightTarget[2]
                );
            }

            if (newConfig.spotLightAngle !== undefined) {
                this.spotLight.angle = newConfig.spotLightAngle;
            }

            if (newConfig.spotLightPenumbra !== undefined) {
                this.spotLight.penumbra = newConfig.spotLightPenumbra;
            }

            if (newConfig.spotLightDecay !== undefined) {
                this.spotLight.decay = newConfig.spotLightDecay;
            }

            if (newConfig.spotLightDistance !== undefined) {
                this.spotLight.distance = newConfig.spotLightDistance;
            }
        }
    }

    /**
     * 设置标签开关回调函数
     */
    public setOnToggle(callback?: (isEnabled: boolean, script: SpotlightScript) => void): void {
        this.onToggleCallback = callback;
    }

    /**
     * 触发标签开关回调
     */
    private triggerToggleCallback(): void {
        try {
            if (this.onToggleCallback) {
                this.onToggleCallback(this.isLightEnabled, this);
            }
        } catch (error) {
            console.error('[SpotlightScript] 标签开关回调执行失败:', error);
        }
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();

        // 停止强度动画
        if (this.intensityTween) {
            this.intensityTween.stop();
            this.intensityTween = null;
        }
        
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
        
        // 性能优化：清理缓存的引用
        this.ambientLight = null;
        this.spotLight = null;
        this.spotLightHelper = null;
        this.label = null;
        this.labelElement = null;
        this.iconElement = null;
        this.textElement = null;
        this.textures = { none: null };
        this.onToggleCallback = undefined;
    }
}