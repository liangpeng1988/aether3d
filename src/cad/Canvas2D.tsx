import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Aether3d } from '../../Engine';
import { Viewport } from '../../Engine/interface/Viewport';
import { THREE } from "../../Engine/core/global";
import { screenToWorld as utilsScreenToWorld, worldToScreen as utilsWorldToScreen } from '../../Engine/core/utils';

import { OrthoCameraControlsScript } from '../../Engine/controllers/CAD/OrthoCameraControlsScript';

interface Canvas2DProps {
  /** 容器宽度 */
  width?: number | string;
  /** 容器高度 */
  height?: number | string;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 是否显示网格 */
  showGrid?: boolean;
  /** 是否显示坐标轴 */
  showAxes?: boolean;
  /** 是否显示标尺 */
  showRulers?: boolean;
  /** 相机位置 */
  cameraPosition?: [number, number, number];
  /** 相机目标点 */
  cameraTarget?: [number, number, number];
  /** 线条绘制完成回调 */
  onLineDrawn?: (line: any) => void;
  /** 线条选中回调 */
  onLineSelected?: (line: any | null) => void;
  /** 模型选中回调 */
  onObjectSelected?: (object: THREE.Object3D | null) => void;
  /** 模型取消选中回调 */
  onObjectDeselected?: () => void;
  /** 标注创建完成回调 */
  onDimensionCreated?: (dimension: any) => void;
  /** 是否在组件卸载时清除线条 */
  clearLinesOnUnmount?: boolean;
}

export interface Canvas2DHandle {
  /** 获取渲染器实例 */
  getRenderer: () => Aether3d | null;
  /** 获取轨道控制器实例 */
  getOrbitControls: () => OrthoCameraControlsScript | null;
  /** 设置相机到默认视角 */
  setCameraToDefault: () => void;
  /** 获取屏幕坐标到世界坐标的转换 */
  screenToWorld: (x: number, y: number) => THREE.Vector3;
  /** 获取世界坐标到屏幕坐标的转换 */
  worldToScreen: (point: THREE.Vector3) => THREE.Vector2;
  /** 开始创建标注 */
  startDimensionCreation: (type: 'horizontal' | 'vertical' | 'aligned') => void;
  /** 设置标注起点 */
  setDimensionStartPoint: (point: THREE.Vector3) => void;
  /** 设置标注终点 */
  setDimensionEndPoint: (point: THREE.Vector3) => void;
  /** 添加线条到场景 */
  addLine: (line: THREE.Line) => void;
  /** 清除所有线条 */
  clearAllLines: () => void;
  /** 设置绘制模式 */
  setDrawingMode: (enabled: boolean) => void;
}

const Canvas2D = forwardRef<Canvas2DHandle, Canvas2DProps>((props, ref) => {
  const {
    width = '100%',
    height = '100%',
    backgroundColor = '#000000',
    showGrid = true,
    showAxes = true,
    showRulers = true,
    cameraPosition = [0, 0, 10],
    cameraTarget = [0, 0, 0],
    onLineDrawn,
    onLineSelected,
    onObjectSelected,
    onObjectDeselected,
    onDimensionCreated,
    clearLinesOnUnmount = false // 默认不在组件卸载时清除线条
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Aether3d | null>(null);
  const orbitControlsRef = useRef<OrthoCameraControlsScript | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);
  // 添加标尺引用
  const rulerTopRef = useRef<HTMLCanvasElement | null>(null);
  const rulerLeftRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化3D场景
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

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
      backgroundColor,
      mouseInteraction: {
        interactionMode: 'both',
        enabled: true
      }
    };

    // 创建渲染器
    const engine = new Aether3d(viewportConfig);
    rendererRef.current = engine;

    // 设置相机位置 - 使用XZ平面的顶视图
    engine.camera.position.set(0, 10, 0); // 从Y轴正方向看XZ平面
    engine.camera.lookAt(0, 0, 0);
    engine.camera.up.set(0, 0, -1); // 设置up向量为负Z轴方向
    
    // 调整相机参数以模拟正交效果
    engine.camera.fov = 1; // 使用更小的fov来更好地模拟正交效果
    engine.camera.updateProjectionMatrix();

    // 创建正交相机控制脚本
    const cameraControlsScript = new OrthoCameraControlsScript({
      enableDamping: true,
      dampingFactor: 0.05,
      zoomSpeed: 1.2,
      panSpeed: 2.0,
      enableZoom: true,
      enablePan: true,
    });
    engine.addScript(cameraControlsScript);
    orbitControlsRef.current = cameraControlsScript;

    // 添加坐标轴辅助线
    if (showAxes) {
      const axesHelper = new THREE.AxesHelper(1);
      axesHelper.name = 'AxesHelper';
      // 设置坐标轴颜色为白色
      const axisMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      axesHelper.material = axisMaterial;
      // 将坐标轴原点移动到画布左上角
      // 在XZ平面上，左上角对应的是负X、正Z方向
      axesHelper.position.set(0, 0, 0);
      engine.scene.add(axesHelper);
      axesHelperRef.current = axesHelper;
    }

    // 重新添加已绘制的线条到场景中（如果存在）
    for (const line of drawnLinesRef.current) {
      engine.scene.add(line);
    }

    // 启动渲染循环
    engine.start();
    setIsInitialized(true);

    console.log('[Canvas2D] 3D场景初始化完成');

    // 窗口大小调整
    const handleResize = () => {
      engine.resize();
      // 移除对标尺的依赖，简化处理
      /*
      if (showRulers) {
        // 重新绘制标尺
        setTimeout(() => {
          if (rendererRef.current && rulerTopRef.current && rulerLeftRef.current) {
            // 这里应该调用绘制标尺的函数
            // 由于我们之前删除了drawRulers函数，我们需要重新实现它
          }
        }, 0);
      }
      */
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      // 其他清理工作将在第二个useEffect中完成
    };
  }, [backgroundColor, showAxes, showGrid, showRulers]);

  // 存储绘制的线条
  const drawnLinesRef = useRef<THREE.Line[]>([]);

  // 标注相关状态
  const [isCreatingDimension, setIsCreatingDimension] = useState(false);
  const [dimensionType, setDimensionType] = useState<'horizontal' | 'vertical' | 'aligned'>('aligned');
  const dimensionStartPointRef = useRef<THREE.Vector3 | null>(null);

  // 添加绘制模式状态
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const isDrawingRef = useRef(false);
  const currentLineRef = useRef<THREE.Line | null>(null);
  const linePointsRef = useRef<THREE.Vector3[]>([]);

  // 添加Z轴移动状态
  const isZAxisMovingRef = useRef(false);

  // 确保已绘制的线条在场景中正确显示
  useEffect(() => {
    if (!isInitialized || !rendererRef.current) return;
    
    // 确保所有已绘制的线条都在场景中
    for (const line of drawnLinesRef.current) {
      if (!rendererRef.current.scene.children.includes(line)) {
        rendererRef.current.scene.add(line);
      }
    }
  }, [isInitialized, drawnLinesRef.current.length]);

  // 添加CAD模式的鼠标交互功能
  useEffect(() => {
    if (!isInitialized || !rendererRef.current || !orbitControlsRef.current) return;

    const canvas = rendererRef.current.renderer.domElement;
    let isPanning = false;
    let previousMousePosition = { x: 0, y: 0 };
    let isOrbitControlsEnabled = true;

    const onMouseDown = (event: MouseEvent) => {
      // 检查是否正在创建标注
      if (isCreatingDimension && event.button === 0) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const worldPoint = screenToWorld(x, y);
        
        if (!dimensionStartPointRef.current) {
          // 设置起点
          dimensionStartPointRef.current = worldPoint;
        } else {
          // 设置终点并完成标注
          if (onDimensionCreated) {
            onDimensionCreated({
              type: dimensionType,
              start: dimensionStartPointRef.current,
              end: worldPoint,
              distance: dimensionStartPointRef.current.distanceTo(worldPoint)
            });
          }
          // 重置状态
          dimensionStartPointRef.current = null;
          setIsCreatingDimension(false);
        }
        
        event.preventDefault();
      }
      // 检查是否处于绘制模式
      else if (isDrawingMode && event.button === 0) {
        isDrawingRef.current = true;
        linePointsRef.current = [];
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const worldPoint = screenToWorld(x, y);
        
        // 确保点在XZ平面上(Y坐标为0)
        worldPoint.y = 0;
        
        // 创建新的线条
        const geometry = new THREE.BufferGeometry();
        linePointsRef.current.push(worldPoint);
        geometry.setFromPoints(linePointsRef.current);
        
        const material = new THREE.LineBasicMaterial({ 
          color: 0x00ff00, // 绿色线条
          linewidth: 2 
        });
        
        currentLineRef.current = new THREE.Line(geometry, material);
        rendererRef.current?.scene.add(currentLineRef.current);
        
        event.preventDefault();
      }
      // 修改这里：完全移除Ctrl键按下时的移动操作
      // 鼠标左键不执行任何平移操作（无论是否按下Ctrl键）
      else if (event.button === 0) {
        // 左键不执行任何平移操作
        // 可以用于其他功能，如选择对象等
      }
      // 鼠标中键可以直接平移（不依赖Ctrl键）
      else if (event.button === 1) {
        isPanning = true;
        // 中键可以直接平移
        isZAxisMovingRef.current = false;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        
        // 禁用相机控制脚本
        if (orbitControlsRef.current) {
          isOrbitControlsEnabled = orbitControlsRef.current.getEnabled();
          orbitControlsRef.current.disable();
        }
        
        event.preventDefault();
      }
      // 右键不执行任何移动操作
      else if (event.button === 2) {
        // 右键不执行任何移动操作，允许默认右键菜单显示
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      // 修改这里：确保只有在平移模式下才执行移动操作
      if (isPanning && rendererRef.current) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        const camera = rendererRef.current.camera;
        // 根据相机缩放级别调整平移速度，确保视觉上的一致性
        // 使用相机的zoom属性来调整平移速度
        const panSpeed = 0.02 / (camera.zoom || 1);
        
        // 移除右键的Z轴移动处理，所有移动都在XY平面上进行
        // 修改这里：允许所有方向的自由移动（包括Y轴）
        // 计算平移向量（包含X、Y、Z轴）
        const panVector = new THREE.Vector3();
        panVector.set(deltaX * panSpeed, -deltaY * panSpeed, 0);
        
        // 转换到世界坐标系
        panVector.applyQuaternion(camera.quaternion);
        
        // 移动相机（允许所有轴向移动）
        camera.position.sub(panVector);
        
        // 更新相机控制脚本的目标点
        if (orbitControlsRef.current) {
          const currentTarget = orbitControlsRef.current.getTargetPosition();
          if (currentTarget) {
            currentTarget.sub(panVector);
            // 通过设置默认相机位置来间接更新目标点
            orbitControlsRef.current.setDefaultCameraPosition(camera.position.clone(), currentTarget);
          }
        }
        
        previousMousePosition = { x: event.clientX, y: event.clientY };
      }
      // 处理线条绘制
      else if (isDrawingRef.current && currentLineRef.current && rendererRef.current) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const worldPoint = screenToWorld(x, y);
        
        // 确保点在XZ平面上(Y坐标为0)
        worldPoint.y = 0;
        
        // 更新线条
        linePointsRef.current.push(worldPoint);
        currentLineRef.current.geometry.setFromPoints(linePointsRef.current);
      }
      // 左键不执行任何移动操作
    };

    const onMouseUp = (event: MouseEvent) => {
      // 修改这里：完全移除Ctrl键按下时的移动操作
      // 只有鼠标中键抬起时才停止平移
      if (event.button === 1) {
        isPanning = false;
        // 右键不控制Z轴移动，所以不需要重置Z轴移动状态
        
        // 恢复相机控制脚本状态
        if (orbitControlsRef.current) {
          if (isOrbitControlsEnabled) {
            orbitControlsRef.current.enable();
          }
        }
        
        event.preventDefault();
      } 
      // 处理线条绘制完成
      else if (isDrawingRef.current && event.button === 0) {
        isDrawingRef.current = false;
        
        if (currentLineRef.current && linePointsRef.current.length > 1) {
          // 将线条添加到持久存储中
          drawnLinesRef.current.push(currentLineRef.current);
          
          // 调用回调
          if (onLineDrawn) {
            onLineDrawn({
              line: currentLineRef.current,
              points: [...linePointsRef.current]
            });
          }
        } else if (currentLineRef.current) {
          // 如果线条点数不足，移除它
          rendererRef.current?.scene.remove(currentLineRef.current);
          currentLineRef.current.geometry.dispose();
          if (currentLineRef.current.material instanceof THREE.Material) {
            currentLineRef.current.material.dispose();
          }
        }
        
        currentLineRef.current = null;
        linePointsRef.current = [];
      }
      // 右键不执行任何移动操作
      else if (event.button === 2) {
        // 右键不执行任何移动操作
      }
    };

    const onWheel = (event: WheelEvent) => {
      // 鼠标滚轮缩放
      if (rendererRef.current && orbitControlsRef.current) {
        const camera = rendererRef.current.camera;
        const zoomSpeed = 0.1;
        const delta = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
        
        // 对于透视相机，调整相机位置
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        direction.multiplyScalar(event.deltaY > 0 ? zoomSpeed : -zoomSpeed);
        
        // 移动相机（允许Y轴移动）
        camera.position.add(direction);
        
        // 更新相机控制脚本的目标点
        const currentTarget = orbitControlsRef.current.getTargetPosition();
        if (currentTarget) {
          currentTarget.add(direction);
          orbitControlsRef.current.setDefaultCameraPosition(camera.position.clone(), currentTarget);
        }
        
        event.preventDefault();
      }
    };

    // 右键菜单处理
    const handleContextMenu = (event: MouseEvent) => {
      // 允许右键菜单显示，因为右键不执行任何移动操作
      // 不阻止默认右键菜单
    };

    // 添加事件监听器
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);
    canvas.addEventListener('contextmenu', handleContextMenu);

    // 清理函数
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', handleContextMenu);
      // 移除Shift键事件监听器
      /*
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      */
      
      // 根据clearLinesOnUnmount属性决定是否在组件卸载时清除线条
      if (clearLinesOnUnmount) {
        clearAllLines();
      }
      
      // 注意：即使不清除线条，我们也需要停止渲染器
      if (rendererRef.current) {
        rendererRef.current.stop();
        rendererRef.current.dispose();
      }
      setIsInitialized(false);
    };
  }, [isInitialized, isCreatingDimension, dimensionType, onLineDrawn, onDimensionCreated]);

  // 屏幕坐标到世界坐标的转换
  const screenToWorld = (x: number, y: number): THREE.Vector3 => {
    if (!rendererRef.current) {
      return new THREE.Vector3(0, 0, 0);
    }

    return utilsScreenToWorld(
      x, 
      y, 
      rendererRef.current.renderer.domElement, 
      rendererRef.current.camera
    );
  };

  // 世界坐标到屏幕坐标的转换
  const worldToScreen = (point: THREE.Vector3): THREE.Vector2 => {
    if (!rendererRef.current) {
      return new THREE.Vector2(0, 0);
    }

    return utilsWorldToScreen(
      point, 
      rendererRef.current.renderer.domElement, 
      rendererRef.current.camera
    );
  };

  // 开始创建标注
  const startDimensionCreation = (type: 'horizontal' | 'vertical' | 'aligned') => {
    setIsCreatingDimension(true);
    setDimensionType(type);
    dimensionStartPointRef.current = null;
  };

  // 设置标注起点
  const setDimensionStartPoint = (point: THREE.Vector3) => {
    dimensionStartPointRef.current = point.clone();
  };

  // 设置标注终点
  const setDimensionEndPoint = (point: THREE.Vector3) => {
    if (dimensionStartPointRef.current && onDimensionCreated) {
      onDimensionCreated({
        type: dimensionType,
        start: dimensionStartPointRef.current,
        end: point,
        distance: dimensionStartPointRef.current.distanceTo(point)
      });
    }
    // 重置状态
    dimensionStartPointRef.current = null;
    setIsCreatingDimension(false);
  };

  // 添加线条到场景
  const addLine = (line: THREE.Line) => {
    if (rendererRef.current) {
      rendererRef.current.scene.add(line);
      drawnLinesRef.current.push(line);
    }
  };

  // 清除所有线条
  const clearAllLines = () => {
    if (rendererRef.current) {
      for (const line of drawnLinesRef.current) {
        rendererRef.current.scene.remove(line);
        line.geometry.dispose();
        if (line.material instanceof THREE.Material) {
          line.material.dispose();
        }
      }
      drawnLinesRef.current = [];
    }
  };

  // 设置绘制模式
  const setDrawingMode = (enabled: boolean) => {
    setIsDrawingMode(enabled);
  };

  // 获取渲染器实例
  const getRenderer = () => {
    return rendererRef.current;
  };

  // 获取轨道控制器实例
  const getOrbitControls = () => {
    return orbitControlsRef.current;
  };

  // 设置相机到默认视角
  const setCameraToDefault = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.setDefaultCameraPosition(
        new THREE.Vector3(...cameraPosition),
        new THREE.Vector3(...cameraTarget)
      );
    }
  };

  // 使用useImperativeHandle实现Canvas2DHandle接口
  useImperativeHandle(ref, () => ({
    getRenderer,
    getOrbitControls,
    setCameraToDefault,
    screenToWorld,
    worldToScreen,
    startDimensionCreation,
    setDimensionStartPoint,
    setDimensionEndPoint,
    addLine,
    clearAllLines,
    setDrawingMode
  }));

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width, 
        height: typeof height === 'number' ? `${height}px` : height,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block' 
        }}
      />
    </div>
  );
});

export default Canvas2D;