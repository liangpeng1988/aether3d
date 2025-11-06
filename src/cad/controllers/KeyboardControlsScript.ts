import { useEffect } from 'react';
import * as THREE from 'three';

/**
 * 键盘控制脚本选项接口
 * 定义了KeyboardControlsScript类构造函数所需的配置选项
 */
interface KeyboardControlsOptions {
  /** 是否启用键盘快捷键 */
  enableKeyboardShortcuts?: boolean;
  /** 是否正在创建标注 */
  isCreatingDimension: boolean;
  /** 是否处于绘制模式 */
  isDrawingMode: boolean;
  /** 是否正在绘制引用 */
  isDrawingRef: React.MutableRefObject<boolean>;
  /** 当前线条引用 */
  currentLineRef: React.MutableRefObject<THREE.Line | null>;
  /** 线条点集合引用 */
  linePointsRef: React.MutableRefObject<THREE.Vector3[]>;
  /** 标注起始点引用 */
  dimensionStartPointRef: React.MutableRefObject<THREE.Vector3 | null>;
  /** 渲染器引用 */
  rendererRef: React.MutableRefObject<any>;
  /** 轨道控制器引用 */
  orbitControlsRef?: React.MutableRefObject<any>;
  /** 已绘制线条集合引用 */
  drawnLinesRef: React.MutableRefObject<THREE.Line[]>;
  /** 标注类型 */
  dimensionType: 'horizontal' | 'vertical' | 'aligned';
  /** 线条绘制完成回调函数 */
  onLineDrawn?: (data: { line: THREE.Line; points: THREE.Vector3[] }) => void;
  /** 标注创建完成回调函数 */
  onDimensionCreated?: (dimension: any) => void;
  /** 设置是否正在创建标注状态的函数 */
  setIsCreatingDimension: (value: boolean) => void;
  /** 设置是否处于绘制模式的函数 */
  setIsDrawingMode: (value: boolean) => void;
  /** 设置标注类型的函数 */
  setDimensionType: (type: 'horizontal' | 'vertical' | 'aligned') => void;
  /** 清除所有线条的函数 */
  clearAllLines: () => void;
}

/**
 * 键盘控制脚本类
 * 处理Canvas2D组件中的所有键盘快捷键功能
 * 包括：划线模式切换、线条完成、操作取消、线条清除等快捷键
 */
export class KeyboardControlsScript {
  /** 配置选项 */
  private options: KeyboardControlsOptions;
  
  /**
   * 构造函数
   * @param options 键盘控制配置选项
   */
  constructor(options: KeyboardControlsOptions) {
    this.options = options;
  }
  
  /**
   * 设置键盘事件监听器
   * @returns 清理函数，用于移除事件监听器
   */
  public setup() {
    // 如果启用了键盘快捷键，则添加键盘事件监听器
    if (this.options.enableKeyboardShortcuts) {
      window.addEventListener('keydown', this.handleKeyDown);
    }
    
    // 返回清理函数
    return () => {
      if (this.options.enableKeyboardShortcuts) {
        window.removeEventListener('keydown', this.handleKeyDown);
      }
    };
  }
  
  /**
   * 键盘按下事件处理函数
   * 处理各种键盘快捷键功能
   * @param event 键盘事件对象
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    // 如果未启用键盘快捷键，则直接返回
    if (!this.options.enableKeyboardShortcuts) return;
    
    // 防止在输入框中触发快捷键，避免干扰表单输入
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // 根据按下的键执行相应操作
    switch (event.key.toLowerCase()) {
      // L键：启动/切换划线模式
      case 'l':
        console.log('[KeyboardControlsScript] L键被按下');
        
        // 只有在未创建标注时才能切换划线模式
        if (!this.options.isCreatingDimension) {
          const newMode = !this.options.isDrawingMode;
          console.log('[KeyboardControlsScript] 切换划线模式到:', newMode);
          this.options.setIsDrawingMode(newMode);
          
          // 如果正在划线，取消当前划线
          if (this.options.isDrawingRef.current && this.options.currentLineRef.current) {
            console.log('[KeyboardControlsScript] 取消当前划线');
            // 取消当前划线
            if (this.options.rendererRef.current && this.options.currentLineRef.current) {
              this.options.rendererRef.current.scene.remove(this.options.currentLineRef.current);
              // 安全地释放几何体和材质资源
              try {
                if (this.options.currentLineRef.current.geometry) {
                  this.options.currentLineRef.current.geometry.dispose();
                }
                if (this.options.currentLineRef.current.material) {
                  if (Array.isArray(this.options.currentLineRef.current.material)) {
                    this.options.currentLineRef.current.material.forEach(material => material.dispose());
                  } else if (this.options.currentLineRef.current.material instanceof THREE.Material) {
                    this.options.currentLineRef.current.material.dispose();
                  }
                }
              } catch (error) {
                console.warn('[KeyboardControlsScript] 清理线条资源时出错:', error);
              }
            }
            this.options.isDrawingRef.current = false;
            this.options.currentLineRef.current = null;
            this.options.linePointsRef.current = [];
          }
        }
        event.preventDefault();
        break;

      // Enter键：完成当前划线
      case 'enter':
        console.log('[KeyboardControlsScript] Enter键被按下');
        
        // 检查是否处于绘制模式且有正在绘制的线条
        if (this.options.isDrawingMode && 
            this.options.isDrawingRef.current && 
            this.options.currentLineRef.current && 
            this.options.linePointsRef.current.length > 1) {
          console.log('[KeyboardControlsScript] 完成当前划线');
          
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
        } else if (this.options.isDrawingMode && this.options.isDrawingRef.current) {
          console.log('[KeyboardControlsScript] 线条点数不足，取消绘制');
          // 如果点数不足，取消绘制
          if (this.options.rendererRef.current && this.options.currentLineRef.current) {
            this.options.rendererRef.current.scene.remove(this.options.currentLineRef.current);
            // 安全地释放几何体和材质资源
            try {
              if (this.options.currentLineRef.current.geometry) {
                this.options.currentLineRef.current.geometry.dispose();
              }
              if (this.options.currentLineRef.current.material) {
                if (Array.isArray(this.options.currentLineRef.current.material)) {
                  this.options.currentLineRef.current.material.forEach(material => material.dispose());
                } else if (this.options.currentLineRef.current.material instanceof THREE.Material) {
                  this.options.currentLineRef.current.material.dispose();
                }
              }
            } catch (error) {
              console.warn('[KeyboardControlsScript] 清理线条资源时出错:', error);
            }
          }
          this.options.isDrawingRef.current = false;
          this.options.currentLineRef.current = null;
          this.options.linePointsRef.current = [];
        }
        
        event.preventDefault();
        break;

      // Escape键：取消当前操作
      case 'escape':
        console.log('[KeyboardControlsScript] ESC键被按下');
        
        // 取消标注创建
        if (this.options.isCreatingDimension) {
          console.log('[KeyboardControlsScript] 取消标注创建');
          this.options.setIsCreatingDimension(false);
          this.options.dimensionStartPointRef.current = null;
        }
        
        // 取消划线
        if (this.options.isDrawingRef.current && this.options.currentLineRef.current) {
          console.log('[KeyboardControlsScript] 取消划线');
          if (this.options.rendererRef.current && this.options.currentLineRef.current) {
            this.options.rendererRef.current.scene.remove(this.options.currentLineRef.current);
            // 安全地释放几何体和材质资源
            try {
              if (this.options.currentLineRef.current.geometry) {
                this.options.currentLineRef.current.geometry.dispose();
              }
              if (this.options.currentLineRef.current.material) {
                if (Array.isArray(this.options.currentLineRef.current.material)) {
                  this.options.currentLineRef.current.material.forEach(material => material.dispose());
                } else if (this.options.currentLineRef.current.material instanceof THREE.Material) {
                  this.options.currentLineRef.current.material.dispose();
                }
              }
            } catch (error) {
              console.warn('[KeyboardControlsScript] 清理线条资源时出错:', error);
            }
          }
          this.options.isDrawingRef.current = false;
          this.options.currentLineRef.current = null;
          this.options.linePointsRef.current = [];
        }
        
        // 退出划线模式并确保恢复相机控制
        if (this.options.isDrawingMode) {
          console.log('[KeyboardControlsScript] 退出划线模式');
          this.options.setIsDrawingMode(false);
          
          // 确保相机控制被恢复
          if (this.options.orbitControlsRef && this.options.orbitControlsRef.current) {
            try {
              this.options.orbitControlsRef.current.enable();
            } catch (error) {
              console.warn('[KeyboardControlsScript] 恢复相机控制时出错:', error);
            }
          }
        }
        
        event.preventDefault();
        break;

      // C键：清除所有线条（需要配合Ctrl或Cmd键）
      case 'c':
        if (event.ctrlKey || event.metaKey) {
          this.options.clearAllLines();
          event.preventDefault();
        }
        break;

      // 默认情况不阻止其他按键
      default:
        break;
    }
  };
}