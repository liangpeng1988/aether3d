import { THREE } from "../core/global";
import { CanvasTexture } from "three";

/**
 * UV动画材质类
 * 专门用于处理UV动画的材质
 */
export class AnimationMaterial extends THREE.MeshStandardMaterial {
    private _uvOffset: THREE.Vector2 = new THREE.Vector2(0, 0);
    private _uvScale: THREE.Vector2 = new THREE.Vector2(1, 1);
    private _uvRotation: number = 0;

    constructor(config?: {
        depthWrite?: boolean;
        color?: number | string;
        texture?: THREE.Texture;
        alphaMap?: CanvasTexture;
        doubleSided?: boolean;
        opacity?: number;
        uvScale?: THREE.Vector2;
        uvOffset?: THREE.Vector2;
        transparent?: boolean;
    }) {
        // 处理透明度相关配置
        const isTransparent = config?.transparent ?? false;
        const hasAlphaMap = !!config?.alphaMap;
        const opacity = config?.opacity ?? 1.0;

        // 对于透明材质，通常需要关闭深度写入以避免遮挡问题
        const depthWrite = config?.depthWrite ?? !(isTransparent || hasAlphaMap || opacity < 1.0);

        super({
            color: config?.color,
            transparent: isTransparent,
            opacity: opacity,
            map: config?.texture,
            alphaTest: 0,
            alphaMap: config?.alphaMap,
            side: config?.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            depthWrite: depthWrite
        });

        // 对于透明材质，设置渲染顺序以确保在不透明对象之后渲染
        if (isTransparent || hasAlphaMap || opacity < 1.0) {
            this.depthWrite = false;
            // 设置透明对象的渲染顺序，确保在不透明对象之后渲染
            this.transparent = true;
        }

        // 正确处理uvOffset配置
        if (config?.uvOffset) {
            this._uvOffset.copy(config.uvOffset);
        }

        // 正确处理uvScale配置
        if (config?.uvScale) {
            this._uvScale.copy(config.uvScale);
        }

        // 确保纹理使用重复包装模式
        if (this.map) {
            this.map.wrapS = THREE.RepeatWrapping;
            this.map.wrapT = THREE.RepeatWrapping;
        }

        if (this.alphaMap) {
            this.alphaMap.wrapS = THREE.RepeatWrapping;
            this.alphaMap.wrapT = THREE.RepeatWrapping;
        }
    }

    /**
     * 获取UV偏移
     */
    get uvOffset(): THREE.Vector2 {
        return this._uvOffset.clone();
    }

    /**
     * 设置UV偏移
     */
    set uvOffset(value: THREE.Vector2) {
        this._uvOffset.copy(value);
        this.updateUVTransform();
    }

    /**
     * 获取UV缩放
     */
    get uvScale(): THREE.Vector2 {
        return this._uvScale.clone();
    }

    /**
     * 设置UV缩放
     */
    set uvScale(value: THREE.Vector2) {
        this._uvScale.copy(value);
        this.updateUVTransform();
    }

    /**
     * 获取UV旋转角度
     */
    get uvRotation(): number {
        return this._uvRotation;
    }

    /**
     * 设置UV旋转角度
     */
    set uvRotation(value: number) {
        this._uvRotation = value;
        this.updateUVTransform();
    }

    /**
     * 更新UV变换
     */
    private updateUVTransform(): void {
        if (this.map) {
            this.map.offset.copy(this._uvOffset);
            this.map.repeat.copy(this._uvScale);
            this.map.needsUpdate = true;
        }
    }

    /**
     * 应用UV滚动
     * @param deltaX X轴偏移增量
     * @param deltaY Y轴偏移增量
     */
    public scrollUV(deltaX: number, deltaY: number): void {
        this._uvOffset.x += deltaX;
        this._uvOffset.y += deltaY;
        this.updateUVTransform();
    }

    /**
     * 应用UV缩放
     * @param scaleX X轴缩放增量
     * @param scaleY Y轴缩放增量
     */
    public scaleUV(scaleX: number, scaleY: number): void {
        this._uvScale.x += scaleX;
        this._uvScale.y += scaleY;
        this.updateUVTransform();
    }

    /**
     * 重置UV变换到初始状态
     */
    public resetUV(): void {
        this._uvOffset.set(0, 0);
        this._uvScale.set(1, 1);
        this._uvRotation = 0;
        this.updateUVTransform();
    }

    /**
     * 设置UV变换参数
     * @param offset UV偏移
     * @param scale UV缩放
     * @param rotation UV旋转角度
     */
    public setUVTransform(offset?: THREE.Vector2, scale?: THREE.Vector2, rotation?: number): void {
        if (offset) {
            this._uvOffset.copy(offset);
        }
        if (scale) {
            this._uvScale.copy(scale);
        }
        if (rotation !== undefined) {
            this._uvRotation = rotation;
        }
        this.updateUVTransform();
    }

    /**
     * 获取当前UV变换状态
     */
    public getUVTransform(): { offset: THREE.Vector2; scale: THREE.Vector2; rotation: number } {
        return {
            offset: this._uvOffset.clone(),
            scale: this._uvScale.clone(),
            rotation: this._uvRotation
        };
    }
}
