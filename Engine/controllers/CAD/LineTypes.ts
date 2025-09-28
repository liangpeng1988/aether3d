import { THREE } from "../../core/global";
import { LineBase } from "./LineBase";

/**
 * 直线类
 * 表示简单的直线段
 */
export class StraightLine extends LineBase {
    constructor(points: THREE.Vector3[], name: string) {
        super(points, name);
    }
}

/**
 * 曲线类
 * 表示通过控制点定义的曲线
 */
export class CurveLine extends LineBase {
    private curve: THREE.CatmullRomCurve3 | null = null;
    
    constructor(points: THREE.Vector3[], name: string) {
        super(points, name);
        this.updateCurve();
    }
    
    /**
     * 更新曲线
     */
    private updateCurve(): void {
        if (this.points.length >= 2) {
            this.curve = new THREE.CatmullRomCurve3(this.points);
            this.curve.curveType = 'centripetal';
            this.curve.closed = false;
            
            // 生成曲线点
            const curvePoints = this.curve.getPoints(50);
            this.geometry.dispose();
            this.geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        }
    }
    
    /**
     * 设置线条的点
     */
    public override setPoints(points: THREE.Vector3[]): void {
        super.setPoints(points);
        this.updateCurve();
    }
    
    /**
     * 添加点到线条
     */
    public override addPoint(point: THREE.Vector3): void {
        super.addPoint(point);
        this.updateCurve();
    }
}

/**
 * 圆弧类
 * 表示圆弧线段
 */
export class ArcLine extends LineBase {
    private center: THREE.Vector3;
    private radius: number;
    private startAngle: number;
    private endAngle: number;
    
    constructor(
        center: THREE.Vector3, 
        radius: number, 
        startAngle: number, 
        endAngle: number, 
        name: string
    ) {
        // 初始化点数组
        super([], name);
        this.center = center;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.updateArc();
    }
    
    /**
     * 更新圆弧
     */
    private updateArc(): void {
        const points: THREE.Vector3[] = [];
        const segments = 32;
        const angleStep = (this.endAngle - this.startAngle) / segments;
        
        for (let i = 0; i <= segments; i++) {
            const angle = this.startAngle + i * angleStep;
            const x = this.center.x + this.radius * Math.cos(angle);
            const z = this.center.z + this.radius * Math.sin(angle);
            points.push(new THREE.Vector3(x, 0, z));
        }
        
        this.geometry.dispose();
        this.geometry = new THREE.BufferGeometry().setFromPoints(points);
    }
    
    /**
     * 设置圆弧参数
     */
    public setArcParameters(
        center: THREE.Vector3, 
        radius: number, 
        startAngle: number, 
        endAngle: number
    ): void {
        this.center = center;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.updateArc();
    }
}

/**
 * 矩形类
 * 表示矩形线框
 */
export class RectangleLine extends LineBase {
    private center: THREE.Vector3;
    private width: number;
    private height: number;
    
    constructor(
        center: THREE.Vector3, 
        width: number, 
        height: number, 
        name: string
    ) {
        // 初始化点数组
        super([], name);
        this.center = center;
        this.width = width;
        this.height = height;
        this.updateRectangle();
    }
    
    /**
     * 更新矩形
     */
    private updateRectangle(): void {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        const points: THREE.Vector3[] = [
            new THREE.Vector3(this.center.x - halfWidth, 0, this.center.z - halfHeight),
            new THREE.Vector3(this.center.x + halfWidth, 0, this.center.z - halfHeight),
            new THREE.Vector3(this.center.x + halfWidth, 0, this.center.z + halfHeight),
            new THREE.Vector3(this.center.x - halfWidth, 0, this.center.z + halfHeight),
            new THREE.Vector3(this.center.x - halfWidth, 0, this.center.z - halfHeight)
        ];
        
        this.geometry.dispose();
        this.geometry = new THREE.BufferGeometry().setFromPoints(points);
    }
    
    /**
     * 设置矩形参数
     */
    public setRectangleParameters(
        center: THREE.Vector3, 
        width: number, 
        height: number
    ): void {
        this.center = center;
        this.width = width;
        this.height = height;
        this.updateRectangle();
    }
}

/**
 * 多边形类
 * 表示任意多边形线框
 */
export class PolygonLine extends LineBase {
    constructor(points: THREE.Vector3[], name: string) {
        // 确保多边形闭合
        const closedPoints = [...points];
        if (points.length > 0 && !points[0].equals(points[points.length - 1])) {
            closedPoints.push(points[0].clone());
        }
        super(closedPoints, name);
    }
}