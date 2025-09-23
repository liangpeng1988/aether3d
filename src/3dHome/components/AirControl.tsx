import React, { useState, useEffect } from 'react';
import './AirControl.css';

interface AirControlProps {
  onToggleWind?: (isOn: boolean) => void;
  onSpeedChange?: (speed: number) => void;
  onColorChange?: (color: string) => void;
  initialWindStatus?: boolean;
  initialSpeed?: number;
  initialColor?: string;
  isVisible?: boolean; // 控制面板是否可见
  onVisibilityChange?: (visible: boolean) => void; // 面板可见性变化回调
}

const AirControl: React.FC<AirControlProps> = ({
  onToggleWind,
  onSpeedChange,
  onColorChange,
  initialWindStatus = true,
  initialSpeed = 1,
  initialColor = '#ff8800',
  isVisible = true, // 默认可见
  onVisibilityChange
}) => {
  const [isWindOn, setIsWindOn] = useState(initialWindStatus);
  const [windSpeed, setWindSpeed] = useState(initialSpeed);
  const [windColor, setWindColor] = useState(initialColor);

  // 如果面板被设置为不可见，直接返回null
  if (!isVisible) {
    return null;
  }

  // 处理关闭按钮点击
  const handleClose = () => {
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  // 处理开关切换
  const handleToggle = () => {
    const newStatus = !isWindOn;
    setIsWindOn(newStatus);
    onToggleWind?.(newStatus);
  };

  // 处理速度变化
  const handleSpeedChange = (speed: number) => {
    setWindSpeed(speed);
    onSpeedChange?.(speed);
  };

  // 处理颜色变化
  const handleColorChange = (color: string) => {
    setWindColor(color);
    onColorChange?.(color);
  };

  // 同步初始值变化
  useEffect(() => {
    setIsWindOn(initialWindStatus);
  }, [initialWindStatus]);

  useEffect(() => {
    setWindSpeed(initialSpeed);
  }, [initialSpeed]);

  useEffect(() => {
    setWindColor(initialColor);
  }, [initialColor]);

  return (
    <div className="air-control">
      <div className="air-control-header">
        <span className="air-control-title">空调风效控制</span>
        <div className="air-control-header-buttons">
          <button 
            className={`air-control-toggle ${isWindOn ? 'active' : ''}`}
            onClick={handleToggle}
          >
            {isWindOn ? 'ON' : 'OFF'}
          </button>
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
              justifyContent: 'center',
              marginLeft: '8px'
            }}
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="air-control-content">
        <div className="air-control-info">
          <span className="air-control-label">风效状态:</span>
          <span className={`air-control-status ${isWindOn ? 'status-on' : 'status-off'}`}>
            {isWindOn ? '开启' : '关闭'}
          </span>
        </div>
        
        <div className="air-control-slider">
          <div className="slider-header">
            <span className="slider-label">风速:</span>
            <span className="slider-value">{windSpeed.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={windSpeed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="speed-slider"
          />
          <div className="slider-marks">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
        
        <div className="air-control-color">
          <span className="color-label">风效颜色:</span>
          <div className="color-presets">
            {['#ff8800', '#00a8ff', '#4caf50', '#ff4081', '#7e57c2'].map((color) => (
              <button
                key={color}
                className={`color-preset ${windColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
              />
            ))}
            <input
              type="color"
              value={windColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="color-picker"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirControl;