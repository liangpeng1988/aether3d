import React from 'react';
import './style.css';

interface TitleBarProps {
  appName: string;
  is3DView: boolean;
  onViewToggle: (is3D: boolean) => void;
  documents: { id: string; name: string; updatedAt: Date }[];
  currentDocumentId: string | null;
  onLoadDocument: (documentId: string) => void;
  onDeleteDocument: (documentId: string, event: React.MouseEvent) => void;
  viewTabs: Array<{id: string, name: string}>;
  onViewTabClick: (viewId: string) => void;
  onViewTabClose: (viewId: string, event: React.MouseEvent) => void;
  onCreateDocument: () => void;
  userName?: string; // 用户名称
  userAvatar?: string; // 用户头像URL
  onShowGuide?: () => void; // 新手指导回调
  onLogoClick?: () => void; // Logo点击回调
}

const TitleBar: React.FC<TitleBarProps> = ({
  appName,
  is3DView,
  onViewToggle,
  documents,
  currentDocumentId,
  onLoadDocument,
  onDeleteDocument,
  viewTabs,
  onViewTabClick,
  onViewTabClose,
  onCreateDocument,
  userName = '用户', // 默认用户名
  userAvatar, // 用户头像
  onLogoClick // Logo点击
}) => {
  return (
    <div className="titlebar-container">
      {/* Logo */}
      <div className="titlebar-logo">
        <button
          onClick={onLogoClick}
          className="logo-btn"
          title="返回主页"
        >
          {appName}
        </button>
      </div>
      
      {/* 2D/3D切换 */}
      <div className="titlebar-view-toggle">
        <button
          onClick={() => onViewToggle(!is3DView)}
          className="view-toggle-btn"
          title={is3DView ? '切换到2D视图' : '切换到3D视图'}
        >
          {is3DView ? '3D' : '2D'}
        </button>
      </div>
      
      {/* 文档列表 */}
      <div className="titlebar-documents">
        <div className="documents-tabs">
          {documents.map(doc => (
            <div
              key={doc.id}
              onClick={() => onLoadDocument(doc.id)}
              className={`document-tab ${currentDocumentId === doc.id ? 'active' : 'inactive'}`}
            >
              <span>{doc.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDocument(doc.id, e);
                }}
                className="tab-close-btn"
              >
                🗙
              </button>
            </div>
          ))}
          {documents.length === 0 && (
            <span className="documents-empty">
              无可用文档
            </span>
          )}
        </div>
        
        {/* 新建文档按钮 */}
        <button
          onClick={onCreateDocument}
          className="new-document-btn"
          title="新建文档"
        >
          +
        </button>
      </div>
      
      {/* 主页标签页 */}
      <div className="titlebar-view-tabs">
        <div className="view-tabs-container">
          {viewTabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => onViewTabClick(tab.id)}
              className="view-tab"
            >
              <span>{tab.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewTabClose(tab.id, e);
                }}
                className="tab-close-btn"
              >
                🗙
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* 用户信息 */}
      <div className="titlebar-user-info">
        <span className="user-name">{userName}</span>
        <div className="user-avatar">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} />
          ) : (
            <span className="user-avatar-placeholder">👤</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TitleBar;