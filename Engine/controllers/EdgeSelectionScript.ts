import { THREE } from "../core/global.ts";
import { ScriptBase } from "../core/ScriptBase";

/**
 * 边线选择配置接口
 */
export interface EdgeSelectionConfig {
    /** 边线颜色 */
    edgeColor?: number;
    /** 边线宽度 */
    edgeWidth?: number;
    /** 是否显示隐藏边线 */
    showHiddenEdges?: boolean;
    /** 隐藏边线颜色 */
    hiddenEdgeColor?: number;
    /** 边线强度 */
    edgeStrength?: number;
    /** 边线发光效果 */
    edgeGlow?: number;
    /** 边线厚度 */
    edgeThickness?: number;
}

/**
 * 几何体边线缓存项
 */
interface EdgeGeometryCacheItem {
    /** 边线几何体 */
    geometry: THREE.BufferGeometry;
    /** 时间戳 */
    timestamp: number;
}

/**
 * Mesh边线选择脚本
 * 实现Mesh对象的边线高亮显示功能
 */
export class EdgeSelectionScript extends ScriptBase {
    name = 'EdgeSelectionScript';

    /** 配置参数 */
    private config: Required<EdgeSelectionConfig>;

    /** 当前选中的对象 */
    private selectedObjects: THREE.Object3D[] = [];

    /** 边线辅助对象 */
    private edgeHelpers: Map<string, THREE.LineSegments> = new Map();

    /** 边线材质 */
    private edgeMaterial: THREE.LineBasicMaterial;

    /** 几何体边线缓存 */
    private edgeGeometryCache: Map<string, EdgeGeometryCacheItem> = new Map();

    /** 缓存过期时间（毫秒） */
    private cacheExpiryTime = 30000; // 30秒

    /** 是否启用调试日志 */
    private debugMode = false;

    constructor(options?: EdgeSelectionConfig) {
        super();

        // 合并默认配置和用户配置
        this.config = {
            edgeColor: 0xffff00, // 黄色边线 - 更醒目的颜色
            edgeWidth: 2,
            showHiddenEdges: true,
            hiddenEdgeColor: 0x888888,
            edgeStrength: 3.0,
            edgeGlow: 0.0,
            edgeThickness: 1.0,
            ...options
        };

        // 创建边线材质
        this.edgeMaterial = new THREE.LineBasicMaterial({
            color: this.config.edgeColor,
            linewidth: this.config.edgeWidth,
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
        this.clearAllEdgeHelpers();
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();
        this.clearAllEdgeHelpers();
        
        // 清理缓存
        this.clearEdgeGeometryCache();
        
        // 确保材质被正确销毁
        try {
            if (this.edgeMaterial) {
                this.edgeMaterial.dispose();
            }
        } catch (error) {
            if (this.debugMode) {
                console.warn('[EdgeSelectionScript] 销毁材质时出错:', error);
            }
        }
        
        if (this.debugMode) {
            console.log('[EdgeSelectionScript] 脚本已销毁');
        }
    }

    /**
     * 设置选中的对象
     * @param objects 选中的对象数组
     */
    public setSelectedObjects(objects: THREE.Object3D[]): void {
        this.selectedObjects = [...objects];
        this.updateEdgeHelpers();
    }

    /**
     * 添加对象到选中列表
     * @param object 要添加的对象
     */
    public addObject(object: THREE.Object3D): void {
        if (!this.selectedObjects.includes(object)) {
            this.selectedObjects.push(object);
            this.createEdgeHelper(object);
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
            this.removeEdgeHelper(object);
        }
    }

    /**
     * 清除所有选中对象
     */
    public clearSelection(): void {
        this.selectedObjects = [];
        this.clearAllEdgeHelpers();
    }

    /**
     * 获取当前选中的对象
     * @returns 选中的对象数组
     */
    public getSelectedObjects(): THREE.Object3D[] {
        return [...this.selectedObjects];
    }

    /**
     * 更新边线辅助对象
     */
    private updateEdgeHelpers(): void {
        // 移除所有现有的边线辅助对象
        this.clearAllEdgeHelpers();

        // 为每个选中的对象创建边线辅助对象
        this.selectedObjects.forEach(object => {
            this.createEdgeHelper(object);
        });
    }

    /**
     * 检查几何体是否适合生成边线
     * @param geometry 几何体
     * @returns 是否适合生成边线
     */
    private isGeometryValidForEdges(geometry: THREE.BufferGeometry): boolean {
        // 检查几何体是否存在
        if (!geometry) {
            if (this.debugMode) {
                console.warn('[EdgeSelectionScript] 几何体不存在');
            }
            return false;
        }

        // 检查是否包含位置属性
        if (!geometry.attributes.position) {
            if (this.debugMode) {
                console.warn('[EdgeSelectionScript] 几何体缺少位置属性');
            }
            return false;
        }

        // 检查位置属性是否包含数据
        if (geometry.attributes.position.count === 0) {
            if (this.debugMode) {
                console.warn('[EdgeSelectionScript] 几何体位置属性为空');
            }
            return false;
        }

        // 检查索引属性（如果存在）
        if (geometry.index && geometry.index.count === 0) {
            if (this.debugMode) {
                console.warn('[EdgeSelectionScript] 几何体索引属性为空');
            }
            return false;
        }

        // 检查是否为BufferGeometry或其子类
        if (!(geometry instanceof THREE.BufferGeometry)) {
            if (this.debugMode) {
                console.warn('[EdgeSelectionScript] 几何体不是BufferGeometry类型');
            }
            return false;
        }

        return true;
    }

    /**
     * 从缓存中获取边线几何体
     * @param geometryHash 几何体哈希值
     * @returns 缓存的边线几何体或undefined
     */
    private getEdgeGeometryFromCache(geometryHash: string): THREE.BufferGeometry | undefined {
        const cachedItem = this.edgeGeometryCache.get(geometryHash);
        if (!cachedItem) {
            return undefined;
        }

        // 检查缓存是否过期
        const now = Date.now();
        if (now - cachedItem.timestamp > this.cacheExpiryTime) {
            // 缓存过期，删除该项
            this.edgeGeometryCache.delete(geometryHash);
            return undefined;
        }

        return cachedItem.geometry;
    }

    /**
     * 将边线几何体添加到缓存
     * @param geometryHash 几何体哈希值
     * @param geometry 边线几何体
     */
    private setEdgeGeometryToCache(geometryHash: string, geometry: THREE.BufferGeometry): void {
        this.edgeGeometryCache.set(geometryHash, {
            geometry: geometry,
            timestamp: Date.now()
        });
    }

    /**
     * 清理过期的缓存项
     */
    private cleanupExpiredCache(): void {
        const now = Date.now();
        for (const [key, item] of this.edgeGeometryCache.entries()) {
            if (now - item.timestamp > this.cacheExpiryTime) {
                this.edgeGeometryCache.delete(key);
            }
        }
    }

    /**
     * 清空边线几何体缓存
     */
    private clearEdgeGeometryCache(): void {
        // 销毁所有缓存的几何体
        for (const item of this.edgeGeometryCache.values()) {
            try {
                item.geometry.dispose();
            } catch (error) {
                if (this.debugMode) {
                    console.warn('[EdgeSelectionScript] 销毁缓存几何体时出错:', error);
                }
            }
        }
        this.edgeGeometryCache.clear();
    }

    /**
     * 生成几何体的哈希值
     * @param geometry 几何体
     * @returns 哈希值
     */
    private generateGeometryHash(geometry: THREE.BufferGeometry): string {
        // 使用几何体的一些基本属性生成哈希值
        const positionCount = geometry.attributes.position?.count || 0;
        const indexCount = geometry.index?.count || 0;
        const uuid = geometry.uuid || '';
        
        // 简单的哈希算法
        return `${uuid}_${positionCount}_${indexCount}`;
    }

    /**
     * 创建边线几何体
     * @param geometry 原始几何体
     * @returns 边线几何体
     */
    private createEdgeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        // 生成几何体哈希值
        const geometryHash = this.generateGeometryHash(geometry);
        
        // 尝试从缓存获取
        let edgeGeometry = this.getEdgeGeometryFromCache(geometryHash);
        if (edgeGeometry) {
            if (this.debugMode) {
                console.log('[EdgeSelectionScript] 从缓存获取边线几何体');
            }
            return edgeGeometry;
        }

        // 缓存中没有，创建新的边线几何体
        try {
            // 首先尝试使用默认参数创建
            edgeGeometry = new THREE.EdgesGeometry(geometry, 30);
            
            // 检查是否成功创建了边线几何体且包含顶点
            if (edgeGeometry.attributes.position && edgeGeometry.attributes.position.count > 0) {
                if (this.debugMode) {
                    console.log('[EdgeSelectionScript] EdgesGeometry成功创建边线');
                }
            } else {
                // 如果没有顶点，尝试使用较小的阈值角度
                edgeGeometry = new THREE.EdgesGeometry(geometry, 1);
                
                // 如果仍然没有顶点，使用WireframeGeometry作为备选方案
                if (edgeGeometry.attributes.position && edgeGeometry.attributes.position.count === 0) {
                    edgeGeometry = new THREE.WireframeGeometry(geometry);
                    if (this.debugMode) {
                        console.log('[EdgeSelectionScript] 使用WireframeGeometry作为备选方案');
                    }
                } else if (this.debugMode) {
                    console.log('[EdgeSelectionScript] 使用1度阈值角度成功创建边线');
                }
            }
        } catch (error) {
            if (this.debugMode) {
                console.warn('[EdgeSelectionScript] EdgesGeometry创建失败，尝试WireframeGeometry:', error);
            }
            // 尝试使用WireframeGeometry作为备选方案
            try {
                edgeGeometry = new THREE.WireframeGeometry(geometry);
            } catch (fallbackError) {
                if (this.debugMode) {
                    console.error('[EdgeSelectionScript] 无法为几何体创建任何边线几何体:', fallbackError);
                }
                throw fallbackError;
            }
        }

        // 将创建的几何体添加到缓存
        if (edgeGeometry) {
            this.setEdgeGeometryToCache(geometryHash, edgeGeometry);
        }

        return edgeGeometry;
    }

    /**
     * 创建边线辅助对象
     * @param object 目标对象
     */
    private createEdgeHelper(object: THREE.Object3D): void {
        if (this.debugMode) {
            console.log('[EdgeSelectionScript] 开始创建边线辅助对象:', object.name);
        }
        
        // 只处理Mesh对象
        if (!(object instanceof THREE.Mesh)) {
            if (this.debugMode) {
                console.warn('[EdgeSelectionScript] 对象不是Mesh类型:', object.name);
            }
            return;
        }

        // 移除已存在的边线辅助对象
        this.removeEdgeHelper(object);

        // 获取对象的几何体
        const geometry = object.geometry;
        if (!geometry) {
            if (this.debugMode) {
                console.warn('[EdgeSelectionScript] 对象缺少几何体:', object.name);
            }
            return;
        }

        // 验证几何体是否适合生成边线
        if (!this.isGeometryValidForEdges(geometry)) {
            if (this.debugMode) {
                console.warn('[EdgeSelectionScript] 几何体不适合生成边线:', object.name);
            }
            return;
        }

        // 创建边线几何体
        let edgeGeometry: THREE.BufferGeometry;
        try {
            edgeGeometry = this.createEdgeGeometry(geometry);
        } catch (error) {
            if (this.debugMode) {
                console.error('[EdgeSelectionScript] 无法为对象创建边线几何体:', object.name, error);
            }
            return;
        }

        // 验证边线几何体是否包含数据
        if (!edgeGeometry.attributes.position || edgeGeometry.attributes.position.count === 0) {
            if (this.debugMode) {
                console.warn('[EdgeSelectionScript] 边线几何体不包含顶点数据:', object.name);
            }
            return;
        }

        if (this.debugMode) {
            console.log('[EdgeSelectionScript] 成功创建边线几何体:', {
                name: object.name,
                positionCount: edgeGeometry.attributes.position.count
            });
        }

        // 创建边线对象
        const edgeHelper = new THREE.LineSegments(edgeGeometry, this.edgeMaterial.clone());
        edgeHelper.name = `EdgeHelper_${object.uuid}`;
        edgeHelper.userData = { targetObject: object };
        
        // 继承目标对象的变换
        edgeHelper.position.copy(object.position);
        edgeHelper.quaternion.copy(object.quaternion);
        edgeHelper.scale.copy(object.scale);
        
        // 添加到场景中
        if (this.renderer && this.renderer.scene) {
            this.renderer.scene.add(edgeHelper);
            this.edgeHelpers.set(object.uuid, edgeHelper);
            if (this.debugMode) {
                console.log('[EdgeSelectionScript] 边线辅助对象添加到场景:', object.name);
            }
        }
    }

    /**
     * 移除边线辅助对象
     * @param object 目标对象
     */
    private removeEdgeHelper(object: THREE.Object3D): void {
        const edgeHelper = this.edgeHelpers.get(object.uuid);
        if (edgeHelper && this.renderer && this.renderer.scene) {
            this.renderer.scene.remove(edgeHelper);
            // 注意：这里不销毁几何体，因为可能被缓存共享
            if (edgeHelper.material instanceof THREE.Material) {
                edgeHelper.material.dispose();
            }
            this.edgeHelpers.delete(object.uuid);
        }
    }

    /**
     * 清除所有边线辅助对象
     */
    private clearAllEdgeHelpers(): void {
        this.edgeHelpers.forEach((edgeHelper, uuid) => {
            if (this.renderer && this.renderer.scene) {
                this.renderer.scene.remove(edgeHelper);
                // 注意：这里不销毁几何体，因为可能被缓存共享
                if (edgeHelper.material instanceof THREE.Material) {
                    edgeHelper.material.dispose();
                }
            }
        });
        this.edgeHelpers.clear();
    }

    /**
     * 更新边线辅助对象的位置
     * 在每一帧调用以保持边线与对象同步
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
        
        // 定期清理过期缓存
        if (Math.random() < 0.01) { // 1%的概率
            this.cleanupExpiredCache();
        }
        
        // 更新所有边线辅助对象的位置
        this.edgeHelpers.forEach((edgeHelper, uuid) => {
            const targetObject = edgeHelper.userData.targetObject;
            if (targetObject) {
                edgeHelper.position.copy(targetObject.position);
                edgeHelper.quaternion.copy(targetObject.quaternion);
                edgeHelper.scale.copy(targetObject.scale);
            }
        });
    }

    /**
     * 更新配置参数
     * @param options 新的配置参数
     */
    public updateConfig(options: EdgeSelectionConfig): void {
        // 更新配置
        Object.assign(this.config, options);
        
        // 更新材质
        this.edgeMaterial.color.set(this.config.edgeColor);
        this.edgeMaterial.linewidth = this.config.edgeWidth;
        
        // 更新所有边线辅助对象的材质
        this.edgeHelpers.forEach((edgeHelper) => {
            if (edgeHelper.material instanceof THREE.LineBasicMaterial) {
                edgeHelper.material.color.set(this.config.edgeColor);
                edgeHelper.material.linewidth = this.config.edgeWidth;
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
        this.clearEdgeGeometryCache();
    }
}