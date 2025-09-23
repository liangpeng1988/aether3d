import React from "react";

interface WeatherInfoProps {
  date?: string;
  temperature?: number;
  humidity?: number;
}

const WeatherInfo: React.FC<WeatherInfoProps> = ({
  date = "2025-08-13 Web",
  temperature = 32,
  humidity = 70
}) => {
  return (
    <div className="group_14 flex-row" style={{ 
      width: '232px',
      height: '18px',
      margin: '0 0 0 24px',
      display: 'flex',
      flexDirection: 'row'
    }}>
      <span className="text_6" style={{ 
        width: '99px',
        height: '18px',
        overflowWrap: 'break-word',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '12px',
        fontFamily: 'MiSans-Demibold',
        fontWeight: 'normal',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        lineHeight: '18px'
      }}>{date}</span>
      <img
        className="thumbnail_1"
        src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNGbd7305edbcb0b7e6545ac9f5175143ea.png"}
        alt="calendar"
        style={{ 
          width: '12px',
          height: '12px',
          margin: '3px 0 0 40px'
        }}
      />
      <span className="text_7" style={{ 
        width: '28px',
        height: '18px',
        overflowWrap: 'break-word',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '12px',
        fontFamily: 'MiSans-Demibold',
        fontWeight: 'normal',
        textAlign: 'right',
        whiteSpace: 'nowrap',
        lineHeight: '18px',
        margin: '0 0 0 4px'
      }}>{temperature}℃</span>
      <img
        className="thumbnail_2"
        src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG4351b3881f05a92ec358c5d0f28bfc10.png"}
        alt="temperature"
        style={{ 
          width: '12px',
          height: '12px',
          margin: '3px 0 0 8px'
        }}
      />
      <span className="text_8" style={{ 
        width: '25px',
        height: '18px',
        overflowWrap: 'break-word',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '12px',
        fontFamily: 'MiSans-Demibold',
        fontWeight: 'normal',
        textAlign: 'right',
        whiteSpace: 'nowrap',
        lineHeight: '18px',
        margin: '0 0 0 4px'
      }}>{humidity}%</span>
    </div>
  );
};

export default WeatherInfo;