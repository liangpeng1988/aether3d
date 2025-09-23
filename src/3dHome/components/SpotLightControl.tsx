import React, { useState, useEffect } from 'react';
import { SceneLightingScript } from '../../../Engine/controllers/SceneLightingScript';

interface SpotLightControlProps {
  spotLightScript1: SceneLightingScript | null;
  spotLightScript2: SceneLightingScript | null;
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
}

const SpotLightControl: React.FC<SpotLightControlProps> = ({ 
  spotLightScript1, 
  spotLightScript2, 
  isVisible, 
  onVisibilityChange 
}) => {
  const [light1Intensity, setLight1Intensity] = useState<number>(1000);
  const [light1Color, setLight1Color] = useState<string>('#ffffff');
  const [light1Position, setLight1Position] = useState({ x: 4, y: 14, z: 3 });
  const [light1Target, setLight1Target] = useState({ x: 4, y: 0, z: 3 });
  const [light1Angle, setLight1Angle] = useState<number>(Math.PI / 2);
  const [light1Distance, setLight1Distance] = useState<number>(0);
  const [isLight1Enabled, setIsLight1Enabled] = useState<boolean>(true);

  const [light2Intensity, setLight2Intensity] = useState<number>(1000);
  const [light2Color, setLight2Color] = useState<string>('#ffffff');
  const [light2Position, setLight2Position] = useState({ x: 12, y: 17, z: 3 });
  const [light2Target, setLight2Target] = useState({ x: 12, y: 0, z: 3 });
  const [light2Angle, setLight2Angle] = useState<number>(Math.PI / 8);
  const [light2Distance, setLight2Distance] = useState<number>(1500);
  const [isLight2Enabled, setIsLight2Enabled] = useState<boolean>(true);

  // 更新灯光1的强度
  const handleLight1IntensityChange = (value: number) => {
    setLight1Intensity(value);
    if (spotLightScript1) {
      const spotLight = spotLightScript1.getSpotLight();
      if (spotLight) {
        spotLight.intensity = value;
      }
    }
  };

  // 更新灯光1的颜色
  const handleLight1ColorChange = (value: string) => {
    setLight1Color(value);
    if (spotLightScript1) {
      const spotLight = spotLightScript1.getSpotLight();
      if (spotLight) {
        spotLight.color.set(value);
      }
    }
  };

  // 更新灯光1的位置
  const handleLight1PositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition = { ...light1Position, [axis]: value };
    setLight1Position(newPosition);
    if (spotLightScript1) {
      const spotLight = spotLightScript1.getSpotLight();
      if (spotLight) {
        spotLight.position[axis] = value;
      }
    }
  };

  // 更新灯光1的目标
  const handleLight1TargetChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newTarget = { ...light1Target, [axis]: value };
    setLight1Target(newTarget);
    if (spotLightScript1) {
      const spotLight = spotLightScript1.getSpotLight();
      if (spotLight && spotLight.target) {
        (spotLight.target as THREE.Object3D).position[axis] = value;
      }
    }
  };

  // 更新灯光1的角度
  const handleLight1AngleChange = (value: number) => {
    setLight1Angle(value);
    if (spotLightScript1) {
      const spotLight = spotLightScript1.getSpotLight();
      if (spotLight) {
        spotLight.angle = value;
      }
    }
  };

  // 更新灯光1的距离
  const handleLight1DistanceChange = (value: number) => {
    setLight1Distance(value);
    if (spotLightScript1) {
      const spotLight = spotLightScript1.getSpotLight();
      if (spotLight) {
        spotLight.distance = value;
      }
    }
  };

  // 切换灯光1的开关状态
  const toggleLight1 = () => {
    if (spotLightScript1) {
      const newState = !isLight1Enabled;
      setIsLight1Enabled(newState);
      spotLightScript1.setSpotLightEnabled(newState);
    }
  };

  // 更新灯光2的强度
  const handleLight2IntensityChange = (value: number) => {
    setLight2Intensity(value);
    if (spotLightScript2) {
      const spotLight = spotLightScript2.getSpotLight();
      if (spotLight) {
        spotLight.intensity = value;
      }
    }
  };

  // 更新灯光2的颜色
  const handleLight2ColorChange = (value: string) => {
    setLight2Color(value);
    if (spotLightScript2) {
      const spotLight = spotLightScript2.getSpotLight();
      if (spotLight) {
        spotLight.color.set(value);
      }
    }
  };

  // 更新灯光2的位置
  const handleLight2PositionChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newPosition = { ...light2Position, [axis]: value };
    setLight2Position(newPosition);
    if (spotLightScript2) {
      const spotLight = spotLightScript2.getSpotLight();
      if (spotLight) {
        spotLight.position[axis] = value;
      }
    }
  };

  // 更新灯光2的目标
  const handleLight2TargetChange = (axis: 'x' | 'y' | 'z', value: number) => {
    const newTarget = { ...light2Target, [axis]: value };
    setLight2Target(newTarget);
    if (spotLightScript2) {
      const spotLight = spotLightScript2.getSpotLight();
      if (spotLight && spotLight.target) {
        (spotLight.target as THREE.Object3D).position[axis] = value;
      }
    }
  };

  // 更新灯光2的角度
  const handleLight2AngleChange = (value: number) => {
    setLight2Angle(value);
    if (spotLightScript2) {
      const spotLight = spotLightScript2.getSpotLight();
      if (spotLight) {
        spotLight.angle = value;
      }
    }
  };

  // 更新灯光2的距离
  const handleLight2DistanceChange = (value: number) => {
    setLight2Distance(value);
    if (spotLightScript2) {
      const spotLight = spotLightScript2.getSpotLight();
      if (spotLight) {
        spotLight.distance = value;
      }
    }
  };

  // 切换灯光2的开关状态
  const toggleLight2 = () => {
    if (spotLightScript2) {
      const newState = !isLight2Enabled;
      setIsLight2Enabled(newState);
      spotLightScript2.setSpotLightEnabled(newState);
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => onVisibilityChange(true)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '8px 16px',
          backgroundColor: '#9C27B0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        显示聚光灯控制
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: '160px',
      right: '10px',
      zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '16px',
      borderRadius: '8px',
      color: 'white',
      minWidth: '250px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h3 style={{ margin: 0 }}>聚光灯控制</h3>
        <button
          onClick={() => onVisibilityChange(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>
      
      {/* 灯光1控制 */}
      <div style={{ 
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #444'
      }}>
        <h4 style={{ margin: '0 0 12px 0' }}>灯光 1</h4>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            光照强度: {light1Intensity.toFixed(0)}
          </label>
          <input
            type="range"
            min="0"
            max="2000"
            step="10"
            value={light1Intensity}
            onChange={(e) => handleLight1IntensityChange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            光照颜色:
          </label>
          <input
            type="color"
            value={light1Color}
            onChange={(e) => handleLight1ColorChange(e.target.value)}
            style={{ width: '100%', height: '40px' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            角度: {light1Angle.toFixed(2)} rad
          </label>
          <input
            type="range"
            min="0.1"
            max="Math.PI"
            step="0.1"
            value={light1Angle}
            onChange={(e) => handleLight1AngleChange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            距离: {light1Distance.toFixed(0)}
          </label>
          <input
            type="range"
            min="0"
            max="2000"
            step="10"
            value={light1Distance}
            onChange={(e) => handleLight1DistanceChange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            位置 X: {light1Position.x.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light1Position.x}
            onChange={(e) => handleLight1PositionChange('x', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            位置 Y: {light1Position.y.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light1Position.y}
            onChange={(e) => handleLight1PositionChange('y', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            位置 Z: {light1Position.z.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light1Position.z}
            onChange={(e) => handleLight1PositionChange('z', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            目标 X: {light1Target.x.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light1Target.x}
            onChange={(e) => handleLight1TargetChange('x', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            目标 Y: {light1Target.y.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light1Target.y}
            onChange={(e) => handleLight1TargetChange('y', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            目标 Z: {light1Target.z.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light1Target.z}
            onChange={(e) => handleLight1TargetChange('z', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={toggleLight1}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: isLight1Enabled ? '#f44336' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isLight1Enabled ? '关闭光照' : '开启光照'}
          </button>
        </div>
      </div>
      
      {/* 灯光2控制 */}
      <div style={{ 
        marginBottom: '24px'
      }}>
        <h4 style={{ margin: '0 0 12px 0' }}>灯光 2</h4>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            光照强度: {light2Intensity.toFixed(0)}
          </label>
          <input
            type="range"
            min="0"
            max="2000"
            step="10"
            value={light2Intensity}
            onChange={(e) => handleLight2IntensityChange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            光照颜色:
          </label>
          <input
            type="color"
            value={light2Color}
            onChange={(e) => handleLight2ColorChange(e.target.value)}
            style={{ width: '100%', height: '40px' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            角度: {light2Angle.toFixed(2)} rad
          </label>
          <input
            type="range"
            min="0.1"
            max="Math.PI"
            step="0.1"
            value={light2Angle}
            onChange={(e) => handleLight2AngleChange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            距离: {light2Distance.toFixed(0)}
          </label>
          <input
            type="range"
            min="0"
            max="2000"
            step="10"
            value={light2Distance}
            onChange={(e) => handleLight2DistanceChange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            位置 X: {light2Position.x.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light2Position.x}
            onChange={(e) => handleLight2PositionChange('x', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            位置 Y: {light2Position.y.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light2Position.y}
            onChange={(e) => handleLight2PositionChange('y', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            位置 Z: {light2Position.z.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light2Position.z}
            onChange={(e) => handleLight2PositionChange('z', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            目标 X: {light2Target.x.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light2Target.x}
            onChange={(e) => handleLight2TargetChange('x', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            目标 Y: {light2Target.y.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light2Target.y}
            onChange={(e) => handleLight2TargetChange('y', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px' }}>
            目标 Z: {light2Target.z.toFixed(1)}
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={light2Target.z}
            onChange={(e) => handleLight2TargetChange('z', parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
