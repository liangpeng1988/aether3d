import {THREE} from "../core/global.ts";
import type {IScript} from "./IScript.ts";

/**
 * 场景数据接口
 * 定义了场景相关的所有数据结构
 */
export interface SceneData {
    /** 场景名称 */
    name: string;

    /** THREE.js 场景对象 */
    scene: THREE.Scene;

    /** 摄像机对象 */
    camera: THREE.PerspectiveCamera;

    /** 场景级别的脚本列表 */
    scripts: IScript[];

    /** 对象级别的脚本映射，将对象与关联的脚本列表进行映射 */
    objectScripts: Map<THREE.Object3D, IScript[]>;

    /** 已启动的脚本集合，用于跟踪哪些脚本已经被执行过 start 方法 */
    startedScripts: Set<IScript>;
}
