import React from "react";

interface NavbarProps {
  location?: string;
  time?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  location = "阳先生的家",
  time = "09:20"
}) => {
  return (
    <div className="group_12 flex-row justify-between" style={{ 
      width: '132px',
      height: '32px',
      margin: '24px 0 0 24px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    }}>
      <img
        className="label_1"
        src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG3da8f7876d372c4f7eafe87327e5c1ed.png"}
        alt="location"
        style={{ 
          width: '24px',
          height: '24px',
          marginTop: '4px'
        }}
      />
      <span className="text_4" style={{ 
        textShadow: '0px 0px 12px rgba(255, 255, 255, 0.1)',
        width: '100px',
        height: '32px',
        overflowWrap: 'break-word',
        color: 'rgba(255, 255, 255, 1)',
        fontSize: '20px',
        fontFamily: 'MiSans-Semibold',
        fontWeight: 600,
        textAlign: 'left',
        whiteSpace: 'nowrap',
        lineHeight: '32px'
      }}>{location}</span>
    </div>
  );
};

export default Navbar;