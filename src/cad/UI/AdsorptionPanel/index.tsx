import React, { useState } from 'react';
import './style.css';

interface AdsorptionPanelProps {
  /** 是否启用吸附功能 */
  enabled?: boolean;
  /** 网格吸附距离 */
  gridDistance?: number;
  /** 顶点吸附距离 */
  vertexDistance?: number;
  /** 边缘吸附距离 */
  edgeDistance?: number;
  /** 中心吸附距离 */
  centerDistance?: number;
  /** 启用的吸附类型 */
  enabledTypes?: string[];
  /** 配置变化回调 */
  onConfigChange?: (config: any) => void;
}

const AdsorptionPanel: React.FC<AdsorptionPanelProps> = ({
  enabled = true,
  gridDistance = 1.0,
  vertexDistance = 0.5,
  edgeDistance = 0.5,
  centerDistance = 0.5,
  enabledTypes = ['grid', 'vertex', 'center'],
  onConfigChange
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [config, setConfig] = useState({
    gridDistance,
    vertexDistance,
    edgeDistance,
    centerDistance,
    enabledTypes
  });

  // 处理启用状态变化
  const handleEnableChange = (checked: boolean) => {
    setIsEnabled(checked);
    const newConfig = { ...config, enabled: checked };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  // 处理网格距离变化
  const handleGridDistanceChange = (value: number) => {
    const newConfig = { ...config, gridDistance: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  // 处理顶点距离变化
  const handleVertexDistanceChange = (value: number) => {
    const newConfig = { ...config, vertexDistance: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  // 处理边缘距离变化
  const handleEdgeDistanceChange = (value: number) => {
    const newConfig = { ...config, edgeDistance: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  // 处理中心距离变化
  const handleCenterDistanceChange = (value: number) => {
    const newConfig = { ...config, centerDistance: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  // 处理吸附类型切换
  const handleTypeToggle = (type: string) => {
    const newEnabledTypes = config.enabledTypes.includes(type)
      ? config.enabledTypes.filter(t => t !== type)
      : [...config.enabledTypes, type];
      
    const newConfig = { ...config, enabledTypes: newEnabledTypes };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  return (
    <div className="adsorption-panel">
      <div className="adsorption-panel-header">
        <h3 className="adsorption-panel-title">吸附设置</h3>
        <label className="adsorption-enable-toggle">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleEnableChange(e.target.checked)}
          />
          启用
        </label>
      </div>

      {isEnabled && (
        <div className="adsorption-panel-content">
          {/* 网格吸附 */}
          <div className="adsorption-setting-group">
            <div className="adsorption-setting-header">
              <label className="adsorption-setting-label">
                <input
                  type="checkbox"
                  checked={config.enabledTypes.includes('grid')}
                  onChange={() => handleTypeToggle('grid')}
                />
                网格吸附
              </label>
            </div>
            {config.enabledTypes.includes('grid') && (
              <div className="adsorption-setting-control">
                <label>距离:</label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={config.gridDistance}
                  onChange={(e) => handleGridDistanceChange(parseFloat(e.target.value))}
                />
                <span>{config.gridDistance.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 顶点吸附 */}
          <div className="adsorption-setting-group">
            <div className="adsorption-setting-header">
              <label className="adsorption-setting-label">
                <input
                  type="checkbox"
                  checked={config.enabledTypes.includes('vertex')}
                  onChange={() => handleTypeToggle('vertex')}
                />
                顶点吸附
              </label>
            </div>
            {config.enabledTypes.includes('vertex') && (
              <div className="adsorption-setting-control">
                <label>距离:</label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={config.vertexDistance}
                  onChange={(e) => handleVertexDistanceChange(parseFloat(e.target.value))}
                />
                <span>{config.vertexDistance.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 边缘吸附 */}
          <div className="adsorption-setting-group">
            <div className="adsorption-setting-header">
              <label className="adsorption-setting-label">
                <input
                  type="checkbox"
                  checked={config.enabledTypes.includes('edge')}
                  onChange={() => handleTypeToggle('edge')}
                />
                边缘吸附
              </label>
            </div>
            {config.enabledTypes.includes('edge') && (
              <div className="adsorption-setting-control">
                <label>距离:</label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={config.edgeDistance}
                  onChange={(e) => handleEdgeDistanceChange(parseFloat(e.target.value))}
                />
                <span>{config.edgeDistance.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 中心吸附 */}
          <div className="adsorption-setting-group">
            <div className="adsorption-setting-header">
              <label className="adsorption-setting-label">
                <input
                  type="checkbox"
                  checked={config.enabledTypes.includes('center')}
                  onChange={() => handleTypeToggle('center')}
                />
                中心吸附
              </label>
            </div>
            {config.enabledTypes.includes('center') && (
              <div className="adsorption-setting-control">
                <label>距离:</label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={config.centerDistance}
                  onChange={(e) => handleCenterDistanceChange(parseFloat(e.target.value))}
                />
                <span>{config.centerDistance.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsorptionPanel;