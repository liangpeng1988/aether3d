import React, { useState } from 'react';
import './style.css';

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
  action?: () => void;
}

interface MenuBarProps {
  onNewDocument?: () => void;
  onOpenDocument?: () => void;
  onSaveDocument?: () => void;
  onSaveAsDocument?: () => void;
  onImportGLBModel?: () => void; // 添加导入GLB模型回调
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onDeselect?: () => void;
  onDrawLine?: () => void;
  onDrawCircle?: () => void;
  onDrawRectangle?: () => void;
  onDrawPolygon?: () => void;
  onDimensionLinear?: () => void;
  onDimensionAligned?: () => void;
  onDimensionAngular?: () => void;
  onDimensionDiameter?: () => void;
  onDimensionRadius?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomExtent?: () => void;
  onPan?: () => void;
  onOrbit?: () => void;
  onTopView?: () => void;
  onFrontView?: () => void;
  onSideView?: () => void;
  onHelp?: () => void;
  onAbout?: () => void;
  onNewView?: () => void; // 添加新建视图回调
  // AI协助功能回调
  onAIChat?: () => void;
  onAIAutoDesign?: () => void;
  onAIOptimize?: () => void;
  onAIAnalyze?: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({
  onNewDocument,
  onOpenDocument,
  onSaveDocument,
  onSaveAsDocument,
  onImportGLBModel, // 添加导入GLB模型回调
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  onDeselect,
  onDrawLine,
  onDrawCircle,
  onDrawRectangle,
  onDrawPolygon,
  onDimensionLinear,
  onDimensionAligned,
  onDimensionAngular,
  onDimensionDiameter,
  onDimensionRadius,
  onZoomIn,
  onZoomOut,
  onZoomExtent,
  onPan,
  onOrbit,
  onTopView,
  onFrontView,
  onSideView,
  onHelp,
  onAbout,
  onNewView, // 添加新建视图回调
  // AI协助功能回调
  onAIChat,
  onAIAutoDesign,
  onAIOptimize,
  onAIAnalyze
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'file',
      label: '文件',
      children: [
        { id: 'new', label: '新建', action: onNewDocument },
        { id: 'new-view', label: '新建主页标签', action: onNewView }, // 添加新建主页标签选项
        { id: 'open', label: '打开', action: onOpenDocument },
        { id: 'import-glb', label: '导入GLB模型', action: onImportGLBModel }, // 添加导入GLB模型选项
        { id: 'save', label: '保存', action: onSaveDocument },
        { id: 'save-as', label: '另存为', action: onSaveAsDocument },
        { id: 'separator1', label: '-' },
        { id: 'exit', label: '退出' }
      ]
    },
    {
      id: 'edit',
      label: '编辑',
      children: [
        { id: 'undo', label: '撤销', action: onUndo },
        { id: 'redo', label: '重做', action: onRedo },
        { id: 'separator1', label: '-' },
        { id: 'cut', label: '剪切', action: onCut },
        { id: 'copy', label: '复制', action: onCopy },
        { id: 'paste', label: '粘贴', action: onPaste },
        { id: 'separator2', label: '-' },
        { id: 'select-all', label: '全选', action: onSelectAll },
        { id: 'deselect', label: '取消选择', action: onDeselect }
      ]
    },
    {
      id: 'draw',
      label: '绘图',
      children: [
        { id: 'line', label: '直线', action: onDrawLine },
        { id: 'circle', label: '圆', action: onDrawCircle },
        { id: 'rectangle', label: '矩形', action: onDrawRectangle },
        { id: 'polygon', label: '多边形', action: onDrawPolygon }
      ]
    },
    {
      id: 'dimension',
      label: '标注',
      children: [
        { id: 'linear', label: '线性标注', action: onDimensionLinear },
        { id: 'aligned', label: '对齐标注', action: onDimensionAligned },
        { id: 'angular', label: '角度标注', action: onDimensionAngular },
        { id: 'diameter', label: '直径标注', action: onDimensionDiameter },
        { id: 'radius', label: '半径标注', action: onDimensionRadius }
      ]
    },
    {
      id: 'view',
      label: '视图',
      children: [
        { id: 'zoom-in', label: '放大', action: onZoomIn },
        { id: 'zoom-out', label: '缩小小', action: onZoomOut },
        { id: 'zoom-extent', label: '适合窗口', action: onZoomExtent },
        { id: 'separator1', label: '-' },
        { id: 'pan', label: '平移', action: onPan },
        { id: 'orbit', label: '环绕', action: onOrbit },
        { id: 'separator2', label: '-' },
        { id: 'top-view', label: '顶视图', action: onTopView },
        { id: 'front-view', label: '前视图', action: onFrontView },
        { id: 'side-view', label: '侧视图', action: onSideView }
      ]
    },
    {
      id: 'ai',
      label: 'AI协助',
      children: [
        { id: 'ai-chat', label: 'AI对话助手', action: onAIChat },
        { id: 'ai-auto-design', label: 'AI自动设计', action: onAIAutoDesign },
        { id: 'ai-optimize', label: 'AI优化建议', action: onAIOptimize },
        { id: 'ai-analyze', label: 'AI分析报告', action: onAIAnalyze }
      ]
    },
    {
      id: 'help',
      label: '帮助',
      children: [
        { id: 'help-content', label: '帮助内容', action: onHelp },
        { id: 'about', label: '关于', action: onAbout }
      ]
    }
  ];

  const handleMenuClick = (menuId: string) => {
    if (openMenu === menuId) {
      setOpenMenu(null);
    } else {
      setOpenMenu(menuId);
    }
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.action) {
      item.action();
    }
    setOpenMenu(null);
  };

  const handleMouseLeave = () => {
    setOpenMenu(null);
  };

  return (
    <div 
      className="menu-bar"
      onMouseLeave={handleMouseLeave}
    >
      {menuItems.map((menu) => (
        <div 
          key={menu.id}
          className="menu-item"
          onMouseEnter={() => setOpenMenu(menu.id)}
          onClick={() => handleMenuClick(menu.id)}
        >
          <span>{menu.label}</span>
          {openMenu === menu.id && menu.children && (
            <div className="dropdown-menu">
              {menu.children.map((item) => (
                <div
                  key={item.id}
                  className={`dropdown-item ${item.label === '-' ? 'separator' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.label !== '-') {
                      handleMenuItemClick(item);
                    }
                  }}
                >
                  {item.label === '-' ? null : item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MenuBar;