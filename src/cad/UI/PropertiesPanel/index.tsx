import React, { useState } from 'react';
import TransformSection from './TransformSection';
import BaseInfoSection from './BaseInfoSection'; // 导入基础信息组件
import ComponentAttributesSection from './ComponentAttributesSection';
import ComponentRelationshipSection from './ComponentRelationshipSection';
import FacePropertiesSection from './FacePropertiesSection'; // 导入面片属性组件
import './style.css';

interface ExpandedSections {
  transform: boolean;
  baseInfo: boolean; // 将layer改为baseInfo
  component: boolean;
  relationship: boolean;
  face: boolean; // 添加面片属性展开状态
}

interface PropertiesPanelProps {
  selectedObject: any;
  onPropertyChange: (property: string, value: any) => void;
  // 添加图层列表属性
  layers?: Array<{ id: string; name: string }>;
  // 添加canvas3D引用
  canvas3DRef?: React.RefObject<any>;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  onPropertyChange,
  layers = [],
  canvas3DRef
}) => {
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    transform: true,
    baseInfo: true, // 将layer改为baseInfo
    component: true,
    relationship: true,
    face: true // 初始化面片属性为展开状态
  });

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 如果没有选中对象，显示提示信息
  if (!selectedObject) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          未选择对象
        </div>
      </div>
    );
  }

  // 渲染属性面板内容
  return (
    <div className="properties-panel">
      <div className="properties-content">
        {/* 对象标题 */}
        <h3 className="object-title">
          {selectedObject.name || '未命名对象'}
        </h3>
        
        {/* 变换组 */}
        <TransformSection
          selectedObject={selectedObject}
          isExpanded={expandedSections.transform}
          onToggle={() => toggleSection('transform')}
          onPropertyChange={onPropertyChange}
        />
        
        {/* 基础信息 */}
        <BaseInfoSection
          selectedObject={selectedObject}
          isExpanded={expandedSections.baseInfo}
          onToggle={() => toggleSection('baseInfo')}
          onPropertyChange={onPropertyChange}
          layers={layers}
        />
        
        {/* 构件属性信息 */}
        <ComponentAttributesSection
          selectedObject={selectedObject}
          isExpanded={expandedSections.component}
          onToggle={() => toggleSection('component')}
          onPropertyChange={onPropertyChange}
        />
        
        {/* 构件关系信息 */}
        <ComponentRelationshipSection
          selectedObject={selectedObject}
          isExpanded={expandedSections.relationship}
          onToggle={() => toggleSection('relationship')}
          onPropertyChange={onPropertyChange}
        />
        
        {/* 面片属性信息 */}
        {canvas3DRef && (
          <FacePropertiesSection
            selectedObject={selectedObject}
            isExpanded={expandedSections.face}
            onToggle={() => toggleSection('face')}
            onPropertyChange={onPropertyChange}
            canvas3DRef={canvas3DRef}
          />
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;