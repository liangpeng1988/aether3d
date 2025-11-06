import { THREE } from "../core/global";

/**
 * 材质配置接口
 */
export interface MaterialConfig {
    /** 材质颜色 */
    color?: number | string;
    /** 是否透明 */
    transparent?: boolean;
    /** 透明度 */
    opacity?: number;
    /** 纹理 */
    texture?: THREE.Texture | null;
    /** Alpha贴图 */
    alphaMap?: THREE.Texture | null;
    /** 是否双面渲染 */
    doubleSided?: boolean;
    
    depthWrite?: boolean;
    /** 材质类型 */
    type?: 'standard' | 'basic' | 'lambert' | 'phong' | 'diffusion';
    
    // 扩散材质专用参数
    /** 高亮颜色 (用于扩散材质) */
    highlightColor?: THREE.Color | string | number;
    /** 动画速度 (用于扩散材质) */
    speed?: number;
    /** 扩散半径 (用于扩散材质) */
    radius?: number;
    /** 扩散宽度 (用于扩散材质) */
    width?: number;
}