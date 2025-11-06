import React, { useState } from 'react';
import './style.css';

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
  action?: () => void;
  extraAction?: { icon: string; action: () => void }; // 添加额外操作按钮的属性
  toggleAction?: { icon: string; action: () => void; state: boolean }; // 添加切换按钮的属性
}

interface HierarchicalMenuProps {
  items: MenuItem[];
  isExpanded?: boolean; // 添加是否展开的属性
}

const HierarchicalMenu: React.FC<HierarchicalMenuProps> = ({ items, isExpanded = true }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    // 根据用户偏好，当菜单项label为'-'时不渲染任何元素
    if (item.label === '-') {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpandedItem = expandedItems[item.id];

    return (
      <div key={item.id}>
        <div
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.id);
            } else if (item.action) {
              item.action();
            }
          }}
          className={`menu-item ${level === 0 ? 'top-level' : ''}`}
          style={{
            paddingLeft: `${12 + level * 20}px`
          }}
        >
          {hasChildren && (
            <span className="menu-item-arrow">
              {isExpandedItem ? '▼' : '▶'}
            </span>
          )}
          {item.icon && (
            <span className="menu-item-icon">
              {item.icon}
            </span>
          )}
          <span className="menu-item-label">{item.label}</span>
          
          {/* 添加切换按钮 */}
          {item.toggleAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                item.toggleAction!.action();
              }}
              className={`menu-toggle-button ${item.toggleAction.state ? 'active' : 'inactive'}`}
            >
              {item.toggleAction.icon}
            </button>
          )}
          
          {/* 添加额外操作按钮 */}
          {item.extraAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                item.extraAction!.action();
              }}
              className="menu-action-button"
            >
              {item.extraAction!.icon}
            </button>
          )}
        </div>
        
        {hasChildren && isExpandedItem && (
          <div className="submenu-container">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 如果侧边栏收起，只显示顶层菜单项的图标
  if (!isExpanded) {
    return (
      <div className="hierarchical-menu collapsed">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (item.action) {
                item.action();
              }
            }}
            className="collapsed-icon-item"
            title={item.label}
          >
            {item.icon}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="hierarchical-menu">
      {items.map((item, index) => (
        <div key={item.id} className="menu-item-wrapper">
          {renderMenuItem(item)}
        </div>
      ))}
    </div>
  );
};

export default HierarchicalMenu;