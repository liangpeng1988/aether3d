import { THREE } from "../../core/global";
import { ScriptBase } from "../../core/ScriptBase";
import { CADTextScript } from "./CADTextScript";

/**
 * CAD标注配置接口
 */
export interface CADDimensionConfig {
    /** 标注线颜色 */
    dimensionColor?: number;
    /** 标注线宽度 */
    dimensionWidth?: number;
    /** 标注文字颜色 */
    textColor?: number;
    /** 标注文字大小 */
    textSize?: number;
    /** 是否显示箭头 */
    showArrows?: boolean;
    /** 箭头大小 */
    arrowSize?: number;
}

/**
 * 标注类型枚举
 */
export enum DimensionType {
    /** 水平标注 */
    HORIZONTAL,
    /** 垂直标注 */
    VERTICAL,
    /** 对齐标注 */
    ALIGNED
}

export class CADDimensionScript extends ScriptBase {
    name = 'CADDimensionScript';
    
    /** 配置参数 */
    private config: Required<CADDimensionConfig>;
    
    /** 标注线材质 */
    private dimensionMaterial: THREE.LineBasicMaterial;
    
    /** 文字脚本 */
    private textScript: CADTextScript | null = null;
    
    /** 箭头材质 */
    private arrowMaterial: THREE.MeshBasicMaterial;
    
    /** 所有标注对象 */
    private dimensions: THREE.Group[] = [];
    
    /** 当前正在创建的标注 */
    private currentDimension: THREE.Group | null = null;
    
    /** 标注起点 */
    private startPoint: THREE.Vector3 | null = null;
    
    /** 标注终点 */
    private endPoint: THREE.Vector3 | null = null;
    
    /** 标注类型 */
    private dimensionType: DimensionType = DimensionType.ALIGNED;
    
    /** 是否正在创建标注 */
    private isCreatingDimension = false;
    
    /** 回调函数 */
    private onDimensionCreated?: (dimension: any) => void;
    
    constructor(options?: CADDimensionConfig) {
        super();
        // 合并默认配置和用户配置
        this.config = {
            dimensionColor: 0x00ffff, // 青色
            dimensionWidth: 2,
            textColor: 0xffffff, // 白色
            textSize: 0.5,
            showArrows: true,
            arrowSize: 0.3,
            ...options
        };
        
        // 创建材质
        this.dimensionMaterial = new THREE.LineBasicMaterial({
            color: this.config.dimensionColor,
            linewidth: this.config.dimensionWidth
        });
        
        this.arrowMaterial = new THREE.MeshBasicMaterial({
            color: this.config.dimensionColor
        });
    }
    
    /**
     * 脚本初始化
     */
    public override async start(): Promise<void> {
        super.start?.();
        
        // 初始化文字脚本
        this.textScript = new CADTextScript({
            textColor: this.config.textColor,
            textSize: this.config.textSize
        });
        
        // 注意：在start方法中可能无法直接访问engine，需要在其他地方添加
        console.log('[CADDimensionScript] 初始化完成');
    }
    
    /**
     * 每帧更新
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
    }
    
    /**
     * 脚本销毁
     */
    public override destroy(): void {
        super.destroy?.();
        this.clearAllDimensions();
        
        if (this.textScript) {
            this.textScript.destroy();
            this.textScript = null;
        }
    }
    
    /**
     * 开始创建标注
     * @param type 标注类型
     * @param onCreated 创建完成回调
     */
    startDimensionCreation(type: DimensionType, onCreated?: (dimension: any) => void): void {
        this.dimensionType = type;
        this.isCreatingDimension = true;
        this.onDimensionCreated = onCreated;
        console.log(`[CADDimensionScript] 开始创建${this.getDimensionTypeName(type)}标注`);
    }
    
    /**
     * 设置标注起点
     * @param point 起点坐标
     */
    setStartPoint(point: THREE.Vector3): void {
        if (!this.isCreatingDimension) return;
        
        this.startPoint = point.clone();
        console.log(`[CADDimensionScript] 设置标注起点: ${point.x}, ${point.y}, ${point.z}`);
    }
    
    /**
     * 设置标注终点并创建标注
     * @param point 终点坐标
     */
    setEndPoint(point: THREE.Vector3): void {
        if (!this.isCreatingDimension || !this.startPoint) return;
        
        this.endPoint = point.clone();
        
        // 创建标注
        const dimension = this.createDimension(this.startPoint, this.endPoint, this.dimensionType);
        if (dimension) {
            this.dimensions.push(dimension);
            this.scene?.add(dimension);
            this.onDimensionCreated?.(dimension);
        }
        
        // 重置状态
        this.isCreatingDimension = false;
        this.startPoint = null;
        this.endPoint = null;
        
        console.log(`[CADDimensionScript] 标注创建完成`);
    }
    
    /**
     * 创建标注
     * @param start 起点
     * @param end 终点
     * @param type 标注类型
     * @returns 标注对象
     */
    private createDimension(start: THREE.Vector3, end: THREE.Vector3, type: DimensionType): THREE.Group | null {
        if (!this.scene) {
            console.warn('[CADDimensionScript] 场景未初始化');
            return null;
        }
        
        const group = new THREE.Group();
        
        // 计算标注线
        const dimensionLine = this.createDimensionLine(start, end, type);
        if (dimensionLine) {
            group.add(dimensionLine);
        }
        
        // 添加箭头
        if (this.config.showArrows) {
            const arrows = this.createArrows(start, end, type);
            group.add(...arrows);
        }
        
        // 添加文字标注
        const text = this.createDimensionText(start, end, type);
        if (text) {
            group.add(text);
        }
        
        return group;
    }
    
    /**
     * 创建标注线
     * @param start 起点
     * @param end 终点
     * @param type 标注类型
     * @returns 标注线对象
     */
    private createDimensionLine(start: THREE.Vector3, end: THREE.Vector3, type: DimensionType): THREE.Line | null {
        const points: THREE.Vector3[] = [];
        
        switch (type) {
            case DimensionType.HORIZONTAL:
                // 水平标注线（在XY平面上，水平指的是X轴方向）
                const y = (start.y + end.y) / 2;
                points.push(new THREE.Vector3(start.x, y, 0));
                points.push(new THREE.Vector3(end.x, y, 0));
                break;
                
            case DimensionType.VERTICAL:
                // 垂直标注线（在XY平面上，垂直指的是Y轴方向）
                const x = (start.x + end.x) / 2;
                points.push(new THREE.Vector3(x, start.y, 0));
                points.push(new THREE.Vector3(x, end.y, 0));
                break;
                
            case DimensionType.ALIGNED:
            default:
                // 对齐标注线
                points.push(start.clone());
                points.push(end.clone());
                break;
        }
        
        if (points.length < 2) return null;
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, this.dimensionMaterial);
        
        return line;
    }
    
    /**
     * 创建箭头
     * @param start 起点
     * @param end 终点
     * @param type 标注类型
     * @returns 箭头对象数组
     */
    private createArrows(start: THREE.Vector3, end: THREE.Vector3, type: DimensionType): THREE.Mesh[] {
        const arrows: THREE.Mesh[] = [];
        const arrowSize = this.config.arrowSize;
        
        // 计算箭头方向
        let direction = new THREE.Vector3();
        switch (type) {
            case DimensionType.HORIZONTAL:
                // 在XY平面上，水平标注的箭头指向X轴方向
                const y = (start.y + end.y) / 2;
                direction.set(1, 0, 0);
                if (end.x < start.x) direction.multiplyScalar(-1);
                break;
                
            case DimensionType.VERTICAL:
                // 在XY平面上，垂直标注的箭头指向Y轴方向
                const x = (start.x + end.x) / 2;
                direction.set(0, 1, 0);
                if (end.y < start.y) direction.multiplyScalar(-1);
                break;
                
            case DimensionType.ALIGNED:
            default:
                direction.subVectors(end, start).normalize();
                break;
        }
        
        // 起点箭头
        const startArrow = this.createArrow(start, direction.clone().multiplyScalar(-1), arrowSize);
        arrows.push(startArrow);
        
        // 终点箭头
        const endArrow = this.createArrow(end, direction, arrowSize);
        arrows.push(endArrow);
        
        return arrows;
    }
    
    /**
     * 创建单个箭头
     * @param position 箭头位置
     * @param direction 箭头方向
     * @param size 箭头大小
     * @returns 箭头对象
     */
    private createArrow(position: THREE.Vector3, direction: THREE.Vector3, size: number): THREE.Mesh {
        // 创建箭头几何体
        const arrowGeometry = new THREE.ConeGeometry(size / 2, size, 4);
        const arrow = new THREE.Mesh(arrowGeometry, this.arrowMaterial);
        
        // 设置箭头位置和方向
        arrow.position.copy(position);
        arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
        
        return arrow;
    }
    
    /**
     * 创建标注文字
     * @param start 起点
     * @param end 终点
     * @param type 标注类型
     * @returns 文字对象
     */
    private createDimensionText(start: THREE.Vector3, end: THREE.Vector3, type: DimensionType): THREE.Mesh | null {
        // 计算距离
        let distance: number;
        let textPosition = new THREE.Vector3();
        
        switch (type) {
            case DimensionType.HORIZONTAL:
                distance = Math.abs(end.x - start.x);
                // 在XY平面上，水平标注的文字位置在Y轴稍微偏移
                textPosition.set((start.x + end.x) / 2, (start.y + end.y) / 2 + 0.5, 0);
                break;
                
            case DimensionType.VERTICAL:
                distance = Math.abs(end.y - start.y);
                // 在XY平面上，垂直标注的文字位置在X轴稍微偏移
                textPosition.set((start.x + end.x) / 2 + 0.5, (start.y + end.y) / 2, 0);
                break;
                
            case DimensionType.ALIGNED:
            default:
                distance = start.distanceTo(end);
                const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
                // 文字位置稍微偏移标注线（在XY平面上）
                const offset = new THREE.Vector3(-0.3, 0.3, 0);
                textPosition.addVectors(center, offset);
                break;
        }
        
        // 使用CADTextScript创建文字
        if (this.textScript) {
            const text = distance.toFixed(2); // 保留两位小数
            return this.textScript.createText(text, textPosition, {
                color: this.config.textColor,
                size: this.config.textSize
            });
        }
        
        // 备用方案：创建一个简单的几何体来表示文字位置
        const geometry = new THREE.BoxGeometry(0.8, 0.3, 0.1);
        const material = new THREE.MeshBasicMaterial({ color: this.config.textColor });
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.position.copy(textPosition);
        textMesh.userData = { distance: distance };
        
        return textMesh;
    }
    
    /**
     * 获取标注类型名称
     * @param type 标注类型
     * @returns 类型名称
     */
    private getDimensionTypeName(type: DimensionType): string {
        switch (type) {
            case DimensionType.HORIZONTAL: return "水平";
            case DimensionType.VERTICAL: return "垂直";
            case DimensionType.ALIGNED: return "对齐";
            default: return "未知";
        }
    }
    
    /**
     * 清除所有标注
     */
    clearAllDimensions(): void {
        for (const dimension of this.dimensions) {
            this.scene?.remove(dimension);
            // 清理子对象
            while (dimension.children.length > 0) {
                const child = dimension.children[0];
                if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material instanceof THREE.Material) {
                        child.material.dispose();
                    }
                }
                dimension.remove(child);
            }
        }
        this.dimensions = [];
        
        // 清除文字
        if (this.textScript) {
            this.textScript.clearAllTexts();
        }
        
        console.log('[CADDimensionScript] 所有标注已清除');
    }
    
    /**
     * 删除指定标注
     * @param dimension 要删除的标注
     */
    removeDimension(dimension: THREE.Group): void {
        const index = this.dimensions.indexOf(dimension);
        if (index !== -1) {
            this.scene?.remove(dimension);
            // 清理子对象
            while (dimension.children.length > 0) {
                const child = dimension.children[0];
                if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                    if (child.material instanceof THREE.Material) {
                        child.material.dispose();
                    }
                }
                dimension.remove(child);
            }
            this.dimensions.splice(index, 1);
            console.log('[CADDimensionScript] 标注已删除');
        }
    }
    
    /**
     * 设置标注颜色
     * @param color 颜色值
     */
    setDimensionColor(color: number): void {
        this.config.dimensionColor = color;
        this.dimensionMaterial.color.set(color);
        this.arrowMaterial.color.set(color);
    }
    
    /**
     * 设置文字颜色
     * @param color 颜色值
     */
    setTextColor(color: number): void {
        this.config.textColor = color;
        if (this.textScript) {
            this.textScript.setTextColor(color);
        }
    }
    
    /**
     * 设置标注线宽度
     * @param width 线宽
     */
    setDimensionWidth(width: number): void {
        this.config.dimensionWidth = width;
        this.dimensionMaterial.linewidth = width;
    }
    
    /**
     * 设置是否显示箭头
     * @param show 是否显示
     */
    setShowArrows(show: boolean): void {
        this.config.showArrows = show;
    }
    
    /**
     * 获取所有标注
     * @returns 标注数组
     */
    getDimensions(): THREE.Group[] {
        return [...this.dimensions];
    }
}