/**
 * 图层控制器
 * 负责处理图层相关的操作，将MainLayout中的图层逻辑转移到这里
 */
import { Document } from '../data/Document';
import { LayerManager } from '../../../Engine/core/LayerManager';
import { ILayer } from '../../../Engine/interface/ILayer';

export class LayerController {
  private currentLayerId: string = 'layer1';
  private layerManager: LayerManager;

  constructor() {
    this.layerManager = new LayerManager();
  }

  /**
   * 添加图层
   * @param layer 图层信息
   */
  addLayer(layer: ILayer): void {
    this.layerManager.addLayer(layer);
  }

  /**
   * 获取所有图层
   */
  getAllLayers(): ILayer[] {
    return this.layerManager.getAllLayers();
  }

  /**
   * 获取当前图层ID
   */
  getCurrentLayerId(): string {
    return this.currentLayerId;
  }

  /**
   * 设置当前图层ID
   */
  setCurrentLayerId(layerId: string): void {
    this.currentLayerId = layerId;
  }

  /**
   * 处理图层选择变化
   */
  handleLayerSelect(layerId: string, document: Document | null): boolean {
    // 检查图层是否可见和未锁定
    const layer = this.layerManager.getLayer(layerId);
    
    if (layer) {
      if (!layer.visible) {
        console.warn(`图层 "${layer.name}" 当前不可见`);
        return false;
      }
      if (layer.locked) {
        console.warn(`图层 "${layer.name}" 当前已锁定`);
        return false;
      }
    }
    
    this.currentLayerId = layerId;
    console.log(`切换到图层: ${layerId}`);
    return true;
  }

  /**
   * 处理图层可见性变化
   */
  handleLayerVisibilityChange(layerId: string, visible: boolean): void {
    const layer = this.layerManager.getLayer(layerId);
    if (layer) {
      this.layerManager.setLayerVisibility(layerId, visible);
    }
    console.log(`图层 ${layerId} 可见性设置为: ${visible}`);
  }

  /**
   * 处理图层锁定状态变化
   */
  handleLayerLockChange(layerId: string, locked: boolean): void {
    const layer = this.layerManager.getLayer(layerId);
    if (layer) {
      this.layerManager.setLayerLock(layerId, locked);
    }
    console.log(`图层 ${layerId} 锁定状态设置为: ${locked}`);
  }

  /**
   * 处理图层颜色变化
   */
  handleLayerColorChange(layerId: string, color: string): void {
    const layer = this.layerManager.getLayer(layerId);
    if (layer) {
      this.layerManager.updateLayer(layerId, { color });
    }
    console.log(`图层 ${layerId} 颜色设置为: ${color}`);
  }

  /**
   * 处理图层重命名
   */
  handleLayerRename(layerId: string, name: string): void {
    const layer = this.layerManager.getLayer(layerId);
    if (layer) {
      this.layerManager.updateLayer(layerId, { name });
    }
    console.log(`图层 ${layerId} 重命名为: ${name}`);
  }

  /**
   * 添加新图层
   */
  handleAddLayer(): void {
    const layers = this.layerManager.getAllLayers();
    const newLayerId = `layer${Date.now()}`;
    const newLayer = this.layerManager.createLayer({
      name: `图层${layers.filter(layer => layer.id !== 'layer0').length + 1}`, // 修正图层编号逻辑，排除系统图层
      visible: true,
      locked: false,
      color: '#ffffff'
    }, newLayerId);
    console.log('添加新图层');
  }

  /**
   * 删除图层
   */
  handleDeleteLayer(layerId: string): boolean {
    const layers = this.layerManager.getAllLayers();
    // 不能删除最后一个图层
    if (layers.length <= 1) {
      console.warn('至少需要保留一个图层');
      return false;
    }
    
    this.layerManager.deleteLayer(layerId);
    
    // 如果删除的是当前图层，切换到第一个图层
    if (this.currentLayerId === layerId) {
      this.currentLayerId = layers[0].id;
    }
    
    console.log(`删除图层: ${layerId}`);
    return true;
  }
}