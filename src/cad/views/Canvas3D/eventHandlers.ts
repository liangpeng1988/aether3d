import { THREE } from "../../../../Engine/core/global";
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { BlenderCameraControlsScript } from '../../../../Engine/controllers';
import { CallbackManager } from '../../controllers/CallbackManager';
import { EdgeSelectionScript } from '../../../../Engine/controllers/EdgeSelectionScript';
import { VertexSelectionScript } from '../../../../Engine/controllers/VertexSelectionScript';
import { FaceSelectionScript } from '../../../../Engine/controllers/FaceSelectionScript';

/**
 * 处理对象选中事件
 */
export const handleObjectSelected = (
  data: any,
  objectSelected: React.RefObject<THREE.Object3D | null>,
  onObjectSelectedRef: React.RefObject<((object: THREE.Object3D | null) => void) | undefined>,
  outlineEffectScriptRef: React.RefObject<any>,
  transformControlsRef: React.RefObject<TransformControls | null>,
  edgeSelectionScriptRef: React.RefObject<EdgeSelectionScript | null>,
  vertexSelectionScriptRef: React.RefObject<VertexSelectionScript | null>,
  faceSelectionScriptRef: React.RefObject<FaceSelectionScript | null>,
  selectionMode: 'object' | 'vertex' | 'edge' | 'face' = 'object'
) => {
  const object = data.object;
  
  // 如果对象为空，清除选择
  if (!object) {
    objectSelected.current = null;
    CallbackManager.invokeOnObjectSelected(onObjectSelectedRef, null);
    
    // 取消TransformControls的附加
    if (transformControlsRef.current) {
      transformControlsRef.current.detach();
      console.log('TransformControls已分离');
    }
    
    // 清除 OutlineEffectScript 的高亮
    if (outlineEffectScriptRef.current) {
      outlineEffectScriptRef.current.setSelectedObjects([]);
    }
    
    // 清除其他选择脚本的高亮
    if (edgeSelectionScriptRef.current) {
      edgeSelectionScriptRef.current.clearSelection();
    }
    if (vertexSelectionScriptRef.current) {
      vertexSelectionScriptRef.current.clearSelection();
    }
    if (faceSelectionScriptRef.current) {
      faceSelectionScriptRef.current.clearSelection();
    }
    
    return;
  }
  
  // 检查是否为 TransformControls 相关对象
  const isTransformControl = object && (
    (object.userData && object.userData.layerId === 'layer0')
  );
  
  // 如果是 TransformControls 相关对象，忽略选择
  if (isTransformControl) {
    console.log('忽略 TransformControls 对象选择:', object.name || object.type);
    return;
  }
  
  // 更新选中对象引用
  objectSelected.current = object;
  
  // 通知外部组件对象已选中
  CallbackManager.invokeOnObjectSelected(onObjectSelectedRef, object);
  
  // 根据选择模式应用不同的高亮效果
  switch (selectionMode) {
    case 'object':
      // 为选中对象应用 OutlineEffectScript 高亮效果
      if (outlineEffectScriptRef.current) {
        outlineEffectScriptRef.current.setSelectedObjects([object]);
      }
      // 清除其他选择模式的高亮
      if (edgeSelectionScriptRef.current) {
        edgeSelectionScriptRef.current.clearSelection();
      }
      if (vertexSelectionScriptRef.current) {
        vertexSelectionScriptRef.current.clearSelection();
      }
      if (faceSelectionScriptRef.current) {
        faceSelectionScriptRef.current.clearSelection();
      }
      break;
      
    case 'edge':
      // 为选中对象应用 EdgeSelectionScript 高亮效果
      if (edgeSelectionScriptRef.current) {
        edgeSelectionScriptRef.current.setSelectedObjects([object]);
      }
      // 清除其他选择模式的高亮
      if (outlineEffectScriptRef.current) {
        outlineEffectScriptRef.current.setSelectedObjects([]);
      }
      if (vertexSelectionScriptRef.current) {
        vertexSelectionScriptRef.current.clearSelection();
      }
      if (faceSelectionScriptRef.current) {
        faceSelectionScriptRef.current.clearSelection();
      }
      break;
      
    case 'vertex':
      // 为选中对象应用 VertexSelectionScript 高亮效果
      if (vertexSelectionScriptRef.current) {
        vertexSelectionScriptRef.current.setSelectedObjects([object]);
      }
      // 清除其他选择模式的高亮
      if (outlineEffectScriptRef.current) {
        outlineEffectScriptRef.current.setSelectedObjects([]);
      }
      if (edgeSelectionScriptRef.current) {
        edgeSelectionScriptRef.current.clearSelection();
      }
      if (faceSelectionScriptRef.current) {
        faceSelectionScriptRef.current.clearSelection();
      }
      break;
      
    case 'face':
      // 为选中对象应用 FaceSelectionScript 高亮效果
      if (faceSelectionScriptRef.current) {
        faceSelectionScriptRef.current.setSelectedObjects([object]);
      }
      // 清除其他选择模式的高亮
      if (outlineEffectScriptRef.current) {
        outlineEffectScriptRef.current.setSelectedObjects([]);
      }
      if (edgeSelectionScriptRef.current) {
        edgeSelectionScriptRef.current.clearSelection();
      }
      if (vertexSelectionScriptRef.current) {
        vertexSelectionScriptRef.current.clearSelection();
      }
      break;
  }
};

/**
 * 处理键盘事件
 */
export const handleKeyDown = (
  event: KeyboardEvent,
  transformControlsRef: React.RefObject<TransformControls | null>,
  objectSelected: React.RefObject<THREE.Object3D | null>,
  onObjectSelectedRef: React.RefObject<((object: THREE.Object3D | null) => void) | undefined>,
  outlineEffectScriptRef: React.RefObject<any>
) => {
  if (!transformControlsRef.current) return;
  
  switch (event.key) {
    case 'w': // 移动模式
    case 'W':
      // 附加TransformControls到当前选中的对象
      if (objectSelected.current && (objectSelected.current instanceof THREE.Mesh || objectSelected.current instanceof THREE.Group)) {
        transformControlsRef.current.attach(objectSelected.current);
        console.log('TransformControls已附加到对象:', objectSelected.current.name || objectSelected.current.type);
        
        // 确保所有轴都显示
        transformControlsRef.current.showX = true;
        transformControlsRef.current.showY = true;
        transformControlsRef.current.showZ = true;
      }
      
      transformControlsRef.current.setMode('translate');
      console.log('切换到移动模式');
      break;
    case 'e': // 旋转模式
    case 'E':
      // 附加TransformControls到当前选中的对象
      if (objectSelected.current && (objectSelected.current instanceof THREE.Mesh || objectSelected.current instanceof THREE.Group)) {
        transformControlsRef.current.attach(objectSelected.current);
        console.log('TransformControls已附加到对象:', objectSelected.current.name || objectSelected.current.type);
        
        // 确保所有轴都显示
        transformControlsRef.current.showX = true;
        transformControlsRef.current.showY = true;
        transformControlsRef.current.showZ = true;
      }
      
      transformControlsRef.current.setMode('rotate');
      console.log('切换到旋转模式');
      break;
    case 'r': // 缩放模式
    case 'R':
      // 附加TransformControls到当前选中的对象
      if (objectSelected.current && (objectSelected.current instanceof THREE.Mesh || objectSelected.current instanceof THREE.Group)) {
        transformControlsRef.current.attach(objectSelected.current);
        console.log('TransformControls已附加到对象:', objectSelected.current.name || objectSelected.current.type);
        
        // 确保所有轴都显示
        transformControlsRef.current.showX = true;
        transformControlsRef.current.showY = true;
        transformControlsRef.current.showZ = true;
      }
      
      transformControlsRef.current.setMode('scale');
      console.log('切换到缩放模式');
      break;
    case 'g': // 切换坐标系（世界/本地）
    case 'G':
      const currentSpace = transformControlsRef.current.space;
      transformControlsRef.current.setSpace(currentSpace === 'world' ? 'local' : 'world');
      console.log('切换坐标系:', currentSpace === 'world' ? '本地' : '世界');
      break;
    case 'x': // 只显示 X 轴
    case 'X':
      if (event.shiftKey) {
        // Shift+X: 排除 X 轴，只显示 Y 和 Z
        transformControlsRef.current.showX = false;
        transformControlsRef.current.showY = true;
        transformControlsRef.current.showZ = true;
      } else {
        // X: 只显示 X 轴
        transformControlsRef.current.showX = true;
        transformControlsRef.current.showY = false;
        transformControlsRef.current.showZ = false;
      }
      console.log('X 轴约束');
      break;
    case 'y': // 只显示 Y 轴
    case 'Y':
      if (event.shiftKey) {
        // Shift+Y: 排除 Y 轴，只显示 X 和 Z
        transformControlsRef.current.showX = true;
        transformControlsRef.current.showY = false;
        transformControlsRef.current.showZ = true;
      } else {
        // Y: 只显示 Y 轴
        transformControlsRef.current.showX = false;
        transformControlsRef.current.showY = true;
        transformControlsRef.current.showZ = false;
      }
      console.log('Y 轴约束');
      break;
    case 'z': // 只显示 Z 轴
    case 'Z':
      if (event.shiftKey) {
        // Shift+Z: 排除 Z 轴，只显示 X 和 Y
        transformControlsRef.current.showX = true;
        transformControlsRef.current.showY = true;
        transformControlsRef.current.showZ = false;
      } else {
        // Z: 只显示 Z 轴
        transformControlsRef.current.showX = false;
        transformControlsRef.current.showY = false;
        transformControlsRef.current.showZ = true;
      }
      console.log('Z 轴约束');
      break;
    case 'a': // 显示所有轴
    case 'A':
      transformControlsRef.current.showX = true;
      transformControlsRef.current.showY = true;
      transformControlsRef.current.showZ = true;
      console.log('显示所有轴');
      break;
    case 'Escape': // 取消选择
      if (transformControlsRef.current.object) {
        transformControlsRef.current.detach();
        objectSelected.current = null;
        CallbackManager.invokeOnObjectSelected(onObjectSelectedRef, null);
        console.log('取消选择');
        
        // 清除 OutlineEffectScript 的高亮
        if (outlineEffectScriptRef.current) {
          outlineEffectScriptRef.current.setSelectedObjects([]);
        }
      }
      break;
  }
};

/**
 * 处理窗口大小调整
 */
export const handleWindowResize = (
  rendererRef: React.RefObject<any>,
  lastSizeRef: React.RefObject<{ width: number; height: number }>,
  container: HTMLElement
) => {
  if (!rendererRef.current) return;
  
  const currentWidth = container.clientWidth;
  const currentHeight = container.clientHeight;
  
  // 只有尺寸真正变化时才执行 resize
  if (lastSizeRef.current.width !== currentWidth || lastSizeRef.current.height !== currentHeight) {
    lastSizeRef.current = { width: currentWidth, height: currentHeight };
    rendererRef.current.resize();
  }
};

/**
 * 处理右键菜单阻止事件
 */
export const handleContextMenu = (event: React.MouseEvent) => {
  event.preventDefault();
};
