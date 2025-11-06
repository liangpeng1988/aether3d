import React from 'react';

interface ComponentRelationshipSectionProps {
  selectedObject: any;
  isExpanded: boolean;
  onToggle: () => void;
  onPropertyChange: (property: string, value: any) => void;
}

const ComponentRelationshipSection: React.FC<ComponentRelationshipSectionProps> = ({
  selectedObject,
  isExpanded,
  onToggle,
  onPropertyChange
}) => {
  return (
    <div className="property-section">
      <div className="section-header" onClick={onToggle}>
        <span className={`section-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
        <span className="section-title">构件关系信息</span>
      </div>
      {isExpanded && (
        <div className="section-content">
          {/* 空间关系 */}
          <div className="property-subsection">
            <div className="subsection-title">1. 空间关系</div>
            <div className="property-item">
              <label className="property-label">所在楼层</label>
              <input
                type="text"
                value={selectedObject.userData?.floor || ''}
                onChange={(e) => onPropertyChange('userData.floor', e.target.value)}
                className="property-text-input"
              />
            </div>
            <div className="property-item">
              <label className="property-label">所在房间</label>
              <input
                type="text"
                value={selectedObject.userData?.room || ''}
                onChange={(e) => onPropertyChange('userData.room', e.target.value)}
                className="property-text-input"
              />
            </div>
            <div className="property-item">
              <label className="property-label">相邻构件</label>
              <input
                type="text"
                value={selectedObject.userData?.neighbors || ''}
                onChange={(e) => onPropertyChange('userData.neighbors', e.target.value)}
                className="property-text-input"
                placeholder="以逗号分隔"
              />
            </div>
          </div>
          
          {/* 系统关系 */}
          <div className="property-subsection">
            <div className="subsection-title">2. 系统关系</div>
            <div className="property-item">
              <label className="property-label">所属系统</label>
              <input
                type="text"
                value={selectedObject.userData?.system || ''}
                onChange={(e) => onPropertyChange('userData.system', e.target.value)}
                className="property-text-input"
              />
            </div>
            <div className="property-item">
              <label className="property-label">系统编号</label>
              <input
                type="text"
                value={selectedObject.userData?.systemNumber || ''}
                onChange={(e) => onPropertyChange('userData.systemNumber', e.target.value)}
                className="property-text-input"
              />
            </div>
          </div>
          
          {/* 过程关系 */}
          <div className="property-subsection">
            <div className="subsection-title">3. 过程关系</div>
            <div className="property-item">
              <label className="property-label">施工阶段</label>
              <input
                type="text"
                value={selectedObject.userData?.constructionPhase || ''}
                onChange={(e) => onPropertyChange('userData.constructionPhase', e.target.value)}
                className="property-text-input"
              />
            </div>
            <div className="property-item">
              <label className="property-label">安装顺序</label>
              <input
                type="number"
                value={selectedObject.userData?.installOrder || ''}
                onChange={(e) => onPropertyChange('userData.installOrder', parseInt(e.target.value))}
                className="property-number-input"
              />
            </div>
            <div className="property-item">
              <label className="property-label">前置构件</label>
              <input
                type="text"
                value={selectedObject.userData?.predecessors || ''}
                onChange={(e) => onPropertyChange('userData.predecessors', e.target.value)}
                className="property-text-input"
                placeholder="以逗号分隔"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentRelationshipSection;
