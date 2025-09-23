import React, { useState } from "react";

interface OverviewPanelProps {
  onOverviewClick?: () => void;
  onControlPanelClick?: () => void;
}

const OverviewPanel: React.FC<OverviewPanelProps> = ({
  onOverviewClick,
  onControlPanelClick
}) => {
  // 添加状态来控制哪个按钮被选中
  const [activeButton, setActiveButton] = useState<'overview' | 'control'>('overview');

  // 全屋总览点击处理函数
  const handleOverviewClick = () => {
    setActiveButton('overview');
    if (onOverviewClick) {
      onOverviewClick();
    }
  };

  // 控制面板点击处理函数
  const handleControlPanelClick = () => {
    setActiveButton('control');
    if (onControlPanelClick) {
      onControlPanelClick();
    }
  };

  return (
    <div className="group_9 flex-row justify-between" style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '22px',
      width: '232px',
      height: '44px',
      margin: '28px 0 24px 24px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    }}>
      {/* 全屋总览按钮 */}
      <div 
        className="box_13 flex-row" 
        onClick={handleOverviewClick}
        style={{ 
          backgroundImage: activeButton === 'overview' 
            ? 'linear-gradient(135deg, rgba(254, 190, 94, 1) 0, rgba(254, 125, 27, 1) 100%)' 
            : 'rgba(255, 255, 255, 0.2)',
          borderRadius: '18px',
          width: '112px',
          height: '36px',
          margin: '4px 0 0 4px',
          display: 'flex',
          flexDirection: 'row',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
        <div className="image-text_2 flex-row justify-between" style={{ 
          width: '76px',
          height: '20px',
          margin: '8px 0 0 18px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <img
            className="thumbnail_7"
            src={
              "https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG1efab2a06bf3938426a31e7cf8d3b079.png"
            }
            alt="overview"
            style={{ 
              width: '16px',
              height: '16px',
              marginTop: '2px'
            }}
          />
          <span 
            className="text-group_1" 
            style={{ 
              width: '56px',
              height: '20px',
              overflowWrap: 'break-word',
              color: 'rgba(255, 255, 255, 1)',
              fontSize: '14px',
              fontFamily: 'MiSans-Demibold',
              fontWeight: 'normal',
              textAlign: 'left',
              whiteSpace: 'nowrap',
              lineHeight: '20px'
            }}
          >
            全屋总览
          </span>
        </div>
      </div>
      
      {/* 控制面板按钮 */}
      <div 
        className="text-wrapper_2 flex-col" 
        onClick={handleControlPanelClick}
        style={{ 
          backgroundImage: activeButton === 'control' 
            ? 'linear-gradient(135deg, rgba(254, 190, 94, 1) 0, rgba(254, 125, 27, 1) 100%)' 
            : 'rgba(255, 255, 255, 0.2)',
          borderRadius: '18px',
          height: '36px',
          width: '112px',
          margin: '4px 4px 0 0',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}>
        <span className="text_23" style={{ 
          width: '56px',
          height: '20px',
          overflowWrap: 'break-word',
          color: 'rgba(255, 255, 255, 1)',
          fontSize: '14px',
          fontFamily: 'MiSans-Demibold',
          fontWeight: 'normal',
          textAlign: 'left',
          whiteSpace: 'nowrap',
          lineHeight: '20px',
          margin: '8px 0 0 28px'
        }}>控制面板</span>
      </div>
    </div>
  );
};

export default OverviewPanel;