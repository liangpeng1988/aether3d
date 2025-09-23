import React, { useState, useCallback, useMemo } from 'react';

interface FPSOptimizerControlProps {
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  onTargetFpsChange: (value: number) => void;
  onAdaptiveOptimizationChange: (enabled: boolean) => void;
  onMaxObjectsChange: (value: number) => void;
  onOptimizationLevelChange: (level: 'low' | 'medium' | 'high') => void;
  currentFps: number;
  initialConfig: {
    targetFps: number;
    adaptiveOptimization: boolean;
    maxObjects: number;
    optimizationLevel: 'low' | 'medium' | 'high';
  };
}

const FPSOptimizerControl: React.FC<FPSOptimizerControlProps> = React.memo(({
  isVisible,
  onVisibilityChange,
  onTargetFpsChange,
  onAdaptiveOptimizationChange,
  onMaxObjectsChange,
  onOptimizationLevelChange,
  currentFps,
  initialConfig
}) => {
  const [targetFps, setTargetFps] = useState(initialConfig.targetFps);
  const [adaptiveOptimization, setAdaptiveOptimization] = useState(initialConfig.adaptiveOptimization);
  const [maxObjects, setMaxObjects] = useState(initialConfig.maxObjects);
  const [optimizationLevel, setOptimizationLevel] = useState<'low' | 'medium' | 'high'>(initialConfig.optimizationLevel);

  // 使用useCallback优化处理函数
  const handleTargetFpsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setTargetFps(value);
    onTargetFpsChange(value);
  }, [onTargetFpsChange]);

  const handleAdaptiveOptimizationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAdaptiveOptimization(checked);
    onAdaptiveOptimizationChange(checked);
  }, [onAdaptiveOptimizationChange]);

  const handleMaxObjectsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setMaxObjects(value);
    onMaxObjectsChange(value);
  }, [onMaxObjectsChange]);

  const handleOptimizationLevelChange = useCallback((level: 'low' | 'medium' | 'high') => {
    setOptimizationLevel(level);
    onOptimizationLevelChange(level);
  }, [onOptimizationLevelChange]);

  // 使用useMemo优化FPS颜色计算
  const fpsColor = useMemo(() => {
    if (currentFps >= 50) return '#4CAF50'; // 绿色
    if (currentFps >= 30) return '#FF9800'; // 橙色
    return '#F44336'; // 红色
  }, [currentFps]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      right: '20px',
      transform: 'translateY(-50%)',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      zIndex: 100,
      minWidth: '300px',
      maxWidth: '350px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>FPS优化器</h3>
        <button
          onClick={() => onVisibilityChange(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '20px',
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
      <div style={{
        marginBottom: '15px',
        padding: '10px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '4px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', marginBottom: '5px' }}>实时FPS</div>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          color: fpsColor
        }}>
          {currentFps.toFixed(1)}
        </div>
      </div>

      {/* 目标FPS */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          目标FPS: {targetFps}
        </label>
        <input
          type="range"
          min="10"
          max="120"
          value={targetFps}
          onChange={handleTargetFpsChange}
          style={{ width: '100%' }}
        />
      </div>

      {/* 自适应优化 */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={adaptiveOptimization}
            onChange={handleAdaptiveOptimizationChange}
            style={{ marginRight: '8px' }}
          />
          自适应优化
        </label>
      </div>

      {/* 最大对象数 */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          最大对象数: {maxObjects}
        </label>
        <input
          type="range"
          min="1000"
          max="1000000"
          step="1000"
          value={maxObjects}
          onChange={handleMaxObjectsChange}
          style={{ width: '100%' }}
        />
      </div>

      {/* 优化级别 */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          优化级别
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          {(['low', 'medium', 'high'] as const).map(level => (
            <button
              key={level}
              onClick={() => handleOptimizationLevelChange(level)}
              style={{
                flex: 1,
                padding: '8px',
                background: optimizationLevel === level ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default FPSOptimizerControl;