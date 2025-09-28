import React, { useEffect, useRef, useState } from 'react';
import { Aether3d } from '../../../Engine/core/Aether3d';
import { Viewport } from '../../../Engine/interface/Viewport';
import { THREE } from '../../../Engine/core/global';
import { LibreDWGTestScript } from './Script/LibreDWGTestScript';

const LibreDWGTestPage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Aether3d | null>(null);
  const [testResults, setTestResults] = useState<Map<string, any> | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(true);

  useEffect(() => {
    if (!mountRef.current || !canvasRef.current) return;

    // 创建视口配置
    const viewportConfig: Viewport = {
      element: canvasRef.current,
      dpr: new THREE.Vector2(window.innerWidth, window.innerHeight),
      antialias: true,
      factor: 1,
      distance: 5,
      alpha: false,
      aspect: window.innerWidth / window.innerHeight,
      enablePostProcessing: false,
      enableLogarithmicDepthBuffer: false,
      enablePerformanceMonitoring: false,
      backgroundColor: '#000000'
    };

    // 初始化引擎
    const engine = new Aether3d(viewportConfig);
    engineRef.current = engine;
    
    // 创建测试脚本实例
    const testScript = new LibreDWGTestScript();
    
    // 将脚本添加到引擎
    engine.addScript(testScript);
    
    // 启动引擎
    engine.start();
    
    // 获取测试结果
    const interval = setInterval(() => {
      const results = testScript.getTestResults();
      if (results.size > 0) {
        setTestResults(results);
        setIsTesting(false);
        clearInterval(interval);
      }
    }, 1000);

    // 清理函数
    return () => {
      clearInterval(interval);
      engine.stop();
      engine.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
        <h1>LibreDWG 库导入测试页面</h1>
        {isTesting ? (
          <p>正在测试库导入...</p>
        ) : testResults ? (
          <div>
            <h2>测试结果:</h2>
            <ul>
              {Array.from(testResults.entries()).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>未获得测试结果</p>
        )}
      </div>
      <div ref={mountRef} style={{ flex: 1 }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

export default LibreDWGTestPage;