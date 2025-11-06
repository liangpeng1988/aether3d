import React, { useState, useEffect, useRef } from 'react';
import './style.css';
import { ExtendedMeasurementUtils } from '../../../../Engine/utils/ExtendedMeasurementUtils';
import { THREE } from '../../../../Engine/core/global';

interface MeasurementPoint {
  x: number;
  y: number;
  z: number;
}

interface MeasurementResult {
  type: 'distance' | 'angle' | 'diameter' | 'radius' | 'area';
  value: number;
  unit: string;
  points: MeasurementPoint[];
}

const MeasurementPanel: React.FC = () => {
  const [measurements, setMeasurements] = useState<MeasurementResult[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<MeasurementResult | null>(null);
  const [measurementMode, setMeasurementMode] = useState<'distance' | 'angle' | 'diameter' | 'radius' | 'area' | 'none'>('none');
  const [points, setPoints] = useState<MeasurementPoint[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // 添加测量结果
  const addMeasurement = (measurement: MeasurementResult) => {
    setMeasurements(prev => [...prev, measurement]);
  };

  // 清除所有测量结果
  const clearMeasurements = () => {
    setMeasurements([]);
    setCurrentMeasurement(null);
    setPoints([]);
  };

  // 处理点选择
  const handlePointSelect = (point: MeasurementPoint) => {
    if (measurementMode === 'none') return;

    const newPoints = [...points, point];
    setPoints(newPoints);

    // 根据测量模式计算结果
    switch (measurementMode) {
      case 'distance':
        if (newPoints.length === 2) {
          const distance = ExtendedMeasurementUtils.calculateDistance(newPoints[0], newPoints[1]);
          const result: MeasurementResult = {
            type: 'distance',
            value: distance,
            unit: 'mm',
            points: [...newPoints]
          };
          setCurrentMeasurement(result);
          addMeasurement(result);
          setPoints([]);
        }
        break;

      case 'angle':
        if (newPoints.length === 3) {
          const angle = ExtendedMeasurementUtils.calculateAngle(newPoints[0], newPoints[1], newPoints[2]);
          const angleDegrees = ExtendedMeasurementUtils.radiansToDegrees(angle);
          const result: MeasurementResult = {
            type: 'angle',
            value: angleDegrees,
            unit: '°',
            points: [...newPoints]
          };
          setCurrentMeasurement(result);
          addMeasurement(result);
          setPoints([]);
        }
        break;

      case 'diameter':
        if (newPoints.length === 2) {
          const diameter = ExtendedMeasurementUtils.calculateDiameter(newPoints[0], newPoints[1]);
          const result: MeasurementResult = {
            type: 'diameter',
            value: diameter,
            unit: 'mm',
            points: [...newPoints]
          };
          setCurrentMeasurement(result);
          addMeasurement(result);
          setPoints([]);
        }
        break;

      case 'radius':
        if (newPoints.length === 2) {
          const radius = ExtendedMeasurementUtils.calculateRadius(newPoints[0], newPoints[1]);
          const result: MeasurementResult = {
            type: 'radius',
            value: radius,
            unit: 'mm',
            points: [...newPoints]
          };
          setCurrentMeasurement(result);
          addMeasurement(result);
          setPoints([]);
        }
        break;

      case 'area':
        // 对于面积测量，我们可以添加多个点，按需计算
        break;
    }
  };

  // 处理面积计算（当用户完成点选择时）
  const handleFinishAreaMeasurement = () => {
    if (measurementMode === 'area' && points.length >= 3) {
      const area = ExtendedMeasurementUtils.calculatePolygonArea(points);
      const result: MeasurementResult = {
        type: 'area',
        value: area,
        unit: 'mm²',
        points: [...points]
      };
      setCurrentMeasurement(result);
      addMeasurement(result);
      setPoints([]);
    }
  };

  // 获取测量类型名称
  const getMeasurementTypeName = (type: string) => {
    switch (type) {
      case 'distance': return '距离';
      case 'angle': return '角度';
      case 'diameter': return '直径';
      case 'radius': return '半径';
      case 'area': return '面积';
      default: return '测量';
    }
  };

  // 格式化测量值
  const formatValue = (value: number) => {
    return value.toFixed(2);
  };

  return (
    <div className="measurement-panel" ref={panelRef}>
      <div className="measurement-header">
        <h3>测量工具</h3>
        <button 
          className="clear-button"
          onClick={clearMeasurements}
        >
          清除
        </button>
      </div>

      <div className="measurement-modes">
        <button 
          className={`mode-button ${measurementMode === 'distance' ? 'active' : ''}`}
          onClick={() => setMeasurementMode(measurementMode === 'distance' ? 'none' : 'distance')}
        >
          距离
        </button>
        <button 
          className={`mode-button ${measurementMode === 'angle' ? 'active' : ''}`}
          onClick={() => setMeasurementMode(measurementMode === 'angle' ? 'none' : 'angle')}
        >
          角度
        </button>
        <button 
          className={`mode-button ${measurementMode === 'diameter' ? 'active' : ''}`}
          onClick={() => setMeasurementMode(measurementMode === 'diameter' ? 'none' : 'diameter')}
        >
          直径
        </button>
        <button 
          className={`mode-button ${measurementMode === 'radius' ? 'active' : ''}`}
          onClick={() => setMeasurementMode(measurementMode === 'radius' ? 'none' : 'radius')}
        >
          半径
        </button>
        <button 
          className={`mode-button ${measurementMode === 'area' ? 'active' : ''}`}
          onClick={() => setMeasurementMode(measurementMode === 'area' ? 'none' : 'area')}
        >
          面积
        </button>
      </div>

      {measurementMode !== 'none' && (
        <div className="measurement-instructions">
          <p>
            {measurementMode === 'distance' && '请选择两个点测量距离'}
            {measurementMode === 'angle' && '请选择三个点测量角度（第二个点为顶点）'}
            {measurementMode === 'diameter' && '请选择圆心和圆上一点测量直径'}
            {measurementMode === 'radius' && '请选择圆心和圆上一点测量半径'}
            {measurementMode === 'area' && '请选择多个点围成区域，点击"完成"计算面积'}
          </p>
          {measurementMode === 'area' && points.length > 0 && (
            <button 
              className="finish-button"
              onClick={handleFinishAreaMeasurement}
            >
              完成
            </button>
          )}
        </div>
      )}

      {currentMeasurement && (
        <div className="current-measurement">
          <h4>当前测量结果</h4>
          <div className="measurement-result">
            <span className="measurement-type">{getMeasurementTypeName(currentMeasurement.type)}</span>
            <span className="measurement-value">{formatValue(currentMeasurement.value)} {currentMeasurement.unit}</span>
          </div>
        </div>
      )}

      {measurements.length > 0 && (
        <div className="measurement-history">
          <h4>测量历史</h4>
          <ul className="measurements-list">
            {measurements.map((measurement, index) => (
              <li key={index} className="measurement-item">
                <span className="measurement-type">{getMeasurementTypeName(measurement.type)}</span>
                <span className="measurement-value">{formatValue(measurement.value)} {measurement.unit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {points.length > 0 && (
        <div className="selected-points">
          <h4>已选点 ({points.length})</h4>
          <ul className="points-list">
            {points.map((point, index) => (
              <li key={index} className="point-item">
                ({point.x.toFixed(2)}, {point.y.toFixed(2)}, {point.z.toFixed(2)})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MeasurementPanel;