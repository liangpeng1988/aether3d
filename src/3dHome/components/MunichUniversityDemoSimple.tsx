import React, { useState, useEffect, useRef } from 'react';
import { Aether3d } from '../../../Engine';
import { Viewport } from '../../../Engine/interface/Viewport';
import { THREE } from '../../../Engine/core/global';
import { CADLineDrawingScript } from '../../../Engine/controllers/CAD/CADLineDrawingScript';
import { ModelEditorScript } from '../../../Engine/controllers/ModelEditorScript';
import { OrbitControlsScript } from '../../../Engine/controllers/OrbitControlsScript';
import CADLineDrawingControlSimple from './CADLineDrawingControlSimple';
import ModelEditorControlSimple from './ModelEditorControlSimple';

const MunichUniversityDemoSimple: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Aether3d | null>(null);
  const cadScriptRef = useRef<CADLineDrawingScript | null>(null);
  const modelEditorScriptRef = useRef<ModelEditorScript | null>(null);
  const [activeTool, setActiveTool] = useState<'cad' | 'model'>('cad');
  const [lineColor, setLineColor] = useState<string>('#00ff00');
  const [lineWidth, setLineWidth] = useState<number>(2);

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
      backgroundColor: '#f0f0f0',
      mouseInteraction: {
        interactionMode: 'both',
        enabled: true
      }
    };

    // 创建渲染器
    const engine = new Aether3d(viewportConfig);
    rendererRef.current = engine;

    // 设置相机位置 - 这里设置为与CADLineDrawingScript一致的初始位置
    engine.camera.position.set(0, 10, 0);
    engine.camera.lookAt(0, 0, 0);
    engine.camera.up.set(0, 0, -1);

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
    engine.addScript(orbitControlsScript);

    // 添加网格辅助线 - 与CADLineDrawingScript中的设置保持一致
    const gridHelper = new THREE.GridHelper(30, 30, 0x888888, 0x444444);
    gridHelper.name = 'GridHelper';
    gridHelper.userData = { keepInCADMode: true }; // 标记为需要保留的对象
    // 确保GridHelper位于XZ平面上（Y=0）
    gridHelper.position.set(0, 0, 0);
    gridHelper.rotation.x = Math.PI / 2; // 旋转90度使其位于XZ平面
    engine.scene.add(gridHelper);

    // 添加慕尼黑大学校园元素（模型编辑模式下显示）
    addMunichUniversityCampus(engine);

    // 启动渲染循环
    engine.start();

    console.log('[MunichUniversityDemoSimple] 场景准备就绪');

    // 窗口大小调整
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
      engine.dispose();
    };
  }, []);

  // 添加慕尼黑大学校园元素
  const addMunichUniversityCampus = (renderer: Aether3d) => {
    // 创建主教学楼 - 确保所有建筑都位于XZ平面上(Y=0)
    const mainBuildingGeometry = new THREE.BoxGeometry(4, 0.1, 3);
    const mainBuildingMaterial = new THREE.MeshBasicMaterial({ color: 0xD3D3D3 });
    const mainBuilding = new THREE.Mesh(mainBuildingGeometry, mainBuildingMaterial);
    mainBuilding.position.set(-3, 0, 2); // Y坐标设置为0
    mainBuilding.name = 'MainBuilding';
    mainBuilding.visible = false; // 初始隐藏
    renderer.scene.add(mainBuilding);

    // 创建图书馆
    const libraryGeometry = new THREE.BoxGeometry(3, 0.1, 2.5);
    const libraryMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
    const library = new THREE.Mesh(libraryGeometry, libraryMaterial);
    library.position.set(-6, 0, -1); // Y坐标设置为0
    library.name = 'Library';
    library.visible = false; // 初始隐藏
    renderer.scene.add(library);

    // 创建学生宿舍
    const dormitoryGeometry = new THREE.BoxGeometry(2.5, 0.1, 2);
    const dormitoryMaterial = new THREE.MeshBasicMaterial({ color: 0xFFA500 });
    const dormitory = new THREE.Mesh(dormitoryGeometry, dormitoryMaterial);
    dormitory.position.set(5, 0, 4); // Y坐标设置为0
    dormitory.name = 'Dormitory';
    dormitory.visible = false; // 初始隐藏
    renderer.scene.add(dormitory);

    // 创建食堂
    const cafeteriaGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32);
    const cafeteriaMaterial = new THREE.MeshBasicMaterial({ color: 0xFF6347 });
    const cafeteria = new THREE.Mesh(cafeteriaGeometry, cafeteriaMaterial);
    cafeteria.position.set(4, 0, -3); // Y坐标设置为0
    cafeteria.name = 'Cafeteria';
    cafeteria.visible = false; // 初始隐藏
    renderer.scene.add(cafeteria);

    // 创建花园
    const gardenGeometry = new THREE.BoxGeometry(3, 0.1, 1.5);
    const gardenMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const garden = new THREE.Mesh(gardenGeometry, gardenMaterial);
    garden.position.set(-1, 0, -4); // Y坐标设置为0
    garden.name = 'Garden';
    garden.visible = false; // 初始隐藏
    renderer.scene.add(garden);
  };

  // 切换工具
  const handleToolChange = (tool: 'cad' | 'model') => {
    if (!rendererRef.current) return;

    if (tool === 'cad' && activeTool !== 'cad') {
      // 切换到CAD模式
      // 移除模型编辑模式下的建筑显示
      toggleCampusVisibility(false);
      
      // 移除模型编辑脚本
      if (modelEditorScriptRef.current) {
        rendererRef.current.removeScript(modelEditorScriptRef.current);
        modelEditorScriptRef.current = null;
      }
      
      // 创建并添加CAD绘制脚本
      if (!cadScriptRef.current) {
        const cadScript = new CADLineDrawingScript({
          lineColor: lineColor,
          lineWidth: lineWidth,
          enableSnap: true,
          snapDistance: 0.5,
          showCoordinates: true,
          materialType: 'basic'
        });
        rendererRef.current.addScript(cadScript);
        cadScriptRef.current = cadScript;
      }
    } else if (tool === 'model' && activeTool !== 'model') {
      // 切换到模型编辑模式
      // 移除CAD绘制脚本
      if (cadScriptRef.current) {
        rendererRef.current.removeScript(cadScriptRef.current);
        cadScriptRef.current = null;
      }
      
      // 创建并添加模型编辑脚本
      if (!modelEditorScriptRef.current) {
        const modelEditorScript = new ModelEditorScript({
          enableSelection: true,
          enableMove: true,
          enableRotate: true,
          enableScale: true,
          selectionColor: 0xff0000,
          showAxes: true,
          enableGridSnap: true,
          gridSize: 1
        });
        rendererRef.current.addScript(modelEditorScript);
        modelEditorScriptRef.current = modelEditorScript;
      }
      
      // 显示模型编辑模式下的建筑
      toggleCampusVisibility(true);
    }
    
    setActiveTool(tool);
  };

  // 切换校园建筑可见性
  const toggleCampusVisibility = (visible: boolean) => {
    if (!rendererRef.current) return;
    
    const buildingNames = ['MainBuilding', 'Library', 'Dormitory', 'Cafeteria', 'Garden'];
    buildingNames.forEach(name => {
      const building = rendererRef.current!.scene.getObjectByName(name);
      if (building) {
        building.visible = visible;
      }
    });
  };

  // 处理线条颜色变化
  const handleLineColorChange = (color: string) => {
    setLineColor(color);
    if (cadScriptRef.current) {
      cadScriptRef.current.setLineColor(color);
    }
  };

  // 处理线条宽度变化
  const handleLineWidthChange = (width: number) => {
    setLineWidth(width);
    if (cadScriptRef.current) {
      cadScriptRef.current.setLineWidth(width);
    }
  };

  // 处理对象选择
  const handleObjectSelected = (object: any) => {
    console.log('[MunichUniversityDemoSimple] 选中对象:', object);
  };

  // 处理对象取消选择
  const handleObjectDeselected = () => {
    console.log('[MunichUniversityDemoSimple] 取消选择');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Aether3d画布 */}
      <canvas
        ref={canvasRef}
        style={{ 
          width: '100%', 
          height: '100%',
          cursor: activeTool === 'cad' ? 'crosshair' : 'default'
        }}
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
      
      {/* CAD控制面板 */}
      {activeTool === 'cad' && (
        <CADLineDrawingControlSimple
          onLineColorChange={handleLineColorChange}
          onLineWidthChange={handleLineWidthChange}
        />
      )}
      
      {/* 模型编辑控制面板 */}
      {activeTool === 'model' && (
        <ModelEditorControlSimple
          onObjectSelected={handleObjectSelected}
          onObjectDeselected={handleObjectDeselected}
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
        <p style={{ margin: '5px 0' }}>在CAD模式下点击画布开始绘制线条，双击完成线条。</p>
        <p style={{ margin: '5px 0' }}>在模型编辑模式下可以查看和编辑校园建筑。</p>
        <p style={{ margin: '5px 0' }}>当前工具: {activeTool === 'cad' ? 'CAD绘制' : '模型编辑'}</p>
        {activeTool === 'cad' && (
          <p style={{ margin: '5px 0', color: '#00ff00' }}>CAD模式：使用正交相机，限制在XZ平面上绘制</p>
        )}
      </div>
    </div>
  );
};

export default MunichUniversityDemoSimple;