import React from 'react';
import './style.css';

interface TaskBarProps {
  documentName: string;
  currentLayerName: string;
  lineCount: number;
  isDrawingMode?: boolean; // 将isDrawingMode变为可选属性
  cameraPosition: { x: number; y: number; z: number };
}

const TaskBar: React.FC<TaskBarProps> = ({
  documentName,
  currentLayerName,
  lineCount,
  isDrawingMode = false, // 添加默认值
  cameraPosition
}) => {
  return (
    <div className="taskbar-container">
      <div className="taskbar-left">
        <span>文档: {documentName}</span>
        <span>图层: {currentLayerName}</span>
      </div>
      <div className="taskbar-right">
        <span>线条: {lineCount}</span>
        <span>模式: {isDrawingMode ? '绘制' : '选择'}</span>
        <span>
          相机: X:{cameraPosition.x.toFixed(1)}, 
          Y:{cameraPosition.y.toFixed(1)}, 
          Z:{cameraPosition.z.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

export default TaskBar;