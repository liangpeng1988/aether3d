import React, { useState } from "react";

interface AcControlEnhancedProps {
  onToggle?: () => void;
  onWindToggle?: (active: boolean) => void;
  onModeToggle?: (strongMode: boolean) => void;
  onCurveToggle?: (curved: boolean) => void; // 添加弯曲效果控制
  onCurveIntensityChange?: (intensity: number) => void; // 添加弯曲强度控制
  status?: "ON" | "OFF";
  windStatus?: "ON" | "OFF";
  modeStatus?: "NORMAL" | "STRONG";
  curveStatus?: "ON" | "OFF"; // 添加弯曲状态
  curveIntensity?: number; // 添加弯曲强度
}

const AcControlEnhanced: React.FC<AcControlEnhancedProps> = ({
  onToggle,
  onWindToggle,
  onModeToggle,
  onCurveToggle,
  onCurveIntensityChange,
  status = "ON",
  windStatus = "ON",
  modeStatus = "NORMAL",
  curveStatus = "OFF",
  curveIntensity = 1.0
}) => {
  const [isWindActive, setIsWindActive] = useState(windStatus === "ON");
  const [isStrongMode, setIsStrongMode] = useState(modeStatus === "STRONG");
  const [isCurved, setIsCurved] = useState(curveStatus === "ON"); // 弯曲状态
  const [intensity, setIntensity] = useState(curveIntensity); // 弯曲强度

  const handleWindToggle = () => {
    const newActive = !isWindActive;
    setIsWindActive(newActive);
    onWindToggle?.(newActive);
  };

  const handleModeToggle = () => {
    const newMode = !isStrongMode;
    setIsStrongMode(newMode);
    onModeToggle?.(newMode);
  };

  const handleCurveToggle = () => {
    const newCurved = !isCurved;
    setIsCurved(newCurved);
    onCurveToggle?.(newCurved);
  };

  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIntensity = parseFloat(e.target.value);
    setIntensity(newIntensity);
    onCurveIntensityChange?.(newIntensity);
  };

  return (
    <div className="group_7 flex-row" style={{ 
      backgroundImage: 'linear-gradient(135deg, rgba(37, 44, 57, 1) 0, rgba(59, 60, 67, 1) 100%)',
      borderRadius: '12px',
      width: '232px',
      height: '200px', // 增加高度以容纳更多控件
      border: '0.5px gradient',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-center',
      margin: '16px 0 0 24px'
    }}>
      <div className="group_16 flex-col" style={{ 
        width: '36px',
        height: '80px',
        margin: '16px 0 0 24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <span className="text_17" style={{ 
          width: '36px',
          height: '28px',
          overflowWrap: 'break-word',
          color: 'rgba(255, 255, 255, 1)',
          fontSize: '18px',
          fontFamily: 'MiSans-Semibold',
          fontWeight: 600,
          textAlign: 'left',
          whiteSpace: 'nowrap',
          lineHeight: '28px'
        }}>空调</span>
        <span className="text_18" style={{ 
          width: '24px',
          height: '18px',
          overflowWrap: 'break-word',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '12px',
          fontFamily: 'MiSans-Demibold',
          fontWeight: 'normal',
          textAlign: 'left',
          whiteSpace: 'nowrap',
          lineHeight: '18px'
        }}>全屋</span>
        <img
          className="image_4"
          src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG6ce8162fa403906592c709e0f97383fc.png"}
          alt="ac icon"
          style={{ 
            width: '36px',
            height: '20px',
            marginTop: '14px'
          }}
        />
      </div>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        margin: '16px 0 0 8px'
      }}>
        <span 
          className="text_19" 
          onClick={onToggle}
          style={{ 
            width: '19px',
            height: '18px',
            overflowWrap: 'break-word',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px',
            fontFamily: 'MiSans-Medium',
            fontWeight: 500,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            lineHeight: '18px',
            cursor: 'pointer'
          }}
        >
          {status}
        </span>
        
        {/* 风效开关 */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          marginTop: '8px'
        }}>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px',
            marginRight: '8px'
          }}>风效</span>
          <button
            onClick={handleWindToggle}
            style={{
              width: '40px',
              height: '20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: isWindActive ? '#4CAF50' : '#757575',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'white',
              position: 'absolute',
              top: '2px',
              left: isWindActive ? '22px' : '2px',
              transition: 'left 0.2s'
            }} />
          </button>
        </div>
        
        {/* 模式切换 */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          marginTop: '8px'
        }}>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px',
            marginRight: '8px'
          }}>模式</span>
          <button
            onClick={handleModeToggle}
            style={{
              padding: '2px 8px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: isStrongMode ? '#2196F3' : '#757575',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {isStrongMode ? '强力' : '普通'}
          </button>
        </div>
        
        {/* 弯曲效果开关 */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          marginTop: '8px'
        }}>
          <span style={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px',
            marginRight: '8px'
          }}>弯曲</span>
          <button
            onClick={handleCurveToggle}
            style={{
              width: '40px',
              height: '20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: isCurved ? '#FF9800' : '#757575',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'white',
              position: 'absolute',
              top: '2px',
              left: isCurved ? '22px' : '2px',
              transition: 'left 0.2s'
            }} />
          </button>
        </div>
        
        {/* 弯曲强度调节 */}
        {isCurved && (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            marginTop: '8px'
          }}>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px',
              marginRight: '8px'
            }}>强度</span>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={intensity}
              onChange={handleIntensityChange}
              style={{
                width: '80px',
                height: '4px',
                backgroundColor: '#757575',
                borderRadius: '2px',
                outline: 'none',
                appearance: 'none'
              }}
            />
          </div>
        )}
      </div>
      <img
        className="image_5"
        src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG3c73f3d1037e06bc6078d2161bce6e64.png"}
        alt="ac"
        style={{ 
          width: '80px',
          height: '80px',
          margin: '16px 24px 0 20px'
        }}
      />
    </div>
  );
};

export default AcControlEnhanced;