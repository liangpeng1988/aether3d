import React, { useEffect, useRef } from 'react';
import { Aether3d } from '../../../Engine';
import { Viewport } from '../../../Engine/interface/Viewport';
import {THREE} from "../../../Engine/core/global";
import { OrbitControlsScript } from '../../../Engine';
import Canvas3D from './Canvas3D';
import CADLineDrawingControl from './CADLineDrawingControl';

const CADLineDrawingDemo: React.FC = () => {
  const rendererRef = useRef<Aether3d | null>(null);

  // 场景准备就绪的回调函数
  const handleSceneReady = (renderer: Aether3d) => {
    rendererRef.current = renderer;
    
    // 添加一个简单的平面作为绘制背景
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.name = 'DrawingPlane';
    renderer.scene.add(plane);
    
    // 添加坐标轴辅助线
    const axesHelper = new THREE.AxesHelper(5);
    renderer.scene.add(axesHelper);
    
    addMunichUniversityElements(renderer);
    
    console.log('[CADLineDrawingDemo] 场景准备就绪');
  };

  const addMunichUniversityElements = (renderer: Aether3d) => {
    // 创建一个代表主楼的简单几何体
    const mainBuildingGeometry = new THREE.BoxGeometry(8, 3, 4);
    const mainBuildingMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x8B4513, // 棕色
      wireframe: true
    });
    const mainBuilding = new THREE.Mesh(mainBuildingGeometry, mainBuildingMaterial);
    mainBuilding.position.set(5, 1.5, 0);
    mainBuilding.name = 'MainBuilding';
    renderer.scene.add(mainBuilding);
    
    // 添加塔楼
    const towerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 16);
    const towerMaterial = new THREE.MeshBasicMaterial({ color: 0xA9A9A9 }); // 灰色
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.set(5, 4, 0);
    tower.name = 'Tower';
    renderer.scene.add(tower);
    
    // 添加一些树木（简化表示）
    for (let i = 0; i < 5; i++) {
      const treeTrunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
      const treeTrunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
      const treeTrunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
      treeTrunk.position.set(-3 + i * 1.5, 0.5, -2);
      treeTrunk.name = `TreeTrunk${i}`;
      renderer.scene.add(treeTrunk);
      
      const treeTopGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      const treeTopMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 }); // 绿色
      const treeTop = new THREE.Mesh(treeTopGeometry, treeTopMaterial);
      treeTop.position.set(-3 + i * 1.5, 1.5, -2);
      treeTop.name = `TreeTop${i}`;
      renderer.scene.add(treeTop);
    }
    
    // 添加文字标识（简化表示）
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d')!;
    textCanvas.width = 256;
    textCanvas.height = 128;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('慕尼黑大学', 128, 64);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    textSprite.position.set(0, 5, 0);
    textSprite.scale.set(4, 2, 1);
    textSprite.name = 'UniversityText';
    renderer.scene.add(textSprite);
  };

  useEffect(() => {
    // 窗口大小调整
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current?.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current?.stop();
        rendererRef.current?.dispose();
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Canvas3D
          onSceneReady={handleSceneReady}
          showFPS={true}
          fogConfig={{ enabled: false }}
        />
        
        {/* CAD线条绘制控制面板 */}
        {rendererRef.current && (
          <CADLineDrawingControl 
            renderer={rendererRef.current}
          />
        )}
        
        {/* 说明文字 */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          zIndex: 1000
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>CAD线条绘制演示 - 慕尼黑大学主题</h3>
          <p style={{ margin: '5px 0' }}>在这个场景中，您可以使用左侧的CAD工具绘制线条。</p>
          <p style={{ margin: '5px 0' }}>场景中包含了慕尼黑大学的简化建筑模型。</p>
          <p style={{ margin: '5px 0' }}>绘制的线条将显示在XY平面上。</p>
        </div>
      </div>
    </div>
  );
};

export default CADLineDrawingDemo;