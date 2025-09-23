import { ScriptBase } from "../core/ScriptBase";
import { THREE } from "../core/global.ts";

/**
 * 性能分析脚本
 * 用于详细分析和诊断渲染性能问题
 */
export class PerformanceAnalyzerScript extends ScriptBase {
    name = 'PerformanceAnalyzerScript';

    // 性能数据收集
    private frameCount: number = 0;
    private lastAnalysisTime: number = 0;
    private analysisInterval: number = 1000; // 每秒分析一次

    // 对象统计
    private objectCounts: Map<string, number> = new Map();

    // 内存监控
    private memoryUsage: number = 0;
    private lastMemoryCheck: number = 0;
    private memoryCheckInterval: number = 5000; // 每5秒检查一次内存

    // 渲染统计
    private drawCalls: number = 0;
    private triangles: number = 0;
    private points: number = 0;
    private lines: number = 0;

    // 脚本执行时间统计
    private scriptExecutionTimes: Map<string, { total: number; count: number; }> = new Map();

    // 是否启用详细分析
    private detailedAnalysis: boolean = false;

    constructor(options?: { detailedAnalysis?: boolean; analysisInterval?: number }) {
        super();

        if (options) {
            this.detailedAnalysis = options.detailedAnalysis ?? false;
            this.analysisInterval = options.analysisInterval ?? 1000;
        }
    }

    /**
     * 当脚本被添加到渲染器时调用
     */
    public override awake(): void {
        super.awake?.();
    }

    /**
     * 当脚本变为启用和激活状态时调用
     */
    public override onEnable(): void {
        super.onEnable?.();
    }

    /**
     * 脚本初始化
     */
    public override async start(): Promise<void> {
        super.start?.();
        this.lastAnalysisTime = performance.now();
    }

    /**
     * 每帧更新时调用
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);

        this.frameCount++;
        const currentTime = performance.now();

        // 定期分析性能
        if (currentTime - this.lastAnalysisTime >= this.analysisInterval) {
            this.lastAnalysisTime = currentTime;
        }

        // 定期内存检查
        if (currentTime - this.lastMemoryCheck >= this.memoryCheckInterval) {
            this.checkMemoryUsage();
            this.lastMemoryCheck = currentTime;
        }
    }

    /**
     * 统计场景中的对象
     */
    private countObjects(): void {
        this.objectCounts.clear();

        if (!this.scene) return;

        const countObject = (object: THREE.Object3D) => {
            const type = object.type;
            this.objectCounts.set(type, (this.objectCounts.get(type) || 0) + 1);

            // 递归统计子对象
            object.children.forEach(child => countObject(child));
        };

        this.scene.children.forEach(child => countObject(child));
    }

    /**
     * 检查内存使用
     */
    private checkMemoryUsage(): void {
        if ('memory' in performance) {
            this.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
        }
    }

    /**
     * 记录脚本执行时间
     */
    public recordScriptExecution(scriptName: string, executionTime: number): void {
        if (!this.scriptExecutionTimes.has(scriptName)) {
            this.scriptExecutionTimes.set(scriptName, { total: 0, count: 0 });
        }

        const stats = this.scriptExecutionTimes.get(scriptName)!;
        stats.total += executionTime;
        stats.count++;
    }

    /**
     * 重置统计数据
     */
    public resetStats(): void {
        this.frameCount = 0;
        this.objectCounts.clear();
        this.scriptExecutionTimes.clear();
    }

    /**
     * 获取详细的性能报告
     */
    public getDetailedReport(): any {
        const report: any = {
            timestamp: new Date().toISOString(),
            objectCounts: Object.fromEntries(this.objectCounts),
            memoryUsage: this.memoryUsage,
            scriptExecutionTimes: {}
        };

        for (const [scriptName, stats] of this.scriptExecutionTimes) {
            report.scriptExecutionTimes[scriptName] = {
                averageTime: stats.total / stats.count,
                totalTime: stats.total,
                callCount: stats.count
            };
        }

        if (this.renderer) {
            const info = this.webGLRenderer.info;
            report.renderStats = {
                drawCalls: info.render.calls,
                triangles: info.render.triangles,
                points: info.render.points,
                lines: info.render.lines,
                programs: info.programs ? info.programs.length : 0
            };
        }

        return report;
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();
    }
}
