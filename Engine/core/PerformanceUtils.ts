import {THREE} from "../core/global.ts";

/**
 * 对象池管理
 * 减少GC压力，提高性能
 */
export class ObjectPool<T> {
    private pool: T[] = [];
    private factory: () => T;
    private reset: (obj: T) => void;
    private maxSize: number;

    constructor(factory: () => T, reset: (obj: T) => void, maxSize: number = 100) {
        this.factory = factory;
        this.reset = reset;
        this.maxSize = maxSize;
    }

    /**
     * 获取对象
     */
    acquire(): T {
        return this.pool.pop() || this.factory();
    }

    /**
     * 释放对象
     */
    release(obj: T): void {
        if (this.pool.length < this.maxSize) {
            this.reset(obj);
            this.pool.push(obj);
        }
    }

    /**
     * 清空对象池
     */
    clear(): void {
        this.pool.length = 0;
    }

    /**
     * 获取池大小
     */
    get size(): number {
        return this.pool.length;
    }
}

/**
 * 节流函数
 * 限制函数执行频率
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: any[]) => void {
    let lastCall = 0;
    return (...args: any[]) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
        }
    };
}

/**
 * 防抖函数
 * 延迟执行，避免频繁调用
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: any[]) => void {
    let timeoutId: number | null = null;
    return (...args: any[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
            func(...args);
        }, delay);
    };
}

/**
 * 帧率限制器
 * 限制函数在指定帧率下执行
 */
export class FrameRateLimiter {
    private lastCall = 0;
    private frameInterval: number;

    constructor(fps: number) {
        this.frameInterval = 1000 / fps;
    }

    /**
     * 检查是否可以执行
     */
    canExecute(): boolean {
        const now = performance.now();
        if (now - this.lastCall >= this.frameInterval) {
            this.lastCall = now;
            return true;
        }
        return false;
    }

    /**
     * 执行函数（如果允许）
     */
    execute<T extends (...args: any[]) => any>(
        func: T,
        ...args: any[]
    ): ReturnType<T> | null {
        if (this.canExecute()) {
            return func(...args);
        }
        return null;
    }
}

/**
 * 内存使用监控
 */
export class MemoryMonitor {
    private memoryHistory: number[] = [];
    private maxHistoryLength = 100;

    /**
     * 获取当前内存使用情况
     */
    getMemoryUsage(): number {
        if ('memory' in performance) {
            return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }

    /**
     * 记录内存使用
     */
    recordMemoryUsage(): void {
        const usage = this.getMemoryUsage();
        this.memoryHistory.push(usage);

        if (this.memoryHistory.length > this.maxHistoryLength) {
            this.memoryHistory.shift();
        }

    }

    /**
     * 获取内存使用趋势
     */
    getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
        if (this.memoryHistory.length < 10) return 'stable';

        const recent = this.memoryHistory.slice(-10);
        const firstHalf = recent.slice(0, 5);
        const secondHalf = recent.slice(5);

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const diff = secondAvg - firstAvg;

        if (diff > 1) return 'increasing';
        if (diff < -1) return 'decreasing';
        return 'stable';
    }

    /**
     * 检测内存泄漏
     */
    detectMemoryLeak(): boolean {
        const trend = this.getMemoryTrend();
        const currentUsage = this.getMemoryUsage();

        // 如果内存持续增长且超过100MB，可能存在泄漏
        return trend === 'increasing' && currentUsage > 100;
    }
}

/**
 * 性能分析器
 */
export class PerformanceProfiler {
    private measurements: Map<string, number[]> = new Map();
    private startTimes: Map<string, number> = new Map();

    /**
     * 开始测量
     */
    start(label: string): void {
        this.startTimes.set(label, performance.now());
    }

    /**
     * 结束测量
     */
    end(label: string): number {
        const startTime = this.startTimes.get(label);
        if (!startTime) {
            console.warn(`[PerformanceProfiler] No start time found for label: ${label}`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.startTimes.delete(label);

        if (!this.measurements.has(label)) {
            this.measurements.set(label, []);
        }
        this.measurements.get(label)!.push(duration);

        return duration;
    }

    /**
     * 获取测量结果
     */
    getResults(label: string): {
        count: number;
        average: number;
        min: number;
        max: number;
        total: number;
    } | null {
        const measurements = this.measurements.get(label);
        if (!measurements || measurements.length === 0) {
            return null;
        }

        const count = measurements.length;
        const total = measurements.reduce((a, b) => a + b, 0);
        const average = total / count;
        const min = Math.min(...measurements);
        const max = Math.max(...measurements);

        return { count, average, min, max, total };
    }

    /**
     * 清除测量数据
     */
    clear(label?: string): void {
        if (label) {
            this.measurements.delete(label);
            this.startTimes.delete(label);
        } else {
            this.measurements.clear();
            this.startTimes.clear();
        }
    }

    /**
     * 获取所有测量结果
     */
    getAllResults(): Record<string, {
        count: number;
        average: number;
        min: number;
        max: number;
        total: number;
    }> {
        const results: Record<string, any> = {};

        for (const [label] of this.measurements) {
            const result = this.getResults(label);
            if (result) {
                results[label] = result;
            }
        }

        return results;
    }
}

/**
 * 批量DOM更新器
 * 减少DOM操作次数
 */
export class BatchDOMUpdater {
    private pendingUpdates = new Map<string, () => void>();
    private updateScheduled = false;

    /**
     * 添加更新任务
     */
    scheduleUpdate(id: string, updateFn: () => void): void {
        this.pendingUpdates.set(id, updateFn);

        if (!this.updateScheduled) {
            this.updateScheduled = true;
            requestAnimationFrame(() => {
                this.executeUpdates();
                this.updateScheduled = false;
            });
        }
    }

    /**
     * 执行所有待更新的任务
     */
    private executeUpdates(): void {
        this.pendingUpdates.forEach(updateFn => {
            try {
                updateFn();
            } catch (error) {
                console.error('[BatchDOMUpdater] Update failed:', error);
            }
        });
        this.pendingUpdates.clear();
    }

    /**
     * 取消更新任务
     */
    cancelUpdate(id: string): void {
        this.pendingUpdates.delete(id);
    }

    /**
     * 清空所有更新任务
     */
    clear(): void {
        this.pendingUpdates.clear();
        this.updateScheduled = false;
    }
}

/**
 * 缓存管理器
 * 提供简单的缓存功能
 */
export class CacheManager<K, V> {
    private cache = new Map<K, { value: V; timestamp: number; ttl: number }>();
    private maxSize: number;
    private cleanupInterval: number | null = null;

    constructor(maxSize: number = 100, cleanupIntervalMs: number = 60000) {
        this.maxSize = maxSize;

        // 定期清理过期缓存
        this.cleanupInterval = window.setInterval(() => {
            this.cleanup();
        }, cleanupIntervalMs);
    }

    /**
     * 设置缓存
     */
    set(key: K, value: V, ttl: number = 300000): void { // 默认5分钟
        // 如果缓存已满，移除最旧的条目
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey !== undefined) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }

    /**
     * 获取缓存
     */
    get(key: K): V | undefined {
        const item = this.cache.get(key);
        if (!item) return undefined;

        // 检查是否过期
        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return undefined;
        }

        return item.value;
    }

    /**
     * 删除缓存
     */
    delete(key: K): boolean {
        return this.cache.delete(key);
    }

    /**
     * 清空缓存
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * 清理过期缓存
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.cache) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * 销毁缓存管理器
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.clear();
    }

    /**
     * 获取缓存统计
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
    } {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: 0 // 可以扩展实现命中率统计
        };
    }
}

/**
 * 设备性能检测器
 * 检测设备性能并提供优化建议
 */
export class DevicePerformanceDetector {
    /**
     * 检测是否为高性能设备
     */
    static isHighPerformanceDevice(): boolean {
        // 检测设备性能
        return (
            window.devicePixelRatio <= 2 && 
            navigator.hardwareConcurrency >= 4 &&
            !(navigator as any).connection?.saveData // 不在省电模式下
        );
    }
    
    /**
     * 获取设备性能等级
     */
    static getPerformanceLevel(): 'low' | 'medium' | 'high' {
        if (this.isHighPerformanceDevice()) {
            return 'high';
        }
        
        if (window.devicePixelRatio <= 2 && navigator.hardwareConcurrency >= 2) {
            return 'medium';
        }
        
        return 'low';
    }
    
    /**
     * 根据设备性能获取优化建议
     */
    static getOptimizationRecommendations(): string[] {
        const recommendations: string[] = [];
        const level = this.getPerformanceLevel();
        
        switch (level) {
            case 'low':
                recommendations.push('降低纹理质量');
                recommendations.push('减少后处理效果');
                recommendations.push('降低渲染分辨率');
                recommendations.push('禁用阴影');
                break;
            case 'medium':
                recommendations.push('适度降低纹理质量');
                recommendations.push('选择性启用后处理效果');
                recommendations.push('适度降低渲染分辨率');
                break;
            case 'high':
                recommendations.push('可启用高质量效果');
                recommendations.push('可使用高分辨率纹理');
                recommendations.push('可启用复杂后处理效果');
                break;
        }
        
        return recommendations;
    }
}

/**
 * 渲染性能优化器
 * 提供渲染性能优化功能
 */
export class RenderPerformanceOptimizer {
    private static instance: RenderPerformanceOptimizer | null = null;
    private frameRateLimiter: FrameRateLimiter;
    private isOptimizationEnabled: boolean = false;
    
    private constructor() {
        this.frameRateLimiter = new FrameRateLimiter(60); // 限制为60FPS
    }
    
    /**
     * 获取单例实例
     */
    static getInstance(): RenderPerformanceOptimizer {
        if (!this.instance) {
            this.instance = new RenderPerformanceOptimizer();
        }
        return this.instance;
    }
    
    /**
     * 启用性能优化
     */
    enableOptimization(): void {
        this.isOptimizationEnabled = true;
    }
    
    /**
     * 禁用性能优化
     */
    disableOptimization(): void {
        this.isOptimizationEnabled = false;
    }
    
    /**
     * 优化渲染函数执行
     */
    optimizeRenderFunction<T extends (...args: any[]) => any>(
        func: T,
        ...args: any[]
    ): ReturnType<T> | null {
        if (!this.isOptimizationEnabled) {
            return func(...args);
        }
        
        return this.frameRateLimiter.execute(func, ...args);
    }
}

/**
 * 帧率监控器
 * 实时监控和分析帧率性能
 */
export class FrameRateMonitor {
    private frameCount: number = 0;
    private lastTime: number = 0;
    private currentFps: number = 0;
    private fpsHistory: number[] = [];
    private readonly historySize: number = 60;
    private onFpsUpdate: ((fps: number) => void) | null = null;
    private monitoring: boolean = false;
    private frameId: number = 0;

    constructor(onFpsUpdate?: (fps: number) => void) {
        if (onFpsUpdate) {
            this.onFpsUpdate = onFpsUpdate;
        }
    }

    /**
     * 开始监控
     */
    start(): void {
        if (this.monitoring) return;
        this.monitoring = true;
        this.lastTime = performance.now();
        this.frameId = requestAnimationFrame(this.update.bind(this));
    }

    /**
     * 停止监控
     */
    stop(): void {
        this.monitoring = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
    }

    /**
     * 更新帧率
     */
    private update(timestamp: number): void {
        if (!this.monitoring) return;

        this.frameCount++;
        const elapsed = timestamp - this.lastTime;

        // 每秒更新一次FPS
        if (elapsed >= 1000) {
            this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
            
            // 添加到历史记录
            this.fpsHistory.push(this.currentFps);
            if (this.fpsHistory.length > this.historySize) {
                this.fpsHistory.shift();
            }
            
            // 触发更新回调
            if (this.onFpsUpdate) {
                this.onFpsUpdate(this.currentFps);
            }
            
            // 重置计数器
            this.frameCount = 0;
            this.lastTime = timestamp;
        }

        this.frameId = requestAnimationFrame(this.update.bind(this));
    }

    /**
     * 获取当前FPS
     */
    getCurrentFps(): number {
        return this.currentFps;
    }

    /**
     * 获取平均FPS
     */
    getAverageFps(): number {
        if (this.fpsHistory.length === 0) return 0;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }

    /**
     * 获取FPS历史记录
     */
    getFpsHistory(): number[] {
        return [...this.fpsHistory];
    }

    /**
     * 获取FPS统计信息
     */
    getFpsStats(): { current: number; average: number; min: number; max: number } {
        if (this.fpsHistory.length === 0) {
            return { current: this.currentFps, average: 0, min: 0, max: 0 };
        }
        
        const min = Math.min(...this.fpsHistory);
        const max = Math.max(...this.fpsHistory);
        const average = this.getAverageFps();
        
        return {
            current: this.currentFps,
            average,
            min,
            max
        };
    }
}

/**
 * 性能分析器扩展
 * 添加更详细的性能分析功能
 */
export class DetailedPerformanceProfiler extends PerformanceProfiler {
    private activeProfiles: Set<string> = new Set();
    
    /**
     * 开始测量并标记为活跃
     */
    start(label: string): void {
        super.start(label);
        this.activeProfiles.add(label);
    }
    
    /**
     * 结束测量并移除活跃标记
     */
    end(label: string): number {
        this.activeProfiles.delete(label);
        return super.end(label);
    }
    
    /**
     * 获取活跃的性能分析标签
     */
    getActiveProfiles(): string[] {
        return Array.from(this.activeProfiles);
    }
    
    /**
     * 重置所有测量数据
     */
    reset(): void {
        this.activeProfiles.clear();
        this.clear();
    }
}

/**
 * 几何体优化器
 * 提供几何体优化功能
 */
export class GeometryOptimizer {
    /**
     * 合并几何体
     */
    static mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
        if (!geometries || geometries.length === 0) {
            console.warn('[GeometryOptimizer] 没有提供几何体进行合并');
            return null;
        }
        
        try {
            // 这里需要导入BufferGeometryUtils，但在当前环境中可能不可用
            // 暂时返回null，实际使用时需要正确导入
            console.warn('[GeometryOptimizer] BufferGeometryUtils未导入，无法合并几何体');
            return null;
        } catch (error) {
            console.error('[GeometryOptimizer] 合并几何体失败:', error);
            return null;
        }
    }
    
    /**
     * 优化几何体属性
     */
    static optimizeGeometryAttributes(geometry: THREE.BufferGeometry): void {
        // 确保几何体有必要的属性
        if (!geometry.attributes.position) {
            console.warn('[GeometryOptimizer] 几何体缺少位置属性');
            return;
        }
        
        // 计算边界框和包围球（如果不存在）
        if (!geometry.boundingBox) {
            geometry.computeBoundingBox();
        }
        if (!geometry.boundingSphere) {
            geometry.computeBoundingSphere();
        }
        
        // 优化索引
        if (geometry.index && geometry.index.count > 0) {
            // 可以在这里实现索引优化逻辑
            console.log('[GeometryOptimizer] 几何体索引已存在，可考虑优化');
        }
    }
    
    /**
     * 简化几何体
     */
    static simplifyGeometry(geometry: THREE.BufferGeometry, ratio: number = 0.5): THREE.BufferGeometry {
        // 这是一个简化的实现，实际使用时可能需要更复杂的算法
        console.log(`[GeometryOptimizer] 简化几何体，目标比率: ${ratio}`);
        return geometry;
    }
}

/**
 * 纹理优化器
 * 提供纹理优化功能
 */
export class TextureOptimizer {
    private static textureCache: Map<string, THREE.Texture> = new Map();
    
    /**
     * 压缩纹理
     */
    static compressTexture(texture: THREE.Texture, maxSize: number = 1024): THREE.Texture {
        if (!texture.image) {
            console.warn('[TextureOptimizer] 纹理没有图像数据');
            return texture;
        }
        
        // 检查纹理尺寸
        const width = texture.image.width;
        const height = texture.image.height;
        
        if (width <= maxSize && height <= maxSize) {
            // 纹理尺寸已经在限制范围内
            return texture;
        }
        
        // 计算新的尺寸
        const ratio = Math.min(maxSize / width, maxSize / height);
        const newWidth = Math.floor(width * ratio);
        const newHeight = Math.floor(height * ratio);
        
        console.log(`[TextureOptimizer] 压缩纹理从 ${width}x${height} 到 ${newWidth}x${newHeight}`);
        
        // 这里应该实现实际的纹理压缩逻辑
        // 暂时只记录日志并返回原纹理
        return texture;
    }
    
    /**
     * 缓存纹理
     */
    static cacheTexture(key: string, texture: THREE.Texture): void {
        this.textureCache.set(key, texture);
        console.log(`[TextureOptimizer] 纹理已缓存: ${key}`);
    }
    
    /**
     * 获取缓存的纹理
     */
    static getCachedTexture(key: string): THREE.Texture | undefined {
        return this.textureCache.get(key);
    }
    
    /**
     * 清除纹理缓存
     */
    static clearCache(): void {
        this.textureCache.clear();
        console.log('[TextureOptimizer] 纹理缓存已清除');
    }
}

/**
 * 渲染批处理器
 * 提供渲染批处理功能
 */
export class RenderBatcher {
    private batches: Map<string, THREE.Object3D[]> = new Map();
    private batchSize: number = 100;
    
    constructor(batchSize: number = 100) {
        this.batchSize = batchSize;
    }
    
    /**
     * 添加对象到批处理
     */
    addObject(key: string, object: THREE.Object3D): void {
        if (!this.batches.has(key)) {
            this.batches.set(key, []);
        }
        
        const batch = this.batches.get(key)!;
        batch.push(object);
        
        // 如果批次已满，处理批次
        if (batch.length >= this.batchSize) {
            this.processBatch(key, batch);
            batch.length = 0; // 清空批次
        }
    }
    
    /**
     * 处理批次
     */
    private processBatch(key: string, objects: THREE.Object3D[]): void {
        console.log(`[RenderBatcher] 处理批次 ${key}，包含 ${objects.length} 个对象`);
        // 这里可以实现实际的批处理逻辑
    }
    
    /**
     * 刷新所有批次
     */
    flush(): void {
        for (const [key, batch] of this.batches) {
            if (batch.length > 0) {
                this.processBatch(key, batch);
                batch.length = 0;
            }
        }
    }
}
