import React from "react";

interface PointLightControlToggleProps {
  onClick: () => void;
}

const PointLightControlToggle: React.FC<PointLightControlToggleProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: '160px', // 与其它控制按钮保持一定距离
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'rgba(254, 125, 27, 1)', // 与其它控制按钮保持一致的颜色
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: 'white' }}
      >
        {/* 点光源图标 */}
        <circle 
          cx="12" 
          cy="12" 
          r="3" 
          stroke="currentColor" 
          strokeWidth="2" 
        />
        <path 
          d="M12 3V5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M12 19V21" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M3 12H5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M19 12H21" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M5.64 5.64L7.05 7.05" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M16.95 16.95L18.36 18.36" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M5.64 18.36L7.05 16.95" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M16.95 7.05L18.36 5.64" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default PointLightControlToggle;