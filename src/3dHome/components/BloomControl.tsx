import React, { useState } from "react";

interface BloomControlProps {
  onBloomParametersChange?: (strength: number, radius: number, threshold: number) => void;
}

const BloomControl: React.FC<BloomControlProps> = ({ onBloomParametersChange }) => {
  const [strength, setStrength] = useState<number>(0.5);
  const [radius, setRadius] = useState<number>(0.4);
  const [threshold, setThreshold] = useState<number>(0.85);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // 关闭面板的处理函数
  const handleClose = () => {
    setIsVisible(false);
  };

  // 显示面板的处理函数
  const handleShow = () => {
    setIsVisible(true);
  };

  const handleStrengthChange = (value: number) => {
    setStrength(value);
    onBloomParametersChange?.(value, radius, threshold);
  };

  const handleRadiusChange = (value: number) => {
    setRadius(value);
    onBloomParametersChange?.(strength, value, threshold);
  };

  const handleThresholdChange = (value: number) => {
    setThreshold(value);
    onBloomParametersChange?.(strength, radius, value);
  };

  // 如果面板不可见，只显示一个小按钮来重新打开
  if (!isVisible) {
    return (
      <button 
        onClick={handleShow}
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          background: 'rgba(37, 44, 57, 0.9)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '8px 12px',
          cursor: 'pointer',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}
      >
        辉光效果
      </button>
    );
  }

  return (
    <div className="bloom-control floating-ui" style={{ 
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
          辉光效果控制
        </span>
        <button
          onClick={handleClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            borderRadius: '4px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>
      </div>

      {/* 强度控制 */}
      <div className="control-group" style={{ marginBottom: '15px' }}>
        <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
          强度: {strength.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.01"
          value={strength}
          onChange={(e) => handleStrengthChange(parseFloat(e.target.value))}
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

      {/* 半径控制 */}
      <div className="control-group" style={{ marginBottom: '15px' }}>
        <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
          半径: {radius.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={radius}
          onChange={(e) => handleRadiusChange(parseFloat(e.target.value))}
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

      {/* 阈值控制 */}
      <div className="control-group" style={{ marginBottom: '15px' }}>
        <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
          阈值: {threshold.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={threshold}
          onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
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

export default BloomControl;