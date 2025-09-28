import React, { useState, useEffect, useRef } from 'react';

interface ModelEditorControlSimpleProps {
  onObjectSelected?: (object: any) => void;
  onObjectDeselected?: () => void;
}

const ModelEditorControlSimple: React.FC<ModelEditorControlSimpleProps> = ({
  onObjectSelected,
  onObjectDeselected
}) => {
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<'move' | 'rotate' | 'scale'>('move');
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [snapSize, setSnapSize] = useState<number>(1);

  // 模拟对象列表
  const objects = [
    { id: 'building1', name: '主教学楼' },
    { id: 'library', name: '图书馆' },
    { id: 'dormitory', name: '学生宿舍' },
    { id: 'cafeteria', name: '食堂' },
    { id: 'garden', name: '花园' }
  ];

  // 处理对象选择
  const handleObjectSelect = (objectId: string) => {
    setSelectedObject(objectId);
    onObjectSelected?.(objectId);
  };

  // 处理对象取消选择
  const handleObjectDeselect = () => {
    setSelectedObject(null);
    onObjectDeselected?.();
  };

  // 处理变换模式变化
  const handleTransformModeChange = (mode: 'move' | 'rotate' | 'scale') => {
    setTransformMode(mode);
  };

  // 处理复制对象
  const handleCopyObject = () => {
    if (!selectedObject) return;
    console.log(`复制对象: ${selectedObject}`);
  };

  // 处理删除对象
  const handleDeleteObject = () => {
    if (!selectedObject) return;
    console.log(`删除对象: ${selectedObject}`);
    handleObjectDeselect();
  };

  return (
    <div style={{
      position: 'absolute',
      top: '70px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      width: '250px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>模型编辑器</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          选择对象:
        </label>
        <select
          value={selectedObject || ''}
          onChange={(e) => handleObjectSelect(e.target.value)}
          style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">请选择对象</option>
          {objects.map(obj => (
            <option key={obj.id} value={obj.id}>{obj.name}</option>
          ))}
        </select>
        {selectedObject && (
          <button
            onClick={handleObjectDeselect}
            style={{
              marginTop: '5px',
              padding: '3px 8px',
              backgroundColor: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            取消选择
          </button>
        )}
      </div>
      
      {selectedObject && (
        <>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              变换模式:
            </label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={() => handleTransformModeChange('move')}
                style={{
                  flex: 1,
                  padding: '5px',
                  backgroundColor: transformMode === 'move' ? '#2196F3' : '#e0e0e0',
                  color: transformMode === 'move' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                移动
              </button>
              <button
                onClick={() => handleTransformModeChange('rotate')}
                style={{
                  flex: 1,
                  padding: '5px',
                  backgroundColor: transformMode === 'rotate' ? '#2196F3' : '#e0e0e0',
                  color: transformMode === 'rotate' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                旋转
              </button>
              <button
                onClick={() => handleTransformModeChange('scale')}
                style={{
                  flex: 1,
                  padding: '5px',
                  backgroundColor: transformMode === 'scale' ? '#2196F3' : '#e0e0e0',
                  color: transformMode === 'scale' ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                缩放
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              网格吸附:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={snapEnabled}
                onChange={(e) => setSnapEnabled(e.target.checked)}
                style={{ transform: 'scale(1.5)' }}
              />
              <span>启用</span>
            </div>
            {snapEnabled && (
              <div style={{ marginTop: '5px' }}>
                <label>吸附大小: {snapSize}</label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={snapSize}
                  onChange={(e) => setSnapSize(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCopyObject}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              复制
            </button>
            <button
              onClick={handleDeleteObject}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#F44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              删除
            </button>
          </div>
        </>
      )}
      
      {!selectedObject && (
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          请从下拉菜单中选择一个对象进行编辑
        </p>
      )}
    </div>
  );
};

export default ModelEditorControlSimple;