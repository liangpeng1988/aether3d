/**
 * 右键菜单脚本类
 * 处理Canvas2D组件中的右键菜单功能
 * 阻止浏览器默认右键菜单显示
 */
export class ContextmenuScript {
  /**
   * 设置右键菜单事件监听器
   * @param canvas HTML画布元素
   * @returns 清理函数，用于移除事件监听器
   */
  public setup(canvas: HTMLCanvasElement) {
    // 添加右键菜单事件监听器
    canvas.addEventListener('contextmenu', this.handleContextMenu);
    
    // 返回清理函数
    return () => {
      canvas.removeEventListener('contextmenu', this.handleContextMenu);
    };
  }
  
  /**
   * 右键菜单事件处理函数
   * 阻止浏览器默认右键菜单显示
   * @param event 鼠标事件对象
   */
  private handleContextMenu = (event: MouseEvent) => {
    // 阻止默认右键菜单显示
    event.preventDefault();
  };
}