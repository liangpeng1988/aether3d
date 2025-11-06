import React, { useState, useRef } from 'react';
import './style.css';

interface ToolbarButton {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
  action?: () => void;
  disabled?: boolean;
}

interface ToolbarProps {
  onNewDocument?: () => void;
  onOpenDocument?: () => void;
  onSaveDocument?: () => void;
  onUploadBuild?: () => void; // 添加上传构建接口回调
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean; // 添加撤销状态
  canRedo?: boolean; // 添加重做状态
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
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
  onToggleTransformSpace?: () => void; // 添加坐标系切换回调
  onOrbit?: () => void;
  onTopView?: () => void;
  onFrontView?: () => void;
  onSideView?: () => void;
  onHelp?: () => void;
  onLayerManager?: () => void;
  onToggleViewMode?: () => void; // 添加２D/3D视图切换回调
  is3DView?: boolean; // 添加当前视图模式状态
  // 选择功能回调
  onSelect?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onInvertSelection?: () => void;
  onBoxSelect?: () => void;
  // TransformControls 模式切换回调
  onSetTranslateMode?: () => void;
  onSetRotateMode?: () => void;
  onSetScaleMode?: () => void;
  currentTransformMode?: 'translate' | 'rotate' | 'scale' | null;
  currentTransformSpace?: 'world' | 'local'; // 添加当前坐标系状态
  // 全屏切换回调
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onNewDocument,
  onOpenDocument,
  onSaveDocument,
  onUploadBuild, // 添加上传构建接口回调
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onCut,
  onCopy,
  onPaste,
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
  onToggleTransformSpace,
  onOrbit,
  onTopView,
  onFrontView,
  onSideView,
  onHelp,
  onLayerManager,
  onToggleViewMode, // 添加２D/3D视图切换回调
  is3DView = false, // 添加当前视图模式状态
  // 选择功能回调
  onSelect,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onBoxSelect,
  // TransformControls 模式切换回调
  onSetTranslateMode,
  onSetRotateMode,
  onSetScaleMode,
  currentTransformMode = null,
  currentTransformSpace = 'world',
  // 全屏切换回调
  onToggleFullscreen,
  isFullscreen = false
}) => {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleToolClick = (toolId: string, action?: () => void) => {
    if (action) {
      action();
    }
    setActiveTool(toolId);
  };

  // 主要工具按钮
  const mainTools: ToolbarButton[] = [
    // { id: 'select', label: '选择', icon: '↖', tooltip: '选择对象 (Esc)', action: onSelect },
    { 
      id: 'transform-space', 
      label: currentTransformSpace === 'world' ? '世界坐标' : '局部坐标', 
      icon: '🌐', 
      tooltip: `当前: ${currentTransformSpace === 'world' ? '世界坐标' : '局部坐标'} (W)键切换`, 
      action: onToggleTransformSpace 
    },
    // { id: 'zoom', label: '缩放', icon: '🔍', tooltip: '缩放视图 (Z)', action: () => console.log('缩放工具') },
  ];

  // TransformControls 模式切换工具（仅3D视图下显示）
  // const transformTools: ToolbarButton[] = is3DView ? [
  //   { 
  //     id: 'translate', 
  //     label: '移动', 
  //     icon: '↔', 
  //     tooltip: '移动模式 (W)', 
  //     action: onSetTranslateMode 
  //   },
  //   { 
  //     id: 'rotate', 
  //     label: '旋转', 
  //     icon: '↻', 
  //     tooltip: '旋转模式 (E)', 
  //     action: onSetRotateMode 
  //   },
  //   { 
  //     id: 'scale', 
  //     label: '缩放', 
  //     icon: '⤢', 
  //     tooltip: '缩放模式 (R)', 
  //     action: onSetScaleMode 
  //   },
  // ] : [];

  // 选择工具按钮
  const selectionTools: ToolbarButton[] = [
    { id: 'select-all', label: '全选', icon: '☑', tooltip: '全选 (Ctrl+A)', action: onSelectAll },
    { id: 'deselect-all', label: '取消', icon: '☐', tooltip: '取消选择 (Ctrl+D)', action: onDeselectAll },
    { id: 'invert-selection', label: '反转', icon: '⇄', tooltip: '反转选择 (Ctrl+I)', action: onInvertSelection },
    { id: 'box-select', label: '框选', icon: '□', tooltip: '框选 (B)', action: onBoxSelect },
  ];

  // // 绘图工具按钮
  // const drawingTools: ToolbarButton[] = [];

  // 标注工具按钮
  const dimensionTools: ToolbarButton[] = [
    { id: 'linear', label: '线性', icon: '📏', tooltip: '线性标注', action: onDimensionLinear },
    { id: 'aligned', label: '对齐', icon: '🔗', tooltip: '对齐标注', action: onDimensionAligned },
    { id: 'angular', label: '角度', icon: '∠', tooltip: '角度标注', action: onDimensionAngular },
    { id: 'diameter', label: '直径', icon: '⌀', tooltip: '直径标注', action: onDimensionDiameter },
    { id: 'radius', label: '半径', icon: 'Ｒ', tooltip: '半径标注', action: onDimensionRadius },
  ];

  // 视图工具按钮
  const viewTools: ToolbarButton[] = [
    { id: 'zoom-in', label: '放大', icon: '➕', tooltip: '放大视图', action: onZoomIn },
    { id: 'zoom-out', label: '缩小', icon: '➖', tooltip: '缩小视图', action: onZoomOut },
    { id: 'zoom-extent', label: '适合窗口', icon: '□', tooltip: '适合窗口', action: onZoomExtent },
    { id: 'top-view', label: '顶视图', icon: '↓', tooltip: '顶视图', action: onTopView },
    { id: 'front-view', label: '前视图', icon: '→', tooltip: '前视图', action: onFrontView },
    { id: 'side-view', label: '侧视图', icon: '↗', tooltip: '侧视图', action: onSideView },
    { id: 'layer-manager', label: '图层', icon: '📚', tooltip: '图层管理器', action: onLayerManager },
    { id: 'toggle-view', label: is3DView ? '2D视图' : '3D视图', icon: is3DView ? '2D' : '3D', tooltip: '切换2D/3D视图', action: onToggleViewMode }, // 添加视图切换按钮
  ];

  // 编辑工具按钮
  const editTools: ToolbarButton[] = [
    { id: 'undo', label: '撤销', icon: '↺', tooltip: '撤销 (Ctrl+Z)', action: onUndo, disabled: !canUndo },
    { id: 'redo', label: '重做', icon: '↻', tooltip: '重做 (Ctrl+Y)', action: onRedo, disabled: !canRedo },
    { id: 'cut', label: '剪切', icon: '✂', tooltip: '剪切 (Ctrl+X)', action: onCut },
    { id: 'copy', label: '复制', icon: '📄', tooltip: '复制 (Ctrl+C)', action: onCopy },
    { id: 'paste', label: '粘贴', icon: '📋', tooltip: '粘贴 (Ctrl+V)', action: onPaste },
  ];

  // 文件工具按钮
  const fileTools: ToolbarButton[] = [
    { id: 'new', label: '新建', icon: '📄', tooltip: '新建文档 (Ctrl+N)', action: onNewDocument },
    { id: 'open', label: '打开', icon: '📂', tooltip: '打开文档 (Ctrl+O)', action: onOpenDocument },
    { id: 'save', label: '保存', icon: '💾', tooltip: '保存文档 (Ctrl+S)', action: onSaveDocument },
    { id: 'upload', label: '上传', icon: '📤', tooltip: '上传构建', action: onUploadBuild }, // 添加上传按钮
  ];

  // 渲染工具组
  const renderToolGroup = (tools: ToolbarButton[], groupName: string) => (
    <div className="toolbar-group">
      {tools.map((tool) => {
        // 判断是否为当前激活的 TransformControls 模式
        const isActiveTransformMode = currentTransformMode && tool.id === currentTransformMode;
        
        return (
          <button
            key={tool.id}
            title={tool.tooltip}
            onClick={() => handleToolClick(tool.id, tool.action)}
            disabled={tool.disabled}
            className={`toolbar-btn ${tool.label.length <= 2 ? 'short' : 'long'} ${
              isActiveTransformMode || activeTool === tool.id ? 'active' : ''
            }`}
          >
            {tool.icon && (
              <span className={`toolbar-btn-icon ${tool.label ? 'with-label' : ''}`}>
                {tool.icon}
              </span>
            )}
            <span>{tool.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="toolbar-container">
      {/* 工具栏内容容器 */}
      <div ref={toolbarRef} className="toolbar-content">
        {renderToolGroup(fileTools, '文件')}
        <div className="toolbar-separator"></div>
        {renderToolGroup(editTools, '编辑')}
        <div className="toolbar-separator"></div>
        {renderToolGroup(mainTools, '主要')}
        {/* {transformTools.length > 0 && (
          <>
            <div className="toolbar-separator"></div>
            {renderToolGroup(transformTools, '变换')}
          </>
        )} */}
        <div className="toolbar-separator"></div>
        {renderToolGroup(selectionTools, '选择')}
        {/* <div className="toolbar-separator"></div> */}
        {/* {renderToolGroup(drawingTools, '绘图')} */}
        <div className="toolbar-separator"></div>
        {renderToolGroup(dimensionTools, '标注')}
        <div className="toolbar-separator"></div>
        {renderToolGroup(viewTools, '视图')}
      </div>
    </div>
  );
};

export default Toolbar;