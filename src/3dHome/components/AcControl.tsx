import React from "react";

interface AcControlProps {
  onToggle?: () => void;
  status?: "ON" | "OFF";
}

const AcControl: React.FC<AcControlProps> = ({
  onToggle,
  status = "ON"
}) => {
  return (
    <div className="group_7 flex-row" style={{ 
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
          margin: '21px 0 0 8px',
          cursor: 'pointer'
        }}
      >
        {status}
      </span>
      <img
        className="image_5"
        src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG3c73f3d1037e06bc6078d2161bce6e64.png"}
        alt="ac"
        style={{ 
          width: '80px',
          height: '80px',
          margin: '16px 24px 0 41px'
        }}
      />
    </div>
  );
};

export default AcControl;