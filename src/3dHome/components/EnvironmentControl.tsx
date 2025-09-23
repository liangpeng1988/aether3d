import React, { useState } from "react";

interface EnvironmentControlProps {
  onEnvMapIntensityChange?: (value: number) => void;
  onBackgroundBlurrinessChange?: (value: number) => void;
  onBackgroundIntensityChange?: (value: number) => void;
  onEnvironmentIntensityChange?: (value: number) => void;
  onToneMappingExposureChange?: (value: number) => void;
  onEnabledChange?: (enabled: boolean) => void;
  isVisible?: boolean; // 控制面板是否可见
  onVisibilityChange?: (visible: boolean) => void; // 面板可见性变化回调
}

const EnvironmentControl: React.FC<EnvironmentControlProps> = ({
  onEnvMapIntensityChange,
  onBackgroundBlurrinessChange,
  onBackgroundIntensityChange,
  onEnvironmentIntensityChange,
  onToneMappingExposureChange,
  onEnabledChange,
  isVisible = true, // 默认可见
  onVisibilityChange
}) => {
  // 如果面板被设置为不可见，直接返回null
  if (!isVisible) {
    return null;
  }

  // 状态管理各种环境贴图参数
  const [envMapIntensity, setEnvMapIntensity] = useState<number>(1.0);
  const [backgroundBlurriness, setBackgroundBlurriness] = useState<number>(0.5);
  const [backgroundIntensity, setBackgroundIntensity] = useState<number>(1.0);
  const [environmentIntensity, setEnvironmentIntensity] = useState<number>(1.5);
  const [toneMappingExposure, setToneMappingExposure] = useState<number>(1.0);
  const [enabled, setEnabled] = useState<boolean>(true);

  // 处理环境贴图强度变化
  const handleEnvMapIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setEnvMapIntensity(value);
    if (onEnvMapIntensityChange) {
      onEnvMapIntensityChange(value);
    }
  };

  // 处理背景模糊度变化
  const handleBackgroundBlurrinessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setBackgroundBlurriness(value);
    if (onBackgroundBlurrinessChange) {
      onBackgroundBlurrinessChange(value);
    }
  };

  // 处理背景强度变化
  const handleBackgroundIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setBackgroundIntensity(value);
    if (onBackgroundIntensityChange) {
      onBackgroundIntensityChange(value);
    }
  };

  // 处理环境强度变化
  const handleEnvironmentIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setEnvironmentIntensity(value);
    if (onEnvironmentIntensityChange) {
      onEnvironmentIntensityChange(value);
    }
  };

  // 处理色调映射曝光变化
  const handleToneMappingExposureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setToneMappingExposure(value);
    if (onToneMappingExposureChange) {
      onToneMappingExposureChange(value);
    }
  };

  // 处理启用/禁用环境贴图
  const handleEnabledChange = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    if (onEnabledChange) {
      onEnabledChange(newEnabled);
    }
  };

  // 处理关闭按钮点击
  const handleClose = () => {
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  return (
    <div className="environment-control floating-ui" style={{ 
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
          环境控制
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

      {/* 环境贴图强度 */}
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
            环境强度
          </span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {envMapIntensity.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={envMapIntensity}
          onChange={handleEnvMapIntensityChange}
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

      {/* 背景模糊度 */}
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
            背景模糊
          </span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {backgroundBlurriness.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={backgroundBlurriness}
          onChange={handleBackgroundBlurrinessChange}
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

      {/* 背景强度 */}
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
            背景强度
          </span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {backgroundIntensity.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={backgroundIntensity}
          onChange={handleBackgroundIntensityChange}
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

      {/* 环境强度 */}
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
            环境影响
          </span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {environmentIntensity.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={environmentIntensity}
          onChange={handleEnvironmentIntensityChange}
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

      {/* 色调映射曝光 */}
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
            曝光度
          </span>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {toneMappingExposure.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={toneMappingExposure}
          onChange={handleToneMappingExposureChange}
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
    </div>
  );
};

export default EnvironmentControl;