import React, { useState, useRef } from 'react';
import BuildLibraryPanel from '../BuildLibraryPanel';
import HierarchyPanel from '../HierarchyPanel';
import PropertiesPanel from '../PropertiesPanel';
import './style.css';

interface RightLayoutProps {
  isPropertiesPanelCollapsed: boolean;
  activeRightTab: 'library' | 'properties' | 'hierarchy';
  is3DView: boolean;
  selectedObject: any;
  currentLayerId: string;
  handlePropertiesPanelToggle: (collapsed: boolean) => void;
  setActiveRightTab: (tab: 'library' | 'properties' | 'hierarchy') => void;
  handleObjectSelected: (object: any | null) => void;
  handlePropertyChange: (property: string, value: any) => void;
  getCurrentDocumentLayers: () => Array<{ id: string; name: string; visible: boolean }>;
  canvas3DRef: React.RefObject<any>;
  canvas2DRef: React.RefObject<any>;
  handleModelSelect: (model: any) => void;
}

const RightLayout: React.FC<RightLayoutProps> = ({
  isPropertiesPanelCollapsed,
  activeRightTab,
  is3DView,
  selectedObject,
  currentLayerId,
  handlePropertiesPanelToggle,
  setActiveRightTab,
  handleObjectSelected,
  handlePropertyChange,
  getCurrentDocumentLayers,
  canvas3DRef,
  canvas2DRef,
  handleModelSelect
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing && resizeRef.current) {
      const container = resizeRef.current.parentElement;
      if (container) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth < 60) {
          if (!isPropertiesPanelCollapsed) {
            handlePropertiesPanelToggle(true);
          }
        } else {
          if (isPropertiesPanelCollapsed) {
            handlePropertiesPanelToggle(false);
          }
        }
      }
    }
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      return () => {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'auto';
      };
    }
  }, [isResizing]);

  return (
    <div 
      className={`right-sidebar ${isPropertiesPanelCollapsed ? 'collapsed' : ''}`}
      ref={resizeRef}
    >
      {/* 拖动边缘 */}
      <div 
        onMouseDown={startResizing}
        className="resize-handle"
      />

      {/* Tabs面板 */}
      <div className="properties-panel" style={{ display: isPropertiesPanelCollapsed ? 'none' : 'flex' }}>
        {/* Tabs标签页 */}
        <div className="right-tabs-container">
          <div
            onClick={() => setActiveRightTab('library')}
            className={`right-tab ${activeRightTab === 'library' ? 'active' : ''}`}
          >
            构建库
          </div>
          <div
            onClick={() => setActiveRightTab('properties')}
            className={`right-tab ${activeRightTab === 'properties' ? 'active' : ''}`}
          >
            属性
          </div>
          <div
            onClick={() => setActiveRightTab('hierarchy')}
            className={`right-tab ${activeRightTab === 'hierarchy' ? 'active' : ''}`}
          >
            层级
          </div>
        </div>

        {/* Tabs内容区域 */}
        <div className="right-tab-content">
          {activeRightTab === 'library' ? (
            // 构建库内容
            <BuildLibraryPanel onModelSelect={handleModelSelect} />
          ) : activeRightTab === 'hierarchy' ? (
            // 层级内容
            <HierarchyPanel
              renderer={is3DView ? canvas3DRef.current?.getRenderer() : canvas2DRef.current?.getRenderer()}
              onObjectSelected={handleObjectSelected}
              selectedObject={selectedObject}
            />
          ) : (
            // 属性面板内容
            <PropertiesPanel
              selectedObject={selectedObject}
              onPropertyChange={handlePropertyChange}
              layers={getCurrentDocumentLayers()}
              canvas3DRef={canvas3DRef}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RightLayout;