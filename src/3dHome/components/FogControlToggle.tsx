import React from "react";

interface FogControlToggleProps {
  onClick: () => void;
}

const FogControlToggle: React.FC<FogControlToggleProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: '230px', // 与其它控制按钮保持一定距离
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
        {/* 雾效图标 */}
        <path 
          d="M4 15.5C4 15.5 5.5 13 8 13C10.5 13 12 15.5 12 15.5C12 15.5 13.5 13 16 13C18.5 13 20 15.5 20 15.5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path 
          d="M4 10.5C4 10.5 5.5 8 8 8C10.5 8 12 10.5 12 10.5C12 10.5 13.5 8 16 8C18.5 8 20 10.5 20 10.5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path 
          d="M4 5.5C4 5.5 5.5 3 8 3C10.5 3 12 5.5 12 5.5C12 5.5 13.5 3 16 3C18.5 3 20 5.5 20 5.5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default FogControlToggle;