import {ScriptBase} from "../../../../Engine/core/ScriptBase";
import {THREE} from "../../../../Engine/core/global";
import type {GLBLoaderScript} from "../../../../Engine/controllers/GLBLoaderScript.ts";
import { RectAreaLightScript } from "../../../../Engine/controllers";
import {RectAreaLightConfig} from "../../../../Engine/controllers/RectAreaLightScript.ts";
import {SpotlightScript} from "../../../../Engine/controllers/SpotlightScript.ts";
import {loadTexture} from "../../../../Engine/math";

// import {MirrorReflectionScript} from "../../../../Engine/controllers/MirrorReflectionScript.ts";

// 性能优化：灯光级别配置
export enum LightLOD {
    HIGH = 0,    // 高质量：始终渲染
    MEDIUM = 1,  // 中等质量：距离阈值内渲染
    LOW = 2      // 低质量：仅在近距离渲染
}

// 渲染质量级别
export enum RenderQuality {
    ULTRA = 0,   // 超高质量：所有效果开启
    HIGH = 1,    // 高质量：标准效果
    MEDIUM = 2,  // 中等质量：部分效果关闭
    LOW = 3,     // 低质量：最少效果
    MINIMAL = 4  // 最低质量：仅基础渲染
}

// 性能优化：灯光性能配置
export interface LightPerformanceConfig {
    /** 灯光级别 */
    lod: LightLOD;
    /** 最大渲染距离 */
    maxDistance: number;
    /** 是否启用视锥体裁剪 */
    enableFrustumCulling: boolean;
    /** 更新频率（帧数间隔） */
    updateInterval: number;
    /** 是否在摄像机移动时才更新 */
    updateOnCameraMove: boolean;
    /** 渲染质量级别 */
    renderQuality: RenderQuality;
    /** 动态质量调整 */
    enableDynamicQuality: boolean;
}

export interface SmartHomeDeviceConfig {
    name: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    model: string;
}

// 定义唯一键类型（建议使用字符串或数字）
type LightKey = string | number;

// 扩展灯光配置接口
export interface SmartHomeLightConfig extends RectAreaLightConfig {
    /** 性能配置 */
    performance?: LightPerformanceConfig;
    /** 是否为关键灯光（关键灯光不会被自动优化关闭） */
    isCritical?: boolean;
}

// 添加灯光控制接口
export interface SmartHomeSceneInterface {
    /** 添加灯光 */
    addLight(key: LightKey, lightConfig: SmartHomeLightConfig): void;
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
    /** 性能优化：根据摄像机位置优化灯光 */
    optimizeLightsByCamera(camera: THREE.Camera): void;
    /** 性能优化：设置全局性能级别 */
    setGlobalPerformanceLevel(level: LightLOD): void;
    /** 设置全局渲染质量 */
    setGlobalRenderQuality(quality: RenderQuality): void;
    /** 获取当前性能统计 */
    getPerformanceStats(): {
        fps: number;
        activeLights: number;
        renderQuality: RenderQuality;
        optimizations: any;
    };
    /** 自动调整渲染质量 */
    enableAutoQualityAdjustment(enabled: boolean): void;
}

export class SmartHomeScene extends ScriptBase implements SmartHomeSceneInterface {
    private modelLoader: GLBLoaderScript | null = null;
    private configs: SmartHomeDeviceConfig | null = null;
    private loadedModels: Map<string, THREE.Group> = new Map();
    private lights: Map<LightKey, RectAreaLightScript> = new Map();

    // 性能优化相关属性
    private lightConfigs: Map<LightKey, SmartHomeLightConfig> = new Map();
    private globalPerformanceLevel: LightLOD = LightLOD.HIGH;
    private globalRenderQuality: RenderQuality = RenderQuality.HIGH;
    private frameCount: number = 0;
    private lastCameraPosition: THREE.Vector3 = new THREE.Vector3();
    private cameraMovementThreshold: number = 0.5;
    private performanceUpdateInterval: number = 10; // 每10帧检查一次性能
    private qiangMianTexture:THREE.Texture | null = null;
    // 性能监控
    private fpsHistory: number[] = [];
    private averageFPS: number = 60;
    private performanceThresholds = {
        excellent: 55,  // 优秀性能阈值
        good: 45,      // 良好性能阈值
        acceptable: 30, // 可接受性能阈值
        poor: 20       // 低性能阈值
    };

    // 渲染优化状态
    private renderOptimizations = {
        shadowsEnabled: true,
        animationsEnabled: true,
        labelsEnabled: true,
        helpersEnabled: false,
        dynamicQualityEnabled: true
    };
    constructor(modelLoader: GLBLoaderScript, configs: SmartHomeDeviceConfig) {
        super();
        this.name = "SmartHomeScene";
        this.modelLoader = modelLoader;
        this.configs = configs;
    }

    public start(): void {
        // 加载纹理
        loadTexture('/images/6803941_cd79024943f4faaf1ce25d8b31af9bcc.png').then(texture => { this.qiangMianTexture = texture; });
        if (this.modelLoader) {
            // 加载所有配置的模型
            this.loadAllModels().then();
           
            // 性能优化：使用新的配置结构
            this.addLight('学习房',{
                enabled: true,
                color: new THREE.Color('#ffffff'),
                intensity: 35,
                width: 2.5,
                height: 2.5,
                position: [-4, 4.5, 3],
                rotation: [-Math.PI / 2, 0, 0],
                showLightHelpers: false,
                showLabels: true,
                labelContent: '学习房',
                clickableLabels: true,
                enableTweenAnimation: true,
                performance: {
                    lod: LightLOD.HIGH,
                    maxDistance: 50,
                    enableFrustumCulling: true,
                    updateInterval: 1,
                    updateOnCameraMove: true,
                    renderQuality: RenderQuality.ULTRA,
                    enableDynamicQuality: false
                },
                isCritical: true
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
                clickableLabels: true,
                enableTweenAnimation:true
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
                clickableLabels: true,
                enableTweenAnimation:false
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
                clickableLabels: true,
                enableTweenAnimation:false
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
                clickableLabels: true,
                enableTweenAnimation:false
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
                clickableLabels: true,
                enableTweenAnimation:false
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
                clickableLabels: true,
                enableTweenAnimation:false
            });

            const slin = new SpotlightScript({ enableAmbientLight: true,spotLightIntensity: 306 , enableSpotLight: true,spotLightAngle: Math.PI / 3,spotLightPosition:[4, 5.3, 2],spotLightTarget:[4, 0, 2],showLightHelpers:false });
            this.addScript(slin);

            // const slin1 = new SpotlightScript({ enableAmbientLight: true,spotLightIntensity: 306 , enableSpotLight: true,spotLightAngle: Math.PI / 3,spotLightPosition:[4, 5.3, 2],spotLightTarget:[4, 0, 2] });
            // this.addScript(slin1);


            // const slin2 = new SpotlightScript({ enableAmbientLight: true,spotLightIntensity: 306 , enableSpotLight: true,spotLightAngle: Math.PI / 3,spotLightPosition:[4, 5.3, 2],spotLightTarget:[4, 0, 2] });
            // this.addScript(slin2);

            // const slin3 = new SpotlightScript({ enableAmbientLight: true,spotLightIntensity: 306 , enableSpotLight: true,spotLightAngle: Math.PI / 3,spotLightPosition:[4, 5.3, 2],spotLightTarget:[4, 0, 2] });
            // this.addScript(slin3);

            // const slin4 = new SpotlightScript({ enableAmbientLight: true,spotLightIntensity: 306 , enableSpotLight: true,spotLightAngle: Math.PI / 3,spotLightPosition:[4, 5.3, 2],spotLightTarget:[4, 0, 2] });
            // this.addScript(slin4);

            // const slin5 = new SpotlightScript({ enableAmbientLight: true,spotLightIntensity: 306 , enableSpotLight: true,spotLightAngle: Math.PI / 3,spotLightPosition:[4, 5.3, 2],spotLightTarget:[4, 0, 2] });
            // this.addScript(slin5);

            // const slin6 = new SpotlightScript({ enableAmbientLight: true,spotLightIntensity: 306 , enableSpotLight: true,spotLightAngle: Math.PI / 3,spotLightPosition:[5, 5.3, 2],spotLightTarget:[5, 0, 2] });
            // this.addScript(slin6);
        } else {
            console.warn("CeilingLightScript: GLBLoaderScript实例未提供");
        }
    }

    /** 添加灯光 */
    public addLight(key: LightKey, lightConfig: SmartHomeLightConfig): void {
        // 保存完整配置
        this.lightConfigs.set(key, lightConfig);

        // 提取RectAreaLightConfig部分
        const { performance, isCritical, ...rectAreaConfig } = lightConfig;

        const light = new RectAreaLightScript(rectAreaConfig);
        if (!this.lights.has(key)) {
            this.addScript(light);
            this.lights.set(key, light);
            light.turnOff();
        }
    }

    public removeLight(key: LightKey): void {
        if (this.lights.has(key)) {
            const light = this.lights.get(key);
            if (light) {
                this.removeScript(light);
            }
            this.lights.delete(key);
            this.lightConfigs.delete(key);
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

    // 性能优化：根据摄像机位置优化灯光
    public optimizeLightsByCamera(camera: THREE.Camera): void {
        const cameraPosition = camera.position;

        this.lights.forEach((light, key) => {
            const config = this.lightConfigs.get(key);
            if (!config || config.isCritical) return; // 关键灯光不优化

            const lightPosition = new THREE.Vector3(...config.position!);
            const distance = cameraPosition.distanceTo(lightPosition);

            const performance = config.performance || {
                lod: LightLOD.MEDIUM,
                maxDistance: 30,
                enableFrustumCulling: true,
                updateInterval: 2,
                updateOnCameraMove: false
            };

            // 根据距离和级别决定是否启用
            const shouldEnable = this.shouldEnableLight(distance, performance.lod, performance.maxDistance);

            if (shouldEnable && !light.isLightOn()) {
                light.turnOn();
            } else if (!shouldEnable && light.isLightOn()) {
                light.turnOff();
            }

            // 调整动画设置
            if (distance > performance.maxDistance * 0.7) {
                light.setTweenEnabled(false); // 远距离关闭动画
            } else {
                light.setTweenEnabled(config.enableTweenAnimation || false);
            }
        });
    }

    // 性能优化：设置全局性能级别
    public setGlobalPerformanceLevel(level: LightLOD): void {
        this.globalPerformanceLevel = level;

        // 根据性能级别调整所有灯光
        this.lights.forEach((light, key) => {
            const config = this.lightConfigs.get(key);
            if (!config || config.isCritical) return;

            this.applyPerformanceLevelToLight(light, config, level);
        });

        console.log(`性能级别已设置为: ${LightLOD[level]}`);
    }

    // 设置全局渲染质量
    public setGlobalRenderQuality(quality: RenderQuality): void {
        this.globalRenderQuality = quality;

        // 根据质量级别调整渲染设置
        this.applyRenderQualitySettings(quality);

        // 应用到所有灯光
        this.lights.forEach((light, key) => {
            const config = this.lightConfigs.get(key);
            if (!config || config.isCritical) return;

            this.applyRenderQualityToLight(light, config, quality);
        });

        console.log(`渲染质量已设置为: ${RenderQuality[quality]}`);
    }

    // 获取当前性能统计
    public getPerformanceStats(): {
        fps: number;
        activeLights: number;
        renderQuality: RenderQuality;
        optimizations: any;
    } {
        const activeLights = Array.from(this.lights.values()).filter(light => light.isLightOn()).length;

        return {
            fps: this.averageFPS,
            activeLights,
            renderQuality: this.globalRenderQuality,
            optimizations: { ...this.renderOptimizations }
        };
    }

    // 自动调整渲染质量
    public enableAutoQualityAdjustment(enabled: boolean): void {
        this.renderOptimizations.dynamicQualityEnabled = enabled;
        console.log(`自动质量调整: ${enabled ? '已启用' : '已禁用'}`);
    }

    // 判断是否应该启用灯光
    private shouldEnableLight(distance: number, lod: LightLOD, maxDistance: number): boolean {
        switch (lod) {
            case LightLOD.HIGH:
                return true; // 始终启用
            case LightLOD.MEDIUM:
                return distance <= maxDistance;
            case LightLOD.LOW:
                return distance <= maxDistance * 0.5;
            default:
                return true;
        }
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
                        color: '#2b3337',
                        metalness: 0.1,
                        roughness: 0.6,
                        transparent: true,
                        aoMap : object.material.map,
                        opacity: 0.6,
                        aoMapIntensity : 0.5,
                        depthWrite: true,
                        depthTest: true,
                        blending: THREE.CustomBlending,
                    });
                    object.material.map = this.qiangMianTexture;
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
                        aoMapIntensity : 1,
                    });
                    // object.material.map = this.qiangMianTexture;
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
                    object.material.map = this.qiangMianTexture;
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
                    object.material.map = this.qiangMianTexture;
                    object.material.needsUpdate = true;
                }
            });
        }
        this.loadedModels.set(config.name, modelResult.scene);
    }

    // 应用性能级别到单个灯光
    private applyPerformanceLevelToLight(light: RectAreaLightScript, config: SmartHomeLightConfig, level: LightLOD): void {
        switch (level) {
            case LightLOD.LOW:
                light.setTweenEnabled(false);
                light.setShowLabels(false);
                // 低质量模式：关闭所有非关键动画
                break;
            case LightLOD.MEDIUM:
                light.setTweenEnabled(config.enableTweenAnimation || false);
                light.setShowLabels(true);
                break;
            case LightLOD.HIGH:
                light.setTweenEnabled(config.enableTweenAnimation || false);
                light.setShowLabels(config.showLabels !== false);
                break;
        }
    }

    // 应用渲染质量设置
    private applyRenderQualitySettings(quality: RenderQuality): void {
        switch (quality) {
            case RenderQuality.MINIMAL:
                this.renderOptimizations.shadowsEnabled = false;
                this.renderOptimizations.animationsEnabled = false;
                this.renderOptimizations.labelsEnabled = false;
                this.renderOptimizations.helpersEnabled = false;
                break;
            case RenderQuality.LOW:
                this.renderOptimizations.shadowsEnabled = false;
                this.renderOptimizations.animationsEnabled = false;
                this.renderOptimizations.labelsEnabled = true;
                this.renderOptimizations.helpersEnabled = false;
                break;
            case RenderQuality.MEDIUM:
                this.renderOptimizations.shadowsEnabled = true;
                this.renderOptimizations.animationsEnabled = false;
                this.renderOptimizations.labelsEnabled = true;
                this.renderOptimizations.helpersEnabled = false;
                break;
            case RenderQuality.HIGH:
                this.renderOptimizations.shadowsEnabled = true;
                this.renderOptimizations.animationsEnabled = true;
                this.renderOptimizations.labelsEnabled = true;
                this.renderOptimizations.helpersEnabled = false;
                break;
            case RenderQuality.ULTRA:
                this.renderOptimizations.shadowsEnabled = true;
                this.renderOptimizations.animationsEnabled = true;
                this.renderOptimizations.labelsEnabled = true;
                this.renderOptimizations.helpersEnabled = true;
                break;
        }
    }

    // 应用渲染质量到单个灯光
    private applyRenderQualityToLight(light: RectAreaLightScript, config: SmartHomeLightConfig, quality: RenderQuality): void {
        // 根据质量设置调整灯光属性
        switch (quality) {
            case RenderQuality.MINIMAL:
            case RenderQuality.LOW:
                light.setTweenEnabled(false);
                light.setShowLabels(false);
                // 可以设置更低的强度或关闭阴影
                break;
            case RenderQuality.MEDIUM:
                light.setTweenEnabled(false);
                light.setShowLabels(this.renderOptimizations.labelsEnabled);
                break;
            case RenderQuality.HIGH:
            case RenderQuality.ULTRA:
                light.setTweenEnabled((config.enableTweenAnimation || false) && this.renderOptimizations.animationsEnabled);
                light.setShowLabels((config.showLabels !== false) && this.renderOptimizations.labelsEnabled);
                break;
        }
    }

    // 更新FPS统计
    private updateFPSStats(fps: number): void {
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > 30) { // 保持30帧的历史
            this.fpsHistory.shift();
        }

        // 计算平均FPS
        this.averageFPS = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
    }

    // 动态质量调整
    private dynamicQualityAdjustment(): void {
        if (!this.renderOptimizations.dynamicQualityEnabled) return;

        const stats = this.getPerformanceStats();

        if (stats.fps < this.performanceThresholds.poor) {
            // 性能过低，降低质量
            if (this.globalRenderQuality > RenderQuality.MINIMAL) {
                this.setGlobalRenderQuality(this.globalRenderQuality + 1);
                console.log('性能优化：自动降低渲染质量');
            }
        } else if (stats.fps > this.performanceThresholds.excellent) {
            // 性能优秀，可以提高质量
            if (this.globalRenderQuality > RenderQuality.ULTRA) {
                this.setGlobalRenderQuality(this.globalRenderQuality - 1);
                console.log('性能优化：自动提高渲染质量');
            }
        }
    }
}
