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
    private isTweenEnabled: boolean = false;
    private static uniformsLibInitialized: boolean = false;
    private openTweens: TWEEN.Tween | null = null;
    private closeTweens: TWEEN.Tween | null = null;


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
        };

        // 默认情况下灯光是关闭的
        this.isLightEnabled = false;
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
            this.rectAreaLight.intensity = newConfig.intensity;
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
                // 强制重绘后触发动画
                requestAnimationFrame(() => {
                    this.labelElement!.style.opacity = '1';
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

        // 控制矩形区域光
        if (this.rectAreaLight) {
            this.rectAreaLight.visible = this.isLightEnabled;
            this.rectAreaLight.intensity = this.isLightEnabled ? this.config.intensity : 0;
        }

        // 控制辅助器
        if (this.rectAreaLightHelper) {
            this.rectAreaLightHelper.visible = this.isLightEnabled;
        }

        // 更新标签样式
        this.updateLabelStyle();

        console.log(`[RectAreaLightScript] 矩形区域光已${this.isLightEnabled ? '开启' : '关闭'}`);
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
     * 检查灯光是否开启
     */
    public isLightOn(): boolean {
        return this.isLightEnabled;
    }

    /**
     * 更新标签样式以反映灯光状态
     */
    private updateLabelStyle(): void {
        if (this.labelElement) {
            // 根据灯光状态更新背景色 - LiquidGlass效果
            if (this.isLightEnabled) {
                this.labelElement.style.background = 'rgba(255, 255, 255, 0.08)';
                this.labelElement.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                this.labelElement.style.boxShadow = `
                    0 4px 30px rgba(0, 0, 0, 0.1),
                    inset 0 0 10px rgba(255, 255, 255, 0.1)
                `;
            } else {
                this.labelElement.style.background = 'rgba(100, 100, 100, 0.08)';
                this.labelElement.style.border = '1px solid rgba(150, 150, 150, 0.15)';
                this.labelElement.style.boxShadow = `
                    0 4px 30px rgba(0, 0, 0, 0.1),
                    inset 0 0 10px rgba(150, 150, 150, 0.1)
                `;
            }

            // 更新图标
            this.updateLabelIcon();
        }
    }

    /**
     * 更新标签图标以反映灯光状态
     */
    private updateLabelIcon(): void {
        if (this.labelElement) {
            const iconElement = this.labelElement.querySelector('.rect-area-light-icon') as HTMLImageElement;
            if (iconElement) {
                // 根据灯光状态设置图标图片，使用LightControl.tsx中的图片
                if (this.isLightEnabled) {
                    // 使用开启状态的图片
                    iconElement.src = 'https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG242ac23827c6159d8038b7d4dbbc8937.png';
                } else {
                    // 使用关闭状态的图片（如果需要不同的图片）
                    // 如果没有专门的关闭图片，可以使用相同的图片或者添加透明度效果
                    iconElement.src = 'https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG242ac23827c6159d8038b7d4dbbc8937.png';
                    // 可以添加透明度效果来表示关闭状态
                    iconElement.style.opacity = '1';
                }

                // 如果开/关状态使用相同的图片，通过透明度区分
                if (this.isLightEnabled) {
                    iconElement.style.opacity = '1';
                } else {
                    iconElement.style.opacity = '0.5';
                }
            }
        }
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();

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
