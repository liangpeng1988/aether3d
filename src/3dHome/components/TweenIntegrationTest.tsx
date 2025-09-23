import React, { useEffect, useRef } from 'react';
import { Tween, THREE } from '../../Engine/core/global';

const TweenIntegrationTest: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cubeRef = useRef<THREE.Mesh | null>(null);
    const animationIdRef = useRef<number>(0);

    useEffect(() => {
        if (!canvasRef.current) return;

        // 创建场景
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // 创建相机
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        cameraRef.current = camera;

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        renderer.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current = renderer;

        // 创建立方体
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        cubeRef.current = cube;

        // 创建Tween动画
        const startPosition = { x: 0, y: 0, scale: 1 };
        const endPosition = { x: 2, y: 1, scale: 2 };

        // 创建位置动画
        const positionTween = new Tween(startPosition)
            .to(endPosition, 2000)
            .easing(Tween.Easing.Quadratic.InOut)
            .onUpdate(() => {
                if (cubeRef.current) {
                    cubeRef.current.position.x = startPosition.x;
                    cubeRef.current.position.y = startPosition.y;
                    cubeRef.current.scale.set(startPosition.scale, startPosition.scale, startPosition.scale);
                }
            })
            .onComplete(() => {
                console.log('位置动画完成');
            });

        // 创建颜色动画
        const startColor = { r: 0, g: 1, b: 0 };
        const endColor = { r: 1, g: 0, b: 0 };

        const colorTween = new Tween(startColor)
            .to(endColor, 2000)
            .easing(Tween.Easing.Quadratic.InOut)
            .onUpdate(() => {
                if (cubeRef.current && cubeRef.current.material instanceof THREE.MeshBasicMaterial) {
                    cubeRef.current.material.color.setRGB(startColor.r, startColor.g, startColor.b);
                }
            })
            .onComplete(() => {
                console.log('颜色动画完成');
            });

        // 启动动画
        positionTween.start();
        colorTween.start();

        // 动画循环
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            
            // 更新Tween
            Tween.update();
            
            // 渲染场景
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };

        animate();

        // 窗口大小调整
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', handleResize);

        // 清理函数
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationIdRef.current);
            
            // 清理Three.js对象
            if (sceneRef.current && cubeRef.current) {
                sceneRef.current.remove(cubeRef.current);
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <canvas 
                ref={canvasRef} 
                style={{ display: 'block', width: '100%', height: '100%' }}
            />
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                color: 'white',
                background: 'rgba(0,0,0,0.5)',
                padding: '10px',
                borderRadius: '5px'
            }}>
                <h3>Tween.js 动画示例</h3>
                <p>立方体会在2秒内移动、缩放并改变颜色</p>
            </div>
        </div>
    );
};

export default TweenIntegrationTest;