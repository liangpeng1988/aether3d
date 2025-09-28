import { THREE } from "../../core/global";
import { LineFactory, LineType } from "./LineFactory";
import { ILine } from "./LineBase";

/**
 * CAD使用示例
 * 展示如何使用新的线条类结构
 */
export class CADExample {
    private lines: ILine[] = [];
    
    /**
     * 创建不同类型的线条示例
     */
    public createExampleLines(): void {
        // 创建直线
        const straightLine = LineFactory.createLine(LineType.STRAIGHT, {
            points: [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(5, 0, 0),
                new THREE.Vector3(5, 0, 5)
            ],
            name: "ExampleStraightLine"
        });
        this.lines.push(straightLine);
        
        // 创建曲线
        const curveLine = LineFactory.createLine(LineType.CURVE, {
            points: [
                new THREE.Vector3(0, 0, 5),
                new THREE.Vector3(2, 0, 7),
                new THREE.Vector3(4, 0, 5),
                new THREE.Vector3(6, 0, 7)
            ],
            name: "ExampleCurveLine"
        });
        this.lines.push(curveLine);
        
        // 创建圆弧
        const arcLine = LineFactory.createLine(LineType.ARC, {
            center: new THREE.Vector3(10, 0, 0),
            radius: 3,
            startAngle: 0,
            endAngle: Math.PI,
            name: "ExampleArcLine"
        });
        this.lines.push(arcLine);
        
        // 创建矩形
        const rectangleLine = LineFactory.createLine(LineType.RECTANGLE, {
            center: new THREE.Vector3(10, 0, 5),
            width: 4,
            height: 3,
            name: "ExampleRectangleLine"
        });
        this.lines.push(rectangleLine);
        
        // 创建多边形
        const polygonLine = LineFactory.createLine(LineType.POLYGON, {
            points: [
                new THREE.Vector3(0, 0, 10),
                new THREE.Vector3(2, 0, 12),
                new THREE.Vector3(4, 0, 10),
                new THREE.Vector3(3, 0, 8),
                new THREE.Vector3(1, 0, 8)
            ],
            name: "ExamplePolygonLine"
        });
        this.lines.push(polygonLine);
        
        console.log("[CADExample] 创建了所有示例线条");
    }
    
    /**
     * 获取所有线条
     */
    public getLines(): ILine[] {
        return [...this.lines];
    }
    
    /**
     * 清除所有线条
     */
    public clearLines(): void {
        for (const line of this.lines) {
            line.dispose();
        }
        this.lines = [];
        console.log("[CADExample] 清除了所有示例线条");
    }
}