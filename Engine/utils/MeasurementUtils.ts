import { THREE } from "../core/global";

/**
 * 测量工具类
 * 提供距离测量和角度测量功能
 */
export class MeasurementUtils {
    /**
     * 计算两点之间的距离
     * @param point1 第一个点
     * @param point2 第二个点
     * @returns 距离值
     */
    public static calculateDistance(
        point1: { x: number; y: number; z: number } | THREE.Vector3,
        point2: { x: number; y: number; z: number } | THREE.Vector3
    ): number {
        // 检查是否为THREE.Vector3类型
        if (point1 instanceof THREE.Vector3 && point2 instanceof THREE.Vector3) {
            return point1.distanceTo(point2);
        }

        // 处理普通对象
        const p1 = point1 instanceof THREE.Vector3 
            ? { x: point1.x, y: point1.y, z: point1.z } 
            : point1;
        const p2 = point2 instanceof THREE.Vector3 
            ? { x: point2.x, y: point2.y, z: point2.z } 
            : point2;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * 计算两点之间的距离平方（避免开方运算，提高性能）
     * @param point1 第一个点
     * @param point2 第二个点
     * @returns 距离平方值
     */
    public static calculateDistanceSquared(
        point1: { x: number; y: number; z: number } | THREE.Vector3,
        point2: { x: number; y: number; z: number } | THREE.Vector3
    ): number {
        // 检查是否为THREE.Vector3类型
        if (point1 instanceof THREE.Vector3 && point2 instanceof THREE.Vector3) {
            return point1.distanceToSquared(point2);
        }

        // 处理普通对象
        const p1 = point1 instanceof THREE.Vector3 
            ? { x: point1.x, y: point1.y, z: point1.z } 
            : point1;
        const p2 = point2 instanceof THREE.Vector3 
            ? { x: point2.x, y: point2.y, z: point2.z } 
            : point2;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * 计算三条边组成的角度
     * @param point1 边1的端点
     * @param vertex 顶点
     * @param point2 边2的端点
     * @returns 角度值（弧度）
     */
    public static calculateAngle(
        point1: { x: number; y: number; z: number } | THREE.Vector3,
        vertex: { x: number; y: number; z: number } | THREE.Vector3,
        point2: { x: number; y: number; z: number } | THREE.Vector3
    ): number {
        // 转换为THREE.Vector3类型
        const p1 = point1 instanceof THREE.Vector3 
            ? point1.clone() 
            : new THREE.Vector3(point1.x, point1.y, point1.z);
        const v = vertex instanceof THREE.Vector3 
            ? vertex.clone() 
            : new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        const p2 = point2 instanceof THREE.Vector3 
            ? point2.clone() 
            : new THREE.Vector3(point2.x, point2.y, point2.z);

        // 计算两个向量
        const vec1 = p1.sub(v);
        const vec2 = p2.sub(v);

        // 计算角度（弧度）
        const dot = vec1.dot(vec2);
        const lengths = vec1.length() * vec2.length();
        
        if (lengths === 0) {
            return 0;
        }

        const cosAngle = dot / lengths;
        // 限制余弦值在[-1, 1]范围内，避免计算误差
        const clampedCos = Math.max(-1, Math.min(1, cosAngle));
        return Math.acos(clampedCos);
    }

    /**
     * 计算两条直线之间的夹角
     * @param line1Point1 直线1的第一个点
     * @param line1Point2 直线1的第二个点
     * @param line2Point1 直线2的第一个点
     * @param line2Point2 直线2的第二个点
     * @returns 夹角值（弧度）
     */
    public static calculateAngleBetweenLines(
        line1Point1: { x: number; y: number; z: number } | THREE.Vector3,
        line1Point2: { x: number; y: number; z: number } | THREE.Vector3,
        line2Point1: { x: number; y: number; z: number } | THREE.Vector3,
        line2Point2: { x: number; y: number; z: number } | THREE.Vector3
    ): number {
        // 转换为THREE.Vector3类型
        const p11 = line1Point1 instanceof THREE.Vector3 
            ? line1Point1.clone() 
            : new THREE.Vector3(line1Point1.x, line1Point1.y, line1Point1.z);
        const p12 = line1Point2 instanceof THREE.Vector3 
            ? line1Point2.clone() 
            : new THREE.Vector3(line1Point2.x, line1Point2.y, line1Point2.z);
        const p21 = line2Point1 instanceof THREE.Vector3 
            ? line2Point1.clone() 
            : new THREE.Vector3(line2Point1.x, line2Point1.y, line2Point1.z);
        const p22 = line2Point2 instanceof THREE.Vector3 
            ? line2Point2.clone() 
            : new THREE.Vector3(line2Point2.x, line2Point2.y, line2Point2.z);

        // 计算两个方向向量
        const vec1 = p12.sub(p11);
        const vec2 = p22.sub(p21);

        // 计算夹角（弧度）
        const dot = vec1.dot(vec2);
        const lengths = vec1.length() * vec2.length();
        
        if (lengths === 0) {
            return 0;
        }

        const cosAngle = dot / lengths;
        // 限制余弦值在[-1, 1]范围内，避免计算误差
        const clampedCos = Math.max(-1, Math.min(1, cosAngle));
        return Math.acos(clampedCos);
    }

    /**
     * 将弧度转换为角度
     * @param radians 弧度值
     * @returns 角度值
     */
    public static radiansToDegrees(radians: number): number {
        return radians * (180 / Math.PI);
    }

    /**
     * 将角度转换为弧度
     * @param degrees 角度值
     * @returns 弧度值
     */
    public static degreesToRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * 计算点到直线的距离
     * @param point 点
     * @param linePoint1 直线上第一个点
     * @param linePoint2 直线上第二个点
     * @returns 点到直线的距离
     */
    public static calculatePointToLineDistance(
        point: { x: number; y: number; z: number } | THREE.Vector3,
        linePoint1: { x: number; y: number; z: number } | THREE.Vector3,
        linePoint2: { x: number; y: number; z: number } | THREE.Vector3
    ): number {
        // 转换为THREE.Vector3类型
        const p = point instanceof THREE.Vector3 
            ? point.clone() 
            : new THREE.Vector3(point.x, point.y, point.z);
        const lp1 = linePoint1 instanceof THREE.Vector3 
            ? linePoint1.clone() 
            : new THREE.Vector3(linePoint1.x, linePoint1.y, linePoint1.z);
        const lp2 = linePoint2 instanceof THREE.Vector3 
            ? linePoint2.clone() 
            : new THREE.Vector3(linePoint2.x, linePoint2.y, linePoint2.z);

        // 计算直线方向向量
        const lineDirection = lp2.sub(lp1).normalize();
        
        // 计算从直线起点到点的向量
        const pointVector = p.sub(lp1);
        
        // 计算投影长度
        const projectionLength = pointVector.dot(lineDirection);
        
        // 计算投影点
        const projectionPoint = lp1.clone().add(lineDirection.clone().multiplyScalar(projectionLength));
        
        // 计算点到投影点的距离
        return p.distanceTo(projectionPoint);
    }
}