import { THREE } from '../../../Engine/core/global';

/**
 * 模型中心点计算工具函数
 * 可以直接在Canvas3D或其他组件中使用
 */

/**
 * 计算模型的轴中心点设置
 * @param object - 要计算的THREE.Object3D对象
 * @returns 包含中心点、尺寸、包围盒等信息的对象
 */
export function calculateModelCenter(object: THREE.Object3D): {
  center: THREE.Vector3;
  size: THREE.Vector3;
  boundingBox: THREE.Box3;
  pivot: THREE.Vector3;
  adjustedPosition: THREE.Vector3;
  bottomCenter: THREE.Vector3;
  topCenter: THREE.Vector3;
} {
  // 创建包围盒对象
  const boundingBox = new THREE.Box3();
  
  // 计算对象的包围盒（包括所有子对象）
  boundingBox.setFromObject(object);
  
  // 获取包围盒的中心点
  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  
  // 获取包围盒的尺寸
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  
  // 计算底部中心点（通常作为轴心点）
  const bottomCenter = new THREE.Vector3(
    center.x,
    boundingBox.min.y,
    center.z
  );
  
  // 计算顶部中心点
  const topCenter = new THREE.Vector3(
    center.x,
    boundingBox.max.y,
    center.z
  );
  
  // 计算轴心点（可以根据需要选择底部、中心或自定义位置）
  const pivot = bottomCenter.clone();
  
  // 计算调整后的位置（使对象的轴心点位于原点）
  const adjustedPosition = new THREE.Vector3();
  adjustedPosition.copy(object.position);
  adjustedPosition.sub(pivot);
  
  console.log('📐 模型中心点计算结果:', {
    originalPosition: object.position.clone(),
    center,
    size,
    bottomCenter,
    topCenter,
    pivot,
    adjustedPosition
  });
  
  return {
    center: center.clone(),
    size: size.clone(),
    boundingBox: boundingBox.clone(),
    pivot: pivot.clone(),
    adjustedPosition: adjustedPosition.clone(),
    bottomCenter: bottomCenter.clone(),
    topCenter: topCenter.clone()
  };
}

/**
 * 设置对象的轴心点到底部中心
 * @param object - 要设置的对象
 * @returns 调整后的位置信息
 */
export function setPivotToBottomCenter(object: THREE.Object3D): THREE.Vector3 {
  const result = calculateModelCenter(object);
  
  // 调整对象位置，使其底部中心对齐到当前位置
  const offset = new THREE.Vector3();
  offset.copy(result.center);
  offset.sub(result.bottomCenter);
  
  object.position.add(offset);
  
  console.log('🎯 已设置轴心点到底部中心:', {
    offset,
    newPosition: object.position.clone()
  });
  
  return object.position.clone();
}

/**
 * 设置对象的轴心点到几何中心
 * @param object - 要设置的对象
 * @returns 调整后的位置信息
 */
export function setPivotToGeometryCenter(object: THREE.Object3D): THREE.Vector3 {
  const result = calculateModelCenter(object);
  
  // 调整对象位置，使其几何中心对齐到当前位置
  const offset = new THREE.Vector3();
  offset.copy(object.position);
  offset.sub(result.center);
  
  object.position.copy(offset);
  
  console.log('🎯 已设置轴心点到几何中心:', {
    offset,
    newPosition: object.position.clone()
  });
  
  return object.position.clone();
}

/**
 * 获取对象在世界坐标系中的包围盒
 * @param object - 要计算的对象
 * @returns 世界坐标系中的包围盒
 */
export function getWorldBoundingBox(object: THREE.Object3D): THREE.Box3 {
  const box = new THREE.Box3();
  
  // 更新世界矩阵
  object.updateMatrixWorld(true);
  
  // 计算世界坐标系中的包围盒
  box.setFromObject(object);
  
  return box;
}

/**
 * 计算两个对象之间的距离
 * @param object1 - 第一个对象
 * @param object2 - 第二个对象
 * @returns 距离信息
 */
export function calculateDistance(object1: THREE.Object3D, object2: THREE.Object3D): {
  centerDistance: number;
  boundingBoxDistance: number;
  closestPoints: {
    point1: THREE.Vector3;
    point2: THREE.Vector3;
  };
} {
  const result1 = calculateModelCenter(object1);
  const result2 = calculateModelCenter(object2);
  
  // 中心点距离
  const centerDistance = result1.center.distanceTo(result2.center);
  
  // 包围盒最近距离（简化计算：使用中心点距离减去半径之和）
  const radius1 = result1.size.length() / 2;
  const radius2 = result2.size.length() / 2;
  const boundingBoxDistance = Math.max(0, centerDistance - radius1 - radius2);
  
  // 计算最近的点（简化计算）
  const direction = new THREE.Vector3();
  direction.subVectors(result2.center, result1.center).normalize();
  
  const point1 = result1.center.clone().add(direction.clone().multiplyScalar(result1.size.length() / 2));
  const point2 = result2.center.clone().sub(direction.clone().multiplyScalar(result2.size.length() / 2));
  
  return {
    centerDistance,
    boundingBoxDistance,
    closestPoints: {
      point1,
      point2
    }
  };
}

/**
 * 在场景中添加可视化辅助对象来显示模型的中心点
 * @param scene - Three.js场景
 * @param object - 要可视化的对象
 * @param options - 可选配置
 */
export function addCenterVisualization(
  scene: THREE.Scene, 
  object: THREE.Object3D,
  options: {
    showCenter?: boolean;
    showBottomCenter?: boolean;
    showBoundingBox?: boolean;
    markerSize?: number;
  } = {}
): {
  centerMarker?: THREE.Mesh;
  bottomMarker?: THREE.Mesh;
  boxHelper?: THREE.Box3Helper;
} {
  const {
    showCenter = true,
    showBottomCenter = true,
    showBoundingBox = true,
    markerSize = 0.1
  } = options;

  const result = calculateModelCenter(object);
  const helpers: any = {};

  if (showCenter) {
    // 添加中心点标记
    const centerMarker = new THREE.Mesh(
      new THREE.SphereGeometry(markerSize, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    centerMarker.position.copy(result.center);
    centerMarker.name = `center_${object.name || 'object'}`;
    scene.add(centerMarker);
    helpers.centerMarker = centerMarker;
  }

  if (showBottomCenter) {
    // 添加底部中心点标记
    const bottomMarker = new THREE.Mesh(
      new THREE.SphereGeometry(markerSize, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff00ff })
    );
    bottomMarker.position.copy(result.bottomCenter);
    bottomMarker.name = `bottom_center_${object.name || 'object'}`;
    scene.add(bottomMarker);
    helpers.bottomMarker = bottomMarker;
  }

  if (showBoundingBox) {
    // 添加包围盒可视化
    const boxHelper = new THREE.Box3Helper(result.boundingBox, 0x00ffff);
    boxHelper.name = `bbox_${object.name || 'object'}`;
    scene.add(boxHelper);
    helpers.boxHelper = boxHelper;
  }

  return helpers;
}

/**
 * 移除之前添加的可视化辅助对象
 * @param scene - Three.js场景
 * @param objectName - 对象名称（用于识别相关的辅助对象）
 */
export function removeCenterVisualization(scene: THREE.Scene, objectName?: string): void {
  const objectsToRemove: THREE.Object3D[] = [];
  
  scene.traverse((child) => {
    if (objectName) {
      // 移除特定对象的辅助对象
      if (child.name.includes(`_${objectName}`) && 
          (child.name.includes('center_') || child.name.includes('bottom_center_') || child.name.includes('bbox_'))) {
        objectsToRemove.push(child);
      }
    } else {
      // 移除所有辅助对象
      if (child.name.includes('center_') || child.name.includes('bottom_center_') || child.name.includes('bbox_')) {
        objectsToRemove.push(child);
      }
    }
  });
  
  objectsToRemove.forEach(obj => {
    scene.remove(obj);
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach(mat => mat.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });
  
  console.log(`🗑️ 已移除 ${objectsToRemove.length} 个可视化辅助对象`);
}