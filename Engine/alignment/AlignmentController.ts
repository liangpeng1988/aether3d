import * as THREE from 'three';
import { ObjectAligner } from './ObjectAligner';
import { IScript } from '../interface';

/**
 * 对齐控制器 - 用于在3D场景中控制对象对齐的脚本
 */
export class AlignmentController extends ObjectAligner implements IScript {
    name: string = 'AlignmentController';
    uuid: string;
    host: THREE.Scene | THREE.Object3D | THREE.WebGLRenderer | THREE.Camera;
    enabled: boolean = true;

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        super(scene, camera, renderer);
        this.host = scene;
        this.uuid = THREE.MathUtils.generateUUID();
    }

    // IScript 接口实现
    awake(): void {
        // 初始化对齐控制器
        console.log('AlignmentController awake');
    }

    onEnable(): void {
        console.log('AlignmentController enabled');
    }

    start(): void {
        // 初始化对齐控制器
        console.log('AlignmentController started');
    }

    update(deltaTime: number): void {
        // 更新逻辑（如果需要）
    }

    lateUpdate(deltaTime: number): void {
        // 晚更新逻辑（如果需要）
    }

    fixedUpdate(fixedTimeStep: number): void {
        // 固定时间步长更新逻辑（如果需要）
    }

    onPreRender(): void {
        // 渲染前逻辑（如果需要）
    }

    onPostRender(): void {
        // 渲染后逻辑（如果需要）
    }

    onResize(): void {
        // 窗口大小调整逻辑（如果需要）
    }

    onDisable(): void {
        console.log('AlignmentController disabled');
    }

    destroy(): void {
        // 清理资源
        console.log('AlignmentController destroyed');
    }

    /**
     * 对齐选中的对象到指定位置
     */
    alignSelectedObjects(objects: THREE.Object3D[], targetPosition: THREE.Vector3, alignmentType: 'min' | 'center' | 'max' = 'center'): void {
        if (!this.enabled) return;
        
        this.alignObjects(objects, targetPosition, alignmentType, this.coordinateSystem);
    }

    /**
     * 对齐对象到目标对象
     */
    alignToTarget(sourceObjects: THREE.Object3D[], targetObject: THREE.Object3D, alignmentType: 'min' | 'center' | 'max' = 'center'): void {
        if (!this.enabled) return;
        
        this.alignRelative(sourceObjects, targetObject, alignmentType, this.coordinateSystem);
    }

    /**
     * 分布选中的对象
     */
    distributeSelectedObjects(objects: THREE.Object3D[], direction: 'x' | 'y' | 'z' = 'x', spacing: number = 0): void {
        if (!this.enabled) return;
        
        this.distributeObjects(objects, direction, spacing);
    }

    /**
     * 撤销上一次对齐操作
     */
    undoLastAlignment(): boolean {
        if (this.alignmentHistory.length === 0) {
            return false;
        }

        const lastEntry = this.alignmentHistory.pop();
        
        // 恢复每个对象到原来的位置
        lastEntry.objects.forEach((entry: any) => {
            entry.object.position.copy(entry.originalPosition);
            entry.object.updateMatrixWorld(true);
        });

        return true;
    }

    /**
     * 设置对齐配置
     */
    setAlignmentConfig(config: {
        snapThreshold?: number;
        coordinateSystem?: 'world' | 'local';
        alignmentMode?: 'min' | 'center' | 'max';
    }): void {
        if (config.snapThreshold !== undefined) {
            this.snapThreshold = config.snapThreshold;
        }
        
        if (config.coordinateSystem !== undefined) {
            this.coordinateSystem = config.coordinateSystem;
        }
        
        if (config.alignmentMode !== undefined) {
            this.alignmentMode = config.alignmentMode;
        }
    }
}