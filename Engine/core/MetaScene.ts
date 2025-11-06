import * as THREE from 'three';
import { MetadataManager } from './MetadataManager';
import { ObjectMetadata } from './ObjectMetadata';

/**
 * 带元数据管理功能的场景类
 * 扩展THREE.Scene，自动为添加到场景的对象创建元数据
 */
export class MetaScene extends THREE.Scene {
  private metadataManager: MetadataManager;

  constructor(metadataManager?: MetadataManager) {
    super();
    this.metadataManager = metadataManager || new MetadataManager();
  }

  /**
   * 重写add方法，自动为添加的对象创建元数据
   * @param object 要添加到场景的3D对象
   * @returns 添加的对象
   */
  public override add(...object: THREE.Object3D[]): this {
    // 调用父类的add方法
    super.add(...object);

    // 为每个添加的对象创建元数据
    for (const obj of object) {
      this.createObjectMetadataForObject(obj);
    }

    return this;
  }

  /**
   * 为对象创建元数据
   * @param object 3D对象
   */
  private createObjectMetadataForObject(object: THREE.Object3D): void {
    // 为对象本身创建元数据
    const name = object.name || object.type;
    const type = object.type;
    const metadata = this.metadataManager.createObjectMetadata(object, name, type);
    
    // 输出元数据信息
    // console.log(`[MetaScene] 创建对象元数据: ID=${metadata.id}, Name=${metadata.name}, Type=${metadata.type}`);

    // 递归为子对象创建元数据
    object.children.forEach(child => {
      this.createObjectMetadataForObject(child);
    });
  }

  /**
   * 获取元数据管理器
   * @returns 元数据管理器实例
   */
  public getMetadataManager(): MetadataManager {
    return this.metadataManager;
  }
  
  /**
   * 获取对象的元数据
   * @param object 3D对象
   * @returns 对象元数据，如果不存在则返回undefined
   */
  public getObjectMetadata(object: THREE.Object3D): ObjectMetadata | undefined {
    return this.metadataManager.getObjectMetadata(object);
  }
  
  /**
   * 通过ID获取对象元数据
   * @param id 对象ID
   * @returns 对象元数据，如果不存在则返回undefined
   */
  public getObjectMetadataById(id: string): ObjectMetadata | undefined {
    return this.metadataManager.getObjectMetadataById(id);
  }
}