import { THREE } from "../core/global.ts";
import { ScriptBase } from "../core/ScriptBase";

/**
 * 面选择配置接口
 */
export interface FaceSelectionConfig {
    /** 面颜色 */
    faceColor?: number;
    /** 面透明度 */
    faceOpacity?: number;
    /** 是否显示隐藏面 */
    showHiddenFaces?: boolean;
    /** 隐藏面颜色 */
    hiddenFaceColor?: number;
    /** 边线颜色 */
    edgeColor?: number;
    /** 边线宽度 */
    edgeWidth?: number;
}

/**
 * 几何体面缓存项
 */
interface FaceGeometryCacheItem {
    /** 面几何体 */
    geometry: THREE.BufferGeometry;
    /** 时间戳 */
    timestamp: number;
}

/**
 * Mesh面选择脚本
 * 实现Mesh对象的面高亮显示功能
 */
export class FaceSelectionScript extends ScriptBase {
    name = 'FaceSelectionScript';

    /** 配置参数 */
    private config: Required<FaceSelectionConfig>;

    /** 当前选中的对象 */
    private selectedObjects: THREE.Object3D[] = [];

    /** 面辅助对象 */
    private faceHelpers: Map<string, THREE.Mesh> = new Map();

    /** 面材质 */
    private faceMaterial: THREE.MeshBasicMaterial;

    /** 几何体面缓存 */
    private faceGeometryCache: Map<string, FaceGeometryCacheItem> = new Map();

    /** 缓存过期时间（毫秒） */
    private cacheExpiryTime = 30000; // 30秒

    /** 是否启用调试日志 */
    private debugMode = false;

    constructor(options?: FaceSelectionConfig) {
        super();

        // 合并默认配置和用户配置
        this.config = {
            faceColor: 0x00ff00, // 绿色面 - 更醒目的颜色
            faceOpacity: 0.3,
            showHiddenFaces: true,
            hiddenFaceColor: 0x888888,
            edgeColor: 0x000000,
            edgeWidth: 1,
            ...options
        };

        // 创建面材质
        this.faceMaterial = new THREE.MeshBasicMaterial({
            color: this.config.faceColor,
            transparent: true,
            opacity: this.config.faceOpacity,
            side: THREE.DoubleSide
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
        this.clearAllFaceHelpers();
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();
        this.clearAllFaceHelpers();
        
        // 清理缓存
        this.clearFaceGeometryCache();
        
        // 确保材质被正确销毁
        try {
            if (this.faceMaterial) {
                this.faceMaterial.dispose();
            }
        } catch (error) {
            if (this.debugMode) {
                console.warn('[FaceSelectionScript] 销毁材质时出错:', error);
            }
        }
        
        if (this.debugMode) {
            console.log('[FaceSelectionScript] 脚本已销毁');
        }
    }

    /**
     * 设置选中的对象
     * @param objects 选中的对象数组
     */
    public setSelectedObjects(objects: THREE.Object3D[]): void {
        this.selectedObjects = [...objects];
        this.updateFaceHelpers();
    }

    /**
     * 添加对象到选中列表
     * @param object 要添加的对象
     */
    public addObject(object: THREE.Object3D): void {
        if (!this.selectedObjects.includes(object)) {
            this.selectedObjects.push(object);
            this.createFaceHelper(object);
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
            this.removeFaceHelper(object);
        }
    }

    /**
     * 清除所有选中对象
     */
    public clearSelection(): void {
        this.selectedObjects = [];
        this.clearAllFaceHelpers();
    }

    /**
     * 获取当前选中的对象
     * @returns 选中的对象数组
     */
    public getSelectedObjects(): THREE.Object3D[] {
        return [...this.selectedObjects];
    }

    /**
     * 更新面辅助对象
     */
    private updateFaceHelpers(): void {
        // 移除所有现有的面辅助对象
        this.clearAllFaceHelpers();

        // 为每个选中的对象创建面辅助对象
        this.selectedObjects.forEach(object => {
            this.createFaceHelper(object);
        });
    }

    /**
     * 检查几何体是否适合生成面
     * @param geometry 几何体
     * @returns 是否适合生成面
     */
    private isGeometryValidForFaces(geometry: THREE.BufferGeometry): boolean {
        // 检查几何体是否存在
        if (!geometry) {
            if (this.debugMode) {
                console.warn('[FaceSelectionScript] 几何体不存在');
            }
            return false;
        }

        // 检查是否包含位置属性
        if (!geometry.attributes.position) {
            if (this.debugMode) {
                console.warn('[FaceSelectionScript] 几何体缺少位置属性');
            }
            return false;
        }

        // 检查位置属性是否包含数据
        if (geometry.attributes.position.count === 0) {
            if (this.debugMode) {
                console.warn('[FaceSelectionScript] 几何体位置属性为空');
            }
            return false;
        }

        // 检查是否为BufferGeometry或其子类
        if (!(geometry instanceof THREE.BufferGeometry)) {
            if (this.debugMode) {
                console.warn('[FaceSelectionScript] 几何体不是BufferGeometry类型');
            }
            return false;
        }

        return true;
    }

    /**
     * 从缓存中获取面几何体
     * @param geometryHash 几何体哈希值
     * @returns 缓存的面几何体或undefined
     */
    private getFaceGeometryFromCache(geometryHash: string): THREE.BufferGeometry | undefined {
        const cachedItem = this.faceGeometryCache.get(geometryHash);
        if (!cachedItem) {
            return undefined;
        }

        // 检查缓存是否过期
        const now = Date.now();
        if (now - cachedItem.timestamp > this.cacheExpiryTime) {
            // 缓存过期，删除该项
            this.faceGeometryCache.delete(geometryHash);
            return undefined;
        }

        return cachedItem.geometry;
    }

    /**
     * 将面几何体添加到缓存
     * @param geometryHash 几何体哈希值
     * @param geometry 面几何体
     */
    private setFaceGeometryToCache(geometryHash: string, geometry: THREE.BufferGeometry): void {
        this.faceGeometryCache.set(geometryHash, {
            geometry: geometry,
            timestamp: Date.now()
        });
    }

    /**
     * 清理过期的缓存项
     */
    private cleanupExpiredCache(): void {
        const now = Date.now();
        for (const [key, item] of this.faceGeometryCache.entries()) {
            if (now - item.timestamp > this.cacheExpiryTime) {
                this.faceGeometryCache.delete(key);
            }
        }
    }

    /**
     * 清空面几何体缓存
     */
    private clearFaceGeometryCache(): void {
        // 销毁所有缓存的几何体
        for (const item of this.faceGeometryCache.values()) {
            try {
                item.geometry.dispose();
            } catch (error) {
                if (this.debugMode) {
                    console.warn('[FaceSelectionScript] 销毁缓存几何体时出错:', error);
                }
            }
        }
        this.faceGeometryCache.clear();
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
     * 创建面几何体
     * @param geometry 原始几何体
     * @returns 面几何体
     */
    private createFaceGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
        // 生成几何体哈希值
        const geometryHash = this.generateGeometryHash(geometry);
        
        // 尝试从缓存获取
        let faceGeometry = this.getFaceGeometryFromCache(geometryHash);
        if (faceGeometry) {
            if (this.debugMode) {
                console.log('[FaceSelectionScript] 从缓存获取面几何体');
            }
            return faceGeometry;
        }

        // 缓存中没有，创建新的面几何体
        try {
            // 直接使用原始几何体创建面几何体
            faceGeometry = geometry.clone();
        } catch (error) {
            if (this.debugMode) {
                console.error('[FaceSelectionScript] 无法为几何体创建面几何体:', error);
            }
            throw error;
        }

        // 将创建的几何体添加到缓存
        if (faceGeometry) {
            this.setFaceGeometryToCache(geometryHash, faceGeometry);
        }

        return faceGeometry;
    }

    /**
     * 创建面辅助对象
     * @param object 目标对象
     */
    private createFaceHelper(object: THREE.Object3D): void {
        if (this.debugMode) {
            console.log('[FaceSelectionScript] 开始创建面辅助对象:', object.name);
        }
        
        // 只处理Mesh对象
        if (!(object instanceof THREE.Mesh)) {
            if (this.debugMode) {
                console.warn('[FaceSelectionScript] 对象不是Mesh类型:', object.name);
            }
            return;
        }

        // 移除已存在的面辅助对象
        this.removeFaceHelper(object);

        // 获取对象的几何体
        const geometry = object.geometry;
        if (!geometry) {
            if (this.debugMode) {
                console.warn('[FaceSelectionScript] 对象缺少几何体:', object.name);
            }
            return;
        }

        // 验证几何体是否适合生成面
        if (!this.isGeometryValidForFaces(geometry)) {
            if (this.debugMode) {
                console.warn('[FaceSelectionScript] 几何体不适合生成面:', object.name);
            }
            return;
        }

        // 创建面几何体
        let faceGeometry: THREE.BufferGeometry;
        try {
            faceGeometry = this.createFaceGeometry(geometry);
        } catch (error) {
            if (this.debugMode) {
                console.error('[FaceSelectionScript] 无法为对象创建面几何体:', object.name, error);
            }
            return;
        }

        // 验证面几何体是否包含数据
        if (!faceGeometry.attributes.position || faceGeometry.attributes.position.count === 0) {
            if (this.debugMode) {
                console.warn('[FaceSelectionScript] 面几何体不包含顶点数据:', object.name);
            }
            return;
        }

        if (this.debugMode) {
            console.log('[FaceSelectionScript] 成功创建面几何体:', {
                name: object.name,
                positionCount: faceGeometry.attributes.position.count
            });
        }

        // 创建面对象
        const faceHelper = new THREE.Mesh(faceGeometry, this.faceMaterial.clone());
        faceHelper.name = `FaceHelper_${object.uuid}`;
        faceHelper.userData = { targetObject: object };
        
        // 继承目标对象的变换
        faceHelper.position.copy(object.position);
        faceHelper.quaternion.copy(object.quaternion);
        faceHelper.scale.copy(object.scale);
        
        // 添加到场景中
        if (this.renderer && this.renderer.scene) {
            this.renderer.scene.add(faceHelper);
            this.faceHelpers.set(object.uuid, faceHelper);
            if (this.debugMode) {
                console.log('[FaceSelectionScript] 面辅助对象添加到场景:', object.name);
            }
        }
    }

    /**
     * 移除面辅助对象
     * @param object 目标对象
     */
    private removeFaceHelper(object: THREE.Object3D): void {
        const faceHelper = this.faceHelpers.get(object.uuid);
        if (faceHelper && this.renderer && this.renderer.scene) {
            this.renderer.scene.remove(faceHelper);
            // 注意：这里不销毁几何体，因为可能被缓存共享
            if (faceHelper.material instanceof THREE.Material) {
                faceHelper.material.dispose();
            }
            this.faceHelpers.delete(object.uuid);
        }
    }

    /**
     * 清除所有面辅助对象
     */
    private clearAllFaceHelpers(): void {
        this.faceHelpers.forEach((faceHelper, uuid) => {
            if (this.renderer && this.renderer.scene) {
                this.renderer.scene.remove(faceHelper);
                // 注意：这里不销毁几何体，因为可能被缓存共享
                if (faceHelper.material instanceof THREE.Material) {
                    faceHelper.material.dispose();
                }
            }
        });
        this.faceHelpers.clear();
    }

    /**
     * 更新面辅助对象的位置
     * 在每一帧调用以保持面与对象同步
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
        
        // 定期清理过期缓存
        if (Math.random() < 0.01) { // 1%的概率
            this.cleanupExpiredCache();
        }
        
        // 更新所有面辅助对象的位置
        this.faceHelpers.forEach((faceHelper, uuid) => {
            const targetObject = faceHelper.userData.targetObject;
            if (targetObject) {
                faceHelper.position.copy(targetObject.position);
                faceHelper.quaternion.copy(targetObject.quaternion);
                faceHelper.scale.copy(targetObject.scale);
            }
        });
    }

    /**
     * 更新配置参数
     * @param options 新的配置参数
     */
    public updateConfig(options: FaceSelectionConfig): void {
        // 更新配置
        Object.assign(this.config, options);
        
        // 更新材质
        this.faceMaterial.color.set(this.config.faceColor);
        this.faceMaterial.opacity = this.config.faceOpacity;
        
        // 更新所有面辅助对象的材质
        this.faceHelpers.forEach((faceHelper) => {
            if (faceHelper.material instanceof THREE.MeshBasicMaterial) {
                faceHelper.material.color.set(this.config.faceColor);
                faceHelper.material.opacity = this.config.faceOpacity;
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
        this.clearFaceGeometryCache();
    }
}