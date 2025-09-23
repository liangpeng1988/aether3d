import React from "react";

interface GLBModelControlToggleProps {
  onClick: () => void;
}

const GLBModelControlToggle: React.FC<GLBModelControlToggleProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: 'rgba(254, 125, 27, 1)',
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
        <path 
          d="M4 6H20M4 12H20M4 18H20" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default GLBModelControlToggle;