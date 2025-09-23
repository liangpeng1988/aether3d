import React from "react";

interface WeatherWidgetProps {
  time?: string;
  date?: string;
  batteryLevel?: number;
  temperature?: number;
  humidity?: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  time = "09:20",
  date = "2025-08-13 Web",
  batteryLevel = 100,
  temperature = 32,
  humidity = 70
}) => {
  return (
    <div className="group_10 flex-row" style={{ 
      width: 'calc(100% - 48px)',
      height: '14px',
      margin: '7px 0 0 24px',
      display: 'flex',
      flexDirection: 'row'
    }}>
      <span className="text_1" style={{ 
        width: '26px',
        height: '14px',
        overflowWrap: 'break-word',
        color: 'rgba(255, 255, 255, 1)',
        fontSize: '12px',
        fontFamily: 'SF Pro-Medium',
        fontWeight: 500,
        textAlign: 'left',
        whiteSpace: 'nowrap',
        lineHeight: '12px'
      }}>9:41</span>
      <span className="text_2" style={{ 
        width: '67px',
        height: '14px',
        overflowWrap: 'break-word',
        color: 'rgba(255, 255, 255, 1)',
        fontSize: '12px',
        fontFamily: 'SF Pro-Medium',
        fontWeight: 500,
        textAlign: 'left',
        whiteSpace: 'nowrap',
        lineHeight: '12px',
        margin: '0 0 0 8px'
      }}>Mon&nbsp;Jun&nbsp;10</span>
      <div className="box_4 flex-col" style={{ 
        backgroundColor: 'rgba(255, 255, 255, 1)',
        width: '17px',
        height: '10px',
        margin: '2px 0 0 1189px',
        display: 'flex',
        flexDirection: 'column'
      }} />
      <div className="box_5 flex-col" style={{ 
        backgroundColor: 'rgba(255, 255, 255, 1)',
        width: '15px',
        height: '10px',
        margin: '2px 0 0 4px',
        display: 'flex',
        flexDirection: 'column'
      }} />
      <span className="text_3" style={{ 
        width: '33px',
        height: '14px',
        overflowWrap: 'break-word',
        color: 'rgba(255, 255, 255, 1)',
        fontSize: '12px',
        fontFamily: 'SF Pro-Medium',
        fontWeight: 500,
        textAlign: 'right',
        whiteSpace: 'nowrap',
        lineHeight: '14px',
        margin: '0 0 0 3px'
      }}>100%</span>
      <img
        className="image_1"
        src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG480d10dc6899ff1dadd00b5520a0f9da.png"}
        alt="battery"
        style={{ 
          width: '27px',
          height: '12px',
          margin: '1px 0 0 4px'
        }}
      />
    </div>
  );
};

export default WeatherWidget;