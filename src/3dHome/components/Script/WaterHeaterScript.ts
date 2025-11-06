import { ScriptBase } from "../../../../Engine/core/ScriptBase";
import {THREE} from "../../../../Engine/core/global";
import type {GLBLoaderScript} from "../../../../Engine/controllers/GLBLoaderScript.ts";
import { ShaderGlowMaterial } from "../../../../Engine/materials/ShaderGlowMaterial";
import {SetPBRDefaultOrHighlightMat} from "./utils.ts";

export interface WaterHeaterScriptConfig {
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    model: string;
}

export class WaterHeaterScript extends ScriptBase {
    private loadModel: GLBLoaderScript | null = null;
    private configs: WaterHeaterScriptConfig[] = [];
    private loadedModels: Map<string, THREE.Group> = new Map();

    // 材质切换相关属性
    private isObjectHighlighted: boolean = false; // 对象是否高亮
    private defaultMaterial: Map<THREE.Mesh, THREE.MeshStandardMaterial> = new Map();
    private highlightMaterial: Map<THREE.Mesh, ShaderGlowMaterial> = new Map();
    constructor(loadModel: GLBLoaderScript ,configs?: WaterHeaterScriptConfig | WaterHeaterScriptConfig[]) {
        super();
        this.name = "WaterHeater";
        this.loadModel = loadModel;

        if (configs) {
            if (Array.isArray(configs)) {
                this.configs = configs;
            } else {
                this.configs = [configs];
            }
        }
    }

    /**
     * 启动脚本时调用
     */
    public start(): void {
        if (this.loadModel) {
            // 加载所有配置的模型
            this.loadAllModels().then(()=>{

            });
        } else {
            console.warn("CeilingLightScript: GLBLoaderScript实例未提供");
        }
        // 监听鼠标交互事件
        this.engine()?.on('mouse:objectSelected', (data) => {
            const object = data.object;

            if (object && object.name === 'Obj3d66-15060587-7-952') {
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
                console.error(`CeilingLightScript: 加载模型 "${config.model}" 失败:`, error);
            }
        }
    }

    /**
     * 根据配置加载单个模型
     * @param config 天花板灯配置
     */
    private async loadModelByConfig(config: WaterHeaterScriptConfig): Promise<void> {
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
            if (object.name === 'Obj3d66-15060587-7-952' && object instanceof THREE.Mesh) {
                const geometry = object.geometry;
                if (!geometry.attributes && !geometry.attributes.uv1) return;

                const materials = SetPBRDefaultOrHighlightMat(object);
                this.defaultMaterial.set(object, materials.defaultMat as THREE.MeshStandardMaterial);
                this.highlightMaterial.set(object, materials.highlightMat as ShaderGlowMaterial);
                object.material =  materials.defaultMat as THREE.MeshStandardMaterial;
                object.material.needsUpdate = true;
            }
        });

        this.loadedModels.set(config.name, modelResult.scene);
    }
}
