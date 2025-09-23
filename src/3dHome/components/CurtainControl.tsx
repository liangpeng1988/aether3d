import React from "react";

interface CurtainControlProps {
  onToggle?: () => void;
  status?: "ON" | "OFF";
}

const CurtainControl: React.FC<CurtainControlProps> = ({
  onToggle,
  status = "OFF"
}) => {
  return (
    <div className="group_8 flex-row" style={{ 
      backgroundImage: 'linear-gradient(135deg, rgba(37, 44, 57, 1) 0, rgba(59, 60, 67, 1) 100%)',
      borderRadius: '12px',
      width: '232px',
      height: '112px',
      border: '0.5px gradient',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-center',
      margin: '16px 0 0 24px'
    }}>
      <div className="group_17 flex-col" style={{ 
        width: '36px',
        height: '80px',
        margin: '16px 0 0 24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <span className="text_20" style={{ 
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
        }}>窗帘</span>
        <span className="text_21" style={{ 
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
          className="image_6"
          src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG6ce8162fa403906592c709e0f97383fc.png"}
          alt="curtain icon"
          style={{ 
            width: '36px',
            height: '20px',
            marginTop: '14px'
          }}
        />
      </div>
      <span 
        className="text_22" 
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
          margin: '21px 0 0 8px',
          cursor: 'pointer'
        }}
      >
        {status}
      </span>
      <div className="image-container" style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        margin: '16px 24px 0 41px'
      }}>
        <img
          className="image_7"
          src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNGc221af57ac7bb4f4c68dfe478fdda7d1.png"}
          alt="curtain"
          style={{ 
            width: '34px',
            height: '56px',
            margin: '12px 0 0 6px'
          }}
        />
        <img
          className="image_8"
          src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG047b070b351c7c552aa41a527129c68c.png"}
          alt="divider"
          style={{ 
            width: '34px',
            height: '56px',
            margin: '12px 0 0 6px'
          }}
        />
      </div>
    </div>
  );
};

export default CurtainControl;