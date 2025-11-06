/**
 * 视图控制器
 * 负责处理视图相关的操作，将MainLayout中的视图逻辑转移到这里
 */
import * as THREE from 'three';

export class ViewController {
  private is3DView: boolean = true;
  private transformMode: 'translate' | 'rotate' | 'scale' | null = null;
  private transformSpace: 'world' | 'local' = 'world';

  /**
   * 获取当前是否为3D视图
   */
  is3DViewMode(): boolean {
    return this.is3DView;
  }

  /**
   * 切换2D/3D视图
   */
  toggleViewMode(): void {
    this.is3DView = !this.is3DView;
    console.log(`切换到${this.is3DView ? '3D' : '2D'}视图`);
  }

  /**
   * 设置视图为3D模式
   */
  set3DViewMode(is3D: boolean): void {
    this.is3DView = is3D;
    console.log(`设置为${is3D ? '3D' : '2D'}视图`);
  }

  /**
   * 处理切换到顶视图
   */
  handleSwitchToTopView(canvas2DRef: any, canvas3DRef: any, is3DView: boolean): void {
    if (canvas2DRef.current && !is3DView) {
      const cameraControls = canvas2DRef.current.getOrbitControls();
      if (cameraControls) {
        cameraControls.setDefaultCameraPosition(
          new THREE.Vector3(0, 10, 0),
          new THREE.Vector3(0, 0, 0)
        );
      }
    } else if (canvas3DRef.current && is3DView) {
      const blenderControls = canvas3DRef.current.getBlenderControls();
      if (blenderControls) {
        // Blender风格控制：使用小键盘7切换到顶视图
        // 这里手动设置相机位置
        if (canvas3DRef.current.getRenderer()) {
          canvas3DRef.current.getRenderer()!.camera.position.set(0, 10, 0);
          blenderControls.setTarget(new THREE.Vector3(0, 0, 0));
        }
      }
    }
  }

  /**
   * 获取当前变换模式
   */
  getCurrentTransformMode(): 'translate' | 'rotate' | 'scale' | null {
    return this.transformMode;
  }

  /**
   * 设置变换模式
   */
  setTransformMode(mode: 'translate' | 'rotate' | 'scale' | null): void {
    this.transformMode = mode;
  }

  /**
   * 获取当前变换坐标系
   */
  getCurrentTransformSpace(): 'world' | 'local' {
    return this.transformSpace;
  }

  /**
   * 设置变换坐标系
   */
  setTransformSpace(space: 'world' | 'local'): void {
    this.transformSpace = space;
  }

  /**
   * 处理窗口大小调整
   */
  handleResize(canvas2DRef: any, canvas3DRef: any, is3DView: boolean): void {
    // 使用Canvas的forceResize方法强制更新尺寸
    if (!is3DView && canvas2DRef.current && typeof canvas2DRef.current.forceResize === 'function') {
      canvas2DRef.current.forceResize();
    } else if (is3DView && canvas3DRef.current && typeof canvas3DRef.current.forceResize === 'function') {
      canvas3DRef.current.forceResize();
    } else {
      // 备用方案：触发窗口resize事件
      window.dispatchEvent(new Event('resize'));
    }
  }
}