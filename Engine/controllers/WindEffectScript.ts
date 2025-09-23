import { THREE } from "../core/global.ts";
import { ScriptBase } from "../core/ScriptBase";
import { WindMaterial } from "../materials/WindMaterial.ts"; // 导入WindMaterial

export class WindEffectScript extends ScriptBase {
    private winds: THREE.Mesh[] = [];
    private materials: WindMaterial[] = []; // 使用WindMaterial类型
    // 空调参数
    private acPosition = new THREE.Vector3(3, 2.5, 0); // 空调位置（调整到更合适的位置）
    private windCount = 5; // 风流数量
    private windWidth = 2; // 风流宽度
    private windHeight = 6; // 风流高度
    private isStrongMode = false;
    private isWindActive = true;
    private isCurved = false; // 添加弯曲效果参数
    private curveIntensity = 1.0; // 弯曲强度
    private glowIntensity = 0.5; // 发光强度
    private startTime = 0;

    constructor() {
        super();
        this.name = "WindEffectScript";
    }

    /**
     * 当脚本被添加到渲染器时调用
     */
    public override awake(): void {
        super.awake?.();
    }

    /**
     * 当脚本变为启用和激活状态时调用
     */
    public override onEnable(): void {
        super.onEnable?.();
    }

    /**
     * 当脚本变为启用和激活状态时调用
     */
    public override start(): void {
        super.start?.();
        this.startTime = Date.now();
        
        // 创建风流几何体（使用PlaneGeometry创建面片）
        const windGeometry = new THREE.PlaneGeometry(this.windWidth, this.windHeight, 20, 20);
        
        // 创建多个风流，使用WindMaterial
        for (let i = 0; i < this.windCount; i++) {
            // 使用WindMaterial创建材质
            const material = new WindMaterial();
            
            // 设置材质属性
            material.curveIntensity = this.isCurved ? this.curveIntensity : 0.0;
            material.windStrength = this.isStrongMode ? 0.8 : 0.5;
            material.glowIntensity = this.glowIntensity;
            material.color = new THREE.Color(this.isStrongMode ? 0x00ffff : 0xaaaaaa);
            material.glowColor = new THREE.Color(this.isStrongMode ? 0x00ffff : 0xaaaaaa);

            this.materials.push(material);
            const wind = new THREE.Mesh(windGeometry, material);

            // 设置风流位置
            wind.position.set(
                this.acPosition.x + (i - (this.windCount - 1) / 2) * 0.5,
                this.acPosition.y - this.windHeight / 2 - 0.5,
                this.acPosition.z
            );

            // 旋转面片使其面向正确方向
            wind.rotation.x = -Math.PI / 2;

            // 确保场景存在后再添加
            if (this.scene) {
                this.scene.add(wind);
                this.winds.push(wind);
            }
        }
    }

    /**
     * 当脚本变为禁用或非激活状态时调用
     */
    public override onDisable(): void {
        super.onDisable?.();
        // 移除所有风流
        this.winds.forEach(wind => {
            if (this.scene) {
                this.scene.remove(wind);
            }
        });
        this.winds = [];
        this.materials = [];
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();
        // 清理资源
        this.winds.forEach(wind => {
            if (this.scene) {
                this.scene.remove(wind);
            }
        });
        this.winds = [];
        this.materials = [];
    }

    /**
     * 每一帧更新时调用
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
        if (this.isWindActive) {
            // 使用运行时间而不是deltaTime来更新uTime
            const elapsedTime = (Date.now() - this.startTime) / 1000;
            
            this.materials.forEach((material) => {
                material.time = elapsedTime;
                
                // 更新强度和速度
                material.windStrength = this.isStrongMode ? 0.8 : 0.5;
                
                // 更新颜色
                material.color = new THREE.Color(this.isStrongMode ? 0x00ffff : 0xaaaaaa);
                material.glowColor = new THREE.Color(this.isStrongMode ? 0x00ffff : 0xaaaaaa);
                
                // 更新弯曲参数
                material.curveIntensity = this.isCurved ? this.curveIntensity : 0.0;
                
                // 更新发光参数
                material.glowIntensity = this.glowIntensity;
            });
        }
    }

    /**
     * 每一帧在 update 调用之后调用
     */
    public override lateUpdate(deltaTime: number): void {
        super.lateUpdate?.(deltaTime);
    }

    /**
     * 设置风效强度模式
     * @param strongMode 是否启用强力模式
     */
    public setStrongMode(strongMode: boolean): void {
        this.isStrongMode = strongMode;
    }

    /**
     * 启用或禁用风效
     * @param active 是否启用风效
     */
    public setWindActive(active: boolean): void {
        this.isWindActive = active;
    }

    /**
     * 设置空调位置
     * @param position 空调位置
     */
    public setAcPosition(position: THREE.Vector3): void {
        this.acPosition.copy(position);
        // 重新创建风流以应用新位置
        this.recreateWinds();
    }

    /**
     * 设置是否启用弯曲效果
     * @param curved 是否启用弯曲效果
     */
    public setCurved(curved: boolean): void {
        this.isCurved = curved;
        // 更新所有材质的弯曲参数
        this.materials.forEach(material => {
            material.curveIntensity = curved ? this.curveIntensity : 0.0;
        });
    }

    /**
     * 设置弯曲强度
     * @param intensity 弯曲强度 (0.0 - 2.0)
     */
    public setCurveIntensity(intensity: number): void {
        this.curveIntensity = Math.max(0.0, Math.min(2.0, intensity)); // 限制在0-2范围内
        // 更新所有材质的弯曲强度参数
        this.materials.forEach(material => {
            material.curveIntensity = this.isCurved ? this.curveIntensity : 0.0;
        });
    }

    /**
     * 设置发光强度
     * @param intensity 发光强度 (0.0 - 1.0)
     */
    public setGlowIntensity(intensity: number): void {
        this.glowIntensity = Math.max(0.0, Math.min(1.0, intensity)); // 限制在0-1范围内
        // 更新所有材质的发光强度参数
        this.materials.forEach(material => {
            material.glowIntensity = this.glowIntensity;
        });
    }

    /**
     * 重新创建风流
     */
    private recreateWinds(): void {
        // 移除现有风流
        this.winds.forEach(wind => {
            if (this.scene) {
                this.scene.remove(wind);
            }
        });
        this.winds = [];
        this.materials = [];

        // 重新创建风流
        if (this.scene) {
            this.start();
        }
    }
}