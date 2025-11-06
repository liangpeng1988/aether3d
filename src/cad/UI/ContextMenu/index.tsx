import React, { useEffect, useRef, useState } from 'react';
import './style.css';

/**
 * 右键菜单项接口
 */
export interface ContextMenuItem {
  id: string;                        // 菜单项唯一标识
  label: string;                     // 菜单项显示文本
  icon?: string;                     // 菜单项图标（可选）
  shortcut?: string;                 // 快捷键提示（可选）
  action?: () => void;               // 点击执行的动作（可选）
  disabled?: boolean;                // 是否禁用（可选）
  separator?: boolean;               // 是否为分隔线（可选）
  children?: ContextMenuItem[];      // 子菜单项（可选，用于多级菜单）
}

/**
 * 右键菜单组件属性接口
 */
export interface ContextMenuProps {
  x: number;                         // 菜单显示的X坐标
  y: number;                         // 菜单显示的Y坐标
  items: ContextMenuItem[];          // 菜单项列表
  onClose: () => void;               // 关闭菜单的回调函数
  visible: boolean;                  // 菜单是否可见
}

/**
 * 右键菜单组件
 * 
 * 功能说明：
 * 1. 支持多级子菜单展开/收起
 * 2. 支持菜单项图标和快捷键显示
 * 3. 支持菜单项禁用状态
 * 4. 支持分隔线
 * 5. 自动调整位置防止超出屏幕
 * 6. 点击外部或右键自动关闭
 * 
 * @param {ContextMenuProps} props - 组件属性
 * @returns {React.FC} 右键菜单组件
 */
const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose, visible }) => {
  /** 菜单DOM元素的引用，用于检测外部点击 */
  const menuRef = useRef<HTMLDivElement>(null);
  
  /** 子菜单展开/收起状态，key为菜单项ID，value为是否展开 */
  const [submenuState, setSubmenuState] = useState<{ [key: string]: boolean }>({});

  /**
   * 监听点击外部和右键事件
   * 当菜单可见时，点击菜单外部或右键将关闭菜单
   */
  useEffect(() => {
    if (!visible) return;

    // 点击外部关闭菜单
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // 阻止默认右键菜单
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [visible, onClose]);

  /**
   * 菜单隐藏时清空子菜单展开状态
   */
  useEffect(() => {
    if (!visible) {
      setSubmenuState({});
    }
  }, [visible]);

  // 菜单不可见时不渲染
  if (!visible) return null;

  /**
   * 处理菜单项点击事件
   * 如果有子菜单，切换展开/收起状态
   * 如果没有子菜单，执行动作并关闭菜单
   * 
   * @param {ContextMenuItem} item - 被点击的菜单项
   */
  const handleItemClick = (item: ContextMenuItem) => {
    // 禁用项和分隔线不响应点击
    if (item.disabled || item.separator) return;
    
    // 有子菜单：切换展开状态
    if (item.children && item.children.length > 0) {
      setSubmenuState(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    } else if (item.action) {
      // 无子菜单：执行动作并关闭菜单
      item.action();
      onClose();
    }
  };

  /**
   * 渲染单个菜单项（递归渲染支持多级子菜单）
   * 
   * @param {ContextMenuItem} item - 要渲染的菜单项
   * @param {number} level - 当前菜单层级（0为顶层）
   * @returns {JSX.Element} 渲染的菜单项元素
   */
  const renderMenuItem = (item: ContextMenuItem, level: number = 0) => {
    // 分隔线渲染
    if (item.separator) {
      return (
        <div key={item.id} className="menu-separator" />
      );
    }

    const hasChildren = item.children && item.children.length > 0;  // 是否有子菜单
    const isExpanded = submenuState[item.id];                        // 子菜单是否已展开

    return (
      <div key={item.id}>
        {/* 菜单项主体 */}
        <div
          onClick={() => handleItemClick(item)}
          className={`menu-item ${item.disabled ? 'disabled' : ''}`}
          style={{
            paddingLeft: `${12 + level * 16}px`  // 根据层级增加左侧内边距
          }}
        >
          {/* 左侧内容：图标 + 文本 */}
          <div className="menu-item-content">
            {item.icon && (
              <span className="menu-item-icon">{item.icon}</span>
            )}
            <span>{item.label}</span>
          </div>
          {/* 右侧内容：快捷键 + 箭头 */}
          <div className="menu-item-right">
            {item.shortcut && (
              <span className="menu-item-shortcut">{item.shortcut}</span>
            )}
            {hasChildren && (
              <span className="menu-item-arrow">{isExpanded ? '▼' : '▶'}</span>
            )}
          </div>
        </div>
        {/* 子菜单渲染（递归） */}
        {hasChildren && isExpanded && (
          <div className="submenu-container">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  /**
   * 调整菜单位置，防止超出屏幕边界
   * 如果菜单会超出右侧或底部，自动调整位置
   */
  const adjustedX = Math.min(x, window.innerWidth - 200);     // 限制最大X坐标，预留200px宽度
  const adjustedY = Math.min(y, window.innerHeight - items.length * 36);  // 根据菜单项数量计算高度

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: `${adjustedX}px`,   // 动态计算的X坐标
        top: `${adjustedY}px`     // 动态计算的Y坐标
      }}
    >
      {/* 渲染所有菜单项 */}
      {items.map(item => renderMenuItem(item))}
    </div>
  );
};

export default ContextMenu;
