import React, { useEffect, useRef } from 'react';
import { THREE } from '../../../Engine/core/global';
import ModelCenterCalculator from './ModelCenterCalculator';

/**
 * 模型中心点计算使用示例组件
 */
export const ModelCenterExample: React.FC = () => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 创建场景
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(800, 600);
    rendererRef.current = renderer;

    // 创建测试对象
    createTestObjects(scene);

    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  const createTestObjects = (scene: THREE.Scene) => {
    // 创建一个不规则的组合对象用于测试
    const group = new THREE.Group();
    group.name = 'TestModel';

    // 添加多个几何体形成复杂模型
    const geometry1 = new THREE.BoxGeometry(2, 3, 1);
    const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.position.set(0, 1.5, 0);
    group.add(mesh1);

    const geometry2 = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
    const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.position.set(1, 2, 0);
    group.add(mesh2);

    const geometry3 = new THREE.SphereGeometry(0.8, 16, 16);
    const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const mesh3 = new THREE.Mesh(geometry3, material3);
    mesh3.position.set(-1, 3, 0.5);
    group.add(mesh3);

    // 设置组的位置
    group.position.set(2, 1, 1);
    scene.add(group);

    // 使用计算器分析模型
    console.log('🔍 开始分析模型中心点...');
    const centerInfo = ModelCenterCalculator.calculateModelCenter(group);

    // 添加可视化辅助对象
    addVisualizationHelpers(scene, centerInfo);

    // 演示轴心点设置功能
    demonstratePivotSettings(scene, group);
  };

  const addVisualizationHelpers = (scene: THREE.Scene, centerInfo: any) => {
    // 添加中心点标记
    const centerMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    centerMarker.position.copy(centerInfo.center);
    scene.add(centerMarker);

    // 添加底部中心点标记
    const bottomMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff00ff })
    );
    bottomMarker.position.copy(centerInfo.bottomCenter);
    scene.add(bottomMarker);

    // 添加包围盒可视化
    const boxHelper = new THREE.Box3Helper(centerInfo.boundingBox, 0x00ffff);
    scene.add(boxHelper);

    console.log('📊 中心点信息:', {
      center: centerInfo.center,
      size: centerInfo.size,
      bottomCenter: centerInfo.bottomCenter,
      topCenter: centerInfo.topCenter
    });
  };

  const demonstratePivotSettings = (scene: THREE.Scene, originalGroup: THREE.Group) => {
    // 创建副本用于演示不同的轴心点设置
    const group1 = originalGroup.clone();
    group1.position.set(-3, 0, 0);
    scene.add(group1);

    const group2 = originalGroup.clone();
    group2.position.set(3, 0, 0);
    scene.add(group2);

    // 设置不同的轴心点
    setTimeout(() => {
      console.log('🎯 设置轴心点到底部中心...');
      ModelCenterCalculator.setPivotToBottomCenter(group1);
      
      console.log('🎯 设置轴心点到几何中心...');
      ModelCenterCalculator.setPivotToGeometryCenter(group2);
    }, 1000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>📐 模型中心点计算器演示</h3>
      <div style={{ marginBottom: '20px' }}>
        <p><strong>功能说明：</strong></p>
        <ul>
          <li>🟡 黄色球：几何中心点</li>
          <li>🟣 紫色球：底部中心点（轴心点）</li>
          <li>🔵 青色框：包围盒</li>
        </ul>
      </div>
      
      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px'
        }}
      />
      
      <div style={{ marginTop: '20px' }}>
        <h4>📋 使用方法：</h4>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px',
          fontSize: '14px',
          overflow: 'auto'
        }}>
{`// 1. 导入计算器
import ModelCenterCalculator from './ModelCenterCalculator';

// 2. 计算模型中心点
const centerInfo = ModelCenterCalculator.calculateModelCenter(object);

// 3. 使用计算结果
console.log('中心点:', centerInfo.center);
console.log('尺寸:', centerInfo.size);
console.log('轴心点:', centerInfo.pivot);

// 4. 设置轴心点
ModelCenterCalculator.setPivotToBottomCenter(object);
ModelCenterCalculator.setPivotToGeometryCenter(object);

// 5. 计算对象间距离
const distance = ModelCenterCalculator.calculateDistance(obj1, obj2);`}
        </pre>
      </div>
    </div>
  );
};

export default ModelCenterExample;