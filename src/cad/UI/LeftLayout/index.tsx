import React, { useState } from 'react';
import HierarchicalMenu from '../HierarchicalMenu';
import './style.css';

interface LeftLayoutProps {
  isLeftSidebarCollapsed: boolean;
  lineColor: string;
  currentLayerId: string;
  handleDrawLine: () => void;
  handleDrawCircle: () => void;
  handleDrawRectangle: () => void;
  handleDrawPolygon: () => void;
  handleClearAll: () => void;
  handleUploadModel: () => void;
  handleManageModels: () => void;
  handleLayerSelect: (layerId: string) => void;
  handleLayerVisibilityChange: (layerId: string, visible: boolean) => void;
  handleViewLayerLines: (layerId: string) => void;
  handleColorSelect: (color: string) => void;
  handleSetLineWidth: (width: number) => void;
  handleLeftSidebarToggle: (collapsed: boolean) => void;
  getCurrentDocumentLayers: () => Array<{ id: string; name: string; visible: boolean }>;
}

const LeftLayout: React.FC<LeftLayoutProps> = ({
  isLeftSidebarCollapsed,
  lineColor,
  currentLayerId,
  handleDrawLine,
  handleDrawCircle,
  handleDrawRectangle,
  handleDrawPolygon,
  handleClearAll,
  handleUploadModel,
  handleManageModels,
  handleLayerSelect,
  handleLayerVisibilityChange,
  handleViewLayerLines,
  handleColorSelect,
  handleSetLineWidth,
  handleLeftSidebarToggle,
  getCurrentDocumentLayers
}) => {
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState<boolean>(false);
  
  // 预定义颜色选项
  const colorOptions = [
    '#ffffff', // 白色
    '#000000', // 黑色
    '#ff0000', // 红色
    '#00ff00', // 绿色
    '#0000ff', // 蓝色
    '#ffff00', // 黄色
    '#ff00ff', // 紫色
    '#00ffff', // 青色
    '#ff9900', // 橙色
    '#9900ff', // 紫罗兰
    '#ff6666', // 浅红
    '#66ff66', // 浅绿
  ];

  // 切换调色板显示状态
  const toggleColorPalette = () => {
    setIsColorPaletteOpen(!isColorPaletteOpen);
  };

  return (
    <div className={`left-sidebar ${isLeftSidebarCollapsed ? 'collapsed' : ''}`}>
      {/* 收缩/展开按钮 */}
      <div 
        onClick={() => handleLeftSidebarToggle(!isLeftSidebarCollapsed)}
        className="collapse-button"
      >
        <span>
          {isLeftSidebarCollapsed ? '◀' : '▶'}
        </span>
      </div>
      
      {/* 内容区域 */}
      <div className="left-sidebar-content" style={{ display: isLeftSidebarCollapsed ? 'none' : 'flex' }}>
        {/* 标题 */}
        <div className="left-sidebar-header">
          <h3 className="left-sidebar-title">工具箱</h3>
        </div>
        
        {/* 菜单内容 */}
        <div className="left-sidebar-menu">
          <HierarchicalMenu 
            items={[
              {
                id: 'drawing',
                label: '绘图工具',
                icon: '✏️',
                children: [
                  {
                    id: 'line',
                    label: '直线',
                    icon: '╱',
                    action: handleDrawLine
                  },
                  {
                    id: 'circle',
                    label: '圆',
                    icon: '○',
                    action: handleDrawCircle
                  },
                  {
                    id: 'rectangle',
                    label: '矩形',
                    icon: '▭',
                    action: handleDrawRectangle
                  },
                  {
                    id: 'polygon',
                    label: '多边形',
                    icon: '⬡',
                    action: handleDrawPolygon
                  },
                  {
                    id: 'clear-all',
                    label: '清除所有线条',
                    icon: '🗑️',
                    action: handleClearAll
                  }
                ]
              },
              {
                id: 'model-library',
                label: '模型构件库',
                icon: '🏢',
                children: [
                  {
                    id: 'upload-model',
                    label: '上传模型',
                    icon: '📤',
                    action: handleUploadModel
                  },
                  {
                    id: 'manage-models',
                    label: '管理构件',
                    icon: '🧰',
                    action: handleManageModels
                  }
                ]
              },
              {
                id: 'layers',
                label: '图层管理',
                icon: '📚',
                children: [
                  ...getCurrentDocumentLayers().map((layer) => ({
                    id: `layer-${layer.id}`,
                    label: `${layer.name} ${layer.id === currentLayerId ? '(当前)' : ''}`,
                    icon: layer.id === currentLayerId ? '✓' : (layer.visible ? '○' : '✕'),
                    action: () => handleLayerSelect(layer.id),
                    toggleAction: {
                      icon: layer.visible ? '👁️' : '🙈',
                      action: () => handleLayerVisibilityChange(layer.id, !layer.visible),
                      state: layer.visible
                    },
                    extraAction: {
                      icon: '🔍',
                      action: () => handleViewLayerLines(layer.id)
                    }
                  }))
                ]
              },
              {
                id: 'properties',
                label: '属性设置',
                icon: '⚙️',
                children: [
                  {
                    id: 'line-color',
                    label: '线条颜色',
                    icon: '🎨',
                    action: toggleColorPalette
                  },
                  {
                    id: 'line-width',
                    label: '粗线条',
                    icon: '📐',
                    action: () => handleSetLineWidth(5)
                  }
                ]
              }
            ]}
          />
          
          {/* 调色板弹出窗口 */}
          {isColorPaletteOpen && (
            <div className="color-palette">
              <div className="color-grid">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`color-option ${lineColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* 自定义颜色选择器 */}
              <div className="custom-color-container">
                <input 
                  type="color" 
                  value={lineColor} 
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="custom-color-input"
                />
                <span className="custom-color-label">自定义颜色</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeftLayout;