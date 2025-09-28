import React, { useEffect, useRef, useState, useCallback } from "react";
import { Aether3d } from '../../../Engine';
import { Viewport } from '../../../Engine/interface/Viewport';
import {THREE} from "../../../Engine/core/global";
import { EnvironmentMapScript } from '../../../Engine';
import { OrbitControlsScript } from '../../../Engine';
import { GLBLoaderScript } from '../../../Engine';
import { CSS2DLabelScript } from '../../../Engine';
import type {PointLightConfig} from "../../../Engine";
import { FPSOptimizerScript } from "../../../Engine";
import {AirDeviceScript} from "./Script/AirDeviceScript";
import {PunkahDeviceScript} from "./Script/PunkahDeviceScript";
import {SmartHomeScene} from "./Script/SmartHomeScene";
import CurtainDeviceScript from "./Script/CurtainDeviceScript";
import LoadingScreen from './LoadingScreen';
import {WasherDeviceScript} from "./Script/WasherDeviceScript";

interface Scene3DProps {
  /** 场景准备就绪时的回调函数，提供渲染器和环境贴图脚本实例 */
  onSceneReady?: (renderer: Aether3d, environmentMapScript: EnvironmentMapScript, glbLoaderScript: GLBLoaderScript) => void;
  /** 雾效配置参数 */
  fogConfig?: {
    /** 是否启用雾效 */
    enabled?: boolean;
    /** 雾效颜色 */
    color?: string;
    /** 雾效近裁剪面距离 */
    near?: number;
    /** 雾效远裁剪面距离 */
    far?: number;
  };
  // /** 对象选中时的回调函数 */
  // onObjectSelected?: (object: THREE.Object3D | null) => void;
  // /** 对象悬停时的回调函数 */
  // onObjectHovered?: (object: THREE.Object3D | null) => void;
  /** 点光源配置数组 */
  pointLights?: PointLightConfig[];
  /** 点光源配置变更时的回调函数 */
  onPointLightsChange?: (lights: PointLightConfig[]) => void;
  /** 是否显示FPS信息 */
  showFPS?: boolean; // 添加显示FPS的属性
  /** 要加载的模型数组 */
  models?: Array<{
    /** 模型文件URL */
    url: string;
    /** 模型加载选项 */
    options?: {
      /** 模型缩放比例 */
      scale?: THREE.Vector3;
      /** 模型位置 */
      position?: THREE.Vector3;
      /** 模型旋转角度 */
      rotation?: THREE.Euler;
      /** 模型材质 */
      material?: THREE.Material;
      /** 模型名称 */
      name?: string;
    };
  }>;
  /** 模型加载完成时的回调函数 */
  onModelsLoaded?: () => void;
}

export interface Scene3DHandle {
  /** 加载模型 */
  loadModels: (models: Array<{
    url: string;
    options?: {
      scale?: THREE.Vector3;
      position?: THREE.Vector3;
      rotation?: THREE.Euler;
      material?: THREE.Material;
      name?: string;
    };
  }>) => Promise<void>;
  /** 聚焦到指定对象 */
  focusOnObject: (object: THREE.Object3D) => void;
  /** 设置相机到默认视角 */
  setCameraToDefault: () => void;
  /** 启用或禁用OrbitControls */
  enableOrbitControls: (enabled: boolean) => void;
  /** 更新OrbitControls配置 */
  updateOrbitControlsConfig: (config: any) => void;
  /** 设置相机缩放距离限制 */
  setCameraZoomLimits: (minDistance: number, maxDistance: number) => void;
}

const Canvas3D = React.forwardRef<Scene3DHandle, Scene3DProps>((props, ref) => {
  const { onSceneReady, fogConfig, showFPS = true, models = [] } = props;
  /** Canvas元素的引用，用于挂载Three.js渲染器 */
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  /** Aether3D渲染器实例引用 */
  const rendererRef = useRef<Aether3d | null>(null);
  /** 环境贴图脚本实例引用 */
  const environmentMapScriptRef = useRef<EnvironmentMapScript | null>(null);
  /** 已加载的模型对象引用 */
  const glbLoaderScriptRef = useRef<GLBLoaderScript | null>(null);
    /** 场景相机 */
  const orbitControlsScriptRef = useRef<OrbitControlsScript | null>(null);
  /** 雾效对象引用 */
  const fogRef = useRef<THREE.Fog | null>(null);
  /** FPS优化脚本实例引用 */
  const fpsOptimizerScriptRef = useRef<FPSOptimizerScript | null>(null);
  /** 风扇设备脚本实例引用 */
  const fanDeviceRef = useRef<any | null>(null);
  /** 小米空调设备脚本实例引用 */
  const airDeviceRef = useRef<any | null>(null);
  const css2dLabelScriptRef = useRef<CSS2DLabelScript | null>(null);
  const objectSelected = useRef<THREE.Object3D | null>(null);
   const smartHomeSceneRef = useRef<SmartHomeScene | null>(null);
  /** 模型加载状态 */
  const [loadState, setLoadState] = useState({
    loading: false,
    progress: 0,
    message: '',
    loadedModels: 0,
    totalModels: 0,
    errors: [] as string[]
  });
  /** 添加FPS状态 */
  const [fps, setFps] = useState(0);
  // 缓存常用的Three.js对象以减少GC压力
  const vector3Cache = useRef<{
    position: THREE.Vector3;
    scale: THREE.Vector3;
    rotation: THREE.Euler;
  }>({
    position: new THREE.Vector3(0, 14, 0),
    scale: new THREE.Vector3(1, 1, 1),
    rotation: new THREE.Euler(0, 0, 0)
  });

  // 使用useCallback优化FPS更新函数，避免不必要的重渲染
  const updateFps = useCallback((newFps: number) => {
    setFps(prevFps => {
      // 只有当FPS变化超过1时才更新，减少不必要的重渲染
      if (Math.abs(prevFps - newFps) > 1) {
        return newFps;
      }
      return prevFps;
    });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    // 创建视口配置
    const viewportConfig: Viewport = {
      element: canvasRef.current,
      dpr: new THREE.Vector2(window.innerWidth, window.innerHeight),
      antialias: true,
      factor: 1,
      distance: 5,
      alpha:false,
      aspect: window.innerWidth / window.innerHeight,
      enablePostProcessing: false,
      enableLogarithmicDepthBuffer: false,
      enablePerformanceMonitoring: false,
      backgroundColor: '#485163',
      // 添加鼠标交互配置
      mouseInteraction: {
        interactionMode: 'both',
        enabled: true
      }
    };

    // 创建渲染器
    const engine = new Aether3d(viewportConfig);
    rendererRef.current = engine;
    // 监听FPS事件
    if (showFPS) {
      engine.on('performance:fps', (data) => {
        updateFps(data.fps);
      });
    }

    //创建雾效
    const fogEnabled = fogConfig?.enabled ?? false;
    const fogColor = fogConfig?.color ?? '#000000';
    const fogNear = fogConfig?.near ?? 0;
    const fogFar = fogConfig?.far ?? 40;
    if (fogEnabled) {
      const fog = new THREE.Fog(fogColor, fogNear, fogFar);
      engine.scene.fog = fog;
      fogRef.current = fog;
    }

    engine.camera.position.set(11.154575612004217, 16.958249890869915, 12.493937172563147);
    engine.camera.lookAt(0, 0, 0);

    // 创建轨道控制器脚本
    orbitControlsScriptRef.current = new OrbitControlsScript({
      enableDamping: true,
      dampingFactor: 0.05,
      rotateSpeed: 0.5,
      zoomSpeed: 1.2,
      maxPolarAngle: THREE.MathUtils.degToRad(89), // 将角度转换为弧度
      minDistance: 3,   // 最小缩放距离
      maxDistance: 20,  // 最大缩放距离
      enableRotate: true,
      enableZoom: false,
      enablePan:false,
    });
    // 设置默认相机位置和目标点
    orbitControlsScriptRef.current.setDefaultCameraPosition(
      new THREE.Vector3(11.154575612004217, 16.958249890869915, 12.493937172563147),
      new THREE.Vector3(0, 0, 0)
    );
    engine.addScript(orbitControlsScriptRef.current);
    engine.disableSelections(['Reflection','Mesh1687','feng','guanyun','dimian','qiang','pingmian','ding']);
    // 创建环境贴图脚本
    environmentMapScriptRef.current = new EnvironmentMapScript({
      hdrPath: '/hdr/0a200fbabae59dc8151768d9cc4c1c96.hdr',
      envPreset: 'hdr',
      enabled: true,
      envMapIntensity: 1,
      toneMapping: 'ACESFilmic',
      toneMappingExposure: 1.0,
      backgroundBlurriness: 1,
      backgroundIntensity: 1.0,
      environmentIntensity: 1.5,
      showBackground: false
    });
    engine.addScript(environmentMapScriptRef.current as EnvironmentMapScript);

    // 创建GLB模型加载脚本
    glbLoaderScriptRef.current = new GLBLoaderScript({
      enableDraco: true,
      autoAddToScene: true
    });
    engine.addScript(glbLoaderScriptRef.current);

    // 创建CSS2D标签脚本
    css2dLabelScriptRef.current = new CSS2DLabelScript({
      container: canvasRef.current.parentElement || document.body,
      autoResize: true,
      zIndex: 1000,
      enabled: true
    });
    engine.addScript(css2dLabelScriptRef.current);

    // 加载多个GLB模型
    if (models && models.length > 0) {
      loadModels(models).then(() => {
      });
    } else {
      // 通知模型加载完成
      setTimeout(() => {
        props.onModelsLoaded?.();
      }, 0);
    }

    // const shicecurrent = new AirDeviceScript(glbLoaderScriptRef.current, {model: '/ao/cezhi.glb',
    //   name: 'AiruyDevice',
    //   position: [0,0, 0],
    //   rotation: [0, Math.PI/2, 0],
    //   scale: [1,1, 1]});
    // engine.addScript(shicecurrent);

    airDeviceRef.current = new AirDeviceScript(glbLoaderScriptRef.current, {model: '/ao/lishikongtiao.glb',
      name: 'Air Device',
      position: [8.4,0, 2],
      rotation: [0, Math.PI/2, 0],
      scale: [0.017, 0.017, 0.017]});
    engine.addScript(airDeviceRef.current);

    fanDeviceRef.current = new PunkahDeviceScript(glbLoaderScriptRef.current, {model: '/models/fengshang.glb',
      name: 'Punkah Device',
      position: [5,0.25, 3],
      rotation: [0, 0, 0],
      scale: [0.015, 0.015, 0.015],
      y:0.6});
    engine.addScript(fanDeviceRef.current);

    const curtainDeviceScript = new CurtainDeviceScript(glbLoaderScriptRef.current, {model: '/models/xialachuanglian.glb',
      name: 'Curtain DeviceScript',
      position: [0, 0.15, 0],
      rotation: [0 , 0, 0],
      type:'Shutters',
      scale: [0.1, 0.1, 0.1]});
    engine.addScript(curtainDeviceScript);

    const washerDeviceScript = new WasherDeviceScript(glbLoaderScriptRef.current, {model: '/ao/xiyiji.glb',
      name: 'Washer DeviceScript',
      position: [10.6, 0.910,-5.2],
      rotation: [0 , 0, 0],
      scale: [0.1, 0.1, 0.1]});
    engine.addScript(washerDeviceScript);

    smartHomeSceneRef.current = new SmartHomeScene(glbLoaderScriptRef.current, {model: '/ao/changjing.glb',
      name: 'HomeScript',
      position: [0,0.2, 0],
      rotation: [0, 0, 0],
      scale: [0.1, 0.1, 0.1]});
    engine.addScript(smartHomeSceneRef.current);

    // 创建FPS优化脚本
    fpsOptimizerScriptRef.current= new FPSOptimizerScript({
      targetFps: 60,
      adaptiveOptimization: true,
      maxObjects: 1000000,
    });
    engine.addScript(fpsOptimizerScriptRef.current);

    // 监听鼠标交互事件
    engine.on('mouse:objectSelected', (data) => {
      const object = data.object;
      if (object && orbitControlsScriptRef.current && object !== objectSelected.current) {
        // 使用相机控制脚本聚焦到选中的对象
        objectSelected.current = object;
        console.log(object.name);
        smartHomeSceneRef.current?.hideAllLightLabels();
        orbitControlsScriptRef.current.focusOnObject(object);
        orbitControlsScriptRef.current.updateConfig({enableRotate: true, enableZoom: true});
      }
    });

    // 启动渲染循环
    engine.start();

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
  }, [onSceneReady, showFPS, updateFps]);

  // 使用useCallback优化加载多个模型的函数
  const loadModels = useCallback(async (models: Array<{
    url: string;
    options?: {
      scale?: THREE.Vector3;
      position?: THREE.Vector3;
      rotation?: THREE.Euler;
      material?: THREE.Material;
      name?: string;
    };
  }>) => {
    if (!glbLoaderScriptRef.current || loadState.loading) return;
    setLoadState({
      loading: true,
      progress: 0,
      message: '开始加载模型...',
      loadedModels: 0,
      totalModels: models.length,
      errors: []
    });
    try {
      for (let i = 0; i < models.length; i++) {
        try {
          const modelConfig = models[i];
          await glbLoaderScriptRef.current?.loadModel(modelConfig.url, {
            onProgress: (progressInfo) => {
              // 计算整体进度：已完成的模型 + 当前模型的进度
              const overallProgress = (i * 100 + progressInfo.percentage) / models.length;
              setLoadState(prev => ({
                ...prev,
                progress: overallProgress,
                message: `加载模型 ${i + 1}/${prev.totalModels}... ${Math.round(progressInfo.loaded / 1024)}KB / ${Math.round(progressInfo.total / 1024)}KB`
              }));
            },
            onError: (error) => {
              console.error(`模型 ${modelConfig.url} 加载失败:`, error);
            },
            addToScene: true,
            scale: modelConfig.options?.scale || vector3Cache.current.scale,
            position: modelConfig.options?.position || vector3Cache.current.position,
            rotation: modelConfig.options?.rotation || vector3Cache.current.rotation,
            material: modelConfig.options?.material,
          });

          setLoadState(prev => ({
            ...prev,
            loadedModels: prev.loadedModels + 1,
            progress: ((prev.loadedModels + 1) * 100) / prev.totalModels,
            message: `模型 ${i + 1}/${prev.totalModels} 加载完成`
          }));
        } catch (error) {
          setLoadState(prev => ({
            ...prev,
            errors: [...prev.errors, `模型 ${models[i].url} 加载失败`]
          }));
          console.error(`加载模型 ${models[i].url} 时出错:`, error);
        }
      }

      setLoadState(prev => ({
        ...prev,
        message: '所有模型加载完成！',
        loading: true
      }));

      // 延迟隐藏加载界面
      setTimeout(() => {
        setLoadState(prev => ({
          ...prev,
          loading: false
        }));
        props.onModelsLoaded?.();
      }, 500);
    } catch (error) {
      console.error('加载模型时出错:', error);
      setLoadState(prev => ({
        ...prev,
        message: '加载模型时出错',
        loading: false
      }));
    }
  }, [loadState.loading, props]);

  // 使用useImperativeHandle实现Scene3DHandle接口
  React.useImperativeHandle(ref, () => ({
    /** 加载模型 */
    loadModels,
    /** 聚焦到指定对象 */
    focusOnObject(object: THREE.Object3D) {
      if (orbitControlsScriptRef.current) {
        orbitControlsScriptRef.current.focusOnObject(object);
      }
    },
    /** 设置相机到默认视角 */
    setCameraToDefault() {
      // OrbitControlsScript 中没有这个方法，暂时留空
      console.warn('setCameraToDefault method not implemented in OrbitControlsScript');
    },
    /** 启用或禁用OrbitControls */
    enableOrbitControls(enabled: boolean) {
      if (orbitControlsScriptRef.current) {
        if (enabled) {
          orbitControlsScriptRef.current.enable();
        } else {
          orbitControlsScriptRef.current.disable();
        }
      }
    },
    /** 更新OrbitControls配置 */
    updateOrbitControlsConfig(config: any) {
      if (orbitControlsScriptRef.current) {
        orbitControlsScriptRef.current.updateConfig(config);
      }
    },
    /** 设置相机缩放距离限制 */
    setCameraZoomLimits(minDistance: number, maxDistance: number) {
      if (orbitControlsScriptRef.current) {
        orbitControlsScriptRef.current.updateConfig({
          minDistance,
          maxDistance
        });
      }
    }
  }));

  // 添加退回原始位置的处理函数
  const handleBackToOriginalPosition = () => {
    if (orbitControlsScriptRef.current) {
      objectSelected.current = null;
      smartHomeSceneRef.current?.showAllLightLabels();
      orbitControlsScriptRef.current.backLodPosition(new THREE.Vector3(11.154575612004217, 16.958249890869915, 12.493937172563147));
      // 同时禁用旋转和缩放，恢复初始状态
      orbitControlsScriptRef.current.updateConfig({
        enableRotate: false,
        enableZoom: false
      });
      fanDeviceRef.current.SetDefaultMaterial();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: loadState.loading ? 'none' : 'block'
        }}
      />
      {showFPS && (
        <div style={{
          position: 'absolute',
          top: 2,
          right: 2,
          background: 'rgb(59,68,85)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px',
          zIndex: 2
        }}>
          FPS: {fps}
        </div>
      )}
      {/* 添加退回按钮 */}
      <button
        onClick={handleBackToOriginalPosition}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          padding: '8px 16px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 10,
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px'
        }}
      >
        退回原始位置
      </button>
      {loadState.loading && (
        // 加载屏幕组件
        <LoadingScreen
          progress={loadState.progress}
          message={loadState.message}
        />
      )}
    </div>
  );
});

export default Canvas3D;
