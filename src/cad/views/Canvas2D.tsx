import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Aether3d } from '../../../Engine';
import { THREE } from "../../../Engine/core/global";
import { Document as CADDocument } from '../data/Document';
import { 
  screenToWorld as utilsScreenToWorld, 
  worldToScreen as utilsWorldToScreen 
} from '../../../Engine/core/utils';
import { ExtendedMeasurementUtils } from '../../../Engine/utils/ExtendedMeasurementUtils'; // 添加扩展测量工具导入
import { KeyboardControlsScript } from '../controllers/KeyboardControlsScript';
import { D2MouseInteractionScript } from '../controllers/D2MouseInteractionScript';
import { WheelInteractionScript } from '../controllers/WheelInteractionScript';
import { ContextmenuScript } from '../controllers/ContextmenuScript';
import { OrthoCameraControlsScript } from '../../../Engine/controllers/CAD/OrthoCameraControlsScript'; // 添加正交相机控制脚本导入

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
  /** 测量点选择回调 */
  onMeasurementPointSelected?: (point: THREE.Vector3) => void;
  /** 是否在组件卸载时清除线条 */
  clearLinesOnUnmount?: boolean;
  /** 是否显示位置信息标签 */
  showPositionLabel?: boolean;
  /** 是否启用键盘快捷键 */
  enableKeyboardShortcuts?: boolean;
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
    clearLinesOnUnmount = false,
    showPositionLabel = true,
    enableKeyboardShortcuts = true // 默认启用键盘快捷键
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

  // 添加位置信息状态
  const [mousePosition, setMousePosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);

  // 存储绘制的线条
  const drawnLinesRef = useRef<THREE.Line[]>([]);

  // 标注相关状态
  const [isCreatingDimension, setIsCreatingDimension] = useState(false);
  const [dimensionType, setDimensionType] = useState<'horizontal' | 'vertical' | 'aligned'>('aligned');
  const dimensionStartPointRef = useRef<THREE.Vector3 | null>(null);
  
  // 测量相关状态
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementType, setMeasurementType] = useState<'distance' | 'angle' | 'diameter' | 'radius' | 'area'>('distance');
  const measurementPointsRef = useRef<THREE.Vector3[]>([]);

  // 添加绘制模式状态
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const isDrawingRef = useRef(false);
  const currentLineRef = useRef<THREE.Line | null>(null);
  const linePointsRef = useRef<THREE.Vector3[]>([]);

  // 添加Z轴移动状态
  const isZAxisMovingRef = useRef(false);

  // 窗口大小调整函数，定义在组件作用域内以便在其他地方使用
  const handleResize = () => {
    // 检查容器尺寸并更新渲染器
    if (containerRef.current && rendererRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // 性能优化：只有在尺寸真正改变时才更新
      const currentSize = rendererRef.current.getSize();
      if (currentSize.x === containerWidth && currentSize.y === containerHeight) {
        return;
      }
      
      // 使用THREE.Vector2创建尺寸对象
      const size = new THREE.Vector2(containerWidth, containerHeight);
      
      // 更新渲染器尺寸
      rendererRef.current.setSize(size);
      
      // 更新相机宽高比
      rendererRef.current.camera.aspect = containerWidth / containerHeight;
      rendererRef.current.camera.updateProjectionMatrix();
      
      // 强制重新渲染以确保更新立即生效
      rendererRef.current.renderer.render(rendererRef.current.scene, rendererRef.current.camera);
    }
  };

  // 初始化3D场景
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // 创建视口配置
    const viewportConfig = {
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
        interactionMode: 'both' as const,
        enabled: true
      }
    };

    // 创建渲染器
    const engine = new Aether3d(viewportConfig);
    rendererRef.current = engine;

    // 设置相机位置 - 使用XZ平面的顶视图，将原点(0,0,0)置于左上方
    engine.camera.position.set(22, 10, 9); // 从Y轴正方向看XZ平面
    engine.camera.lookAt(22, 0, 9); // 相机看向原点
    engine.camera.up.set(0, 0, -1); // 设置up向量为负Z轴方向，这样正X向右，正Z向下
    
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

    // 防抖处理的窗口大小调整
    const debouncedResize = (() => {
      let timeoutId: NodeJS.Timeout | null = null;
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        // 立即执行尺寸调整
        handleResize();
      };
    })();

    // 使用ResizeObserver监听容器尺寸变化
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(debouncedResize);
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', debouncedResize);

    // 初始调整大小
    handleResize();

    // 清理函数
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeObserver && containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
        resizeObserver.disconnect();
      }
      // 其他清理工作将在第二个useEffect中完成
    };
  }, [backgroundColor, showAxes, showGrid, showRulers]);

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

  // 确保容器尺寸正确设置
  useEffect(() => {
    if (containerRef.current) {
      // 强制容器填满父元素
      containerRef.current.style.width = '100%';
      containerRef.current.style.height = '100%';
      
      // 触发一次resize事件以确保画布尺寸正确
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 0);
    }
  }, []);

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
    
    // 如果禁用绘制模式，同时取消当前正在进行的绘制
    if (!enabled && isDrawingRef.current && currentLineRef.current) {
      if (rendererRef.current && currentLineRef.current) {
        rendererRef.current.scene.remove(currentLineRef.current);
        // 安全地释放几何体和材质资源
        try {
          if (currentLineRef.current.geometry) {
            currentLineRef.current.geometry.dispose();
          }
          if (currentLineRef.current.material) {
            if (Array.isArray(currentLineRef.current.material)) {
              currentLineRef.current.material.forEach(material => material.dispose());
            } else if (currentLineRef.current.material instanceof THREE.Material) {
              currentLineRef.current.material.dispose();
            }
          }
        } catch (error) {
          console.warn('清理线条资源时出错:', error);
        }
      }
      isDrawingRef.current = false;
      currentLineRef.current = null;
      // 清空点数组
      linePointsRef.current = [];
    }
    
    // 确保在切换绘制模式时相机控制状态正确
    if (orbitControlsRef.current) {
      try {
        if (enabled) {
          // 进入绘制模式时，可能需要特殊处理相机控制
          console.log('[Canvas2D] 进入绘制模式');
        } else {
          // 退出绘制模式时，确保相机控制被重新启用
          console.log('[Canvas2D] 退出绘制模式');
        }
      } catch (error) {
        console.warn('[Canvas2D] 切换绘制模式时处理相机控制出错:', error);
      }
    }
  };

  // 添加CAD模式的鼠标交互功能
  useEffect(() => {
    if (!isInitialized || !rendererRef.current || !orbitControlsRef.current) return;

    const canvas = rendererRef.current.renderer.domElement;
    
    // 创建交互脚本实例
    const keyboardControls = new KeyboardControlsScript({
      enableKeyboardShortcuts,
      isCreatingDimension,
      isDrawingMode,
      isDrawingRef,
      currentLineRef,
      linePointsRef,
      dimensionStartPointRef,
      rendererRef,
      orbitControlsRef,
      drawnLinesRef,
      dimensionType,
      onLineDrawn,
      onDimensionCreated,
      setIsCreatingDimension,
      setIsDrawingMode,
      setDimensionType,
      clearAllLines
    });
    
    const mouseInteraction = new D2MouseInteractionScript({
      isCreatingDimension,
      isDrawingMode,
      dimensionType,
      onDimensionCreated,
      onLineDrawn,
      onMeasurementPointSelected, // 添加测量点选择回调
      setIsCreatingDimension,
      dimensionStartPointRef,
      isDrawingRef,
      currentLineRef,
      linePointsRef,
      drawnLinesRef,
      rendererRef,
      orbitControlsRef,
      showPositionLabel,
      setMousePosition, // 添加缺失的属性
      setIsMouseOverCanvas // 添加缺失的属性
    });
    
    // 设置鼠标事件监听器
    const cleanupMouseInteraction = mouseInteraction.setup(canvas);
    
    // 存储脚本引用以便在清理时移除
    const keyboardControlsRef = keyboardControls;
    const mouseInteractionRef = mouseInteraction;
    
    // 清理函数
    return () => {
      cleanupMouseInteraction();
    };
  }, [
    isInitialized, 
    isCreatingDimension, 
    isDrawingMode, 
    dimensionType, 
    onLineDrawn, 
    onDimensionCreated, 
    setIsCreatingDimension, 
    setIsDrawingMode, 
    setDimensionType, 
    clearAllLines,
    showPositionLabel,
    setMousePosition, // 添加缺失的依赖
    setIsMouseOverCanvas, // 添加缺失的依赖
  ]);

  // 处理测量点选择
  const onMeasurementPointSelected = (point: THREE.Vector3) => {
    if (!isMeasuring) return;
    
    // 将点添加到测量点数组中
    measurementPointsRef.current.push(point.clone());
    
    // 根据测量类型处理不同的逻辑
    switch (measurementType) {
      case 'distance':
        if (measurementPointsRef.current.length === 2) {
          // 计算两点间距离
          const distance = point.distanceTo(measurementPointsRef.current[0]);
          if (onDimensionCreated) {
            onDimensionCreated({
              type: 'distance',
              start: measurementPointsRef.current[0],
              end: point,
              distance: distance
            });
          }
          // 重置测量状态
          measurementPointsRef.current = [];
        }
        break;
        
      case 'angle':
        if (measurementPointsRef.current.length === 3) {
          // 计算三点间角度
          const angle = ExtendedMeasurementUtils.calculateAngle(
            measurementPointsRef.current[0],
            measurementPointsRef.current[1],
            point
          );
          const angleDegrees = ExtendedMeasurementUtils.radiansToDegrees(angle);
          if (onDimensionCreated) {
            onDimensionCreated({
              type: 'angle',
              points: [...measurementPointsRef.current, point],
              angle: angleDegrees
            });
          }
          // 重置测量状态
          measurementPointsRef.current = [];
        }
        break;
        
      case 'diameter':
        if (measurementPointsRef.current.length === 2) {
          // 计算直径
          const diameter = ExtendedMeasurementUtils.calculateDiameter(
            measurementPointsRef.current[0],
            point
          );
          if (onDimensionCreated) {
            onDimensionCreated({
              type: 'diameter',
              center: measurementPointsRef.current[0],
              point: point,
              diameter: diameter
            });
          }
          // 重置测量状态
          measurementPointsRef.current = [];
        }
        break;
        
      case 'radius':
        if (measurementPointsRef.current.length === 2) {
          // 计算半径
          const radius = ExtendedMeasurementUtils.calculateRadius(
            measurementPointsRef.current[0],
            point
          );
          if (onDimensionCreated) {
            onDimensionCreated({
              type: 'radius',
              center: measurementPointsRef.current[0],
              point: point,
              radius: radius
            });
          }
          // 重置测量状态
          measurementPointsRef.current = [];
        }
        break;
        
      // 对于面积测量，用户可以继续添加点，直到完成
    }
  };

  // 开始测量
  const startMeasurement = (type: 'distance' | 'angle' | 'diameter' | 'radius' | 'area') => {
    setIsMeasuring(true);
    setMeasurementType(type);
    measurementPointsRef.current = [];
  };

  // 完成面积测量
  const finishAreaMeasurement = () => {
    if (measurementType === 'area' && measurementPointsRef.current.length >= 3) {
      // 计算多边形面积
      const area = ExtendedMeasurementUtils.calculatePolygonArea(measurementPointsRef.current);
      if (onDimensionCreated) {
        onDimensionCreated({
          type: 'area',
          points: [...measurementPointsRef.current],
          area: area
        });
      }
      // 重置测量状态
      measurementPointsRef.current = [];
    }
  };

  // 使用useImperativeHandle实现Canvas2DHandle接口
  // useImperativeHandle(ref, () => ({
  //   getRenderer,
  //   getOrbitControls,
  //   setCameraToDefault,
  //   screenToWorld,
  //   worldToScreen,
  //   startDimensionCreation,
  //   setDimensionStartPoint,
  //   setDimensionEndPoint,
  //   addLine,
  //   clearAllLines,
  //   setDrawingMode,
  //   // 添加强制更新尺寸的方法
  //   forceResize: () => {
  //     handleResize();
  //   }
  // }));

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'width 0.3s ease, height 0.3s ease', /* 添加平滑过渡效果 */
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block',
          transition: 'width 0.3s ease, height 0.3s ease', /* 添加平滑过渡效果 */
        }}
      />
      {/* 添加位置信息标签 */}
      {showPositionLabel && isMouseOverCanvas && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            pointerEvents: 'none',
            zIndex: 1000,
            transition: 'all 0.3s ease', /* 添加平滑过渡效果 */
          }}
        >
          X: {mousePosition.x.toFixed(2)}, Y: {mousePosition.y.toFixed(2)}, Z: {mousePosition.z.toFixed(2)}
        </div>
      )}
      {/* 添加绘制模式指示器 */}
      {isDrawingMode && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(255, 0, 0, 0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 1000,
            transition: 'all 0.3s ease', /* 添加平滑过渡效果 */
          }}
        >
          划线模式 (按 ESC 取消, 按 Enter 完成)
        </div>
      )}
      {/* 相机位置显示 */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          zIndex: 1000,
          transition: 'all 0.3s ease', /* 添加平滑过渡效果 */
        }}
      >
        相机位置: X: {rendererRef.current?.camera.position.x.toFixed(2) || '0.00'}, 
        Y: {rendererRef.current?.camera.position.y.toFixed(2) || '0.00'}, 
        Z: {rendererRef.current?.camera.position.z.toFixed(2) || '0.00'}
      </div>
    </div>
  );
});

export default Canvas2D;