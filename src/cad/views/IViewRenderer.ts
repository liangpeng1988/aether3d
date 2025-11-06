/**
 * 视图渲染器接口
 * 视图呈现层的核心接口，基于Canvas3D组件定义视图相关的操作
 */
import * as THREE from 'three';
import { Document } from '../data/Document';
import { Aether3d } from '../../../Engine';
import { Canvas3DHandle } from './Canvas3D/types'; // 修复导入路径

export interface IViewRenderer {
  // 渲染器管理
  initialize(container: HTMLElement): void;
  resize(): void;
  render(): void;
  dispose(): void;
  
  // 场景操作
  setScene(document: Document): void;
  getScene(): Document | null;
  
  // 相机操作
  setCameraPosition(position: [number, number, number]): void;
  setCameraTarget(target: [number, number, number]): void;
  getCamera(): THREE.PerspectiveCamera | null;
  
  // 对象操作
  selectObject(object: THREE.Object3D | null): void;
  getSelectedObject(): THREE.Object3D | null;
  highlightObject(object: THREE.Object3D | null): void;
  
  // 视图控制
  setGridVisible(visible: boolean): void;
  setAxesVisible(visible: boolean): void;
  setBackgroundColor(color: string): void;
  
  // 交互事件
  onObjectSelected(callback: (object: THREE.Object3D | null) => void): void;
  onObjectHovered(callback: (object: THREE.Object3D | null) => void): void;
  onSceneReady(callback: (renderer: any) => void): void;
  
  // 性能监控
  getFPS(): number;
  getSceneStats(): any;
  
  // Canvas3D特定操作
  getCanvas3DHandle(): Canvas3DHandle | null;
  getAether3dRenderer(): Aether3d | null;
  focusOnObject(object: THREE.Object3D): void;
  setCameraToDefault(): void;
  enableCameraControls(enabled: boolean): void;
  forceResize(): void;
  setTransformMode(mode: 'translate' | 'rotate' | 'scale'): void;
  toggleTransformSpace(): 'world' | 'local';
}