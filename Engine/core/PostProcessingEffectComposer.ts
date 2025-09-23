import { EffectComposer, RenderPass, OutputPass } from './global';
import type { Aether3d } from './Aether3d';

/**
 * 统一的后处理渲染EffectComposer类
 * 提供了完整的后处理效果支持框架
 */
export class PostProcessingEffectComposer {
    private composer: EffectComposer | null = null;
    private renderPass: RenderPass | null = null;
    private outputPass: OutputPass | null = null;

    private renderer: Aether3d;
    private isEnabled: boolean = false;

    // 性能优化：添加设备性能检测缓存
    private isHighPerformanceDeviceCached: boolean | null = null;

    // 性能优化：缓存尺寸
    private lastWidth: number = 0;
    private lastHeight: number = 0;

    constructor(renderer: Aether3d) {
        this.renderer = renderer;
        // 立即初始化Composer
        this.init();
    }

    /**
     * 检测是否为高性能设备
     */
    private isHighPerformanceDevice(): boolean {
        if (this.isHighPerformanceDeviceCached !== null) {
            return this.isHighPerformanceDeviceCached;
        }
        return false;
        // // 检测设备性能
        // const isHighPerformance = (
        //     window.devicePixelRatio <= 2 &&
        //     navigator.hardwareConcurrency >= 4 &&
        //     !(navigator as any).connection?.saveData // 不在省电模式下
        // );
        //
        // this.isHighPerformanceDeviceCached = isHighPerformance;
        // return isHighPerformance;
    }

    /**
     * 初始化EffectComposer
     */
    private init(): void {
        try {
            // 创建EffectComposer实例，根据设备性能调整采样率
            this.composer = new EffectComposer(this.renderer.renderer);

            // 根据设备性能调整采样率
            const samples = this.isHighPerformanceDevice() ? 18 : 8;
            this.composer.renderTarget1.samples = samples;
            this.composer.renderTarget2.samples = samples;

            // 创建基础渲染通道
            this.renderPass = new RenderPass(this.renderer.scene, this.renderer.camera);
            this.composer.addPass(this.renderPass);

            // 创建输出通道
            this.outputPass = new OutputPass();
            this.composer.addPass(this.outputPass);

            console.log('[PostProcessingEffectComposer] EffectComposer initialized successfully');
        } catch (error) {
            console.error('[PostProcessingEffectComposer] Failed to initialize EffectComposer:', error);
        }
    }

    /**
     * 启用后处理效果
     */
    public enable(): void {
        this.isEnabled = true;
        console.log('[PostProcessingEffectComposer] Post-processing enabled');
    }

    /**
     * 禁用后处理效果
     */
    public disable(): void {
        this.isEnabled = false;
        console.log('[PostProcessingEffectComposer] Post-processing disabled');
    }

    /**
     * 检查后处理是否启用
     */
    public isEnabledPostProcessing(): boolean {
        return this.isEnabled && this.composer !== null;
    }

    /**
     * 获取EffectComposer实例
     */
    public getComposer(): EffectComposer | null {
        return this.composer;
    }

    public setPixelRatio(devicePixelRatio:number): void {
        this.composer?.setPixelRatio(devicePixelRatio);
    }

    /**
     * 添加通道到EffectComposer
     * @param pass 要添加的通道
     * @param beforeOutput 是否在输出通道之前插入（默认为true）
     */
    public addPass(pass: any, beforeOutput: boolean = true): void {
        if (!this.composer) {
            console.warn('[PostProcessingEffectComposer] Composer not initialized');
            return;
        }

        try {
            if (beforeOutput && this.outputPass) {
                // 在输出通道之前插入
                const passes = this.composer.passes;
                const outputPassIndex = passes.indexOf(this.outputPass);

                if (outputPassIndex > 0) {
                    passes.splice(outputPassIndex, 0, pass);
                } else {
                    this.composer.addPass(pass);
                }
            } else {
                // 直接添加到末尾
                this.composer.addPass(pass);
            }

            // 如果是后处理通道，设置抗锯齿
            if (pass && typeof pass.setSize === 'function') {
                pass.setSize(window.innerWidth, window.innerHeight);
            }

            console.log('[PostProcessingEffectComposer] Pass added successfully');
        } catch (error) {
            console.error('[PostProcessingEffectComposer] Failed to add pass:', error);
        }
    }

    /**
     * 移除指定通道
     * @param pass 要移除的通道
     */
    public removePass(pass: any): void {
        if (!this.composer) return;

        const index = this.composer.passes.indexOf(pass);
        if (index !== -1) {
            this.composer.passes.splice(index, 1);
            console.log('[PostProcessingEffectComposer] Pass removed successfully');
        }
    }

    /**
     * 获取所有通道
     */
    public getPasses(): any[] {
        if (!this.composer) return [];
        return this.composer.passes;
    }

    /**
     * 渲染场景（使用后处理效果）
     */
    public render(): void {
        if (this.composer) {
            this.composer.render();
        }
    }

    /**
     * 更新渲染器大小
     */
    public setSize(width: number, height: number): void {
        // 添加尺寸变化检测，避免不必要的更新
        if (this.lastWidth === width && this.lastHeight === height) {
            return;
        }

        this.lastWidth = width;
        this.lastHeight = height;

        if (this.composer) {
            this.composer.setSize(width, height);
            // 更新所有通道的大小
            for (const pass of this.composer.passes) {
                if (pass && typeof pass.setSize === 'function') {
                    pass.setSize(width, height);
                }
            }
        }

        console.log(`[PostProcessingEffectComposer] Size updated to ${width}x${height}`);
    }

    /**
     * 销毁EffectComposer及相关资源
     */
    public dispose(): void {
        if (this.composer) {
            this.composer.passes.forEach(pass => {
                if (pass && typeof pass.dispose === 'function') {
                    pass.dispose();
                }
            });

            this.composer = null;
            this.renderPass = null;
            this.outputPass = null;

            this.isEnabled = false;

            console.log('[PostProcessingEffectComposer] Disposed successfully');
        }
    }
}
