import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { Aether3d, THREE, OrbitControlsScript } from '../../dist/engine/aether3d-engine.es.js';
// @ts-ignore
import { CustomDeviceScript } from './CustomDeviceScript.js';
import './common.css';
import './index.css';

const LibraryExample: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Aether3d | null>(null);
  const deviceRef = useRef<CustomDeviceScript | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建 canvas 元素
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    containerRef.current.appendChild(canvas);

    // 配置视口
    const config = {
      element: canvas,
      dpr: new THREE.Vector2(window.innerWidth, window.innerHeight),
      alpha: true,
      antialias: true,
      factor: window.devicePixelRatio,
      distance: 5,
      aspect: window.innerWidth / window.innerHeight,
      enablePostProcessing: false,
      enablePerformanceMonitoring: true
    };

    // 创建引擎实例
    const engine = new Aether3d(config);
    engineRef.current = engine;

    // 设置背景色
    engine.scene.background = new THREE.Color(0x222222);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x404040);
    engine.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    engine.scene.add(directionalLight);

    // 创建立方体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      shininess: 100 
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, 0);
    engine.scene.add(cube);

    // 创建球体
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff0000,
      shininess: 100 
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(2, 0, 0);
    engine.scene.add(sphere);

    // 创建平面
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x888888,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    plane.position.y = -1;
    engine.scene.add(plane);

    // 创建自定义设备实例
    const device = new CustomDeviceScript(
      "空调设备1",
      new THREE.Vector3(-2, 0, 0),
      new THREE.Euler(0, 0, 0),
      new THREE.Vector3(1, 1, 1)
    );
    deviceRef.current = device;
    
    // 将设备添加到场景中
    engine.scene.add(device.getDeviceObject());

    // 设置相机位置
    engine.camera.position.set(3, 3, 5);
    engine.camera.lookAt(0, 0, 0);

    // 创建并添加轨道控制器脚本
    const orbitControlsScript = new OrbitControlsScript({
      enableDamping: true,
      dampingFactor: 0.05,
      rotateSpeed: 0.5,
      zoomSpeed: 1.2,
      maxPolarAngle: THREE.MathUtils.degToRad(89),
      minDistance: 3,
      maxDistance: 20
    });
    engine.addScript(orbitControlsScript);

    // 添加设备作为脚本到引擎中，以便自动调用update方法
    engine.addScript(device);

    // 添加简单的旋转动画脚本
    class RotationScript {
      object: THREE.Object3D;
      speed: { x: number; y: number };

      constructor(object: THREE.Object3D, speed: { x: number; y: number }) {
        this.object = object;
        this.speed = speed;
      }

      update(deltaTime: number) {
        if (this.object) {
          this.object.rotation.x += this.speed.x * deltaTime;
          this.object.rotation.y += this.speed.y * deltaTime;
        }
      }
    }

    // 创建旋转脚本实例
    const cubeRotationScript = new RotationScript(cube, { x: 0.5, y: 0.5 });
    const sphereRotationScript = new RotationScript(sphere, { x: 1, y: 1 });

    // 在渲染循环中更新脚本
    engine.on('render:frame', (event: any) => {
      cubeRotationScript.update(event.deltaTime);
      sphereRotationScript.update(event.deltaTime);
      // 注意：现在不需要手动调用device.update，因为device已经被添加为脚本，会自动调用
    });

    // 启动引擎（必须在所有设置完成后调用）
    engine.start();

    // 窗口大小调整
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current.dispose();
      }
      if (containerRef.current && canvas.parentNode) {
        containerRef.current.removeChild(canvas);
      }
    };
  }, []);

  // 设备控制函数
  const toggleDevice = () => {
    if (deviceRef.current) {
      deviceRef.current.toggleDevice();
    }
  };

  const increaseWindSpeed = () => {
    if (deviceRef.current) {
      deviceRef.current.increaseWindSpeed(0.5);
    }
  };

  const decreaseWindSpeed = () => {
    if (deviceRef.current) {
      deviceRef.current.decreaseWindSpeed(0.5);
    }
  };

  const changeWindColor = () => {
    if (deviceRef.current) {
      deviceRef.current.changeWindColor();
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }} 
      />
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        width: '100%', 
        textAlign: 'center', 
        zIndex: 100,
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>Aether3d Engine Library Example</h1>
        <p>Using the packaged Aether3d Engine as a library in React with Custom Device</p>
      </div>
      
      {/* 设备控制面板 */}
      <div style={{ 
        position: 'absolute', 
        bottom: 20, 
        right: 20, 
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        borderRadius: 5
      }}>
        <button 
          onClick={toggleDevice}
          style={{
            margin: 5,
            padding: '8px 12px',
            background: '#444',
            color: 'white',
            border: 'none',
            borderRadius: 3,
            cursor: 'pointer'
          }}
        >
          切换设备状态
        </button>
        <button 
          onClick={increaseWindSpeed}
          style={{
            margin: 5,
            padding: '8px 12px',
            background: '#444',
            color: 'white',
            border: 'none',
            borderRadius: 3,
            cursor: 'pointer'
          }}
        >
          增加风速
        </button>
        <button 
          onClick={decreaseWindSpeed}
          style={{
            margin: 5,
            padding: '8px 12px',
            background: '#444',
            color: 'white',
            border: 'none',
            borderRadius: 3,
            cursor: 'pointer'
          }}
        >
          减少风速
        </button>
        <button 
          onClick={changeWindColor}
          style={{
            margin: 5,
            padding: '8px 12px',
            background: '#444',
            color: 'white',
            border: 'none',
            borderRadius: 3,
            cursor: 'pointer'
          }}
        >
          改变颜色
        </button>
      </div>
    </div>
  );
};

export default LibraryExample;