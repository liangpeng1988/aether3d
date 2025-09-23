import React from "react";

interface FloorPlanPanelProps {
  activeFloor?: string;
  onFloorClick?: (floor: string) => void;
}

const FloorPlanPanel: React.FC<FloorPlanPanelProps> = ({
  activeFloor = "全部",
  onFloorClick
}) => {
  const floors = [
    { id: "全部", label: "全部" },
    { id: "客厅", label: "客厅" },
    { id: "厨房", label: "厨房" },
    { id: "卫生间", label: "卫生间" },
    { id: "茶室", label: "茶室" },
    { id: "书房", label: "书房" },
    { id: "棋牌室", label: "棋牌室" },
    { id: "阳台", label: "阳台" },
    { id: "洗衣房", label: "洗衣房" },
    { id: "主卧", label: "主卧" }
  ];

  return (
          <div className="box_15 flex-row" style={{ 
        boxShadow: 'inset 0px 0px 1px 0px rgba(255, 255, 255, 0.5)',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        width: 'calc(100% - 20px)', // 减去右侧20px的预留空间
        height: '72px', // 保持固定高度
        border: '1px gradient',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        zIndex:2,
        marginRight: '20px' // 右侧预留20px空间
      }}>
        <span className="text_24" style={{ 
          textShadow: '0px 0px 12px rgba(255, 255, 255, 0.1)',
          height: '36px',
          overflowWrap: 'break-word',
          color: 'rgba(255, 255, 255, 1)',
          fontSize: '24px',
          fontFamily: 'MiSans-Semibold',
          fontWeight: 600,
          textAlign: 'left',
          whiteSpace: 'nowrap',
          lineHeight: '36px',
          margin: '0 0 0 40px'
        }}>全屋总览</span>
        <img
          className="label_3"
          src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNGfea71540295d4cdc3a2e84a1ab17831b.png"}
          alt="overview icon"
          style={{ 
            width: '24px',
            height: '24px',
            margin: '0 0 0 8px'
          }}
        />
        <div className="section_4 flex-col justify-between" style={{ 
          width: '40px',
          height: '35px',
          margin: '0 0 0 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span className="text_25" style={{ 
            textShadow: '0px 0px 12px rgba(255, 255, 255, 0.1)',
            height: '32px',
            overflowWrap: 'break-word',
            color: 'rgba(255, 255, 255, 1)',
            fontSize: '20px',
            fontFamily: 'MiSans-Semibold',
            fontWeight: 600,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            lineHeight: '32px'
          }}>全部</span>
          <img
            className="image_9"
            src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG8d69f92a3baa3ee1f610d26287a48372.png"}
            alt="all"
            style={{ 
              width: '24px',
              height: '3px',
              marginLeft: '8px'
            }}
          />
        </div>
        {floors.map((floor) => (
          <span 
            key={floor.id}
            className={activeFloor === floor.id ? "text_26 active" : "text_26"}
            onClick={() => onFloorClick && onFloorClick(floor.id)}
            style={{ 
              textShadow: '0px 0px 12px rgba(255, 255, 255, 0.1)',
              height: '28px',
              overflowWrap: 'break-word',
              color: activeFloor === floor.id ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '18px',
              fontFamily: 'MiSans-Medium',
              fontWeight: 500,
              textAlign: 'left',
              whiteSpace: 'nowrap',
              lineHeight: '28px',
              margin: '0 0 0 40px',
              cursor: 'pointer'
            }}
          >
            {floor.label}
          </span>
        ))}
      </div>
  );
};

export default FloorPlanPanel;