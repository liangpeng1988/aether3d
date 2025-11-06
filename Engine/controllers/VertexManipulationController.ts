import { ScriptBase } from '../core/ScriptBase';
import { THREE } from '../core/global';
import { VertexSelectionScript } from './VertexSelectionScript';

/**
 * 顶点操作控制器
 * 用于处理3D模型顶点的移动和变形操作
 */
export class VertexManipulationController extends ScriptBase {
  public name = 'VertexManipulationController';
  
  private vertexSelectionScript: VertexSelectionScript | null = null;
  private isDragging = false;
  private dragStartPoint: THREE.Vector3 | null = null;
  private selectedVertexIndex: number | null = null;
  private originalVertexPosition: THREE.Vector3 | null = null;

  constructor() {
    super();
  }

  /**
   * 初始化控制器
   */
  public initialize(vertexSelectionScript: VertexSelectionScript): void {
    this.vertexSelectionScript = vertexSelectionScript;
    
    // 添加鼠标事件监听器
    this.addEventListeners();
  }

  /**
   * 添加事件监听器
   */
  private addEventListeners(): void {
    if (this.renderer) {
      const canvas = this.renderer.renderer.domElement;
      canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
      canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
      canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
  }

  /**
   * 鼠标按下事件处理
   */
  private onMouseDown(event: MouseEvent): void {
    if (!this.vertexSelectionScript) return;
    
    // 检查是否选中了顶点
    // 注意：这里需要根据实际的VertexSelectionScript接口来调整
    const selectedObjects = this.vertexSelectionScript.getSelectedObjects();
    if (selectedObjects.length > 0) {
      this.isDragging = true;
      this.dragStartPoint = new THREE.Vector3(event.clientX, event.clientY, 0);
      // 这里需要根据实际需求调整顶点索引的获取方式
      this.selectedVertexIndex = 0;
      
      console.log('开始拖拽顶点');
    }
  }

  /**
   * 鼠标移动事件处理
   */
  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || !this.vertexSelectionScript || this.selectedVertexIndex === null) return;
    
    // 计算鼠标移动距离
    const currentPoint = new THREE.Vector3(event.clientX, event.clientY, 0);
    if (this.dragStartPoint) {
      const delta = new THREE.Vector3().subVectors(currentPoint, this.dragStartPoint);
      
      // 移动顶点
      this.moveVertex(this.selectedVertexIndex, delta);
    }
  }

  /**
   * 鼠标释放事件处理
   */
  private onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragStartPoint = null;
      this.selectedVertexIndex = null;
      this.originalVertexPosition = null;
      
      console.log('结束顶点拖拽');
    }
  }

  /**
   * 移动顶点
   */
  public moveVertex(index: number, delta: THREE.Vector3): void {
    if (!this.vertexSelectionScript) return;
    
    // 获取选中的对象
    const selectedObjects = this.vertexSelectionScript.getSelectedObjects();
    if (selectedObjects.length === 0) return;
    
    const selectedObject = selectedObjects[0];
    if (!(selectedObject instanceof THREE.Mesh)) return;
    
    const mesh = selectedObject as THREE.Mesh;
    const geometry = mesh.geometry;
    
    // 确保几何体有位置属性
    if (!geometry.attributes.position) return;
    
    const positions = geometry.attributes.position.array as Float32Array;
    
    // 转换delta到局部坐标系
    const localDelta = delta.clone();
    if (mesh.parent) {
      // 应用父对象的变换
      localDelta.applyQuaternion(mesh.parent.quaternion.clone().invert());
    }
    
    // 更新顶点位置
    const scaleFactor = 0.01; // 缩放因子，控制移动敏感度
    positions[index * 3] += localDelta.x * scaleFactor;
    positions[index * 3 + 1] += localDelta.y * scaleFactor;
    positions[index * 3 + 2] += localDelta.z * scaleFactor;
    
    // 更新几何体
    geometry.attributes.position.needsUpdate = true;
    
    console.log(`顶点 ${index} 已移动:`, delta);
  }

  /**
   * 更新方法
   */
  public override update(): void {
    // 控制器更新逻辑
  }

  /**
   * 销毁方法
   */
  public override destroy(): void {
    // 移除事件监听器
    if (this.renderer) {
      const canvas = this.renderer.renderer.domElement;
      canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
      canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
      canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
    }
    
    super.destroy?.();
  }
  
  /**
   * 更新配置
   */
  public updateConfig(config: { enableVertexSelection?: boolean; enableVertexMovement?: boolean }): void {
    // 根据配置更新控制器状态
    if (config.enableVertexSelection !== undefined) {
      // 处理顶点选择启用/禁用逻辑
    }
    
    if (config.enableVertexMovement !== undefined) {
      // 处理顶点移动启用/禁用逻辑
    }
    
    console.log('顶点操作控制器配置已更新:', config);
  }
}