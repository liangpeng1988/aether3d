/**
 * 文档管理器类
 * 专门用于管理多个文档的创建、保存、加载和删除操作
 * 使用DocumentRepository进行数据持久化
 */

import { DocumentRepository } from './DocumentRepository';
import { Document, LineData } from './Document';

export class DocumentManager {
  private documentRepository: DocumentRepository;
  private currentDocumentId: string | null = null;

  constructor() {
    try {
      this.documentRepository = new DocumentRepository();
    } catch (error) {
      console.error('初始化文档仓库时出错:', error);
      // 创建一个空的文档仓库作为后备
      this.documentRepository = {
        createDocument: (name: string) => {
          const doc = new Document(name);
          return doc;
        },
        saveDocumentData: (documentId: string) => {},
        getDocument: (documentId: string) => null,
        listDocuments: () => [],
        deleteDocument: (documentId: string) => {},
        addLine: (documentId: string, line: LineData) => {},
        getAllLines: (documentId: string) => []
      } as any;
    }
  }

  /**
   * 创建新文档
   * @param name 文档名称
   * @returns 文档ID
   */
  public createDocument(name: string): string {
    try {
      const document = this.documentRepository.createDocument(name);
      this.currentDocumentId = document.documentId;
      return document.documentId;
    } catch (error) {
      console.error('创建文档时出错:', error);
      // 创建一个默认文档作为后备
      const document = new Document(name);
      this.currentDocumentId = document.documentId;
      return document.documentId;
    }
  }

  /**
   * 保存文档
   * @param documentId 文档ID
   * @param lines 线条数据
   */
  public saveDocument(documentId: string, lines: LineData[]): void {
    try {
      // 保存文档数据
      this.documentRepository.saveDocumentData(documentId);
    } catch (error) {
      console.error('保存文档时出错:', error);
    }
  }

  /**
   * 加载文档
   * @param documentId 文档ID
   * @returns 文档实例
   */
  public loadDocument(documentId: string): Document | null {
    try {
      const document = this.documentRepository.getDocument(documentId);
      if (document) {
        this.currentDocumentId = documentId;
      }
      return document;
    } catch (error) {
      console.error('加载文档时出错:', error);
      return null;
    }
  }

  /**
   * 获取所有文档列表
   * @returns 文档列表
   */
  public listDocuments(): { id: string; name: string; updatedAt: Date }[] {
    try {
      return this.documentRepository.listDocuments();
    } catch (error) {
      console.error('获取文档列表时出错:', error);
      return [];
    }
  }

  /**
   * 删除文档
   * @param documentId 文档ID
   */
  public deleteDocument(documentId: string): void {
    try {
      this.documentRepository.deleteDocument(documentId);
      if (this.currentDocumentId === documentId) {
        this.currentDocumentId = null;
      }
    } catch (error) {
      console.error('删除文档时出错:', error);
    }
  }

  /**
   * 获取当前文档ID
   * @returns 当前文档ID或null
   */
  public getCurrentDocumentId(): string | null {
    return this.currentDocumentId;
  }

  /**
   * 设置当前文档
   * @param documentId 文档ID
   */
  public setCurrentDocument(documentId: string): void {
    try {
      const document = this.documentRepository.getDocument(documentId);
      if (document) {
        this.currentDocumentId = documentId;
      } else {
        throw new Error(`Document with id ${documentId} not found`);
      }
    } catch (error) {
      console.error('设置当前文档时出错:', error);
      throw error;
    }
  }

  /**
   * 向当前文档添加线条
   * @param line 线条数据
   */
  public addLineToCurrentDocument(line: LineData): void {
    if (!this.currentDocumentId) {
      throw new Error('No document is currently selected');
    }
    
    try {
      this.documentRepository.addLine(this.currentDocumentId, line);
    } catch (error) {
      console.error('添加线条到文档时出错:', error);
    }
  }

  /**
   * 获取当前文档的所有线条
   * @returns 线条数据数组
   */
  public getCurrentDocumentLines(): LineData[] {
    if (!this.currentDocumentId) {
      return [];
    }
    
    try {
      return this.documentRepository.getAllLines(this.currentDocumentId);
    } catch (error) {
      console.error('获取文档线条时出错:', error);
      return [];
    }
  }

  /**
   * 获取指定图层的线条
   * @param layerId 图层ID
   * @returns 指定图层的线条数据数组
   */
  public getLinesByLayer(layerId: string): LineData[] {
    if (!this.currentDocumentId) {
      return [];
    }
    
    try {
      return this.documentRepository.getAllLines(this.currentDocumentId).filter(line => line.layerId === layerId);
    } catch (error) {
      console.error('获取图层线条时出错:', error);
      return [];
    }
  }
}