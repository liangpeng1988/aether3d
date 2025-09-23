import React, { useCallback } from 'react';

interface FPSOptimizerControlToggleProps {
  onClick: () => void;
}

const FPSOptimizerControlToggle: React.FC<FPSOptimizerControlToggleProps> = React.memo(({ onClick }) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'rgba(0, 123, 255, 0.8)',
        border: 'none',
        color: 'white',
        fontSize: '20px',
        cursor: 'pointer',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0, 123, 255, 1)';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 123, 255, 0.8)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      aria-label="打开FPS优化控制面板"
    >
      ⚙️
    </button>
  );
});

export default FPSOptimizerControlToggle;