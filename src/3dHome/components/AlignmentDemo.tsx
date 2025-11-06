import React, { useEffect, useRef } from 'react';
import { Aether3d } from '../../../Engine';
import { Viewport } from '../../../Engine/interface/Viewport';
import { THREE } from "../../../Engine/core/global";
import { OrbitControlsScript } from '../../../Engine';
import { AlignmentController } from '../../../Engine/alignment';

interface AlignmentDemoProps {
  renderer: Aether3d;
  onAlignmentComplete?: () => void;
}

const AlignmentDemo: React.FC<AlignmentDemoProps> = ({ renderer, onAlignmentComplete }) => {
  const alignmentControllerRef = useRef<AlignmentController | null>(null);
  const testObjectsRef = useRef<THREE.Object3D[]>([]);
  
  // 初始化对齐控制器
  useEffect(() => {
    if (!renderer) return;
    
    // 创建对齐控制器，使用Aether3d的renderer属性
    const alignmentController = new AlignmentController(
      renderer.scene, 
      renderer.camera, 
      renderer.renderer  // 使用Aether3d的WebGLRenderer实例
    );
    renderer.addScript(alignmentController);
    alignmentControllerRef.current = alignmentController;
    
    // 创建测试对象
    createTestObjects();
    
    return () => {
      // 清理测试对象
      testObjectsRef.current.forEach(obj => {
        renderer.scene.remove(obj);
      });
      testObjectsRef.current = [];
    };
  }, [renderer]);
  
  // 创建测试对象
  const createTestObjects = () => {
    if (!renderer) return;
    
    // 清除现有的测试对象
    testObjectsRef.current.forEach(obj => {
      renderer.scene.remove(obj);
    });
    testObjectsRef.current = [];
    
    // 创建几个不同颜色的立方体用于测试
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    
    for (let i = 0; i < 6; i++) {
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshBasicMaterial({ 
        color: colors[i],
        wireframe: false
      });
      const cube = new THREE.Mesh(geometry, material);
      
      // 设置随机初始位置
      cube.position.set(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      );
      
      renderer.scene.add(cube);
      testObjectsRef.current.push(cube);
    }
    
    console.log(`已创建 ${testObjectsRef.current.length} 个测试对象`);
  };
  
  // 对齐到中心点
  const alignToCenter = () => {
    if (!alignmentControllerRef.current) return;
    
    const center = new THREE.Vector3(0, 0, 0);
    alignmentControllerRef.current.alignSelectedObjects(testObjectsRef.current, center, 'center');
    
    onAlignmentComplete?.();
  };
  
  // 对齐到最小点
  const alignToMin = () => {
    if (!alignmentControllerRef.current) return;
    
    const minPoint = new THREE.Vector3(-3, -3, -3);
    alignmentControllerRef.current.alignSelectedObjects(testObjectsRef.current, minPoint, 'min');
    
    onAlignmentComplete?.();
  };
  
  // 对齐到最大点
  const alignToMax = () => {
    if (!alignmentControllerRef.current) return;
    
    const maxPoint = new THREE.Vector3(3, 3, 3);
    alignmentControllerRef.current.alignSelectedObjects(testObjectsRef.current, maxPoint, 'max');
    
    onAlignmentComplete?.();
  };
  
  // X轴分布
  const distributeX = () => {
    if (!alignmentControllerRef.current) return;
    
    alignmentControllerRef.current.distributeSelectedObjects(testObjectsRef.current, 'x', 1);
    
    onAlignmentComplete?.();
  };
  
  // Y轴分布
  const distributeY = () => {
    if (!alignmentControllerRef.current) return;
    
    alignmentControllerRef.current.distributeSelectedObjects(testObjectsRef.current, 'y', 1);
    
    onAlignmentComplete?.();
  };
  
  // Z轴分布
  const distributeZ = () => {
    if (!alignmentControllerRef.current) return;
    
    alignmentControllerRef.current.distributeSelectedObjects(testObjectsRef.current, 'z', 1);
    
    onAlignmentComplete?.();
  };
  
  // 相对对齐
  const alignRelative = () => {
    if (!alignmentControllerRef.current || testObjectsRef.current.length < 2) return;
    
    alignmentControllerRef.current.alignToTarget(
      [testObjectsRef.current[0]], 
      testObjectsRef.current[1], 
      'center'
    );
    
    onAlignmentComplete?.();
  };
  
  // 撤销操作
  const undoAlignment = () => {
    if (!alignmentControllerRef.current) return;
    
    const success = alignmentControllerRef.current.undoLastAlignment();
    if (success) {
      console.log('已撤销上一次对齐操作');
    } else {
      console.log('没有可撤销的操作');
    }
    
    onAlignmentComplete?.();
  };
  
  // 重置场景
  const resetScene = () => {
    createTestObjects();
    onAlignmentComplete?.();
  };
  
  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      zIndex: 100,
      minWidth: '250px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '15px', 
        fontSize: '16px',
        textAlign: 'center'
      }}>
        对齐系统演示
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '5px', 
          fontSize: '14px' 
        }}>
          对齐操作:
        </label>
        <button 
          onClick={alignToCenter}
          style={{
            width: '100%',
            padding: '6px',
            margin: '3px 0',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          对齐到中心
        </button>
        <button 
          onClick={alignToMin}
          style={{
            width: '100%',
            padding: '6px',
            margin: '3px 0',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          对齐到最小点
        </button>
        <button 
          onClick={alignToMax}
          style={{
            width: '100%',
            padding: '6px',
            margin: '3px 0',
            background: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          对齐到最大点
        </button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '5px', 
          fontSize: '14px' 
        }}>
          分布操作:
        </label>
        <button 
          onClick={distributeX}
          style={{
            width: '100%',
            padding: '6px',
            margin: '3px 0',
            background: '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          X轴分布
        </button>
        <button 
          onClick={distributeY}
          style={{
            width: '100%',
            padding: '6px',
            margin: '3px 0',
            background: '#E91E63',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Y轴分布
        </button>
        <button 
          onClick={distributeZ}
          style={{
            width: '100%',
            padding: '6px',
            margin: '3px 0',
            background: '#673AB7',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Z轴分布
        </button>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '5px', 
          fontSize: '14px' 
        }}>
          相对对齐:
        </label>
        <button 
          onClick={alignRelative}
          style={{
            width: '100%',
            padding: '6px',
            margin: '3px 0',
            background: '#00BCD4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          相对对齐
        </button>
      </div>
      
      <div>
        <label style={{ 
          display: 'block', 
          marginBottom: '5px', 
          fontSize: '14px' 
        }}>
          其他操作:
        </label>
        <button 
          onClick={undoAlignment}
          style={{
            width: '100%',
            padding: '6px',
            margin: '3px 0',
            background: '#FF5722',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          撤销操作
        </button>
        <button 
          onClick={resetScene}
          style={{
            width: '100%',
            padding: '6px',
            margin: '3px 0',
            background: '#607D8B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          重置场景
        </button>
      </div>
    </div>
  );
};

export default AlignmentDemo;