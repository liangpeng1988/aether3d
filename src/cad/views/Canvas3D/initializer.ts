import { Viewport } from '../../../../Engine/interface/Viewport';
import { THREE } from "../../../../Engine/core/global";
import { Aether3d } from '../../../../Engine';
import { BlenderCameraControlsScript } from '../../../../Engine/controllers';
import { EnvironmentMapScript } from '../../../../Engine';
import { GLBLoaderScript } from '../../../../Engine';
import { CSS2DLabelScript } from '../../../../Engine';
import { FPSOptimizerScript } from "../../../../Engine";
import { AlignmentController } from "../../../../Engine/alignment";
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { OutlineEffectScript } from '../../../../Engine/controllers/OutlineEffectScript';
import { EdgeSelectionScript } from '../../../../Engine/controllers/EdgeSelectionScript';
import { VertexSelectionScript } from '../../../../Engine/controllers/VertexSelectionScript';
import { FaceSelectionScript } from '../../../../Engine/controllers/FaceSelectionScript';
import { Document as CADDocument } from '../../data/Document';
import { DefaultConfig } from '../../controllers/DefaultConfig';
import { VertexManipulationController } from '../../../../Engine/controllers/VertexManipulationController';

/**
 * 创建视口配置
 */
export const createViewportConfig = (
  canvasElement: HTMLCanvasElement,
  containerWidth: number,
  containerHeight: number,
  backgroundColor: string
): Viewport => {
  return {
    element: canvasElement,
    dpr: new THREE.Vector2(containerWidth, containerHeight),
    antialias: true,
    factor: 1,
    distance: 5,
    alpha: false,
    aspect: containerWidth / containerHeight,
    enablePostProcessing: false,
    enableLogarithmicDepthBuffer: false,
    enablePerformanceMonitoring: true,
    backgroundColor: backgroundColor,
    // 添加鼠标交互配置
    mouseInteraction: {
      interactionMode: 'both',
      enabled: true
    }
  };
};

/**
 * 初始化引擎和相关脚本
 */
export const initializeEngine = (
  engine: Aether3d,
  showFPS: boolean,
  updateFps: (newFps: number) => void,
  cameraPosition: [number, number, number],
  cameraTarget: [number, number, number]
) => {
  // 监听FPS事件
  if (showFPS) {
    engine.on('performance:fps', (data) => {
      updateFps(data.fps);
    });
  }

  // 设置相机位置和目标点
  engine.camera.position.set(...cameraPosition);
  engine.camera.lookAt(...cameraTarget);
};

/**
 * 初始化相机控制器
 */
export const initializeCameraControls = (
  engine: Aether3d,
  cameraTarget: [number, number, number]
): BlenderCameraControlsScript => {
  const blenderControlsScript = new BlenderCameraControlsScript({
    enableDamping: false,
    dampingFactor: 0.05,
    rotateSpeed: 1.0,
    zoomSpeed: 1.2,
    panSpeed: 1.0,
    minDistance: 0.1,
    maxDistance: 500000,
    enableRotate: true,
    enableZoom: true,
    enablePan: true,
    enableKeys: true
  });
  
  // 设置相机目标点
  blenderControlsScript.setTarget(new THREE.Vector3(...cameraTarget));
  engine.addScript(blenderControlsScript);
  
  return blenderControlsScript;
};

/**
 * 初始化环境贴图脚本
 */
export const initializeEnvironmentMap = (engine: Aether3d): EnvironmentMapScript => {
  const environmentMapScript = new EnvironmentMapScript({
    hdrPath: '/hdr/0a200fbabae59dc8151768d9cc4c1c96.hdr',
    envPreset: 'hdr',
    enabled: true,
    envMapIntensity: 3,
    toneMapping: 'ACESFilmic',
    toneMappingExposure: 2.0,
    backgroundBlurriness: 1,
    backgroundIntensity: 2.0,
    environmentIntensity: 2,
    showBackground: false,
    originalBackground: new THREE.Color(0x333333),
  });
  engine.addScript(environmentMapScript as EnvironmentMapScript);
  
  return environmentMapScript;
};

/**
 * 初始化GLB加载器脚本
 */
export const initializeGLBLoader = (engine: Aether3d): GLBLoaderScript => {
  const glbLoaderScript = new GLBLoaderScript({
    enableDraco: true,
    autoAddToScene: true
  });
  engine.addScript(glbLoaderScript);
  
  return glbLoaderScript;
};

/**
 * 初始化CSS2D标签脚本
 */
export const initializeCSS2DLabel = (
  engine: Aether3d,
  canvasElement: HTMLCanvasElement
): CSS2DLabelScript => {
  const css2dLabelScript = new CSS2DLabelScript({
    container: canvasElement.parentElement || document.body,
    autoResize: true,
    zIndex: 1000,
    enabled: true
  });
  engine.addScript(css2dLabelScript);
  
  return css2dLabelScript;
};

/**
 * 初始化FPS优化脚本
 */
export const initializeFPSOptimizer = (engine: Aether3d): FPSOptimizerScript => {
  const fpsOptimizerScript = new FPSOptimizerScript({
    targetFps: 60,
    adaptiveOptimization: true,
    maxObjects: 1000000,
  });
  engine.addScript(fpsOptimizerScript);
  
  return fpsOptimizerScript;
};

/**
 * 初始化对齐控制器
 */
export const initializeAlignmentController = (
  engine: Aether3d
): AlignmentController => {
  const alignmentController = new AlignmentController(
    engine.scene,
    engine.camera,
    engine.renderer
  );
  engine.addScript(alignmentController);
  
  return alignmentController;
};

/**
 * 初始化Outline效果脚本
 */
export const initializeOutlineEffect = (engine: Aether3d): OutlineEffectScript => {
  const outlineEffectScript = new OutlineEffectScript([], 3.0, 0.0, 1.0, 0);
  engine.addScript(outlineEffectScript);
  
  return outlineEffectScript;
};

/**
 * 初始化EdgeSelection脚本
 */
export const initializeEdgeSelection = (engine: Aether3d): EdgeSelectionScript => {
  const edgeSelectionScript = new EdgeSelectionScript({
    edgeColor: 0xffff00, // 黄色边线
    edgeWidth: 2,
    showHiddenEdges: true,
    hiddenEdgeColor: 0x888888
  });
  engine.addScript(edgeSelectionScript);
  
  return edgeSelectionScript;
};

/**
 * 初始化VertexSelection脚本
 */
export const initializeVertexSelection = (engine: Aether3d): VertexSelectionScript => {
  const vertexSelectionScript = new VertexSelectionScript({
    vertexColor: 0xff0000, // 红色顶点
    vertexSize: 0.1,
    showHiddenVertices: true,
    hiddenVertexColor: 0x888888
  });
  engine.addScript(vertexSelectionScript);
  
  return vertexSelectionScript;
};

/**
 * 初始化FaceSelection脚本
 */
export const initializeFaceSelection = (engine: Aether3d): FaceSelectionScript => {
  const faceSelectionScript = new FaceSelectionScript({
    faceColor: 0x00ff00, // 绿色面
    faceOpacity: 0.3,
    showHiddenFaces: true,
    hiddenFaceColor: 0x888888,
    edgeColor: 0x000000,
    edgeWidth: 1
  });
  engine.addScript(faceSelectionScript);
  
  return faceSelectionScript;
};

/**
 * 初始化TransformControls
 */
export const initializeTransformControls = (
  engine: Aether3d,
  onTransformChange: ((object: THREE.Object3D) => void) | undefined,
  blenderControlsScript: BlenderCameraControlsScript | null
): TransformControls => {
  const transformControls = new TransformControls(engine.camera, engine.renderer.domElement);
  
  // 设置 TransformControls 尺寸为更小的值
  transformControls.setSize(0.5); // 默认是1，设置为0.5使其更小
  
  // 配置 TransformControls - 默认不激活任何模式，直到用户明确选择
  transformControls.setSpace('world'); // 使用世界坐标系
  transformControls.showX = true; // 显示 X 轴
  transformControls.showY = true; // 显示 Y 轴
  transformControls.showZ = true; // 显示 Z 轴
  transformControls.enabled = true; // 启用控制器
  
  // 监听拖拽事件
  transformControls.addEventListener('dragging-changed', (event) => {
    // 拖拽时禁用相机控制
    if (blenderControlsScript) {
      if (event.value) {
        blenderControlsScript.disable();
      } else {
        blenderControlsScript.enable();
      }
    }
  });
  
  // 监听对象变化事件 - 实时通知属性面板更新
  transformControls.addEventListener('objectChange', () => {
    if (transformControls.object && onTransformChange) {
      // 触发回调，通知外部组件更新
      onTransformChange(transformControls.object);
    }
  });
  
  // 将 TransformControls 添加到引擎中
  engine.addScript({
    name: 'TransformControlsScript',
    update: () => {
      // 每帧更新TransformControls
      (transformControls as any).updateMatrixWorld();
    }
  } as any);
  
  return transformControls;
};

/**
 * 初始化VertexManipulationController
 */
export const initializeVertexManipulationController = (engine: Aether3d): VertexManipulationController => {
  const vertexManipulationController = new VertexManipulationController();
  engine.addScript(vertexManipulationController);
  
  return vertexManipulationController;
};

/**
 * 添加默认对象到场景
 */
export const addDefaultObjectsToScene = (
  engine: Aether3d,
  cadDocument: CADDocument,
  showGrid: boolean,
  showAxes: boolean,
  transformHelper: THREE.Object3D,
  gridRef?: React.MutableRefObject<THREE.Group | null> // 添加gridRef参数
) => {
  // 创建默认立方体
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cubeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xF0F0F0,
    roughness: 0.5,
    metalness: 0.5
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(0, 0.5, 0);
  cube.name = 'DefaultCube';
  cube.castShadow = true;
  cube.receiveShadow = true;
  // 为默认立方体设置用户数据，包括图层信息
  cube.userData = { 
    ...cube.userData, 
    layerId: 'layer1',
    isSystemObject: false 
  };
  
  // 为默认立方体创建元数据
  const metadataManager = cadDocument.getMetadataManager();
  const cubeMetadata = metadataManager.createObjectMetadata(
    cube, 
    'DefaultCube', 
    'Mesh'
  );
  cubeMetadata.layerId = 'layer1';
  console.log(`[Canvas3D] 为DefaultCube创建元数据: ID=${cubeMetadata.id}, 图层ID=layer1`);
  
  engine.scene.add(cube);

  // 添加网格
  if (showGrid) {
    // 创建仿Blender风格的网格 - 使用更接近Blender默认的颜色和适合CAD的尺寸
    const blenderGrid = new THREE.GridHelper(200, 200, 0x444444, 0x888888);
    // 为网格设置用户数据，包括图层信息
    blenderGrid.userData = { 
      ...blenderGrid.userData, 
      layerId: 'layer0',
      isSystemObject: true 
    };
    
    // 为网格创建元数据
    const gridMetadata = metadataManager.createObjectMetadata(
      blenderGrid, 
      'GridHelper', 
      'GridHelper'
    );
    gridMetadata.layerId = 'layer0';
    console.log(`[Canvas3D] 为GridHelper创建元数据: ID=${gridMetadata.id}, 图层ID=layer0`);
    
    engine.scene.add(blenderGrid);
  }

  // 将 TransformControls 的辅助对象添加到场景
  transformHelper.name = 'TransformControlsHelper'; // 标记名称以便排除
  // 为TransformControls辅助对象设置用户数据，包括图层信息
  transformHelper.userData = { 
    ...transformHelper.userData, 
    layerId: 'layer0',
    isSystemObject: true 
  };
  
  // 确保TransformControls的所有子对象也被正确标记
  const setLayerForTransformControls = (obj: THREE.Object3D) => {
    if (!obj.userData) {
      obj.userData = {};
    }
    obj.userData.layerId = 'layer0';
    obj.userData.isSystemObject = true;
    
    // 递归处理所有子对象
    obj.children.forEach(child => {
      setLayerForTransformControls(child);
    });
  };
  
  // 为TransformControls及其所有子对象设置图层
  setLayerForTransformControls(transformHelper);
  
  // 为TransformControls创建元数据并添加到场景
  const transformMetadata = metadataManager.createObjectMetadata(
    transformHelper, 
    'TransformControls', 
    'TransformControls'
  );
  transformMetadata.layerId = 'layer0';
  console.log(`[Canvas3D] 为TransformControls创建元数据: ID=${transformMetadata.id}, 图层ID=layer0`);
  
  engine.scene.add(transformHelper);
};

/**
 * 添加默认线数据到文档
 */
export const addDefaultLinesToDocument = (document: CADDocument) => {
  // 确保至少有一个默认图层
  // 由于图层管理已移至LayerController，这里不再直接检查文档中的图层
  // 图层将在MainLayout中初始化
  
  // 添加几条默认线条作为示例，并分配到图层一
//   DefaultConfig.DEFAULT_LINES.forEach(line => {
//     document.addLine(line);
//   });
  
//   // 添加默认3D Cube并分配到图层一
//   document.addModel(DefaultConfig.DEFAULT_CUBE);
  
  console.log('默认线数据和3D Cube已添加到文档');
};