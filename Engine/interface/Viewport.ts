import { THREE } from '../core/global'
import type { MouseInteractionConfig } from '../controllers/MouseInteractionScript';

/**
 * 视口自适应系统
 */
export interface Viewport {

    /**
     * 画布元素
     */
    element: HTMLCanvasElement

    /**
     * 当前设备像素比
     * 可能会根据设备或设置变化而调整
     */
    dpr: THREE.Vector2

    /** 透明背景配置 */
    alpha?: boolean;

    /** 是否启用抗锯齿 */
    antialias: boolean

    /**
     * 缩放因子
     * 用于计算视口尺寸的缩放比例
     */
    factor: number

    /** Camera distance */
    distance: number

    /**
     * 宽高比
     * 视口的宽度与高度之比
     */
    aspect: number

    /** 是否启用后处理 */
    enablePostProcessing: boolean

    /** 是否启用性能监控 */
    enablePerformanceMonitoring: boolean

    /** 是否启用对数深度缓冲 */
    enableLogarithmicDepthBuffer?: boolean

    /** 目标帧率 */
    targetFPS?: number

    /** 背景颜色 */
    backgroundColor?: string

    /** 鼠标交互配置 */
    mouseInteraction?: MouseInteractionConfig;
}