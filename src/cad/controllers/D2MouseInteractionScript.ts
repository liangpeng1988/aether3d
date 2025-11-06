import * as THREE from 'three';
import { screenToWorld as utilsScreenToWorld } from '../../../Engine/core/utils';

/**
 * 鼠标交互脚本选项接口
 * 定义了MouseInteractionScript类构造函数所需的配置选项
 */
interface MouseInteractionOptions {
  /** 是否正在创建标注 */
  isCreatingDimension: boolean;
  /** 是否处于绘制模式 */
  isDrawingMode: boolean;
  /** 标注类型 */
  dimensionType: 'horizontal' | 'vertical' | 'aligned';
  /** 标注创建完成回调函数 */
  onDimensionCreated?: (dimension: any) => void;
  /** 线条绘制完成回调函数 */
  onLineDrawn?: (data: { line: THREE.Line; points: THREE.Vector3[] }) => void;
  /** 测量点选择回调函数 */
  onMeasurementPointSelected?: (point: THREE.Vector3) => void;
  /** 设置是否正在创建标注状态的函数 */
  setIsCreatingDimension: (value: boolean) => void;
  /** 标注起始点引用 */
  dimensionStartPointRef: React.MutableRefObject<THREE.Vector3 | null>;
  /** 是否正在绘制引用 */
  isDrawingRef: React.MutableRefObject<boolean>;
  /** 当前线条引用 */
  currentLineRef: React.MutableRefObject<THREE.Line | null>;
  /** 线条点集合引用 */
  linePointsRef: React.MutableRefObject<THREE.Vector3[]>;
  /** 已绘制线条集合引用 */
  drawnLinesRef: React.MutableRefObject<THREE.Line[]>;
  /** 渲染器引用 */
  rendererRef: React.MutableRefObject<any>;
  /** 轨道控制器引用 */
  orbitControlsRef: React.MutableRefObject<any>;
  /** 是否显示位置标签 */
  showPositionLabel: boolean;
  /** 设置鼠标位置的函数 */
  setMousePosition: (position: THREE.Vector3) => void;
  /** 设置鼠标是否在画布上的函数 */
  setIsMouseOverCanvas: (value: boolean) => void;
}

/**
 * 鼠标交互脚本类
 * 处理Canvas2D组件中的所有鼠标相关交互功能
 * 包括：鼠标按下、移动、抬起、双击、进入/离开画布等事件
 */
export class D2MouseInteractionScript {
  /** 配置选项 */
  private options: MouseInteractionOptions;
  /** 是否正在平移视图 */
  private isPanning: boolean = false;
  /** 轨道控制器是否启用 */
  private isOrbitControlsEnabled: boolean = true;
  /** 上一次鼠标位置 */
  private previousMousePosition = { x: 0, y: 0 };
  /** Z轴移动状态引用 */
  private isZAxisMovingRef = { current: false };
  
  /**
   * 构造函数
   * @param options 鼠标交互配置选项
   */
  constructor(options: MouseInteractionOptions) {
    this.options = options;
  }
  
  /**
   * 设置鼠标事件监听器
   * @param canvas HTML画布元素
   * @returns 清理函数，用于移除事件监听器
   */
  public setup(canvas: HTMLCanvasElement) {
    // 添加鼠标事件监听器
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('dblclick', this.onDoubleClick);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('mouseenter', this.onMouseEnter);
    canvas.addEventListener('mouseleave', this.onMouseLeave);
    
    // 返回清理函数
    return () => {
      canvas.removeEventListener('mousedown', this.onMouseDown);
      canvas.removeEventListener('dblclick', this.onDoubleClick);
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
      canvas.removeEventListener('mouseenter', this.onMouseEnter);
      canvas.removeEventListener('mouseleave', this.onMouseLeave);
    };
  }
  
  /**
   * 鼠标按下事件处理函数
   * 处理标注创建和线条绘制功能
   * @param event 鼠标事件对象
   */
  private onMouseDown = (event: MouseEvent) => {
    const canvas = this.options.rendererRef.current?.renderer.domElement;
    if (!canvas) return;
    
    // 检查是否正在创建标注
    if (this.options.isCreatingDimension && event.button === 0) {
      // 计算鼠标在画布中的相对位置
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      // 将屏幕坐标转换为世界坐标
      const worldPoint = utilsScreenToWorld(x, y, canvas, this.options.rendererRef.current.camera);
      
      // 如果还没有设置起始点，则设置起始点
      if (!this.options.dimensionStartPointRef.current) {
        // 设置起点
        this.options.dimensionStartPointRef.current = worldPoint;
      } else {
        // 如果已有起始点，则设置终点并完成标注
        if (this.options.onDimensionCreated) {
          this.options.onDimensionCreated({
            type: this.options.dimensionType,
            start: this.options.dimensionStartPointRef.current,
            end: worldPoint,
            distance: this.options.dimensionStartPointRef.current.distanceTo(worldPoint)
          });
        }
        // 重置状态
        this.options.dimensionStartPointRef.current = null;
        this.options.setIsCreatingDimension(false);
      }
      
      event.preventDefault();
    }
    // 处理测量点选择
    else if (this.options.onMeasurementPointSelected && event.button === 0) {
      // 计算鼠标在画布中的相对位置
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      // 将屏幕坐标转换为世界坐标
      const worldPoint = utilsScreenToWorld(x, y, canvas, this.options.rendererRef.current.camera);
      
      // 调用测量点选择回调
      this.options.onMeasurementPointSelected(worldPoint);
      
      event.preventDefault();
    }
    // 只有在划线模式下才处理鼠标点击绘制线条
    else if (this.options.isDrawingMode && event.button === 0) {
      this.options.isDrawingRef.current = true;
      
      // 计算鼠标在画布中的相对位置
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      // 将屏幕坐标转换为世界坐标
      const worldPoint = utilsScreenToWorld(x, y, canvas, this.options.rendererRef.current.camera);
      
      // 确保点在XZ平面上(Y坐标为0)
      worldPoint.y = 0;
      
      // 如果这是第一条点，创建新的线条
      if (this.options.linePointsRef.current.length === 0) {
        this.options.linePointsRef.current.push(worldPoint);
        
        // 创建几何体并设置点
        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints(this.options.linePointsRef.current);
        
        // 创建线条材质
        const material = new THREE.LineBasicMaterial({ 
          color: 0x00ff00, // 绿色线条
          linewidth: 2 
        });
        
        // 创建线条对象并添加到场景中
        this.options.currentLineRef.current = new THREE.Line(geometry, material);
        this.options.rendererRef.current?.scene.add(this.options.currentLineRef.current);
      } else {
        // 如果已有线条，则添加新点到现有线条
        // 只有当点与上一个点有明显距离时才添加，避免过多点导致性能问题
        const lastPoint = this.options.linePointsRef.current[this.options.linePointsRef.current.length - 1];
        if (!lastPoint || lastPoint.distanceTo(worldPoint) > 0.1) {
          this.options.linePointsRef.current.push(worldPoint);
          if (this.options.currentLineRef.current) {
            this.options.currentLineRef.current.geometry.setFromPoints(this.options.linePointsRef.current);
          }
        }
      }
      
      event.preventDefault();
    }
    // 鼠标中键按下处理视图平移
    else if (event.button === 1) {
      this.isPanning = true;
      this.isZAxisMovingRef.current = false;
      this.previousMousePosition = { x: event.clientX, y: event.clientY };
      
      // 禁用相机控制脚本以避免冲突
      if (this.options.orbitControlsRef.current) {
        this.isOrbitControlsEnabled = this.options.orbitControlsRef.current.getEnabled();
        this.options.orbitControlsRef.current.disable();
      }
      
      event.preventDefault();
    }
    // 鼠标右键也可以用于平移（在非绘制模式下）
    else if (event.button === 2 && !this.options.isDrawingMode) {
      this.isPanning = true;
      this.isZAxisMovingRef.current = false;
      this.previousMousePosition = { x: event.clientX, y: event.clientY };
      
      // 禁用相机控制脚本以避免冲突
      if (this.options.orbitControlsRef.current) {
        this.isOrbitControlsEnabled = this.options.orbitControlsRef.current.getEnabled();
        this.options.orbitControlsRef.current.disable();
      }
      
      event.preventDefault();
    }
  };
  
  /**
   * 鼠标移动事件处理函数
   * 处理鼠标位置更新、视图平移和线条绘制预览
   * @param event 鼠标事件对象
   */
  private onMouseMove = (event: MouseEvent) => {
    const canvas = this.options.rendererRef.current?.renderer.domElement;
    if (!canvas) return;
    
    // 更新鼠标位置信息（如果启用了位置标签显示）
    if (this.options.showPositionLabel && this.options.rendererRef.current) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      // 将屏幕坐标转换为世界坐标
      const worldPoint = utilsScreenToWorld(x, y, canvas, this.options.rendererRef.current.camera);
      this.options.setMousePosition(worldPoint);
    }
    
    // 处理视图平移
    if (this.isPanning && this.options.rendererRef.current) {
      // 计算鼠标移动距离
      const deltaX = event.clientX - this.previousMousePosition.x;
      const deltaY = event.clientY - this.previousMousePosition.y;

      const camera = this.options.rendererRef.current.camera;
      // 根据相机缩放级别调整平移速度
      const panSpeed = 0.02 / (camera.zoom || 1);
      
      // 计算平移向量
      const panVector = new THREE.Vector3();
      panVector.set(deltaX * panSpeed, -deltaY * panSpeed, 0);
      
      // 转换到世界坐标系
      panVector.applyQuaternion(camera.quaternion);
      // 移动相机
      camera.position.sub(panVector);
      
      // 更新相机控制脚本的目标点
      if (this.options.orbitControlsRef.current) {
        const currentTarget = this.options.orbitControlsRef.current.getTargetPosition();
        if (currentTarget) {
          currentTarget.sub(panVector);
          this.options.orbitControlsRef.current.setDefaultCameraPosition(
            camera.position.clone(), 
            currentTarget
          );
        }
      }
      
      this.previousMousePosition = { x: event.clientX, y: event.clientY };
    }
    // 处理线条绘制预览（只在绘制模式下且正在绘制时）
    else if (this.options.isDrawingMode && 
             this.options.isDrawingRef.current && 
             this.options.currentLineRef.current && 
             this.options.rendererRef.current) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      // 将屏幕坐标转换为世界坐标
      const worldPoint = utilsScreenToWorld(x, y, canvas, this.options.rendererRef.current.camera);
      
      // 确保点在XZ平面上(Y坐标为0)
      worldPoint.y = 0;
      
      // 只有当点与上一个点有明显距离时才添加，避免过多点导致性能问题
      const lastPoint = this.options.linePointsRef.current[this.options.linePointsRef.current.length - 1];
      if (!lastPoint || lastPoint.distanceTo(worldPoint) > 0.1) {
        // 添加点到线条点集合并更新线条几何体
        this.options.linePointsRef.current.push(worldPoint);
        this.options.currentLineRef.current.geometry.setFromPoints(this.options.linePointsRef.current);
      }
    }
  };
  
  /**
   * 鼠标抬起事件处理函数
   * 处理鼠标中键抬起时停止视图平移
   * @param event 鼠标事件对象
   */
  private onMouseUp = (event: MouseEvent) => {
    // 鼠标中键或右键抬起时停止平移
    if (event.button === 1 || event.button === 2) {
      this.isPanning = false;
      
      // 恢复相机控制脚本状态
      if (this.options.orbitControlsRef.current) {
        // 始终尝试重新启用相机控制，确保不会因为状态不一致而锁死
        try {
          if (this.isOrbitControlsEnabled) {
            this.options.orbitControlsRef.current.enable();
          }
        } catch (error) {
          console.warn('[MouseInteractionScript] 恢复相机控制时出错:', error);
          // 如果恢复失败，尝试重新初始化相机控制
          try {
            this.options.orbitControlsRef.current.reset();
            this.options.orbitControlsRef.current.enable();
          } catch (resetError) {
            console.error('[MouseInteractionScript] 重新初始化相机控制失败:', resetError);
          }
        }
      }
      
      event.preventDefault();
    } 
  };
  
  /**
   * 鼠标进入画布事件处理函数
   * 设置鼠标在画布上的状态为true
   */
  private onMouseEnter = () => {
    this.options.setIsMouseOverCanvas(true);
  };
  
  /**
   * 鼠标离开画布事件处理函数
   * 设置鼠标在画布上的状态为false
   */
  private onMouseLeave = () => {
    // 当鼠标离开画布时，确保停止平移操作
    this.isPanning = false;
    
    // 恢复相机控制脚本状态
    if (this.options.orbitControlsRef.current) {
      try {
        if (this.isOrbitControlsEnabled) {
          this.options.orbitControlsRef.current.enable();
        }
      } catch (error) {
        console.warn('[MouseInteractionScript] 鼠标离开时恢复相机控制时出错:', error);
      }
    }
    
    this.options.setIsMouseOverCanvas(false);
  };
  
  /**
   * 鼠标双击事件处理函数
   * 处理双击完成线条绘制功能
   * @param event 鼠标事件对象
   */
  private onDoubleClick = (event: MouseEvent) => {
    // 检查是否处于绘制模式且有正在绘制的线条
    if (this.options.isDrawingMode && 
        this.options.isDrawingRef.current && 
        this.options.currentLineRef.current && 
        this.options.linePointsRef.current.length > 1) {
      // 完成当前划线
      this.options.isDrawingRef.current = false;
      
      // 准备线条数据
      const lineData = {
        id: this.options.currentLineRef.current.name || `line_${Date.now()}`,
        points: [...this.options.linePointsRef.current],
        line: this.options.currentLineRef.current
      };
      
      if (this.options.currentLineRef.current && this.options.rendererRef.current) {
        // 将线条添加到持久存储中
        this.options.drawnLinesRef.current.push(this.options.currentLineRef.current);
        
        // 调用回调函数通知线条绘制完成
        if (this.options.onLineDrawn) {
          this.options.onLineDrawn(lineData);
        }
      }
      
      // 重置当前线条相关引用
      this.options.currentLineRef.current = null;
      this.options.linePointsRef.current = [];
      
      event.preventDefault();
    }
  };
}