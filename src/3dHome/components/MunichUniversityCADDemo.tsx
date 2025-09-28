import React, { useEffect, useRef, useState } from 'react';
import { Aether3d } from '../../../Engine';
import { Viewport } from '../../../Engine/interface/Viewport';
import {THREE} from "../../../Engine/core/global";
import { OrbitControlsScript } from '../../../Engine';
import CADLineDrawingControl from './CADLineDrawingControl';
import ModelEditorControl from './ModelEditorControl';

const MunichUniversityCADDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Aether3d | null>(null);
  const orbitControlsRef = useRef<OrbitControlsScript | null>(null);
  const [activeTool, setActiveTool] = useState<'cad' | 'model'>('cad');
  const cadScriptRef = useRef<any>(null);
  const modelEditorScriptRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 创建视口配置
    const viewportConfig: Viewport = {
      element: canvasRef.current,
      dpr: new THREE.Vector2(window.innerWidth, window.innerHeight),
      antialias: true,
      factor: 1,
      distance: 5,
      alpha: false,
      aspect: window.innerWidth / window.innerHeight,
      enablePostProcessing: false,
      enableLogarithmicDepthBuffer: false,
      enablePerformanceMonitoring: false,
      backgroundColor: '#485163',
      mouseInteraction: {
        interactionMode: 'both',
        enabled: true
      }
    };

    // 创建渲染器
    const engine = new Aether3d(viewportConfig);
    rendererRef.current = engine;

    // 设置相机位置
    engine.camera.position.set(15, 10, 15);
    engine.camera.lookAt(0, 0, 0);

    // 创建轨道控制器脚本
    const orbitControlsScript = new OrbitControlsScript({
      enableDamping: true,
      dampingFactor: 0.05,
      rotateSpeed: 0.5,
      zoomSpeed: 1.2,
      maxPolarAngle: THREE.MathUtils.degToRad(89),
      minDistance: 5,
      maxDistance: 30,
      enableRotate: true,
      enableZoom: true,
      enablePan: true,
    });
    orbitControlsScript.setDefaultCameraPosition(
      new THREE.Vector3(15, 10, 15),
      new THREE.Vector3(0, 0, 0)
    );
    engine.addScript(orbitControlsScript);
    orbitControlsRef.current = orbitControlsScript;

    // 添加一个简单的平面作为绘制背景
    const planeGeometry = new THREE.PlaneGeometry(30, 30);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x2E8B57, // 海绿色，模拟草地
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.name = 'CampusGround';
    engine.scene.add(plane);
    
    // 添加坐标轴辅助线
    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.name = 'AxesHelper';
    engine.scene.add(axesHelper);
    
    // 添加网格辅助线（XZ平面）
    const gridHelper = new THREE.GridHelper(30, 30, 0x888888, 0x444444);
    gridHelper.name = 'GridHelper';
    gridHelper.userData = { keepInCADMode: true }; // 标记为需要保留的对象
    // 确保GridHelper位于XZ平面上（Y=0）
    gridHelper.position.set(0, 0, 0);
    gridHelper.rotation.x = Math.PI / 2; // 旋转90度使其位于XZ平面
    engine.scene.add(gridHelper);
    
    // 添加慕尼黑大学校园元素
    addMunichUniversityCampus(engine);
    
    // 启动渲染循环
    engine.start();

    console.log('[MunichUniversityCADDemo] 慕尼黑大学场景准备就绪');

    // 窗口大小调整
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
      engine.dispose();
    };
  }, []);

  // 添加慕尼黑大学校园元素
  const addMunichUniversityCampus = (renderer: Aether3d) => {
    // 创建主教学楼
    createMainBuilding(renderer, 0, 0, 0);
    
    // 创建图书馆
    createLibrary(renderer, -8, 0, 5);
    
    // 创建学生宿舍
    createDormitory(renderer, 8, 0, -5);
    
    // 创建食堂
    createCafeteria(renderer, 6, 0, 6);
    
    // 创建花园和树木
    createGarden(renderer, -6, 0, -6);
    
    // 创建路径
    createPath(renderer);
    
    // 添加大学标识
    addUniversityLogo(renderer);
  };

  // 创建主教学楼
  const createMainBuilding = (renderer: Aether3d, x: number, y: number, z: number) => {
    // 主体建筑
    const mainGeometry = new THREE.BoxGeometry(10, 5, 8);
    const mainMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xD3D3D3, // 浅灰色
      wireframe: false
    });
    const mainBuilding = new THREE.Mesh(mainGeometry, mainMaterial);
    mainBuilding.position.set(x, y + 2.5, z);
    mainBuilding.name = 'MainBuilding';
    renderer.scene.add(mainBuilding);
    
    // 建筑入口
    const entranceGeometry = new THREE.BoxGeometry(2, 3, 0.2);
    const entranceMaterial = new THREE.MeshBasicMaterial({ color: 0x00008B }); // 深蓝色
    const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
    entrance.position.set(x, y + 1.5, z + 4.1);
    entrance.name = 'MainEntrance';
    renderer.scene.add(entrance);
    
    // 建筑顶部装饰
    const roofGeometry = new THREE.BoxGeometry(12, 1, 10);
    const roofMaterial = new THREE.MeshBasicMaterial({ color: 0xB22222 }); // 火砖色
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(x, y + 5.5, z);
    roof.name = 'MainRoof';
    renderer.scene.add(roof);
  };

  // 创建图书馆
  const createLibrary = (renderer: Aether3d, x: number, y: number, z: number) => {
    // 图书馆主体
    const libraryGeometry = new THREE.BoxGeometry(6, 4, 6);
    const libraryMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x808080, // 灰色
      wireframe: false
    });
    const library = new THREE.Mesh(libraryGeometry, libraryMaterial);
    library.position.set(x, y + 2, z);
    library.name = 'Library';
    renderer.scene.add(library);
    
    // 图书馆窗户
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const windowGeometry = new THREE.BoxGeometry(1, 1.2, 0.1);
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 }); // 黄色
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(x - 2.5 + i * 2, y + 1 + j * 1.5, z + 3.05);
        window.name = `LibraryWindow_${i}_${j}`;
        renderer.scene.add(window);
      }
    }
  };

  // 创建学生宿舍
  const createDormitory = (renderer: Aether3d, x: number, y: number, z: number) => {
    // 宿舍主体
    const dormGeometry = new THREE.BoxGeometry(5, 3, 4);
    const dormMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFA500, // 橙色
      wireframe: false
    });
    const dormitory = new THREE.Mesh(dormGeometry, dormMaterial);
    dormitory.position.set(x, y + 1.5, z);
    dormitory.name = 'Dormitory';
    renderer.scene.add(dormitory);
    
    // 宿舍窗户
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const windowGeometry = new THREE.BoxGeometry(1.2, 1, 0.1);
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB }); // 天蓝色
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(x - 1.8 + i * 3.6, y + 1 + j * 1.5, z + 2.05);
        window.name = `DormWindow_${i}_${j}`;
        renderer.scene.add(window);
      }
    }
  };

  // 创建食堂
  const createCafeteria = (renderer: Aether3d, x: number, y: number, z: number) => {
    // 食堂主体
    const cafeGeometry = new THREE.CylinderGeometry(3, 3, 2, 32);
    const cafeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFF6347, // 番茄红
      wireframe: false
    });
    const cafeteria = new THREE.Mesh(cafeGeometry, cafeMaterial);
    cafeteria.position.set(x, y + 1, z);
    cafeteria.name = 'Cafeteria';
    renderer.scene.add(cafeteria);
  };

  // 创建花园
  const createGarden = (renderer: Aether3d, x: number, y: number, z: number) => {
    // 创建多棵树
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        // 树干
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 }); // 褐色
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x + i * 2, y + 1, z + j * 2);
        trunk.name = `TreeTrunk_${i}_${j}`;
        renderer.scene.add(trunk);
        
        // 树冠
        const crownGeometry = new THREE.SphereGeometry(1.2, 8, 8);
        const crownMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 }); // 森林绿
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.set(x + i * 2, y + 3, z + j * 2);
        crown.name = `TreeCrown_${i}_${j}`;
        renderer.scene.add(crown);
      }
    }
    
    // 创建花坛
    const flowerBedGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 16);
    const flowerBedMaterial = new THREE.MeshBasicMaterial({ color: 0xFF69B4 }); // 热粉
    const flowerBed = new THREE.Mesh(flowerBedGeometry, flowerBedMaterial);
    flowerBed.position.set(x + 1, y + 0.15, z + 1);
    flowerBed.name = 'FlowerBed';
    renderer.scene.add(flowerBed);
  };

  // 创建路径
  const createPath = (renderer: Aether3d) => {
    // 创建一条从主建筑到图书馆的路径
    const pathGeometry = new THREE.BoxGeometry(15, 0.1, 2);
    const pathMaterial = new THREE.MeshBasicMaterial({ color: 0xD2B48C }); // 萤石色
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    path.position.set(-4, 0.05, 2.5);
    path.name = 'MainPath';
    renderer.scene.add(path);
  };

  // 添加大学标识
  const addUniversityLogo = (renderer: Aether3d) => {
    // 创建简单的文字标识
    const textCanvas = document.createElement('canvas');
    const ctx = textCanvas.getContext('2d')!;
    textCanvas.width = 512;
    textCanvas.height = 128;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // 深蓝色
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Ludwig-Maximilians-Universität München', 256, 50);
    ctx.font = '24px Arial';
    ctx.fillText('慕尼黑大学 CAD 绘制演示', 256, 90);
    
    const textTexture = new THREE.CanvasTexture(textCanvas);
    const textMaterial = new THREE.SpriteMaterial({ map: textTexture });
    const textSprite = new THREE.Sprite(textMaterial);
    textSprite.position.set(0, 8, 0);
    textSprite.scale.set(10, 2.5, 1);
    textSprite.name = 'UniversityLogo';
    renderer.scene.add(textSprite);
  };

  // 处理对象选择
  const handleObjectSelected = (object: any) => {
    console.log('[MunichUniversityCADDemo] 选中对象:', object?.name);
  };

  // 处理对象取消选择
  const handleObjectDeselected = () => {
    console.log('[MunichUniversityCADDemo] 取消选择');
  };

  // 切换工具时清空数据
  const handleToolChange = (tool: 'cad' | 'model') => {
    // 如果是从CAD切换到模型编辑
    if (tool === 'model' && activeTool === 'cad') {
      // 清空CAD绘制的数据
      if (cadScriptRef.current && typeof cadScriptRef.current.clearAllLines === 'function') {
        cadScriptRef.current.clearAllLines();
        console.log('[MunichUniversityCADDemo] 已清空CAD绘制数据');
      }
    }
    
    // 如果是从模型编辑切换到CAD
    if (tool === 'cad' && activeTool === 'model') {
      // 取消模型编辑器的选择
      if (modelEditorScriptRef.current && typeof modelEditorScriptRef.current.deselectObject === 'function') {
        modelEditorScriptRef.current.deselectObject();
        console.log('[MunichUniversityCADDemo] 已取消模型编辑器选择');
      }
      
      // 清除场景中的3D模型
      if (rendererRef.current) {
        clearSceneModels(rendererRef.current);
      }
    }
    
    // 更新工具状态
    setActiveTool(tool);
  };

  /**
   * 清除场景中的3D模型（保留辅助对象）
   */
  const clearSceneModels = (renderer: any) => {
    if (!renderer.scene) return;
    
    // 收集需要移除的对象
    const objectsToRemove: any[] = [];
    
    renderer.scene.traverse((object: any) => {
      // 保留辅助对象（网格、坐标轴等）
      if (object.name === 'GridHelper' || 
          object.name === 'AxesHelper' || 
          object.name === 'CampusGround' ||
          object.name.startsWith('CADLine_') ||
          object.name === 'PreviewLine') {
        return;
      }
      
      // 保留我们自己创建的对象
      if (object.userData && object.userData.keepInCADMode) {
        return;
      }
      
      // 标记其他对象以移除
      if (object.parent) {
        objectsToRemove.push(object);
      }
    });
    
    // 移除标记的对象
    for (const object of objectsToRemove) {
      renderer.scene.remove(object);
    }
    
    console.log('[MunichUniversityCADDemo] 场景中的3D模型已清除');
  };

  // 获取CAD脚本引用
  const handleCADScriptRef = (script: any) => {
    cadScriptRef.current = script;
  };

  // 获取模型编辑器脚本引用
  const handleModelEditorScriptRef = (script: any) => {
    modelEditorScriptRef.current = script;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      
      {/* 工具选择按钮 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 1000
      }}>
        <button
          onClick={() => handleToolChange('cad')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTool === 'cad' ? '#2196F3' : '#607D8B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          CAD绘制
        </button>
        <button
          onClick={() => handleToolChange('model')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTool === 'model' ? '#4CAF50' : '#607D8B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          模型编辑
        </button>
      </div>
      
      {/* CAD线条绘制控制面板 */}
      {activeTool === 'cad' && rendererRef.current && (
        <CADLineDrawingControl 
          renderer={rendererRef.current}
          onScriptRef={handleCADScriptRef}
        />
      )}
      
      {/* 模型编辑控制面板 */}
      {activeTool === 'model' && rendererRef.current && (
        <ModelEditorControl 
          renderer={rendererRef.current}
          onObjectSelected={handleObjectSelected}
          onObjectDeselected={handleObjectDeselected}
          onScriptRef={handleModelEditorScriptRef}
        />
      )}
      
      {/* 说明文字 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#FFD700' }}>慕尼黑大学CAD绘制演示</h3>
        <p style={{ margin: '5px 0' }}>欢迎来到慕尼黑大学虚拟校园！</p>
        <p style={{ margin: '5px 0' }}>您可以使用右侧的工具在校园中进行操作。</p>
        <p style={{ margin: '5px 0' }}>场景中包含了:</p>
        <ul style={{ margin: '5px 0 5px 20px', padding: 0 }}>
          <li>主教学楼</li>
          <li>图书馆</li>
          <li>学生宿舍</li>
          <li>食堂</li>
          <li>花园和路径</li>
        </ul>
        <p style={{ margin: '5px 0' }}>当前工具: {activeTool === 'cad' ? 'CAD绘制' : '模型编辑'}</p>
      </div>
    </div>
  );
};

export default MunichUniversityCADDemo;