import React from 'react';

interface TransformSectionProps {
  selectedObject: any;
  isExpanded: boolean;
  onToggle: () => void;
  onPropertyChange: (property: string, value: any) => void;
}

const TransformSection: React.FC<TransformSectionProps> = ({
  selectedObject,
  isExpanded,
  onToggle,
  onPropertyChange
}) => {
  return (
    <div className="property-section">
      <div className="section-header" onClick={onToggle}>
        <span className={`section-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
        <span className="section-title">变换</span>
      </div>
      {isExpanded && (
        <div className="section-content">
          {/* 位置 */}
          <div className="property-item">
            <label className="property-label">位置</label>
            <div className="property-input-group">
              <div className="input-wrapper">
                <label>X</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedObject.position?.x?.toFixed(2) || 0}
                  onChange={(e) => onPropertyChange('position.x', parseFloat(e.target.value))}
                  className="property-number-input"
                />
              </div>
              <div className="input-wrapper">
                <label>Y</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedObject.position?.y?.toFixed(2) || 0}
                  onChange={(e) => onPropertyChange('position.y', parseFloat(e.target.value))}
                  className="property-number-input"
                />
              </div>
              <div className="input-wrapper">
                <label>Z</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedObject.position?.z?.toFixed(2) || 0}
                  onChange={(e) => onPropertyChange('position.z', parseFloat(e.target.value))}
                  className="property-number-input"
                />
              </div>
            </div>
          </div>
          
          {/* 旋转 */}
          <div className="property-item">
            <label className="property-label">旋转</label>
            <div className="property-input-group">
              <div className="input-wrapper">
                <label>X</label>
                <input
                  type="number"
                  step="1"
                  value={selectedObject.rotation?.x ? (selectedObject.rotation.x * 180 / Math.PI).toFixed(1) : 0}
                  onChange={(e) => onPropertyChange('rotation.x', parseFloat(e.target.value) * Math.PI / 180)}
                  className="property-number-input"
                />
              </div>
              <div className="input-wrapper">
                <label>Y</label>
                <input
                  type="number"
                  step="1"
                  value={selectedObject.rotation?.y ? (selectedObject.rotation.y * 180 / Math.PI).toFixed(1) : 0}
                  onChange={(e) => onPropertyChange('rotation.y', parseFloat(e.target.value) * Math.PI / 180)}
                  className="property-number-input"
                />
              </div>
              <div className="input-wrapper">
                <label>Z</label>
                <input
                  type="number"
                  step="1"
                  value={selectedObject.rotation?.z ? (selectedObject.rotation.z * 180 / Math.PI).toFixed(1) : 0}
                  onChange={(e) => onPropertyChange('rotation.z', parseFloat(e.target.value) * Math.PI / 180)}
                  className="property-number-input"
                />
              </div>
            </div>
          </div>
          
          {/* 缩放 */}
          <div className="property-item">
            <label className="property-label">缩放</label>
            <div className="property-input-group">
              <div className="input-wrapper">
                <label>X</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedObject.scale?.x?.toFixed(2) || 1}
                  onChange={(e) => onPropertyChange('scale.x', parseFloat(e.target.value))}
                  className="property-number-input"
                />
              </div>
              <div className="input-wrapper">
                <label>Y</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedObject.scale?.y?.toFixed(2) || 1}
                  onChange={(e) => onPropertyChange('scale.y', parseFloat(e.target.value))}
                  className="property-number-input"
                />
              </div>
              <div className="input-wrapper">
                <label>Z</label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedObject.scale?.z?.toFixed(2) || 1}
                  onChange={(e) => onPropertyChange('scale.z', parseFloat(e.target.value))}
                  className="property-number-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransformSection;
