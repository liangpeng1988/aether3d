import { MeasurementUtils } from '../../Engine/utils/MeasurementUtils';
import * as THREE from 'three';

/**
 * 测量工具使用示例
 */
export class MeasurementExample {
    /**
     * 演示距离测量功能
     */
    public demonstrateDistanceMeasurement(): void {
        console.log('=== 距离测量演示 ===');
        
        // 创建测试点
        const point1 = new THREE.Vector3(0, 0, 0);
        const point2 = new THREE.Vector3(3, 4, 0);
        
        // 使用Vector3对象计算距离
        const distance1 = MeasurementUtils.calculateDistance(point1, point2);
        console.log(`Vector3点间距离: ${distance1}`);
        
        // 使用普通对象计算距离
        const point3 = { x: 1, y: 1, z: 1 };
        const point4 = { x: 4, y: 5, z: 1 };
        const distance2 = MeasurementUtils.calculateDistance(point3, point4);
        console.log(`普通对象点间距离: ${distance2}`);
        
        // 使用距离平方避免开方运算
        const distanceSquared = MeasurementUtils.calculateDistanceSquared(point1, point2);
        console.log(`距离平方: ${distanceSquared}`);
        console.log(`开方后的距离: ${Math.sqrt(distanceSquared)}`);
    }

    /**
     * 演示角度测量功能
     */
    public demonstrateAngleMeasurement(): void {
        console.log('\n=== 角度测量演示 ===');
        
        // 创建测试点（形成一个直角三角形）
        const point1 = new THREE.Vector3(0, 0, 0);  // 直角顶点
        const point2 = new THREE.Vector3(3, 0, 0);  // X轴上的点
        const point3 = new THREE.Vector3(0, 4, 0);  // Y轴上的点
        
        // 计算角度（弧度）
        const angleRadians = MeasurementUtils.calculateAngle(point2, point1, point3);
        console.log(`角度（弧度）: ${angleRadians}`);
        
        // 转换为角度
        const angleDegrees = MeasurementUtils.radiansToDegrees(angleRadians);
        console.log(`角度（度）: ${angleDegrees}`);
        
        // 计算两条直线之间的夹角
        const line1Point1 = new THREE.Vector3(0, 0, 0);
        const line1Point2 = new THREE.Vector3(1, 0, 0);
        const line2Point1 = new THREE.Vector3(0, 0, 0);
        const line2Point2 = new THREE.Vector3(0, 1, 0);
        
        const lineAngleRadians = MeasurementUtils.calculateAngleBetweenLines(
            line1Point1, line1Point2, line2Point1, line2Point2
        );
        const lineAngleDegrees = MeasurementUtils.radiansToDegrees(lineAngleRadians);
        console.log(`直线夹角（度）: ${lineAngleDegrees}`);
    }

    /**
     * 演示点到直线距离测量功能
     */
    public demonstratePointToLineDistance(): void {
        console.log('\n=== 点到直线距离演示 ===');
        
        // 定义一条直线（X轴）
        const linePoint1 = new THREE.Vector3(0, 0, 0);
        const linePoint2 = new THREE.Vector3(1, 0, 0);
        
        // 定义一个点
        const point = new THREE.Vector3(0, 3, 0);
        
        // 计算点到直线的距离
        const distance = MeasurementUtils.calculatePointToLineDistance(point, linePoint1, linePoint2);
        console.log(`点到直线距离: ${distance}`);
    }

    /**
     * 性能测试
     */
    public performanceTest(): void {
        console.log('\n=== 性能测试 ===');
        
        // 创建大量测试点
        const points: THREE.Vector3[] = [];
        for (let i = 0; i < 10000; i++) {
            points.push(new THREE.Vector3(
                Math.random() * 100,
                Math.random() * 100,
                Math.random() * 100
            ));
        }
        
        // 测试距离计算性能
        console.time('距离计算性能测试');
        for (let i = 0; i < points.length - 1; i++) {
            MeasurementUtils.calculateDistance(points[i], points[i + 1]);
        }
        console.timeEnd('距离计算性能测试');
        
        // 测试距离平方计算性能
        console.time('距离平方计算性能测试');
        for (let i = 0; i < points.length - 1; i++) {
            MeasurementUtils.calculateDistanceSquared(points[i], points[i + 1]);
        }
        console.timeEnd('距离平方计算性能测试');
    }

    /**
     * 运行所有演示
     */
    public runAllDemonstrations(): void {
        this.demonstrateDistanceMeasurement();
        this.demonstrateAngleMeasurement();
        this.demonstratePointToLineDistance();
        this.performanceTest();
    }
}