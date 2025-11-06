/**
 * 文档数据仓库实现
 * 数据管理层的具体实现，负责文档数据的持久化和管理
 */
import { Document, LineData, ModelData, MaterialData, TextureData, GeometryData } from './Document';
import { IDocumentRepository } from './IDocumentRepository';

export class DocumentRepository implements IDocumentRepository {
  private documents: Map<string, Document> = new Map();

  // 文档管理
  createDocument(name: string): Document {
    const document = new Document(name);
    this.documents.set(document.documentId, document);
    return document;
  }

  getDocument(documentId: string): Document | null {
    return this.documents.get(documentId) || null;
  }

  updateDocument(documentId: string, updates: Partial<Document>): void {
    const document = this.documents.get(documentId);
    if (document) {
      Object.assign(document, updates);
      document.touch();
    }
  }

  deleteDocument(documentId: string): void {
    this.documents.delete(documentId);
  }

  listDocuments(): { id: string; name: string; updatedAt: Date }[] {
    return Array.from(this.documents.values()).map(doc => ({
      id: doc.documentId,
      name: doc.documentName,
      updatedAt: doc.updatedAt
    }));
  }

  saveDocumentData(documentId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.saveDocument();
    }
  }

  closeDocument(documentId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.closeDocument();
    }
  }

  // 线条数据管理
  addLine(documentId: string, line: LineData): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.addLine(line);
    }
  }

  getLine(documentId: string, lineId: string): LineData | undefined {
    const document = this.documents.get(documentId);
    return document ? document.getLine(lineId) : undefined;
  }

  getAllLines(documentId: string): LineData[] {
    const document = this.documents.get(documentId);
    return document ? document.getAllLines() : [];
  }

  updateLine(documentId: string, lineId: string, updates: Partial<LineData>): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.updateLine(lineId, updates);
    }
  }

  removeLine(documentId: string, lineId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.removeLine(lineId);
    }
  }

  createLine(documentId: string, lineData: Omit<LineData, 'id'>): LineData {
    const document = this.documents.get(documentId);
    if (document) {
      return document.createLine(lineData);
    }
    // 如果文档不存在，创建一个默认的线条对象
    return {
      ...lineData,
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    } as LineData;
  }

  deleteLine(documentId: string, lineId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.deleteLine(lineId);
    }
  }

  // 模型数据管理
  addModel(documentId: string, model: ModelData): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.addModel(model);
    }
  }

  getModel(documentId: string, modelId: string): ModelData | undefined {
    const document = this.documents.get(documentId);
    return document ? document.getModel(modelId) : undefined;
  }

  getAllModels(documentId: string): ModelData[] {
    const document = this.documents.get(documentId);
    return document ? document.getAllModels() : [];
  }

  updateModel(documentId: string, modelId: string, updates: Partial<ModelData>): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.updateModel(modelId, updates);
    }
  }

  removeModel(documentId: string, modelId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.removeModel(modelId);
    }
  }

  createModel(documentId: string, modelData: Omit<ModelData, 'id'>): ModelData {
    const document = this.documents.get(documentId);
    if (document) {
      return document.createModel(modelData);
    }
    // 如果文档不存在，创建一个默认的模型对象
    return {
      ...modelData,
      id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    } as ModelData;
  }

  deleteModel(documentId: string, modelId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.deleteModel(modelId);
    }
  }

  async loadModel(documentId: string, modelId: string): Promise<void> {
    const document = this.documents.get(documentId);
    if (document) {
      await document.loadModel(modelId);
    }
  }

  // 图层数据管理
  // 图层管理已移至LayerManager类中独立处理

  // 材质数据管理
  addMaterial(documentId: string, material: MaterialData): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.addMaterial(material);
    }
  }

  getMaterial(documentId: string, materialId: string): MaterialData | undefined {
    const document = this.documents.get(documentId);
    return document ? document.getMaterial(materialId) : undefined;
  }

  getAllMaterials(documentId: string): MaterialData[] {
    const document = this.documents.get(documentId);
    return document ? document.getAllMaterials() : [];
  }

  updateMaterial(documentId: string, materialId: string, updates: Partial<MaterialData>): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.updateMaterial(materialId, updates);
    }
  }

  removeMaterial(documentId: string, materialId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.removeMaterial(materialId);
    }
  }

  createMaterial(documentId: string, materialData: Omit<MaterialData, 'id'>): MaterialData {
    const document = this.documents.get(documentId);
    if (document) {
      return document.createMaterial(materialData);
    }
    // 如果文档不存在，创建一个默认的材质对象
    return {
      ...materialData,
      id: `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    } as MaterialData;
  }

  deleteMaterial(documentId: string, materialId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.deleteMaterial(materialId);
    }
  }

  // 纹理数据管理
  addTexture(documentId: string, texture: TextureData): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.addTexture(texture);
    }
  }

  getTexture(documentId: string, textureId: string): TextureData | undefined {
    const document = this.documents.get(documentId);
    return document ? document.getTexture(textureId) : undefined;
  }

  getAllTextures(documentId: string): TextureData[] {
    const document = this.documents.get(documentId);
    return document ? document.getAllTextures() : [];
  }

  updateTexture(documentId: string, textureId: string, updates: Partial<TextureData>): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.updateTexture(textureId, updates);
    }
  }

  removeTexture(documentId: string, textureId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.removeTexture(textureId);
    }
  }

  createTexture(documentId: string, textureData: Omit<TextureData, 'id'>): TextureData {
    const document = this.documents.get(documentId);
    if (document) {
      return document.createTexture(textureData);
    }
    // 如果文档不存在，创建一个默认的纹理对象
    return {
      ...textureData,
      id: `texture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    } as TextureData;
  }

  deleteTexture(documentId: string, textureId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.deleteTexture(textureId);
    }
  }

  // 几何体数据管理
  addGeometry(documentId: string, geometry: GeometryData): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.addGeometry(geometry);
    }
  }

  getGeometry(documentId: string, geometryId: string): GeometryData | undefined {
    const document = this.documents.get(documentId);
    return document ? document.getGeometry(geometryId) : undefined;
  }

  getAllGeometries(documentId: string): GeometryData[] {
    const document = this.documents.get(documentId);
    return document ? document.getAllGeometries() : [];
  }

  updateGeometry(documentId: string, geometryId: string, updates: Partial<GeometryData>): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.updateGeometry(geometryId, updates);
    }
  }

  removeGeometry(documentId: string, geometryId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.removeGeometry(geometryId);
    }
  }

  createGeometry(documentId: string, geometryData: Omit<GeometryData, 'id'>): GeometryData {
    const document = this.documents.get(documentId);
    if (document) {
      return document.createGeometry(geometryData);
    }
    // 如果文档不存在，创建一个默认的几何体对象
    return {
      ...geometryData,
      id: `geometry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    } as GeometryData;
  }

  deleteGeometry(documentId: string, geometryId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.deleteGeometry(geometryId);
    }
  }

  // 同步操作
  async syncDocumentToScene(documentId: string): Promise<void> {
    const document = this.documents.get(documentId);
    if (document) {
      await document.syncDocumentToScene();
    }
  }

  syncEntityToScene(documentId: string, entityType: string, entityId: string): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.syncEntityToScene(entityType, entityId);
    }
  }

  // 统计信息
  getDocumentStatistics(documentId: string): any {
    const document = this.documents.get(documentId);
    if (document) {
      return document.getDocumentStatistics();
    }
    return null;
  }

  // 元数据管理
  setMetadata(documentId: string, key: string, value: any): void {
    const document = this.documents.get(documentId);
    if (document) {
      document.setMetadata(key, value);
    }
  }

  getMetadata(documentId: string, key: string): any {
    const document = this.documents.get(documentId);
    return document ? document.getMetadata(key) : undefined;
  }

  getAllMetadata(documentId: string): Record<string, any> {
    const document = this.documents.get(documentId);
    return document ? document.getAllMetadata() : {};
  }
}