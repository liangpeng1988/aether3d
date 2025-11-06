import { THREE } from "../core/global.ts";
import { ScriptBase } from "../core/ScriptBase";

/**
 * 顶点选择配置接口
 */
export interface VertexSelectionConfig {
    /** 顶点颜色 */
    vertexColor?: number;
    /** 顶点大小 */
    vertexSize?: number;
    /** 是否显示隐藏顶点 */
    showHiddenVertices?: boolean;
    /** 隐藏顶点颜色 */
    hiddenVertexColor?: number;
}

/**
 * 几何体顶点缓存项
 */
interface VertexGeometryCacheItem {
    /** 顶点几何体 */
    geometry: THREE.BufferGeometry;
    /** 时间戳 */
    timestamp: number;
}

/**
 * Mesh顶点选择脚本
 * 实现Mesh对象的顶点高亮显示功能
 */
export class VertexSelectionScript extends ScriptBase {
    name = 'VertexSelectionScript';

    /** 配置参数 */
    private config: Required<VertexSelectionConfig>;

    /** 当前选中的对象 */
    private selectedObjects: THREE.Object3D[] = [];

    /** 顶点辅助对象 */
    private vertexHelpers: Map<string, THREE.Points> = new Map();

    /** 顶点材质 */
    private vertexMaterial: THREE.PointsMaterial;

    /** 几何体顶点缓存 */
    private vertexGeometryCache: Map<string, VertexGeometryCacheItem> = new Map();

    /** 缓存过期时间（毫秒） */
    private cacheExpiryTime = 30000; // 30秒

    /** 是否启用调试日志 */
    private debugMode = false;

    constructor(options?: VertexSelectionConfig) {
        super();

        // 合并默认配置和用户配置
        this.config = {
            vertexColor: 0xff0000, // 红色顶点 - 更醒目的颜色
            vertexSize: 0.1,
            showHiddenVertices: true,
            hiddenVertexColor: 0x888888,
            ...options
        };

        // 创建顶点材质
        this.vertexMaterial = new THREE.PointsMaterial({
            color: this.config.vertexColor,
            size: this.config.vertexSize,
            transparent: true,
            opacity: 0.8
        });
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
     * 当脚本变为禁用或非激活状态时调用
     */
    public override onDisable(): void {
        super.onDisable?.();
        this.clearAllVertexHelpers();
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();
        this.clearAllVertexHelpers();
        
        // 清理缓存
        this.clearVertexGeometryCache();
        
        // 确保材质被正确销毁
        try {
            if (this.vertexMaterial) {
                this.vertexMaterial.dispose();
            }
        } catch (error) {
            if (this.debugMode) {
                console.warn('[VertexSelectionScript] 销毁材质时出错:', error);
            }
        }
        
        if (this.debugMode) {
            console.log('[VertexSelectionScript] 脚本已销毁');
        }
    }

    /**
     * 设置选中的对象
     * @param objects 选中的对象数组
     */
    public setSelectedObjects(objects: THREE.Object3D[]): void {
        this.selectedObjects = [...objects];
        this.updateVertexHelpers();
    }

    /**
     * 添加对象到选中列表
     * @param object 要添加的对象
     */
    public addObject(object: THREE.Object3D): void {
        if (!this.selectedObjects.includes(object)) {
            this.selectedObjects.push(object);
            this.createVertexHelper(object);
        }
    }

    /**
     * 从选中列表中移除对象
     * @param object 要移除的对象
     */
    public removeObject(object: THREE.Object3D): void {
        const index = this.selectedObjects.indexOf(object);
        if (index !== -1) {
            this.selectedObjects.splice(index, 1);
            this.removeVertexHelper(object);
        }
    }

    /**
     * 清除所有选中对象
     */
    public clearSelection(): void {
        this.selectedObjects = [];
        this.clearAllVertexHelpers();
    }

    /**
     * 获取当前选中的对象
     * @returns 选中的对象数组
     */
    public getSelectedObjects(): THREE.Object3D[] {
        return [...this.selectedObjects];
    }

    /**
     * 更新顶点辅助对象
     */
    private updateVertexHelpers(): void {
        // 移除所有现有的顶点辅助对象
        this.clearAllVertexHelpers();

        // 为每个选中的对象创建顶点辅助对象
        this.selectedObjects.forEach(object => {
            this.createVertexHelper(object);
        });
    }

    /**
     * 检查几何体是否适合生成顶点
     * @param geometry 几何体
     * @returns 是否适合生成顶点
     */
    private isGeometryValidForVertices(geometry: THREE.BufferGeometry): boolean {
        // 检查几何体是否存在
        if (!geometry) {
            if (this.debugMode) {
                console.warn('[VertexSelectionScript] 几何体不存在');
            }
            return false;
        }

        // 检查是否包含位置属性
        if (!geometry.attributes.position) {
            if (this.debugMode) {
                console.warn('[VertexSelectionScript] 几何体缺少位置属性');
            }
            return false;
        }

        // 检查位置属性是否包含数据
        if (geometry.attributes.position.count === 0) {
            if (this.debugMode) {
                console.warn('[VertexSelectionScript] 几何体位置属性为空');
            }
            return false;
        }

        // 检查是否为BufferGeometry或其子类
        if (!(geometry instanceof THREE.BufferGeometry)) {
            if (this.debugMode) {
                console.warn('[VertexSelectionScript] 几何体不是BufferGeometry类型');
            }
            return false;
        }

        return true;
    }

    /**
     * 从缓存中获取顶点几何体
     * @param geometryHash 几何体哈希值
     * @returns 缓存的顶点几何体或undefined
     */
    private getVertexGeometryFromCache(geometryHash: string): THREE.BufferGeometry | undefined {
        const cachedItem = this.vertexGeometryCache.get(geometryHash);
        if (!cachedItem) {
            return undefined;
        }

        // 检查缓存是否过期
        const now = Date.now();
        if (now - cachedItem.timestamp > this.cacheExpiryTime) {
            // 缓存过期，删除该项
            this.vertexGeometryCache.delete(geometryHash);
            return undefined;
        }

        return cachedItem.geometry;
    }

    /**
     * 将顶点几何体添加到缓存
     * @param geometryHash 几何体哈希值
     * @param geometry 顶点几何体
     */
    private setVertexGeometryToCache(geometryHash: string, geometry: THREE.BufferGeometry): void {
        this.vertexGeometryCache.set(geometryHash, {
            geometry: geometry,
            timestamp: Date.now()
        });
    }

    /**
     * 清理过期的缓存项
     */
    private cleanupExpiredCache(): void {
        const now = Date.now();
        for (const [key, item] of this.vertexGeometryCache.entries()) {
            if (now - item.timestamp > this.cacheExpiryTime) {
                this.vertexGeometryCache.delete(key);
            }
        }
    }

    /**
     * 清空顶点几何体缓存
     */
    private clearVertexGeometryCache(): void {
        // 销毁所有缓存的几何体
        for (const item of this.vertexGeometryCache.values()) {
            try {
                item.geometry.dispose();
            } catch (error) {
                if (this.debugMode) {
                    console.warn('[VertexSelectionScript] 销毁缓存几何体时出错:', error);
                }
            }
        }
        this.vertexGeometryCache.clear();
    }

    /**
     * 生成几何体的哈希值
     * @param geometry 几何体
     * @returns 哈希值
     */
    private generateGeometryHash(geometry: THREE.BufferGeometry): string {
        // 使用几何体的一些基本属性生成哈希值
        const positionCount = geometry.attributes.position?.count || 0;
        const uuid = geometry.uuid || '';
        
        // 简单的哈希算法
        return `${uuid}_${positionCount}`;
    }

    /**
     * 创建顶点几何体
     * @param geometry 原始几何体
     * @returns 顶点几何体
     */
    private createVertexGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        // 生成几何体哈希值
        const geometryHash = this.generateGeometryHash(geometry);
        
        // 尝试从缓存获取
        let vertexGeometry = this.getVertexGeometryFromCache(geometryHash);
        if (vertexGeometry) {
            if (this.debugMode) {
                console.log('[VertexSelectionScript] 从缓存获取顶点几何体');
            }
            return vertexGeometry;
        }

        // 缓存中没有，创建新的顶点几何体
        try {
            // 直接使用原始几何体的位置属性创建顶点几何体
            vertexGeometry = new THREE.BufferGeometry();
            vertexGeometry.setAttribute('position', geometry.attributes.position);
        } catch (error) {
            if (this.debugMode) {
                console.error('[VertexSelectionScript] 无法为几何体创建顶点几何体:', error);
            }
            throw error;
        }

        // 将创建的几何体添加到缓存
        if (vertexGeometry) {
            this.setVertexGeometryToCache(geometryHash, vertexGeometry);
        }

        return vertexGeometry;
    }

    /**
     * 创建顶点辅助对象
     * @param object 目标对象
     */
    private createVertexHelper(object: THREE.Object3D): void {
        if (this.debugMode) {
            console.log('[VertexSelectionScript] 开始创建顶点辅助对象:', object.name);
        }
        
        // 只处理Mesh对象
        if (!(object instanceof THREE.Mesh)) {
            if (this.debugMode) {
                console.warn('[VertexSelectionScript] 对象不是Mesh类型:', object.name);
            }
            return;
        }

        // 移除已存在的顶点辅助对象
        this.removeVertexHelper(object);

        // 获取对象的几何体
        const geometry = object.geometry;
        if (!geometry) {
            if (this.debugMode) {
                console.warn('[VertexSelectionScript] 对象缺少几何体:', object.name);
            }
            return;
        }

        // 验证几何体是否适合生成顶点
        if (!this.isGeometryValidForVertices(geometry)) {
            if (this.debugMode) {
                console.warn('[VertexSelectionScript] 几何体不适合生成顶点:', object.name);
            }
            return;
        }

        // 创建顶点几何体
        let vertexGeometry: THREE.BufferGeometry;
        try {
            vertexGeometry = this.createVertexGeometry(geometry);
        } catch (error) {
            if (this.debugMode) {
                console.error('[VertexSelectionScript] 无法为对象创建顶点几何体:', object.name, error);
            }
            return;
        }

        // 验证顶点几何体是否包含数据
        if (!vertexGeometry.attributes.position || vertexGeometry.attributes.position.count === 0) {
            if (this.debugMode) {
                console.warn('[VertexSelectionScript] 顶点几何体不包含顶点数据:', object.name);
            }
            return;
        }

        if (this.debugMode) {
            console.log('[VertexSelectionScript] 成功创建顶点几何体:', {
                name: object.name,
                positionCount: vertexGeometry.attributes.position.count
            });
        }

        // 创建顶点对象
        const vertexHelper = new THREE.Points(vertexGeometry, this.vertexMaterial.clone());
        vertexHelper.name = `VertexHelper_${object.uuid}`;
        vertexHelper.userData = { targetObject: object };
        
        // 继承目标对象的变换
        vertexHelper.position.copy(object.position);
        vertexHelper.quaternion.copy(object.quaternion);
        vertexHelper.scale.copy(object.scale);
        
        // 添加到场景中
        if (this.renderer && this.renderer.scene) {
            this.renderer.scene.add(vertexHelper);
            this.vertexHelpers.set(object.uuid, vertexHelper);
            if (this.debugMode) {
                console.log('[VertexSelectionScript] 顶点辅助对象添加到场景:', object.name);
            }
        }
    }

    /**
     * 移除顶点辅助对象
     * @param object 目标对象
     */
    private removeVertexHelper(object: THREE.Object3D): void {
        const vertexHelper = this.vertexHelpers.get(object.uuid);
        if (vertexHelper && this.renderer && this.renderer.scene) {
            this.renderer.scene.remove(vertexHelper);
            // 注意：这里不销毁几何体，因为可能被缓存共享
            if (vertexHelper.material instanceof THREE.Material) {
                vertexHelper.material.dispose();
            }
            this.vertexHelpers.delete(object.uuid);
        }
    }

    /**
     * 清除所有顶点辅助对象
     */
    private clearAllVertexHelpers(): void {
        this.vertexHelpers.forEach((vertexHelper, uuid) => {
            if (this.renderer && this.renderer.scene) {
                this.renderer.scene.remove(vertexHelper);
                // 注意：这里不销毁几何体，因为可能被缓存共享
                if (vertexHelper.material instanceof THREE.Material) {
                    vertexHelper.material.dispose();
                }
            }
        });
        this.vertexHelpers.clear();
    }

    /**
     * 更新顶点辅助对象的位置
     * 在每一帧调用以保持顶点与对象同步
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
        
        // 定期清理过期缓存
        if (Math.random() < 0.01) { // 1%的概率
            this.cleanupExpiredCache();
        }
        
        // 更新所有顶点辅助对象的位置
        this.vertexHelpers.forEach((vertexHelper, uuid) => {
            const targetObject = vertexHelper.userData.targetObject;
            if (targetObject) {
                vertexHelper.position.copy(targetObject.position);
                vertexHelper.quaternion.copy(targetObject.quaternion);
                vertexHelper.scale.copy(targetObject.scale);
            }
        });
    }

    /**
     * 更新配置参数
     * @param options 新的配置参数
     */
    public updateConfig(options: VertexSelectionConfig): void {
        // 更新配置
        Object.assign(this.config, options);
        
        // 更新材质
        this.vertexMaterial.color.set(this.config.vertexColor);
        this.vertexMaterial.size = this.config.vertexSize;
        
        // 更新所有顶点辅助对象的材质
        this.vertexHelpers.forEach((vertexHelper) => {
            if (vertexHelper.material instanceof THREE.PointsMaterial) {
                vertexHelper.material.color.set(this.config.vertexColor);
                vertexHelper.material.size = this.config.vertexSize;
            }
        });
    }

    /**
     * 设置调试模式
     * @param enabled 是否启用调试模式
     */
    public setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
    }

    /**
     * 清空缓存
     */
    public clearCache(): void {
        this.clearVertexGeometryCache();
    }
}