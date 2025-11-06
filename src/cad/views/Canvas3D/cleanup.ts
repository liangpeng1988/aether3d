import { TransformControls } from 'three/addons/controls/TransformControls.js';

/**
 * 清理函数
 */
export const cleanup = (
  statsInterval: NodeJS.Timeout | null,
  resizeTimeout: NodeJS.Timeout | null,
  handleResize: () => void,
  handleKeyDown: (event: KeyboardEvent) => void,
  resizeObserver: ResizeObserver | null,
  container: HTMLElement | null,
  handleContextMenu: (event: MouseEvent) => void,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  transformControlsRef: React.RefObject<TransformControls | null>,
  outlineEffectScriptRef: React.RefObject<any>,
  engine: any
) => {
  if (statsInterval) {
    clearInterval(statsInterval);
  }
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }
  
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyDown);
  if (resizeObserver && container) {
    resizeObserver.unobserve(container);
    resizeObserver.disconnect();
  }
  canvasRef.current?.removeEventListener('contextmenu', handleContextMenu);
  
  // 清理 TransformControls
  if (transformControlsRef.current) {
    transformControlsRef.current.dispose();
    transformControlsRef.current = null;
  }
  
  // 清理 OutlineEffectScript
  if (outlineEffectScriptRef.current) {
    outlineEffectScriptRef.current.destroy();
    outlineEffectScriptRef.current = null;
  }
  
  engine.stop();
  engine.dispose();
};