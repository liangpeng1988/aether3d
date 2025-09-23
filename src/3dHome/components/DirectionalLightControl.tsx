import React, { useState, useEffect } from 'react';
import { DirectionalLightScript } from '../../../Engine/controllers/Edit/DirectionalLightScript';

interface DirectionalLightControlProps {
  directionalLightScript: DirectionalLightScript | null;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

const DirectionalLightControl: React.FC<DirectionalLightControlProps> = ({ 
  directionalLightScript, 
  isVisible, 
  onVisibilityChange 
}) => {
  const [lightIntensity, setLightIntensity] = useState<number>(1.0);
  const [lightColor, setLightColor] = useState<string>('#ffffff');
  const [lightPosition, setLightPosition] = useState({ x: 10, y: 20, z: 10 });
  const [lightTarget, setLightTarget] = useState({ x: 0, y: 0, z: 0 });
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (directionalLightScript) {
      // 获取当前配置
      const config = directionalLightScript.getConfig('main-sun');
      if (config) {
        setLightIntensity(config.intensity);
        setLightColor(config.color);
        setLightPosition(config.position);
        setLightTarget(config.target);
        setIsEnabled(directionalLightScript.isEnabled('main-sun'));
      }
    }
  }, [directionalLightScript]);

  const handleIntensityChange = (value: number) => {
    setLightIntensity(value);
    if (directionalLightScript) {
      directionalLightScript.updateConfig('main-sun', { intensity: value });
    }
  };

  const handleColorChange = (value: string) => {
    setLightColor(value);
    if (directionalLightScript) {
      directionalLightScript.updateConfig('main-sun', { color: value });
    }
  };

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition = { ...lightPosition, [axis]: value };
    setLightPosition(newPosition);
    if (directionalLightScript) {
      directionalLightScript.updateConfig('main-sun', { 
        position: { ...lightPosition, [axis]: value } 
      });
    }
  };

  const handleTargetChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newTarget = { ...lightTarget, [axis]: value };
    setLightTarget(newTarget);
    if (directionalLightScript) {
      directionalLightScript.updateConfig('main-sun', { 
        target: { ...lightTarget, [axis]: value } 
      });
    }
  };

  const toggleLight = () => {
    if (directionalLightScript) {
      const newState = !isEnabled;
      setIsEnabled(newState);
      if (newState) {
        directionalLightScript.enable('main-sun');
      } else {
        directionalLightScript.disable('main-sun');
      }
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => onVisibilityChange(true)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '8px 16px',
          backgroundColor: '#FF9800',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        显示平行光控制
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '160px',
      right: '10px',
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '16px',
      borderRadius: '8px',
      color: 'white',
      minWidth: '250px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h3 style={{ margin: 0 }}>平行光控制</h3>
        <button
          onClick={() => onVisibilityChange(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          光照强度: {lightIntensity.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={lightIntensity}
          onChange={(e) => handleIntensityChange(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          光照颜色:
        </label>
        <input
          type="color"
          value={lightColor}
          onChange={(e) => handleColorChange(e.target.value)}
          style={{ width: '100%', height: '40px' }}
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          位置 X: {lightPosition.x.toFixed(1)}
        </label>
        <input
          type="range"
          min="-50"
          max="50"
          step="0.5"
          value={lightPosition.x}
          onChange={(e) => handlePositionChange('x', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          位置 Y: {lightPosition.y.toFixed(1)}
        </label>
        <input
          type="range"
          min="-50"
          max="50"
          step="0.5"
          value={lightPosition.y}
          onChange={(e) => handlePositionChange('y', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          位置 Z: {lightPosition.z.toFixed(1)}
        </label>
        <input
          type="range"
          min="-50"
          max="50"
          step="0.5"
          value={lightPosition.z}
          onChange={(e) => handlePositionChange('z', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          目标 X: {lightTarget.x.toFixed(1)}
        </label>
        <input
          type="range"
          min="-50"
          max="50"
          step="0.5"
          value={lightTarget.x}
          onChange={(e) => handleTargetChange('x', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          目标 Y: {lightTarget.y.toFixed(1)}
        </label>
        <input
          type="range"
          min="-50"
          max="50"
          step="0.5"
          value={lightTarget.y}
          onChange={(e) => handleTargetChange('y', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          目标 Z: {lightTarget.z.toFixed(1)}
        </label>
        <input
          type="range"
          min="-50"
          max="50"
          step="0.5"
          value={lightTarget.z}
          onChange={(e) => handleTargetChange('z', parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={toggleLight}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: isEnabled ? '#f44336' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isEnabled ? '关闭光照' : '开启光照'}
        </button>
      </div>
    </div>
  );
};

export default DirectionalLightControl;