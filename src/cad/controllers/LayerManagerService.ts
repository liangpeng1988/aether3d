/**
 * 图层管理服务
 * 统一管理图层相关的操作，包括图层过滤、对象锁定检查等
 */

import * as THREE from 'three';
import { Document } from '../data/Document';
import { ILayer } from '../../../Engine/interface/ILayer';
import { LayerManager } from '../../../Engine/core';

export class LayerManagerService {
  /**
   * 检查对象是否属于系统图层（图层0）
   * @param object 3D对象
   * @returns 是否属于系统图层
   */
  public static isSystemLayerObject(object: THREE.Object3D): boolean {
    // 确保对象有userData属性
    if (!object.userData) {
      // console.log(`[LayerManagerService] 对象没有userData: ${object.name}`);
      return false;
    }
    const isSystemLayer = object.userData.layerId === 'layer0';
    // console.log(`[LayerManagerService] 检查对象是否为系统图层: ${object.name}, layerId: ${object.userData.layerId}, 结果: ${isSystemLayer}`);
    return isSystemLayer;
  }

  /**
   * 检查对象是否被锁定
   * @param object 3D对象
   * @returns 是否被锁定
   */
  public static isObjectLocked(object: THREE.Object3D): boolean {
    // 确保对象有userData属性
    if (!object.userData) {
      // console.log(`[LayerManagerService] 对象没有userData: ${object.name}`);
      return false;
    }
    const isLocked = object.userData.locked === true;
    // console.log(`[LayerManagerService] 检查对象是否被锁定: ${object.name}, locked: ${object.userData.locked}, 结果: ${isLocked}`);
    return isLocked;
  }

  /**
   * 检查对象是否可以交互（不是系统图层对象且未被锁定）
   * @param object 3D对象
   * @returns 是否可以交互
   */
  public static isObjectInteractable(object: THREE.Object3D): boolean {
    // console.log(`[LayerManagerService] 检查对象是否可以交互: ${object.name}`);
    // 检查是否为系统图层对象
    if (this.isSystemLayerObject(object)) {
      // console.log(`[LayerManagerService] 对象是系统图层对象，不可交互: ${object.name}`);
      return false;
    }

    // 检查是否被锁定
    if (this.isObjectLocked(object)) {
      // console.log(`[LayerManagerService] 对象被锁定，不可交互: ${object.name}`);
      return false;
    }

    // console.log(`[LayerManagerService] 对象可以交互: ${object.name}`);
    return true;
  }

  /**
   * 获取所有用户图层（过滤掉系统图层）
   * @param layers 图层数组
   * @returns 用户图层数组
   */
  public static getUserLayers(layers: ILayer[]): ILayer[] {
    return layers.filter(layer => layer.id !== 'layer0');
  }

  /**
   * 获取用户线条（过滤掉系统图层中的线条）
   * @param document 文档实例
   * @returns 用户线条数组
   */
  public static getUserLines(document: Document): any[] {
    // 确保document存在且有getAllLines方法
    if (!document || typeof document.getAllLines !== 'function') {
      return [];
    }
    return document.getAllLines().filter(line => line.layerId !== 'layer0');
  }

  /**
   * 获取用户模型（过滤掉系统图层中的模型）
   * @param document 文档实例
   * @returns 用户模型数组
   */
  public static getUserModels(document: Document): any[] {
    // 确保document存在且有getAllModels方法
    if (!document || typeof document.getAllModels !== 'function') {
      return [];
    }
    return document.getAllModels().filter(model => model.layerId !== 'layer0');
  }

  /**
   * 获取图层中对象的数量
   * @param document 文档实例
   * @param layerId 图层ID
   * @returns 对象数量
   */
  public static getObjectCountInLayer(document: Document, layerId: string): number {
    // 确保document存在
    if (!document) {
      return 0;
    }
    
    let lines = 0;
    let models = 0;
    
    // 安全地获取线条数量
    if (typeof document.getAllLines === 'function') {
      lines = document.getAllLines().filter(line => line.layerId === layerId).length;
    }
    
    // 安全地获取模型数量
    if (typeof document.getAllModels === 'function') {
      models = document.getAllModels().filter(model => model.layerId === layerId).length;
    }
    
    return lines + models;
  }
}