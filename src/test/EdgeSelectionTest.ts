import { Aether3d } from '../../Engine';
import { EdgeSelectionScript } from '../../Engine/controllers/EdgeSelectionScript';
import * as THREE from 'three';

/**
 * 边线选择功能测试
 */
export class EdgeSelectionTest {
    private engine: Aether3d;
    private edgeSelectionScript: EdgeSelectionScript;

    constructor(engine: Aether3d) {
        this.engine = engine;
        this.edgeSelectionScript = new EdgeSelectionScript({
            edgeColor: 0xffff00,
            edgeWidth: 2,
            showHiddenEdges: true,
            hiddenEdgeColor: 0x888888
        });
        this.engine.addScript(this.edgeSelectionScript);
    }

    /**
     * 测试不同类型的几何体
     */
    public testDifferentGeometries(): void {
        console.log('[EdgeSelectionTest] 开始测试不同类型的几何体');

        // 创建测试场景
        const scene = this.engine.scene;

        // 1. 测试立方体几何体
        const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
        boxMesh.position.set(-20, 0, 0);
        boxMesh.name = 'TestBox';
        scene.add(boxMesh);

        // 2. 测试球体几何体
        const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphereMesh.position.set(0, 0, 0);
        sphereMesh.name = 'TestSphere';
        scene.add(sphereMesh);

        // 3. 测试平面几何体
        const planeGeometry = new THREE.PlaneGeometry(10, 10);
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide });
        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        planeMesh.position.set(20, 0, 0);
        planeMesh.name = 'TestPlane';
        scene.add(planeMesh);

        // 4. 测试圆环几何体
        const torusGeometry = new THREE.TorusGeometry(5, 2, 16, 100);
        const torusMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
        torusMesh.position.set(-20, 20, 0);
        torusMesh.name = 'TestTorus';
        scene.add(torusMesh);

        // 5. 测试复杂几何体
        const complexGeometry = new THREE.ConeGeometry(5, 10, 32);
        const complexMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        const complexMesh = new THREE.Mesh(complexGeometry, complexMaterial);
        complexMesh.position.set(0, 20, 0);
        complexMesh.name = 'TestComplex';
        scene.add(complexMesh);

        // 测试边线选择
        setTimeout(() => {
            console.log('[EdgeSelectionTest] 测试边线选择功能');
            this.edgeSelectionScript.setSelectedObjects([
                boxMesh,
                sphereMesh,
                planeMesh,
                torusMesh,
                complexMesh
            ]);
            
            // 验证边线是否正确创建
            this.verifyEdgeCreation();
        }, 1000);
    }

    /**
     * 验证边线是否正确创建
     */
    private verifyEdgeCreation(): void {
        const selectedObjects = this.edgeSelectionScript.getSelectedObjects();
        console.log(`[EdgeSelectionTest] 选中的对象数量: ${selectedObjects.length}`);
        
        selectedObjects.forEach((obj, index) => {
            console.log(`[EdgeSelectionTest] 对象 ${index + 1}: ${obj.name}`);
        });
        
        console.log('[EdgeSelectionTest] 测试完成');
    }

    /**
     * 清理测试资源
     */
    public cleanup(): void {
        this.edgeSelectionScript.clearSelection();
        this.engine.removeScript(this.edgeSelectionScript);
    }
}