import * as THREE from 'three';
import { AlignmentController } from './AlignmentController';

/**
 * 对齐系统使用示例
 */
export class AlignmentExample {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;
    private alignmentController: AlignmentController;
    private objects: THREE.Object3D[] = [];

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // 创建对齐控制器
        this.alignmentController = new AlignmentController(scene, camera, renderer);
        this.alignmentController.start();
        
        // 创建一些测试对象
        this.createTestObjects();
    }

    /**
     * 创建测试对象
     */
    private createTestObjects(): void {
        // 创建几个立方体用于测试对齐功能
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color(Math.random(), Math.random(), Math.random()) 
            });
            const cube = new THREE.Mesh(geometry, material);
            
            // 随机位置
            cube.position.set(
                Math.random() * 10 - 5,
                Math.random() * 10 - 5,
                Math.random() * 10 - 5
            );
            
            this.scene.add(cube);
            this.objects.push(cube);
        }
    }

    /**
     * 演示对齐功能
     */
    public demonstrateAlignment(): void {
        // 1. 对齐到中心点
        const center = new THREE.Vector3(0, 0, 0);
        this.alignmentController.alignSelectedObjects(this.objects, center, 'center');
        
        // 2. 演示相对对齐（对齐第一个对象到第二个对象）
        if (this.objects.length >= 2) {
            this.alignmentController.alignToTarget(
                [this.objects[0]], 
                this.objects[1], 
                'center'
            );
        }
        
        // 3. 演示分布对齐
        this.alignmentController.distributeSelectedObjects(this.objects, 'x', 2);
        
        console.log('对齐演示完成');
    }

    /**
     * 撤销上一次操作
     */
    public undo(): void {
        const success = this.alignmentController.undoLastAlignment();
        if (success) {
            console.log('已撤销上一次对齐操作');
        } else {
            console.log('没有可撤销的操作');
        }
    }

    /**
     * 更新配置示例
     */
    public updateConfig(): void {
        // 更新对齐配置
        this.alignmentController.setAlignmentConfig({
            snapThreshold: 1.0,
            coordinateSystem: 'world',
            alignmentMode: 'min'
        });
        
        console.log('对齐配置已更新');
    }

    /**
     * 清理资源
     */
    public dispose(): void {
        this.alignmentController.destroy();
        this.objects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.objects = [];
    }
}