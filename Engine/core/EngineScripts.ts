import type {IScript} from "../interface";
import {THREE} from "./global";
import {SceneManager} from "./SceneManager";

/**
 * 为场景或场景中的对象添加脚本
 * @param sceneName 场景名称
 * @param script 当scriptOrObject是对象时，这是要添加的脚本
 */
export function addScript(sceneName: string, script: IScript): void;

/**
 * 为场景或场景中的对象添加脚本
 * @param sceneName 场景名称
 * @param object 脚本对象
 * @param script 脚本
 */
export function addScript(sceneName: string, object: THREE.Object3D, script: IScript): void;
export function addScript(sceneName: string, scriptOrObject: IScript | THREE.Object3D, script?: IScript): void {
    if (!SceneManager.has(sceneName)) {
        throw new Error(`Scene '${sceneName}' not found`);
    }

    const sceneData = SceneManager.getSceneData(sceneName);

    // 如果第二个参数是 THREE.Object3D，则为对象添加脚本
    if (scriptOrObject instanceof THREE.Object3D) {
        if (!script) {
            throw new Error('Script parameter is required when adding script to an object');
        }

        if (!sceneData.objectScripts.has(scriptOrObject)) {
            sceneData.objectScripts.set(scriptOrObject, []);
        }
        sceneData.objectScripts.get(scriptOrObject)!.push(script);
    }
    // 否则为场景添加脚本
    else {
        sceneData.scripts.push(scriptOrObject as IScript);
    }
}

/**
 * 移除场景或场景中的对象脚本
 * @param sceneName 场景名称
 * @param script 当scriptOrObject是对象时，这是要移除的脚本
 */
export function removeScript(sceneName: string, script: IScript): void;

/**
 * 移除场景或场景中的对象脚本
 * @param sceneName 场景名称
 * @param object 脚本对象
 * @param script 脚本
 */
export function removeScript(sceneName: string, object: THREE.Object3D, script: IScript): void;
export function removeScript(sceneName: string, scriptOrObject: IScript | THREE.Object3D, script?: IScript): void {
    if (!SceneManager.has(sceneName)) {
        throw new Error(`Scene '${sceneName}' not found`);
    }
    const sceneData = SceneManager.getSceneData(sceneName);

    // 如果第二个参数是 THREE.Object3D，则从对象中移除脚本
    if (scriptOrObject instanceof THREE.Object3D) {
        if (!script) {
            throw new Error('Script parameter is required when removing script from an object');
        }

        // 检查对象是否有脚本
        if (!sceneData.objectScripts.has(scriptOrObject)) {
            throw new Error(`Object does not have any scripts`);
        }

        const scripts = sceneData.objectScripts.get(scriptOrObject)!;
        const scriptIndex = scripts.indexOf(script);
        
        if (scriptIndex === -1) {
            throw new Error(`Script not found on object`);
        }

        // 调用脚本的 destroy 方法进行清理
        if (typeof script.destroy === 'function') {
            try {
                script.destroy();
            } catch (error) {
                console.warn('Error during script destroy:', error);
            }
        }

        // 从数组中移除脚本
        scripts.splice(scriptIndex, 1);

        // 如果对象没有更多脚本，删除映射
        if (scripts.length === 0) {
            sceneData.objectScripts.delete(scriptOrObject);
        }
    }
    // 否则从场景中移除脚本
    else {
        const scriptIndex = sceneData.scripts.indexOf(scriptOrObject as IScript);
        
        if (scriptIndex === -1) {
            throw new Error(`Script not found in scene`);
        }

        const script = sceneData.scripts[scriptIndex];
        
        // 调用脚本的 destroy 方法进行清理
        if (typeof script.destroy === 'function') {
            try {
                script.destroy();
            } catch (error) {
                console.warn('Error during script destroy:', error);
            }
        }

        // 从数组中移除脚本
        sceneData.scripts.splice(scriptIndex, 1);
    }
}
