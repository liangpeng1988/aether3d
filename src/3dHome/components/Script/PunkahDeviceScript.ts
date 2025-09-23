import { ScriptBase } from "../../../../Engine/core/ScriptBase";
import {THREE, TWEEN} from "../../../../Engine/core/global";
import type {GLBLoaderScript} from "../../../../Engine/controllers/GLBLoaderScript.ts";
import {AnimationMaterial} from "../../../../Engine/materials/AnimationMaterial.ts";
import {createGradientAlphaMap, loadTexture} from "../../../../Engine/math";
import {ShaderGlowMaterial} from "../../../../Engine/materials/ShaderGlowMaterial.ts";
import {SetPBRDefaultOrHighlightMat} from "./utils.ts";


export interface punkahDeviceConfig {
    /** 灯光名称 */
    name: string;
    /** 灯光位置 */
    position: [number, number, number];
    /** 灯光旋转 */
    rotation: [number, number, number];
    /** 灯光缩放 */
    scale: [number, number, number];
    y: number;
    /** 模型 */
    model: string;
    /** 摇头速度，默认为1 */
    swingSpeed?: number;
}

export class PunkahDeviceScript extends ScriptBase {
    private loadModel: GLBLoaderScript | null = null;
    private configs: punkahDeviceConfig[] = [];
    private loadedModels: Map<string, THREE.Group> = new Map();
    private animationMaterial: AnimationMaterial | null = null;
    private meshLeftOpenTweens: TWEEN.Tween | null = null;
    private HeadGroup: THREE.Group | null = null;
    private shangYe:THREE.Object3D | null = null;
    private defaultMaterial: Map<THREE.Mesh, THREE.MeshStandardMaterial> = new Map();
    private highlightMaterial: Map<THREE.Mesh, ShaderGlowMaterial> = new Map();
    // 风扇相关的属性
    private yawAngle: number = 0; // 当前偏航角
    private yawDirection: number = 1; // 偏航方向(1为正向，-1为反向)
    private readonly maxYawAngle: number = Math.PI / 2; // 最大偏航角度
    private baseYawSpeed: number = 0.02; // 基础偏航速度
    private yawSpeed: number = 0.02; // 当前偏航速度（可调节）
    private swingSpeed: number = 1; // 摇头速度倍率

    // 风扇开关状态
    private isFanOn: boolean = true; // 风扇默认开启

    // 风效对象
    private windEffects: THREE.Object3D | null = null;

    // 风效对象
    private windEffect: THREE.Object3D | null = null;

    constructor(loadModel: GLBLoaderScript, configs?: punkahDeviceConfig | punkahDeviceConfig[]) {
        super();
        this.name = "PunkahDeviceScript";
        this.loadModel = loadModel;
        if (configs) {
            if (Array.isArray(configs)) {
                this.configs = configs;
                // 使用配置中的摇头速度
                if (configs[0]?.swingSpeed !== undefined) {
                    this.swingSpeed = configs[0].swingSpeed;
                    this.yawSpeed = this.baseYawSpeed * this.swingSpeed;
                }
            } else {
                this.configs = [configs];
                // 使用配置中的摇头速度
                if (configs.swingSpeed !== undefined) {
                    this.swingSpeed = configs.swingSpeed;
                    this.yawSpeed = this.baseYawSpeed * this.swingSpeed;
                }
            }
        }
    }

    /**
     * 启动脚本时调用
     */
    public start(): void {
        if (this.loadModel) {
            // 加载所有配置的模型
            this.loadAllModels().then(() => {});
        } else {
            console.warn("CeilingLightScript: GLBLoaderScript实例未提供");
        }

        // 加载纹理
        loadTexture('/images/6803941_cd79024943f4faaf1ce25d8b31af9bcc.png').then(texture => {
            // 创建渐变alpha贴图
            const alphaMap = createGradientAlphaMap();
            this.animationMaterial = new AnimationMaterial({
                color: '#05a7ff',
                texture: texture,
                alphaMap: alphaMap,
                transparent: true,
                opacity: 1,
                doubleSided: true,
                depthWrite: false,
                uvOffset: new THREE.Vector2(0, 0),
                uvScale: new THREE.Vector2(1, 1)
            });

        });

        // 监听鼠标交互事件
        this.engine()?.on('mouse:objectSelected', (data) => {
            const object = data.object;

            if (object && object.name === 'Mesh1') {
                console.log('对象被选中:', object.name);
                this.highlightMaterial.forEach((material, object3D) => {
                    object3D.material = material;
                });
            }
        });
    }

    /**
     * 加载所有配置的模型
     */
    private async loadAllModels(): Promise<void> {
        for (const config of this.configs) {
            try {
                await this.loadModelByConfig(config);
            } catch (error) {
                console.error(`CeilingLightScript: 加载模型 "${config.model}" 失败:`, error);
            }
        }
    }

    /**
     * 根据配置加载单个模型
     * @param config 天花板灯配置
     */
    private async loadModelByConfig(config: punkahDeviceConfig): Promise<void> {
        if (!this.loadModel) {
            throw new Error("GLBLoaderScript未初始化");
        }

        // 加载模型
        const modelResult = await this.loadModel.loadModel(config.model, {
            position: new THREE.Vector3(config.position[0], config.position[1], config.position[2]),
            rotation: new THREE.Euler(config.rotation[0], config.rotation[1], config.rotation[2]),
            scale: new THREE.Vector3(config.scale[0], config.scale[1], config.scale[2]),
            addToScene: true
        });


        this.scene.traverse((object: THREE.Object3D) => {
            if (!object) return;
            if (object.name === 'Mesh1' && object instanceof THREE.Mesh) {
                const geometry = object.geometry;
                if (!geometry.attributes && !geometry.attributes.uv1) return;
                const materials = SetPBRDefaultOrHighlightMat(object);
                this.defaultMaterial.set(object, materials.defaultMat as THREE.MeshStandardMaterial);
                this.highlightMaterial.set(object, materials.highlightMat as ShaderGlowMaterial);
                object.material =  materials.defaultMat as THREE.MeshStandardMaterial;
                object.material.needsUpdate = true;
                this.HeadGroup = object.parent as THREE.Group;
            }

            if (object.name === 'Mesh2' && object instanceof THREE.Mesh) {
                const geometry = object.geometry;
                if (!geometry.attributes && !geometry.attributes.uv1) return;
                const materials = SetPBRDefaultOrHighlightMat(object);
                this.defaultMaterial.set(object, materials.defaultMat as THREE.MeshStandardMaterial);
                this.highlightMaterial.set(object, materials.highlightMat as ShaderGlowMaterial);
                object.material =  materials.defaultMat as THREE.MeshStandardMaterial;
                object.material.needsUpdate = true;
                this.engine()?.disableSelection(object.name);
            }

            if (object.name === 'shangye' && object instanceof THREE.Mesh) {
                const geometry = object.geometry;
                if (!geometry.attributes && !geometry.attributes.uv1) return;
                this.shangYe = geometry;
                const materials = SetPBRDefaultOrHighlightMat(object);
                this.defaultMaterial.set(object, materials.defaultMat as THREE.MeshStandardMaterial);
                this.highlightMaterial.set(object, materials.highlightMat as ShaderGlowMaterial);
                object.material =  materials.defaultMat as THREE.MeshStandardMaterial;
                object.material.needsUpdate = true;
                console.log('shangye')
                this.engine()?.disableSelection(object.name);
            }

            if (object.name === 'fengshang' && object instanceof THREE.Mesh) {
                const geometry = object.geometry;
                if (!geometry.attributes && !geometry.attributes.uv1) return;
                object.visible = false;
                this.engine()?.disableSelection(object.name);
            }

            if (object.name === 'sho' && object instanceof THREE.Mesh) {
                const geometry = object.geometry;
                if (!geometry.attributes && !geometry.attributes.uv1) return;
                const shadow = new THREE.TextureLoader().load( '/images/shadowMap.png' );
                object.material = new THREE.MeshBasicMaterial( {
                    map: shadow, blending: THREE.MultiplyBlending, toneMapped: true, transparent: true, premultipliedAlpha: true
                });
                this.engine()?.disableSelection(object.name);
            }
        });

        this.loadedModels.set(config.name, modelResult.scene);
    }

    /**
     * 更新方法，在每一帧调用
     */
    public update(): void {
        this.meshLeftOpenTweens?.update();
        if (this.animationMaterial)
        {
            this.animationMaterial.scrollUV(0, this.configs[0].y * 0.06);
        }
        // 只有在风扇开启时才执行摇头动画
        if (this.isFanOn && this.HeadGroup) {
            // 更新偏航角度
            this.yawAngle += this.yawSpeed * this.yawDirection;

            // 检查是否需要改变方向
            if (this.yawAngle >= this.maxYawAngle) {
                this.yawAngle = this.maxYawAngle;
                this.yawDirection = -1; // 改为反向
            } else if (this.yawAngle <= -this.maxYawAngle) {
                this.yawAngle = -this.maxYawAngle;
                this.yawDirection = 1; // 改为正向
            }

            // 应用旋转
            this.HeadGroup.rotation.set(0, this.yawAngle, 0);
            if (this.shangYe)
            {
                this.shangYe.rotateZ(14);
            }
        }
    }

    /**
     * 开启风扇
     */
    public turnOn(): void {
        this.isFanOn = true;
        if (this.windEffects)
        {
            this.windEffects.visible = true;
        }
    }

    /**
     * 关闭风扇
     */
    public turnOff(): void {
        this.isFanOn = false;
        if (this.windEffects)
        {
            this.windEffects.visible = false;
        }
    }

    /**
     * 切换风扇开关状态
     */
    public toggle(): void {
        if (this.isFanOn) {
            this.turnOff();
        } else {
            this.turnOn();
        }
    }

    /**
     * 获取风扇开关状态
     * @returns 风扇是否开启
     */
    public isOn(): boolean {
        return this.isFanOn;
    }

    /**
     * 设置摇头速度
     * @param speed 速度倍率 (0.0 - 5.0)
     */
    public setSwingSpeed(speed: number): void {
        // 限制速度范围
        this.swingSpeed = Math.max(0, Math.min(5, speed));
        this.yawSpeed = this.baseYawSpeed * this.swingSpeed;
    }

    /**
     * 获取当前摇头速度
     * @returns 当前速度倍率
     */
    public getSwingSpeed(): number {
        return this.swingSpeed;
    }

    /**
     * 增加摇头速度
     * @param increment 增量
     */
    public increaseSwingSpeed(increment: number = 0.5): void {
        this.setSwingSpeed(this.swingSpeed + increment);
    }

    /**
     * 减少摇头速度
     * @param decrement 减量
     */
    public decreaseSwingSpeed(decrement: number = 0.5): void {
        this.setSwingSpeed(this.swingSpeed - decrement);
    }

    /**
     * 获取指定名称的模型
     * @param name 模型名称
     * @returns THREE.Group | undefined
     */
    public getModelByName(name: string): THREE.Group | undefined {
        return this.loadedModels.get(name);
    }

    /**
     * 获取所有加载的模型
     * @returns Map<string, THREE.Group>
     */
    public getAllModels(): Map<string, THREE.Group> {
        return this.loadedModels;
    }

    /**
     * 移动指定名称的模型到新位置
     * @param name 模型名称
     * @param position 新位置 [x, y, z]
     * @param duration 移动持续时间(毫秒)，默认为0(立即移动)
     */
    public moveModelTo(name: string, position: [number, number, number], duration: number = 0): void {
        const model = this.loadedModels.get(name);
        if (!model) {
            console.warn(`PunkahDeviceScript: 未找到名称为 "${name}" 的模型`);
            return;
        }

        if (duration <= 0) {
            // 立即移动
            model.position.set(position[0], position[1], position[2]);
        } else {
            // 使用Tween动画移动
            new TWEEN.Tween(model.position)
                .to({ x: position[0], y: position[1], z: position[2] }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
        }
    }

    /**
     * 相对移动指定名称的模型
     * @param name 模型名称
     * @param offset 移动偏移量 [x, y, z]
     * @param duration 移动持续时间(毫秒)，默认为0(立即移动)
     */
    public moveModelBy(name: string, offset: [number, number, number], duration: number = 0): void {
        const model = this.loadedModels.get(name);
        if (!model) {
            console.warn(`PunkahDeviceScript: 未找到名称为 "${name}" 的模型`);
            return;
        }

        const newPosition = [
            model.position.x + offset[0],
            model.position.y + offset[1],
            model.position.z + offset[2]
        ];

        this.moveModelTo(name, newPosition as [number, number, number], duration);
    }

    /**
     * 设置模型的旋转
     * @param name 模型名称
     * @param rotation 新旋转角度 [x, y, z] (弧度)
     * @param duration 旋转持续时间(毫秒)，默认为0(立即旋转)
     */
    public rotateModelTo(name: string, rotation: [number, number, number], duration: number = 0): void {
        const model = this.loadedModels.get(name);
        if (!model) {
            console.warn(`PunkahDeviceScript: 未找到名称为 "${name}" 的模型`);
            return;
        }

        if (duration <= 0) {
            // 立即旋转
            model.rotation.set(rotation[0], rotation[1], rotation[2]);
        } else {
            // 使用Tween动画旋转
            new TWEEN.Tween(model.rotation)
                .to({ x: rotation[0], y: rotation[1], z: rotation[2] }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
        }
    }

    /**
     * 相对旋转指定名称的模型
     * @param name 模型名称
     * @param offset 旋转偏移量 [x, y, z] (弧度)
     * @param duration 旋转持续时间(毫秒)，默认为0(立即旋转)
     */
    public rotateModelBy(name: string, offset: [number, number, number], duration: number = 0): void {
        const model = this.loadedModels.get(name);
        if (!model) {
            console.warn(`PunkahDeviceScript: 未找到名称为 "${name}" 的模型`);
            return;
        }

        const newRotation = [
            model.rotation.x + offset[0],
            model.rotation.y + offset[1],
            model.rotation.z + offset[2]
        ];

        this.rotateModelTo(name, newRotation as [number, number, number], duration);
    }

    /**
     * 设置模型的缩放
     * @param name 模型名称
     * @param scale 新缩放比例 [x, y, z]
     * @param duration 缩放持续时间(毫秒)，默认为0(立即缩放)
     */
    public scaleModelTo(name: string, scale: [number, number, number], duration: number = 0): void {
        const model = this.loadedModels.get(name);
        if (!model) {
            console.warn(`PunkahDeviceScript: 未找到名称为 "${name}" 的模型`);
            return;
        }

        if (duration <= 0) {
            // 立即缩放
            model.scale.set(scale[0], scale[1], scale[2]);
        } else {
            // 使用Tween动画缩放
            new TWEEN.Tween(model.scale)
                .to({ x: scale[0], y: scale[1], z: scale[2] }, duration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
        }
    }

    /**
     * 相对缩放指定名称的模型
     * @param name 模型名称
     * @param offset 缩放偏移量 [x, y, z]
     * @param duration 缩放持续时间(毫秒)，默认为0(立即缩放)
     */
    public scaleModelBy(name: string, offset: [number, number, number], duration: number = 0): void {
        const model = this.loadedModels.get(name);
        if (!model) {
            console.warn(`PunkahDeviceScript: 未找到名称为 "${name}" 的模型`);
            return;
        }

        const newScale = [
            model.scale.x + offset[0],
            model.scale.y + offset[1],
            model.scale.z + offset[2]
        ];

        this.scaleModelTo(name, newScale as [number, number, number], duration);
    }

    public SetDefaultMaterial():void
    {
        this.defaultMaterial.forEach((material, object3D) => {
            object3D.material = material;
        });
    }
}
