import { THREE } from "../core/global"

export interface IScriptConstructorConfig {
     name: string;
     objectName: string;
     sceneName: string;
     script: new () => IScript;
}

/**
 * 脚本接口 (IScript)
 *
 * 定义附加到场景或场景对象上的脚本可以实现的生命周期方法。
 * 设计灵感来源于 Unity 3D 的 MonoBehaviour，提供更丰富的生命周期钩子。
 * 这使得引擎能够统一管理和调用不同的脚本逻辑。
 *
 * 为了更方便地访问渲染器中的基础数据，建议继承 ScriptBase 类而不是直接实现 IScript 接口。
 * ScriptBase 类提供了以下便捷功能：
 * - 直接访问场景、相机和渲染器对象
 * - 便捷的对象添加/移除方法
 * - 对象查找功能
 * - 相机控制方法
 *
 * 生命周期调用顺序 (典型情况):
 * 1.  Script is attached to a host (host property is set)
 * 2.  awake()           - Called when the script instance is being loaded.
 * 3.  onEnable()        - Called when the script becomes enabled and active.
 * 4.  start()           - Called before the first frame update (corresponds to Unity's Start).
 * 5.  update()          - Called once per frame.
 * 6.  lateUpdate()      - Called once per frame, after update() has finished (useful for camera logic).
 * 7.  onDisable()       - Called when the script becomes disabled or inactive.
 * 8.  destroy()         - Called when the script is being destroyed.
 *
 * Note: awake and onEnable are typically called during the scene/script attachment/setup phase,
 *       not necessarily every frame. The exact timing depends on the engine's implementation.
 */
export interface IScript {

    /**
     * 脚本名称
     */
    name?: string;

    /**
     * 脚本的唯一标识符
     */
    uuid?: string;

    /**
     * 脚本附加到的宿主对象。
     */
    host:THREE.Scene | THREE.Object3D | THREE.WebGLRenderer | THREE.Camera;

    /**
     * 当脚本实例被加载时调用。
     * 在 start 之前调用。用于初始化脚本自身，不依赖于其他对象。
     * 对应 Unity 的 Awake。
     */
    awake?(): void;

    /**
     * 当脚本变为启用和激活状态时调用。
     * 在 awake 之后，start 之前调用（如果脚本是启用的）。
     * 对应 Unity 的 OnEnable。
     */
    onEnable?(): void;

    /**
     * 脚本初始化时调用（在第一帧更新之前）。
     * 通常用于获取引用、设置初始状态等。
     * 对应 Unity 的 Start。
     */
    start?(): Promise<void> | void;

    /**
     * 每一帧更新时调用（在所有 start 调用之后）。
     * 用于实现脚本的主要逻辑，如动画、AI、输入响应等。
     * @param deltaTime 自上一帧以来经过的时间（秒）
     */
    update?(deltaTime: number): void;

    /**
     * 每一帧在 update 调用之后调用。
     * 通常用于跟随逻辑（如相机跟随），确保在所有 update 逻辑执行完毕后进行。
     * @param deltaTime 自上一帧以来经过的时间（秒）
     */
    lateUpdate?(deltaTime: number): void;

    /**
     * 固定时间步长更新。
     * 用于物理计算等需要固定时间步长的逻辑。
     * @param fixedTimeStep 固定时间步长
     */
    fixedUpdate?(fixedTimeStep: number): void;

    /**
     * 在每一帧渲染前调用。
     */
    onPreRender?(): void;

    /**
     * 在每一帧渲染后调用。
     */
    onPostRender?(): void;

    /**
     * 重置窗口时调用。
     */
    onResize():void;

    /**
     * 当脚本变为禁用或非激活状态时调用。
     * 对应 Unity 的 OnDisable。
     */
    onDisable?(): void;

    /**
     * 脚本销毁时调用。
     * 用于清理资源、移除事件监听器等。
     * 对应 Unity 的 OnDestroy。
     */
    destroy?(): void;
}