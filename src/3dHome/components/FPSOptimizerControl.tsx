import React, { useState, useEffect } from "react";

interface FPSOptimizerControlProps {
  onTargetFpsChange?: (value: number) => void;
  onAdaptiveOptimizationChange?: (enabled: boolean) => void;
  onMaxObjectsChange?: (value: number) => void;
  onOptimizationLevelChange?: (level: 'low' | 'medium' | 'high') => void;
  isVisible?: boolean; // 控制面板是否可见
  onVisibilityChange?: (visible: boolean) => void; // 面板可见性变化回调
  initialConfig?: {
    targetFps?: number;
    adaptiveOptimization?: boolean;
    maxObjects?: number;
    optimizationLevel?: 'low' | 'medium' | 'high';
  };
  // 添加当前FPS属性
  currentFps?: number; // 实时FPS值
}

const FPSOptimizerControl: React.FC<FPSOptimizerControlProps> = ({
  onTargetFpsChange,
  onAdaptiveOptimizationChange,
  onMaxObjectsChange,
  onOptimizationLevelChange,
  isVisible = true, // 默认可见
  onVisibilityChange,
  initialConfig,
  currentFps = 0 // 默认FPS为0
}) => {
  // 状态管理各种FPS优化参数
  const [targetFps, setTargetFps] = useState<number>(initialConfig?.targetFps || 60);
  const [adaptiveOptimization, setAdaptiveOptimization] = useState<boolean>(initialConfig?.adaptiveOptimization ?? true);
  const [maxObjects, setMaxObjects] = useState<number>(initialConfig?.maxObjects || 1000);
  const [optimizationLevel, setOptimizationLevel] = useState<'low' | 'medium' | 'high'>(initialConfig?.optimizationLevel || 'medium');

  // 如果面板被设置为不可见，直接返回null
  if (!isVisible) {
    return null;
  }

  // 处理目标FPS变化
  const handleTargetFpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setTargetFps(value);
    if (onTargetFpsChange) {
      onTargetFpsChange(value);
    }
  };

  // 处理自适应优化开关变化
  const handleAdaptiveOptimizationChange = () => {
    const newEnabled = !adaptiveOptimization;
    setAdaptiveOptimization(newEnabled);
    if (onAdaptiveOptimizationChange) {
      onAdaptiveOptimizationChange(newEnabled);
    }
  };

  // 处理最大对象数变化
  const handleMaxObjectsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setMaxObjects(value);
    if (onMaxObjectsChange) {
      onMaxObjectsChange(value);
    }
  };

  // 处理优化级别变化
  const handleOptimizationLevelChange = (level: 'low' | 'medium' | 'high') => {
    setOptimizationLevel(level);
    if (onOptimizationLevelChange) {
      onOptimizationLevelChange(level);
    }
  };

  // 处理关闭按钮点击
  const handleClose = () => {
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  // 根据FPS值确定显示颜色
  const getFpsColor = (fps: number) => {
    if (fps >= 50) return 'rgba(0, 255, 0, 1)'; // 绿色
    if (fps >= 30) return 'rgba(255, 255, 0, 1)'; // 黄色
    return 'rgba(255, 0, 0, 1)'; // 红色
  };

  return (
    <div className="fps-optimizer-control floating-ui" style={{ 
      position: 'absolute',
      top: '50%',
      right: '24px',
      transform: 'translateY(-50%)',
      backgroundImage: 'linear-gradient(135deg, rgba(37, 44, 57, 0.9) 0, rgba(59, 60, 67, 0.9) 100%)',
      borderRadius: '16px',
      width: '280px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      zIndex: 10,
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <div className="header flex-row justify-between" style={{ 
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span className="title" style={{ 
          color: 'rgba(255, 255, 255, 1)',
          fontSize: '20px',
          fontFamily: 'MiSans-Semibold',
          fontWeight: 600
        }}>
          FPS优化控制
        </span>
        {/* 添加关闭按钮 */}
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* 实时FPS显示 */}
      <div className="fps-display" style={{
        marginBottom: '16px',
        padding: '12px',
        borderRadius: '8px',
        background: 'rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '14px',
          marginBottom: '4px'
        }}>
          实时FPS
        </div>
        <div style={{
          color: getFpsColor(currentFps),
          fontSize: '24px',
          fontWeight: 'bold',
          fontFamily: 'monospace'
        }}>
          {currentFps}
        </div>
      </div>

      {/* 目标FPS */}
      <div className="control-group flex-col" style={{ marginBottom: '16px' }}>
        <div className="label flex-row justify-between" style={{ 
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            目标FPS
          </span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {targetFps}
          </span>
        </div>
        <input
          type="range"
          min="30"
          max="120"
          step="10"
          value={targetFps}
          onChange={handleTargetFpsChange}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.2)',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* 自适应优化开关 */}
      <div className="control-group flex-col" style={{ marginBottom: '16px' }}>
        <div className="label flex-row justify-between" style={{ 
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            自适应优化
          </span>
          <button
            onClick={handleAdaptiveOptimizationChange}
            style={{
              width: '40px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              background: adaptiveOptimization ? 'rgba(0, 122, 255, 1)' : 'rgba(108, 108, 108, 1)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'white',
              position: 'absolute',
              top: '2px',
              left: adaptiveOptimization ? '18px' : '2px',
              transition: 'left 0.2s'
            }} />
          </button>
        </div>
      </div>

      {/* 最大对象数 */}
      <div className="control-group flex-col" style={{ marginBottom: '16px' }}>
        <div className="label flex-row justify-between" style={{ 
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            最大对象数
          </span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {maxObjects}
          </span>
        </div>
        <input
          type="range"
          min="100"
          max="5000"
          step="100"
          value={maxObjects}
          onChange={handleMaxObjectsChange}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.2)',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* 优化级别 */}
      <div className="control-group flex-col" style={{ marginBottom: '16px' }}>
        <div className="label" style={{ 
          marginBottom: '8px'
        }}>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            优化级别
          </span>
        </div>
        <div style={{ 
          display: 'flex',
          gap: '8px'
        }}>
          {(['low', 'medium', 'high'] as const).map((level) => (
            <button
              key={level}
              onClick={() => handleOptimizationLevelChange(level)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: optimizationLevel === level ? 'rgba(0, 122, 255, 1)' : 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {level === 'low' && '低'}
              {level === 'medium' && '中'}
              {level === 'high' && '高'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FPSOptimizerControl;