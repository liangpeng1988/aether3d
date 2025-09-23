import React, { useState } from "react";

interface PointLightConfig {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  color: string;
  intensity: number;
  distance: number;
  decay: number;
}

interface PointLightControlProps {
  onAddLight?: (config: PointLightConfig) => void;
  onUpdateLight?: (id: string, config: Partial<PointLightConfig>) => void;
  onRemoveLight?: (id: string) => void;
  onToggleLight?: (id: string, enabled: boolean) => void;
  isVisible?: boolean; // 控制面板是否可见
  onVisibilityChange?: (visible: boolean) => void; // 面板可见性变化回调
}

const PointLightControl: React.FC<PointLightControlProps> = ({
  onAddLight,
  onUpdateLight,
  onRemoveLight,
  isVisible = true, // 默认可见
  onVisibilityChange
}) => {
  // 如果面板被设置为不可见，直接返回null
  if (!isVisible) {
    return null;
  }

  // 处理关闭按钮点击
  const handleClose = () => {
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };
    // eslint-disable-next-line react-hooks/rules-of-hooks
  const [lights, setLights] = useState<PointLightConfig[]>([
    {
      id: "light-1",
      name: "主光源",
      position: { x: 0, y: 3, z: 0 },
      color: "#ffffff",
      intensity: 1.0,
      distance: 10,
      decay: 2
    }
  ]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
  const [newLight, setNewLight] = useState<Omit<PointLightConfig, 'id'>>({
    name: "新光源",
    position: { x: 0, y: 3, z: 0 },
    color: "#ffffff",
    intensity: 1.0,
    distance: 10,
    decay: 2
  });

  const handleAddLight = (e: React.FormEvent) => {
    // 阻止表单默认提交行为，防止页面刷新
    e.preventDefault();

    const newLightWithId: PointLightConfig = {
      ...newLight,
      id: `light-${Date.now()}`
    };

    setLights([...lights, newLightWithId]);

    if (onAddLight) {
      onAddLight(newLightWithId);
    }

    // 重置新光源表单
    setNewLight({
      name: "新光源",
      position: { x: 0, y: 3, z: 0 },
      color: "#ffffff",
      intensity: 1.0,
      distance: 10,
      decay: 2
    });
  };

  const handleRemoveLight = (id: string) => {
    setLights(lights.filter(light => light.id !== id));

    if (onRemoveLight) {
      onRemoveLight(id);
    }
  };

  const handleUpdateLight = (id: string, updates: Partial<PointLightConfig>) => {
    setLights(lights.map(light =>
      light.id === id ? { ...light, ...updates } : light
    ));

    if (onUpdateLight) {
      onUpdateLight(id, updates);
    }
  };
    const handleNewLightChange = (field: keyof PointLightConfig, value: any) => {
    if (field === 'position') {
      setNewLight({
        ...newLight,
        position: { ...newLight.position, ...value }
      });
    } else {
      setNewLight({
        ...newLight,
        [field]: value
      });
    }
  };

  return (
    <div className="point-light-control floating-ui" style={{
      position: 'absolute',
      top: '20px',
      right: '24px',
      backgroundImage: 'linear-gradient(135deg, rgba(37, 44, 57, 0.9) 0, rgba(59, 60, 67, 0.9) 100%)',
      borderRadius: '16px',
      width: '280px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      zIndex: 10,
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <div className="header flex-row justify-between" style={{
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span className="title" style={{
          color: 'rgba(255, 255, 255, 1)',
          fontSize: '20px',
          fontFamily: 'MiSans-Semibold',
          fontWeight: 600
        }}>
          点光源控制
        </span>
        {/* 添加关闭按钮 */}
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* 添加新光源表单 */}
      <form onSubmit={handleAddLight} style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
        <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>添加新光源</h3>

        <div className="control-group" style={{ marginBottom: '10px' }}>
          <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
            名称:
          </label>
          <input
            type="text"
            value={newLight.name}
            onChange={(e) => handleNewLightChange('name', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(0, 0, 0, 0.3)',
              color: 'white'
            }}
          />
        </div>

        <div className="position-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', display: 'block', marginBottom: '3px' }}>
              X:
            </label>
            <input
              type="number"
              step="0.1"
              value={newLight.position.x}
              onChange={(e) => handleNewLightChange('position', { x: parseFloat(e.target.value) })}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                fontSize: '12px'
              }}
            />
          </div>
          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', display: 'block', marginBottom: '3px' }}>
              Y:
            </label>
            <input
              type="number"
              step="0.1"
              value={newLight.position.y}
              onChange={(e) => handleNewLightChange('position', { y: parseFloat(e.target.value) })}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                fontSize: '12px'
              }}
            />
          </div>
          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', display: 'block', marginBottom: '3px' }}>
              Z:
            </label>
            <input
              type="number"
              step="0.1"
              value={newLight.position.z}
              onChange={(e) => handleNewLightChange('position', { z: parseFloat(e.target.value) })}
              style={{
                width: '100%',
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                fontSize: '12px'
              }}
            />
          </div>
        </div>

        <div className="control-group" style={{ marginBottom: '10px' }}>
          <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
            颜色:
          </label>
          <input
            type="color"
            value={newLight.color}
            onChange={(e) => handleNewLightChange('color', e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          />
        </div>

        <div className="control-group" style={{ marginBottom: '10px' }}>
          <label style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
            强度: {newLight.intensity.toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={newLight.intensity}
            onChange={(e) => handleNewLightChange('intensity', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255, 255, 255, 0.2)',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        <button
          type="submit" // 设置为submit类型
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'rgba(254, 125, 27, 1)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
        >
          添加光源
        </button>
      </form>

      {/* 现有光源列表 */}
      <div className="lights-list">
        <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>光源列表</h3>

        {lights.length === 0 ? (
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>暂无光源</p>
        ) : (
          lights.map((light) => (
            <div
              key={light.id}
              className="light-item"
              style={{
                marginBottom: '15px',
                padding: '15px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="light-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>{light.name}</span>
                <button
                  onClick={() => handleRemoveLight(light.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'rgba(255, 50, 50, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  删除
                </button>
              </div>

              <div className="position-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '10px' }}>
                <div>
                  <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', display: 'block', marginBottom: '2px' }}>
                    X: {light.position.x.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.1"
                    value={light.position.x}
                    onChange={(e) => handleUpdateLight(light.id, { position: { ...light.position, x: parseFloat(e.target.value) } })}
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', display: 'block', marginBottom: '2px' }}>
                    Y: {light.position.y.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.1"
                    value={light.position.y}
                    onChange={(e) => handleUpdateLight(light.id, { position: { ...light.position, y: parseFloat(e.target.value) } })}
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px', display: 'block', marginBottom: '2px' }}>
                    Z: {light.position.z.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.1"
                    value={light.position.z}
                    onChange={(e) => handleUpdateLight(light.id, { position: { ...light.position, z: parseFloat(e.target.value) } })}
                    style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              <div className="control-group" style={{ marginBottom: '10px' }}>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', display: 'block', marginBottom: '3px' }}>
                  颜色:
                </label>
                <input
                  type="color"
                  value={light.color}
                  onChange={(e) => handleUpdateLight(light.id, { color: e.target.value })}
                  style={{
                    width: '100%',
                    height: '30px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div className="control-group" style={{ marginBottom: '10px' }}>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', display: 'block', marginBottom: '3px' }}>
                  强度: {light.intensity.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={light.intensity}
                  onChange={(e) => handleUpdateLight(light.id, { intensity: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '4px',
                    borderRadius: '2px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div className="control-group" style={{ marginBottom: '10px' }}>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', display: 'block', marginBottom: '3px' }}>
                  距离: {light.distance.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={light.distance}
                  onChange={(e) => handleUpdateLight(light.id, { distance: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '4px',
                    borderRadius: '2px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              <div className="control-group" style={{ marginBottom: '10px' }}>
                <label style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', display: 'block', marginBottom: '3px' }}>
                  衰减: {light.decay.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={light.decay}
                  onChange={(e) => handleUpdateLight(light.id, { decay: parseFloat(e.target.value) })}
                  style={{
                    width: '100%',
                    height: '4px',
                    borderRadius: '2px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PointLightControl;
