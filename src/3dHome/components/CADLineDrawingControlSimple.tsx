import React, { useState, useEffect } from 'react';

interface CADLineDrawingControlSimpleProps {
  onLineColorChange?: (color: string) => void;
  onLineWidthChange?: (width: number) => void;
  onSnapEnabledChange?: (enabled: boolean) => void;
  onSnapDistanceChange?: (distance: number) => void;
}

const CADLineDrawingControlSimple: React.FC<CADLineDrawingControlSimpleProps> = ({
  onLineColorChange,
  onLineWidthChange,
  onSnapEnabledChange,
  onSnapDistanceChange
}) => {
  const [lineColor, setLineColor] = useState<string>('#00ff00');
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [snapDistance, setSnapDistance] = useState<number>(10);

  useEffect(() => {
    onLineColorChange?.(lineColor);
  }, [lineColor, onLineColorChange]);

  useEffect(() => {
    onLineWidthChange?.(lineWidth);
  }, [lineWidth, onLineWidthChange]);

  useEffect(() => {
    onSnapEnabledChange?.(snapEnabled);
  }, [snapEnabled, onSnapEnabledChange]);

  useEffect(() => {
    onSnapDistanceChange?.(snapDistance);
  }, [snapDistance, onSnapDistanceChange]);

  return (
    <div style={{
      position: 'absolute',
      top: '150px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      width: '200px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>CAD设置</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          线条颜色:
        </label>
        <input
          type="color"
          value={lineColor}
          onChange={(e) => setLineColor(e.target.value)}
          style={{ width: '100%', height: '40px', border: 'none', borderRadius: '4px' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          线条宽度: {lineWidth}px
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          启用吸附:
        </label>
        <input
          type="checkbox"
          checked={snapEnabled}
          onChange={(e) => setSnapEnabled(e.target.checked)}
          style={{ transform: 'scale(1.5)', marginLeft: '5px' }}
        />
      </div>
      
      {snapEnabled && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            吸附距离: {snapDistance}px
          </label>
          <input
            type="range"
            min="5"
            max="50"
            value={snapDistance}
            onChange={(e) => setSnapDistance(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

export default CADLineDrawingControlSimple;