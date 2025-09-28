import { THREE } from "../../core/global";
import { ILine } from "./LineBase";
import { 
    StraightLine, 
    CurveLine, 
    ArcLine, 
    RectangleLine, 
    PolygonLine 
} from "./LineTypes";

/**
 * 线条类型枚举
 */
export enum LineType {
    STRAIGHT = "straight",
    CURVE = "curve",
    ARC = "arc",
    RECTANGLE = "rectangle",
    POLYGON = "polygon"
}

/**
 * 线条工厂类
 * 用于创建不同类型的线条
 */
export class LineFactory {
    /**
     * 创建线条
     * @param type 线条类型
     * @param params 创建参数
     * @returns 线条实例
     */
    public static createLine(type: LineType, params: any): ILine {
        switch (type) {
            case LineType.STRAIGHT:
                return new StraightLine(params.points, params.name || `StraightLine_${Date.now()}`);
                
            case LineType.CURVE:
                return new CurveLine(params.points, params.name || `CurveLine_${Date.now()}`);
                
            case LineType.ARC:
                return new ArcLine(
                    params.center, 
                    params.radius, 
                    params.startAngle, 
                    params.endAngle, 
                    params.name || `ArcLine_${Date.now()}`
                );
                
            case LineType.RECTANGLE:
                return new RectangleLine(
                    params.center, 
                    params.width, 
                    params.height, 
                    params.name || `RectangleLine_${Date.now()}`
                );
                
            case LineType.POLYGON:
                return new PolygonLine(params.points, params.name || `PolygonLine_${Date.now()}`);
                
            default:
                throw new Error(`Unsupported line type: ${type}`);
        }
    }
}