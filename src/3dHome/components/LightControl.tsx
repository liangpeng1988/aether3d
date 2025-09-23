import React from "react";

interface LightControlProps {
  onToggle?: () => void;
  status?: "ON" | "OFF";
  count?: number;
  total?: number;
}

const LightControl: React.FC<LightControlProps> = ({
  onToggle,
  status = "ON",
  count = 0,
  total = 54
}) => {
  return (
    <div className="group_6 flex-row" style={{ 
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
      <div className="box_18 flex-col" style={{ 
        width: '36px',
        height: '80px',
        margin: '16px 0 0 24px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <span className="text_14" style={{ 
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
        }}>灯光</span>
        <span className="text_15" style={{ 
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
          className="image_2"
          src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG6ce8162fa403906592c709e0f97383fc.png"}
          alt="light icon"
          style={{ 
            width: '36px',
            height: '20px',
            marginTop: '14px'
          }}
        />
      </div>
      <span 
        className="text_16" 
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
      <img
        className="image_3"
        src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG242ac23827c6159d8038b7d4dbbc8937.png"}
        alt="power"
        style={{ 
          width: '80px',
          height: '80px',
          margin: '16px 24px 0 41px'
        }}
      />
    </div>
  );
};

export default LightControl;