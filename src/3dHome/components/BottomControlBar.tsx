import React from 'react';

interface BottomControlBarProps {
  onLightClick?: () => void;
  onDeviceClick?: () => void;
  onSecurityClick?: () => void;
}

const BottomControlBar: React.FC<BottomControlBarProps> = ({
  onLightClick,
  onDeviceClick,
  onSecurityClick
}) => {
  return (
    <div style={{
      height: '60px',
      backgroundColor: 'rgba(30, 30, 30, 0.8)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)', // Safari兼容
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px 12px 0 0',
      boxShadow: '0 -2px 20px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        width: '100%',
        maxWidth: '400px'
      }}>
        <button
          onClick={onLightClick}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '10px 20px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '18px', marginBottom: '4px' }}>💡</span>
          <span>灯光</span>
        </button>
        
        <button
          onClick={onDeviceClick}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '10px 20px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '18px', marginBottom: '4px' }}>⚙️</span>
          <span>设备</span>
        </button>
        
        <button
          onClick={onSecurityClick}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '10px 20px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '18px', marginBottom: '4px' }}>🔒</span>
          <span>安防</span>
        </button>
      </div>
    </div>
  );
};

export default BottomControlBar;