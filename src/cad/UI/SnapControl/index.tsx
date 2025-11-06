import React, { useState, useEffect } from 'react';
import './style.css';

interface SnapControlProps {
  /** 是否启用吸附 */
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
  /** 吸附配置变化回调 */
  onSnapConfigChange?: (config: any) => void;
}

const SnapControl: React.FC<SnapControlProps> = ({
  enabled = true,
  gridDistance = 1.0,
  vertexDistance = 0.5,
  edgeDistance = 0.5,
  centerDistance = 0.5,
  enabledTypes = ['grid', 'vertex', 'center'],
  onSnapConfigChange
}) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [snapConfig, setSnapConfig] = useState({
    gridDistance,
    vertexDistance,
    edgeDistance,
    centerDistance,
    enabledTypes
  });

  // 处理启用状态变化
  const handleEnableChange = (checked: boolean) => {
    setIsEnabled(checked);
    onSnapConfigChange?.({
      ...snapConfig,
      enabled: checked
    });
  };

  // 处理网格距离变化
  const handleGridDistanceChange = (value: number) => {
    const newConfig = {
      ...snapConfig,
      gridDistance: value
    };
    setSnapConfig(newConfig);
    onSnapConfigChange?.(newConfig);
  };

  // 处理顶点距离变化
  const handleVertexDistanceChange = (value: number) => {
    const newConfig = {
      ...snapConfig,
      vertexDistance: value
    };
    setSnapConfig(newConfig);
    onSnapConfigChange?.(newConfig);
  };

  // 处理边缘距离变化
  const handleEdgeDistanceChange = (value: number) => {
    const newConfig = {
      ...snapConfig,
      edgeDistance: value
    };
    setSnapConfig(newConfig);
    onSnapConfigChange?.(newConfig);
  };

  // 处理中心距离变化
  const handleCenterDistanceChange = (value: number) => {
    const newConfig = {
      ...snapConfig,
      centerDistance: value
    };
    setSnapConfig(newConfig);
    onSnapConfigChange?.(newConfig);
  };

  // 处理吸附类型切换
  const handleTypeToggle = (type: string) => {
    const newEnabledTypes = snapConfig.enabledTypes.includes(type)
      ? snapConfig.enabledTypes.filter(t => t !== type)
      : [...snapConfig.enabledTypes, type];
      
    const newConfig = {
      ...snapConfig,
      enabledTypes: newEnabledTypes
    };
    setSnapConfig(newConfig);
    onSnapConfigChange?.(newConfig);
  };

  return (
    <div className="snap-control">
      <div className="snap-control-header">
        <h4 className="snap-control-title">吸附设置</h4>
        <label className="snap-enable-toggle">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleEnableChange(e.target.checked)}
          />
          启用吸附
        </label>
      </div>

      {isEnabled && (
        <div className="snap-control-content">
          {/* 网格吸附 */}
          <div className="snap-setting-group">
            <div className="snap-setting-header">
              <label className="snap-setting-label">
                <input
                  type="checkbox"
                  checked={snapConfig.enabledTypes.includes('grid')}
                  onChange={() => handleTypeToggle('grid')}
                />
                网格吸附
              </label>
            </div>
            {snapConfig.enabledTypes.includes('grid') && (
              <div className="snap-setting-control">
                <label>距离:</label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={snapConfig.gridDistance}
                  onChange={(e) => handleGridDistanceChange(parseFloat(e.target.value))}
                />
                <span>{snapConfig.gridDistance.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 顶点吸附 */}
          <div className="snap-setting-group">
            <div className="snap-setting-header">
              <label className="snap-setting-label">
                <input
                  type="checkbox"
                  checked={snapConfig.enabledTypes.includes('vertex')}
                  onChange={() => handleTypeToggle('vertex')}
                />
                顶点吸附
              </label>
            </div>
            {snapConfig.enabledTypes.includes('vertex') && (
              <div className="snap-setting-control">
                <label>距离:</label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={snapConfig.vertexDistance}
                  onChange={(e) => handleVertexDistanceChange(parseFloat(e.target.value))}
                />
                <span>{snapConfig.vertexDistance.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 边缘吸附 */}
          <div className="snap-setting-group">
            <div className="snap-setting-header">
              <label className="snap-setting-label">
                <input
                  type="checkbox"
                  checked={snapConfig.enabledTypes.includes('edge')}
                  onChange={() => handleTypeToggle('edge')}
                />
                边缘吸附
              </label>
            </div>
            {snapConfig.enabledTypes.includes('edge') && (
              <div className="snap-setting-control">
                <label>距离:</label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={snapConfig.edgeDistance}
                  onChange={(e) => handleEdgeDistanceChange(parseFloat(e.target.value))}
                />
                <span>{snapConfig.edgeDistance.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* 中心吸附 */}
          <div className="snap-setting-group">
            <div className="snap-setting-header">
              <label className="snap-setting-label">
                <input
                  type="checkbox"
                  checked={snapConfig.enabledTypes.includes('center')}
                  onChange={() => handleTypeToggle('center')}
                />
                中心吸附
              </label>
            </div>
            {snapConfig.enabledTypes.includes('center') && (
              <div className="snap-setting-control">
                <label>距离:</label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={snapConfig.centerDistance}
                  onChange={(e) => handleCenterDistanceChange(parseFloat(e.target.value))}
                />
                <span>{snapConfig.centerDistance.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SnapControl;