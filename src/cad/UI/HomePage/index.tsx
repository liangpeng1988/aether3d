import React, { useState } from 'react';
import './style.css';

interface HomePageProps {
  onCreateDocument: () => void;
  onOpenDocument: (documentId: string) => void;
  recentDocuments?: Array<{
    id: string;
    name: string;
    updatedAt: Date;
    thumbnail?: string;
    type: 'local' | 'online'; // 添加文档类型
    path?: string; // 添加本地路径
  }>;
}

const HomePage: React.FC<HomePageProps> = ({ 
  onCreateDocument, 
  onOpenDocument,
  recentDocuments = []
}) => {
  // 预定义的新建文档模板
  const templates = [
    {
      id: 'blank-2d',
      name: '空白2D文档',
      icon: '📄',
      description: '创建新的2D绘图文档'
    },
    {
      id: 'blank-3d',
      name: '空白3D文档',
      icon: '📦',
      description: '创建新的3D建模文档'
    },
    {
      id: 'bim-project',
      name: 'BIM项目',
      icon: '🏗️',
      description: '创建新的BIM项目'
    },
    {
      id: 'cad-drawing',
      name: 'CAD图纸',
      icon: '📐',
      description: '创建新的CAD图纸'
    }
  ];

  // 添加视图模式状态
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        {/* 左侧：新建文档 */}
        <div className="homepage-left">
          <h2 className="homepage-section-title">新建项目</h2>
          <div className="template-grid">
            {templates.map(template => (
              <div
                key={template.id}
                onClick={onCreateDocument}
                className="template-card"
                title={template.description}
              >
                <div className="template-icon">{template.icon}</div>
                <div className="template-name">{template.name}</div>
              </div>
            ))}
          </div>
          
          <div className="homepage-actions">
            <button className="action-btn primary" onClick={onCreateDocument}>
              <span className="action-icon">✨</span>
              <span>创建新项目</span>
            </button>
            <button className="action-btn" onClick={() => console.log('从模板新建')}>
              <span className="action-icon">📋</span>
              <span>从模板创建</span>
            </button>
          </div>
        </div>
        
        {/* 右侧：最近文档 */}
        <div className="homepage-right">
          <div className="recent-header">
            <h2 className="homepage-section-title">最近使用</h2>
            <div className="view-mode-controls">
              <button 
                className={`view-mode-btn ${viewMode === 'card' ? 'active' : ''}`}
                onClick={() => setViewMode('card')}
                title="卡片视图"
              >
                🟫
              </button>
              <button 
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="列表视图"
              >
                📋
              </button>
              <button className="view-all-btn">查看全部</button>
            </div>
          </div>
          
          {recentDocuments.length > 0 ? (
            <div className={viewMode === 'card' ? 'recent-documents' : 'recent-documents-list'}>
              {recentDocuments.map((doc, index) => (
                <div
                  key={doc.id}
                  onClick={() => onOpenDocument(doc.id)}
                  className={viewMode === 'card' ? 'recent-doc-card' : 'recent-doc-item'}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {viewMode === 'card' ? (
                    // 卡片视图
                    <div className="recent-doc-card-content">
                      <div className="recent-doc-card-header">
                        <h3 className="recent-doc-card-title">{doc.name}</h3>
                        <span className={`recent-doc-card-type ${doc.type}`}>
                          {doc.type === 'local' ? '本地' : '在线'}
                        </span>
                      </div>
                      <div className="recent-doc-thumbnail">
                        {doc.thumbnail ? (
                          <img src={doc.thumbnail} alt={doc.name} />
                        ) : (
                          <div className="thumbnail-placeholder">📄</div>
                        )}
                      </div>
                      <div className="recent-doc-info">
                        <div className="recent-doc-meta">
                          <div className="recent-doc-time">
                            {formatTime(doc.updatedAt)}
                          </div>
                        </div>
                        {doc.type === 'local' && doc.path && (
                          <div className="recent-doc-path" title={doc.path}>
                            {doc.path}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // 列表视图
                    <>
                      <div className="recent-doc-item-thumbnail">
                        {doc.thumbnail ? (
                          <img src={doc.thumbnail} alt={doc.name} />
                        ) : (
                          <div className="thumbnail-placeholder">📄</div>
                        )}
                      </div>
                      <div className="recent-doc-item-info">
                        <div className="recent-doc-item-header">
                          <h3 className="recent-doc-item-name">{doc.name}</h3>
                          <span className={`recent-doc-item-type ${doc.type}`}>
                            {doc.type === 'local' ? '本地' : '在线'}
                          </span>
                        </div>
                        <div className="recent-doc-item-meta">
                          <div className="recent-doc-item-time">
                            {formatTime(doc.updatedAt)}
                          </div>
                        </div>
                        {doc.type === 'local' && doc.path && (
                          <div className="recent-doc-item-path" title={doc.path}>
                            {doc.path}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-recent">
              <div className="no-recent-icon">📂</div>
              <div className="no-recent-text">暂无最近使用的项目</div>
              <button className="no-recent-btn" onClick={onCreateDocument}>
                创建第一个项目
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 格式化时间
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN');
}

export default HomePage;