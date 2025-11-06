import React, { useRef, useEffect } from 'react';
import Canvas3D from '../cad/views/Canvas3D';
import { Canvas3DHandle } from '../cad/views/Canvas3D/types';
import './Simple3DView.css';

const Simple3DView: React.FC = () => {
  const canvas3DRef = useRef<Canvas3DHandle>(null);

  // 处理对象选中
  const handleObjectSelected = (object: any | null) => {
    console.log('选中的对象:', object?.name);
  };

  // 处理对象悬停
  const handleObjectHovered = (object: any | null) => {
    console.log('悬停的对象:', object?.name);
  };

  // 处理场景准备就绪
  const handleSceneReady = (renderer: any) => {
    console.log('场景准备就绪');
  };

  return (
    <div className="simple-3d-view">
      <h1>独立3D视图演示</h1>
      <div className="canvas-container">
        <Canvas3D
          ref={canvas3DRef}
          backgroundColor="#222222"
          showGrid={true}
          showAxes={true}
          cameraPosition={[5, 5, 5]}
          cameraTarget={[0, 0, 0]}
          showFPS={true}
          onSceneReady={handleSceneReady}
          onObjectSelected={handleObjectSelected}
          onObjectHovered={handleObjectHovered}
        />
      </div>
    </div>
  );
};

export default Simple3DView;