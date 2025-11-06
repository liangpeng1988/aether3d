import React from 'react';

interface LayerSectionProps {
  selectedObject: any;
  isExpanded: boolean;
  onToggle: () => void;
  onPropertyChange: (property: string, value: any) => void;
  // 添加图层列表属性
  layers: Array<{ id: string; name: string }>;
}

const LayerSection: React.FC<LayerSectionProps> = ({
  selectedObject,
  isExpanded,
  onToggle,
  onPropertyChange,
  layers
}) => {
  // 获取对象当前的图层ID
  const currentLayerId = selectedObject?.userData?.layerId || 'layer1';
  
  // 处理图层选择变化
  const handleLayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLayerId = e.target.value;
    // 更新对象的图层ID
    if (!selectedObject.userData) {
      selectedObject.userData = {};
    }
    selectedObject.userData.layerId = newLayerId;
    onPropertyChange('userData.layerId', newLayerId);
  };

  return (
    <div className="property-section">
      <div className="section-header" onClick={onToggle}>
        <span className={`section-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
        <span className="section-title">所属图层</span>
      </div>
      {isExpanded && (
        <div className="section-content">
          <div className="property-item">
            <label className="property-label">图层</label>
            <select
              value={currentLayerId}
              onChange={handleLayerChange}
              className="property-select"
            >
              {layers.map(layer => (
                <option key={layer.id} value={layer.id}>
                  {layer.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerSection;