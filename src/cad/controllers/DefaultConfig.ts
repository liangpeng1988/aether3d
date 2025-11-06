import { ModelData } from '../data/Document';
/**
 * 默认配置类
 * 包含系统初始化时使用的所有默认配置
 */
export class DefaultConfig {
  // 默认图层配置
  public static readonly DEFAULT_LAYERS = [
    {
      id: 'layer0',
      name: '默认图层',
      color: '#808080',
      visible: false,
      locked: false
    },
    {
      id: 'layer1',
      name: '图层一',
      color: '#ffffff',
      visible: true,
      locked: false
    }
  ];
  
  // 默认线条配置
  public static readonly DEFAULT_LINES = [
    {
      id: 'line_default_1',
      points: [
        { x: -10, y: 10, z: 10 },
        { x: 1, y: 0, z: 0 }
      ],
      color: '#FF0000',
      width: 20,
      layerId: 'layer1'
    },
    {
      id: 'line_default_2',
      points: [
        { x: 0, y: -1, z: 0 },
        { x: 0, y: 1, z: 0 }
      ],
      color: '#00FF00',
      width: 2,
      layerId: 'layer1'
    },
    {
      id: 'line_default_3',
      points: [
        { x: 0, y: 0, z: -1 },
        { x: 0, y: 0, z: 1 }
      ],
      color: '#0000FF',
      width: 2,
      layerId: 'layer1'
    }
  ];
  
  // 默认立方体配置
  public static readonly DEFAULT_CUBE: ModelData = {
    id: 'cube_default_1',
    name: '默认立方体',
    filePath: '',
    type: 'cube',
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    visible: true,
    layerId: 'layer1'
  };
  
  // 默认相机配置
  public static readonly DEFAULT_CAMERA = {
    position: [5, 5, 5],
    target: [0, 0, 0]
  };
  
  // 默认视口配置
  public static readonly DEFAULT_VIEWPORT = {
    antialias: true,
    factor: 1,
    distance: 5,
    alpha: false,
    enablePostProcessing: false,
    enableLogarithmicDepthBuffer: false,
    enablePerformanceMonitoring: true
  };
  
  // 默认环境配置
  public static readonly DEFAULT_ENVIRONMENT = {
    hdrPath: '/hdr/0a200fbabae59dc8151768d9cc4c1c96.hdr',
    envPreset: 'hdr',
    enabled: true,
    envMapIntensity: 0.6,
    toneMapping: 'ACESFilmic',
    toneMappingExposure: 1.0,
    backgroundBlurriness: 1,
    backgroundIntensity: 1.0,
    environmentIntensity: 0.3,
    showBackground: false
  };
  
  // 默认控制器配置
  public static readonly DEFAULT_CONTROLS = {
    enableDamping: true,
    dampingFactor: 0.05,
    rotateSpeed: 1.0,
    zoomSpeed: 1.2,
    panSpeed: 1.0,
    minDistance: 0.1,
    maxDistance: 5000,
    enableRotate: true,
    enableZoom: true,
    enablePan: true,
    enableKeys: true
  };
}