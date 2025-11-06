import type { IScript } from "../interface";
import type { Viewport } from "../interface/Viewport";
import { ScriptBase } from "./ScriptBase";
import { PostProcessingEffectComposer } from "./PostProcessingEffectComposer";
import { EventEmitter } from "../events";
import {THREE, TWEEN, TweenGroup} from "../core/global.ts";
import { FrameRateMonitor, DetailedPerformanceProfiler, ObjectPool, BatchDOMUpdater } from "./PerformanceUtils";
import { PerformanceAnalyzerScript } from "../controllers/PerformanceAnalyzerScript";
import { FPSDiagnosticTool } from "../controllers/FPSDiagnosticTool";
import { MouseInteractionScript } from "../controllers/MouseInteractionScript";
import { MetadataManager } from "./MetadataManager";
import { ObjectMetadata } from "./ObjectMetadata";
import { MetaScene } from "./MetaScene";

// 导入Aether3dEvents接口
import type { Aether3dEvents } from "../events/Aether3dEvents";

export class Aether3d extends EventEmitter<Aether3dEvents> {
    private canvas: HTMLCanvasElement;
    private config: Viewport;

    public renderer: THREE.WebGLRenderer;
    private _scene: MetaScene;
    public camera: THREE.PerspectiveCamera;

    /**
     * 场景属性的getter
     */
    public get scene(): MetaScene {
        return this._scene;
    }

    /**
     * 场景属性的setter，确保在设置新场景时正确处理元数据
     */
    public set scene(value: MetaScene) {
        this._scene = value;
        // 如果新场景有元数据管理功能，确保元数据管理器能正确处理
        // 这里可以添加额外的逻辑来处理场景切换时的元数据迁移等操作
    }

    /**
     * 元数据管理器实例
     */
    private metadataManager: MetadataManager = new MetadataManager();

    /**
     * 鼠标交互脚本实例
     */
    private mouseInteractionScript: MouseInteractionScript | null = null;

    /**
     * 鼠标交互回调函数
     */
    private onObjectSelectedCallback: ((object: THREE.Object3D | null) => void) | null = null;
    private onObjectHoveredCallback: ((object: THREE.Object3D | null) => void) | null = null;
    private onObjectDeselectedCallback: ((object: THREE.Object3D | null) => void) | null = null;

    /**
     * 后处理效果Composer
     * @private
     */
    private postProcessingComposer: PostProcessingEffectComposer | null = null;
    private usePostProcessing: boolean = false;

    /**
     * 脚本管理
     * @private
     */
    private scripts: IScript[] = [];
    private startedScripts: Set<IScript> = new Set();

    /**
     * 渲染循环
     * @private
     */
    private isRendering: boolean = false;
    private lastTime: number = 0;
    private frameId: number = 0;

    /**
     * 性能监控
     * @private
     */
    private frameCount: number = 0;
    private lastFpsUpdate: number = 0;

    // 性能优化：添加设备性能检测缓存
    private isHighPerformanceDeviceCached: boolean | null = null;

    // 性能优化：缓存上次尺寸
    private lastWidth: number = 0;
    private lastHeight: number = 0;

    // 帧率监控和性能分析
    private frameRateMonitor: FrameRateMonitor;
    private performanceProfiler: DetailedPerformanceProfiler;
    private lastFps: number = 60;

    // 性能优化：帧率限制
    private targetFps: number = 60;
    private frameInterval: number = 1000 / 60;
    private lastFrameTime: number = 0;

    // 性能优化：渲染跳过机制
    private skipRenderCount: number = 0;
    private maxSkipFrames: number = 2; // 最多跳过2帧

    // 性能分析器
    public performanceAnalyzer: PerformanceAnalyzerScript | null = null;

    // FPS诊断工具
    private fpsDiagnosticTool: FPSDiagnosticTool | null = null;

    // 对象池优化：用于事件对象复用
    private eventObjectPool: ObjectPool<{ deltaTime: number; timestamp: number }>;
    private fpsEventObjectPool: ObjectPool<{ fps: number }>;
    private performanceDropObjectPool: ObjectPool<{ currentFps: number; previousFps: number }>;

    // 批量DOM更新器
    private batchDOMUpdater: BatchDOMUpdater;

    // 批处理优化：脚本方法调用批处理
    private scriptMethodBatch: Array<{ script: IScript; method: keyof IScript; arg?: any }> = [];

    // 渲染批处理优化
    private renderBatchSize: number = 100;
    private objectUpdateQueue: THREE.Object3D[] = [];

    /**
     * 事件处理
     * @private
     */
    private onWindowResize: () => void;

    constructor(config: Viewport) {
        // 必须首先调用 super()
        super();

        this.config = config;
        this.canvas = config.element;
        this.usePostProcessing = config.enablePostProcessing;
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: this.config.antialias,       //抗锯齿
            alpha: this.config.alpha,               //透明通道
            powerPreference:"low-power",
            stencil: true,                          //模板缓冲区
            depth: true,
            logarithmicDepthBuffer: this.config.enableLogarithmicDepthBuffer ?? true
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this._scene = new MetaScene(this.metadataManager);
        this._scene.background = config.backgroundColor ? new THREE.Color(config.backgroundColor) : null;
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.config.aspect,
            0.1,
            1000
        );

        // 初始化鼠标交互脚本（如果配置了）
        if (config.mouseInteraction) {
            this.mouseInteractionScript = new MouseInteractionScript(config.mouseInteraction);
            // 设置鼠标交互回调函数
            this.setupMouseInteractionCallbacks();
            this.addScript(this.mouseInteractionScript);
        }

        //初始化后处理效果Composer（如果启用）
        if (this.usePostProcessing) {
            this.postProcessingComposer = new PostProcessingEffectComposer(this);
        }

        // 设置初始大小
        this.updateRendererSize();

        // 设置事件处理
        this.onWindowResize = this.handleWindowResize.bind(this);
        window.addEventListener('resize', this.onWindowResize);

        // 初始化性能监控
        this.frameRateMonitor = new FrameRateMonitor((fps) => {
            // 使用对象池获取事件对象
            const fpsEvent = this.fpsEventObjectPool.acquire();
            fpsEvent.fps = fps;
            this.emit('performance:fps', fpsEvent);
            // 释放事件对象回对象池
            this.fpsEventObjectPool.release(fpsEvent);

            // 检测性能下降
            if (this.lastFps > 30 && fps < 20) {
                // 使用对象池获取性能下降事件对象
                const dropEvent = this.performanceDropObjectPool.acquire();
                dropEvent.currentFps = fps;
                dropEvent.previousFps = this.lastFps;
                this.emit('performance:drop', dropEvent);
                // 释放事件对象回对象池
                this.performanceDropObjectPool.release(dropEvent);
            }
            this.lastFps = fps;
        });

        this.performanceProfiler = new DetailedPerformanceProfiler();

        // 创建性能分析器（如果启用性能监控）
        if (config.enablePerformanceMonitoring) {
            this.performanceAnalyzer = new PerformanceAnalyzerScript({
                detailedAnalysis: true,
                analysisInterval: 1000
            });
            this.addScript(this.performanceAnalyzer);
        }

        // 创建FPS诊断工具（如果启用性能监控）
        if (config.enablePerformanceMonitoring) {
            this.fpsDiagnosticTool = new FPSDiagnosticTool(this);
            this.fpsDiagnosticTool.start();
        }

        // 初始化对象池
        this.eventObjectPool = new ObjectPool(
            () => ({ deltaTime: 0, timestamp: 0 }),
            (obj) => { obj.deltaTime = 0; obj.timestamp = 0; },
            50
        );

        this.fpsEventObjectPool = new ObjectPool(
            () => ({ fps: 0 }),
            (obj) => { obj.fps = 0; },
            50
        );

        this.performanceDropObjectPool = new ObjectPool(
            () => ({ currentFps: 0, previousFps: 0 }),
            (obj) => { obj.currentFps = 0; obj.previousFps = 0; },
            20
        );

        // 初始化批量DOM更新器
        this.batchDOMUpdater = new BatchDOMUpdater();
    }

    /**
     * 检测是否为高性能设备
     */
    private isHighPerformanceDevice(): boolean {
        if (this.isHighPerformanceDeviceCached !== null) {
            return this.isHighPerformanceDeviceCached;
        }

        // 检测设备性能
        // const isHighPerformance = (
        //     window.devicePixelRatio <= 2 &&
        //     navigator.hardwareConcurrency >= 4 &&
        //     !(navigator as any).connection?.saveData // 不在省电模式下
        // );
        //
        // this.isHighPerformanceDeviceCached = isHighPerformance;
        // return isHighPerformance;
        return true;
    }

    /**
     * 更新渲染器大小
     * @private
     */
    private updateRendererSize(): void {
        // 使用容器的实际尺寸而不是窗口尺寸
        const container = this.renderer.domElement.parentElement;
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        // 如果有容器，使用容器的实际尺寸
        if (container) {
            width = container.clientWidth;
            height = container.clientHeight;
        }

        // 性能优化：只有在尺寸真正改变时才更新
        if (this.lastWidth === width && this.lastHeight === height) {
            return;
        }

        this.lastWidth = width;
        this.lastHeight = height;

        // 更新配置中的大小值
        this.config.dpr.set(width, height);
        this.config.aspect = width / height;

        this.renderer.setSize(width, height);

        // 根据设备性能设置像素比率
        let dpr: number;
        if (this.isHighPerformanceDevice()) {
            dpr = Math.min(2, window.devicePixelRatio);
        } else {
            dpr = Math.min(1.5, window.devicePixelRatio);
        }

        // 只在像素比率真正改变时才更新
        if (this.renderer.getPixelRatio() !== dpr) {
            this.renderer.setPixelRatio(dpr);
        }

        // 启用各种 WebGL 扩展以提高渲染质量
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.85;

        // 更新相机宽高比
        this.camera.aspect = this.config.aspect;
        this.camera.updateProjectionMatrix();
    }

    /**
     * 处理窗口大小调整
     * @private
     */
    private handleWindowResize(): void {
        this.updateRendererSize();
        this.emit('scene:resize', {
            width: this.lastWidth,
            height: this.lastHeight
        });
    }

    /**
     * 启动渲染循环
     */
    public start(): void {
        if (this.isRendering) return;

        this.isRendering = true;
        this.lastTime = performance.now();
        this.lastFrameTime = this.lastTime;
        this.frameId = requestAnimationFrame(this.renderLoop.bind(this));

        // 启动帧率监控
        this.frameRateMonitor.start();

        // 触发渲染开始事件
        this.emit('render:start', { timestamp: this.lastTime });
    }

    /**
     * 停止渲染循环
     */
    public stop(): void {
        if (!this.isRendering) return;

        this.isRendering = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = 0;
        }

        // 停止帧率监控
        this.frameRateMonitor.stop();

        // 触发渲染停止事件
        this.emit('render:stop', { timestamp: performance.now() });
    }

    /**
     * 渲染循环
     */
    private renderLoop(time: number): void {
        if (!this.isRendering) return;

        // 性能优化：帧率限制
        const elapsed = time - this.lastFrameTime;
        if (elapsed < this.frameInterval) {
            // 如果时间不够，跳过这一帧
            this.skipRenderCount++;
            if (this.skipRenderCount <= this.maxSkipFrames) {
                this.frameId = requestAnimationFrame(this.renderLoop.bind(this));
                return;
            }
        }

        this.skipRenderCount = 0;
        this.lastFrameTime = time;

        const deltaTime = Math.min((time - this.lastTime) / 1000, 0.016);
        this.lastTime = time;
        this.updateFpsCounter(time);

        // 使用对象池获取事件对象
        const frameEvent = this.eventObjectPool.acquire();
        frameEvent.deltaTime = deltaTime;
        frameEvent.timestamp = time;
        this.emit('render:frame', frameEvent);
        // 释放事件对象回对象池
        this.eventObjectPool.release(frameEvent);

        // 性能分析：开始帧渲染分析
        this.performanceProfiler.start('frameRender');

        // 统一的TWEEN动画更新 - 解决性能问题（使用新API）
        this.performanceProfiler.start('tweenUpdate');
        TweenGroup.update(time);
        this.performanceProfiler.end('tweenUpdate');

        // 更新帧率监控（使用主渲染循环的时间戳）
        this.frameRateMonitor.updateFromMainLoop(time);

        this.fixedUpdate(1/60);

        // 批处理脚本方法调用
        this.callScriptMethodBatched('onPreRender');
        this.updateScripts(deltaTime);
        this.callScriptMethodBatched('lateUpdate', deltaTime);

        // 批处理渲染调用
        this.batchRender();

        this.callScriptMethodBatched('onPostRender');

        // 性能分析：结束帧渲染分析
        this.performanceProfiler.end('frameRender');

        // 性能优化：使用批量DOM更新器更新Stats
        this.batchDOMUpdater.scheduleUpdate('stats', () => {
        });
        this.frameId = requestAnimationFrame(this.renderLoop.bind(this));
    }

    /**
     * 更新FPS计数器
     * @param time 当前时间戳
     */
    private updateFpsCounter(time: number): void {
        this.frameCount++;

        // 每秒更新一次FPS
        if (time - this.lastFpsUpdate >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / (time - this.lastFpsUpdate));

            // 使用对象池获取事件对象
            const fpsEvent = this.fpsEventObjectPool.acquire();
            fpsEvent.fps = fps;
            this.emit('performance:fps', fpsEvent);
            // 释放事件对象回对象池
            this.fpsEventObjectPool.release(fpsEvent);

            this.frameCount = 0;
            this.lastFpsUpdate = time;
        }
    }

    /**
     * 固定时间步长更新
     */
    private fixedUpdate(fixedTimeStep: number): void {
        // 使用批处理调用脚本方法
        this.callScriptMethodBatched('fixedUpdate', fixedTimeStep);
    }

    /**
     * 更新脚本
     */
    private updateScripts(deltaTime: number): void {
        // 性能优化：只更新活跃脚本
        const scriptsToUpdate: IScript[] = [];

        for (const script of this.scripts) {
            // 缓存方法引用以提高性能
            const startMethod = script.start;
            const updateMethod = script.update;

            // 检查脚本是否已启动，如果没有则调用start方法
            if (!this.startedScripts.has(script) && startMethod) {
                try {
                    const result = startMethod.call(script);
                    if (result instanceof Promise) {
                        result.then(() => {
                            this.startedScripts.add(script);
                        }).catch(error => {
                            console.error(`Error in script start method:`, error);
                        });
                    } else {
                        this.startedScripts.add(script);
                    }
                } catch (error) {
                    console.error(`Error in script start method:`, error);
                }
            }

            // 收集需要更新的脚本
            if (updateMethod && this.startedScripts.has(script)) {
                scriptsToUpdate.push(script);
            }
        }

        // 批处理执行所有脚本更新
        for (const script of scriptsToUpdate) {
            try {
                // 性能分析：开始脚本更新分析
                this.performanceProfiler.start(`script:${script.name || 'unnamed'}`);
                script.update!.call(script, deltaTime);
                // 性能分析：结束脚本更新分析
                this.performanceProfiler.end(`script:${script.name || 'unnamed'}`);
            } catch (error) {
                console.error(`Error in script update method:`, error);
            }
        }
    }

    /**
     * 批处理调用脚本的指定方法
     */
    private callScriptMethodBatched(method: keyof IScript, arg?: any): void {
        // 清空之前的批处理队列
        this.scriptMethodBatch.length = 0;

        // 将所有脚本方法调用添加到批处理队列
        for (const script of this.scripts) {
            const scriptMethod = script[method];
            if (scriptMethod && typeof scriptMethod === 'function') {
                this.scriptMethodBatch.push({ script, method, arg });
            }
        }

        // 批处理执行所有方法调用
        for (const item of this.scriptMethodBatch) {
            try {
                // 性能分析：开始方法调用分析
                this.performanceProfiler.start(`script:${item.script.name || 'unnamed'}:${item.method}`);
                if (item.arg !== undefined) {
                    (item.script[item.method] as (...args: any[]) => void).call(item.script, item.arg);
                } else {
                    (item.script[item.method] as () => void).call(item.script);
                }
                // 性能分析：结束方法调用分析
                this.performanceProfiler.end(`script:${item.script.name || 'unnamed'}:${item.method}`);
            } catch (error) {
                console.error(`Error in script ${item.method} method:`, error);
            }
        }
    }

    /**
     * 批处理渲染调用
     */
    private batchRender(): void {
        if (this.usePostProcessing && this.postProcessingComposer) {
            this.postProcessingComposer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * 批处理对象更新
     * @param objects 要更新的对象数组
     * @param updateFn 更新函数
     * @param deltaTime
     */
    public batchUpdateObjects<T extends THREE.Object3D>(
        objects: T[],
        updateFn: (object: T, deltaTime: number) => void,
        deltaTime: number
    ): void {
        // 直接同步批处理，避免嵌套requestAnimationFrame
        for (let i = 0; i < objects.length; i += this.renderBatchSize) {
            const batch = objects.slice(i, Math.min(i + this.renderBatchSize, objects.length));
            
            for (const object of batch) {
                try {
                    updateFn(object, deltaTime);
                } catch (error) {
                    console.error('[Aether3d] 对象更新失败:', error);
                }
            }
        }
    }

    /**
     * 添加对象到更新队列
     * @param object 要更新的对象
     */
    public queueObjectUpdate(object: THREE.Object3D): void {
        this.objectUpdateQueue.push(object);
    }

    /**
     * 批处理队列中的对象更新
     * @param updateFn 更新函数
     * @param deltaTime 帧时间
     */
    public processObjectUpdateQueue(
        updateFn: (object: THREE.Object3D, deltaTime: number) => void,
        deltaTime: number
    ): void {
        this.batchUpdateObjects(this.objectUpdateQueue, updateFn, deltaTime);
        // 清空队列
        this.objectUpdateQueue.length = 0;
    }

    public disableSelection(modelName: string): void {
        this.mouseInteractionScript?.addExcludedObject(modelName);
    }

    public disableSelections(modelName: string[]): void {
        modelName.forEach(name => {
            this.mouseInteractionScript?.addExcludedObject(name);
        });
    }

    /**
     * 添加脚本
     */
    public addScript(script: IScript): void {
        script.host = this.scene;
        if (script instanceof ScriptBase) {
            script.setRenderer(this);
        }
        if (script.awake) {
            try {
                script.awake.call(script);
            } catch (error) {
                console.error('Error in script awake method:', error);
            }
        }
        if (script.onEnable) {
            try {
                script.onEnable.call(script);
            } catch (error) {
                console.error('Error in script onEnable method:', error);
            }
        }
        this.scripts.push(script);
        this.emit('script:added', { script });
    }

    /**
     * 移除脚本
     */
    public removeScript(script: IScript): void {
        if (script.onDisable) {
            try {
                script.onDisable.call(script);
            } catch (error) {
                console.error('Error in script onDisable method:', error);
            }
        }
        if (script.destroy) {
            try {
                script.destroy.call(script);
            } catch (error) {
                console.error('Error in script destroy method:', error);
            }
        }
        this.startedScripts.delete(script);
        const index = this.scripts.indexOf(script);
        if (index !== -1) {
            this.scripts.splice(index, 1);
        }
        this.emit('script:removed', { script });
    }

    /**
     * 获取渲染器大小
     */
    public getSize(): THREE.Vector2 {
        return new THREE.Vector2(
            this.renderer.domElement.width,
            this.renderer.domElement.height
        );
    }

    /**
     * 设置像素比率
     */
    public setPixelRatio(value: number): void {
        this.renderer.setPixelRatio(value);
    }

    /**
     * 设置大小
     */
    public setSize(rect: THREE.Vector2): void {
        this.renderer.setSize(rect.x, rect.y);
    }

    /**
     * 重新调整大小
     */
    public resize(): void {
        this.updateRendererSize();
        this.emit('scene:resize', {
            width: this.lastWidth,
            height: this.lastHeight
        });
    }

    /**
     * 启用后处理效果
     */
    public enablePostProcessing(): void {
        if (!this.postProcessingComposer) {
            this.postProcessingComposer = new PostProcessingEffectComposer(this);
        }
        this.usePostProcessing = true;
        this.postProcessingComposer.enable();
        this.postProcessingComposer.setPixelRatio( window.devicePixelRatio );
        this.emit('postprocessing:enabled', {});
    }

    /**
     * 禁用后处理效果
     */
    public disablePostProcessing(): void {
        this.usePostProcessing = false;
        if (this.postProcessingComposer) {
            this.postProcessingComposer.disable();
        }
        this.emit('postprocessing:disabled', {});
    }

    /**
     * 检查是否启用了后处理
     */
    public isPostProcessingEnabled(): boolean {
        return this.usePostProcessing && this.postProcessingComposer !== null;
    }

    /**
     * 获取后处理效果Composer实例
     */
    public getPostProcessingComposer(): PostProcessingEffectComposer | null {
        return this.postProcessingComposer;
    }

    /**
     * 直接向后处理Composer添加通道
     * @param pass 要添加的通道
     * @param beforeOutput 是否在输出通道之前插入
     */
    public addPostProcessingPass(pass: any, beforeOutput: boolean = true): void {
        if (this.postProcessingComposer) {
            this.postProcessingComposer.addPass(pass, beforeOutput);
        } else {
            console.warn('[Aether3d] Post-processing composer not available. Enable post-processing first.');
        }
    }

    /**
     * 从后处理Composer中移除通道
     * @param pass 要移除的通道
     */
    public removePostProcessingPass(pass: any): void {
        if (this.postProcessingComposer) {
            this.postProcessingComposer.removePass(pass);
        }
    }

    /**
     * 销毁渲染器
     */
    public dispose(): void {
        // 停止渲染循环
        this.stop();

        // 移除事件监听器
        window.removeEventListener('resize', this.onWindowResize);

        // 销毁所有脚本
        for (const script of this.scripts) {
            this.removeScript(script);
        }

        // 清空脚本列表
        this.scripts = [];
        this.startedScripts.clear();

        // 销毁后处理效果Composer
        if (this.postProcessingComposer) {
            this.postProcessingComposer.dispose();
            this.postProcessingComposer = null;
        }

        // 销毁渲染器
        this.renderer.dispose();

        // 清除所有事件监听器
        this.clear();

        // 重置性能分析器
        this.performanceProfiler.reset();

        // 清理对象池
        (this.eventObjectPool as any).clear?.();
        (this.fpsEventObjectPool as any).clear?.();
        (this.performanceDropObjectPool as any).clear?.();

        // 清理批量DOM更新器
        this.batchDOMUpdater.clear();

        // 清空对象更新队列
        this.objectUpdateQueue.length = 0;
    }

    /**
     * 获取性能分析数据
     */
    public getPerformanceData() {
        return {
            fpsStats: this.frameRateMonitor.getFpsStats(),
            profileData: this.performanceProfiler.getAllResults()
        };
    }

    /**
     * 设置目标帧率
     */
    public setTargetFps(fps: number): void {
        this.targetFps = fps;
        this.frameInterval = 1000 / fps;
    }

    /**
     * 设置对象选择回调函数
     * @param callback 回调函数
     */
    public setOnObjectSelectedCallback(callback: (object: THREE.Object3D | null) => void): void {
        this.onObjectSelectedCallback = callback;
        
        // 如果鼠标交互脚本已经存在，重新设置回调
        if (this.mouseInteractionScript) {
            this.mouseInteractionScript.setOnObjectSelectedCallback(callback);
        }
    }

    /**
     * 设置对象取消选择回调函数
     * @param callback 回调函数
     */
    public setOnObjectDeselectedCallback(callback: (object: THREE.Object3D | null) => void): void {
        this.onObjectDeselectedCallback = callback;
        
        // 如果鼠标交互脚本已经存在，重新设置回调
        if (this.mouseInteractionScript) {
            this.mouseInteractionScript.setOnObjectDeselectedCallback(callback);
        }
    }

    /**
     * 设置对象悬停回调函数
     * @param callback 回调函数
     */
    public setOnObjectHoveredCallback(callback: (object: THREE.Object3D | null) => void): void {
        this.onObjectHoveredCallback = callback;
        
        // 如果鼠标交互脚本已经存在，重新设置回调
        if (this.mouseInteractionScript) {
            this.mouseInteractionScript.setOnObjectHoveredCallback(callback);
        }
    }

    /**
     * 获取鼠标交互脚本实例
     */
    public getMouseInteractionScript(): MouseInteractionScript | null {
        return this.mouseInteractionScript;
    }

    /**
     * 设置鼠标交互配置
     */
    public setMouseInteractionConfig(config: Partial<import("../controllers/MouseInteractionScript").MouseInteractionConfig>): void {
        if (this.mouseInteractionScript) {
            this.mouseInteractionScript.updateConfig(config);
        } else {
            // 如果还没有鼠标交互脚本，则创建一个
            this.mouseInteractionScript = new MouseInteractionScript(config);
            // 设置鼠标交互回调函数
            this.setupMouseInteractionCallbacks();
            this.addScript(this.mouseInteractionScript);
        }
    }

    /**
     * 获取元数据管理器实例
     * @returns 元数据管理器实例
     */
    public getMetadataManager(): MetadataManager {
        return this.metadataManager;
    }

    /**
     * 为对象创建元数据
     * @param object 3D对象
     * @param name 对象名称
     * @param type 对象类型
     * @returns 元数据对象
     */
    public createObjectMetadata(object: THREE.Object3D, name: string, type: string): ObjectMetadata {
        return this.metadataManager.createObjectMetadata(object, name, type);
    }

    /**
     * 为图层创建元数据
     * @param layerId 图层ID
     * @param name 图层名称
     * @returns 元数据对象
     */
    public createLayerMetadata(layerId: string, name: string): ObjectMetadata {
        return this.metadataManager.createLayerMetadata(layerId, name);
    }

    /**
     * 获取对象的元数据
     * @param object 3D对象
     * @returns 元数据对象，如果不存在则返回undefined
     */
    public getObjectMetadata(object: THREE.Object3D): ObjectMetadata | undefined {
        return this.metadataManager.getObjectMetadata(object);
    }

    /**
     * 获取图层的元数据
     * @param layerId 图层ID
     * @returns 元数据对象，如果不存在则返回undefined
     */
    public getLayerMetadata(layerId: string): ObjectMetadata | undefined {
        return this.metadataManager.getLayerMetadata(layerId);
    }

    /**
     * 更新对象元数据
     * @param object 3D对象
     * @param updates 更新内容
     */
    public updateObjectMetadata(object: THREE.Object3D, updates: Partial<ObjectMetadata>): void {
        this.metadataManager.updateObjectMetadata(object, updates);
    }

    /**
     * 更新图层元数据
     * @param layerId 图层ID
     * @param updates 更新内容
     */
    public updateLayerMetadata(layerId: string, updates: Partial<ObjectMetadata>): void {
        this.metadataManager.updateLayerMetadata(layerId, updates);
    }

    /**
     * 删除对象元数据
     * @param object 3D对象
     */
    public removeObjectMetadata(object: THREE.Object3D): void {
        this.metadataManager.removeObjectMetadata(object);
    }

    /**
     * 删除图层元数据
     * @param layerId 图层ID
     */
    public removeLayerMetadata(layerId: string): void {
        this.metadataManager.removeLayerMetadata(layerId);
    }

    /**
     * 运行FPS诊断
     */
    public runFPSDiagnostics(): any {
        if (this.fpsDiagnosticTool) {
            return this.fpsDiagnosticTool.getReport();
        }
        return null;
    }

    /**
     * 获取优化建议
     */
    public getOptimizationSuggestions(): string[] {
        if (this.fpsDiagnosticTool) {
            return this.fpsDiagnosticTool.generateOptimizationSuggestions();
        }
        return [];
    }

    /**
     * 设置鼠标交互回调函数
     */
    private setupMouseInteractionCallbacks(): void {
        if (this.mouseInteractionScript) {
            // 添加对象选择回调
            this.mouseInteractionScript.addOnObjectSelectedCallback((object: THREE.Object3D | null) => {
                // 触发引擎级别的鼠标选择事件
                this.emit('mouse:objectSelected', { object });
                
                // 输出对象元数据信息
                if (object) {
                  this.outputObjectMetadata(object);
                }
                
                // 调用外部设置的回调函数（如果有的话）
                if (this.onObjectSelectedCallback) {
                    this.onObjectSelectedCallback(object);
                }
            });

            // 添加对象取消选择回调
            this.mouseInteractionScript.addOnObjectDeselectedCallback((object: THREE.Object3D | null) => {
                // 触发引擎级别的鼠标取消选择事件
                this.emit('mouse:objectDeselected', { object });
                
                // 调用外部设置的回调函数（如果有的话）
                if (this.onObjectDeselectedCallback) {
                    this.onObjectDeselectedCallback(object);
                }
            });

            // 添加对象悬停回调
            this.mouseInteractionScript.addOnObjectHoveredCallback((object: THREE.Object3D | null) => {
                // 触发引擎级别的鼠标悬停事件
                this.emit('mouse:objectHovered', { object });
                
                // 调用外部设置的回调函数（如果有的话）
                if (this.onObjectHoveredCallback) {
                    this.onObjectHoveredCallback(object);
                }
            });

            // 添加要排除的图层（系统图层）
            this.mouseInteractionScript?.addExcludedLayer('layer0');
            console.log('[Aether3d] 已添加图层0到排除列表');
            // 检查排除的图层列表
            const excludedLayers = this.mouseInteractionScript?.getExcludedLayers();
            console.log('[Aether3d] 当前排除的图层:', excludedLayers);
        }
    }
    
    /**
     * 输出对象元数据信息
     * @param object 3D对象
     */
    private outputObjectMetadata(object: THREE.Object3D): void {
        try {
            // 获取对象的元数据
            const metadata = this._scene.getMetadataManager().getObjectMetadata(object);
            
            if (metadata) {
                // 输出元数据信息到控制台
                console.log('[Aether3d] 选中对象元数据:', {
                  id: metadata.id,
                  name: metadata.name,
                  type: metadata.type,
                  tags: metadata.tags,
                  layerId: metadata.layerId,
                  locked: metadata.locked,
                  visible: metadata.visible,
                  createdAt: metadata.createdAt,
                  updatedAt: metadata.updatedAt,
                  version: metadata.version
                });
            } else {
                // 如果没有找到元数据，输出基本信息
                console.log('[Aether3d] 选中对象（无元数据）:', {
                  name: object.name,
                  type: object.type,
                  id: object.userData?.id
                });
            }
        } catch (error) {
            console.error('[Aether3d] 输出对象元数据时出错:', error);
        }
    }
}
