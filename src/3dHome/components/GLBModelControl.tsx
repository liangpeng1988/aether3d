import React, { useState } from "react";

interface GLBModelControlProps {
  onToggleModel?: (visible: boolean) => void;
  onLoadModel?: () => void;
  onUnloadModel?: () => void;
  onModelScaleChange?: (scale: number) => void;
  onModelPositionChange?: (position: { x: number; y: number; z: number }) => void;
  isVisible?: boolean; // 控制面板是否可见
  onVisibilityChange?: (visible: boolean) => void; // 面板可见性变化回调
}

const GLBModelControl: React.FC<GLBModelControlProps> = ({
  onToggleModel,
  onLoadModel,
  onUnloadModel,
  onModelScaleChange,
  onModelPositionChange,
  isVisible = true, // 默认可见
  onVisibilityChange
}) => {
  const [modelVisible, setModelVisible] = useState<boolean>(true);
  const [modelLoaded, setModelLoaded] = useState<boolean>(true);
  const [modelScale, setModelScale] = useState<number>(1.0);
  const [modelPosition, setModelPosition] = useState<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 如果面板被设置为不可见，直接返回null
  if (!isVisible) {
    return null;
  }

  const handleToggleVisibility = () => {
    const newVisible = !modelVisible;
    setModelVisible(newVisible);
    if (onToggleModel) {
      onToggleModel(newVisible);
    }
  };

  const handleLoadModel = () => {
    // 模拟加载过程
    setIsLoading(true);
    setLoadingProgress(0);
    
    // 模拟加载进度
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          setModelLoaded(true);
          if (onLoadModel) {
            onLoadModel();
          }
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleUnloadModel = () => {
    setModelLoaded(false);
    if (onUnloadModel) {
      onUnloadModel();
    }
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const scale = parseFloat(e.target.value);
    setModelScale(scale);
    if (onModelScaleChange) {
      onModelScaleChange(scale);
    }
  };

  const handlePositionXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const x = parseFloat(e.target.value);
    const newPosition = { ...modelPosition, x };
    setModelPosition(newPosition);
    if (onModelPositionChange) {
      onModelPositionChange(newPosition);
    }
  };

  const handlePositionYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const y = parseFloat(e.target.value);
    const newPosition = { ...modelPosition, y };
    setModelPosition(newPosition);
    if (onModelPositionChange) {
      onModelPositionChange(newPosition);
    }
  };

  const handlePositionZChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const z = parseFloat(e.target.value);
    const newPosition = { ...modelPosition, z };
    setModelPosition(newPosition);
    if (onModelPositionChange) {
      onModelPositionChange(newPosition);
    }
  };

  // 处理关闭按钮点击
  const handleClose = () => {
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  return (
    <div className="glb-model-control floating-ui" style={{ 
      position: 'absolute',
      top: '20px',
      right: '24px',
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
          GLB模型控制
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

      {/* 添加进度条 */}
      {isLoading && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px'
            }}>
              加载中...
            </span>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px'
            }}>
              {loadingProgress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${loadingProgress}%`,
              height: '100%',
              backgroundColor: 'rgba(254, 125, 27, 1)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

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
            模型可见性
          </span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {modelVisible ? '显示' : '隐藏'}
          </span>
        </div>
        <button
          onClick={handleToggleVisibility}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: modelVisible ? 'rgba(254, 125, 27, 1)' : 'rgba(100, 100, 100, 1)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
        >
          {modelVisible ? '隐藏模型' : '显示模型'}
        </button>
      </div>

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
            模型缩放
          </span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {modelScale.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={modelScale}
          onChange={handleScaleChange}
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

      <div className="control-group flex-col" style={{ marginBottom: '16px' }}>
        <div className="label" style={{ 
          marginBottom: '8px'
        }}>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            模型位置
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px',
              width: '20px'
            }}>X:</span>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={modelPosition.x}
              onChange={handlePositionXChange}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.2)',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer'
              }}
            />
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '12px',
              width: '40px',
              textAlign: 'right'
            }}>
              {modelPosition.x.toFixed(1)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px',
              width: '20px'
            }}>Y:</span>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={modelPosition.y}
              onChange={handlePositionYChange}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.2)',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer'
              }}
            />
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '12px',
              width: '40px',
              textAlign: 'right'
            }}>
              {modelPosition.y.toFixed(1)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px',
              width: '20px'
            }}>Z:</span>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={modelPosition.z}
              onChange={handlePositionZChange}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.2)',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer'
              }}
            />
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '12px',
              width: '40px',
              textAlign: 'right'
            }}>
              {modelPosition.z.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="control-group flex-col">
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
            模型加载状态
          </span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {modelLoaded ? '已加载' : '未加载'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleLoadModel}
            disabled={modelLoaded || isLoading}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: (modelLoaded || isLoading) ? 'rgba(100, 100, 100, 1)' : 'rgba(254, 125, 27, 1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: (modelLoaded || isLoading) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? '加载中...' : '加载模型'}
          </button>
          <button
            onClick={handleUnloadModel}
            disabled={!modelLoaded}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: !modelLoaded ? 'rgba(100, 100, 100, 1)' : 'rgba(254, 125, 27, 1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !modelLoaded ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            卸载模型
          </button>
        </div>
      </div>
    </div>
  );
};

export default GLBModelControl;