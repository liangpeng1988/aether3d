import React, { useState } from 'react';
import './style.css';

interface Toolbar3DProps {
  onTranslate?: () => void;
  onRotate?: () => void;
  onScale?: () => void;
  onSelect?: () => void;
  onVertexSelect?: () => void;
  onEdgeSelect?: () => void;
  onFaceSelect?: () => void;
  activeTool?: 'translate' | 'rotate' | 'scale' | 'select' | 'vertex' | 'edge' | 'face';
}

const Toolbar3D: React.FC<Toolbar3DProps> = ({
  onTranslate,
  onRotate,
  onScale,
  onSelect,
  onVertexSelect,
  onEdgeSelect,
  onFaceSelect,
  activeTool = 'select'
}) => {
  const handleToolClick = (tool: 'translate' | 'rotate' | 'scale' | 'select' | 'vertex' | 'edge' | 'face') => {
    switch (tool) {
      case 'translate':
        if (onTranslate) onTranslate();
        break;
      case 'rotate':
        if (onRotate) onRotate();
        break;
      case 'scale':
        if (onScale) onScale();
        break;
      case 'select':
        if (onSelect) onSelect();
        break;
      case 'vertex':
        if (onVertexSelect) onVertexSelect();
        break;
      case 'edge':
        if (onEdgeSelect) onEdgeSelect();
        break;
      case 'face':
        if (onFaceSelect) onFaceSelect();
        break;
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      background: 'rgba(42, 42, 42, 0.9)',
      borderRadius: '6px',
      zIndex: 3,
      width: '60px',
      padding: '10px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
    }}>
      <div 
        className={`toolbar-button ${activeTool === 'select' ? 'active' : ''}`}
        onClick={() => handleToolClick('select')}
        title="选择 (V)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.4297 5.92969L15.5797 7.07969L8.64967 14.0097L9.99967 15.3597L16.9297 8.42969L18.0797 9.57969L11.1497 16.5097L12.4997 17.8597L19.4297 10.9297L20.5797 12.0797L12.4997 20.1497L3.84967 11.5097L5.26967 10.0897L14.4297 5.92969Z" fill="currentColor"/>
        </svg>
      </div>
      
      <div 
        className={`toolbar-button ${activeTool === 'vertex' ? 'active' : ''}`}
        onClick={() => handleToolClick('vertex')}
        title="顶点选择 (1)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
          <circle cx="6" cy="6" r="2" fill="currentColor"/>
          <circle cx="18" cy="6" r="2" fill="currentColor"/>
          <circle cx="6" cy="18" r="2" fill="currentColor"/>
          <circle cx="18" cy="18" r="2" fill="currentColor"/>
        </svg>
      </div>
      
      <div 
        className={`toolbar-button ${activeTool === 'edge' ? 'active' : ''}`}
        onClick={() => handleToolClick('edge')}
        title="边选择 (2)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2"/>
          <circle cx="4" cy="12" r="3" fill="currentColor"/>
          <circle cx="20" cy="12" r="3" fill="currentColor"/>
        </svg>
      </div>
      
      <div 
        className={`toolbar-button ${activeTool === 'face' ? 'active' : ''}`}
        onClick={() => handleToolClick('face')}
        title="面选择 (3)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M4 12L20 12" stroke="currentColor" strokeWidth="1"/>
          <path d="M12 4L12 20" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>
      
      <div className="toolbar-divider" />
      
      <div 
        className={`toolbar-button ${activeTool === 'translate' ? 'active' : ''}`}
        onClick={() => handleToolClick('translate')}
        title="移动 (W)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L12 22" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 12L22 12" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2L15 7" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 2L9 7" stroke="currentColor" strokeWidth="2"/>
          <path d="M22 12L17 9" stroke="currentColor" strokeWidth="2"/>
          <path d="M22 12L17 15" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      
      <div 
        className={`toolbar-button ${activeTool === 'rotate' ? 'active' : ''}`}
        onClick={() => handleToolClick('rotate')}
        title="旋转 (E)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
          <path d="M20 12L17 9" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 12L17 15" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      
      <div 
        className={`toolbar-button ${activeTool === 'scale' ? 'active' : ''}`}
        onClick={() => handleToolClick('scale')}
        title="缩放 (R)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2"/>
          <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
    </div>
  );
};

export default Toolbar3D;