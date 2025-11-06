import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import './style.css';
import { LineData, ModelData } from '../../data/Document';
import { LayerManagerService } from '../../controllers/LayerManagerService';
import { LayerManager as EngineLayerManager } from '../../../../Engine/core';
import { ILayer } from '../../../../Engine/interface/ILayer';

// 使用 ILayer 接口
interface Layer extends ILayer {}

interface LayerManagerProps {
  isOpen: boolean;
  onClose: () => void;
  // 移除对Document的依赖，直接传入图层数据
  layers: ILayer[];
  lines: LineData[];
  models: ModelData[];
  currentLayerId?: string; // 添加当前图层ID属性
  onLayerVisibilityChange?: (layerId: string, visible: boolean) => void;
  onLayerLockChange?: (layerId: string, locked: boolean) => void;
  onLayerColorChange?: (layerId: string, color: string) => void;
  onLayerRename?: (layerId: string, name: string) => void;
  onAddLayer?: () => void;
  onDeleteLayer?: (layerId: string) => void;
  onLayerSelect?: (layerId: string) => void; // 添加图层选择回调
  // onRefresh?: () => void; // 移除刷新回调
}

// 创建独立的图层项组件，避免在每次渲染时重新创建
const LayerItem: React.FC<{
  layer: Layer;
  isSelected: boolean;
  lineCount: number;
  onVisibilityChange?: (layerId: string, visible: boolean) => void;
  onLockChange?: (layerId: string, locked: boolean) => void;
  onDelete?: (layerId: string) => void;
  onRenameStart?: (layer: Layer) => void;
  onLayerSelect?: (layerId: string) => void;
}> = React.memo(({ 
  layer, 
  isSelected, 
  lineCount,
  onVisibilityChange,
  onLockChange,
  onDelete,
  onRenameStart,
  onLayerSelect
}) => {
  // 使用 React.memo 确保只有当 props 变化时才重新渲染
  console.log(`渲染图层项: ${layer.name}, 对象数量: ${lineCount}`);
  return (
    <div
      className={`layer-item ${isSelected ? 'selected' : ''}`}
    >
      {/* 可见性切换 */}
      <button
        onClick={() => onVisibilityChange?.(layer.id, !layer.visible)}
        className={`layer-visibility-btn ${layer.visible ? 'visible' : 'hidden'}`}
        aria-label={layer.visible ? "隐藏图层" : "显示图层"}
      >
        👁️
      </button>
      
      {/* 锁定状态切换 */}
      <button
        onClick={() => onLockChange?.(layer.id, !layer.locked)}
        className={`layer-lock-btn ${layer.locked ? 'locked' : 'unlocked'}`}
        aria-label={layer.locked ? "解锁图层" : "锁定图层"}
      >
        {layer.locked ? '🔒' : '🔓'}
      </button>
      
      {/* 图层颜色 */}
      <div
        className={`layer-color-indicator ${isSelected ? 'selected' : ''}`}
        style={{ backgroundColor: layer.color }}
        title={`图层颜色: ${layer.color}`}
      >
        {/* 图层可见性指示器 */}
        {!layer.visible && (
          <div className="layer-hidden-line" />
        )}
      </div>
      
      {/* 图层名称和对象数量 */}
      <div
        className="layer-info"
        onDoubleClick={() => onRenameStart?.(layer)}
        onClick={() => onLayerSelect?.(layer.id)}
      >
        <div className="layer-name" title={layer.name}>{layer.name}</div>
        <div className="layer-line-count" title={`${lineCount} 个对象`}>
          {lineCount} 个对象
        </div>
        {layer.locked && (
          <div className="layer-locked-badge" title="图层已锁定">
            已锁定
          </div>
        )}
        {!layer.visible && (
          <div className="layer-hidden-badge" title="图层已隐藏">
            已隐藏
          </div>
        )}
      </div>
      
      {/* 删除按钮 */}
      <button
        onClick={() => onDelete?.(layer.id)}
        className="layer-delete-btn"
        aria-label="删除图层"
      >
        🗑️
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数，只有当关键属性变化时才重新渲染
  return (
    prevProps.layer.id === nextProps.layer.id &&
    prevProps.layer.name === nextProps.layer.name &&
    prevProps.layer.visible === nextProps.layer.visible &&
    prevProps.layer.locked === nextProps.layer.locked &&
    prevProps.layer.color === nextProps.layer.color &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.lineCount === nextProps.lineCount
  );
});

const LayerManager: React.FC<LayerManagerProps> = ({
  isOpen,
  onClose,
  layers,
  lines,
  models,
  currentLayerId: selectedLayerId, // 接收当前图层ID，重命名避免冲突
  onLayerVisibilityChange,
  onLayerLockChange,
  onLayerColorChange,
  onLayerRename,
  onAddLayer,
  onDeleteLayer,
  onLayerSelect, // 接收图层选择回调
  // onRefresh // 移除刷新回调
}) => {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const layerListRef = useRef<HTMLDivElement>(null);
  // const [isRefreshing, setIsRefreshing] = useState(false); // 移除刷新状态
  const [prevLayerCount, setPrevLayerCount] = useState(0);

  // 使用 useCallback 优化事件处理函数，避免不必要的重新渲染
  const handleRenameStart = useCallback((layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  }, []);

  const handleRenameConfirm = useCallback((layerId: string) => {
    if (onLayerRename && editingName.trim() !== '') {
      onLayerRename(layerId, editingName.trim());
    }
    setEditingLayerId(null);
    setEditingName('');
  }, [onLayerRename, editingName]);

  const handleRenameCancel = useCallback(() => {
    setEditingLayerId(null);
    setEditingName('');
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>, layerId: string) => {
    if (e.key === 'Enter') {
      handleRenameConfirm(layerId);
    }
  }, [handleRenameConfirm]);

  // 处理添加图层
  const handleAddLayerClick = useCallback(() => {
    if (onAddLayer) {
      onAddLayer();
    }
  }, [onAddLayer]);

  // 监听图层变化，当图层数量发生变化时滚动到底部
  useEffect(() => {
    const userLayerCount = layers.filter(layer => layer.id !== 'layer0').length;
    if (userLayerCount > prevLayerCount && layerListRef.current) {
      // 新增图层时，滚动到底部
      layerListRef.current.scrollTop = layerListRef.current.scrollHeight;
    }
    setPrevLayerCount(userLayerCount);
  }, [layers, prevLayerCount]);

  // 监听线条和模型数据变化，用于调试
  useEffect(() => {
    // console.log('图层管理器数据更新:', { layers, lines, models });
  }, [layers, lines, models]);

  // 使用 useMemo 缓存线条数据和图层线条计数
  const { layerLineCounts, layerModelCounts } = useMemo(() => {
    // 预计算每个图层的线条数量，避免在渲染时重复计算
    const lineCounts: Record<string, number> = {};
    const modelCounts: Record<string, number> = {};
    layers.forEach(layer => {
      lineCounts[layer.id] = 0;
      modelCounts[layer.id] = 0;
    });
    
    // 单次遍历计算所有图层的线条数量
    lines.forEach(line => {
      if (line.layerId && lineCounts.hasOwnProperty(line.layerId)) {
        lineCounts[line.layerId]++;
      }
    });
    
    // 单次遍历计算所有图层的模型数量
    models.forEach(model => {
      if (model.layerId && modelCounts.hasOwnProperty(model.layerId)) {
        modelCounts[model.layerId]++;
      }
    });
    
    // console.log('图层对象统计:', { lineCounts, modelCounts, lines, models });
    
    return {
      layerLineCounts: lineCounts,
      layerModelCounts: modelCounts
    };
  }, [layers, lines, models]);

  // 计算用户图层（过滤掉系统图层）
  const userLayers = useMemo(() => {
    return layers.filter(layer => layer.id !== 'layer0');
  }, [layers]);

  // 编辑模式下的图层项
  const EditingLayerItem = React.memo(({ layer }: { layer: Layer }) => {
    return (
      <div
        className={`layer-item ${layer.id === selectedLayerId ? 'selected' : ''}`}
      >
        {/* 可见性切换 */}
        <button
          onClick={() => onLayerVisibilityChange?.(layer.id, !layer.visible)}
          className={`layer-visibility-btn ${layer.visible ? 'visible' : 'hidden'}`}
          aria-label={layer.visible ? "隐藏图层" : "显示图层"}
        >
          👁️
        </button>
        
        {/* 锁定状态切换 */}
        <button
          onClick={() => onLayerLockChange?.(layer.id, !layer.locked)}
          className={`layer-lock-btn ${layer.locked ? 'locked' : 'unlocked'}`}
          aria-label={layer.locked ? "解锁图层" : "锁定图层"}
        >
          {layer.locked ? '🔒' : '🔓'}
        </button>
        
        {/* 图层颜色 */}
        <div
          className={`layer-color-indicator ${layer.id === selectedLayerId ? 'selected' : ''}`}
          style={{ backgroundColor: layer.color }}
          title={`图层颜色: ${layer.color}`}
        >
          {/* 图层可见性指示器 */}
          {!layer.visible && (
            <div className="layer-hidden-line" />
          )}
        </div>
        
        {/* 图层名称和线条数量编辑 */}
        <div className="layer-edit-container">
          <input
            type="text"
            value={editingName}
            onChange={handleNameChange}
            onKeyPress={(e) => handleKeyPress(e, layer.id)}
            className="layer-edit-input"
            autoFocus
          />
          <button
            onClick={() => handleRenameConfirm(layer.id)}
            className="layer-edit-confirm-btn"
            aria-label="确认"
          >
            ✓
          </button>
          <button
            onClick={handleRenameCancel}
            className="layer-edit-cancel-btn"
            aria-label="取消"
          >
            ✕
          </button>
        </div>
        
        {/* 删除按钮 */}
        <button
          onClick={() => onDeleteLayer?.(layer.id)}
          className="layer-delete-btn"
          aria-label="删除图层"
        >
          🗑️
        </button>
      </div>
    );
  });

  // 将条件渲染移到Hooks调用之后
  if (!isOpen) {
    return null;
  }

  return (
    <div className="layer-manager-overlay">
      <div className="layer-manager-dialog">
        {/* 标题栏 */}
        <div className="layer-manager-header">
          <h3 className="layer-manager-title">图层管理</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* 移除刷新按钮 */}
            <button
              onClick={onClose}
              className="layer-manager-close-btn"
              aria-label="关闭图层管理器"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="layer-manager-content">
          {/* 图层列表 */}
          <div className="layer-list-section">
            <div className="layer-list-header">
              <h4>图层列表</h4>
              <button
                onClick={handleAddLayerClick}
                className="add-layer-btn"
              >
                添加图层
              </button>
            </div>
            
            <div 
              ref={layerListRef}
              className="layer-list"
            >
              {/* 渲染图层项 */}
              {userLayers.length > 0 ? (
                userLayers.map((layer, index) => (
                  <React.Fragment key={layer.id}>
                    {editingLayerId === layer.id ? (
                      <EditingLayerItem layer={layer} />
                    ) : (
                      <LayerItem 
                        layer={layer} 
                        isSelected={layer.id === selectedLayerId}
                        lineCount={(layerLineCounts[layer.id] || 0) + (layerModelCounts[layer.id] || 0)}
                        onVisibilityChange={onLayerVisibilityChange}
                        onLockChange={onLayerLockChange}
                        onDelete={onDeleteLayer}
                        onRenameStart={handleRenameStart}
                        onLayerSelect={onLayerSelect}
                      />
                    )}
                    {/* 在每个图层项之间添加分割线，除了最后一个 */}
                    {index < userLayers.length - 1 && <div className="layer-item-divider" />}
                  </React.Fragment>
                ))
              ) : (
                <div className="layer-list-empty">
                  暂无图层
                </div>
              )}
            </div>
          </div>
          
          {/* 图层操作说明 */}
          <div className="layer-help-section">
            <h4 className="layer-help-title">操作说明</h4>
            <ul className="layer-help-list">
              <li>点击👁️图标切换图层可见性</li>
              <li>点击🔒/🔓图标切换图层锁定状态</li>
              <li>双击图层名称可重命名</li>
              <li>点击🗑️图标删除图层</li>
              {/* 移除刷新说明 */}
            </ul>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="layer-manager-footer">
          <button
            onClick={onClose}
            className="layer-manager-close-footer-btn"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayerManager;