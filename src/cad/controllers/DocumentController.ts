/**
 * 文档控制器
 * 负责处理文档相关的操作，将MainLayout中的文档逻辑转移到这里
 */
import { DocumentManager } from '../data/DocumentManager';
import { DocumentData, Document, LineData } from '../data/Document';

export class DocumentController {
  private documentManager: DocumentManager;
  private currentDocumentId: string | null = null;

  constructor() {
    this.documentManager = new DocumentManager();
  }

  /**
   * 创建新文档
   */
  createDocument(name: string): string {
    const documentId = this.documentManager.createDocument(name);
    this.currentDocumentId = documentId;
    return documentId;
  }

  /**
   * 保存文档
   */
  saveDocument(documentId: string, lineData: LineData[]): void {
    this.documentManager.saveDocument(documentId, lineData);
  }

  /**
   * 加载文档
   */
  loadDocument(documentId: string): Document | null {
    const document = this.documentManager.loadDocument(documentId);
    if (document) {
      this.currentDocumentId = documentId;
    }
    return document;
  }

  /**
   * 删除文档
   */
  deleteDocument(documentId: string): void {
    this.documentManager.deleteDocument(documentId);
    if (this.currentDocumentId === documentId) {
      this.currentDocumentId = null;
    }
  }

  /**
   * 获取文档列表
   */
  listDocuments(): { id: string; name: string; updatedAt: Date }[] {
    return this.documentManager.listDocuments();
  }

  /**
   * 获取当前文档ID
   */
  getCurrentDocumentId(): string | null {
    return this.currentDocumentId;
  }

  /**
   * 设置当前文档ID
   */
  setCurrentDocumentId(documentId: string): void {
    this.currentDocumentId = documentId;
  }

  /**
   * 添加线条到当前文档
   */
  addLineToCurrentDocument(line: LineData): void {
    if (this.currentDocumentId) {
      // 这里应该实现将线条添加到文档的逻辑
      console.log('线段已保存到文档:', line);
    }
  }

  /**
   * 获取指定文档的所有线条
   */
  getAllLines(documentId: string): LineData[] {
    try {
      const document = this.documentManager.loadDocument(documentId);
      if (document) {
        return this.documentManager.getCurrentDocumentLines();
      }
    } catch (error) {
      console.error('获取文档线条时出错:', error);
    }
    return [];
  }

  /**
   * 获取指定文档的所有模型
   */
  getAllModels(documentId: string): any[] {
    try {
      const document = this.documentManager.loadDocument(documentId);
      if (document) {
        return document.getAllModels();
      }
    } catch (error) {
      console.error('获取文档模型时出错:', error);
    }
    return [];
  }

  /**
   * 获取指定图层的线条
   */
  getLinesByLayer(layerId: string): LineData[] {
    try {
      // 这里应该实现从文档中获取指定图层线条的逻辑
      return [];
    } catch (error) {
      console.error('获取图层线条时出错:', error);
      return [];
    }
  }
}