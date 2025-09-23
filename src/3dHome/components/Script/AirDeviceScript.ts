import { ScriptBase } from "../../../../Engine/core/ScriptBase";
import { THREE } from "../../../../Engine/core/global";
import type {GLBLoaderScript} from "../../../../Engine/controllers/GLBLoaderScript.ts";
import {ShaderGlowMaterial} from "../../../../Engine/materials/ShaderGlowMaterial.ts";
import {SetPBRDefaultOrHighlightMat} from "./utils.ts";
import {createGradientAlphaMap, loadTexture} from "../../../../Engine/math";
import {AnimationMaterial} from "../../../../Engine/materials/AnimationMaterial.ts";


export interface AirDeviceConfig {
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    /** 模型 */
    model: string;
    /** 风速，默认为1 */
    windSpeed?: number;
    /** 风效颜色，默认为'#ff8800' */
    windColor?: string;
}

export class AirDeviceScript extends ScriptBase {
    private loadModel: GLBLoaderScript | null = null;
    private configs: AirDeviceConfig[] = [];
    private loadedModels: Map<string, THREE.Group> = new Map();
    private animationMaterial: AnimationMaterial | null = null;
    private defaultMaterial: Map<THREE.Mesh, THREE.MeshStandardMaterial> = new Map();
    private highlightMaterial: Map<THREE.Mesh, ShaderGlowMaterial> = new Map();
    // 风效控制相关属性
    private isWindOn: boolean = true; // 风效默认开启
    private baseWindSpeed: number = 0.06; // 基础风速
    private windSpeed: number = 0.06; // 当前风速（可调节）
    private windColor: string = '#ff8800'; // 当前风效颜色

    constructor(loadModel: GLBLoaderScript, configs?: AirDeviceConfig | AirDeviceConfig[]) {
        super();
        this.name = "AirDeviceScript";
        this.loadModel = loadModel;

        if (configs) {
            if (Array.isArray(configs)) {
                this.configs = configs;
                // 使用配置中的风速和颜色
                if (configs[0]?.windSpeed !== undefined) {
                    this.windSpeed = this.baseWindSpeed * configs[0].windSpeed;
                }
                if (configs[0]?.windColor !== undefined) {
                    this.windColor = configs[0].windColor;
                }
            } else {
                this.configs = [configs];
                // 使用配置中的风速和颜色
                if (configs.windSpeed !== undefined) {
                    this.windSpeed = this.baseWindSpeed * configs.windSpeed;
                }
                if (configs.windColor !== undefined) {
                    this.windColor = configs.windColor;
                }
            }
        }
    }

    /**
     * 启动脚本时调用
     */
    public start(): void {
        if (this.loadModel) {
            // 加载所有配置的模型
            this.loadAllModels();
        } else {
            console.warn("AirDeviceScript: GLBLoaderScript实例未提供");
        }
        // 加载纹理
        loadTexture('/images/6803941_cd79024943f4faaf1ce25d8b31af9bcc.png').then(texture => {
            // 创建渐变alpha贴图
            const alphaMap = createGradientAlphaMap();
            this.animationMaterial = new AnimationMaterial({
                color: '#05a7ff',
                texture: texture,
                alphaMap: alphaMap,
                transparent: true,
                opacity: 1,
                doubleSided: true,
                depthWrite: false,
                uvOffset: new THREE.Vector2(0, 0),
                uvScale: new THREE.Vector2(1, 1)
            });

        });
        // 监听鼠标交互事件
        this.engine()?.on('mouse:objectSelected', (data) => {
            const object = data.object;

            if (object && object.name === 'kongtiao') {
                console.log('对象被选中:', object.name);
                this.highlightMaterial.forEach((material, object3D) => {
                    object3D.material = material;
                });
            }
        });
    }

    /**
     * 加载所有配置的模型
     */
    private async loadAllModels(): Promise<void> {
        for (const config of this.configs) {
            try {
                await this.loadModelByConfig(config);
            } catch (error) {
                console.error(`AirDeviceScript: 加载模型 "${config.model}" 失败:`, error);
            }
        }
    }

    /**
     * 根据配置加载单个模型
     * @param config 空调配置
     */
    private async loadModelByConfig(config: AirDeviceConfig): Promise<void> {
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
        this.scene.traverse((object: THREE.Object3D) => {
            if (!object) return;
            if (object.name === 'kongtiao' && object instanceof THREE.Mesh) {
                const geometry = object.geometry;
                if (!geometry.attributes && !geometry.attributes.uv1) return;

                const materials = SetPBRDefaultOrHighlightMat(object);
                // 检查材质是否成功创建
                if (materials.defaultMat && materials.highlightMat) {
                    this.defaultMaterial.set(object, materials.defaultMat as THREE.MeshStandardMaterial);
                    this.highlightMaterial.set(object, materials.highlightMat as ShaderGlowMaterial);
                    object.material = materials.defaultMat as THREE.MeshStandardMaterial;
                    object.material.needsUpdate = true;
                }
            }

            if (object.name === 'Arc001' && object instanceof THREE.Mesh) {
                // 检查 animationMaterial 是否已加载
                if (this.animationMaterial) {
                    object.material = this.animationMaterial as THREE.MeshStandardMaterial;
                    object.material.needsUpdate = true;
                }
                this.engine()?.disableSelection(object.name);
            }
        });

        this.loadedModels.set(config.name, modelResult.scene);
    }

    public fixedUpdate():void {
    }

    /**
     * 更新方法，在每一帧调用
     */
    public update(): void {
        if (this.animationMaterial)
        {
            this.animationMaterial.scrollUV(0, 1 * 0.06);
        }
    }

    /**
     * 开启风效
     */
    public turnOnWind(): void {
        this.isWindOn = true;
        // 显示风效对象
        // this.scene.traverse((object: THREE.Object3D) => {
        //     if (object.name === "feng" && object.constructor === THREE.Mesh) {
        //         object.visible = true;
        //     }
        // });
    }

    /**
     * 关闭风效
     */
    public turnOffWind(): void {
        this.isWindOn = false;
        // 隐藏风效对象
        // this.scene.traverse((object: THREE.Object3D) => {
        //     if (object.name === "feng" && object.constructor === THREE.Mesh) {
        //         object.visible = false;
        //     }
        // });
        console.log("AirDeviceScript: 风效已关闭");
    }

    /**
     * 切换风效开关状态
     */
    public toggleWind(): void {
        if (this.isWindOn) {
            this.turnOffWind();
        } else {
            this.turnOnWind();
        }
    }

    /**
     * 获取风效开关状态
     * @returns 风效是否开启
     */
    public isWindOnStatus(): boolean {
        return this.isWindOn;
    }

    /**
     * 设置风速
     * @param speed 速度倍率 (0.0 - 5.0)
     */
    public setWindSpeed(speed: number): void {
        const clampedSpeed = Math.max(0, Math.min(5, speed));
        this.windSpeed = this.baseWindSpeed * clampedSpeed;
    }

    /**
     * 获取当前风速
     * @returns 当前速度倍率
     */
    public getWindSpeed(): number {
        return this.windSpeed / this.baseWindSpeed;
    }

    /**
     * 增加风速
     * @param increment 增量
     */
    public increaseWindSpeed(increment: number = 0.5): void {
        this.setWindSpeed(this.getWindSpeed() + increment);
    }

    /**
     * 减少风速
     * @param decrement 减量
     */
    public decreaseWindSpeed(decrement: number = 0.5): void {
        this.setWindSpeed(this.getWindSpeed() - decrement);
    }

    /**
     * 设置风效颜色
     * @param color 颜色值 (如 '#ff0000')
     */
    public setWindColor(color: string): void {
        this.windColor = color;
        // 更新现有材质的颜色
        // if (this.animationMaterial) {
        //     this.animationMaterial.color.set(color);
        // }
    }

    /**
     * 获取当前风效颜色
     * @returns 当前颜色值
     */
    public getWindColor(): string {
        return this.windColor;
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
}
