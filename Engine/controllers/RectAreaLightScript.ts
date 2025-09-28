import { ScriptBase } from "../core/ScriptBase";
import {THREE, CSS2DObject, RectAreaLightUniformsLib, RectAreaLightHelper, TWEEN} from "../core/global.ts";


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
            ...options
        } as Required<RectAreaLightConfig>;

        // 保存标签开关回调函数
        this.onToggleCallback = options?.onToggle;

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
        
        // 更新强度缓动动画
        if (this.intensityTween) {
            this.intensityTween.update();
        }
        
        // 更新标签位置
        if (this.label && this.rectAreaLight) {
            this.label.position.copy(this.rectAreaLight.position);
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
                // 创建标签元素
                this.labelElement = document.createElement('div');
                this.labelElement.className = 'rect-area-light-label';

                // 创建图标元素
                const iconElement = document.createElement('img');
                iconElement.className = 'rect-area-light-icon';
                iconElement.style.marginRight = '6px'; // 减小右边距
                iconElement.style.width = '18px'; // 稍微减小图片尺寸
                iconElement.style.height = '18px'; // 稍微减小图片尺寸
                iconElement.style.objectFit = 'contain';

                // 创建文本元素
                const textElement = document.createElement('span');
                textElement.className = 'rect-area-light-text';
                textElement.textContent = this.config.labelContent || '矩形区域光';

                // 将图标和文本添加到标签元素中
                this.labelElement.appendChild(iconElement);
                this.labelElement.appendChild(textElement);

                // 设置标签整体样式 - LiquidGlass效果，减小内边距使标签更紧凑
                this.labelElement.style.display = 'flex';
                this.labelElement.style.alignItems = 'center';
                this.labelElement.style.padding = '6px 10px'; // 显著减小内边距
                this.labelElement.style.background = 'rgba(255, 255, 255, 0.05)';
                this.labelElement.style.color = '#ffffff';
                this.labelElement.style.borderRadius = '10px'; // 稍稍微减小圆角
                this.labelElement.style.fontSize = '12px'; // 保持较小字体
                this.labelElement.style.fontFamily = 'Arial, "Microsoft YaHei", sans-serif';
                this.labelElement.style.fontWeight = '500';
                this.labelElement.style.whiteSpace = 'nowrap';
                this.labelElement.style.userSelect = 'none';
                this.labelElement.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                this.labelElement.style.boxShadow = `
                    0 4px 30px rgba(0, 0, 0, 0.1),
                    inset 0 0 10px rgba(255, 255, 255, 0.1)
                `;
                this.labelElement.style.backdropFilter = 'blur(10px)';
                // 使用类型断言来设置Safari兼容的backdrop-filter
                (this.labelElement.style as any).webkitBackdropFilter = 'blur(10px)';
                this.labelElement.style.pointerEvents = this.config.clickableLabels ? 'auto' : 'none';
                this.labelElement.style.zIndex = '1000';
                this.labelElement.style.cursor = this.config.clickableLabels ? 'pointer' : 'default';
                this.labelElement.style.position = 'relative';
                this.labelElement.style.overflow = 'hidden';
                this.labelElement.style.transition = 'all 0.1s ease';
                this.labelElement.style.opacity = '1'; // 添加初始opacity值

                // 添加LiquidGlass效果的before伪元素样式
                const beforeElement = document.createElement('div');
                beforeElement.style.position = 'absolute';
                beforeElement.style.top = '0';
                beforeElement.style.left = '0';
                beforeElement.style.right = '0';
                beforeElement.style.bottom = '0';
                beforeElement.style.background = 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.01))';
                beforeElement.style.borderRadius = '10px';
                beforeElement.style.zIndex = '-1';
                beforeElement.style.pointerEvents = 'none';
                this.labelElement.appendChild(beforeElement);

                // 添加LiquidGlass效果的after伪元素样式
                const afterElement = document.createElement('div');
                afterElement.style.position = 'absolute';
                afterElement.style.top = '0';
                afterElement.style.left = '0';
                afterElement.style.right = '0';
                afterElement.style.bottom = '0';
                afterElement.style.background = 'radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%)';
                afterElement.style.borderRadius = '10px';
                afterElement.style.zIndex = '-1';
                afterElement.style.pointerEvents = 'none';
                this.labelElement.appendChild(afterElement);

                // 添加点击事件
                if (this.config.clickableLabels) {
                    // 添加点击事件
                    this.labelElement.addEventListener('click', (event) => {
                        event.stopPropagation();
                        this.toggleLight();
                    });
                }

                // 创建CSS2DObject
                this.label = new CSS2DObject(this.labelElement);
                this.label.position.copy(this.rectAreaLight.position);

                // 将标签添加到场景中
                this.scene.add(this.label);

                // 初始化图标状态
                this.updateLabelIcon();
            }
        } catch (error) {
            console.error('[RectAreaLightScript] 创建标签失败:', error);
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
        if (this.label && this.labelElement) {
            // 确保过渡效果的一致性
            this.labelElement.style.transition = 'opacity 0.3s ease-in-out';

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
                const duration = this.isLightEnabled ? 600 : 400; // 开灯稍慢，关灯更快
                this.animateIntensity(this.isLightEnabled ? this.config.intensity : 0, duration);
            } else {
                // 直接设置强度
                this.rectAreaLight.intensity = this.isLightEnabled ? this.config.intensity : 0;
                this.currentIntensity = this.rectAreaLight.intensity;
            }
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

        // 更新标签样式 - 添加动画效果
        this.updateLabelStyleAnimated();
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
     * 保持向后兼容的更新标签样式方法
     */
    private updateLabelStyle(): void {
        this.updateLabelStyleAnimated();
    }

    /**
     * 保持向后兼容的更新图标方法
     */
    private updateLabelIcon(): void {
        this.updateLabelIconAnimated();
    }

    /**
     * 带动画效果的标签样式更新
     */
    private updateLabelStyleAnimated(): void {
        if (!this.labelElement) return;
        // 根据灯光状态更新背景色和样式 - LiquidGlass效果
        if (this.isLightEnabled) {
            // 开灯状态 - 明亮效果
            this.labelElement.style.background = 'rgba(255, 255, 255, 0.12)';
            this.labelElement.style.border = '1px solid rgba(255, 255, 255, 0.2)';
            this.labelElement.style.boxShadow = `
                0 8px 32px rgba(0, 0, 0, 0.12),
                inset 0 0 16px rgba(255, 255, 255, 0.15),
                0 0 20px rgba(255, 255, 255, 0.1)
            `;
        } else {
            // 关灯状态 - 暗淡效果
            this.labelElement.style.background = 'rgba(100, 100, 100, 0.08)';
            this.labelElement.style.border = '1px solid rgba(150, 150, 150, 0.12)';
            this.labelElement.style.boxShadow = `
                0 4px 20px rgba(0, 0, 0, 0.08),
                inset 0 0 8px rgba(150, 150, 150, 0.08)
            `;
        }

        // 更新图标
        this.updateLabelIconAnimated();
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
     * 带动画效果的图标更新
     */
    private updateLabelIconAnimated(): void {
        if (!this.labelElement) return;

        const iconElement = this.labelElement.querySelector('.rect-area-light-icon') as HTMLImageElement;
        if (iconElement) {
            // 添加图标过渡动画
            iconElement.style.transition = 'all 0.25s ease-in-out';
            
            // 根据灯光状态设置图标
            iconElement.src = 'https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG242ac23827c6159d8038b7d4dbbc8937.png';
            
            if (this.isLightEnabled) {
                // 开启状态 - 明亮效果
                iconElement.style.opacity = '1';
            } else {
                // 关闭状态 - 暗淡效果
                iconElement.style.opacity = '0.6';
            }
        }
    }

    /**
     * 强度缓动动画
     */
    private animateIntensity(targetIntensity: number, duration: number = 500): void {
        if (!this.rectAreaLight || !this.isTweenEnabled) {
            return;
        }

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

        // 创建强度缓动动画
        try {
            this.intensityTween = new TWEEN.Tween({ intensity: startIntensity })
                .to({ intensity: targetIntensity }, duration)
                .easing(easingFunction)
                .onUpdate((object) => {
                    if (this.rectAreaLight) {
                        this.currentIntensity = object.intensity;
                        this.rectAreaLight.intensity = object.intensity;
                        this.updateLabelOpacityDuringAnimation(object.intensity / this.config.intensity);
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
        } catch (error) {
            console.error('[RectAreaLightScript] 创建动画失败:', error);            
            // 如果动画创建失败，直接设置强度
            if (this.rectAreaLight) {
                this.rectAreaLight.intensity = targetIntensity;
                this.currentIntensity = targetIntensity;
            }
        }
    }

    /**
     * 设置强度缓动持续时间
     */
    public setIntensityAnimationDuration(duration: number): void {
        // 保存为实例属性以供后续使用
        (this as any).animationDuration = duration;
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

        this.rectAreaLight = null;
        this.rectAreaLightHelper = null;
        this.label = null;
        this.labelElement = null;
    }
}
