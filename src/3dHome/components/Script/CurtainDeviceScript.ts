import { ScriptBase } from "../../../../Engine/core/ScriptBase";
import { THREE, TWEEN ,TweenGroup} from "../../../../Engine/core/global";
import type {GLBLoaderScript} from "../../../../Engine/controllers/GLBLoaderScript.ts";
import {ShaderGlowMaterial} from "../../../../Engine/materials/ShaderGlowMaterial.ts";
import {SetPBRDefaultOrHighlightMat} from "./utils.ts";

export interface CurtainAirDeviceConfig {
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    type: string;
    model: string;
}

export class CurtainDeviceScript extends ScriptBase {
    private loadModel: GLBLoaderScript | null = null;
    private configs: CurtainAirDeviceConfig| null = null;
    private loadedModels: Map<string, THREE.Group> = new Map();
    private meshLeft: any = null;
    private meshRight: any = null;
    private baiye: any = null;
    private defaultMaterial: Map<THREE.Mesh, THREE.MeshStandardMaterial> = new Map();
    private highlightMaterial: Map<THREE.Mesh, ShaderGlowMaterial> = new Map();


    private meshLeftOpenTweens: TWEEN.Tween | null = null;
    private meshRightOpenTweens: TWEEN.Tween | null = null;
    private meshLeftCloseTweens: TWEEN.Tween | null = null;
    private meshRightCloseTweens: TWEEN.Tween | null = null;

    private meshShuttersOpenTweens: TWEEN.Tween | null = null;
    private meshShuttersCloseTweens: TWEEN.Tween | null = null;

    // 存储原始状态
    private originalLeftScale: THREE.Vector3 | null = null;
    private originalRightScale: THREE.Vector3 | null = null;
    private originalLeftPosition: THREE.Vector3 | null = null;
    private originalRightPosition: THREE.Vector3 | null = null;

    private originalShuttersScale: THREE.Vector3 | null = null;

    // UI元素
    private uiContainer: HTMLDivElement | null = null;
    private openButton: HTMLButtonElement | null = null;
    private closeButton: HTMLButtonElement | null = null;
    private pauseButton: HTMLButtonElement | null = null;
    private statusIndicator: HTMLSpanElement | null = null;

    // 动画状态
    private isPaused: boolean = false;

    constructor(loadModel: GLBLoaderScript, configs?: CurtainAirDeviceConfig) {
        super();
        this.name = "CurtainDeviceScript";
        this.loadModel = loadModel;

        if (configs) {
            this.configs = configs;
        }
    }

    /**
     * 启动脚本时调用
     */
    public override start(): void {
        if (this.loadModel) {
            // 加载所有配置的模型
            this.loadAllModels().then(() => {
                // 创建UI控制面板
                this.createUI();
            }).catch(error => {
                console.error("CurtainDeviceScript: 模型加载失败", error);
            });
        } else {
            console.warn("CurtainDeviceScript: GLBLoaderScript实例未提供");
        }

        // 监听鼠标交互事件
        this.engine()?.on('mouse:objectSelected', (data) => {
            const object = data.object;

            if (object && object.name === '网格_1') {
                console.log('对象被选中:', object.name);
                this.highlightMaterial.forEach((material, object3D) => {
                    object3D.material = material;
                });
            }
        });
    }

    /**
     * 创建UI控制面板
     */
    private createUI(): void {
        if (!this.configs) return;

        // 创建容器
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '20px';
        this.uiContainer.style.right = '20px';
        this.uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.uiContainer.style.padding = '15px';
        this.uiContainer.style.borderRadius = '8px';
        this.uiContainer.style.fontFamily = 'Arial, sans-serif';
        this.uiContainer.style.zIndex = '1000';
        this.uiContainer.style.color = 'white';

        // 添加标题
        const title = document.createElement('h3');
        title.textContent = `${this.configs.type === 'Shutters' ? '百叶窗' : '窗帘'}控制`;
        title.style.marginTop = '0';
        title.style.marginBottom = '10px';
        this.uiContainer.appendChild(title);

        // 添加状态指示器
        const statusContainer = document.createElement('div');
        statusContainer.style.marginBottom = '10px';
        statusContainer.textContent = '状态: ';

        this.statusIndicator = document.createElement('span');
        this.statusIndicator.textContent = '关闭';
        this.statusIndicator.style.color = '#ff4444';
        statusContainer.appendChild(this.statusIndicator);
        this.uiContainer.appendChild(statusContainer);

        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        buttonContainer.style.flexWrap = 'wrap';

        // 创建开启按钮
        this.openButton = document.createElement('button');
        this.openButton.textContent = '开启';
        this.openButton.style.padding = '8px 16px';
        this.openButton.style.backgroundColor = '#4CAF50';
        this.openButton.style.color = 'white';
        this.openButton.style.border = 'none';
        this.openButton.style.borderRadius = '4px';
        this.openButton.style.cursor = 'pointer';
        this.openButton.addEventListener('click', () => this.Open());
        buttonContainer.appendChild(this.openButton);

        // 创建关闭按钮
        this.closeButton = document.createElement('button');
        this.closeButton.textContent = '关闭';
        this.closeButton.style.padding = '8px 16px';
        this.closeButton.style.backgroundColor = '#f44336';
        this.closeButton.style.color = 'white';
        this.closeButton.style.border = 'none';
        this.closeButton.style.borderRadius = '4px';
        this.closeButton.style.cursor = 'pointer';
        this.closeButton.addEventListener('click', () => this.Close());
        buttonContainer.appendChild(this.closeButton);

        // 创建暂停按钮
        this.pauseButton = document.createElement('button');
        this.pauseButton.textContent = '暂停';
        this.pauseButton.style.padding = '8px 16px';
        this.pauseButton.style.backgroundColor = '#2196F3';
        this.pauseButton.style.color = 'white';
        this.pauseButton.style.border = 'none';
        this.pauseButton.style.borderRadius = '4px';
        this.pauseButton.style.cursor = 'pointer';
        this.pauseButton.addEventListener('click', () => this.togglePause());
        buttonContainer.appendChild(this.pauseButton);

        this.uiContainer.appendChild(buttonContainer);

        // 将UI添加到文档中
        document.body.appendChild(this.uiContainer);
    }

    /**
     * 切换暂停状态
     */
    public togglePause(): void {
        this.isPaused = !this.isPaused;

        if (this.pauseButton) {
            this.pauseButton.textContent = this.isPaused ? '继续' : '暂停';
            this.pauseButton.style.backgroundColor = this.isPaused ? '#FF9800' : '#2196F3';
        }

        // 更新状态指示器
        if (this.statusIndicator) {
            if (this.isPaused) {
                this.statusIndicator.textContent = '已暂停';
                this.statusIndicator.style.color = '#FF9800';
            } else {
                // 恢复之前的状态显示
                const isOpen = this.getState();
                this.statusIndicator.textContent = isOpen ? '开启' : '关闭';
                this.statusIndicator.style.color = isOpen ? '#4CAF50' : '#ff4444';
            }
        }
    }

    /**
     * 更新UI状态
     */
    private updateUIState(isOpen: boolean): void {
        if (this.statusIndicator && !this.isPaused) {
            this.statusIndicator.textContent = isOpen ? '开启' : '关闭';
            this.statusIndicator.style.color = isOpen ? '#4CAF50' : '#ff4444';
        }
    }

    /**
     * 加载所有配置的模型
     */
    private async loadAllModels(): Promise<void> {
        if (!this.configs) {
            return;
        }
        try {
            await this.loadModelByConfig(this.configs);
        } catch (error) {
            console.error(`CurtainDeviceScript: 加载模型 "${this.configs.model}" 失败:`, error);
        }
    }

    /**
     * 根据配置加载单个模型
     * @param config 天花板灯配置
     */
    private async loadModelByConfig(config: CurtainAirDeviceConfig): Promise<void> {
        if (!this.loadModel) {
            throw new Error("GLBLoaderScript未初始化");
        }

        // 加载模型
        const modelResult = await this.loadModel.loadModel(config.model, {
            position: new THREE.Vector3(config.position[0], config.position[1], config.position[2]),
            rotation: new THREE.Euler(config.rotation[0], config.rotation[1], config.rotation[2]),
            scale: new THREE.Vector3(config.scale[0], config.scale[1], config.scale[2]),
            addToScene: true
        });

        if (modelResult && modelResult.scene) {
            modelResult.scene.traverse((object: THREE.Object3D) => {
                if (!object) return;
                if (config.type === 'Shutters') {
                    if (object.name === 'gan' && object instanceof THREE.Mesh) {
                        const materials = SetPBRDefaultOrHighlightMat(object);
                        this.defaultMaterial.set(object, materials.defaultMat as THREE.MeshStandardMaterial);
                        this.highlightMaterial.set(object, materials.highlightMat as ShaderGlowMaterial);
                        object.material =  materials.defaultMat as THREE.MeshStandardMaterial;
                        object.material.needsUpdate = true;
                        this.engine()?.disableSelection(object.name);
                    }
                    if (object.name === 'baiye' && object instanceof THREE.Mesh) {
                        const geometry = object.geometry;
                        if (!geometry.attributes && !geometry.attributes.uv1) return;
                        this.baiye = object.parent;
                        this.originalShuttersScale = this.baiye.scale.clone();
                        const materials = SetPBRDefaultOrHighlightMat(object);
                        this.defaultMaterial.set(object, materials.defaultMat as THREE.MeshStandardMaterial);
                        this.highlightMaterial.set(object, materials.highlightMat as ShaderGlowMaterial);
                        object.material =  materials.defaultMat as THREE.MeshStandardMaterial;
                        object.material.needsUpdate = true;

                        // // 创建打开动画（百叶窗收缩）
                        // const openScale = {
                        //     x: this.originalShuttersScale?.x || 1,
                        //     y: this.originalShuttersScale?.y || 1, // 收缩到较小的高度
                        //     z: 0.004
                        // };

                        // this.meshShuttersOpenTweens = new TWEEN.Tween(this.baiye.scale,TweenGroup)
                        //     .to(openScale, 1200)
                        //     .easing(TWEEN.Easing.Exponential.Out);
                        // // 创建关闭动画（百叶窗展开）
                        // const closeScale = this.originalShuttersScale ? {
                        //     x: this.originalShuttersScale.x,
                        //     y: this.originalShuttersScale.y,
                        //     z: this.originalShuttersScale.z
                        // } : { x: 1, y: 1, z: 1 };

                        // this.meshShuttersCloseTweens = new TWEEN.Tween(this.baiye.scale,TweenGroup)
                        //     .to(closeScale, 1200)
                        //     .easing(TWEEN.Easing.Exponential.Out);
                    }
                }
                else
                {
                    if (object instanceof THREE.Mesh) {
                        const geometry = object.geometry;
                        if (!geometry.attributes && !geometry.attributes.uv1) return;
                        const materials = SetPBRDefaultOrHighlightMat(object);
                        this.defaultMaterial.set(object, materials.defaultMat as THREE.MeshStandardMaterial);
                        this.highlightMaterial.set(object, materials.highlightMat as ShaderGlowMaterial);
                        object.material =  materials.defaultMat as THREE.MeshStandardMaterial;
                        object.material.needsUpdate = true;
                    }
                    if (!this.meshLeft && object.constructor === THREE.Mesh) {
                        this.meshLeft = object;
                    } else if (!this.meshRight && object.constructor === THREE.Mesh && object !== this.meshLeft) {
                        this.meshRight = object;
                    }

                    // 确保两个网格都已找到
                    if (this.meshLeft && this.meshRight) {
                        // 保存原始状态
                        this.originalLeftScale = this.meshLeft.scale.clone();
                        this.originalRightScale = this.meshRight.scale.clone();
                        this.originalLeftPosition = this.meshLeft.position.clone();
                        this.originalRightPosition = this.meshRight.position.clone();

                        // 创建打开动画（窗帘收缩）
                        const openScale = {
                            x: 0.04, // 几乎不可见
                            y: this.originalLeftScale?.y,
                            z: this.originalLeftScale?.z
                        };

                        this.meshLeftOpenTweens = new TWEEN.Tween(this.meshLeft.scale,TweenGroup)
                            .to(openScale, 1200)
                            .easing(TWEEN.Easing.Exponential.Out);

                        this.meshRightOpenTweens = new TWEEN.Tween(this.meshRight.scale,TweenGroup)
                            .to(openScale, 1200)
                            .easing(TWEEN.Easing.Exponential.Out);

                        // 创建关闭动画（窗帘展开）
                        this.meshLeftCloseTweens = new TWEEN.Tween(this.meshLeft.scale,TweenGroup)
                            .to({
                                x: this.originalLeftScale?.x,
                                y: this.originalLeftScale?.y,
                                z: this.originalLeftScale?.z
                            }, 1200)
                            .easing(TWEEN.Easing.Exponential.Out);

                        this.meshRightCloseTweens = new TWEEN.Tween(this.meshRight.scale,TweenGroup)
                            .to({
                                x: this.originalRightScale?.x,
                                y: this.originalRightScale?.y,
                                z: this.originalRightScale?.z
                            }, 1200)
                            .easing(TWEEN.Easing.Exponential.Out);
                    }
                }
            });
        } else {
            console.error("CurtainDeviceScript: 模型加载失败，没有返回有效的场景对象");
        }

        this.loadedModels.set(config.name, modelResult.scene);
    }

    public Open(): void {
        if (!this.configs) {
            return;
        }
        if (this.configs.type === 'Shutters') {
            this.meshShuttersOpenTweens?.start();
        }
        else {
            // 停止可能正在运行的关闭动画
            this.meshLeftCloseTweens?.stop();
            this.meshRightCloseTweens?.stop();

            // 启动打开动画
            this.meshLeftOpenTweens?.start();
            this.meshRightOpenTweens?.start();
        }
        // 更新UI状态
        this.updateUIState(true);
        this.setState(true);
    }

    public Close(): void {
        if (!this.configs) {
            return;
        }
        if (this.configs.type === 'Shutters') {
            this.meshShuttersCloseTweens?.start();
        }
        else {
            // 停止可能正在运行的打开动画
            this.meshLeftOpenTweens?.stop();
            this.meshRightOpenTweens?.stop();
            // 启动关闭动画
            this.meshLeftCloseTweens?.start();
            this.meshRightCloseTweens?.start();
        }
        // 更新UI状态
        this.updateUIState(false);
        this.setState(false);
    }

    /**
     * 更新方法，在每一帧调用
     */
    public override update(): void {
        if (!this.configs || this.isPaused) {
            return;
        }
    }

    /**
     * 获取指定名称的模型
     * @param name 模型名称
     * @returns THREE.Group | undefined
     */
    public getModelByName(name: string): THREE.Group | undefined {
        return this.loadedModels.get(name);
    }

    /**
     * 获取所有加载的模型
     * @returns Map<string, THREE.Group>
     */
    public getAllModels(): Map<string, THREE.Group> {
        return this.loadedModels;
    }

    /**
     * 获取窗帘当前状态
     * @returns boolean - true表示打开，false表示关闭
     */
    public getState(): boolean {
        // 这里我们简单地返回一个状态值
        // 在实际应用中，您可能需要根据窗帘的实际位置来判断状态
        return (this as any).isCurtainOpen || false;
    }

    /**
     * 设置窗帘状态
     * @param isOpen - true表示打开，false表示关闭
     */
    public setState(isOpen: boolean): void {
        (this as any).isCurtainOpen = isOpen;
    }

    /**
     * 销毁UI元素
     */
    public destroyUI(): void {
        if (this.uiContainer && this.uiContainer.parentNode) {
            this.uiContainer.parentNode.removeChild(this.uiContainer);
        }
        this.uiContainer = null;
        this.openButton = null;
        this.closeButton = null;
        this.pauseButton = null;
        this.statusIndicator = null;
    }
}

export default CurtainDeviceScript;
