import React from 'react';

interface LineData {
  id: string;
  points: { x: number; y: number; z: number }[];
  color: string;
  width: number;
  layerId?: string;
}

interface LayerLinesViewerProps {
  isOpen: boolean;
  onClose: () => void;
  layerName: string;
  lines: LineData[];
}

const LayerLinesViewer: React.FC<LayerLinesViewerProps> = ({
  isOpen,
  onClose,
  layerName,
  lines
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: '#333',
        color: 'white',
        borderRadius: '8px',
        width: '500px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 标题栏 */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #555',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: 'white' }}>{layerName} - 线条列表</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        
        {/* 内容区域 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px'
        }}>
          {lines.length > 0 ? (
            <div style={{
              backgroundColor: '#444',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              {lines.map((line, index) => (
                <div
                  key={line.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    borderBottom: index < lines.length - 1 ? '1px solid #555' : 'none',
                    backgroundColor: '#444'
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: line.color,
                      border: '1px solid #666',
                      borderRadius: '3px',
                      marginRight: '12px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div>线条 ID: {line.id}</div>
                    <div style={{ fontSize: '12px', color: '#aaa' }}>
                      点数: {line.points.length} | 颜色: {line.color} | 宽度: {line.width}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#888'
            }}>
              该图层中没有线条
            </div>
          )}
        </div>
        
        {/* 底部按钮 */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #555',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayerLinesViewer;