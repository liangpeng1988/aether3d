import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div style={{
      width: '80%',
      height: '20px',
      backgroundColor: '#333',
      borderRadius: '10px',
      overflow: 'hidden',
      margin: '20px auto',
      boxShadow: '0 0 5px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        backgroundColor: '#4CAF50',
        transition: 'width 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {progress > 0 ? `${Math.round(progress)}%` : ''}
      </div>
    </div>
  );
};

export default ProgressBar;