import React, { useRef } from 'react';
import Canvas3D, { Scene3DHandle } from './Canvas3D.tsx';
import { THREE } from '../../../Engine/core/global.ts';

const ModelLoaderTest: React.FC = () => {
  const scene3DRef = useRef<Scene3DHandle>(null);

  const handleSceneReady = () => {
    console.log('场景准备就绪');
  };

  const handleModelsLoaded = () => {
    console.log('所有模型加载完成');
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas3D
        ref={scene3DRef}
        onSceneReady={handleSceneReady}
        showFPS={true}
        models={[
          {
            url: '/models/sanlou.glb',
            options: {
              position: new THREE.Vector3(0, -0.06, 0),
              scale: new THREE.Vector3(0.02, 0.02, 0.02),
              rotation: new THREE.Euler(0, 0, 0)
            }
          },
          {
            url: '/models/another-model.glb',
            options: {
              position: new THREE.Vector3(2, 0, 0),
              scale: new THREE.Vector3(0.01, 0.01, 0.01),
              rotation: new THREE.Euler(0, Math.PI/2, 0)
            }
          }
        ]}
        onModelsLoaded={handleModelsLoaded}
      />
    </div>
  );
};

export default ModelLoaderTest;
