import { ScriptBase } from "../core/ScriptBase";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import {THREE} from "../core/global.ts";
import { ObjectPool } from "../core/PerformanceUtils";
/**
 * GLB加载器配置接口
 * 定义GLB文件加载的所有可配置参数
 */
export interface GLBLoaderConfig {
    /** 是否启用Draco压缩支持 */
    enableDraco?: boolean;
    /** Draco解码器路径 */
    dracoDecoderPath?: string;
    /** 是否自动优化模型 */
    autoOptimize?: boolean;
    /** 是否自动添加到场景 */
    autoAddToScene?: boolean;
    /** 默认材质设置 */
    defaultMaterial?: {
        roughness?: number;
        metalness?: number;
        envMapIntensity?: number;
    };
    /** 覆盖材质 - 如果设置，将使用此材质替换所有模型材质 */
    overrideMaterial?: THREE.Material | null;
    /** 材质 */
    materials?: { [name: string]: THREE.Material } | null;
    /** 模型缩放 */
    scale?: THREE.Vector3;
    /** 模型位置 */
    position?: THREE.Vector3;
    /** 模型旋转 */
    rotation?: THREE.Euler;
}

/**
 * 加载进度信息
 */
export interface LoadProgress {
    loaded: number;
    total: number;
    percentage: number;
    url: string;
}

/**
 * GLB模型加载结果
 */
export interface GLBLoadResult {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
    cameras: THREE.Camera[];
    materials: THREE.Material[];
    parser: any;
    userData: any;
    mixer?: THREE.AnimationMixer;
    actions?: { [name: string]: THREE.AnimationAction };
}

export class GLBLoaderScript extends ScriptBase {
    name = 'GLBLoaderScript';

    /** GLB加载器配置参数 */
    private config: {
        autoOptimize: boolean;
        autoAddToScene: boolean;
        defaultMaterial: { roughness?: number; metalness?: number; envMapIntensity?: number };
        enableDraco: boolean;
        materials: { [name: string]: THREE.Material } | null;
        rotation: THREE.Euler;
        dracoDecoderPath: string;
        scale: THREE.Vector3;
        position: THREE.Vector3;
        overrideMaterial: THREE.Material | null;
    };

    /** GLTF加载器实例 */
    private gltfLoader: GLTFLoader;

    /** Draco加载器实例（可选） */
    private dracoLoader: DRACOLoader | null = null;

    /** 已加载的模型集合，使用URL作为键 */
    private loadedModels = new Map<string, GLBLoadResult>();

    /** 当前正在加载的模型集合 */
    private loadingModels = new Map<string, Promise<GLBLoadResult>>();

    /** 动画混合器集合 */
    private mixers = new Map<string, THREE.AnimationMixer>();

    private materials:THREE.Material | null = null;

    // 性能优化：添加对象池
    private vector3Pool: ObjectPool<THREE.Vector3>;
    private eulerPool: ObjectPool<THREE.Euler>;

    /**
     * 构造函数 - 初始化GLB加载器脚本
     *
     * @param options - 可选的配置参数
     */
    constructor(options?: GLBLoaderConfig) {
        super();

        // 合并默认配置和用户配置
        this.config = {
            enableDraco: false,
            dracoDecoderPath: '/draco/',
            autoOptimize: true,
            autoAddToScene: false,
            defaultMaterial: {
                roughness: 0.5,
                metalness: 0.0,
                envMapIntensity: 1.0
            },
            scale: new THREE.Vector3(1, 1, 1),
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            materials: null,
            overrideMaterial: null,
            ...options
        };

        // 创建GLTF加载器
        this.gltfLoader = new GLTFLoader();

        // 设置Draco加载器
        this.setupDracoLoader();

        // 初始化对象池
        this.vector3Pool = new ObjectPool<THREE.Vector3>(
            () => new THREE.Vector3(),
            (vec) => vec.set(0, 0, 0)
        );

        this.eulerPool = new ObjectPool<THREE.Euler>(
            () => new THREE.Euler(),
            (euler) => euler.set(0, 0, 0)
        );
    }

    /**
     * 脚本唤醒 - IScript 生命周期的第一个阶段
     */
    public override awake(): void {
        super.awake?.();
    }

    /**
     * 脚本启用
     */
    public override onEnable(): void {
        super.onEnable?.();
    }

    public override async start(): Promise<void> {
        super.start?.();
    }

    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
        for (const mixer of this.mixers.values()) {
            mixer.update(deltaTime);
        }
    }

    public override onResize(): void {
        super.onResize();
    }

    public override onDisable(): void {
        super.onDisable?.();
    }

    public override destroy(): void {
        super.destroy?.();
        this.mixers.clear();
        this.loadedModels.clear();
        this.loadingModels.clear();
        if (this.dracoLoader) {
            this.dracoLoader.dispose();
            this.dracoLoader = null;
        }
    }

    // ===========================================
    // 私有方法
    // ===========================================

    /**
     * 设置Draco加载器
     */
    private setupDracoLoader(): void {
        if (this.config.enableDraco) {
            try {
                this.dracoLoader = new DRACOLoader();
                this.dracoLoader.setDecoderPath(this.config.dracoDecoderPath);
                this.gltfLoader.setDRACOLoader(this.dracoLoader);
            } catch (error) {
                console.warn('[GLBLoaderScript] Draco加载器设置失败，已禁用Draco支持:', error);
                this.config.enableDraco = false;
            }
        }
    }

    /**
     * 优化模型
     */
    private optimizeModel(result: GLBLoadResult): void {
        if (!this.config.autoOptimize) return;

        result.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // 启用阴影
                child.castShadow = true;
                child.receiveShadow = true;

                // 如果配置了覆盖材质且不为空，则使用覆盖材质
                if (this.config.overrideMaterial) {
                    child.material = this.config.overrideMaterial;
                }
                // 否则使用默认材质设置
                else if (child.material instanceof THREE.MeshStandardMaterial) {
                    const material = child.material;
                    const defaultMat = this.config.defaultMaterial;

                    // 应用默认材质设置
                    if (defaultMat.roughness !== undefined) {
                        material.roughness = defaultMat.roughness;
                    }
                    if (defaultMat.metalness !== undefined) {
                        material.metalness = defaultMat.metalness;
                    }
                    if (defaultMat.envMapIntensity !== undefined) {
                        material.envMapIntensity = defaultMat.envMapIntensity;
                    }

                    // 设置统一的材质颜色（使用选中代码中的颜色）
                    material.color.setHex(0x151515); // #151515 颜色

                    material.needsUpdate = true;
                }

                // 几何体优化
                if (child.geometry) {
                    // 性能优化：只在必要时计算边界框和包围球
                    if (!child.geometry.boundingBox) {
                        child.geometry.computeBoundingBox();
                    }
                    if (!child.geometry.boundingSphere) {
                        child.geometry.computeBoundingSphere();
                    }
                }
            }
        });
    }

    /**
     * 应用模型变换
     *
     * @param model - 模型对象
     */
    private applyTransforms(model: THREE.Group): void {
        // 从对象池获取Vector3和Euler对象
        const scale = this.vector3Pool.acquire();
        const position = this.vector3Pool.acquire();
        const rotation = this.eulerPool.acquire();

        scale.copy(this.config.scale);
        position.copy(this.config.position);
        rotation.copy(this.config.rotation);

        model.scale.copy(scale);
        model.position.copy(position);
        model.rotation.copy(rotation);

        // 释放对象回对象池
        this.vector3Pool.release(scale);
        this.vector3Pool.release(position);
        this.eulerPool.release(rotation);
    }

    /**
     * 创建动画混合器
     *
     * @param model - 模型对象
     * @param animations - 动画剪辑数组
     * @param url - 模型URL（用作混合器标识）
     * @returns 动画控制对象
     */
    private createAnimationMixer(model: THREE.Object3D, animations: THREE.AnimationClip[], url: string) {
        const mixer = new THREE.AnimationMixer(model);
        const actions: { [name: string]: THREE.AnimationAction } = {};

        // 创建动画动作
        animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            actions[clip.name] = action;
        });

        // 保存混合器
        this.mixers.set(url, mixer);

        return {
            mixer,
            actions,
            play: (animationName: string, loop = true) => {
                const action = actions[animationName];
                if (action) {
                    if (loop) {
                        action.setLoop(THREE.LoopRepeat, Infinity);
                    }
                    action.play();
                }
            },
            stop: (animationName: string) => {
                const action = actions[animationName];
                if (action) {
                    action.stop();
                }
            },
            fadeIn: (animationName: string, duration = 0.5) => {
                const action = actions[animationName];
                if (action) {
                    action.reset().fadeIn(duration).play();
                }
            },
            fadeOut: (animationName: string, duration = 0.5) => {
                const action = actions[animationName];
                if (action) {
                    action.fadeOut(duration);
                }
            },
            crossFade: (fromAnimation: string, toAnimation: string, duration = 1.0) => {
                const fromAction = actions[fromAnimation];
                const toAction = actions[toAnimation];
                if (fromAction && toAction) {
                    fromAction.fadeOut(duration);
                    toAction.reset().fadeIn(duration).play();
                }
            }
        };
    }

    // ===========================================
    // 公共API方法
    // ===========================================

    async loadModel(
        url: string,
        options: {
            onProgress?: (progress: LoadProgress) => void;
            onError?: (error: any) => void;
            addToScene?: boolean;
            position?: THREE.Vector3;
            scale?: THREE.Vector3;
            rotation?: THREE.Euler;
            material?: THREE.Material;
        } = {}
    ): Promise<GLBLoadResult> {
        const cached = this.loadedModels.get(url);
        if (cached) {
            const clonedResult = this.cloneModel(cached);
            if (options.position) {
                // 从对象池获取Vector3对象
                const pos = this.vector3Pool.acquire();
                pos.copy(options.position);
                clonedResult.scene.position.copy(pos);
                // 释放对象回对象池
                this.vector3Pool.release(pos);
            }
            if (options.scale) {
                // 从对象池获取Vector3对象
                const scale = this.vector3Pool.acquire();
                scale.copy(options.scale);
                clonedResult.scene.scale.copy(scale);
                // 释放对象回对象池
                this.vector3Pool.release(scale);
            }
            if (options.rotation) {
                // 从对象池获取Euler对象
                const rot = this.eulerPool.acquire();
                rot.copy(options.rotation);
                clonedResult.scene.rotation.copy(rot);
                // 释放对象回对象池
                this.eulerPool.release(rot);
            }
            if ((options.addToScene ?? this.config.autoAddToScene)) {
                this.addObject(clonedResult.scene);
            }
            return clonedResult;
        }

        // 检查是否正在加载
        const loading = this.loadingModels.get(url);
        if (loading) {
            return loading;
        }

        // 开始新的加载
        const loadPromise = new Promise<GLBLoadResult>((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf: any) => {
                    // 创建加载结果
                    const result: GLBLoadResult = {
                        scene: gltf.scene,
                        animations: gltf.animations || [],
                        cameras: gltf.cameras || [],
                        parser: gltf.parser,
                        materials: gltf.materials || [],
                        userData: gltf.userData || {}
                    };

                    // 优化模型
                    this.optimizeModel(result);

                    // 应用变换
                    this.applyTransforms(result.scene);
                    if (options.position) {
                        // 从对象池获取Vector3对象
                        const pos = this.vector3Pool.acquire();
                        pos.copy(options.position);
                        result.scene.position.copy(pos);
                        // 释放对象回对象池
                        this.vector3Pool.release(pos);
                    }
                    if (options.scale) {
                        // 从对象池获取Vector3对象
                        const scale = this.vector3Pool.acquire();
                        scale.copy(options.scale);
                        result.scene.scale.copy(scale);
                        // 释放对象回对象池
                        this.vector3Pool.release(scale);
                    }
                    if (options.rotation) {
                        // 从对象池获取Euler对象
                        const rot = this.eulerPool.acquire();
                        rot.copy(options.rotation);
                        result.scene.rotation.copy(rot);
                        // 释放对象回对象池
                        this.eulerPool.release(rot);
                    }

                    // 如果提供了material选项，则使用它替换所有材质
                    if (options.material) {
                        result.scene.traverse((child) => {
                            if (child instanceof THREE.Mesh) {
                                child.material = options.material!;
                            }
                        });
                    }

                    // 创建动画混合器
                    if (result.animations.length > 0) {
                        const animationController = this.createAnimationMixer(result.scene, result.animations, url);
                        result.mixer = animationController.mixer;
                        result.actions = animationController.actions;

                        // 添加动画控制方法
                        (result as any).playAnimation = animationController.play;
                        (result as any).stopAnimation = animationController.stop;
                        (result as any).fadeInAnimation = animationController.fadeIn;
                        (result as any).fadeOutAnimation = animationController.fadeOut;
                        (result as any).crossFadeAnimation = animationController.crossFade;
                    }

                    // 添加到场景
                    if ((options.addToScene ?? this.config.autoAddToScene)) {
                        this.addObject(result.scene);
                    } else {
                        console.log('[GLBLoaderScript] 模型未添加到场景中');
                    }

                    // 缓存结果
                    this.loadedModels.set(url, result);
                    this.loadingModels.delete(url);
                    resolve(result);
                },
                (progress: ProgressEvent) => {
                    const progressInfo: LoadProgress = {
                        loaded: progress.loaded,
                        total: progress.total,
                        percentage: progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0,
                        url
                    };

                    if (options.onProgress) {
                        options.onProgress(progressInfo);
                    }
                },
                (error: unknown) => {
                    console.error(`[GLBLoaderScript] 加载GLB模型失败: ${url}`, error);
                    this.loadingModels.delete(url);

                    // 检查错误类型并提供更详细的错误信息
                    let errorMessage = '未知错误';
                    if (error instanceof Error) {
                        errorMessage = error.message;
                        
                        // 检查是否是网络错误（如返回HTML而不是GLB）
                        if (errorMessage.includes('Unexpected token') && errorMessage.includes('<')) {
                            console.warn(`[GLBLoaderScript] 检测到可能的网络错误：服务器返回了HTML而不是GLB文件。URL: ${url}`);
                            console.warn(`[GLBLoaderScript] 请检查文件路径是否正确，或服务器是否正确配置以提供GLB文件。`);
                        }
                    }

                    if (options.onError) {
                        options.onError(error);
                    }

                    reject(error);
                }
            );
        });

        // 记录正在加载的Promise
        this.loadingModels.set(url, loadPromise);

        return loadPromise;
    }

    /**
     * 克隆模型以支持多次使用
     *
     * @param original - 原始模型结果
     * @returns 克隆的模型结果
     */
    private cloneModel(original: GLBLoadResult): GLBLoadResult {
        return {
            scene: original.scene.clone(),
            animations: [...original.animations],
            cameras: [...original.cameras],
            materials: [...original.materials],
            parser: original.parser,
            userData: {...original.userData}
        };
    }

    /**
     * 移除模型
     *
     * @param url - 模型URL
     * @param removeFromScene - 是否从场景中移除
     */
    removeModel(url: string, removeFromScene: boolean = true): void {
        const model = this.loadedModels.get(url);
        if (model && removeFromScene) {
            this.removeObject(model.scene);
        }

        // 清理动画混合器
        const mixer = this.mixers.get(url);
        if (mixer) {
            mixer.stopAllAction();
            this.mixers.delete(url);
        }

        // 从缓存中移除
        this.loadedModels.delete(url);
    }

    /**
     * 获取已加载的模型
     *
     * @param url - 模型URL
     * @returns 模型结果或undefined
     */
    getModel(url: string): GLBLoadResult | undefined {
        return this.loadedModels.get(url);
    }

    /**
     * 获取所有已加载的模型
     *
     * @returns 所有模型的数组
     */
    getAllModels(): { url: string; model: GLBLoadResult }[] {
        return Array.from(this.loadedModels.entries()).map(([url, model]) => ({url, model}));
    }

    clearScene(clearCache: boolean = false): void {
        for (const [url, model] of this.loadedModels.entries()) {
            this.removeObject(model.scene);
            const mixer = this.mixers.get(url);
            if (mixer) {
                mixer.stopAllAction();
                if (clearCache) {
                    this.mixers.delete(url);
                }
            }
        }

        // 如果需要清除缓存
        if (clearCache) {
            this.loadedModels.clear();
            this.loadingModels.clear();
            this.mixers.clear();
        }
    }

    /**
     * 获取场景中当前显示的模型数量
     *
     * @returns 场景中模型的数量
     */
    getSceneModelCount(): number {
        return this.loadedModels.size;
    }

    /**
     * 检查指定模型是否在场景中显示
     *
     * @param url - 模型URL
     * @returns 模型是否在场景中显示
     */
    isModelInScene(url: string): boolean {
        const model = this.loadedModels.get(url);
        if (!model) return false;

        // 检查模型是否在场景中
        return this.scene.children.includes(model.scene);
    }

    /**
     * 将已缓存的模型添加到场景中
     *
     * @param url - 模型URL
     * @returns 是否成功添加到场景
     */
    addModelToScene(url: string): boolean {
        const model = this.loadedModels.get(url);
        if (!model) {
            console.warn(`[GLBLoaderScript] 无法添加模型到场景: ${url}`);
            return false;
        }

        if (this.scene.children.includes(model.scene)) {
            return true;
        }

        this.addObject(model.scene);
        return true;
    }

    /**
     * 从场景中移除指定模型（不清除缓存）
     *
     * @param url - 模型URL
     * @returns 是否成功从场景中移除
     */
    removeModelFromScene(url: string): boolean {
        const model = this.loadedModels.get(url);
        if (!model) {
            console.warn(`[GLBLoaderScript] 无法从场景中移除模型: ${url}`);
            return false;
        }
        this.removeObject(model.scene);
        const mixer = this.mixers.get(url);
        if (mixer) {
            mixer.stopAllAction();
        }
        return true;
    }

    /**
     * 更新配置
     *
     * @param newConfig - 新的配置参数
     */
    updateConfig(newConfig: Partial<GLBLoaderConfig>): void {
        Object.assign(this.config, newConfig);
        if (newConfig.enableDraco !== undefined || newConfig.dracoDecoderPath) {
            this.setupDracoLoader();
        }
    }

    /**
     * 获取当前配置
     *
     * @returns 配置对象的副本
     */
    getConfig(): GLBLoaderConfig {
        return { ...this.config };
    }
}
