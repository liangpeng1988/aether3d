import {ScriptBase} from "../../../../Engine/core/ScriptBase";
import {THREE} from "../../../../Engine/core/global";
import type {GLBLoaderScript} from "../../../../Engine/controllers/GLBLoaderScript.ts";
import { RectAreaLightScript } from "../../../../Engine/controllers";
import {RectAreaLightConfig} from "../../../../Engine/controllers/RectAreaLightScript.ts";
// import {MirrorReflectionScript} from "../../../../Engine/controllers/MirrorReflectionScript.ts";

export interface SmartHomeDeviceConfig {
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    model: string;
}

// 定义唯一键类型（建议使用字符串或数字）
type LightKey = string | number;

// 添加灯光控制接口
export interface SmartHomeSceneInterface {
    /** 添加灯光 */
    addLight(key: LightKey, lightConfig: RectAreaLightConfig): void;
    /** 移除灯光 */
    removeLight(key: LightKey): void;
    /** 通过键获取灯光 */
    getLight(key: LightKey): RectAreaLightScript | undefined;
    /** 检查灯光是否存在 */
    hasLight(key: LightKey): boolean;
    /** 获取所有灯光 */
    getAllLights(): RectAreaLightScript[];
    /** 显示或隐藏所有灯的标签 */
    toggleAllLightLabels(visible: boolean): void;
    /** 显示所有灯的标签 */
    showAllLightLabels(): void;
    /** 隐藏所有灯的标签 */
    hideAllLightLabels(): void;
}

export class SmartHomeScene extends ScriptBase implements SmartHomeSceneInterface {
    private modelLoader: GLBLoaderScript | null = null;
    private configs: SmartHomeDeviceConfig | null = null;
    private loadedModels: Map<string, THREE.Group> = new Map();
    private lights: Map<LightKey, RectAreaLightScript> = new Map();
    constructor(modelLoader: GLBLoaderScript, configs: SmartHomeDeviceConfig) {
        super();
        this.name = "SmartHomeScene";
        this.modelLoader = modelLoader;
        this.configs = configs;
    }

    public start(): void {
        if (this.modelLoader) {
            // 加载所有配置的模型
            this.loadAllModels().then();
            this.addLight('学习房',{
                enabled: true,
                color: new THREE.Color('#ffffff'),
                intensity: 35,
                width: 2.5,
                height: 2.5,
                position: [-4, 4.5, 3],  // 调整位置以照射地面
                rotation: [-Math.PI / 2, 0, 0],  // 调整旋转以向下照射
                showLightHelpers: false,
                showLabels: true,
                labelContent: '学习房',
                clickableLabels: true
            });
            this.addLight('数字展厅',{
                enabled: true,
                color: new THREE.Color('#ffffff'),
                intensity: 35,
                width: 2.5,
                height: 2.5,
                position: [12, 4.5, 3],  // 调整位置以照射地面
                rotation: [-Math.PI / 2, 0, 0],  // 调整旋转以向下照射
                showLightHelpers: false,
                showLabels: true,
                labelContent: '数字展厅',
                clickableLabels: true
            });
            this.addLight('多功能房',{
                enabled: true,
                color: new THREE.Color('#ffffff'),
                intensity: 35,
                width: 2.5,
                height: 2.5,
                position: [4, 4.5, 3],  // 调整位置以照射地面
                rotation: [-Math.PI / 2, 0, 0],  // 调整旋转以向下照射
                showLightHelpers: false,
                showLabels: true,
                labelContent: '多功能房',
                clickableLabels: true
            });
            this.addLight('医疗房',{
                enabled: true,
                color: new THREE.Color('#ffffff'),
                intensity: 35,
                width: 4,
                height: 1.5,
                position: [-4, 4.5, -4],  // 调整位置以照射地面
                rotation: [-Math.PI / 2, 0, 0],  // 调整旋转以向下照射
                showLightHelpers: false,
                showLabels: true,
                labelContent: '医疗房',
                clickableLabels: true
            });
            this.addLight('产品展示厅',{
                enabled: true,
                color: new THREE.Color('#ffffff'),
                intensity: 35,
                width: 1.5,
                height: 7,
                position: [-10, 4.5, 0],  // 调整位置以照射地面
                rotation: [-Math.PI / 2, 0, 0],  // 调整旋转以向下照射
                showLightHelpers: false,
                showLabels: true,
                labelContent: '产品展示厅',
                clickableLabels: true
            });
            this.addLight('客厅',{
                enabled: true,
                color: new THREE.Color('#ffffff'),
                intensity: 35,
                width: 6,
                height: 1.5,
                position: [5, 4.5, -4],  // 调整位置以照射地面
                rotation: [-Math.PI / 2, 0, 0],  // 调整旋转以向下照射
                showLightHelpers: false,
                showLabels: true,
                labelContent: '客厅',
                clickableLabels: true
            });
            this.addLight('卧室',{
                enabled: true,
                color: new THREE.Color('#ffffff'),
                intensity: 35,
                width: 3,
                height: 1.5,
                position: [14.5, 4.5, -4],  // 调整位置以照射地面
                rotation: [-Math.PI / 2, 0, 0],  // 调整旋转以向下照射
                showLightHelpers: false,
                showLabels: true,
                labelContent: '卧室',
                clickableLabels: true
            });
        } else {
            console.warn("CeilingLightScript: GLBLoaderScript实例未提供");
        }


    }

    /** 添加灯光 */
    public addLight(key: LightKey, lightConfig:RectAreaLightConfig): void {
        const light = new RectAreaLightScript(lightConfig);
        if (!this.lights.has(key)) {
            this.addScript(light);
            this.lights.set(key, light);
            light.turnOff();
        }
    }

    public removeLight(key: LightKey): void {
        if (this.lights.has(key)) {
            this.lights.delete(key);
        }
    }

    // 通过键获取
    getLight(key: LightKey): RectAreaLightScript | undefined {
        return this.lights.get(key);
    }

    // 检查存在性
    hasLight(key: LightKey): boolean {
        return this.lights.has(key);
    }

    // 获取所有灯光
    getAllLights(): RectAreaLightScript[] {
        return Array.from(this.lights.values());
    }

    // 显示或隐藏所有灯的标签
    toggleAllLightLabels(visible: boolean): void {
        this.lights.forEach((light) => {
            light.setShowLabels(visible);
        });
    }

    // 显示所有灯的标签
    showAllLightLabels(): void {
        this.toggleAllLightLabels(true);
    }

    // 隐藏所有灯的标签
    hideAllLightLabels(): void {
        this.toggleAllLightLabels(false);
    }

    private async loadAllModels(): Promise<void> {
        if (this.configs && this.modelLoader)
            await this.loadModelByConfig(this.configs);
    }

    /**
     * 根据配置加载单个模型
     * @param config 天花板灯配置
     */
    private async loadModelByConfig(config: SmartHomeDeviceConfig): Promise<void> {
        if (!this.modelLoader) {
            throw new Error("GLBLoaderScript未初始化");
        }

        // 加载模型
        const modelResult = await this.modelLoader.loadModel(config.model, {
            position: new THREE.Vector3(config.position[ 0 ], config.position[ 1 ], config.position[ 2 ]),
            rotation: new THREE.Euler(config.rotation[ 0 ], config.rotation[ 1 ], config.rotation[ 2 ]),
            scale: new THREE.Vector3(config.scale[ 0 ], config.scale[ 1 ], config.scale[ 2 ]),
            addToScene: true
        });

        // 确保场景和模型结果都存在
        if (!this.scene || !modelResult || !modelResult.scene) {
            console.warn("场景或模型加载失败");
            return;
        }

        // 设置模型接收和投射阴影
        modelResult.scene.traverse((object: THREE.Object3D) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        if (this.scene) {
            this.scene.traverse((object: THREE.Object3D) => {
                if (!object) return;
                if (object.name === 'qiang' && object instanceof THREE.Mesh) {
                    const geometry = object.geometry;
                    if(!geometry.attributes && !geometry.attributes.uv1) return;
                    object.material = new THREE.MeshStandardMaterial({
                        color: '#6b828a',
                        metalness: 0.2,
                        roughness: 0.9,
                        transparent: true,
                        aoMap : object.material.map,
                        opacity: 0.6,
                        aoMapIntensity : 0.9,
                        depthWrite: true,
                        depthTest: true,
                        blending: THREE.CustomBlending,
                    });
                    object.material.map = null;
                    object.material.needsUpdate = true;
                }

                if (object.name === 'dimian' && object instanceof THREE.Mesh) {
                    const geometry = object.geometry;
                    if(!geometry.attributes && !geometry.attributes.uv1) return;
                    if (!object.material) return;
                    object.material = new THREE.MeshStandardMaterial({
                        color: '#57677a',
                        metalness: 0.1,
                        roughness: 0.9,
                        transparent: false,
                        aoMap : object.material.map,
                        aoMapIntensity : 0.4,
                    });
                    object.material.map = null;
                    object.material.needsUpdate = true;
                }

                if (object.name === 'pingmian' && object instanceof THREE.Mesh) {
                    const geometry = object.geometry;
                    if(!geometry.attributes && !geometry.attributes.uv1) return;
                    if (!object.material) return;
                    object.material = new THREE.MeshStandardMaterial({
                        color: '#1c253c',
                        metalness: 0.1,
                        roughness: 0.9,
                        transparent: false,
                        aoMap : object.material.map,
                        aoMapIntensity : 1,
                    });
                    object.material.map = null;
                    object.material.needsUpdate = true;
                }

                if (object.name === 'ding' && object instanceof THREE.Mesh) {
                    const geometry = object.geometry;
                    if(!geometry.attributes && !geometry.attributes.uv1) return;
                    if (!object.material) return;
                    object.material = new THREE.MeshStandardMaterial({
                        color: '#939393',
                        metalness: 0.1,
                        roughness: 0.9,
                        transparent: false,
                        aoMap : object.material.map,
                        aoMapIntensity : 1,
                        side: THREE.DoubleSide,
                    });
                    object.material.map = null;
                    object.material.needsUpdate = true;
                }
            });
        }
        this.loadedModels.set(config.name, modelResult.scene);
    }
}
