import React, { useState } from 'react';
import './FanControl.css';

interface FanControlProps {
  onToggle?: (enabled: boolean) => void;
  status?: 'ON' | 'OFF';
}

const FanControl: React.FC<FanControlProps> = ({ onToggle, status = 'OFF' }) => {
  const [isActive, setIsActive] = useState(status === 'ON');

  const handleToggle = () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    if (onToggle) {
      onToggle(newStatus);
    }
  };

  return (
    <div className="fan-control">
      <div className="fan-control-header">
        <span className="fan-control-title">风扇</span>
        <button 
          className={`fan-control-toggle ${isActive ? 'active' : ''}`}
          onClick={handleToggle}
        >
          {isActive ? 'ON' : 'OFF'}
        </button>
      </div>
      <div className="fan-control-content">
        <div className="fan-control-info">
          <span className="fan-control-label">状态:</span>
          <span className={`fan-control-status ${isActive ? 'status-on' : 'status-off'}`}>
            {isActive ? '运行中' : '已停止'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FanControl;