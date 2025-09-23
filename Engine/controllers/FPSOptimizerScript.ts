import { ScriptBase } from "../core/ScriptBase";
import { THREE } from "../core/global.ts";

/**
 * FPS优化脚本
 * 专门用于诊断和优化低FPS问题
 */
export class FPSOptimizerScript extends ScriptBase {
    name = 'FPSOptimizerScript';

    // 性能监控
    private currentFps: number = 0;
    private frameTimes: number[] = [];
    private lastFrameTime: number = 0;

    // 优化设置
    private targetFps: number = 60;
    private maxFrameTime: number = 1000 / 60; // 60 FPS对应的毫秒数

    // 自适应优化
    private adaptiveOptimization: boolean = true;
    private optimizationLevel: 'low' | 'medium' | 'high' = 'medium';

    // 优化策略
    private optimizations: {
        reduceDrawCalls: boolean;
        lowerTextureQuality: boolean;
        disableShadows: boolean;
        reducePostProcessing: boolean;
        limitObjects: boolean;
        throttleUpdates: boolean;
    } = {
        reduceDrawCalls: false,
        lowerTextureQuality: false,
        disableShadows: false,
        reducePostProcessing: false,
        limitObjects: false,
        throttleUpdates: false
    };

    // 对象限制
    private maxObjects: number = 1000;
    private hiddenObjects: THREE.Object3D[] = [];

    // 更新节流
    private updateThrottle: number = 0;
    private lastUpdateCheck: number = 0;

    constructor(options?: {
        targetFps?: number;
        adaptiveOptimization?: boolean;
        maxObjects?: number;
    }) {
        super();

        if (options) {
            this.targetFps = options.targetFps ?? 60;
            this.adaptiveOptimization = options.adaptiveOptimization ?? true;
            this.maxObjects = options.maxObjects ?? 1000;
        }

        this.maxFrameTime = 1000 / this.targetFps;
    }

    /**
     * 脚本初始化
     */
    public override async start(): Promise<void> {
        super.start?.();
        this.lastFrameTime = performance.now();
    }

    /**
     * 每帧更新时调用
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);

        const currentTime = performance.now();
        const frameTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // 记录帧时间
        this.frameTimes.push(frameTime);
        if (this.frameTimes.length > 60) {
            this.frameTimes.shift();
        }

        // 计算当前FPS
        this.currentFps = this.frameTimes.length > 0 ?
            Math.round(1000 / (this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length)) : 0;

        // 自适应优化
        if (this.adaptiveOptimization) {
            this.applyAdaptiveOptimization();
        }

        // 应用优化策略
        this.applyOptimizations();
    }

    /**
     * 应用自适应优化
     */
    private applyAdaptiveOptimization(): void {
        if (this.frameTimes.length < 30) return;

        const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

        // 根据帧时间调整优化级别
        if (avgFrameTime > this.maxFrameTime * 2) {
            // FPS < 30，应用高级优化
            this.optimizationLevel = 'high';
            this.enableAllOptimizations();
        } else if (avgFrameTime > this.maxFrameTime * 1.5) {
            // FPS < 40，应用中级优化
            this.optimizationLevel = 'medium';
            this.enableMediumOptimizations();
        } else if (avgFrameTime > this.maxFrameTime) {
            // FPS < 60，应用基础优化
            this.optimizationLevel = 'low';
            this.enableLowOptimizations();
        } else {
            // FPS正常，减少优化
            this.optimizationLevel = 'low';
            this.disableAggressiveOptimizations();
        }
    }

    /**
     * 启用所有优化
     */
    private enableAllOptimizations(): void {
        this.optimizations = {
            reduceDrawCalls: true,
            lowerTextureQuality: true,
            disableShadows: true,
            reducePostProcessing: true,
            limitObjects: true,
            throttleUpdates: true
        };
    }

    /**
     * 启用中级优化
     */
    private enableMediumOptimizations(): void {
        this.optimizations = {
            reduceDrawCalls: true,
            lowerTextureQuality: true,
            disableShadows: false,
            reducePostProcessing: true,
            limitObjects: true,
            throttleUpdates: true
        };
    }

    /**
     * 启用基础优化
     */
    private enableLowOptimizations(): void {
        this.optimizations = {
            reduceDrawCalls: true,
            lowerTextureQuality: false,
            disableShadows: false,
            reducePostProcessing: false,
            limitObjects: false,
            throttleUpdates: true
        };
    }

    /**
     * 禁用激进优化
     */
    private disableAggressiveOptimizations(): void {
        this.optimizations.disableShadows = false;
        this.optimizations.lowerTextureQuality = false;
        this.optimizations.throttleUpdates = false;
    }

    /**
     * 应用优化策略
     */
    private applyOptimizations(): void {
        if (!this.scene || !this.renderer) return;

        // 限制对象数量
        if (this.optimizations.limitObjects) {
            this.limitObjects();
        } else {
            this.restoreHiddenObjects();
        }

        // 节流更新
        if (this.optimizations.throttleUpdates) {
            this.throttleUpdates();
        }

        // 减少绘制调用
        if (this.optimizations.reduceDrawCalls) {
            this.reduceDrawCalls();
        }

        // 降低纹理质量
        if (this.optimizations.lowerTextureQuality) {
            this.lowerTextureQuality();
        }

        // 禁用阴影
        if (this.optimizations.disableShadows) {
            this.disableShadows();
        }
    }

    /**
     * 限制对象数量
     */
    private limitObjects(): void {
        const objectCount = this.scene.children.length;
        if (objectCount > this.maxObjects) {
            // 隐藏超出限制的对象
            for (let i = this.maxObjects; i < objectCount; i++) {
                const obj = this.scene.children[i];
                if (obj.visible) {
                    obj.visible = false;
                    this.hiddenObjects.push(obj);
                }
            }
        }
    }

    /**
     * 恢复隐藏的对象
     */
    private restoreHiddenObjects(): void {
        if (this.hiddenObjects.length > 0) {
            this.hiddenObjects.forEach(obj => {
                obj.visible = true;
            });
            this.hiddenObjects = [];
        }
    }

    /**
     * 节流更新
     */
    private throttleUpdates(): void {
        const currentTime = performance.now();
        if (currentTime - this.lastUpdateCheck < 16) { // 限制到约60Hz
            return;
        }
        this.lastUpdateCheck = currentTime;
    }

    /**
     * 减少绘制调用
     */
    private reduceDrawCalls(): void {
        // 合并静态几何体
        // 这里可以实现几何体合并逻辑
        // 暂时只记录日志
    }

    /**
     * 降低纹理质量
     */
    private lowerTextureQuality(): void {
        // 降低纹理分辨率
        // 暂时只记录日志
    }

    /**
     * 禁用阴影
     */
    private disableShadows(): void {
        this.scene.traverse(obj => {
            if (obj instanceof THREE.Mesh) {
                obj.castShadow = false;
                obj.receiveShadow = false;
            }
        });
        if (this.webGLRenderer) {
            this.webGLRenderer.shadowMap.enabled = false;
        }
    }

    /**
     * 获取当前FPS
     */
    public getCurrentFps(): number {
        return this.currentFps;
    }

    /**
     * 获取优化级别
     */
    public getOptimizationLevel(): 'low' | 'medium' | 'high' {
        return this.optimizationLevel;
    }

    /**
     * 手动设置优化级别
     */
    public setOptimizationLevel(level: 'low' | 'medium' | 'high'): void {
        this.optimizationLevel = level;
        switch (level) {
            case 'high':
                this.enableAllOptimizations();
                break;
            case 'medium':
                this.enableMediumOptimizations();
                break;
            case 'low':
                this.enableLowOptimizations();
                break;
        }
    }

    /**
     * 更新配置
     */
    public updateConfig(options: {
        targetFps?: number;
        adaptiveOptimization?: boolean;
        maxObjects?: number;
    }): void {
        if (options.targetFps !== undefined) {
            this.targetFps = options.targetFps;
            this.maxFrameTime = 1000 / this.targetFps;
        }
        if (options.adaptiveOptimization !== undefined) {
            this.adaptiveOptimization = options.adaptiveOptimization;
        }
        if (options.maxObjects !== undefined) {
            this.maxObjects = options.maxObjects;
        }
    }

    /**
     * 获取当前配置
     */
    public getConfig(): any {
        return {
            targetFps: this.targetFps,
            adaptiveOptimization: this.adaptiveOptimization,
            maxObjects: this.maxObjects,
            currentFps: this.currentFps,
            optimizationLevel: this.optimizationLevel,
            optimizations: { ...this.optimizations }
        };
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();
        this.restoreHiddenObjects();
    }
}
