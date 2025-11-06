import { THREE } from "../../../../Engine/core/global";
import { BlenderCameraControlsScript } from '../../../../Engine/controllers';
import { GLBLoaderScript } from '../../../../Engine';
import { Document as CADDocument } from '../../data/Document';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { EdgeSelectionScript } from '../../../../Engine/controllers/EdgeSelectionScript'; // 添加EdgeSelectionScript导入
import { VertexManipulationController } from '../../../../Engine/controllers/VertexManipulationController'; // 添加VertexManipulationController导入

/**
 * Canvas3DHandle接口实现
 */
export const createCanvas3DHandle = (
  rendererRef: React.RefObject<any>,
  blenderControlsScriptRef: React.RefObject<BlenderCameraControlsScript | null>,
  transformControlsRef: React.RefObject<TransformControls | null>,
  glbLoaderScriptRef: React.RefObject<GLBLoaderScript | null>,
  vertexManipulationControllerRef: React.RefObject<VertexManipulationController | null> // 添加顶点操作控制器引用
) => {
  return {
    /** 获取渲染器实例 */
    getRenderer: () => rendererRef.current,
    
    /** 获取Blender相机控制器 */
    getBlenderControls: () => blenderControlsScriptRef.current,
    
    /** 聚焦到指定对象 */
    focusOnObject(object: THREE.Object3D) {
      if (blenderControlsScriptRef.current) {
        blenderControlsScriptRef.current.setTarget(object.position);
      }
    },
    
    /** 设置相机到默认视角 */
    setCameraToDefault() {
      if (blenderControlsScriptRef.current && rendererRef.current) {
        // 这里需要传入相机位置和目标点的引用
        // 由于这是分离的文件，我们假设这些值在调用时已正确设置
        blenderControlsScriptRef.current.setTarget(new THREE.Vector3(0, 0, 0));
        blenderControlsScriptRef.current.updateConfig({
          enableRotate: true,
          enableZoom: true
        });
      }
    },
    
    /** 启用或禁用相机控制 */
    enableCameraControls(enabled: boolean) {
      if (blenderControlsScriptRef.current) {
        if (enabled) {
          blenderControlsScriptRef.current.enable();
        } else {
          blenderControlsScriptRef.current.disable();
        }
      }
    },
    
    /** 更新相机控制配置 */
    updateCameraControlsConfig(config: any) {
      if (blenderControlsScriptRef.current) {
        blenderControlsScriptRef.current.updateConfig(config);
      }
    },
    
    /** 设置相机缩放距离限制 */
    setCameraZoomLimits(minDistance: number, maxDistance: number) {
      if (blenderControlsScriptRef.current) {
        blenderControlsScriptRef.current.updateConfig({
          minDistance,
          maxDistance
        });
      }
    },
    
    /** 强制重新调整Canvas大小 */
    forceResize() {
      if (rendererRef.current) {
        rendererRef.current.resize();
      }
    },
    
    /** 更新对象变换属性 */
    updateObjectTransform(object: THREE.Object3D, property: string, value: any) {
      // 特殊处理图层ID更新
      if (property === 'userData.layerId') {
        if (!object.userData) {
          object.userData = {};
        }
        object.userData.layerId = value;
        console.log(`[Canvas3D] 更新对象图层ID: ${object.name}, layerId: ${value}`);
      }
      // 根据属性名称更新对象的对应属性
      else {
        switch (property) {
          case 'position':
            if (value instanceof THREE.Vector3) {
              object.position.copy(value);
            }
            break;
          case 'rotation':
            if (value instanceof THREE.Euler) {
              object.rotation.copy(value);
            }
            break;
          case 'scale':
            if (value instanceof THREE.Vector3) {
              object.scale.copy(value);
            }
            break;
          default:
            // 其他属性直接设置
            (object as any)[property] = value;
        }
      }
      
      // 触发对象变化事件
      if (transformControlsRef.current && transformControlsRef.current.object === object) {
        transformControlsRef.current.dispatchEvent({ type: 'objectChange' });
      }
    },
    
    /** 设置 TransformControls 模式 */
    setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
      if (transformControlsRef.current) {
        transformControlsRef.current.setMode(mode);
        // 确保所有轴都显示
        transformControlsRef.current.showX = true;
        transformControlsRef.current.showY = true;
        transformControlsRef.current.showZ = true;
      }
    },
    
    /** 切换 TransformControls 坐标系 */
    toggleTransformSpace() {
      if (transformControlsRef.current) {
        const currentSpace = transformControlsRef.current.space;
        const newSpace = currentSpace === 'world' ? 'local' : 'world';
        transformControlsRef.current.setSpace(newSpace);
        return newSpace;
      }
      return 'world';
    },
    
    /** 获取当前 TransformControls 坐标系 */
    getTransformSpace() {
      if (transformControlsRef.current) {
        return transformControlsRef.current.space;
      }
      return 'world';
    },
    
    /** 附加 TransformControls 到对象 */
    attachTransformControls(object: THREE.Object3D) {
      if (transformControlsRef.current && (object instanceof THREE.Mesh || object instanceof THREE.Group)) {
        transformControlsRef.current.attach(object);
        console.log('TransformControls已附加到对象:', object.name || object.type);
        
        // 确保所有轴都显示
        transformControlsRef.current.showX = true;
        transformControlsRef.current.showY = true;
        transformControlsRef.current.showZ = true;
      }
    },
    
    /** 获取当前文档实例 */
    getDocument: () => rendererRef.current?.scene as CADDocument || null,
    
    /** 获取GLB加载器实例 */
    getGLBLoader: () => glbLoaderScriptRef.current,
    
    /** 获取顶点操作控制器实例 */
    getVertexManipulationController: () => vertexManipulationControllerRef.current
  };
};


