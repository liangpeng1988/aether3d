import React from "react";

interface ToggleSwitchProps {
  label: string;
  onClick?: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  onClick
}) => {
  return (
    <div className="group_15 flex-row justify-between" style={{ 
      width: '232px',
      height: '24px',
      margin: '32px 0 0 24px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    }}>
      <span className="text_13" style={{ 
        width: '64px',
        height: '24px',
        overflowWrap: 'break-word',
        color: 'rgba(255, 255, 255, 1)',
        fontSize: '16px',
        fontFamily: 'MiSans-Semibold',
        fontWeight: 600,
        textAlign: 'left',
        whiteSpace: 'nowrap',
        lineHeight: '24px'
      }}>{label}</span>
      <img
        className="thumbnail_6"
        src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG39c38a5281f8e83f681ba87f7a63a78c.png"}
        alt="switch"
        onClick={onClick}
        style={{ 
          width: '20px',
          height: '20px',
          marginTop: '2px',
          cursor: 'pointer'
        }}
      />
    </div>
  );
};

export default ToggleSwitch;