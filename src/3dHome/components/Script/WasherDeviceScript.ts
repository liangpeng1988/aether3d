import { ScriptBase } from "../../../../Engine/core/ScriptBase";
import {THREE} from "../../../../Engine/core/global";
import type {GLBLoaderScript} from "../../../../Engine/controllers/GLBLoaderScript.ts";
import { ShaderGlowMaterial } from "../../../../Engine/materials/ShaderGlowMaterial";
import {SetPBRDefaultOrHighlightMat} from "./utils.ts";

export interface WasherDeviceConfig {
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    model: string;
}

export class WasherDeviceScript extends ScriptBase {
    private loadModel: GLBLoaderScript | null = null;
    private configs: WasherDeviceConfig[] = [];
    private loadedModels: Map<string, THREE.Group> = new Map();

    // 材质切换相关属性
    private isObjectHighlighted: boolean = false; // 对象是否高亮
    private defaultMaterial: Map<THREE.Mesh, THREE.MeshStandardMaterial> = new Map();
    private highlightMaterial: Map<THREE.Mesh, ShaderGlowMaterial> = new Map();
    constructor(loadModel: GLBLoaderScript ,configs?: WasherDeviceConfig | WasherDeviceConfig[]) {
        super();
        this.name = "PunkahDeviceScript";
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

            if (object && object.name === 'Obj3d66-341817-17-61') {
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
    private async loadModelByConfig(config: WasherDeviceConfig): Promise<void> {
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
            if (object.name === 'Obj3d66-341817-17-61' && object instanceof THREE.Mesh) {
                const geometry = object.geometry;
                if (!geometry.attributes && !geometry.attributes.uv1) return;

                const materials = SetPBRDefaultOrHighlightMat(object);
                this.defaultMaterial.set(object, materials.defaultMat as THREE.MeshStandardMaterial);
                this.highlightMaterial.set(object, materials.highlightMat as ShaderGlowMaterial);
                object.material =  materials.defaultMat as THREE.MeshStandardMaterial;
                object.material.needsUpdate = true;
            }
            if (object.name === 'dimianshow' && object instanceof THREE.Mesh) {
                const geometry = object.geometry;
                if (!geometry.attributes && !geometry.attributes.uv1) return;

                // 定义自定义着色器
                const vertexShader = `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
                `;

                                const fragmentShader = `
                uniform sampler2D map; // 颜色贴图
                uniform sampler2D aoMap; // AO贴图
                uniform float aoIntensity; // 控制AO对透明度的影响强度
                varying vec2 vUv;
                
                void main() {
                    vec4 texelColor = texture2D(map, vUv);
                    float aoValue = texture2D(aoMap, vUv).r; // 假设AO贴图是单通道或取红色通道
                
                    // 自定义透明度计算逻辑
                    // 示例1: 直接使用AO值作为alpha (AO越暗->alpha越低->越透明)
                    // float alpha = aoValue;
                
                    // 示例2: 反转AO值作为alpha (AO越暗->(1.0 - aoValue)越高->越不透明)
                    float alpha = 1.0 - aoValue;
                
                    // 示例3: 使用强度参数进行混合或阈值处理
                    // float alpha = smoothstep(0.0, aoIntensity, aoValue); // 需要一个基准值和强度来控制
                
                    // 如果完全透明，则丢弃该片段以优化性能
                    if (alpha < 0.01) {
                        discard;
                    }
                
                    gl_FragColor = vec4(texelColor.rgb, alpha);
                }
                `;

                // const shadow = new THREE.TextureLoader().load( '/images/ao0015.png' );
                object.material = new THREE.ShaderMaterial({
                    uniforms: {
                        map: { value: object.material.map }, // 传入你的颜色贴图
                        aoMap: { value: object.material.map },
                        aoIntensity: { value: 1 }, // 可以调整这个值
                    },
                    vertexShader: vertexShader,
                    fragmentShader: fragmentShader,
                    transparent: true
                });
                this.engine()?.disableSelection(object.name);
            }
        });

        this.loadedModels.set(config.name, modelResult.scene);
    }
}
