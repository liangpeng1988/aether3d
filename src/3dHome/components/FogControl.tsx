import React, { useState } from "react";

interface FogControlProps {
  onFogColorChange?: (color: string) => void;
  onFogNearChange?: (near: number) => void;
  onFogFarChange?: (far: number) => void;
  onFogToggle?: (enabled: boolean) => void;
  isVisible?: boolean; // 控制面板是否可见
  onVisibilityChange?: (visible: boolean) => void; // 面板可见性变化回调
}

const FogControl: React.FC<FogControlProps> = ({
  onFogColorChange,
  onFogNearChange,
  onFogFarChange,
  onFogToggle,
  isVisible = true, // 默认可见
  onVisibilityChange
}) => {
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
  const [fogEnabled, setFogEnabled] = useState<boolean>(true);
    // eslint-disable-next-line react-hooks/rules-of-hooks
  const [fogColor, setFogColor] = useState<string>("#17171b");
    // eslint-disable-next-line react-hooks/rules-of-hooks
  const [fogNear, setFogNear] = useState<number>(1);
    // eslint-disable-next-line react-hooks/rules-of-hooks
  const [fogFar, setFogFar] = useState<number>(5);

  const handleFogToggle = () => {
    const newEnabled = !fogEnabled;
    setFogEnabled(newEnabled);
    if (onFogToggle) {
      onFogToggle(newEnabled);
    }
  };

  const handleFogColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setFogColor(color);
    if (onFogColorChange) {
      onFogColorChange(color);
    }
  };

  const handleFogNearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const near = parseFloat(e.target.value);
    setFogNear(near);
    if (onFogNearChange) {
      onFogNearChange(near);
    }
  };

  const handleFogFarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const far = parseFloat(e.target.value);
    setFogFar(far);
    if (onFogFarChange) {
      onFogFarChange(far);
    }
  };

  return (
    <div className="fog-control floating-ui" style={{
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
          雾效控制
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleFogToggle}
            style={{
              backgroundColor: fogEnabled ? 'rgba(254, 125, 27, 1)' : 'rgba(100, 100, 100, 1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            {fogEnabled ? '启用' : '禁用'}
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
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
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
            雾效颜色
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="color"
            value={fogColor}
            onChange={handleFogColorChange}
            style={{
              width: '40px',
              height: '40px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          />
          <span style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {fogColor}
          </span>
        </div>
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
            近裁剪距离
          </span>
          <span style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {fogNear.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={fogNear}
          onChange={handleFogNearChange}
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
            远裁剪距离
          </span>
          <span style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px'
          }}>
            {fogFar.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          step="0.1"
          value={fogFar}
          onChange={handleFogFarChange}
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

export default FogControl;
