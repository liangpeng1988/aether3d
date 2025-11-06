import type { IScript } from "../interface";
import {THREE} from "../core/global.ts";


// Aether3D 引擎事件映射
export interface Aether3dEvents {
    // 渲染事件
    'render:start': { timestamp: number };
    'render:stop': { timestamp: number };
    'render:frame': { deltaTime: number; timestamp: number };

    // 脚本事件
    'script:added': { script: IScript };
    'script:removed': { script: IScript };

    // 场景事件
    'scene:resize': { width: number; height: number };

    // 后处理事件
    'postprocessing:enabled': Record<string, never>; // 空对象的正确类型
    'postprocessing:disabled': Record<string, never>; // 空对象的正确类型

    // 性能事件
    'performance:fps': { fps: number };
    'performance:drop': { currentFps: number; previousFps: number };

    // 鼠标交互事件
    'mouse:objectSelected': { object: THREE.Object3D | null };
    'mouse:objectHovered': { object: THREE.Object3D | null };
    'mouse:objectDeselected': { object: THREE.Object3D | null };
}