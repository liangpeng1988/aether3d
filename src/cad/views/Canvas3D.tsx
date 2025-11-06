import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { Aether3d } from '../../../Engine';
import { THREE } from "../../../Engine/core/global";
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { Document as CADDocument } from '../data/Document';
import { CallbackManager } from '../controllers/CallbackManager';
import { EdgeSelectionScript } from '../../../Engine/controllers/EdgeSelectionScript';
import { VertexSelectionScript } from '../../../Engine/controllers/VertexSelectionScript';
import { FaceSelectionScript } from '../../../Engine/controllers/FaceSelectionScript';
import { VertexManipulationController } from '../../../Engine/controllers/VertexManipulationController'; // 添加VertexManipulationController导入
import { MeasurementUtils } from '../../../Engine/utils/MeasurementUtils';

// 导入拆分的模块
import { Canvas3DProps, Canvas3DHandle, UseCanvas3DState, MoveDistanceInfo } from './Canvas3D/types';
import { calculateSceneStats, updateFpsValue, SceneStats } from './Canvas3D/utils';
import { handleDropCreateObject, handleDrawCreateLine, addDefaultLinesToDocument } from './Canvas3D/dragAndDrop';
import { 
  createViewportConfig,
  initializeEngine,
  initializeCameraControls,
  initializeEnvironmentMap,
  initializeGLBLoader,
  initializeCSS2DLabel,
  initializeFPSOptimizer,
  initializeAlignmentController,
  initializeOutlineEffect,
  initializeEdgeSelection,
  initializeVertexSelection,
  initializeFaceSelection,
  initializeVertexManipulationController, // 添加VertexManipulationController初始化导入
  initializeTransformControls,
  addDefaultObjectsToScene,
  addDefaultLinesToDocument as addDefaultLinesToDocumentInit,
} from './Canvas3D/initializer';
import { 
  handleObjectSelected,
  handleKeyDown,
  handleWindowResize,
  handleContextMenu
} from './Canvas3D/eventHandlers';
import { cleanup } from './Canvas3D/cleanup';
import { createCanvas3DHandle } from './Canvas3D/canvas3DHandle';
import HierarchicalMenu from '../UI/HierarchicalMenu';
import Toolbar3D from '../UI/Toolbar3D';

const Canvas3D = forwardRef<Canvas3DHandle, Canvas3DProps>((props, ref) => {
  const { 
    width = "100%", 
    height = "100%", 
    backgroundColor = "#222222",
    showGrid = true,
    showAxes = true,
    cameraPosition = [5, 5, 5],
    cameraTarget = [0, 0, 0],
    onSceneReady,
    onObjectSelected,
    onObjectHovered,
    showFPS = true,
    onTransformChange,
    onDrawLine,
    onDrawCircle,
    onDrawRectangle,
    onDrawPolygon,
    onUploadModel,
    onOpenLayerManager,
    onTranslate,
    onRotate,
    onScale,
    onSelect,
    activeTool
  } = props;
  
  // 引用
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!); // 添加containerRef定义
  const rendererRef = useRef<Aether3d | null>(null);
  const environmentMapScriptRef = useRef<any | null>(null);
  const glbLoaderScriptRef = useRef<any | null>(null);
  const blenderControlsScriptRef = useRef<any | null>(null);
  const alignmentControllerRef = useRef<any | null>(null);
  const fogRef = useRef<THREE.Fog | null>(null);
  const fpsOptimizerScriptRef = useRef<any | null>(null);
  const css2dLabelScriptRef = useRef<any | null>(null);
  const outlineEffectScriptRef = useRef<any | null>(null);
  const edgeSelectionScriptRef = useRef<EdgeSelectionScript | null>(null);
  const vertexSelectionScriptRef = useRef<VertexSelectionScript | null>(null);
  const faceSelectionScriptRef = useRef<FaceSelectionScript | null>(null);
  const vertexManipulationControllerRef = useRef<VertexManipulationController | null>(null); // 添加顶点操作控制器引用
  const objectSelected = useRef<THREE.Object3D | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const transformControlsCleanupRef = useRef<(() => void) | null>(null); // 添加TransformControls清理函数引用
  const gridRef = useRef<THREE.Group | null>(null); // 添加网格引用
  const lastCameraDistanceRef = useRef<number>(0); // 添加相机距离缓存

  // 回调函数引用
  const onSceneReadyRef = useRef(onSceneReady);
  const onObjectSelectedRef = useRef(onObjectSelected);
  const onObjectHoveredRef = useRef(onObjectHovered);
  const onTransformChangeRef = useRef(onTransformChange);
  const onTransformSpaceChangeRef = useRef(props.onTransformSpaceChange);
  
  // 状态
  const [fps, setFps] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [sceneStats, setSceneStats] = useState<SceneStats>({
    objects: 0,
    triangles: 0,
    vertices: 0,
    materials: 0,
    textures: 0
  });
  
  // 移动距离状态
  const [moveDistanceInfo, setMoveDistanceInfo] = useState<MoveDistanceInfo>({
    isMoving: false,
    distance: 0,
    startPosition: null,
    currentPosition: null
  });
  
  // 强制更新函数，用于确保UI刷新
  const [, forceUpdate] = useState({});
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);
  
  // 尺寸引用
  const lastSizeRef = useRef({ width: 0, height: 0 });
  const cameraPositionRef = useRef(cameraPosition);
  const cameraTargetRef = useRef(cameraTarget);
  
  // 更新相机配置缓存
  useEffect(() => {
    if (JSON.stringify(cameraPositionRef.current) !== JSON.stringify(cameraPosition)) {
      cameraPositionRef.current = cameraPosition;
    }
    if (JSON.stringify(cameraTargetRef.current) !== JSON.stringify(cameraTarget)) {
      cameraTargetRef.current = cameraTarget;
    }
  }, [cameraPosition, cameraTarget]);

  // 更新回调函数引用
  useEffect(() => {
    CallbackManager.updateCallbackRefs(
      {
        onSceneReadyRef,
        onObjectSelectedRef,
        onObjectHoveredRef,
        onTransformChangeRef,
        onTransformSpaceChangeRef
      },
      {
        onSceneReady,
        onObjectSelected,
        onObjectHovered,
        onTransformChange,
        onTransformSpaceChange: props.onTransformSpaceChange
      }
    );
  }, [onSceneReady, onObjectSelected, onObjectHovered, onTransformChange, props.onTransformSpaceChange]);

  // 使用useCallback优化FPS更新函数
  const updateFps = useCallback((newFps: number) => {
    setFps(prevFps => updateFpsValue(prevFps, newFps));
  }, []);

  // 计算场景统计信息
  const updateSceneStats = useCallback(() => {
    if (!rendererRef.current) return;
    const stats = calculateSceneStats(rendererRef.current.scene);
    setSceneStats(stats);
  }, []);

  // 处理拖放事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    try {
      // 获取拖放的模型数据
      const modelData = e.dataTransfer.getData('application/json');
      if (!modelData) return;

      const model = JSON.parse(modelData);
      console.log('拖放模型到场景:', model);

      // 计算放置位置（场景中心或鼠标位置）
      const dropPosition = new THREE.Vector3(0, 0.5, 0); // 默认放置在场景中心

      // 处理拖放创建的对象
      handleDropCreateObject(model, dropPosition, rendererRef, glbLoaderScriptRef);
    } catch (error) {
      console.error('处理拖放数据失败:', error);
    }
  }, []);

  // 处理右键菜单事件
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // 获取父容器尺寸
    const container = canvasRef.current.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // 创建视口配置
    const viewportConfig = createViewportConfig(
      canvasRef.current,
      containerWidth,
      containerHeight,
      backgroundColor
    );

    // 创建 CADDocument
    const cadDocument = new CADDocument('CAD场景');
    
    // 创建渲染器，并替换其场景为 CADDocument
    const engine = new Aether3d(viewportConfig);
    engine.scene = cadDocument;
    rendererRef.current = engine;
    
    // 添加默认线数据到文档并在场景中同步
    addDefaultLinesToDocumentInit(cadDocument);
    setTimeout(() => {
      cadDocument.syncAllEntitiesToScene({ glbLoader: glbLoaderScriptRef.current });
    }, 100);
    
    // 初始化引擎
    initializeEngine(engine, showFPS, updateFps, cameraPositionRef.current, cameraTargetRef.current);
    
    // 初始化相机控制器
    blenderControlsScriptRef.current = initializeCameraControls(engine, cameraTargetRef.current);

    // 初始化各种脚本
    environmentMapScriptRef.current = initializeEnvironmentMap(engine);
    glbLoaderScriptRef.current = initializeGLBLoader(engine);
    css2dLabelScriptRef.current = initializeCSS2DLabel(engine, canvasRef.current);
    fpsOptimizerScriptRef.current = initializeFPSOptimizer(engine);
    alignmentControllerRef.current = initializeAlignmentController(engine);
    outlineEffectScriptRef.current = initializeOutlineEffect(engine);
    edgeSelectionScriptRef.current = initializeEdgeSelection(engine);
    vertexSelectionScriptRef.current = initializeVertexSelection(engine);
    faceSelectionScriptRef.current = initializeFaceSelection(engine);
    vertexManipulationControllerRef.current = initializeVertexManipulationController(engine); // 添加顶点操作控制器初始化
    // 初始化 TransformControls
    transformControlsRef.current = initializeTransformControls(
      engine,
      onTransformChange,
      blenderControlsScriptRef.current
    );
    
    // 添加TransformControls事件监听器用于距离测量
    if (transformControlsRef.current) {
      // 拖拽开始时记录起始位置
      const handleDraggingChanged = (event: any) => {
        if (event.value) {
          // 开始拖拽
          if (transformControlsRef.current && transformControlsRef.current.object) {
            const object = transformControlsRef.current.object;
            const startPosition = object.position.clone();
            setMoveDistanceInfo({
              isMoving: true,
              distance: 0,
              startPosition: startPosition,
              currentPosition: startPosition.clone()
            });
            
            // 触发强制更新以确保UI刷新
            triggerUpdate();
          }
        } else {
          // 结束拖拽 - 保持当前状态，不重置
          // 只是隐藏距离显示
          setMoveDistanceInfo(prev => ({
            ...prev,
            isMoving: false
          }));
          
          // 触发强制更新以确保UI刷新
          triggerUpdate();
        }
      };
      
      // 拖拽过程中更新位置和距离
      const handleObjectChange = () => {
        if (transformControlsRef.current && transformControlsRef.current.object) {
          const object = transformControlsRef.current.object;
          const currentPosition = object.position.clone();
          
          // 计算移动距离
          let distance = 0;
          const startPosition = moveDistanceInfo.startPosition; // 获取当前状态的起始位置
          if (startPosition) {
            distance = MeasurementUtils.calculateDistance(startPosition, currentPosition);
          }
          
          setMoveDistanceInfo(prev => ({
            ...prev,
            distance: distance,
            currentPosition: currentPosition
          }));
          
          // 触发强制更新以确保UI刷新
          triggerUpdate();
        }
      };
      
      transformControlsRef.current.addEventListener('dragging-changed', handleDraggingChanged);
      transformControlsRef.current.addEventListener('objectChange', handleObjectChange);
      
      // 存储清理函数以便在useEffect清理时使用
      transformControlsCleanupRef.current = () => {
        transformControlsRef.current!.removeEventListener('dragging-changed', handleDraggingChanged);
        transformControlsRef.current!.removeEventListener('objectChange', handleObjectChange);
      };
    }
    
    // 将 TransformControls 的辅助对象添加到场景
    const transformHelper = transformControlsRef.current ? (transformControlsRef.current as any).getHelper() : null;
    
    // 添加默认对象到场景
    addDefaultObjectsToScene(engine, cadDocument, showGrid, showAxes, transformHelper, gridRef);
    
    // 使用MouseInteractionScript的图层排除机制来隔离图层0的对象
    setTimeout(() => {
      const mouseInteractionScript = engine.getMouseInteractionScript();
      if (mouseInteractionScript) {
        // 添加图层0到排除列表，这样网格和TransformControls不会被选择
        mouseInteractionScript.addExcludedLayer('layer0');
        const excludedLayers = mouseInteractionScript.getExcludedLayers();
        console.log('[Canvas3D] 当前排除的图层:', excludedLayers);
      } else {
        console.warn('[Canvas3D] MouseInteractionScript未找到');
      }
    }, 0);

    // 同步文档中的所有实体到场景
    setTimeout(() => {
      if (glbLoaderScriptRef.current) {
        cadDocument.syncAllEntitiesToScene({ glbLoader: glbLoaderScriptRef.current });
      }
    }, 100);

    // 监听鼠标交互事件
    engine.on('mouse:objectSelected', (data) => {
      // 处理对象选择事件
      handleObjectSelected(
        data,
        objectSelected,
        onObjectSelectedRef,
        outlineEffectScriptRef,
        transformControlsRef,
        edgeSelectionScriptRef,
        vertexSelectionScriptRef,
        faceSelectionScriptRef,
        selectionMode
      );
    });

    // 启动渲染循环
    engine.start();
    
    // 通知场景准备就绪
    CallbackManager.invokeOnSceneReady(onSceneReadyRef, engine);

    // 定时更新场景统计信息
    const statsInterval = setInterval(() => {
      updateSceneStats();
    }, 2000);
    
    // 初始化时立即更新一次
    setTimeout(() => updateSceneStats(), 500);

    // 监听键盘事件
    const keyDownHandler = (event: KeyboardEvent) => {
      handleKeyDown(
        event,
        transformControlsRef,
        objectSelected,
        onObjectSelectedRef,
        outlineEffectScriptRef
      );
    };
    
    window.addEventListener('keydown', keyDownHandler);

    // 添加右键菜单阻止事件监听器
    const contextMenuHandler = (event: MouseEvent) => {
      handleContextMenu(event as unknown as React.MouseEvent);
    };
    
    canvasRef.current.addEventListener('contextmenu', contextMenuHandler);

    // 窗口大小调整
    const resizeHandler = () => {
      handleWindowResize(rendererRef, lastSizeRef, container);
    };

    window.addEventListener('resize', resizeHandler);
    
    // 添加ResizeObserver监听容器尺寸变化
    let resizeObserver: ResizeObserver | null = null;
    let resizeTimeout: NodeJS.Timeout | null = null;
    
    if (container) {
      resizeObserver = new ResizeObserver(() => {
        // 清除之前的定时器
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        
        // 立即执行尺寸调整
        resizeHandler();
      });
      resizeObserver.observe(container);
    }

    // 清理函数
    return () => {
      // 清理TransformControls事件监听器
      if (transformControlsCleanupRef.current) {
        transformControlsCleanupRef.current();
        transformControlsCleanupRef.current = null;
      }
      
      cleanup(
        statsInterval,
        resizeTimeout,
        resizeHandler,
        keyDownHandler,
        resizeObserver,
        container,
        contextMenuHandler,
        canvasRef,
        transformControlsRef,
        outlineEffectScriptRef,
        engine
      );
    };
  }, [showFPS, updateFps, backgroundColor, showGrid, showAxes, updateSceneStats]);

  // 添加状态来跟踪选择模式
  const [selectionMode, setSelectionMode] = useState<'object' | 'vertex' | 'edge' | 'face'>('object');

  // 添加工具栏按钮的回调函数
  const handleVertexSelect = useCallback(() => {
    setSelectionMode('vertex');
    if (props.onVertexSelect) props.onVertexSelect();
  }, [props.onVertexSelect]);

  const handleEdgeSelect = useCallback(() => {
    setSelectionMode('edge');
    if (props.onEdgeSelect) props.onEdgeSelect();
  }, [props.onEdgeSelect]);

  const handleFaceSelect = useCallback(() => {
    setSelectionMode('face');
    if (props.onFaceSelect) props.onFaceSelect();
  }, [props.onFaceSelect]);

  // 实现Canvas3DHandle接口
  useImperativeHandle(ref, () => ({
    ...createCanvas3DHandle(
      rendererRef,
      blenderControlsScriptRef,
      transformControlsRef,
      glbLoaderScriptRef,
      vertexManipulationControllerRef // 添加顶点操作控制器引用
    ),
    // 添加获取FaceSelectionScript的方法
    getFaceSelectionScript: () => faceSelectionScriptRef.current
  }));

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: backgroundColor,
        overflow: 'hidden', /* 防止内容溢出 */
        transition: 'width 0.3s ease, height 0.3s ease', /* 添加平滑过渡效果 */
      }}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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
      
      {/* 工具箱 - 3D视图顶部 */}
      <Toolbar3D 
        onTranslate={props.onTranslate}
        onRotate={props.onRotate}
        onScale={props.onScale}
        onSelect={props.onSelect}
        onVertexSelect={handleVertexSelect}
        onEdgeSelect={handleEdgeSelect}
        onFaceSelect={handleFaceSelect}
        activeTool={props.activeTool}
      />
      
      {/* 场景统计信息 */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 70, // 60px是工具箱的宽度，留10px间距
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '6px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 2,
        transition: 'all 0.3s ease', /* 添加平滑过渡效果 */
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#4CAF50' }}>场景统计</div>
        <div>对象数: {sceneStats.objects}</div>
        <div>三角面: {sceneStats.triangles.toLocaleString()}</div>
        <div>顶点数: {sceneStats.vertices.toLocaleString()}</div>
        <div>材质数: {sceneStats.materials}</div>
        <div>纹理数: {sceneStats.textures}</div>
        {showFPS && (
          <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #444' }}>
            FPS: {fps}
          </div>
        )}
      </div>

      {/* 移动距离显示 */}
      {moveDistanceInfo.isMoving && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px 15px',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '14px',
          zIndex: 2,
          textAlign: 'center',
          transition: 'all 0.3s ease', /* 添加平滑过渡效果 */
        }}>
          移动距离: {moveDistanceInfo.distance.toFixed(3)}
        </div>
      )}
    </div>
  );
});

// 添加公共方法来访问GLB加载器
export const getGLBLoaderFromCanvas3D = (canvas3DRef: React.RefObject<any>) => {
  if (canvas3DRef.current && canvas3DRef.current.getGLBLoader) {
    return canvas3DRef.current.getGLBLoader();
  }
  return null;
};

// 添加公共方法来访问FaceSelectionScript
export const getFaceSelectionScriptFromCanvas3D = (canvas3DRef: React.RefObject<any>) => {
  if (canvas3DRef.current && canvas3DRef.current.getFaceSelectionScript) {
    return canvas3DRef.current.getFaceSelectionScript();
  }
  return null;
};

export default Canvas3D;