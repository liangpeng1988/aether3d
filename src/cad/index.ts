// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('cad-container');
  if (container) {
    // 初始化应用
    console.log('CAD应用初始化完成');
  }
});

// 窗口大小调整事件
window.addEventListener('resize', () => {
  console.log('窗口大小调整');
});

// 导出应用实例供其他模块使用
export { Document } from './data/Document';
export { DocumentRepository } from './data/DocumentRepository';
export { DocumentManager } from './data/DocumentManager';