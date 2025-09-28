import { THREE } from "./global";
import type { IScript } from "../interface";
import type { Aether3d } from "./Aether3d";
import type { PostProcessingEffectComposer } from "./PostProcessingEffectComposer";
import { v4 as uuidv4 } from "uuid";


/**
 * ScriptBase 类为所有脚本提供基础实现
 * 使脚本能够方便地访问渲染器中的基础数据
 */
export class ScriptBase implements IScript {
    /**
     * 脚本名称
     */
    public name?: string;

    /**
     * 脚本的唯一标识符
     */
    private _uuid: string;

    /**
     * 脚本附加到的宿主对象
     */
    public host: THREE.Scene | THREE.Object3D | THREE.WebGLRenderer | THREE.Camera = null!;

    /**
     * 渲染器实例的引用
     * 通过这个引用，脚本可以访问场景、相机、渲染器等核心对象
     */
    protected renderer: Aether3d | null = null;

    /**
     * 场景对象的便捷访问
     */
    protected get scene(): THREE.Scene {
        if (this.renderer) {
            return this.renderer.scene;
        }
        throw new Error('Renderer not available');
    }

    /**
     * 构造函数 - 初始化UUID
     */
    constructor() {
        this._uuid = uuidv4();
    }

    /**
     * 获取脚本的唯一标识符
     */
    public get uuid(): string {
        return this._uuid;
    }
    
    /**
     * 相机对象的便捷访问
     */
    protected get camera(): THREE.PerspectiveCamera {
        if (this.renderer) {
            return this.renderer.camera;
        }
        throw new Error('Renderer not available');
    }

    /**
     * 渲染器对象的便捷访问
     */
    protected get webGLRenderer(): THREE.WebGLRenderer {
        if (this.renderer) {
            return this.renderer.renderer;
        }
        throw new Error('Renderer not available');
    }

    /**
     * 后处理Composer的便捷访问
     */
    protected get postProcessingComposer(): PostProcessingEffectComposer | null {
        if (this.renderer) {
            return this.renderer.getPostProcessingComposer();
        }
        return null;
    }

    /**
     * 检查对象是否可选择
     * @param object 要检查的对象
     * @returns 对象是否可选择
     */
    protected isObjectSelectable(object: THREE.Object3D): boolean {
        // 默认情况下，所有对象都是可选择的
        // 子类可以重写此方法以实现更复杂的选择逻辑
        console.log(object.name)
        return true;
    }

    /**
     * 设置渲染器引用
     * @param renderer 渲染器实例
     */
    public setRenderer(renderer: Aether3d): void {
        this.renderer = renderer;
    }

    /**
     * 获取渲染器引用
     * @returns 渲染器实例
     */
    public engine(): Aether3d | null {
        return this.renderer;
    }

    /**
     * 添加脚本
     * @param script
     */
    public addScript(script: IScript): void{
        if (this.renderer) {
            // UUID 已在构造函数中生成，无需重新生成
            this.renderer.addScript(script);
        }
    }

    /**
     * 移除脚本
     * @param script
     */
    public removeScript(script: IScript): void {
        if (this.renderer) {
            this.renderer.removeScript(script);
        }
    }

    /**
     * 当脚本实例被加载时调用
     * 在 initialize 之前调用。用于初始化脚本自身，不依赖于其他对象
     * 对应 Unity 的 Awake
     */
    public awake?(): void;

    /**
     * 当脚本变为启用和激活状态时调用
     * 在 awake 之后，initialize 之前调用（如果脚本是启用的）
     * 对应 Unity 的 OnEnable
     */
    public onEnable?(): void;

    /**
     * 脚本初始化时调用（在第一帧更新之前）
     * 通常用于获取引用、设置初始状态等
     * 对应 Unity 的 Start
     */
    public start?(): Promise<void> | void;

    /**
     * 每一帧更新时调用（在所有 start 调用之后）
     * 用于实现脚本的主要逻辑，如动画、AI、输入响应等
     * @param deltaTime 自上一帧以来经过的时间（秒）
     */
    public update?(deltaTime: number): void;

    /**
     * 每一帧在 update 调用之后调用
     * 通常用于跟随逻辑（如相机跟随），确保在所有 update 逻辑执行完毕后进行
     * @param deltaTime 自上一帧以来经过的时间（秒）
     */
    public lateUpdate?(deltaTime: number): void;

    /**
     * 固定时间步长更新
     * 用于物理计算等需要固定时间步长的逻辑
     * @param fixedTimeStep 固定时间步长
     */
    public fixedUpdate?(fixedTimeStep: number): void;

    /**
     * 在每一帧渲染前调用
     */
    public onPreRender?(): void;

    /**
     * 在每一帧渲染后调用
     */
    public onPostRender?(): void;

    /**
     * 重置窗口时调用
     */
    public onResize(): void {
        // 默认实现为空
    }

    /**
     * 当脚本变为禁用或非激活状态时调用
     * 对应 Unity 的 OnDisable
     */
    public onDisable?(): void;

    /**
     * 脚本销毁时调用
     * 用于清理资源、移除事件监听器等
     * 对应 Unity 的 OnDestroy
     */
    public destroy?(): void;

    /**
     * 向场景中添加对象
     * @param object 要添加的对象
     */
    protected addObject(object: THREE.Object3D): void {
        this.scene.add(object);
    }

    /**
     * 从场景中移除对象
     * @param object 要移除的对象
     */
    protected removeObject(object: THREE.Object3D): void {
        this.scene.remove(object);
    }

    /**
     * 获取场景中的所有对象
     * @returns 场景中的对象数组
     */
    protected getSceneObjects(): THREE.Object3D[] {
        return this.scene.children;
    }

    /**
     * 查找场景中的对象
     * @param name 对象名称
     * @returns 找到的对象或undefined
     */
    protected findObjectByName(name: string): THREE.Object3D | undefined {
        return this.scene.getObjectByName(name);
    }

    /**
     * 设置相机位置
     * @param x X坐标
     * @param y Y坐标
     * @param z Z坐标
     */
    protected setCameraPosition(x: number, y: number, z: number): void {
        this.camera.position.set(x, y, z);
    }

    /**
     * 设置相机看向目标
     * @param x X坐标
     * @param y Y坐标
     * @param z Z坐标
     */
    protected lookAt(x: number, y: number, z: number): void {
        this.camera.lookAt(x, y, z);
    }

    /**
     * 添加后处理通道
     * @param pass 要添加的后处理通道
     * @param beforeOutput 是否在输出通道之前插入
     */
    protected addPostProcessingPass(pass: any, beforeOutput: boolean = true): void {
        if (this.renderer) {
            this.renderer.addPostProcessingPass(pass, beforeOutput);
        } else {
            console.warn('[ScriptBase] Renderer not available for adding post-processing pass');
        }
    }

    /**
     * 移除后处理通道
     * @param pass 要移除的后处理通道
     */
    protected removePostProcessingPass(pass: any): void {
        if (this.renderer) {
            this.renderer.removePostProcessingPass(pass);
        } else {
            console.warn('[ScriptBase] Renderer not available for removing post-processing pass');
        }
    }
}
