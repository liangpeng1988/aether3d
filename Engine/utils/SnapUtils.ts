import { THREE } from "../core/global";

/**
 * 吸附类型枚举
 */
export enum SnapType {
    /** 网格吸附 */
    GRID = 'grid',
    /** 顶点吸附 */
    VERTEX = 'vertex',
    /** 边缘吸附 */
    EDGE = 'edge',
    /** 中心吸附 */
    CENTER = 'center'
}

/**
 * 吸附配置接口
 */
export interface SnapConfig {
    /** 是否启用吸附 */
    enabled: boolean;
    /** 网格吸附距离 */
    gridDistance: number;
    /** 顶点吸附距离 */
    vertexDistance: number;
    /** 边缘吸附距离 */
    edgeDistance: number;
    /** 中心吸附距离 */
    centerDistance: number;
    /** 启用的吸附类型 */
    enabledTypes: SnapType[];
}

/**
 * 吸附点信息
 */
export interface SnapPoint {
    /** 位置 */
    position: THREE.Vector3;
    /** 吸附类型 */
    type: SnapType;
    /** 相关对象 */
    object?: THREE.Object3D;
}

/**
 * 吸附工具类
 * 提供各种吸附功能的通用实现
 */
export class SnapUtils {
    /** 默认配置 */
    private static readonly DEFAULT_CONFIG: SnapConfig = {
        enabled: true,
        gridDistance: 1.0,
        vertexDistance: 0.5,
        edgeDistance: 0.5,
        centerDistance: 0.5,
        enabledTypes: [SnapType.GRID, SnapType.VERTEX, SnapType.CENTER]
    };

    /**
     * 吸附到网格
     * @param position 原始位置
     * @param gridDistance 网格距离
     * @returns 吸附后的位置
     */
    public static snapToGrid(position: THREE.Vector3, gridDistance: number = 1.0): THREE.Vector3 {
        const snapped = position.clone();
        
        // 对每个坐标进行网格吸附
        snapped.x = Math.round(snapped.x / gridDistance) * gridDistance;
        snapped.y = Math.round(snapped.y / gridDistance) * gridDistance;
        snapped.z = Math.round(snapped.z / gridDistance) * gridDistance;
        
        return snapped;
    }

    /**
     * 吸附到最近的顶点
     * @param position 原始位置
     * @param objects 场景中的对象列表
     * @param maxDistance 最大吸附距离
     * @returns 吸附点信息，如果没有找到则返回null
     */
    public static snapToVertex(
        position: THREE.Vector3, 
        objects: THREE.Object3D[], 
        maxDistance: number = 0.5
    ): SnapPoint | null {
        let closestPoint: SnapPoint | null = null;
        let minDistance = maxDistance;

        // 遍历所有对象
        for (const object of objects) {
            // 获取对象的几何体顶点
            const vertices = this.getObjectVertices(object);
            
            // 检查每个顶点
            for (const vertex of vertices) {
                const distance = position.distanceTo(vertex);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = {
                        position: vertex.clone(),
                        type: SnapType.VERTEX,
                        object: object
                    };
                }
            }
        }

        return closestPoint;
    }

    /**
     * 吸附到对象中心
     * @param position 原始位置
     * @param objects 场景中的对象列表
     * @param maxDistance 最大吸附距离
     * @returns 吸附点信息，如果没有找到则返回null
     */
    public static snapToCenter(
        position: THREE.Vector3, 
        objects: THREE.Object3D[], 
        maxDistance: number = 0.5
    ): SnapPoint | null {
        let closestPoint: SnapPoint | null = null;
        let minDistance = maxDistance;

        // 遍历所有对象
        for (const object of objects) {
            // 获取对象的中心点
            const center = new THREE.Vector3();
            const box = new THREE.Box3().setFromObject(object);
            box.getCenter(center);
            
            const distance = position.distanceTo(center);
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = {
                    position: center.clone(),
                    type: SnapType.CENTER,
                    object: object
                };
            }
        }

        return closestPoint;
    }

    /**
     * 获取对象的所有顶点
     * @param object 三维对象
     * @returns 顶点数组
     */
    private static getObjectVertices(object: THREE.Object3D): THREE.Vector3[] {
        const vertices: THREE.Vector3[] = [];
        
        // 如果是网格对象
        if (object instanceof THREE.Mesh) {
            const geometry = object.geometry;
            
            // 检查是否有位置属性
            if (geometry.attributes.position) {
                const positions = geometry.attributes.position.array as Float32Array;
                
                // 提取顶点坐标
                for (let i = 0; i < positions.length; i += 3) {
                    const vertex = new THREE.Vector3(
                        positions[i],
                        positions[i + 1],
                        positions[i + 2]
                    );
                    
                    // 应用对象的世界变换
                    vertex.applyMatrix4(object.matrixWorld);
                    vertices.push(vertex);
                }
            }
        }
        
        return vertices;
    }

    /**
     * 获取最近的吸附点
     * @param position 原始位置
     * @param objects 场景中的对象列表
     * @param config 吸附配置
     * @returns 最近的吸附点
     */
    public static getClosestSnapPoint(
        position: THREE.Vector3,
        objects: THREE.Object3D[],
        config: SnapConfig = this.DEFAULT_CONFIG
    ): SnapPoint | null {
        // 如果未启用吸附，直接返回null
        if (!config.enabled) {
            return null;
        }

        let closestPoint: SnapPoint | null = null;
        let minDistance = Infinity;

        // 网格吸附
        if (config.enabledTypes.includes(SnapType.GRID)) {
            const gridPoint = this.snapToGrid(position, config.gridDistance);
            const distance = position.distanceTo(gridPoint);
            if (distance < config.gridDistance && distance < minDistance) {
                minDistance = distance;
                closestPoint = {
                    position: gridPoint,
                    type: SnapType.GRID
                };
            }
        }

        // 顶点吸附
        if (config.enabledTypes.includes(SnapType.VERTEX)) {
            const vertexPoint = this.snapToVertex(position, objects, config.vertexDistance);
            if (vertexPoint && vertexPoint.position.distanceTo(position) < minDistance) {
                minDistance = vertexPoint.position.distanceTo(position);
                closestPoint = vertexPoint;
            }
        }

        // 中心吸附
        if (config.enabledTypes.includes(SnapType.CENTER)) {
            const centerPoint = this.snapToCenter(position, objects, config.centerDistance);
            if (centerPoint && centerPoint.position.distanceTo(position) < minDistance) {
                minDistance = centerPoint.position.distanceTo(position);
                closestPoint = centerPoint;
            }
        }

        return closestPoint;
    }

    /**
     * 应用吸附到位置
     * @param position 原始位置
     * @param objects 场景中的对象列表
     * @param config 吸附配置
     * @returns 吸附后的位置
     */
    public static applySnap(
        position: THREE.Vector3,
        objects: THREE.Object3D[],
        config: SnapConfig = this.DEFAULT_CONFIG
    ): THREE.Vector3 {
        const snapPoint = this.getClosestSnapPoint(position, objects, config);
        return snapPoint ? snapPoint.position : position.clone();
    }
}