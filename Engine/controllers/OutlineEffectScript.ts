import { THREE } from "../core/global.ts";
import { ScriptBase } from "../core/ScriptBase";
import { OutlinePass } from '../core/global';

/**
 * Outline效果脚本
 * 演示如何创建一个轮廓后处理效果脚本
 */
export class OutlineEffectScript extends ScriptBase {
    // Outline效果参数
    private edgeStrength: number = 3.0;
    private edgeGlow: number = 0.0;
    private edgeThickness: number = 1.0;
    private pulsePeriod: number = 0;
    private selectedObjects: THREE.Object3D[] = [];
    private pass: any = null;

    constructor(
        selectedObjects: THREE.Object3D[] = [],
        edgeStrength?: number,
        edgeGlow?: number,
        edgeThickness?: number,
        pulsePeriod?: number
    ) {
        super();
        this.name = "OutlineEffectScript";

        this.selectedObjects = selectedObjects;

        if (edgeStrength !== undefined) this.edgeStrength = edgeStrength;
        if (edgeGlow !== undefined) this.edgeGlow = edgeGlow;
        if (edgeThickness !== undefined) this.edgeThickness = edgeThickness;
        if (pulsePeriod !== undefined) this.pulsePeriod = pulsePeriod;
    }

    /**
     * 当脚本被添加到渲染器时调用
     */
    public override awake(): void {
        super.awake?.();

        // 创建Outline通道
        this.createPass();
    }

    /**
     * 当脚本变为启用和激活状态时调用
     */
    public override onEnable(): void {
        super.onEnable?.();

        // 如果通道已创建，添加到Composer中
        if (this.pass && this.renderer) {
            this.renderer.addPostProcessingPass(this.pass);
        }
    }

    /**
     * 当脚本变为禁用或非激活状态时调用
     */
    public override onDisable(): void {
        super.onDisable?.();

        // 从Composer中移除通道
        if (this.pass && this.renderer) {
            this.renderer.removePostProcessingPass(this.pass);
        }
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();

        // 从Composer中移除通道
        if (this.pass && this.renderer) {
            this.renderer.removePostProcessingPass(this.pass);
        }

        // 清理通道资源
        if (this.pass && typeof this.pass.dispose === 'function') {
            this.pass.dispose();
            this.pass = null;
        }
    }

    /**
     * 创建Outline通道
     */
    private createPass(): void {
        try {
            if (this.renderer) {
                // 创建Vector2对象而不是使用字面量对象
                const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
                this.pass = new OutlinePass(
                    size,
                    this.renderer.scene,
                    this.renderer.camera,
                    this.selectedObjects
                );

                // 设置参数 - 优化轮廓效果质量
                this.pass.edgeStrength = this.edgeStrength;
                this.pass.edgeGlow = this.edgeGlow;
                this.pass.edgeThickness = this.edgeThickness;
                this.pass.pulsePeriod = this.pulsePeriod;

                // 添加额外的质量优化参数
                this.pass.visibleEdgeColor.set(0xffffff); // 白色轮廓线
                this.pass.hiddenEdgeColor.set(0x888888); // 灰色隐藏边线
                this.pass.usePatternTexture = false; // 不使用图案纹理

                // 如果脚本已经启用，立即将通道添加到composer中
                if (this.renderer.isPostProcessingEnabled()) {
                    this.renderer.addPostProcessingPass(this.pass);
                }
            }
        } catch (error) {
            console.error('[OutlineEffectScript] Failed to create Outline pass:', error);
        }
    }

    /**
     * 更新Outline参数
     */
    public updateParameters(
        edgeStrength?: number,
        edgeGlow?: number,
        edgeThickness?: number,
        pulsePeriod?: number
    ): void {
        if (edgeStrength !== undefined) this.edgeStrength = edgeStrength;
        if (edgeGlow !== undefined) this.edgeGlow = edgeGlow;
        if (edgeThickness !== undefined) this.edgeThickness = edgeThickness;
        if (pulsePeriod !== undefined) this.pulsePeriod = pulsePeriod;

        // 更新通道参数
        if (this.pass) {
            if (edgeStrength !== undefined) this.pass.edgeStrength = edgeStrength;
            if (edgeGlow !== undefined) this.pass.edgeGlow = edgeGlow;
            if (edgeThickness !== undefined) this.pass.edgeThickness = edgeThickness;
            if (pulsePeriod !== undefined) this.pass.pulsePeriod = pulsePeriod;
        }
    }

    /**
     * 设置要添加轮廓的对象
     */
    public setSelectedObjects(objects: THREE.Object3D[]): void {
        this.selectedObjects = objects;

        if (this.pass) {
            this.pass.selectedObjects = objects;
        }
    }

    /**
     * 添加对象到轮廓选择列表
     */
    public addObject(object: THREE.Object3D): void {
        if (!this.selectedObjects.includes(object)) {
            this.selectedObjects.push(object);

            if (this.pass) {
                this.pass.selectedObjects = this.selectedObjects;
            }
        }
    }

    /**
     * 从轮廓选择列表中移除对象
     */
    public removeObject(object: THREE.Object3D): void {
        const index = this.selectedObjects.indexOf(object);
        if (index !== -1) {
            this.selectedObjects.splice(index, 1);

            if (this.pass) {
                this.pass.selectedObjects = this.selectedObjects;
            }
        }
    }

    /**
     * 获取当前选中的对象列表
     */
    public getSelectedObjects(): THREE.Object3D[] {
        return this.selectedObjects;
    }

    /**
     * 每一帧在 update 调用之后调用
     */
    public override lateUpdate(deltaTime: number): void {
        super.lateUpdate?.(deltaTime);
    }

    /**
     * 获取通道实例
     */
    public getPass(): any {
        return this.pass;
    }
}
