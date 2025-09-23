/**
 * FPS诊断工具
 * 用于详细分析和诊断FPS低的问题
 */
export class FPSDiagnosticTool {
    private renderer: any;
    private diagnostics: Map<string, any> = new Map();
    private isRunning: boolean = false;
    private diagnosticInterval: number = 1000; // 每秒诊断一次
    private intervalId: number | null = null;

    constructor(renderer: any) {
        this.renderer = renderer;
    }

    /**
     * 开始诊断
     */
    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;
        this.intervalId = window.setInterval(() => {
        }, this.diagnosticInterval);
    }

    /**
     * 停止诊断
     */
    public stop(): void {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * 获取诊断报告
     */
    public getReport(): any {
        const report: any = {
            timestamp: new Date().toISOString(),
            basicPerformance: {},
            renderer: {},
            scene: {},
            scripts: {},
            memory: {},
            postProcessing: {}
        };

        // 收集基本性能数据
        if (this.renderer && this.renderer.getPerformanceData) {
            const perfData = this.renderer.getPerformanceData();
            if (perfData) {
                report.basicPerformance = perfData.fpsStats;
            }
        }

        // 收集渲染器信息
        if (this.renderer && this.renderer.renderer) {
            const glInfo = this.renderer.renderer.info;
            report.renderer = {
                drawCalls: glInfo.render.calls,
                triangles: glInfo.render.triangles,
                points: glInfo.render.points,
                lines: glInfo.render.lines,
                textures: glInfo.textures,
                geometries: glInfo.geometries,
                programs: glInfo.programs?.length || 0
            };
        }

        // 收集场景信息
        if (this.renderer && this.renderer.scene) {
            const scene = this.renderer.scene;
            let totalObjects = 0;
            let meshCount = 0;
            let lightCount = 0;
            let cameraCount = 0;

            const countObjects = (object: any) => {
                totalObjects++;
                if (object.isMesh) meshCount++;
                if (object.isLight) lightCount++;
                if (object.isCamera) cameraCount++;
                object.children.forEach((child: any) => countObjects(child));
            };

            scene.children.forEach((child: any) => countObjects(child));

            report.scene = {
                totalObjects,
                meshes: meshCount,
                lights: lightCount,
                cameras: cameraCount
            };
        }

        // 收集脚本信息
        if (this.renderer && this.renderer.scripts) {
            report.scripts = {
                count: this.renderer.scripts.length,
                types: this.renderer.scripts.map((s: any) => s.constructor.name)
            };
        }

        // 收集内存信息
        if ('memory' in performance) {
            const memory = (performance as any).memory;
            report.memory = {
                used: memory.usedJSHeapSize,
                total: memory.totalJSHeapSize,
                limit: memory.jsHeapSizeLimit
            };
        }

        return report;
    }

    /**
     * 生成优化建议
     */
    public generateOptimizationSuggestions(): string[] {
        const suggestions: string[] = [];

        if (this.renderer) {
            const perfData = this.renderer.getPerformanceData();
            if (perfData && perfData.fpsStats.current < 30) {
                suggestions.push('⚠️ FPS过低，建议进行性能优化');
            }

            // 检查绘制调用
            if (this.renderer.renderer) {
                const calls = this.renderer.renderer.info.render.calls;
                if (calls > 1000) {
                    suggestions.push('⚠️ 绘制调用过多，建议合并几何体或使用实例化渲染');
                }
            }

            // 检查对象数量
            if (this.renderer.scene) {
                let totalObjects = 0;
                const countObjects = (object: any) => {
                    totalObjects++;
                    object.children.forEach((child: any) => countObjects(child));
                };
                this.renderer.scene.children.forEach((child: any) => countObjects(child));

                if (totalObjects > 1000) {
                    suggestions.push('⚠️ 场景对象过多，建议使用对象池或按需加载');
                }
            }
        }

        if (suggestions.length === 0) {
            suggestions.push('✅ 当前性能状况良好');
        }

        return suggestions;
    }
}
