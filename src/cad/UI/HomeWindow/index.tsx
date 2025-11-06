import React from 'react';
import './style.css';

interface HomeWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHome: (homeId: string, homeName: string) => void;
}

interface HomeItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const HomeWindow: React.FC<HomeWindowProps> = ({ isOpen, onClose, onSelectHome }) => {
  // 预定义的主页列表
  const homes: HomeItem[] = [
    {
      id: 'home-3d',
      name: '3D主页',
      icon: '🏠',
      description: '三维建模工作空间'
    },
    {
      id: 'home-2d',
      name: '2D主页',
      icon: '📐',
      description: '二维绘图工作空间'
    },
    {
      id: 'home-bim',
      name: 'BIM主页',
      icon: '🏗️',
      description: 'BIM建模工作空间'
    },
    {
      id: 'home-cad',
      name: 'CAD主页',
      icon: '📏',
      description: 'CAD设计工作空间'
    }
  ];

  const handleSelectHome = (home: HomeItem) => {
    onSelectHome(home.id, home.name);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="home-overlay">
      <div className="home-window">
        <div className="home-header">
          <h3 className="home-title">选择主页</h3>
          <button
            onClick={onClose}
            className="home-close-btn"
            title="关闭"
          >
            ✕
          </button>
        </div>

        <div className="home-content">
          <p className="home-subtitle">选择一个工作空间开始工作</p>
          
          <div className="home-grid">
            {homes.map(home => (
              <div
                key={home.id}
                onClick={() => handleSelectHome(home)}
                className="home-card"
              >
                <div className="home-card-icon">{home.icon}</div>
                <div className="home-card-name">{home.name}</div>
                <div className="home-card-desc">{home.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeWindow;
