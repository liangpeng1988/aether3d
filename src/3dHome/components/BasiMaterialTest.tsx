import React, { useEffect, useRef, useState } from 'react';
import { Aether3d } from '../../../Engine';
import { Viewport } from '../../../Engine/interface/Viewport';
import { THREE } from '../../../Engine/core/global';
import { OrbitControlsScript } from '../../../Engine/controllers/OrbitControlsScript';

// 临时内联 handleBeforeMaterial 函数用于演示
function applyBasiMaterialEffect(material: THREE.MeshBasicMaterial, time: { value: number }) {
    material.transparent = true;
    material.depthWrite = false;
    material.side = THREE.DoubleSide;
    material.blending = THREE.AdditiveBlending;
    material.color = new THREE.Color("#444");
    material.opacity = 0.5;

    material.onBeforeCompile = function (shader) {
        shader.uniforms.time = time;
        shader.uniforms.u_speed = { value: 1 }; // 扩散速度
        shader.uniforms.u_radius = { value: 100 }; // 扩散半径
        shader.uniforms.u_width = { value: Math.PI / 2 }; // 圆环半径
        shader.uniforms.hightColor = { value: new THREE.Color("#ff0000") }; // 扩散颜色
        let fragmentShader = shader.fragmentShader + "";
        let vertexShader = shader.vertexShader + "";

        const fragment = `
            float lerp (float x,float y,float t ) {
                return ( 1.0 - t ) * x + t * y;
            }
            float distanceTo(vec2 src, vec2 dst) {
                float dx = src.x - dst.x;
                float dy = src.y - dst.y;
                float dv = dx * dx + dy * dy;
                return sqrt(dv);
            }
            float atan2(float y, float x){
                float t0, t1, t2, t3, t4;
                t3 = abs(x);
                t1 = abs(y);
                t0 = max(t3, t1);
                t1 = min(t3, t1);
                t3 = float(1) / t0;
                t3 = t1 * t3;
                t4 = t3 * t3;
                t0 = -float(0.013480470);
                t0 = t0 * t4 + float(0.057477314);
                t0 = t0 * t4 - float(0.121239071);
                t0 = t0 * t4 + float(0.195635925);
                t0 = t0 * t4 - float(0.332994597);
                t0 = t0 * t4 + float(0.999995630);
                t3 = t0 * t3;
                t3 = (abs(y) > abs(x)) ? float(1.570796327) - t3 : t3;
                t3 = (x < 0.0) ?  float(3.141592654) - t3 : t3;
                t3 = (y < 0.0) ? -t3 : t3;
                return t3;
            }

            uniform vec3 hightColor;
            uniform float u_speed;
            uniform float u_radius;
            uniform float u_width;
            uniform float time;
            varying vec3 v_position;
            void main() {`;

        const fragmentColor = `
            float u_time = u_speed * time;
            vec2 curr = vec2(v_position.x, v_position.z);
            float vLength = distanceTo(vec2(5.0, 0.0), curr);
            
            float len = mod(u_time, u_radius);

            float vOpacity = diffuseColor.a;
            vec3 vColor = outgoingLight; 

            float angle = atan2(v_position.x, v_position.z) + PI;
            float angleT = mod(angle + u_time, PI2); 
           
            float length = distanceTo(vec2(0.0, 0.0), curr);

            float d_opacity = 1.0 - angleT / PI * (PI / u_width);

            if (length > u_radius) { d_opacity = 0.0; };
            vec3 rColor = vec3(1.0, 1.0, 1.0);
            if (d_opacity > 0.0) {
                rColor = vec3(
                    lerp(vColor.r, hightColor.r, d_opacity),
                    lerp(vColor.g, hightColor.g, d_opacity),
                    lerp(vColor.b, hightColor.b, d_opacity)
                );
            }
            gl_FragColor = vec4( vColor * rColor, d_opacity);
                `;

        shader.fragmentShader = fragmentShader.replace("void main() {", fragment);
        shader.fragmentShader = shader.fragmentShader.replace("gl_FragColor = vec4( outgoingLight, diffuseColor.a );", fragmentColor);
        const vertex = `
            varying vec3 v_position;
            void main() {
                v_position = position;
            `;

        shader.vertexShader = vertexShader.replace("void main() {", vertex);
    };
}

/**
 * BasiMaterial 扩散动画测试组件
 * 演示 BasiMaterial 的扩散效果
 */
const BasiMaterialTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Aether3d | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef<{ value: number }>({ value: 0 });
  const containerRef = useRef<THREE.Group | null>(null);

  // 控制参数状态
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [geometryType, setGeometryType] = useState<'plane' | 'box' | 'sphere' | 'circle'>('plane');

  // 创建几何体的函数
  const createGeometry = (type: string): THREE.BufferGeometry => {
    switch (type) {
      case 'box':
        return new THREE.BoxGeometry(40, 40, 40);
      case 'sphere':
        return new THREE.SphereGeometry(25, 32, 16);
      case 'circle':
        return new THREE.CircleGeometry(30, 32);
      case 'plane':
      default:
        return new THREE.PlaneGeometry(60, 60);
    }
  };

  // 创建测试场景
  const createTestScene = (engine: Aether3d) => {
    // 创建容器
    const container = new THREE.Group();
    containerRef.current = container;
    engine.scene.add(container);

    // 清空之前的网格
    meshesRef.current = [];

    // 创建四个不同参数的网格
    const variants = [
      { x: -40, z: -40, color: '#ff0000', speed: 1 },
      { x: 40, z: -40, color: '#00ff00', speed: 2 },
      { x: -40, z: 40, color: '#0088ff', speed: 0.5 },
      { x: 40, z: 40, color: '#ffff00', speed: 1.5 }
    ];

    variants.forEach((variant, index) => {
      // 创建几何体
      const geometry = createGeometry(geometryType);
      
      // 创建材质
      const material = new THREE.MeshBasicMaterial();
      
      // 应用 BasiMaterial 效果
      applyBasiMaterialEffect(material, timeRef.current);
      
      // 创建网格
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(variant.x, 0, variant.z);
      mesh.userData.variant = variant;
      
      container.add(mesh);
      meshesRef.current.push(mesh);
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // 创建视口配置
    const viewportConfig: Viewport = {
      element: canvasRef.current,
      dpr: new THREE.Vector2(window.innerWidth, window.innerHeight),
      antialias: true,
      factor: 1,
      distance: 5,
      aspect: window.innerWidth / window.innerHeight,
      enablePostProcessing: false,
      enablePerformanceMonitoring: false
    };

    // 创建引擎实例
    const engine = new Aether3d(viewportConfig);
    rendererRef.current = engine;

    // 设置相机位置
    engine.camera.position.set(100, 100, 100);
    engine.camera.lookAt(0, 0, 0);

    // 添加轨道控制器
    const orbitControls = new OrbitControlsScript({
      enableDamping: true,
      dampingFactor: 0.05,
      rotateSpeed: 0.5,
      zoomSpeed: 1.2,
      maxPolarAngle: THREE.MathUtils.degToRad(89),
      minDistance: 50,
      maxDistance: 500
    });
    engine.addScript(orbitControls);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    engine.scene.add(ambientLight);

    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(100, 100, 50);
    engine.scene.add(directionalLight);

    // 创建测试场景
    createTestScene(engine);

    // 启动引擎
    engine.start();

    // 动画循环更新时间
    const updateTime = () => {
      timeRef.current.value += 0.016; // 约60FPS
      
      // 旋转容器（如果启用）
      if (isRotating && containerRef.current) {
        containerRef.current.rotation.y += 0.01;
      }
      
      requestAnimationFrame(updateTime);
    };
    updateTime();

    // 窗口大小调整
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
      engine.dispose();
      rendererRef.current = null;
    };
  }, [geometryType, isRotating]); // 几何体类型或旋转状态变化时重新初始化

  // 重置时间
  const handleResetTime = () => {
    timeRef.current.value = 0;
    console.log('时间已重置');
  };

  // 切换旋转
  const handleToggleRotation = () => {
    setIsRotating(!isRotating);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />

      {/* 几何体类型选择器 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        minWidth: '200px'
      }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          几何体类型:
        </label>
        <select 
          value={geometryType} 
          onChange={(e) => setGeometryType(e.target.value as any)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '13px'
          }}
        >
          <option value="plane" style={{ background: '#333' }}>平面</option>
          <option value="box" style={{ background: '#333' }}>立方体</option>
          <option value="sphere" style={{ background: '#333' }}>球体</option>
          <option value="circle" style={{ background: '#333' }}>圆形</option>
        </select>
        
        {/* 控制按钮 */}
        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleToggleRotation}
            style={{
              padding: '8px 12px',
              backgroundColor: isRotating ? '#4CAF50' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {isRotating ? '⏸ 停止旋转' : '▶ 开始旋转'}
          </button>
          
          <button
            onClick={handleResetTime}
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(33, 150, 243, 0.8)',
              color: 'white',
              border: '1px solid rgba(33, 150, 243, 0.5)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔄 重置时间
          </button>
        </div>
        
        <div style={{
          marginTop: '10px',
          fontSize: '11px',
          color: '#ccc',
          lineHeight: '1.4'
        }}>
          <p style={{ margin: '2px 0' }}>💡 提示：切换几何体类型会重新初始化场景</p>
        </div>
      </div>

      {/* 信息面板 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        maxWidth: '300px',
        fontSize: '13px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#4CAF50' }}>
          🌟 BasiMaterial 扩散动画测试
        </h4>
        <p style={{ margin: '5px 0', color: '#e0e0e0' }}>
          这是一个展示 BasiMaterial 扩散动画效果的测试场景。
        </p>
        <p style={{ margin: '5px 0', color: '#e0e0e0' }}>
          四个网格展示了不同的参数配置效果：
        </p>
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#ccc' }}>
          <p style={{ margin: '2px 0' }}>🔴 红色：标准速度扩散</p>
          <p style={{ margin: '2px 0' }}>🟢 绿色：快速扩散</p>
          <p style={{ margin: '2px 0' }}>🔵 蓝色：慢速扩散</p>
          <p style={{ margin: '2px 0' }}>🟡 黄色：中速扩散</p>
        </div>
        <div style={{ marginTop: '10px', color: '#ccc', fontSize: '11px' }}>
          <p style={{ margin: '2px 0' }}>🖱️ 鼠标拖拽：旋转视角</p>
          <p style={{ margin: '2px 0' }}>🖱️ 滚轮：缩放视角</p>
        </div>
      </div>
    </div>
  );
};

export default BasiMaterialTest;