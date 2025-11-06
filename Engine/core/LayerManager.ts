import * as THREE from 'three';
import { ILayer } from '../../Engine/interface/ILayer';

/**
 * 图层管理器核心类
 * 提供图层相关的基础功能，可在引擎核心中使用
 */
export class LayerManager {
  // 存储图层的映射
  private layers: Map<string, ILayer> = new Map();
  
  // 存储图层中对象的映射
  private layerObjects: Map<string, THREE.Object3D[]> = new Map();
  
  // 当前选择的图层ID
  private currentLayerId: string | null = null;

  /**
   * 添加图层
   * @param layer 图层信息
   */
  public addLayer(layer: ILayer): void {
    this.layers.set(layer.id, layer);
    // 初始化图层对象数组
    if (!this.layerObjects.has(layer.id)) {
      this.layerObjects.set(layer.id, []);
    }
  }

  /**
   * 创建图层
   * @param layerData 图层数据（不包含ID）
   * @param id 图层ID
   * @returns 创建的图层
   */
  public createLayer(layerData: Omit<ILayer, 'id'>, id: string): ILayer {
    const layer: ILayer = {
      id,
      ...layerData
    };
    this.addLayer(layer);
    return layer;
  }

  /**
   * 获取图层
   * @param layerId 图层ID
   * @returns 图层信息，如果不存在则返回undefined
   */
  public getLayer(layerId: string): ILayer | undefined {
    return this.layers.get(layerId);
  }

  /**
   * 获取所有图层
   * @returns 图层数组
   */
  public getAllLayers(): ILayer[] {
    return Array.from(this.layers.values());
  }

  /**
   * 更新图层
   * @param layerId 图层ID
   * @param updates 更新内容
   */
  public updateLayer(layerId: string, updates: Partial<ILayer>): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      Object.assign(layer, updates);
    }
  }

  /**
   * 删除图层
   * @param layerId 图层ID
   */
  public deleteLayer(layerId: string): void {
    this.layers.delete(layerId);
    this.layerObjects.delete(layerId);
  }

  /**
   * 设置图层可见性
   * @param layerId 图层ID
   * @param visible 可见性
   */
  public setLayerVisibility(layerId: string, visible: boolean): void {
    this.updateLayer(layerId, { visible });
    // 更新图层中所有对象的可见性
    const objects = this.layerObjects.get(layerId) || [];
    objects.forEach(obj => {
      obj.visible = visible;
    });
  }

  /**
   * 设置图层锁定状态
   * @param layerId 图层ID
   * @param locked 锁定状态
   */
  public setLayerLock(layerId: string, locked: boolean): void {
    this.updateLayer(layerId, { locked });
  }

  /**
   * 向图层添加对象
   * @param layerId 图层ID
   * @param object 3D对象
   */
  public addObjectToLayer(layerId: string, object: THREE.Object3D): void {
    if (!this.layerObjects.has(layerId)) {
      this.layerObjects.set(layerId, []);
    }
    
    const objects = this.layerObjects.get(layerId)!;
    if (!objects.includes(object)) {
      objects.push(object);
      // 设置对象的图层ID
      LayerManager.setObjectLayer(object, layerId);
    }
  }

  /**
   * 从图层移除对象
   * @param layerId 图层ID
   * @param object 3D对象
   */
  public removeObjectFromLayer(layerId: string, object: THREE.Object3D): void {
    const objects = this.layerObjects.get(layerId);
    if (objects) {
      const index = objects.indexOf(object);
      if (index !== -1) {
        objects.splice(index, 1);
      }
    }
  }

  /**
   * 获取图层中的所有对象
   * @param layerId 图层ID
   * @returns 图层中的对象数组
   */
  public getObjectsInLayer(layerId: string): THREE.Object3D[] {
    return this.layerObjects.get(layerId) || [];
  }

  /**
   * 获取图层中对象的数量
   * @param layerId 图层ID
   * @returns 对象数量
   */
  public getObjectCountInLayer(layerId: string): number {
    const objects = this.layerObjects.get(layerId);
    return objects ? objects.length : 0;
  }

  /**
   * 设置当前选择的图层
   * @param layerId 图层ID
   */
  public setCurrentLayer(layerId: string): void {
    // 检查图层是否存在
    if (this.layers.has(layerId)) {
      this.currentLayerId = layerId;
    } else {
      console.warn(`图层 ${layerId} 不存在`);
    }
  }

  /**
   * 获取当前选择的图层
   * @returns 当前选择的图层信息，如果未选择则返回undefined
   */
  public getCurrentLayer(): ILayer | undefined {
    if (this.currentLayerId) {
      return this.layers.get(this.currentLayerId);
    }
    return undefined;
  }

  /**
   * 获取当前选择的图层ID
   * @returns 当前选择的图层ID，如果未选择则返回null
   */
  public getCurrentLayerId(): string | null {
    return this.currentLayerId;
  }

  /**
   * 清除当前选择的图层
   */
  public clearCurrentLayer(): void {
    this.currentLayerId = null;
  }

  /**
   * 检查指定图层是否为当前选择的图层
   * @param layerId 图层ID
   * @returns 是否为当前选择的图层
   */
  public isCurrentLayer(layerId: string): boolean {
    return this.currentLayerId === layerId;
  }

  /**
   * 检查对象是否属于系统图层（图层0）
   * @param object 3D对象
   * @returns 是否属于系统图层
   */
  public static isSystemLayerObject(object: THREE.Object3D): boolean {
    return object.userData && object.userData.layerId === 'layer0';
  }

  /**
   * 检查对象是否被锁定
   * @param object 3D对象
   * @returns 是否被锁定
   */
  public static isObjectLocked(object: THREE.Object3D): boolean {
    return object.userData && object.userData.locked === true;
  }

  /**
   * 检查对象是否可以交互（不是系统图层对象且未被锁定）
   * @param object 3D对象
   * @returns 是否可以交互
   */
  public static isObjectInteractable(object: THREE.Object3D): boolean {
    // 检查是否为系统图层对象
    if (this.isSystemLayerObject(object)) {
      return false;
    }

    // 检查是否被锁定
    if (this.isObjectLocked(object)) {
      return false;
    }

    return true;
  }

  /**
   * 获取图层中对象的数量（静态方法）
   * @param objects 对象数组
   * @param layerId 图层ID
   * @returns 对象数量
   */
  public static getObjectCountInLayer(objects: THREE.Object3D[], layerId: string): number {
    return objects.filter(obj => obj.userData && obj.userData.layerId === layerId).length;
  }

  /**
   * 过滤系统图层对象
   * @param objects 对象数组
   * @returns 过滤后的对象数组
   */
  public static filterSystemLayerObjects(objects: THREE.Object3D[]): THREE.Object3D[] {
    return objects.filter(obj => !this.isSystemLayerObject(obj));
  }

  /**
   * 过滤锁定对象
   * @param objects 对象数组
   * @returns 过滤后的对象数组
   */
  public static filterLockedObjects(objects: THREE.Object3D[]): THREE.Object3D[] {
    return objects.filter(obj => !this.isObjectLocked(obj));
  }

  /**
   * 过滤可交互对象
   * @param objects 对象数组
   * @returns 过滤后的对象数组
   */
  public static filterInteractableObjects(objects: THREE.Object3D[]): THREE.Object3D[] {
    return objects.filter(obj => this.isObjectInteractable(obj));
  }

  /**
   * 设置对象图层
   * @param object 3D对象
   * @param layerId 图层ID
   */
  public static setObjectLayer(object: THREE.Object3D, layerId: string): void {
    if (!object.userData) {
      object.userData = {};
    }
    object.userData.layerId = layerId;
  }

  /**
   * 获取对象图层
   * @param object 3D对象
   * @returns 图层ID
   */
  public static getObjectLayer(object: THREE.Object3D): string | undefined {
    return object.userData && object.userData.layerId;
  }

  /**
   * 设置对象锁定状态
   * @param object 3D对象
   * @param locked 锁定状态
   */
  public static setObjectLock(object: THREE.Object3D, locked: boolean): void {
    if (!object.userData) {
      object.userData = {};
    }
    object.userData.locked = locked;
  }

  /**
   * 获取对象锁定状态
   * @param object 3D对象
   * @returns 锁定状态
   */
  public static getObjectLock(object: THREE.Object3D): boolean {
    return object.userData && object.userData.locked === true;
  }

  /**
   * 创建默认图层
   * @param id 图层ID
   * @param name 图层名称
   * @param color 图层颜色
   * @returns 图层信息
   */
  public static createDefaultLayer(id: string, name: string, color: string = '#ffffff'): ILayer {
    return {
      id,
      name,
      color,
      visible: true,
      locked: false
    };
  }

  /**
   * 创建系统图层
   * @returns 系统图层信息
   */
  public static createSystemLayer(): ILayer {
    return {
      id: 'layer0',
      name: '系统图层',
      color: '#888888',
      visible: true,
      locked: true
    };
  }
}