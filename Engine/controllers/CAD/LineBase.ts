import { THREE } from "../../core/global";

/**
 * 线条基类接口
 */
export interface ILine {
    /**
     * 获取线条的几何体
     */
    getGeometry(): THREE.BufferGeometry;
    
    /**
     * 获取线条的材质
     */
    getMaterial(): THREE.Material;
    
    /**
     * 获取线条的名称
     */
    getName(): string;
    
    /**
     * 更新线条
     */
    update(): void;
    
    /**
     * 销毁线条
     */
    dispose(): void;
}

/**
 * 线条基类
 * 所有线条类型的基类，提供通用功能
 */
export abstract class LineBase implements ILine {
    protected geometry: THREE.BufferGeometry;
    protected material: THREE.Material;
    protected name: string;
    protected points: THREE.Vector3[];
    
    constructor(points: THREE.Vector3[], name: string) {
        this.points = points;
        this.name = name;
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.LineBasicMaterial();
        this.updateGeometry();
    }
    
    /**
     * 获取线条的几何体
     */
    public getGeometry(): THREE.BufferGeometry {
        return this.geometry;
    }
    
    /**
     * 获取线条的材质
     */
    public getMaterial(): THREE.Material {
        return this.material;
    }
    
    /**
     * 获取线条的名称
     */
    public getName(): string {
        return this.name;
    }
    
    /**
     * 获取线条的点
     */
    public getPoints(): THREE.Vector3[] {
        return [...this.points];
    }
    
    /**
     * 设置线条的点
     */
    public setPoints(points: THREE.Vector3[]): void {
        this.points = points;
        this.updateGeometry();
    }
    
    /**
     * 添加点到线条
     */
    public addPoint(point: THREE.Vector3): void {
        this.points.push(point);
        this.updateGeometry();
    }
    
    /**
     * 更新几何体
     */
    protected updateGeometry(): void {
        this.geometry.dispose();
        this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);
    }
    
    /**
     * 更新线条（子类可以重写此方法）
     */
    public update(): void {
        // 基类实现为空，子类可以重写
    }
    
    /**
     * 销毁线条
     */
    public dispose(): void {
        this.geometry.dispose();
        this.material.dispose();
    }
}