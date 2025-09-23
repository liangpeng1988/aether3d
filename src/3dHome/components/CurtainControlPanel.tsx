import React, { useState, useEffect, useRef } from 'react';
import { CurtainDeviceScript } from './Script/CurtainDeviceScript';

interface CurtainControlPanelProps {
  curtainScript: CurtainDeviceScript | null;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

const CurtainControlPanel: React.FC<CurtainControlPanelProps> = ({ 
  curtainScript, 
  isVisible, 
  onVisibilityChange 
}) => {
  const [isCurtainOpen, setIsCurtainOpen] = useState<boolean>(false);
  const [curtainType, setCurtainType] = useState<string>('Curtain');
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (curtainScript) {
      // 初始化窗帘类型
      const configs = (curtainScript as any).configs;
      if (configs && configs.type) {
        setCurtainType(configs.type);
      }
      
      // 初始化窗帘状态
      setIsCurtainOpen(curtainScript.getState());
    }
  }, [curtainScript]);

  const handleOpenCurtain = () => {
    if (curtainScript) {
      curtainScript.Open();
      curtainScript.setState(true);
      setIsCurtainOpen(true);
    }
  };

  const handleCloseCurtain = () => {
    if (curtainScript) {
      curtainScript.Close();
      curtainScript.setState(false);
      setIsCurtainOpen(false);
    }
  };

  const handleToggleCurtain = () => {
    if (isCurtainOpen) {
      handleCloseCurtain();
    } else {
      handleOpenCurtain();
    }
  };

  // 创建可点击标签
  useEffect(() => {
    if (labelRef.current && curtainScript) {
      const labelElement = labelRef.current;
      
      // 添加点击事件
      const handleClick = (event: MouseEvent) => {
        event.stopPropagation();
        handleToggleCurtain();
      };
      
      labelElement.addEventListener('click', handleClick);
      
      // 清理事件监听器
      return () => {
        labelElement.removeEventListener('click', handleClick);
      };
    }
  }, [curtainScript, isCurtainOpen]);

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
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        显示窗帘控制
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: '16px',
      borderRadius: '8px',
      color: 'white',
      minWidth: '250px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0 }}>{curtainType === 'Shutters' ? '百叶窗控制' : '窗帘控制'}</h3>
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
        <p>状态: {isCurtainOpen ? '打开' : '关闭'}</p>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={handleOpenCurtain}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          打开
        </button>
        <button
          onClick={handleCloseCurtain}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          关闭
        </button>
      </div>
      
      <button
        onClick={handleToggleCurtain}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#FF9800',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '16px'
        }}
      >
        切换状态
      </button>
      
      {/* 可点击标签 */}
      <div 
        ref={labelRef}
        style={{
          padding: '12px',
          backgroundColor: isCurtainOpen ? 'rgba(33, 150, 243, 0.7)' : 'rgba(244, 67, 54, 0.7)',
          borderRadius: '4px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          userSelect: 'none'
        }}
      >
        点击{isCurtainOpen ? '关闭' : '打开'}{curtainType === 'Shutters' ? '百叶窗' : '窗帘'}
      </div>
    </div>
  );
};

export default CurtainControlPanel;