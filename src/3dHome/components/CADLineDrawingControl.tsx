import React, { useEffect, useRef } from 'react';
import { CADLineDrawingScript } from '../../../Engine';

interface CADLineDrawingControlProps {
  renderer: any;
  onDrawingStart?: () => void;
  onDrawingEnd?: () => void;
  onScriptRef?: (script: CADLineDrawingScript) => void;
}

const CADLineDrawingControl: React.FC<CADLineDrawingControlProps> = ({ 
  renderer, 
  onDrawingStart, 
  onDrawingEnd,
  onScriptRef
}) => {
  const drawingScriptRef = useRef<CADLineDrawingScript | null>(null);

  useEffect(() => {
    if (!renderer) return;

    // 创建CAD线条绘制脚本
    const drawingScript = new CADLineDrawingScript({
      lineColor: 0x00ff00,
      lineWidth: 2,
      enableSnap: true,
      snapDistance: 0.5,
      showCoordinates: true,
      materialType: 'basic'
    });

    // 添加脚本到渲染器
    renderer.addScript(drawingScript);
    drawingScriptRef.current = drawingScript;
    
    // 传递脚本引用给父组件
    if (onScriptRef) {
      onScriptRef(drawingScript);
    }

    console.log('[CADLineDrawingControl] CAD线条绘制脚本已添加');

    // 清理函数
    return () => {
      if (drawingScriptRef.current) {
        // 移除脚本
        renderer.removeScript(drawingScriptRef.current);
        drawingScriptRef.current = null;
        console.log('[CADLineDrawingControl] CAD线条绘制脚本已移除');
      }
    };
  }, [renderer, onScriptRef]);

  const handleStartDrawing = () => {
    if (drawingScriptRef.current) {
      // 可以在这里添加开始绘制的逻辑
      console.log('[CADLineDrawingControl] 开始绘制');
      onDrawingStart?.();
    }
  };

  const handleClearAll = () => {
    if (drawingScriptRef.current) {
      drawingScriptRef.current.clearAllLines();
      console.log('[CADLineDrawingControl] 清除所有线条');
    }
  };

  const handleSetColor = (color: string) => {
    if (drawingScriptRef.current) {
      const colorValue = parseInt(color.replace('#', ''), 16);
      drawingScriptRef.current.setLineColor(colorValue);
      console.log(`[CADLineDrawingControl] 设置线条颜色为 ${color}`);
    }
  };

  const handleSetWidth = (width: number) => {
    if (drawingScriptRef.current) {
      drawingScriptRef.current.setLineWidth(width);
      console.log(`[CADLineDrawingControl] 设置线条宽度为 ${width}`);
    }
  };

  const handleToggleSnap = (enabled: boolean) => {
    if (drawingScriptRef.current) {
      drawingScriptRef.current.setSnapEnabled(enabled);
      console.log(`[CADLineDrawingControl] ${enabled ? '启用' : '禁用'}吸附功能`);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
      width: '250px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>CAD线条绘制工具</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={handleStartDrawing}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          开始绘制 (点击场景)
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          线条颜色:
        </label>
        <input 
          type="color" 
          defaultValue="#00ff00"
          onChange={(e) => handleSetColor(e.target.value)}
          style={{
            width: '100%',
            height: '30px',
            border: 'none',
            borderRadius: '4px'
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          线条宽度: <span id="widthValue">2</span>
        </label>
        <input 
          type="range" 
          min="1" 
          max="10" 
          defaultValue="2"
          onChange={(e) => {
            const width = parseInt(e.target.value);
            handleSetWidth(width);
            const widthValueElement = document.getElementById('widthValue');
            if (widthValueElement) {
              widthValueElement.textContent = width.toString();
            }
          }}
          style={{
            width: '100%',
            height: '20px'
          }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          <input 
            type="checkbox" 
            defaultChecked 
            onChange={(e) => handleToggleSnap(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          启用吸附
        </label>
      </div>

      <div>
        <button 
          onClick={handleClearAll}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          清除所有线条
        </button>
      </div>

      <div style={{ marginTop: '15px', fontSize: '12px', color: '#ccc' }}>
        <p style={{ margin: '5px 0' }}>操作说明:</p>
        <p style={{ margin: '5px 0' }}>- 左键点击开始绘制</p>
        <p style={{ margin: '5px 0' }}>- 移动鼠标预览线条</p>
        <p style={{ margin: '5px 0' }}>- 左键点击添加点</p>
        <p style={{ margin: '5px 0' }}>- 双击或按Enter完成</p>
        <p style={{ margin: '5px 0' }}>- ESC取消绘制</p>
        <p style={{ margin: '5px 0' }}>- Delete删除最后线条</p>
      </div>
    </div>
  );
};

export default CADLineDrawingControl;