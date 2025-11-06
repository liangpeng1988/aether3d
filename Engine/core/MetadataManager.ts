import { ObjectMetadata } from './ObjectMetadata';
import * as THREE from 'three';

/**
 * 元数据管理器
 * 用于管理场景中所有对象的元数据
 */
export class MetadataManager {
  /** 对象元数据映射 */
  private objectMetadata: Map<string, ObjectMetadata> = new Map();
  
  /** 图层元数据映射 */
  private layerMetadata: Map<string, ObjectMetadata> = new Map();
  
  /** 对象与元数据ID的映射 */
  private objectToMetadataId: Map<THREE.Object3D, string> = new Map();

  /**
   * 为对象创建元数据
   * @param object 3D对象
   * @param name 对象名称
   * @param type 对象类型
   * @returns 元数据对象
   */
  public createObjectMetadata(object: THREE.Object3D, name: string, type: string): ObjectMetadata {
    // 如果对象已经有ID，使用它；否则生成新的ID
    const id = object.userData?.id || `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建元数据
    const metadata = new ObjectMetadata(id, name, type);
    
    // 从对象的userData中获取图层ID并设置到元数据中
    if (object.userData?.layerId) {
      metadata.layerId = object.userData.layerId;
    }
    
    // 存储元数据
    this.objectMetadata.set(id, metadata);
    this.objectToMetadataId.set(object, id);
    
    // 将ID存储在对象的userData中
    if (!object.userData) {
      object.userData = {};
    }
    object.userData.id = id;
    
    return metadata;
  }

  /**
   * 为图层创建元数据
   * @param layerId 图层ID
   * @param name 图层名称
   * @returns 元数据对象
   */
  public createLayerMetadata(layerId: string, name: string): ObjectMetadata {
    // 创建元数据
    const metadata = new ObjectMetadata(layerId, name, 'layer');
    
    // 存储元数据
    this.layerMetadata.set(layerId, metadata);
    
    return metadata;
  }

  /**
   * 获取对象的元数据
   * @param object 3D对象
   * @returns 元数据对象，如果不存在则返回undefined
   */
  public getObjectMetadata(object: THREE.Object3D): ObjectMetadata | undefined {
    const id = this.objectToMetadataId.get(object);
    if (id) {
      return this.objectMetadata.get(id);
    }
    return undefined;
  }

  /**
   * 通过ID获取对象元数据
   * @param id 对象ID
   * @returns 元数据对象，如果不存在则返回undefined
   */
  public getObjectMetadataById(id: string): ObjectMetadata | undefined {
    return this.objectMetadata.get(id);
  }

  /**
   * 获取图层的元数据
   * @param layerId 图层ID
   * @returns 元数据对象，如果不存在则返回undefined
   */
  public getLayerMetadata(layerId: string): ObjectMetadata | undefined {
    return this.layerMetadata.get(layerId);
  }

  /**
   * 更新对象元数据
   * @param object 3D对象
   * @param updates 更新内容
   */
  public updateObjectMetadata(object: THREE.Object3D, updates: Partial<ObjectMetadata>): void {
    const metadata = this.getObjectMetadata(object);
    if (metadata) {
      Object.assign(metadata, updates);
      metadata.touch();
    }
  }

  /**
   * 更新对象元数据（通过ID）
   * @param id 对象ID
   * @param updates 更新内容
   */
  public updateObjectMetadataById(id: string, updates: Partial<ObjectMetadata>): void {
    const metadata = this.objectMetadata.get(id);
    if (metadata) {
      Object.assign(metadata, updates);
      metadata.touch();
    }
  }

  /**
   * 更新图层元数据
   * @param layerId 图层ID
   * @param updates 更新内容
   */
  public updateLayerMetadata(layerId: string, updates: Partial<ObjectMetadata>): void {
    const metadata = this.layerMetadata.get(layerId);
    if (metadata) {
      Object.assign(metadata, updates);
      metadata.touch();
    }
  }

  /**
   * 删除对象元数据
   * @param object 3D对象
   */
  public removeObjectMetadata(object: THREE.Object3D): void {
    const id = this.objectToMetadataId.get(object);
    if (id) {
      this.objectMetadata.delete(id);
      this.objectToMetadataId.delete(object);
      
      // 从对象的userData中移除ID
      if (object.userData && object.userData.id === id) {
        delete object.userData.id;
      }
    }
  }

  /**
   * 删除对象元数据（通过ID）
   * @param id 对象ID
   */
  public removeObjectMetadataById(id: string): void {
    this.objectMetadata.delete(id);
    
    // 从对象到ID的映射中移除
    for (const [object, objectId] of this.objectToMetadataId.entries()) {
      if (objectId === id) {
        this.objectToMetadataId.delete(object);
        // 从对象的userData中移除ID
        if (object.userData && object.userData.id === id) {
          delete object.userData.id;
        }
        break;
      }
    }
  }

  /**
   * 删除图层元数据
   * @param layerId 图层ID
   */
  public removeLayerMetadata(layerId: string): void {
    this.layerMetadata.delete(layerId);
  }

  /**
   * 获取所有对象元数据
   * @returns 对象元数据数组
   */
  public getAllObjectMetadata(): ObjectMetadata[] {
    return Array.from(this.objectMetadata.values());
  }

  /**
   * 获取所有图层元数据
   * @returns 图层元数据数组
   */
  public getAllLayerMetadata(): ObjectMetadata[] {
    return Array.from(this.layerMetadata.values());
  }

  /**
   * 根据标签过滤对象元数据
   * @param tag 标签
   * @returns 匹配的对象元数据数组
   */
  public getObjectMetadataByTag(tag: string): ObjectMetadata[] {
    return Array.from(this.objectMetadata.values()).filter(metadata => metadata.hasTag(tag));
  }

  /**
   * 根据类型过滤对象元数据
   * @param type 类型
   * @returns 匹配的对象元数据数组
   */
  public getObjectMetadataByType(type: string): ObjectMetadata[] {
    return Array.from(this.objectMetadata.values()).filter(metadata => metadata.type === type);
  }

  /**
   * 根据图层ID获取对象元数据
   * @param layerId 图层ID
   * @returns 匹配的对象元数据数组
   */
  public getObjectMetadataByLayer(layerId: string): ObjectMetadata[] {
    return Array.from(this.objectMetadata.values()).filter(metadata => metadata.layerId === layerId);
  }

  /**
   * 清空所有元数据
   */
  public clear(): void {
    this.objectMetadata.clear();
    this.layerMetadata.clear();
    this.objectToMetadataId.clear();
  }

  /**
   * 序列化所有元数据
   * @returns 序列化的元数据对象
   */
  public serialize(): any {
    return {
      objectMetadata: Array.from(this.objectMetadata.values()).map(metadata => metadata.serialize()),
      layerMetadata: Array.from(this.layerMetadata.values()).map(metadata => metadata.serialize())
    };
  }

  /**
   * 从序列化数据反序列化元数据
   * @param data 序列化数据
   */
  public deserialize(data: any): void {
    this.clear();
    
    if (data.objectMetadata) {
      for (const item of data.objectMetadata) {
        const metadata = ObjectMetadata.deserialize(item);
        this.objectMetadata.set(metadata.id, metadata);
      }
    }
    
    if (data.layerMetadata) {
      for (const item of data.layerMetadata) {
        const metadata = ObjectMetadata.deserialize(item);
        this.layerMetadata.set(metadata.id, metadata);
      }
    }
  }
}