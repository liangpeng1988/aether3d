/**
 * 对象元数据类
 * 用于管理3D对象的元数据信息
 */
export class ObjectMetadata {
  /** 对象ID */
  public id: string;
  
  /** 对象名称 */
  public name: string;
  
  /** 对象类型 */
  public type: string;
  
  /** 对象标签 */
  public tags: string[];
  
  /** 对象图层ID */
  public layerId?: string;
  
  /** 对象是否被锁定 */
  public locked: boolean;
  
  /** 对象是否可见 */
  public visible: boolean;
  
  /** 对象创建时间 */
  public createdAt: Date;
  
  /** 对象最后修改时间 */
  public updatedAt: Date;
  
  /** 自定义属性 */
  public customProperties: Map<string, any>;
  
  /** 对象版本 */
  public version: number;

  constructor(id: string, name: string, type: string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.tags = [];
    this.locked = false;
    this.visible = true;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.customProperties = new Map();
    this.version = 1;
  }

  /**
   * 添加标签
   * @param tag 标签
   */
  public addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.touch();
    }
  }

  /**
   * 移除标签
   * @param tag 标签
   */
  public removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
      this.touch();
    }
  }

  /**
   * 检查是否包含标签
   * @param tag 标签
   * @returns 是否包含标签
   */
  public hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  /**
   * 设置自定义属性
   * @param key 属性键
   * @param value 属性值
   */
  public setCustomProperty(key: string, value: any): void {
    this.customProperties.set(key, value);
    this.touch();
  }

  /**
   * 获取自定义属性
   * @param key 属性键
   * @returns 属性值
   */
  public getCustomProperty(key: string): any {
    return this.customProperties.get(key);
  }

  /**
   * 删除自定义属性
   * @param key 属性键
   */
  public deleteCustomProperty(key: string): void {
    this.customProperties.delete(key);
    this.touch();
  }

  /**
   * 更新对象最后修改时间
   */
  public touch(): void {
    this.updatedAt = new Date();
    this.version++;
  }

  /**
   * 克隆元数据
   * @returns 克隆的元数据对象
   */
  public clone(): ObjectMetadata {
    const clone = new ObjectMetadata(this.id, this.name, this.type);
    clone.tags = [...this.tags];
    clone.layerId = this.layerId;
    clone.locked = this.locked;
    clone.visible = this.visible;
    clone.createdAt = new Date(this.createdAt);
    clone.updatedAt = new Date(this.updatedAt);
    clone.customProperties = new Map(this.customProperties);
    clone.version = this.version;
    return clone;
  }

  /**
   * 序列化元数据
   * @returns 序列化的元数据对象
   */
  public serialize(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      tags: [...this.tags],
      layerId: this.layerId,
      locked: this.locked,
      visible: this.visible,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      customProperties: Object.fromEntries(this.customProperties),
      version: this.version
    };
  }

  /**
   * 从序列化数据反序列化元数据
   * @param data 序列化数据
   * @returns 元数据对象
   */
  public static deserialize(data: any): ObjectMetadata {
    const metadata = new ObjectMetadata(data.id, data.name, data.type);
    metadata.tags = data.tags || [];
    metadata.layerId = data.layerId;
    metadata.locked = data.locked || false;
    metadata.visible = data.visible !== undefined ? data.visible : true;
    metadata.createdAt = new Date(data.createdAt);
    metadata.updatedAt = new Date(data.updatedAt);
    metadata.customProperties = new Map(Object.entries(data.customProperties || {}));
    metadata.version = data.version || 1;
    return metadata;
  }
}