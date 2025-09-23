import React from "react";

interface DateTimeDisplayProps {
  time?: string;
  date?: string;
}

const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  time = "09:20",
  date = "2025-08-13 Web"
}) => {
  return (
    <div className="group_13 flex-row justify-between" style={{ 
      width: '232px',
      height: '40px',
      margin: '32px 0 0 24px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    }}>
      <span className="text_5" style={{ 
        width: '80px',
        height: '40px',
        overflowWrap: 'break-word',
        color: 'rgba(255, 255, 255, 1)',
        fontSize: '32px',
        fontFamily: 'DIN-Bold',
        fontWeight: 700,
        textAlign: 'left',
        whiteSpace: 'nowrap',
        lineHeight: '40px'
      }}>{time}</span>
      <img
        className="label_2"
        src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG96d5f11adfaa916ac1dba9a287079af5.png"}
        alt="clock"
        style={{ 
          width: '32px',
          height: '32px',
          marginTop: '4px'
        }}
      />
    </div>
  );
};

export default DateTimeDisplay;