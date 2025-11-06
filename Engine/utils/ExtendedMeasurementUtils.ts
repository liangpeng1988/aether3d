import { THREE } from "../core/global";
import { MeasurementUtils } from "./MeasurementUtils";

/**
 * 扩展测量工具类
 * 提供更丰富的测量功能，包括直径、半径等
 */
export class ExtendedMeasurementUtils extends MeasurementUtils {
    /**
     * 计算圆的直径
     * @param center 圆心
     * @param point 圆上任意一点
     * @returns 直径值
     */
    public static calculateDiameter(
        center: { x: number; y: number; z: number } | THREE.Vector3,
        point: { x: number; y: number; z: number } | THREE.Vector3
    ): number {
        // 计算半径（圆心到点的距离）
        const radius = this.calculateDistance(center, point);
        // 直径是半径的两倍
        return radius * 2;
    }

    /**
     * 计算圆的半径
     * @param center 圆心
     * @param point 圆上任意一点
     * @returns 半径值
     */
    public static calculateRadius(
        center: { x: number; y: number; z: number } | THREE.Vector3,
        point: { x: number; y: number; z: number } | THREE.Vector3
    ): number {
        // 计算半径（圆心到点的距离）
        return this.calculateDistance(center, point);
    }

    /**
     * 计算三点确定的圆的圆心和半径
     * @param point1 第一个点
     * @param point2 第二个点
     * @param point3 第三个点
     * @returns 圆心和半径 { center: THREE.Vector3, radius: number } 或 null（如果三点共线）
     */
    public static calculateCircleFromThreePoints(
        point1: { x: number; y: number; z: number } | THREE.Vector3,
        point2: { x: number; y: number; z: number } | THREE.Vector3,
        point3: { x: number; y: number; z: number } | THREE.Vector3
    ): { center: THREE.Vector3, radius: number } | null {
        // 转换为THREE.Vector3类型
        const p1 = point1 instanceof THREE.Vector3 
            ? point1.clone() 
            : new THREE.Vector3(point1.x, point1.y, point1.z);
        const p2 = point2 instanceof THREE.Vector3 
            ? point2.clone() 
            : new THREE.Vector3(point2.x, point2.y, point2.z);
        const p3 = point3 instanceof THREE.Vector3 
            ? point3.clone() 
            : new THREE.Vector3(point3.x, point3.y, point3.z);

        // 检查三点是否共线
        const v1 = new THREE.Vector3().subVectors(p2, p1);
        const v2 = new THREE.Vector3().subVectors(p3, p1);
        const cross = new THREE.Vector3().crossVectors(v1, v2);
        
        // 如果叉积为零，则三点共线
        if (cross.length() === 0) {
            return null;
        }

        // 计算圆心
        // 使用垂直平分线的交点来计算圆心
        const mid1 = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const mid2 = new THREE.Vector3().addVectors(p2, p3).multiplyScalar(0.5);
        
        const dir1 = new THREE.Vector3().subVectors(p2, p1);
        const dir2 = new THREE.Vector3().subVectors(p3, p2);
        
        const perp1 = new THREE.Vector3(-dir1.y, dir1.x, 0).normalize(); // 垂直向量
        const perp2 = new THREE.Vector3(-dir2.y, dir2.x, 0).normalize(); // 垂直向量
        
        // 计算两条垂直平分线的交点（圆心）
        // 这是一个简化的2D实现，假设所有点都在XY平面上
        const center = this.calculateLineIntersection(
            mid1, 
            new THREE.Vector3().addVectors(mid1, perp1),
            mid2,
            new THREE.Vector3().addVectors(mid2, perp2)
        );
        
        if (!center) {
            return null;
        }

        // 计算半径
        const radius = this.calculateDistance(center, p1);
        
        return { center, radius };
    }

    /**
     * 计算两条直线的交点（2D实现）
     * @param line1Point1 直线1的第一个点
     * @param line1Point2 直线1的第二个点
     * @param line2Point1 直线2的第一个点
     * @param line2Point2 直线2的第二个点
     * @returns 交点或null（如果平行）
     */
    private static calculateLineIntersection(
        line1Point1: THREE.Vector3,
        line1Point2: THREE.Vector3,
        line2Point1: THREE.Vector3,
        line2Point2: THREE.Vector3
    ): THREE.Vector3 | null {
        const x1 = line1Point1.x;
        const y1 = line1Point1.y;
        const x2 = line1Point2.x;
        const y2 = line1Point2.y;
        const x3 = line2Point1.x;
        const y3 = line2Point1.y;
        const x4 = line2Point2.x;
        const y4 = line2Point2.y;

        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        
        if (Math.abs(denom) < 1e-10) {
            // 平行线
            return null;
        }

        const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
        const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;

        return new THREE.Vector3(x, y, 0);
    }

    /**
     * 计算多点之间的总距离（路径长度）
     * @param points 点数组
     * @returns 总距离
     */
    public static calculatePathLength(
        points: Array<{ x: number; y: number; z: number } | THREE.Vector3>
    ): number {
        if (points.length < 2) {
            return 0;
        }

        let totalDistance = 0;
        for (let i = 0; i < points.length - 1; i++) {
            totalDistance += this.calculateDistance(points[i], points[i + 1]);
        }

        return totalDistance;
    }

    /**
     * 计算多点围成的面积（使用鞋带公式，适用于2D平面）
     * @param points 点数组（应为2D点）
     * @returns 面积值
     */
    public static calculatePolygonArea(
        points: Array<{ x: number; y: number; z: number } | THREE.Vector3>
    ): number {
        if (points.length < 3) {
            return 0;
        }

        // 转换为THREE.Vector3类型并提取x,y坐标
        const vectors: THREE.Vector3[] = points.map(point => 
            point instanceof THREE.Vector3 
                ? point.clone() 
                : new THREE.Vector3(point.x, point.y, point.z)
        );

        let area = 0;
        const n = vectors.length;

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += vectors[i].x * vectors[j].y;
            area -= vectors[j].x * vectors[i].y;
        }

        return Math.abs(area) / 2;
    }
}