import { Scene, Object3D } from 'three';
import * as THREE from 'three';
import { LayerManager as EngineLayerManager } from '../../../Engine/core';
import { MetaScene } from '../../../Engine/core/MetaScene';
import { ILayer } from '../../../Engine/interface/ILayer';
import { LayerManager } from '../../../Engine/core/LayerManager';

/**
 * Document 类 - 继承自 MetaScene
 * 表示一个 CAD 文档，实现单向数据流架构的核心
 * 管理规范化的场景数据，并同步更新 Three.js 场景
 * 同时包含业务逻辑处理功能
 */
export class Document extends MetaScene {
  /** 文档ID */
  public readonly documentId: string;
  
  /** 文档名称 */
  public documentName: string;
  
  /** 创建时间 */
  public readonly createdAt: Date;
  
  /** 更新时间 */
  public updatedAt: Date;
  
  /** 文档元数据 */
  private _metadata: Map<string, any>;
  
  /** 实体数据 */
  private _entities: {
    lines: Map<string, LineData>;
    models: Map<string, ModelData>;
    materials: Map<string, MaterialData>;
    textures: Map<string, TextureData>;
    geometries: Map<string, GeometryData>;
  };
  
  /** 自定义数据 */
  private _customData: Map<string, any>;
  
  /** 场景对象映射 */
  private _sceneObjects: Map<string, THREE.Object3D>;

  constructor(name: string = '新建文档', documentId?: string) {
    super(); // MetaScene会自动创建MetadataManager
    
    this.documentId = documentId || this.generateId();
    this.documentName = name;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this._metadata = new Map();
    this._entities = {
      lines: new Map(),
      models: new Map(),
      materials: new Map(),
      textures: new Map(),
      geometries: new Map()
    };
    this._customData = new Map();
    this._sceneObjects = new Map();
    
    // 设置场景名称
    this.name = name;
  }
  
  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 生成实体ID
   */
  private generateEntityId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 更新文档修改时间
   */
  public touch(): void {
    this.updatedAt = new Date();
  }
  
  /**
   * 设置元数据
   */
  public setMetadata(key: string, value: any): void {
    this._metadata.set(key, value);
    this.touch();
  }
  
  /**
   * 获取元数据
   */
  public getMetadata(key: string): any {
    return this._metadata.get(key);
  }
  
  /**
   * 获取所有元数据
   */
  public getAllMetadata(): Record<string, any> {
    return Object.fromEntries(this._metadata);
  }
  
  /**
   * 创建系统图层
   */
  private createSystemLayer(): void {
    // 系统图层现在由LayerManager独立管理
  }
  
  // ==================== 文档操作 ====================
  
  /**
   * 保存文档
   */
  public saveDocument(): void {
    // 实现文档保存逻辑
    console.log(`保存文档: ${this.documentId}`);
    this.touch();
  }
  
  /**
   * 关闭文档
   */
  public closeDocument(): void {
    // 实现文档关闭逻辑
    console.log(`关闭文档: ${this.documentId}`);
  }
  
  // ==================== 线条数据管理 ====================
  
  /**
   * 添加线条数据
   */
  public addLine(line: LineData): void {
    this._entities.lines.set(line.id, line);
    this.touch();
  }
  
  /**
   * 创建线条数据
   */
  public createLine(lineData: Omit<LineData, 'id'>): LineData {
    const line: LineData = {
      ...lineData,
      id: this.generateEntityId('line')
    };
    this.addLine(line);
    return line;
  }
  
  /**
   * 移除线条数据
   */
  public removeLine(lineId: string): void {
    this._entities.lines.delete(lineId);
    // 同时从场景中移除对应的3D对象
    const lineObject = this._sceneObjects.get(lineId);
    if (lineObject) {
      this.remove(lineObject);
      this._sceneObjects.delete(lineId);
    }
    this.touch();
  }
  
  /**
   * 获取线条数据
   */
  public getLine(lineId: string): LineData | undefined {
    return this._entities.lines.get(lineId);
  }
  
  /**
   * 获取所有线条数据
   */
  public getAllLines(): LineData[] {
    return Array.from(this._entities.lines.values());
  }
  
  /**
   * 根据图层ID获取线条
   */
  public getLinesByLayer(layerId: string): LineData[] {
    return this.getAllLines().filter(line => line.layerId === layerId);
  }
  
  /**
   * 更新线条数据
   */
  public updateLine(lineId: string, updates: Partial<LineData>): void {
    const line = this._entities.lines.get(lineId);
    if (line) {
      Object.assign(line, updates);
      this.touch();
      
      // 同步更新场景中的对象
      this.syncEntityToScene('line', lineId);
    }
  }
  
  /**
   * 删除线条
   */
  public deleteLine(lineId: string): void {
    this.removeLine(lineId);
  }
  
  // ==================== 模型数据管理 ====================
  
  /**
   * 添加模型数据
   */
  public addModel(model: ModelData): void {
    this._entities.models.set(model.id, model);
    this.touch();
  }
  
  /**
   * 创建模型数据
   */
  public createModel(modelData: Omit<ModelData, 'id'>): ModelData {
    const model: ModelData = {
      ...modelData,
      id: this.generateEntityId('model')
    };
    this.addModel(model);
    return model;
  }
  
  /**
   * 移除模型数据
   */
  public removeModel(modelId: string): void {
    this._entities.models.delete(modelId);
    // 同时从场景中移除对应的3D对象
    const modelObject = this._sceneObjects.get(modelId);
    if (modelObject) {
      this.remove(modelObject);
      this._sceneObjects.delete(modelId);
    }
    this.touch();
  }
  
  /**
   * 获取模型数据
   */
  public getModel(modelId: string): ModelData | undefined {
    return this._entities.models.get(modelId);
  }
  
  /**
   * 获取所有模型数据
   */
  public getAllModels(): ModelData[] {
    return Array.from(this._entities.models.values());
  }
  
  /**
   * 更新模型数据
   */
  public updateModel(modelId: string, updates: Partial<ModelData>): void {
    const model = this._entities.models.get(modelId);
    if (model) {
      Object.assign(model, updates);
      this.touch();
      
      // 同步更新场景中的对象
      this.syncEntityToScene('model', modelId);
    }
  }
  
  /**
   * 删除模型
   */
  public deleteModel(modelId: string): void {
    this.removeModel(modelId);
  }
  
  /**
   * 加载模型
   */
  public async loadModel(modelId: string): Promise<void> {
    // 实现模型加载逻辑
    console.log(`加载模型: ${this.documentId}, ${modelId}`);
  }
  
  /**
   * 同步模型到场景（公共方法，供外部调用）
   * @param modelId 模型ID
   * @param glbLoader GLB加载器实例（可选）
   */
  public async syncModelToScene(modelId: string, glbLoader?: any): Promise<void> {
    const model = this.getModel(modelId);
    if (!model) {
      console.warn(`未找到模型: ${modelId}`);
      return;
    }
    
    // 如果是GLB/GLTF模型且提供了加载器，使用GLB加载器加载模型
    if ((model.type === 'glb' || model.type === 'gltf') && glbLoader) {
      try {
        // 如果场景中已存在该模型对象，先移除它
        const existingObject = this._sceneObjects.get(modelId);
        if (existingObject) {
          this.remove(existingObject);
          this._sceneObjects.delete(modelId);
        }
        
        // 加载模型
        const result = await glbLoader.loadModel(model.filePath, {
          addToScene: false,
          position: new THREE.Vector3(model.position.x, model.position.y, model.position.z)
        });
        
        if (result && result.scene) {
          // 设置模型的位置、旋转和缩放
          result.scene.position.set(model.position.x, model.position.y, model.position.z);
          result.scene.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
          result.scene.scale.set(model.scale.x, model.scale.y, model.scale.z);
          result.scene.visible = model.visible;
          
          // 设置用户数据，包括图层ID
          if (!result.scene.userData) {
            result.scene.userData = {};
          }
          result.scene.userData.id = modelId;
          if (model.layerId) {
            result.scene.userData.layerId = model.layerId;
          }
          
          // 添加到场景
          this.add(result.scene);
          
          // 更新场景对象映射
          this._sceneObjects.set(modelId, result.scene);
          
          console.log(`GLB模型同步到场景: ${modelId}, 图层ID: ${model.layerId}`);
        }
      } catch (error) {
        console.error(`加载GLB模型失败: ${modelId}`, error);
      }
    } else {
      // 对于其他类型的模型或没有GLB加载器的情况，使用默认同步方法
      this.syncModelToSceneInternal(modelId);
    }
  }
  
  /**
   * 内部同步模型到场景的方法
   */
  private syncModelToSceneInternal(modelId: string): void {
    const model = this.getModel(modelId);
    if (!model) {
      console.warn(`未找到模型: ${modelId}`);
      return;
    }
    
    // 如果场景中已存在该模型对象，先移除它
    const existingObject = this._sceneObjects.get(modelId);
    if (existingObject) {
      this.remove(existingObject);
      this._sceneObjects.delete(modelId);
    }
    
    // 创建新的3D对象并添加到场景
    const object = new THREE.Object3D();
    object.name = model.name;
    object.position.set(model.position.x, model.position.y, model.position.z);
    object.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
    object.scale.set(model.scale.x, model.scale.y, model.scale.z);
    object.visible = model.visible;
    
    // 设置用户数据，包括图层ID
    if (!object.userData) {
      object.userData = {};
    }
    object.userData.id = modelId;
    if (model.layerId) {
      object.userData.layerId = model.layerId;
    }
    
    // 添加到场景
    this.add(object);
    
    // 更新场景对象映射
    this._sceneObjects.set(modelId, object);
    
    console.log(`模型同步到场景: ${modelId}, 图层ID: ${model.layerId}`);
  }
  
  // ==================== 图层数据管理 ====================
  // 图层管理已移至LayerManager类中独立处理
  
  // ==================== 材质数据管理 ====================
  
  /**
   * 添加材质数据
   */
  public addMaterial(material: MaterialData): void {
    this._entities.materials.set(material.id, material);
    this.touch();
  }
  
  /**
   * 创建材质数据
   */
  public createMaterial(materialData: Omit<MaterialData, 'id'>): MaterialData {
    const material: MaterialData = {
      ...materialData,
      id: this.generateEntityId('material')
    };
    this.addMaterial(material);
    return material;
  }
  
  /**
   * 移除材质数据
   */
  public removeMaterial(materialId: string): void {
    this._entities.materials.delete(materialId);
    this.touch();
  }
  
  /**
   * 获取材质数据
   */
  public getMaterial(materialId: string): MaterialData | undefined {
    return this._entities.materials.get(materialId);
  }
  
  /**
   * 获取所有材质数据
   */
  public getAllMaterials(): MaterialData[] {
    return Array.from(this._entities.materials.values());
  }
  
  /**
   * 更新材质数据
   */
  public updateMaterial(materialId: string, updates: Partial<MaterialData>): void {
    const material = this._entities.materials.get(materialId);
    if (material) {
      Object.assign(material, updates);
      this.touch();
    }
  }
  
  /**
   * 删除材质
   */
  public deleteMaterial(materialId: string): void {
    this.removeMaterial(materialId);
  }
  
  // ==================== 纹理数据管理 ====================
  
  /**
   * 添加纹理数据
   */
  public addTexture(texture: TextureData): void {
    this._entities.textures.set(texture.id, texture);
    this.touch();
  }
  
  /**
   * 创建纹理数据
   */
  public createTexture(textureData: Omit<TextureData, 'id'>): TextureData {
    const texture: TextureData = {
      ...textureData,
      id: this.generateEntityId('texture')
    };
    this.addTexture(texture);
    return texture;
  }
  
  /**
   * 移除纹理数据
   */
  public removeTexture(textureId: string): void {
    this._entities.textures.delete(textureId);
    this.touch();
  }
  
  /**
   * 获取纹理数据
   */
  public getTexture(textureId: string): TextureData | undefined {
    return this._entities.textures.get(textureId);
  }
  
  /**
   * 获取所有纹理数据
   */
  public getAllTextures(): TextureData[] {
    return Array.from(this._entities.textures.values());
  }
  
  /**
   * 更新纹理数据
   */
  public updateTexture(textureId: string, updates: Partial<TextureData>): void {
    const texture = this._entities.textures.get(textureId);
    if (texture) {
      Object.assign(texture, updates);
      this.touch();
    }
  }
  
  /**
   * 删除纹理
   */
  public deleteTexture(textureId: string): void {
    this.removeTexture(textureId);
  }
  
  // ==================== 几何体数据管理 ====================
  
  /**
   * 添加几何体数据
   */
  public addGeometry(geometry: GeometryData): void {
    this._entities.geometries.set(geometry.id, geometry);
    this.touch();
  }
  
  /**
   * 创建几何体数据
   */
  public createGeometry(geometryData: Omit<GeometryData, 'id'>): GeometryData {
    const geometry: GeometryData = {
      ...geometryData,
      id: this.generateEntityId('geometry')
    };
    this.addGeometry(geometry);
    return geometry;
  }
  
  /**
   * 移除几何体数据
   */
  public removeGeometry(geometryId: string): void {
    this._entities.geometries.delete(geometryId);
    this.touch();
  }
  
  /**
   * 获取几何体数据
   */
  public getGeometry(geometryId: string): GeometryData | undefined {
    return this._entities.geometries.get(geometryId);
  }
  
  /**
   * 获取所有几何体数据
   */
  public getAllGeometries(): GeometryData[] {
    return Array.from(this._entities.geometries.values());
  }
  
  /**
   * 更新几何体数据
   */
  public updateGeometry(geometryId: string, updates: Partial<GeometryData>): void {
    const geometry = this._entities.geometries.get(geometryId);
    if (geometry) {
      Object.assign(geometry, updates);
      this.touch();
    }
  }
  
  /**
   * 删除几何体
   */
  public deleteGeometry(geometryId: string): void {
    this.removeGeometry(geometryId);
  }
  
  // ==================== 同步操作 ====================
  
  /**
   * 同步实体到场景
   */
  public syncEntityToScene(entityType: string, entityId: string): void {
    // 实现实体同步到场景的逻辑
    console.log(`同步实体到场景: ${entityType}, ${entityId}`);
    
    switch (entityType) {
      case 'model':
        this.syncModelToScene(entityId);
        break;
      case 'line':
        this.syncLineToScene(entityId);
        break;
      case 'layer':
        this.syncLayerToScene(entityId);
        break;
      // 其他实体类型的同步可以在这里添加
    }
  }
  
  /**
   * 同步线条到场景
   */
  private syncLineToScene(lineId: string): void {
    const line = this.getLine(lineId);
    if (!line) {
      console.warn(`未找到线条: ${lineId}`);
      return;
    }
    
    // 如果场景中已存在该线条对象，先移除它
    const existingObject = this._sceneObjects.get(lineId);
    if (existingObject) {
      this.remove(existingObject);
      this._sceneObjects.delete(lineId);
    }
    
    // 创建线条的3D表示
    if (line.points && line.points.length >= 2) {
      const points = line.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: line.color || 0xffffff,
        linewidth: line.width || 1
      });
      const lineObject = new THREE.Line(geometry, material);
      lineObject.name = `Line_${lineId}`;
      
      // 设置用户数据，包括图层ID
      if (!lineObject.userData) {
        lineObject.userData = {};
      }
      lineObject.userData.id = lineId;
      if (line.layerId) {
        lineObject.userData.layerId = line.layerId;
      }
      
      // 添加到场景
      this.add(lineObject);
      
      // 更新场景对象映射
      this._sceneObjects.set(lineId, lineObject);
      
      console.log(`线条同步到场景: ${lineId}, 图层ID: ${line.layerId}`);
    }
  }
  
  /**
   * 同步图层到场景
   */
  private syncLayerToScene(layerId: string): void {
    // 图层信息通常不需要创建3D对象，但可以在这里处理其他逻辑
    console.log(`图层信息同步: ${layerId}`);
  }
  
  /**
   * 同步文档到场景
   */
  public async syncDocumentToScene(): Promise<void> {
    // 实现文档同步到场景的逻辑
    console.log(`同步文档到场景: ${this.documentId}`);
  }
  
  /**
   * 同步所有实体到场景
   * @param options 同步选项，包含GLB加载器等
   */
  public syncAllEntitiesToScene(options?: { glbLoader?: any }): void {
    // 实现同步所有实体到场景的逻辑
    console.log(`同步所有实体到场景: ${this.documentId}`);
    
    // 同步线条
    this.getAllLines().forEach(line => {
      this.syncEntityToScene('line', line.id);
    });
    
    // 同步模型
    this.getAllModels().forEach(model => {
      this.syncEntityToScene('model', model.id);
    });
    
    // 同步材质
    this.getAllMaterials().forEach(material => {
      this.syncEntityToScene('material', material.id);
    });
    
    // 同步纹理
    this.getAllTextures().forEach(texture => {
      this.syncEntityToScene('texture', texture.id);
    });
    
    // 同步几何体
    this.getAllGeometries().forEach(geometry => {
      this.syncEntityToScene('geometry', geometry.id);
    });
  }
  
  // ==================== 统计信息 ====================
  
  /**
   * 获取文档统计信息
   */
  public getDocumentStatistics(): any {
    return {
      objectCount: this.getAllLines().length + this.getAllModels().length,
      lineCount: this.getAllLines().length,
      modelCount: this.getAllModels().length,
      materialCount: this.getAllMaterials().length,
      textureCount: this.getAllTextures().length,
      geometryCount: this.getAllGeometries().length
    };
  }
}

/**
 * 图层信息接口
 */
export interface LayerInfo extends ILayer {}

/**
 * 材质数据接口
 */
export interface MaterialData {
  id: string;
  type: string; // 'MeshBasicMaterial' | 'MeshStandardMaterial' 等
  properties: Record<string, any>;
  textureIds?: string[];
}

/**
 * 纹理数据接口
 */
export interface TextureData {
  id: string;
  url: string;
  type: string; // 'ImageTexture' | 'DataTexture' 等
  properties: Record<string, any>;
}

/**
 * 几何体数据接口
 */
export interface GeometryData {
  id: string;
  type: string; // 'BoxGeometry' | 'SphereGeometry' 等
  parameters: any[];
  attributes: Record<string, any>;
}

/**
 * 模型数据接口
 */
export interface ModelData {
  id: string;
  name: string;
  filePath: string;
  type: string; // 'glb' | 'gltf' | 'fbx' | 'obj' 等
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  visible: boolean;
  layerId?: string;
  materialIds?: string[];
  geometryId?: string;
  metadata?: Record<string, any>;
}

/**
 * 文档统计信息接口
 */
export interface DocumentStatistics {
  objectCount: number;
  lineCount: number;
  modelCount: number;
  materialCount: number;
  textureCount: number;
  geometryCount: number;
  customDataCount: number;
}

/**
 * 文档数据接口（用于序列化）
 */
export interface DocumentData {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
  objectCount: number;
  lines: LineData[];
  models: ModelData[];
  materials: MaterialData[];
  textures: TextureData[];
  geometries: GeometryData[];
  customData: Record<string, any>;
}

/**
 * 线条数据接口（保留兼容性）
 */
export interface LineData {
  id: string;
  points: { x: number; y: number; z: number }[];
  color: string;
  width: number;
  layerId?: string;
}