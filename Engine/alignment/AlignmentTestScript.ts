import * as THREE from 'three';
import { AlignmentController } from './AlignmentController';
import { IScript } from '../interface';

/**
 * 对齐系统测试脚本
 * 用于验证对齐系统的功能
 */
export class AlignmentTestScript implements IScript {
    name: string = 'AlignmentTestScript';
    uuid: string = THREE.MathUtils.generateUUID();
    host: THREE.Scene | THREE.Object3D | THREE.WebGLRenderer | THREE.Camera;
    enabled: boolean = true;
    
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;
    private alignmentController: AlignmentController;
    private testObjects: THREE.Object3D[] = [];

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.host = scene;
        
        // 创建对齐控制器
        this.alignmentController = new AlignmentController(scene, camera, renderer);
    }

    awake(): void {
        console.log('AlignmentTestScript: awake');
    }

    onEnable(): void {
        console.log('AlignmentTestScript: enabled');
    }

    async start(): Promise<void> {
        console.log('AlignmentTestScript: started');
        
        // 创建测试对象
        this.createTestObjects();
        
        // 运行测试
        this.runTests();
    }

    update(deltaTime: number): void {
        // 测试脚本不需要每帧更新
    }

    lateUpdate(deltaTime: number): void {
        // 测试脚本不需要晚更新
    }

    fixedUpdate(fixedTimeStep: number): void {
        // 测试脚本不需要固定更新
    }

    onPreRender(): void {
        // 测试脚本不需要预渲染处理
    }

    onPostRender(): void {
        // 测试脚本不需要后渲染处理
    }

    onResize(): void {
        // 测试脚本不需要窗口大小调整处理
    }

    onDisable(): void {
        console.log('AlignmentTestScript: disabled');
    }

    destroy(): void {
        console.log('AlignmentTestScript: destroyed');
        // 清理测试对象
        this.testObjects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.testObjects = [];
    }

    /**
     * 创建测试对象
     */
    private createTestObjects(): void {
        console.log('创建测试对象...');
        
        // 创建几个不同颜色的立方体用于测试
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
        
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: colors[i] });
            const cube = new THREE.Mesh(geometry, material);
            
            // 设置初始位置
            cube.position.set(i * 2 - 4, 0, 0);
            
            this.scene.add(cube);
            this.testObjects.push(cube);
        }
        
        console.log(`已创建 ${this.testObjects.length} 个测试对象`);
    }

    /**
     * 运行对齐测试
     */
    private runTests(): void {
        console.log('开始运行对齐测试...');
        
        // 测试1: 对齐到中心点
        console.log('测试1: 对齐到中心点');
        const center = new THREE.Vector3(0, 2, 0);
        this.alignmentController.alignSelectedObjects(this.testObjects, center, 'center');
        
        // 等待一段时间再进行下一个测试
        setTimeout(() => {
            // 测试2: 水平分布
            console.log('测试2: 水平分布');
            this.alignmentController.distributeSelectedObjects(this.testObjects, 'x', 1.5);
        }, 1000);
        
        setTimeout(() => {
            // 测试3: 相对对齐
            console.log('测试3: 相对对齐');
            if (this.testObjects.length >= 2) {
                this.alignmentController.alignToTarget(
                    [this.testObjects[0]], 
                    this.testObjects[1], 
                    'center'
                );
            }
        }, 2000);
        
        setTimeout(() => {
            // 测试4: 撤销操作
            console.log('测试4: 撤销操作');
            this.alignmentController.undoLastAlignment();
        }, 3000);
        
        console.log('对齐测试已完成设置，请查看控制台输出和场景变化');
    }
}