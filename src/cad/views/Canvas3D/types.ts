import { Aether3d } from '../../../../Engine';
import { Viewport } from '../../../../Engine/interface/Viewport';
import {THREE} from "../../../../Engine/core/global";
import type {PointLightConfig} from "../../../../Engine";
import { BlenderCameraControlsScript } from '../../../../Engine/controllers';
import { GLBLoaderScript } from '../../../../Engine';
import { Document as CADDocument, ModelData } from '../../data/Document';
import { EdgeSelectionScript } from '../../../../Engine/controllers/EdgeSelectionScript'; // 添加EdgeSelectionScript导入
import { VertexManipulationController } from '../../../../Engine/controllers/VertexManipulationController'; // 添加VertexManipulationController导入

export interface Canvas3DProps {
  /** Canvas宽度 */
  width?: string;
  /** Canvas高度 */
  height?: string;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 是否显示网格 */
  showGrid?: boolean;
  /** 是否显示坐标轴 */
  showAxes?: boolean;
  /** 相机位置 */
  cameraPosition?: [number, number, number];
  /** 相机目标点 */
  cameraTarget?: [number, number, number];
  /** 场景准备就绪时的回调函数 */
  onSceneReady?: (renderer: Aether3d) => void;
  /** 对象选中时的回调函数 */
  onObjectSelected?: (object: THREE.Object3D | null) => void;
  /** 对象悬停时的回调函数 */
  onObjectHovered?: (object: THREE.Object3D | null) => void;
  /** 点光源配置数组 */
  pointLights?: PointLightConfig[];
  /** 点光源配置变更时的回调函数 */
  onPointLightsChange?: (lights: PointLightConfig[]) => void;
  /** 是否显示FPS信息 */
  showFPS?: boolean;
  /** FPS更新时的回调函数 */
  updateFps?: (newFps: number) => void;
  /** 场景统计信息更新时的回调函数 */
  updateSceneStats?: (stats: SceneStats) => void;
  /** 对象变换变化时的回调函数 */
  onTransformChange?: (object: THREE.Object3D) => void;
  /** TransformControls 坐标系变化时的回调函数 */
  onTransformSpaceChange?: (space: 'world' | 'local') => void;
  /** 绘制直线的回调函数 */
  onDrawLine?: () => void;
  /** 绘制圆的回调函数 */
  onDrawCircle?: () => void;
  /** 绘制矩形的回调函数 */
  onDrawRectangle?: () => void;
  /** 绘制多边形的回调函数 */
  onDrawPolygon?: () => void;
  /** 上传模型的回调函数 */
  onUploadModel?: () => void;
  /** 打开图层管理器的回调函数 */
  onOpenLayerManager?: () => void;
  /** 移动工具的回调函数 */
  onTranslate?: () => void;
  /** 旋转工具的回调函数 */
  onRotate?: () => void;
  /** 缩放工具的回调函数 */
  onScale?: () => void;
  /** 选择工具的回调函数 */
  onSelect?: () => void;
  /** 顶点选择工具的回调函数 */
  onVertexSelect?: () => void;
  /** 边选择工具的回调函数 */
  onEdgeSelect?: () => void;
  /** 面选择工具的回调函数 */
  onFaceSelect?: () => void;
  /** 当前激活的工具 */
  activeTool?: 'translate' | 'rotate' | 'scale' | 'select' | 'vertex' | 'edge' | 'face';
}

export interface Canvas3DHandle {
  /** 获取渲染器实例 */
  getRenderer: () => Aether3d | null;
  /** 获取Blender相机控制器 */
  getBlenderControls: () => BlenderCameraControlsScript | null;
  /** 聚焦到指定对象 */
  focusOnObject: (object: THREE.Object3D) => void;
  /** 设置相机到默认视角 */
  setCameraToDefault: () => void;
  /** 启用或禁用相机控制 */
  enableCameraControls: (enabled: boolean) => void;
  /** 更新相机控制配置 */
  updateCameraControlsConfig: (config: any) => void;
  /** 设置相机缩放距离限制 */
  setCameraZoomLimits: (minDistance: number, maxDistance: number) => void;
  /** 强制重新调整Canvas大小 */
  forceResize: () => void;
  /** 更新对象变换属性 */
  updateObjectTransform: (object: THREE.Object3D, property: string, value: any) => void;
  /** 设置 TransformControls 模式 */
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  /** 切换 TransformControls 坐标系 */
  toggleTransformSpace: () => 'world' | 'local';
  /** 获取当前 TransformControls 坐标系 */
  getTransformSpace: () => 'world' | 'local';
  /** 附加 TransformControls 到对象 */
  attachTransformControls: (object: THREE.Object3D) => void;
  /** 获取当前文档实例 */
  getDocument: () => CADDocument | null;
  /** 获取GLB加载器实例 */
  getGLBLoader: () => GLBLoaderScript | null;
  /** 获取顶点操作控制器实例 */
  getVertexManipulationController: () => VertexManipulationController | null;
}

export interface SceneStats {
  objects: number;
  triangles: number;
  vertices: number;
  materials: number;
  textures: number;
}

export interface UseCanvas3DState {
  /** Canvas元素的引用，用于挂载Three.js渲染器 */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Aether3D渲染器实例引用 */
  rendererRef: React.RefObject<Aether3d | null>;
  /** 环境贴图脚本实例引用 */
  environmentMapScriptRef: React.RefObject<any | null>;
  /** 已加载的模型对象引用 */
  glbLoaderScriptRef: React.RefObject<GLBLoaderScript | null>;
  /** 场景相机控制 */
  blenderControlsScriptRef: React.RefObject<BlenderCameraControlsScript | null>;
  /** 对齐控制器 */
  alignmentControllerRef: React.RefObject<any | null>;
  /** 雾效对象引用 */
  fogRef: React.RefObject<THREE.Fog | null>;
  /** FPS优化脚本实例引用 */
  fpsOptimizerScriptRef: React.RefObject<any | null>;
  /** CSS2D标签脚本实例引用 */
  css2dLabelScriptRef: React.RefObject<any | null>;
  /** Outline效果脚本实例引用 */
  outlineEffectScriptRef: React.RefObject<any | null>;
  /** EdgeSelection脚本实例引用 */
  edgeSelectionScriptRef: React.RefObject<EdgeSelectionScript | null>;
  /** 选中的对象引用 */
  objectSelected: React.RefObject<THREE.Object3D | null>;
  /** TransformControls 实例引用 */
  transformControlsRef: React.RefObject<any | null>;
}

// 添加移动距离信息接口
export interface MoveDistanceInfo {
  /** 是否正在移动 */
  isMoving: boolean;
  /** 移动距离 */
  distance: number;
  /** 起始位置 */
  startPosition: THREE.Vector3 | null;
  /** 当前位置 */
  currentPosition: THREE.Vector3 | null;
}