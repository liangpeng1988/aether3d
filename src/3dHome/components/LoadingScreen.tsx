import React from 'react';
import ProgressBar from './SimpleProgressBar';

interface LoadingScreenProps {
  progress: number;
  message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, message }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      color: 'white'
    }}>
      <h2 style={{ marginBottom: '20px' }}>正在加载模型...</h2>
      <ProgressBar progress={progress} />
      <p>{message}</p>
    </div>
  );
};

export default LoadingScreen;