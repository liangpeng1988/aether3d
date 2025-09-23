import React from "react";

interface Group4Props {
  onArrowClick?: () => void;
  onMenuClick?: () => void;
}

const Group4: React.FC<Group4Props> = ({
  onArrowClick,
  onMenuClick
}) => {
  return (
    <div className="group_4 flex-col" style={{ 
      width: '232px',
      height: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="section_2 flex-row justify-between" style={{ 
        width: '100%',
        height: '24px',
        margin: '16px 0 0 16px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
      }}>
        <span className="text_9" style={{ 
          width: '32px',
          height: '24px',
          overflowWrap: 'break-word',
          color: 'rgba(255, 255, 255, 1)',
          fontSize: '16px',
          fontFamily: 'MiSans-Semibold',
          fontWeight: 600,
          textAlign: 'left',
          whiteSpace: 'nowrap',
          lineHeight: '24px'
        }}>灯光</span>
        <img
          className="thumbnail_3"
          src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG29f392c85d12da001aadf0b3cc75a3fd.png"}
          alt="light"
          style={{ 
            width: '20px',
            height: '20px',
            marginTop: '2px'
          }}
        />
      </div>
      <div className="section_3 flex-row" style={{ 
        width: '200px',
        height: '20px',
        margin: '4px 0 16px 16px',
        display: 'flex',
        flexDirection: 'row'
      }}>
        <div className="text-wrapper_1" style={{ 
          width: '122px',
          height: '20px',
          overflowWrap: 'break-word',
          fontSize: 0,
          fontFamily: 'MiSans-Medium',
          fontWeight: 500,
          textAlign: 'left',
          whiteSpace: 'nowrap',
          lineHeight: '20px'
        }}>
          <span className="text_10" style={{ 
            width: '122px',
            height: '20px',
            overflowWrap: 'break-word',
            color: 'rgba(255, 255, 255, 1)',
            fontSize: '12px',
            fontFamily: 'MiSans-Medium',
            fontWeight: 500,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            lineHeight: '20px'
          }}>当前：0</span>
          <span className="text_11" style={{ 
            width: '122px',
            height: '20px',
            overflowWrap: 'break-word',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '12px',
            fontFamily: 'MiSans-Medium',
            fontWeight: 500,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            lineHeight: '20px'
          }}>/&nbsp;54</span>
          <span className="text_12" style={{ 
            width: '122px',
            height: '20px',
            overflowWrap: 'break-word',
            color: 'rgba(255, 255, 255, 1)',
            fontSize: '12px',
            fontFamily: 'MiSans-Medium',
            fontWeight: 500,
            textAlign: 'left',
            whiteSpace: 'nowrap',
            lineHeight: '20px'
          }}>&nbsp;个灯开启</span>
        </div>
        <img
          className="thumbnail_4"
          src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNG76aae6377e21f93c31a199c0fcf261c9.png"}
          alt="arrow"
          onClick={onArrowClick}
          style={{ 
            width: '20px',
            height: '20px',
            marginLeft: '30px',
            cursor: 'pointer'
          }}
        />
        <img
          className="thumbnail_5"
          src={"https://lanhu-oss-2537-2.lanhuapp.com/FigmaDDSSlicePNGd4ff418ff02683c2d86a7325971f3ef4.png"}
          alt="menu"
          onClick={onMenuClick}
          style={{ 
            width: '20px',
            height: '20px',
            marginLeft: '8px',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
};

export default Group4;