import React, { useState, useEffect } from 'react';

interface FacePropertiesSectionProps {
  selectedObject: any;
  isExpanded: boolean;
  onToggle: () => void;
  onPropertyChange: (property: string, value: any) => void;
  canvas3DRef: React.RefObject<any>;
}

const FacePropertiesSection: React.FC<FacePropertiesSectionProps> = ({
  selectedObject,
  isExpanded,
  onToggle,
  onPropertyChange,
  canvas3DRef
}) => {
  // 面颜色状态
  const [faceColor, setFaceColor] = useState('#00ff00');
  // 面透明度状态
  const [faceOpacity, setFaceOpacity] = useState(0.3);
  
  // 当选中对象变化时，更新面属性
  useEffect(() => {
    if (canvas3DRef.current) {
      // 获取当前的面选择脚本配置
      const faceSelectionScript = canvas3DRef.current.getFaceSelectionScript();
      if (faceSelectionScript) {
        const config = faceSelectionScript.config;
        // 将数字颜色转换为十六进制字符串
        const hexColor = `#${config.faceColor.toString(16).padStart(6, '0')}`;
        setFaceColor(hexColor);
        setFaceOpacity(config.faceOpacity);
      }
    }
  }, [canvas3DRef]);

  // 处理面颜色变化
  const handleFaceColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setFaceColor(newColor);
    
    // 更新面选择脚本的配置
    if (canvas3DRef.current) {
      const faceSelectionScript = canvas3DRef.current.getFaceSelectionScript();
      if (faceSelectionScript) {
        // 将十六进制颜色转换为数字
        const colorNumber = parseInt(newColor.replace('#', ''), 16);
        faceSelectionScript.updateConfig({ faceColor: colorNumber });
        
        // 如果当前有选中的对象，重新应用高亮效果
        if (selectedObject) {
          faceSelectionScript.clearSelection();
          faceSelectionScript.setSelectedObjects([selectedObject]);
        }
      }
    }
    
    onPropertyChange('faceColor', newColor);
  };
  
  // 处理面透明度变化
  const handleFaceOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = parseFloat(e.target.value);
    setFaceOpacity(opacity);
    
    // 更新面选择脚本的配置
    if (canvas3DRef.current) {
      const faceSelectionScript = canvas3DRef.current.getFaceSelectionScript();
      if (faceSelectionScript) {
        faceSelectionScript.updateConfig({ faceOpacity: opacity });
        
        // 如果当前有选中的对象，重新应用高亮效果
        if (selectedObject) {
          faceSelectionScript.clearSelection();
          faceSelectionScript.setSelectedObjects([selectedObject]);
        }
      }
    }
    
    onPropertyChange('faceOpacity', opacity);
  };

  return (
    <div className="property-section">
      <div className="section-header" onClick={onToggle}>
        <span className={`section-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
        <span className="section-title">面片属性</span>
      </div>
      {isExpanded && (
        <div className="section-content">
          {/* 面颜色修改 */}
          <div className="property-item">
            <label className="property-label">面颜色</label>
            <div className="color-picker-group">
              <input
                type="color"
                value={faceColor}
                onChange={handleFaceColorChange}
                className="color-picker-input"
              />
              <input
                type="text"
                value={faceColor}
                onChange={handleFaceColorChange}
                className="color-text-input"
              />
            </div>
          </div>
          
          {/* 面透明度 */}
          <div className="property-item">
            <label className="property-label">面透明度: {faceOpacity.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={faceOpacity}
              onChange={handleFaceOpacityChange}
              className="property-slider"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FacePropertiesSection;