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
          <path d="M6 6L18 6" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 18L18 18" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 6L6 18" stroke="currentColor" strokeWidth="2"/>
          <path d="M18 6L18 18" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
      
      <div 
        className={`toolbar-button ${activeTool === 'face' ? 'active' : ''}`}
        onClick={() => handleToolClick('face')}
        title="面选择 (3)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" fill="currentColor"/>
          <path d="M4 4L20 20" stroke="white" strokeWidth="1"/>
        </svg>
      </div>
      
      <div 
        className={`toolbar-button ${activeTool === 'translate' ? 'active' : ''}`}
        onClick={() => handleToolClick('translate')}
        title="移动 (W)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 6L16 9L13 12V10H8V12L5 9L8 6V8H13V6Z" fill="currentColor"/>
          <path d="M11 18L8 15L11 12V14H16V12L19 15L16 18V16H11V18Z" fill="currentColor"/>
          <path d="M18 13L15 16L12 13H14V8H12L15 5L18 8V10H16V13H18Z" fill="currentColor"/>
          <path d="M6 11L9 8L12 11H10V16H12L9 19L6 16V14H8V11H6Z" fill="currentColor"/>
        </svg>
      </div>
      
      <div 
        className={`toolbar-button ${activeTool === 'rotate' ? 'active' : ''}`}
        onClick={() => handleToolClick('rotate')}
        title="旋转 (E)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="currentColor"/>
          <path d="M13 7H11V11H7V13H11V17H13V13H17V11H13V7Z" fill="currentColor"/>
        </svg>
      </div>
      
      <div 
        className={`toolbar-button ${activeTool === 'scale' ? 'active' : ''}`}
        onClick={() => handleToolClick('scale')}
        title="缩放 (R)"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 3H3V21H21V3ZM19 19H5V5H19V19Z" fill="currentColor"/>
          <path d="M16 13H13V16H11V13H8V11H11V8H13V11H16V13Z" fill="currentColor"/>
          <path d="M11 1H13V3H11V1ZM11 21H13V23H11V21ZM1 11H3V13H1V11ZM21 11H23V13H21V11Z" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
};

export default Toolbar3D;