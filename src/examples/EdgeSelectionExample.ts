import { Aether3d } from '../../Engine';
import { EdgeSelectionScript } from '../../Engine/controllers/EdgeSelectionScript';
import * as THREE from 'three';

/**
 * EdgeSelectionScript使用示例
 * 演示如何使用改进后的边线选择功能
 */
export class EdgeSelectionExample {
    private engine: Aether3d;
    private edgeSelectionScript: EdgeSelectionScript;

    constructor(engine: Aether3d) {
        this.engine = engine;
        
        // 创建边线选择脚本实例
        this.edgeSelectionScript = new EdgeSelectionScript({
            edgeColor: 0xffff00,     // 黄色边线
            edgeWidth: 2,            // 边线宽度
            showHiddenEdges: true,   // 显示隐藏边线
            hiddenEdgeColor: 0x888888 // 隐藏边线颜色
        });
        
        // 将脚本添加到引擎中
        this.engine.addScript(this.edgeSelectionScript);
    }

    /**
     * 创建测试场景
     */
    public createTestScene(): THREE.Object3D[] {
        const scene = this.engine.scene;
        const objects: THREE.Object3D[] = [];

        // 创建不同类型的几何体用于测试
        const geometries = [
            { geometry: new THREE.BoxGeometry(10, 10, 10), name: 'Box', color: 0xff0000, position: [-20, 0, 0] },
            { geometry: new THREE.SphereGeometry(5, 32, 32), name: 'Sphere', color: 0x00ff00, position: [0, 0, 0] },
            { geometry: new THREE.PlaneGeometry(10, 10), name: 'Plane', color: 0x0000ff, position: [20, 0, 0] },
            { geometry: new THREE.TorusGeometry(5, 2, 16, 100), name: 'Torus', color: 0xffff00, position: [-20, 20, 0] },
            { geometry: new THREE.ConeGeometry(5, 10, 32), name: 'Cone', color: 0xff00ff, position: [0, 20, 0] }
        ];

        geometries.forEach((geomData, index) => {
            const material = new THREE.MeshBasicMaterial({ 
                color: geomData.color,
                wireframe: false
            });
            
            const mesh = new THREE.Mesh(geomData.geometry, material);
            mesh.position.set(geomData.position[0], geomData.position[1], geomData.position[2]);
            mesh.name = `Test${geomData.name}`;
            
            scene.add(mesh);
            objects.push(mesh);
        });

        return objects;
    }

    /**
     * 演示边线选择功能
     */
    public demonstrateEdgeSelection(): void {
        // 创建测试场景
        const objects = this.createTestScene();
        
        // 延迟执行以确保场景完全加载
        setTimeout(() => {
            console.log('[EdgeSelectionExample] 开始演示边线选择功能');
            
            // 选择所有对象并显示它们的边线
            this.edgeSelectionScript.setSelectedObjects(objects);
            
            console.log(`[EdgeSelectionExample] 已为${objects.length}个对象设置边线显示`);
            
            // 3秒后清除选择
            setTimeout(() => {
                console.log('[EdgeSelectionExample] 清除边线选择');
                this.edgeSelectionScript.clearSelection();
            }, 3000);
            
            // 5秒后重新选择前两个对象
            setTimeout(() => {
                console.log('[EdgeSelectionExample] 重新选择前两个对象');
                this.edgeSelectionScript.setSelectedObjects([objects[0], objects[1]]);
            }, 5000);
        }, 1000);
    }

    /**
     * 更新边线配置
     */
    public updateEdgeConfiguration(): void {
        // 更新边线配置
        this.edgeSelectionScript.updateConfig({
            edgeColor: 0xff0000,    // 红色边线
            edgeWidth: 3,           // 更宽的边线
            showHiddenEdges: false  // 不显示隐藏边线
        });
        
        console.log('[EdgeSelectionExample] 边线配置已更新');
    }

    /**
     * 清理资源
     */
    public cleanup(): void {
        this.edgeSelectionScript.clearSelection();
        this.engine.removeScript(this.edgeSelectionScript);
        console.log('[EdgeSelectionExample] 资源已清理');
    }
}