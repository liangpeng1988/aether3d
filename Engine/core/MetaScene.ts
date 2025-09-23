import * as THREE from 'three';
import type { IScript } from "../interface";

/**
 * MetaScene 类用于管理场景的元数据
 * 包括场景对象、相机、脚本等信息
 */
export class MetaScene {
    /** 场景名称 */
    public name: string;

    /** THREE.js 场景对象 */
    public scene: THREE.Scene;

    /** 摄像机对象 */
    public camera: THREE.PerspectiveCamera;

    /** 场景级别的脚本列表 */
    public scripts: IScript[];

    /** 对象级别的脚本映射，将对象与关联的脚本列表进行映射 */
    public objectScripts: Map<THREE.Object3D, IScript[]>;

    /** 已启动的脚本集合，用于跟踪哪些脚本已经被执行过 start 方法 */
    public startedScripts: Set<IScript>;

    constructor(name: string, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
        this.name = name;
        this.scene = scene;
        this.camera = camera;
        this.scripts = [];
        this.objectScripts = new Map();
        this.startedScripts = new Set();
    }
}
