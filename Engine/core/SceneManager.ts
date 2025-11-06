import { THREE } from './global';
import {globalRenderer} from "./RendererSystem.ts";
import type {SceneData} from "../interface/SceneData.ts";

function createCamera(name: string, aspect: number): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.name = name;
    return camera;
}

export class SceneManager {
    private static scenes: Map<string, SceneData> = new Map();
    private static activeSceneName: string = '';

    static addScene(name: string, sceneData:SceneData): void {
        if (this.scenes.has(sceneData.name)) {
            throw new Error(`Scene '${sceneData.name}' already exists`);
        }
        this.scenes.set(sceneData.name, sceneData);
    }

    static getSceneData(name: string): SceneData {
        if (!this.has(name)) {
            // 如果场景不存在，创建一个新的场景
            const scene = new THREE.Scene();
            scene.name = name;
            const sceneData: SceneData = {
                name: name,
                scene: scene,
                camera: createCamera(name + 'Camera', window.innerWidth / window.innerHeight),
                scripts: [],
                objectScripts: new Map(),
                startedScripts: new Set(),
                objectMetadata: new Map(),
                layerMetadata: new Map()
            };
            this.addScene(name, sceneData);
            return sceneData;
        }
        return this.scenes.get(name)!;
    }

    static getScene(name: string): THREE.Scene {
        if (!this.has(name)) {
            throw new Error(`Scene '${name}' not found`);
        }
        return this.scenes.get(name)!.scene;
    }

    static has(name: string): boolean {
        return this.scenes.has(name);
    }

    static setActive(name: string): SceneData {
        if (!this.has(name)) {
            throw new Error(`Scene '${name}' not found`);
        }
        this.activeSceneName = name;
        globalRenderer.sceneData = this.scenes.get(name)!;
        globalRenderer.scene = globalRenderer.sceneData.scene;
        globalRenderer.camera =globalRenderer.sceneData.camera;
        return globalRenderer.sceneData;
    }

    static setActiveScene(index: number): SceneData {
        if (index < 0 || index >= this.scenes.size) {
            throw new Error(`Invalid scene index: ${index}`);
        }
        this.activeSceneName = Array.from(this.scenes.keys())[index];
        globalRenderer.sceneData = Array.from(this.scenes.values())[index]!;
        globalRenderer.scene = globalRenderer.sceneData.scene;
        globalRenderer.camera =globalRenderer.sceneData.camera;
        return globalRenderer.sceneData;
    }

    static removeScene(name: string): void {
        if (!this.has(name)) {
            throw new Error(`Scene '${name}' not found`);
        }
        this.scenes.delete(name);
    }

    static destroy(): void {
        this.scenes.clear();
        this.activeSceneName = '';
    }
}
