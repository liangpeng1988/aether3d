import React from "react";
import "./AirControl.css";

interface AirControlToggleProps {
  onClick: () => void;
}

const AirControlToggle: React.FC<AirControlToggleProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: '220px', // 与其它控制按钮保持一定距离
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0, 168, 255, 1)', // 蓝色，与空调控制面板主题色一致
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
        {/* 空调图标 */}
        <rect 
          x="4" 
          y="4" 
          width="16" 
          height="16" 
          rx="2" 
          stroke="currentColor" 
          strokeWidth="2" 
        />
        <path 
          d="M8 9H16" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M8 12H16" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M8 15H13" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <circle 
          cx="16" 
          cy="15" 
          r="1" 
          fill="currentColor" 
        />
      </svg>
    </div>
  );
};

export default AirControlToggle;