import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './style.css';

interface SidebarProps {
  children: React.ReactNode;
  expandedWidth?: string;
  collapsedWidth?: string;
  onToggle?: (isExpanded: boolean) => void; // 添加onToggle回调函数
}

export interface SidebarRef {
  toggleSidebar: () => void;
}

const Sidebar = forwardRef<SidebarRef, SidebarProps>(({
  children,
  expandedWidth = '250px',
  collapsedWidth = '40px',
  onToggle // 解构onToggle属性
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    // 调用回调函数通知状态变化
    if (onToggle) {
      onToggle(newExpandedState);
    }
  };

  // 暴露toggleSidebar函数给父组件
  useImperativeHandle(ref, () => ({
    toggleSidebar
  }));

  // 克隆子组件并传递isExpanded属性
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { isExpanded } as any);
    }
    return child;
  });

  // 提取子组件中的菜单项用于收起状态显示
  let menuItems: any[] = [];
  React.Children.forEach(children, child => {
    if (React.isValidElement(child) && (child as any).type?.name === 'HierarchicalMenu') {
      const items = (child as any).props?.items || [];
      menuItems = items;
    }
  });

  return (
    <>
      {/* 侧边栏 */}
      <div className="sidebar-container">
        {/* 侧边栏标题和展开/收起按钮 */}
        <div className="sidebar-header">
          {isExpanded && (
            <h3 className="sidebar-title">工具箱</h3>
          )}
          <button
            className="sidebar-toggle-button"
            onClick={toggleSidebar}
            title={isExpanded ? '收起侧边栏' : '展开侧边栏'}
          >
            {isExpanded ? '⇐' : '⇒'}
          </button>
        </div>
        
        {/* 侧边栏内容 */}
        <div className={`sidebar-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
          {isExpanded ? childrenWithProps : (
            // 收起时显示主要分类图标
            <div className="sidebar-icons-container">
              {menuItems.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    }
                  }}
                  className="sidebar-icon-item"
                  title={item.label}
                >
                  {item.icon}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default Sidebar;