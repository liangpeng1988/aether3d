import { THREE } from '../../../Engine/core/global';

/**
 * 模型中心点计算工具类
 */
export class ModelCenterCalculator {
  /**
   * 计算模型的轴中心点设置
   * @param object - 要计算的THREE.Object3D对象
   * @returns 包含中心点、尺寸、包围盒等信息的对象
   */
  static calculateModelCenter(object: THREE.Object3D): {
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
  static setPivotToBottomCenter(object: THREE.Object3D): THREE.Vector3 {
    const result = this.calculateModelCenter(object);
    
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
  static setPivotToGeometryCenter(object: THREE.Object3D): THREE.Vector3 {
    const result = this.calculateModelCenter(object);
    
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
  static getWorldBoundingBox(object: THREE.Object3D): THREE.Box3 {
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
  static calculateDistance(object1: THREE.Object3D, object2: THREE.Object3D): {
    centerDistance: number;
    boundingBoxDistance: number;
    closestPoints: {
      point1: THREE.Vector3;
      point2: THREE.Vector3;
    };
  } {
    const result1 = this.calculateModelCenter(object1);
    const result2 = this.calculateModelCenter(object2);
    
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
}

export default ModelCenterCalculator;