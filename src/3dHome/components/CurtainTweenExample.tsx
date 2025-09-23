import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

const CurtainTweenExample: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const curtainLeftRef = useRef<THREE.Mesh | null>(null);
    const curtainRightRef = useRef<THREE.Mesh | null>(null);
    const animationIdRef = useRef<number>(0);

    useEffect(() => {
        if (!mountRef.current) return;

        // 创建场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xdddddd);
        sceneRef.current = scene;

        // 创建相机
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 5);
        cameraRef.current = camera;

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current = renderer;
        mountRef.current.appendChild(renderer.domElement);

        // 添加灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // 创建窗帘几何体
        const curtainGeometry = new THREE.PlaneGeometry(2, 3);

        // 创建左侧窗帘
        const leftMaterial = new THREE.MeshStandardMaterial({
            color: 0x3498db,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });

        const curtainLeft = new THREE.Mesh(curtainGeometry, leftMaterial);
        curtainLeft.position.x = -1;
        scene.add(curtainLeft);
        curtainLeftRef.current = curtainLeft;

        // 创建右侧窗帘
        const rightMaterial = new THREE.MeshStandardMaterial({
            color: 0x3498db,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });

        const curtainRight = new THREE.Mesh(curtainGeometry, rightMaterial);
        curtainRight.position.x = 1;
        scene.add(curtainRight);
        curtainRightRef.current = curtainRight;

        // 创建Tween动画函数
        const createCurtainAnimation = (isOpen: boolean) => {
            if (!curtainLeftRef.current || !curtainRightRef.current) return;

            // 停止现有的动画
            TWEEN.removeAll();

            // 设置起始和目标状态
            const startLeft = { 
                scaleX: curtainLeftRef.current.scale.x,
                opacity: (curtainLeftRef.current.material as THREE.MeshStandardMaterial).opacity
            };
            
            const startRight = { 
                scaleX: curtainRightRef.current.scale.x,
                opacity: (curtainRightRef.current.material as THREE.MeshStandardMaterial).opacity
            };

            const targetScale = isOpen ? 1 : 0;
            const targetOpacity = isOpen ? 1 : 0;

            // 左侧窗帘动画
            const leftTween = new TWEEN.Tween(startLeft)
                .to({ scaleX: targetScale, opacity: targetOpacity }, 2000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                    if (curtainLeftRef.current) {
                        curtainLeftRef.current.scale.x = startLeft.scaleX;
                        (curtainLeftRef.current.material as THREE.MeshStandardMaterial).opacity = startLeft.opacity;
                        (curtainLeftRef.current.material as THREE.MeshStandardMaterial).transparent = true;
                    }
                });

            // 右侧窗帘动画
            const rightTween = new TWEEN.Tween(startRight)
                .to({ scaleX: targetScale, opacity: targetOpacity }, 2000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                    if (curtainRightRef.current) {
                        curtainRightRef.current.scale.x = startRight.scaleX;
                        (curtainRightRef.current.material as THREE.MeshStandardMaterial).opacity = startRight.opacity;
                        (curtainRightRef.current.material as THREE.MeshStandardMaterial).transparent = true;
                    }
                });

            // 启动动画
            leftTween.start();
            rightTween.start();

            return { leftTween, rightTween };
        };

        // 创建循环动画
        const createLoopAnimation = () => {
            let isOpen = false;
            
            const animate = () => {
                createCurtainAnimation(isOpen);
                isOpen = !isOpen;
                
                setTimeout(() => {
                    animate();
                }, 3000);
            };
            
            animate();
        };

        // 动画循环
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            
            // 更新Tween
            TWEEN.update();
            
            // 渲染场景
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };

        animate();

        // 启动循环动画
        createLoopAnimation();

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
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
            
            if (mountRef.current && rendererRef.current) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
        };
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                color: 'white',
                background: 'rgba(0,0,0,0.5)',
                padding: '10px',
                borderRadius: '5px'
            }}>
                <h3>窗帘动画 Tween.js 示例</h3>
                <p>演示如何在Three.js中使用Tween.js实现窗帘开合动画</p>
            </div>
        </div>
    );
};

export default CurtainTweenExample;