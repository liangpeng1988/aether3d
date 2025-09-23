import React from "react";

interface CurtainControlPanelToggleProps {
  onClick: () => void;
}

const CurtainControlPanelToggle: React.FC<CurtainControlPanelToggleProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: '290px', // 放在右下角，与其他控制按钮对齐，位于点光源和空调按钮之间
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'rgba(156, 39, 176, 1)', // 紫色，与窗帘控制面板主题色一致
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
        {/* 窗帘图标 */}
        <path 
          d="M3 21V3" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M21 21V3" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M3 12H21" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M3 6H21" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
        <path 
          d="M3 18H21" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default CurtainControlPanelToggle;