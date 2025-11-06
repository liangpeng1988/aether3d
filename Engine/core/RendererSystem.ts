import { EffectComposer, RenderPass, OutputPass, THREE } from './global';
import { SceneManager } from "./SceneManager";
import type {SceneData} from "../interface/SceneData.ts";

/**
 * 定义全局渲染变量
 */
export const globalRenderer: {
    renderer: THREE.WebGLRenderer | null,
    scene: THREE.Scene | null,
    sceneData: SceneData | null,
    camera: THREE.PerspectiveCamera | null,
    frame: number,
    frameId: number,
    contextLost: boolean,
    enablePostProcessing: boolean,
    composer: EffectComposer | null,
    renderPass: RenderPass | null,
    outputPass: OutputPass | null,
} = {
    renderer: null,
    scene: null,
    sceneData: null,
    camera: null,
    frame: 0,
    frameId: 0,
    contextLost: false,
    enablePostProcessing: false,
    composer: null,
    renderPass: null,
    outputPass: null
};

/**
 * 检查全局渲染器是否已完全初始化
 * @returns 如果所有必需的组件都存在则返回 true，否则返回 false
 */
export function isGlobalRendererReady(): boolean {
    return !!globalRenderer.scene && !!globalRenderer.camera && !!globalRenderer.renderer;
}
/**
 * 创建新场景
 * @param name 场景名称
 * @returns 创建的场景实例
 */
export function createScene(name: string):THREE.Scene {
    if (SceneManager.has(name))
    {
        return SceneManager.getScene(name);
    }
    const scene = new THREE.Scene();
    scene.name = name;
    const sceneData:SceneData = {
        name: name,
        scene: scene,
        camera: createCamera(name + 'Camera', window.innerWidth/window.innerHeight),
        scripts: [],
        objectScripts: new Map(),
        startedScripts: new Set(),
        objectMetadata: new Map(),
        layerMetadata: new Map()
    };
    SceneManager.addScene(name,sceneData);
    return scene;
}

/**
 * 渲染场景
 */
export function render(): void {
    if (!globalRenderer.renderer || !globalRenderer.scene || !globalRenderer.camera) return;
    if (globalRenderer.enablePostProcessing && globalRenderer.composer) {
        globalRenderer.composer.render();
    } else {
        globalRenderer.renderer.render(globalRenderer.scene, globalRenderer.camera);
    }
}

/**
 * 创建透视相机
 * @param name
 * @param aspectRatio
 */
export function createCamera(name: string, aspectRatio: number): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.name = name;
    return camera;
}

/**
 * 创建后处理效果
 */
export function createPostprocessing(): void {
    if (!globalRenderer.renderer || !globalRenderer.scene || !globalRenderer.camera) return;
    globalRenderer.composer = new EffectComposer(globalRenderer.renderer);
    globalRenderer.renderPass = new RenderPass(globalRenderer.scene, globalRenderer.camera);
}

/**
 * 设置 WebGL 上下文事件处理程序
 */
export function setupContextEvents(): void {
    if (!globalRenderer.renderer) return;
    const canvas = globalRenderer.renderer.domElement;
    canvas.addEventListener('webglcontextlost', (event: Event) => {
        event.preventDefault();
        globalRenderer.contextLost = true;
        console.warn('[WebGLRendererAdapter] WebGL context lost - 暂停渲染流程');
    }, false);
    canvas.addEventListener('webglcontextrestored', () => {
        globalRenderer.contextLost = false;
        console.info('[WebGLRendererAdapter] WebGL context restored - 重新初始化资源');
    }, false);
}
