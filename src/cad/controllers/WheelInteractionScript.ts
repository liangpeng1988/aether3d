import * as THREE from 'three';

/**
 * 滚轮交互脚本选项接口
 * 定义了WheelInteractionScript类构造函数所需的配置选项
 */
interface WheelInteractionOptions {
  /** 渲染器引用 */
  rendererRef: React.MutableRefObject<any>;
  /** 轨道控制器引用 */
  orbitControlsRef: React.MutableRefObject<any>;
}

/**
 * 滚轮交互脚本类
 * 处理Canvas2D组件中的鼠标滚轮缩放功能
 * 实现基于鼠标滚轮的视图缩放操作
 */
export class WheelInteractionScript {
  /** 配置选项 */
  private options: WheelInteractionOptions;
  
  /**
   * 构造函数
   * @param options 滚轮交互配置选项
   */
  constructor(options: WheelInteractionOptions) {
    this.options = options;
  }
  
  /**
   * 设置滚轮事件监听器
   * @param canvas HTML画布元素
   * @returns 清理函数，用于移除事件监听器
   */
  public setup(canvas: HTMLCanvasElement) {
    // 添加滚轮事件监听器
    canvas.addEventListener('wheel', this.onWheel);
    
    // 返回清理函数
    return () => {
      canvas.removeEventListener('wheel', this.onWheel);
    };
  }
  
  /**
   * 滚轮事件处理函数
   * 处理鼠标滚轮缩放功能
   * @param event 滚轮事件对象
   */
  private onWheel = (event: WheelEvent) => {
    // 鼠标滚轮缩放
    if (this.options.rendererRef.current && this.options.orbitControlsRef.current) {
      const camera = this.options.rendererRef.current.camera;
      // 设置缩放速度
      const zoomSpeed = 0.1;
      // 根据滚轮方向计算缩放因子
      const delta = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
      
      // 对于透视相机，调整相机位置
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      // 根据滚轮方向调整相机移动距离
      direction.multiplyScalar(event.deltaY > 0 ? zoomSpeed : -zoomSpeed);
      
      // 移动相机（允许Y轴移动）
      camera.position.add(direction);
      
      // 更新相机控制脚本的目标点
      const currentTarget = this.options.orbitControlsRef.current.getTargetPosition();
      if (currentTarget) {
        currentTarget.add(direction);
        this.options.orbitControlsRef.current.setDefaultCameraPosition(camera.position.clone(), currentTarget);
      }
      
      // 阻止默认滚轮行为
      event.preventDefault();
    }
  };
}