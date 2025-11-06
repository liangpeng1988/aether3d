import { ScriptBase } from "../core/ScriptBase";
import {THREE, CSS2DObject, RectAreaLightUniformsLib, RectAreaLightHelper, TWEEN, TweenGroup} from "../core/global.ts";
// CSS样式通过构建工具处理
// import './RectAreaLightScript.css';


/**
 * 矩形区域光配置接口
 */
export interface RectAreaLightConfig {
    /** 是否启用矩形区域光 */
    enabled?: boolean;
    /** 矩形区域光颜色 */
    color?: THREE.Color;
    /** 矩形区域光强度 */
    intensity?: number;
    /** 矩形区域光宽度 */
    width?: number;
    /** 矩形区域光高度 */
    height?: number;
    /** 矩形区域光位置 */
    position?: [number, number, number];
    /** 矩形区域光旋转 */
    rotation?: [number, number, number];
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
    onToggle?: (isEnabled: boolean, script: RectAreaLightScript) => void;
}

/**
 * 矩形区域光脚本类
 * 用于在场景中添加和控制矩形区域光
 *
 * 提供以下主要功能：
 * - 创建和配置矩形区域光
 * - 控制灯光开关（开灯、关灯、切换）
 * - 管理标签显示和交互
 * - 控制灯光辅助器显示
 */
export class RectAreaLightScript extends ScriptBase {
    name = 'RectAreaLightScript';
    // 灯光相关属性
    private config: Required<RectAreaLightConfig>;
    private rectAreaLight: THREE.RectAreaLight | null = null;
    private rectAreaLightHelper: any | null = null;
    private label: CSS2DObject | null = null;
    private labelElement: HTMLElement | null = null;
    private isLightEnabled: boolean = true;
    private isTweenEnabled: boolean = true;
    private static uniformsLibInitialized: boolean = false;
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
    private onToggleCallback?: (isEnabled: boolean, script: RectAreaLightScript) => void;


    constructor(options?: RectAreaLightConfig) {
        super();

        this.config = {
            enabled: true,
            color: new THREE.Color('#6b828a'),
            intensity: 1,
            width: 10,
            height: 10,
            position: [0, 5, 0],
            rotation: [0, 0, 0],
            showLightHelpers: true,
            showLabels: true,
            labelContent: '矩形区域光',
            clickableLabels: true,
            labelIcon: 'https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG242ac23827c6159d8038b7d4dbbc8937.png',
            enableTweenAnimation: true,
            animationDuration: 500,
            ...options
        } as Required<RectAreaLightConfig>;

        // 保存标签开关回调函数
        this.onToggleCallback = options?.onToggle;

        // 初始化动画相关设置
        this.isTweenEnabled = this.config.enableTweenAnimation;

        // 默认情况下灯光是关闭的
        this.isLightEnabled = false;
        this.currentIntensity = 0;
        this.targetIntensity = this.config.intensity;
    }

    /**
     * 脚本初始化时调用
     */
    public override start(): void {
        super.start?.();

        // 初始化RectAreaLightUniformsLib（只需要初始化一次）
        if (!RectAreaLightScript.uniformsLibInitialized) {
            RectAreaLightUniformsLib.init();
            RectAreaLightScript.uniformsLibInitialized = true;
        }

        // 创建矩形区域光
        if (this.config.enabled) {
            this.createRectAreaLight();
            // 确保灯光初始化为关闭状态
            if (this.rectAreaLight) {
                this.rectAreaLight.visible = false;
                this.rectAreaLight.intensity = 0;
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
        
        // 性能优化：移除单独的TWEEN更新，由Aether3d统一管理
        // 只做标签位置更新
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
        if (this.label && this.rectAreaLight) {
            const currentPos = this.rectAreaLight.position;
            if (this.lastPosition.distanceTo(currentPos) > this.positionUpdateThreshold) {
                this.label.position.set(currentPos.x, currentPos.y, currentPos.z);
                this.lastPosition.copy(currentPos);
            }
        }
    }

    /**
     * 创建矩形区域光
     */
    private createRectAreaLight(): void {
        try {
            if (this.scene) {
                // 创建矩形区域光
                this.rectAreaLight = new THREE.RectAreaLight(
                    this.config.color,
                    this.config.intensity,
                    this.config.width,
                    this.config.height
                );

                // 设置位置
                this.rectAreaLight.position.set(
                    this.config.position[0],
                    this.config.position[1],
                    this.config.position[2]
                );

                // 设置旋转
                this.rectAreaLight.rotation.set(
                    this.config.rotation[0],
                    this.config.rotation[1],
                    this.config.rotation[2]
                );

                this.scene.add(this.rectAreaLight);
            
                // 创建灯光辅助器
                if (this.config.showLightHelpers && this.rectAreaLight) {
                    this.rectAreaLightHelper = new RectAreaLightHelper(this.rectAreaLight!);
                        this.scene!.add(this.rectAreaLightHelper);
                }
            }
        } catch (error) {
            console.error('[RectAreaLightScript] 创建矩形区域光失败:', error);
        }
    }

    /**
     * 创建标签
     */
    private createLabel(): void {
        try {
            if (this.rectAreaLight && this.scene) {
                // 检查是否有外部传入的标签元素
                if (this.config.externalLabelElement) {
                    console.log('[RectAreaLightScript] 使用外部标签元素');
                    this.labelElement = this.config.externalLabelElement;
                    // 使用外部元素创建标签
                    this.createLabelFromExternalElement();
                } else {
                    console.log('[RectAreaLightScript] 使用内部创建标签元素');
                    // 内部创建标签元素
                    this.createInternalLabelElement();
                }

                // 创建CSS2DObject
                if (this.labelElement) {
                    console.log('[RectAreaLightScript] 创建CSS2DObject');
                    this.label = new CSS2DObject(this.labelElement);
                    this.label.position.copy(this.rectAreaLight.position);

                    // 将标签添加到场景中
                    this.scene.add(this.label);
                    console.log('[RectAreaLightScript] 标签添加到场景中');

                    // 初始化标签状态
                    this.updateLabelStyle();
                } else {
                    console.error('[RectAreaLightScript] labelElement 创建失败');
                }
            } else {
                console.error('[RectAreaLightScript] rectAreaLight 或 scene 不存在，无法创建标签');
            }
        } catch (error) {
            console.error('[RectAreaLightScript] 创建标签失败:', error);
        }
    }
    
    /**
     * 使用外部元素创建标签
     */
    private createLabelFromExternalElement(): void {
        if (!this.labelElement) return;
        
        // 在外部元素中查找或创建图标和文本元素
        let iconElement = this.labelElement.querySelector('.rect-area-light-icon') as HTMLImageElement;
        let textElement = this.labelElement.querySelector('.rect-area-light-text') as HTMLElement;
        
        // 如果外部元素中没有这些元素，则创建它们
        if (!iconElement) {
            iconElement = document.createElement('img');
            iconElement.className = 'rect-area-light-icon';
            this.labelElement.appendChild(iconElement);
        }
        
        if (!textElement) {
            textElement = document.createElement('span');
            textElement.className = 'rect-area-light-text';
            textElement.textContent = this.config.labelContent || '矩形区域光';
            this.labelElement.appendChild(textElement);
        }
        
        // 缓存DOM元素引用
        this.iconElement = iconElement;
        this.textElement = textElement;
        
        // 确保外部元素有基础的 CSS 类名
        if (!this.labelElement.classList.contains('rect-area-light-label')) {
            this.labelElement.classList.add('rect-area-light-label');
        }
        
        // 添加点击事件
        if (this.config.clickableLabels) {
            this.labelElement.addEventListener('click', (event) => {
                console.log('[RectAreaLightScript] 标签被点击（外部元素）');
                event.stopPropagation();
                this.toggleLight();
            });
        }
    }

    
    /**
     * 内部创建标签元素
     */
    private createInternalLabelElement(): void {
        console.log('[RectAreaLightScript] 开始创建内部标签元素');
        console.log('[RectAreaLightScript] clickableLabels 配置:', this.config.clickableLabels);
        
        // 创建标签元素
        this.labelElement = document.createElement('div');
        this.labelElement.className = 'rect-area-light-label';

        // 创建图标元素
        const iconElement = document.createElement('img');
        iconElement.className = 'rect-area-light-icon';

        // 创建文本元素
        const textElement = document.createElement('span');
        textElement.className = 'rect-area-light-text';
        textElement.textContent = this.config.labelContent || '矩形区域光';

        // 性能优化：缓存DOM元素引用
        this.iconElement = iconElement;
        this.textElement = textElement;

        // 将图标和文本添加到标签元素中
        this.labelElement.appendChild(iconElement);
        this.labelElement.appendChild(textElement);

        // 添加点击事件
        if (this.config.clickableLabels) {
            console.log('[RectAreaLightScript] 正在添加点击事件监听器');
            this.labelElement.addEventListener('click', (event) => {
                console.log('[RectAreaLightScript] 标签被点击（内部元素）');
                event.stopPropagation();
                this.toggleLight();
            });
            
            // 设置点击相关样式
            this.labelElement.style.pointerEvents = 'auto';
            this.labelElement.style.cursor = 'pointer';
            
            console.log('[RectAreaLightScript] 点击事件监听器添加完成');
        } else {
            console.log('[RectAreaLightScript] clickableLabels 为 false，跳过添加点击事件');
            this.labelElement.style.pointerEvents = 'none';
            this.labelElement.style.cursor = 'default';
        }
    }


    /**
     * 更新矩形区域光配置
     */
    public updateConfig(newConfig: Partial<RectAreaLightConfig>): void {
        if (!this.rectAreaLight) return;

        if (newConfig.color !== undefined) {
            this.rectAreaLight.color.set(newConfig.color);
        }

        if (newConfig.intensity !== undefined) {
            this.config.intensity = newConfig.intensity;
            this.targetIntensity = newConfig.intensity;
            
            if (this.isTweenEnabled && this.isLightEnabled) {
                // 使用缓动过渡到新强度
                this.animateIntensity(newConfig.intensity);
            } else if (this.isLightEnabled) {
                // 直接设置强度
                this.rectAreaLight.intensity = newConfig.intensity;
                this.currentIntensity = newConfig.intensity;
            }
        }

        if (newConfig.width !== undefined) {
            this.rectAreaLight.width = newConfig.width;
        }

        if (newConfig.height !== undefined) {
            this.rectAreaLight.height = newConfig.height;
        }

        if (newConfig.position !== undefined) {
            this.rectAreaLight.position.set(
                newConfig.position[0],
                newConfig.position[1],
                newConfig.position[2]
            );
            // 更新标签位置
            if (this.label) {
                this.label.position.copy(this.rectAreaLight.position);
            }
        }

        if (newConfig.rotation !== undefined) {
            this.rectAreaLight.rotation.set(
                newConfig.rotation[0],
                newConfig.rotation[1],
                newConfig.rotation[2]
            );
        }

        // 更新动画设置
        if (newConfig.enableTweenAnimation !== undefined) {
            this.isTweenEnabled = newConfig.enableTweenAnimation;
            this.config.enableTweenAnimation = newConfig.enableTweenAnimation;
        }

        if (newConfig.animationDuration !== undefined) {
            this.config.animationDuration = newConfig.animationDuration;
        }

        // 更新标签图标
        if (newConfig.labelIcon !== undefined) {
            this.setLabelIcon(newConfig.labelIcon);
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
            console.warn('[RectAreaLightScript] labelElement 不存在，无法设置点击性');
        }
    }

    /**
     * 获取矩形区域光对象
     */
    public getRectAreaLight(): THREE.RectAreaLight | null {
        return this.rectAreaLight;
    }

    /**
     * 获取矩形区域光辅助器对象
     */
    public getRectAreaLightHelper(): any | null {
        return this.rectAreaLightHelper;
    }

    /**
     * 启用或禁用矩形区域光
     */
    public setEnabled(enabled: boolean): void {
        if (enabled && !this.rectAreaLight) {
            this.createRectAreaLight();
        } else if (!enabled && this.rectAreaLight) {
            if (this.scene) {
                this.scene.remove(this.rectAreaLight);
                if (this.rectAreaLightHelper) {
                    this.scene.remove(this.rectAreaLightHelper);
                    this.rectAreaLightHelper = null;
                }
                if (this.label) {
                    this.scene.remove(this.label);
                    this.label = null;
                    this.labelElement = null;
                }
            }
            this.rectAreaLight = null;
        }

        // 更新灯光状态
        this.isLightEnabled = enabled;
        this.updateLabelStyle();
    }

    /**
     * 切换灯光开关
     */
    public toggleLight(): void {
        this.isLightEnabled = !this.isLightEnabled;
        // 触发标签开关回调
        this.triggerToggleCallback();

        // 控制矩形区域光
        if (this.rectAreaLight) {
            this.rectAreaLight.visible = true; // 始终可见，通过强度控制
            
            if (this.isTweenEnabled) {
                // 使用缓动过渡强度 - 开关时使用更快的动画
                const baseDuration = this.config.animationDuration || 500;
                const duration = this.isLightEnabled ? baseDuration * 1.2 : baseDuration * 0.8; // 开灯稍慢，关灯更快
                const targetIntensity = this.isLightEnabled ? this.config.intensity : 0;
                this.animateIntensity(targetIntensity, duration);
            } else {
                // 直接设置强度
                const targetIntensity = this.isLightEnabled ? this.config.intensity : 0;
                this.rectAreaLight.intensity = targetIntensity;
                this.currentIntensity = this.rectAreaLight.intensity;
                if (targetIntensity === 0) {
                    this.rectAreaLight.visible = false;
                }
            }
        } else {
            console.warn('[RectAreaLightScript] rectAreaLight 不存在，无法切换灯光');
        }

        // 控制辅助器 - 添加延迟动画
        if (this.rectAreaLightHelper) {
            if (this.isLightEnabled) {
                // 开灯时立即显示辅助器
                this.rectAreaLightHelper.visible = true;
            } else {
                // 关灯时延迟隐藏辅助器，等强度动画完成
                setTimeout(() => {
                    if (this.rectAreaLightHelper && !this.isLightEnabled) {
                        this.rectAreaLightHelper.visible = false;
                    }
                }, this.isTweenEnabled ? 450 : 0);
            }
        }

        // 更新标签样式
        this.updateLabelStyle();
        
        console.log(`[RectAreaLightScript] toggleLight 完成`);
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
            console.warn('[RectAreaLightScript] labelElement 不存在，无法更新样式');
            return;
        }
        
        console.log(`[RectAreaLightScript] 更新标签样式，灯光状态: ${this.isLightEnabled}`);
        
        // 根据灯光状态更新 CSS 类名
        if (this.isLightEnabled) {
            this.labelElement.classList.add('light-on');
            this.labelElement.classList.remove('light-off');
        } else {
            this.labelElement.classList.add('light-off');
            this.labelElement.classList.remove('light-on');
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
            this.iconElement.src = this.config.labelIcon;
            
            if (this.isLightEnabled) {
                // 开启状态 - 移除暗淡样式
                this.iconElement.classList.remove('light-off');
            } else {
                // 关闭状态 - 添加暗淡样式
                this.iconElement.classList.add('light-off');
            }
        }
    }

    /**
     * 强度缓动动画
     */
    private animateIntensity(targetIntensity: number, duration?: number): void {
        if (!this.rectAreaLight || !this.isTweenEnabled) {
            // 如果没有启用动画，直接设置强度
            if (this.rectAreaLight) {
                this.rectAreaLight.intensity = targetIntensity;
                this.currentIntensity = targetIntensity;
                if (targetIntensity === 0) {
                    this.rectAreaLight.visible = false;
                } else {
                    this.rectAreaLight.visible = true;
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
        const intensityDivisor = this.config.intensity || 1;

        // 创建强度缓动动画 - 使用新的 TWEEN API
        try {
            this.intensityTween = new TWEEN.Tween({ intensity: startIntensity }, TweenGroup)
                .to({ intensity: targetIntensity }, animationDuration)
                .easing(easingFunction)
                .onUpdate((object) => {
                    if (this.rectAreaLight) {
                        this.currentIntensity = object.intensity;
                        this.rectAreaLight.intensity = object.intensity;
                        this.rectAreaLight.visible = true; // 确保灯光可见
                        this.updateLabelOpacityDuringAnimation(object.intensity / intensityDivisor);
                    }
                })
                .onComplete(() => {
                    this.currentIntensity = targetIntensity;
                    this.intensityTween = null;
                    if (targetIntensity === 0 && this.rectAreaLight) {
                        this.rectAreaLight.visible = false;
                    }
                })
                .start();
                
            console.log(`[RectAreaLightScript] 动画创建成功: ${startIntensity} -> ${targetIntensity}`);
        } catch (error) {
            console.error('[RectAreaLightScript] 创建动画失败:', error);            
            // 如果动画创建失败，直接设置强度
            if (this.rectAreaLight) {
                this.rectAreaLight.intensity = targetIntensity;
                this.currentIntensity = targetIntensity;
                if (targetIntensity === 0) {
                    this.rectAreaLight.visible = false;
                } else {
                    this.rectAreaLight.visible = true;
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
            
            if (this.rectAreaLight) {
                this.rectAreaLight.intensity = this.isLightEnabled ? this.config.intensity : 0;
                this.currentIntensity = this.rectAreaLight.intensity;
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
        this.config.intensity = intensity;
        this.targetIntensity = intensity;
        
        if (this.rectAreaLight && this.isLightEnabled) {
            if (animated && this.isTweenEnabled) {
                this.animateIntensity(intensity);
            } else {
                this.rectAreaLight.intensity = intensity;
                this.currentIntensity = intensity;
            }
        }
    }

    /**
     * 设置动画持续时间
     */
    public setAnimationDuration(duration: number): void {
        this.config.animationDuration = duration;
    }

    /**
     * 调试方法：检查标签点击功能
     */
    public debugLabelClick(): void {
        console.log('[RectAreaLightScript] Debug 信息:');
        console.log('- labelElement 存在:', !!this.labelElement);
        console.log('- clickableLabels 配置:', this.config.clickableLabels);
        console.log('- 灯光当前状态:', this.isLightEnabled);
        console.log('- rectAreaLight 存在:', !!this.rectAreaLight);
        console.log('- rectAreaLight 强度:', this.rectAreaLight?.intensity);
        console.log('- rectAreaLight 可见性:', this.rectAreaLight?.visible);
        
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
        console.log('[RectAreaLightScript] 模拟标签点击');
        if (this.labelElement) {
            // 创建一个模拟的点击事件
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            this.labelElement.dispatchEvent(clickEvent);
        } else {
            console.error('[RectAreaLightScript] labelElement 不存在，无法模拟点击');
        }
    }

    /**
     * 设置标签开关回调函数
     */
    public setOnToggle(callback?: (isEnabled: boolean, script: RectAreaLightScript) => void): void {
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
            console.error('[RectAreaLightScript] 标签开关回调执行失败:', error);
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

        // 清理矩形区域光
        if (this.rectAreaLight && this.scene) {
            this.scene.remove(this.rectAreaLight);
        }

        // 清理矩形区域光辅助器
        if (this.rectAreaLightHelper && this.scene) {
            this.scene.remove(this.rectAreaLightHelper);
        }

        // 清理标签
        if (this.label && this.scene) {
            this.scene.remove(this.label);
        }

        // 性能优化：清理缓存的引用
        this.rectAreaLight = null;
        this.rectAreaLightHelper = null;
        this.label = null;
        this.labelElement = null;
        this.iconElement = null;
        this.textElement = null;
        this.onToggleCallback = undefined;
    }
}
