import React, { useState } from 'react';
import './style.css';

/**
 * 构建构件数据接口
 */
interface BuildComponent {
  id: string;              // 唯一标识
  name: string;            // 构件名称
  category: string;        // 构件分类（家具、建筑等）
  previewImage: string;    // 预览图路径
  filePath: string;        // 模型文件路径（IFC格式）
  size: string;            // 文件大小
  lastModified: string;    // 最后修改日期
}

/**
 * 构建库面板组件属性接口
 */
interface BuildLibraryPanelProps {
  onModelSelect?: (model: BuildComponent) => void;  // 模型选中回调
}

/**
 * 构建库面板组件
 * 
 * 功能说明：
 * 1. 展示可拖拽的3D模型构件库
 * 2. 支持搜索和分类筛选
 * 3. 支持拖拽模型到3D场景
 * 4. 显示构件详细信息和统计
 * 
 * @param {BuildLibraryPanelProps} props - 组件属性
 * @returns {React.FC} 构建库面板组件
 */
const BuildLibraryPanel: React.FC<BuildLibraryPanelProps> = ({ onModelSelect }) => {
  /**
   * 示例构建数据
   * 包含家具和建筑两大类型的8个示例构件
   */
  const [models] = useState<BuildComponent[]>([
    {
      id: '1',
      name: '办公桌',
      category: '家具',
      previewImage: '',
      filePath: '/models/desk.ifc',
      size: '2.4 MB',
      lastModified: '2023-05-15'
    },
    {
      id: '2',
      name: '会议桌',
      category: '家具',
      previewImage: '',
      filePath: '/models/conference-table.ifc',
      size: '1.8 MB',
      lastModified: '2023-05-10'
    },
    {
      id: '3',
      name: '办公椅',
      category: '家具',
      previewImage: '',
      filePath: '/models/office-chair.ifc',
      size: '1.2 MB',
      lastModified: '2023-05-12'
    },
    {
      id: '4',
      name: '文件柜',
      category: '家具',
      previewImage: '',
      filePath: '/models/filing-cabinet.ifc',
      size: '0.9 MB',
      lastModified: '2023-05-08'
    },
    {
      id: '5',
      name: '墙体',
      category: '建筑',
      previewImage: '',
      filePath: '/models/wall.ifc',
      size: '0.5 MB',
      lastModified: '2023-05-05'
    },
    {
      id: '6',
      name: '门',
      category: '建筑',
      previewImage: '',
      filePath: '/models/door.ifc',
      size: '0.7 MB',
      lastModified: '2023-05-03'
    },
    {
      id: '7',
      name: '窗户',
      category: '建筑',
      previewImage: '',
      filePath: '/models/window.ifc',
      size: '0.6 MB',
      lastModified: '2023-05-01'
    },
    {
      id: '8',
      name: '楼梯',
      category: '建筑',
      previewImage: '',
      filePath: '/models/stairs.ifc',
      size: '1.5 MB',
      lastModified: '2023-04-28'
    }
  ]);

  /** 当前选中的分类，默认为“全部” */
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  
  /** 搜索关键词 */
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  /** 当前正在拖拽的模型 */
  const [draggingModel, setDraggingModel] = useState<BuildComponent | null>(null);

  /**
   * 获取所有分类
   * 包含“全部”选项和所有独特分类
   */
  const categories = ['全部', ...Array.from(new Set(models.map(model => model.category)))];

  /**
   * 过滤模型列表
   * 根据分类和搜索关键词过滤
   */
  const filteredModels = models.filter(model => {
    const matchesCategory = selectedCategory === '全部' || model.category === selectedCategory;
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  /**
   * 拖拽开始事件处理
   * 设置拖拽数据并创建视觉反馈
   * 
   * @param {React.DragEvent<HTMLDivElement>} e - 拖拽事件
   * @param {BuildComponent} model - 被拖拽的模型
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, model: BuildComponent) => {
    setDraggingModel(model);
    // 设置拖拽数据
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(model));
    e.dataTransfer.setData('text/plain', model.name);
    
    // 创建拖拽时的视觉反馈（带旋转和半透明效果）
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.7';
    dragImage.style.transform = 'rotate(5deg)';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 25);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  /**
   * 拖拽结束事件处理
   * 清除拖拽状态
   */
  const handleDragEnd = () => {
    setDraggingModel(null);
  };

  return (
    <div className="build-library-panel">
      {/* ==================== 搜索区域 ==================== */}
      <div className="search-container">
        <div className="search-input-wrapper">
          {/* 搜索输入框 */}
          <input
            type="text"
            placeholder="搜索构件..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {/* 搜索图标 */}
          <div className="search-icon">🔍</div>
        </div>
      </div>

      {/* ==================== 分类筛选 ==================== */}
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* ==================== 构件列表 ==================== */}
      <div className="models-list">
        {filteredModels.length === 0 ? (
          /* 空状态显示 */
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div>暂无构件</div>
          </div>
        ) : (
          /* 构件卡片列表 */
          <div className="models-grid">
            {filteredModels.map(model => (
              <div
                key={model.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, model)}
                onDragEnd={handleDragEnd}
                onClick={() => onModelSelect && onModelSelect(model)}
                className={`model-card ${draggingModel?.id === model.id ? 'dragging' : ''}`}
              >
                {/* 模型预览图 */}
                <div className="model-preview">
                  {/* 根据分类显示不同图标 */}
                  {model.category === '家具' ? '🪑' : '🏢'}
                  {/* 拖拽提示图标 */}
                  <div className="drag-hint">⋮⋮</div>
                </div>
                
                {/* 构件详细信息 */}
                <div className="model-info">
                  {/* 构件名称 */}
                  <div className="model-name">
                    {model.name}
                  </div>
                  {/* 构件分类 */}
                  <div className="model-category">
                    {model.category}
                  </div>
                  {/* 文件大小和修改日期 */}
                  <div className="model-meta">
                    <span>{model.size}</span>
                    <span className="meta-separator">·</span>
                    <span>{model.lastModified}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== 底部统计信息 ==================== */}
      <div className="footer-stats">
        <span>共 {filteredModels.length} 个构件</span>
      </div>
    </div>
  );
};

export default BuildLibraryPanel;
