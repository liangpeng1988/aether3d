import React from 'react';

interface BaseInfoSectionProps {
  selectedObject: any;
  isExpanded: boolean;
  onToggle: () => void;
  onPropertyChange: (property: string, value: any) => void;
  // 添加图层列表属性
  layers: Array<{ id: string; name: string }>;
}

const BaseInfoSection: React.FC<BaseInfoSectionProps> = ({
  selectedObject,
  isExpanded,
  onToggle,
  onPropertyChange,
  layers
}) => {
  // 获取对象当前的图层ID
  const currentLayerId = selectedObject?.userData?.layerId || 'layer1';
  
  // 获取对象的边线颜色
  const edgeColor = selectedObject?.userData?.edgeColor || '#000000';
  
  // 获取对象的材质信息
  const materialType = selectedObject?.userData?.materialType || 'Standard';
  const materialColor = selectedObject?.userData?.materialColor || '#ffffff';
  const isTransparent = selectedObject?.userData?.isTransparent || false;
  const opacity = selectedObject?.userData?.opacity || 1.0;
  
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
  
  // 处理边线颜色变化
  const handleEdgeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (!selectedObject.userData) {
      selectedObject.userData = {};
    }
    selectedObject.userData.edgeColor = newColor;
    onPropertyChange('userData.edgeColor', newColor);
  };
  
  // 处理材质类型变化
  const handleMaterialTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    if (!selectedObject.userData) {
      selectedObject.userData = {};
    }
    selectedObject.userData.materialType = newType;
    onPropertyChange('userData.materialType', newType);
  };
  
  // 处理材质颜色变化
  const handleMaterialColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (!selectedObject.userData) {
      selectedObject.userData = {};
    }
    selectedObject.userData.materialColor = newColor;
    onPropertyChange('userData.materialColor', newColor);
  };
  
  // 处理半透明切换
  const handleTransparentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isTransparent = e.target.checked;
    if (!selectedObject.userData) {
      selectedObject.userData = {};
    }
    selectedObject.userData.isTransparent = isTransparent;
    onPropertyChange('userData.isTransparent', isTransparent);
  };
  
  // 处理透明度变化
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = parseFloat(e.target.value);
    if (!selectedObject.userData) {
      selectedObject.userData = {};
    }
    selectedObject.userData.opacity = opacity;
    onPropertyChange('userData.opacity', opacity);
  };

  return (
    <div className="property-section">
      <div className="section-header" onClick={onToggle}>
        <span className={`section-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
        <span className="section-title">基础信息</span>
      </div>
      {isExpanded && (
        <div className="section-content">
          {/* 图层修改 */}
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
          
          {/* 边线颜色修改 */}
          <div className="property-item">
            <label className="property-label">边线颜色</label>
            <div className="color-picker-group">
              <input
                type="color"
                value={edgeColor}
                onChange={handleEdgeColorChange}
                className="color-picker-input"
              />
              <input
                type="text"
                value={edgeColor}
                onChange={handleEdgeColorChange}
                className="color-text-input"
              />
            </div>
          </div>
          
          {/* Mesh材质修改 */}
          <div className="property-item">
            <label className="property-label">材质类型</label>
            <select
              value={materialType}
              onChange={handleMaterialTypeChange}
              className="property-select"
            >
              <option value="Standard">标准材质</option>
              <option value="Metallic">金属材质</option>
              <option value="Rough">粗糙材质</option>
              <option value="Glass">玻璃材质</option>
              <option value="Custom">自定义材质</option>
            </select>
          </div>
          <div className="property-item">
            <label className="property-label">材质颜色</label>
            <div className="color-picker-group">
              <input
                type="color"
                value={materialColor}
                onChange={handleMaterialColorChange}
                className="color-picker-input"
              />
              <input
                type="text"
                value={materialColor}
                onChange={handleMaterialColorChange}
                className="color-text-input"
              />
            </div>
          </div>
          
          {/* 半透明 */}
          <div className="property-item">
            <label className="property-label">
              <input
                type="checkbox"
                checked={isTransparent}
                onChange={handleTransparentToggle}
                className="property-checkbox"
              />
              启用半透明
            </label>
          </div>
          {isTransparent && (
            <div className="property-item">
              <label className="property-label">透明度: {opacity.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={handleOpacityChange}
                className="property-slider"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BaseInfoSection;