import React, { useState, useEffect } from 'react';
import { MirrorReflectionScript } from '../../../Engine/controllers/MirrorReflectionScript';

interface BlurControlProps {
  mirrorScript: MirrorReflectionScript | null;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

const BlurControl: React.FC<BlurControlProps> = ({ 
  mirrorScript, 
  isVisible, 
  onVisibilityChange 
}) => {
  const [blurStrength, setBlurStrength] = useState<number>(0.5);
  const [blurRadius, setBlurRadius] = useState<number>(10);

  useEffect(() => {
    if (mirrorScript) {
      // 初始化值
      setBlurStrength(0.5);
      setBlurRadius(10);
    }
  }, [mirrorScript]);

  const handleBlurStrengthChange = (value: number) => {
    setBlurStrength(value);
    if (mirrorScript) {
      mirrorScript.setBlurStrength(value);
    }
  };

  const handleBlurRadiusChange = (value: number) => {
    setBlurRadius(value);
    if (mirrorScript) {
      mirrorScript.setBlurRadius(value);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => onVisibilityChange(true)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          padding: '8px 16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        显示模糊控制
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
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
        <h3 style={{ margin: 0 }}>模糊控制</h3>
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
          模糊强度: {blurStrength.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={blurStrength}
          onChange={(e) => handleBlurStrengthChange(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          模糊半径: {blurRadius.toFixed(0)}
        </label>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={blurRadius}
          onChange={(e) => handleBlurRadiusChange(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => handleBlurStrengthChange(0)}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          无模糊
        </button>
        <button
          onClick={() => handleBlurStrengthChange(0.5)}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          中等模糊
        </button>
        <button
          onClick={() => handleBlurStrengthChange(1)}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          强模糊
        </button>
      </div>
    </div>
  );
};

export default BlurControl;