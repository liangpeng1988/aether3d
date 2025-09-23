import { THREE } from "../core/global.ts";
import { ScriptBase } from "../core/ScriptBase";
import { MeshReflectorMaterial } from '@react-three/drei'

/**
 * Bloom效果脚本
 * 演示如何创建一个具体的后处理效果脚本
 */
export class DreiEeflectorScript extends ScriptBase {


    constructor() {
        super();
        this.name = "DreiEeflectorScript";
        // 创建反射平面
        const planeGeometry = new THREE.PlaneGeometry(50, 50);
        const boxMaterial = <MeshReflectorMaterialImpl
  blur={[400, 100]}
  resolution={1024}
  mixBlur={1}
  mixStrength={15}
  depthScale={1}
  minDepthThreshold={0.85}
  color="#151515"
  metalness={0.6}
  roughness={1}
/>;
        const grass = new THREE.Mesh(planeGeometry, boxMaterial);
        grass.position.set(0, 0.5, 0);
        grass.name = 'grass';
        this.scene.add(grass);
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
     * 当脚本变为禁用或非激活状态时调用
     */
    public override onDisable(): void {
        super.onDisable?.();
    }

    /**
     * 脚本销毁时调用
     */
    public override destroy(): void {
        super.destroy?.();
    }

    /**
     * 每一帧更新时调用
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
    }

    /**
     * 每一帧在 update 调用之后调用
     */
    public override lateUpdate(deltaTime: number): void {
        super.lateUpdate?.(deltaTime);
    }
}
