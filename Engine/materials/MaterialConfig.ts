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
    type?: 'standard' | 'basic' | 'lambert' | 'phong';
}