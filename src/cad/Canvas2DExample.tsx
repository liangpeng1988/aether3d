import React, { useRef, useEffect, useState } from 'react';
import Canvas2D from './Canvas2D';
import { CADLineDrawingScript } from '../../Engine/controllers/CAD/CADLineDrawingScript';
import { ModelEditorScript } from '../../Engine/controllers/ModelEditorScript';
import { THREE } from "../../Engine/core/global";

const Canvas2DExample: React.FC = () => {
  const canvas2DRef = useRef<any>(null);
  const cadScriptRef = useRef<CADLineDrawingScript | null>(null);
  const [drawnLines, setDrawnLines] = useState<any[]>([]);

  useEffect(() => {
    // 在Canvas2D初始化后添加CAD脚本
    if (canvas2DRef.current) {
      const renderer = canvas2DRef.current.getRenderer();
      if (renderer) {
        // 创建CAD线条绘制脚本
        const cadScript = new CADLineDrawingScript({
          lineColor: 0x00ff00,
          lineWidth: 2,
          enableSnap: true,
          snapDistance: 0.5,
          showCoordinates: true,
          materialType: 'basic'
        });
        
        // 添加脚本到渲染器
        renderer.addScript(cadScript);
        cadScriptRef.current = cadScript;
      }
    }
    
    return () => {
      // 清理脚本
      if (cadScriptRef.current) {
        cadScriptRef.current.destroy();
      }
    };
  }, []);

  const handleLineDrawn = (lineData: any) => {
    console.log('线条绘制完成:', lineData);
    setDrawnLines(prev => [...prev, lineData]);
  };

  const handleLineSelected = (line: any | null) => {
    console.log('线条选中:', line);
  };

  const handleObjectSelected = (object: any | null) => {
    console.log('对象选中:', object?.name);
  };

  const handleObjectDeselected = () => {
    console.log('对象取消选中');
  };

  const handleDimensionCreated = (dimension: any) => {
    console.log('标注创建完成:', dimension);
  };

  const handleClearAll = () => {
    if (cadScriptRef.current) {
      cadScriptRef.current.clearAllLines();
    }
    setDrawnLines([]);
  };

  const handleSetLineColor = (color: string) => {
    if (cadScriptRef.current) {
      cadScriptRef.current.setLineColor(color);
    }
  };

  const handleSetLineWidth = (width: number) => {
    if (cadScriptRef.current) {
      cadScriptRef.current.setLineWidth(width);
    }
  };

  const handleSetCadMode = () => {
    // 新的相机控制脚本默认就是CAD模式，无需额外设置
    console.log('已切换到CAD模式');
  };

  const handleSwitchToTopView = () => {
    if (canvas2DRef.current) {
      const cameraControls = canvas2DRef.current.getOrbitControls();
      if (cameraControls) {
        cameraControls.setDefaultCameraPosition(
          new THREE.Vector3(0, 10, 0),
          new THREE.Vector3(0, 0, 0)
        );
      }
    }
  };

  const handleSwitchToCADMode = () => {
    // 新的相机控制脚本默认就是CAD模式，无需额外设置
    console.log('已切换到CAD模式');
  };

  const handleCreateHorizontalDimension = () => {
    if (canvas2DRef.current) {
      canvas2DRef.current.startDimensionCreation('horizontal');
    }
  };

  const handleCreateVerticalDimension = () => {
    if (canvas2DRef.current) {
      canvas2DRef.current.startDimensionCreation('vertical');
    }
  };

  const handleCreateAlignedDimension = () => {
    if (canvas2DRef.current) {
      canvas2DRef.current.startDimensionCreation('aligned');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        backgroundColor: '#333', 
        color: 'white', 
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0 }}>CAD Canvas2D 示例</h2>
        <div>
          <button 
            onClick={handleSetCadMode}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            CAD模式
          </button>
          <button 
            onClick={handleSwitchToTopView}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            顶视图
          </button>
          <button 
            onClick={handleCreateHorizontalDimension}
            style={{
              padding: '8px 16px',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            水平标注
          </button>
          <button 
            onClick={handleCreateVerticalDimension}
            style={{
              padding: '8px 16px',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            垂直标注
          </button>
          <button 
            onClick={handleCreateAlignedDimension}
            style={{
              padding: '8px 16px',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            对齐标注
          </button>
          <button 
            onClick={handleClearAll}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            清除所有线条
          </button>
          <button 
            onClick={() => handleSetLineColor('#ff0000')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#607D8B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginRight: '10px'
            }}
          >
            红色线条
          </button>
          <button 
            onClick={() => handleSetLineWidth(5)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#607D8B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            粗线条
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas2D 
          ref={canvas2DRef}
          width="100%" 
          height="100%"
          backgroundColor="#000000"
          showGrid={true}
          showAxes={true}
          showRulers={true}
          cameraPosition={[0, 10, 0]}
          cameraTarget={[0, 0, 0]}
          onLineDrawn={handleLineDrawn}
          onLineSelected={handleLineSelected}
          onObjectSelected={handleObjectSelected}
          onObjectDeselected={handleObjectDeselected}
          onDimensionCreated={handleDimensionCreated}
        />
      </div>
    </div>
  );
};

export default Canvas2DExample;