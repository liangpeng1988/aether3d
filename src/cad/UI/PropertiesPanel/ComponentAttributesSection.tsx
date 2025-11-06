import React from 'react';

interface ComponentAttributesSectionProps {
  selectedObject: any;
  isExpanded: boolean;
  onToggle: () => void;
  onPropertyChange: (property: string, value: any) => void;
}

const ComponentAttributesSection: React.FC<ComponentAttributesSectionProps> = ({
  selectedObject,
  isExpanded,
  onToggle,
  onPropertyChange
}) => {
  return (
    <div className="property-section">
      <div className="section-header" onClick={onToggle}>
        <span className={`section-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
        <span className="section-title">构件属性信息</span>
      </div>
      {isExpanded && (
        <div className="section-content">
          {/* 构件唯一编码 */}
          <div className="property-subsection">
            <div className="subsection-title">1. 构件唯一编码</div>
            <div className="property-item">
              <label className="property-label">GUID</label>
              <input
                type="text"
                value={selectedObject.userData?.guid || selectedObject.uuid || 'N/A'}
                readOnly
                className="property-text-input readonly"
              />
            </div>
          </div>
          
          {/* 分类信息 */}
          <div className="property-subsection">
            <div className="subsection-title">2. 分类信息</div>
            <div className="property-item">
              <label className="property-label">构件类型</label>
              <input
                type="text"
                value={selectedObject.userData?.category || selectedObject.type || 'Mesh'}
                onChange={(e) => onPropertyChange('userData.category', e.target.value)}
                className="property-text-input"
              />
            </div>
            <div className="property-item">
              <label className="property-label">构件分类</label>
              <input
                type="text"
                value={selectedObject.userData?.classification || '未分类'}
                onChange={(e) => onPropertyChange('userData.classification', e.target.value)}
                className="property-text-input"
              />
            </div>
          </div>
          
          {/* 几何属性 */}
          <div className="property-subsection">
            <div className="subsection-title">3. 几何属性</div>
            <div className="property-item">
              <label className="property-label">体积 (m³)</label>
              <input
                type="number"
                value={selectedObject.userData?.volume || 0}
                onChange={(e) => onPropertyChange('userData.volume', parseFloat(e.target.value))}
                className="property-number-input"
              />
            </div>
            <div className="property-item">
              <label className="property-label">面积 (m²)</label>
              <input
                type="number"
                value={selectedObject.userData?.area || 0}
                onChange={(e) => onPropertyChange('userData.area', parseFloat(e.target.value))}
                className="property-number-input"
              />
            </div>
            <div className="property-item">
              <label className="property-label">长度 (m)</label>
              <input
                type="number"
                value={selectedObject.userData?.length || 0}
                onChange={(e) => onPropertyChange('userData.length', parseFloat(e.target.value))}
                className="property-number-input"
              />
            </div>
          </div>
          
          {/* 非几何属性 */}
          <div className="property-subsection">
            <div className="subsection-title">4. 非几何属性</div>
            <div className="property-item">
              <label className="property-label">材质</label>
              <input
                type="text"
                value={selectedObject.userData?.material || '未指定'}
                onChange={(e) => onPropertyChange('userData.material', e.target.value)}
                className="property-text-input"
              />
            </div>
            <div className="property-item">
              <label className="property-label">颜色</label>
              <div className="color-picker-group">
                <input
                  type="color"
                  value={selectedObject.userData?.color || '#ffffff'}
                  onChange={(e) => onPropertyChange('userData.color', e.target.value)}
                  className="color-picker-input"
                />
                <input
                  type="text"
                  value={selectedObject.userData?.color || '#ffffff'}
                  onChange={(e) => onPropertyChange('userData.color', e.target.value)}
                  className="color-text-input"
                />
              </div>
            </div>
            <div className="property-item">
              <label className="property-label">制造商</label>
              <input
                type="text"
                value={selectedObject.userData?.manufacturer || ''}
                onChange={(e) => onPropertyChange('userData.manufacturer', e.target.value)}
                className="property-text-input"
              />
            </div>
            <div className="property-item">
              <label className="property-label">型号</label>
              <input
                type="text"
                value={selectedObject.userData?.model || ''}
                onChange={(e) => onPropertyChange('userData.model', e.target.value)}
                className="property-text-input"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentAttributesSection;
