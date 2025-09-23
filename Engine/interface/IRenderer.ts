import { THREE } from "../core/global"

/**
 * 渲染器接口 (IRenderer)
 *
 * 定义了渲染器必须实现的方法。
 * 这使得引擎可以使用不同的渲染技术（如 WebGL, WebGPU）而无需修改核心逻辑。
 */
export interface IRenderer {
    /**
     * 获取渲染器的 DOM 元素（通常是 `<canvas>`）。
     * 用于将其添加到 HTML 页面中。
     */
    get domElement(): HTMLCanvasElement;

    /**
     * 设置渲染器的尺寸。
     * @param value
     */
    setSize(value: THREE.Vector2): void;

    /**
     * 设置设备像素比。
     * @param value 设备像素比。
     */
    setPixelRatio(value: number): void;

    /**
     * 销毁渲染器，释放相关资源。
     */
    dispose(): void;
}
