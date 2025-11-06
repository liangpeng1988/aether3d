/**
 * 文档数据仓库接口
 * 定义数据管理层的核心操作接口
 */
import { Document, LineData, ModelData, LayerInfo, MaterialData, TextureData, GeometryData } from './Document';
import { ILayer } from '../../../Engine/interface/ILayer';

export interface IDocumentRepository {
  // 文档管理
  createDocument(name: string): Document;
  getDocument(documentId: string): Document | null;
  updateDocument(documentId: string, updates: Partial<Document>): void;
  deleteDocument(documentId: string): void;
  listDocuments(): { id: string; name: string; updatedAt: Date }[];
  saveDocumentData(documentId: string): void;
  closeDocument(documentId: string): void;
  
  // 线条数据管理
  addLine(documentId: string, line: LineData): void;
  getLine(documentId: string, lineId: string): LineData | undefined;
  getAllLines(documentId: string): LineData[];
  updateLine(documentId: string, lineId: string, updates: Partial<LineData>): void;
  removeLine(documentId: string, lineId: string): void;
  createLine(documentId: string, lineData: Omit<LineData, 'id'>): LineData;
  deleteLine(documentId: string, lineId: string): void;
  
  // 模型数据管理
  addModel(documentId: string, model: ModelData): void;
  getModel(documentId: string, modelId: string): ModelData | undefined;
  getAllModels(documentId: string): ModelData[];
  updateModel(documentId: string, modelId: string, updates: Partial<ModelData>): void;
  removeModel(documentId: string, modelId: string): void;
  createModel(documentId: string, modelData: Omit<ModelData, 'id'>): ModelData;
  deleteModel(documentId: string, modelId: string): void;
  loadModel(documentId: string, modelId: string): Promise<void>;
  
  // 材质数据管理
  addMaterial(documentId: string, material: MaterialData): void;
  getMaterial(documentId: string, materialId: string): MaterialData | undefined;
  getAllMaterials(documentId: string): MaterialData[];
  updateMaterial(documentId: string, materialId: string, updates: Partial<MaterialData>): void;
  removeMaterial(documentId: string, materialId: string): void;
  createMaterial(documentId: string, materialData: Omit<MaterialData, 'id'>): MaterialData;
  deleteMaterial(documentId: string, materialId: string): void;
  
  // 纹理数据管理
  addTexture(documentId: string, texture: TextureData): void;
  getTexture(documentId: string, textureId: string): TextureData | undefined;
  getAllTextures(documentId: string): TextureData[];
  updateTexture(documentId: string, textureId: string, updates: Partial<TextureData>): void;
  removeTexture(documentId: string, textureId: string): void;
  createTexture(documentId: string, textureData: Omit<TextureData, 'id'>): TextureData;
  deleteTexture(documentId: string, textureId: string): void;
  
  // 几何体数据管理
  addGeometry(documentId: string, geometry: GeometryData): void;
  getGeometry(documentId: string, geometryId: string): GeometryData | undefined;
  getAllGeometries(documentId: string): GeometryData[];
  updateGeometry(documentId: string, geometryId: string, updates: Partial<GeometryData>): void;
  removeGeometry(documentId: string, geometryId: string): void;
  createGeometry(documentId: string, geometryData: Omit<GeometryData, 'id'>): GeometryData;
  deleteGeometry(documentId: string, geometryId: string): void;
  
  // 同步操作
  syncDocumentToScene(documentId: string): Promise<void>;
  syncEntityToScene(documentId: string, entityType: string, entityId: string): void;
  
  // 统计信息
  getDocumentStatistics(documentId: string): any;
  
  // 元数据管理
  setMetadata(documentId: string, key: string, value: any): void;
  getMetadata(documentId: string, key: string): any;
  getAllMetadata(documentId: string): Record<string, any>;
}