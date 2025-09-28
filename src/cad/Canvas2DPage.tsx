import React from 'react';
import Canvas2D from './Canvas2D';

const Canvas2DPage: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas2D 
        width="100%" 
        height="100%"
        backgroundColor="#f0f0f0"
        showGrid={true}
        showAxes={true}
        cameraPosition={[0, 10, 0]}
        cameraTarget={[0, 0, 0]}
        onLineDrawn={(line) => {
          console.log('线条绘制完成:', line);
        }}
        onLineSelected={(line) => {
          console.log('线条选中:', line);
        }}
        onObjectSelected={(object) => {
          console.log('对象选中:', object?.name);
        }}
        onObjectDeselected={() => {
          console.log('对象取消选中');
        }}
      />
    </div>
  );
};

export default Canvas2DPage;