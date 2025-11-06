import React, { useEffect, useRef, useState } from 'react';
import { BeforeMaterial, BeforeMaterialExample } from '../../../Engine/materials/BeforeMaterial';
import Canvas3D from './Canvas3D';
import { THREE } from '../../../Engine/core/global';

interface DiffusionParams {
    speed: number;
    radius: number;
    width: number;
    highlightColor: string;
    opacity: number;
}

export const BeforeMaterialDemo: React.FC = () => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [diffusionParams, setDiffusionParams] = useState<DiffusionParams>({
        speed: 2.0,
        radius: 50,
        width: Math.PI / 3,
        highlightColor: '#ff4400',
        opacity: 0.7
    });

    const exampleRef = useRef<BeforeMaterialExample | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);

    // 初始化材质示例
    useEffect(() => {
        if (sceneRef.current && !exampleRef.current) {
            exampleRef.current = new BeforeMaterialExample(sceneRef.current);
        }

        return () => {
            if (exampleRef.current) {
                exampleRef.current.dispose();
                exampleRef.current = null;
            }
        };
    }, []);

    // 处理动画开关
    const handleAnimationToggle = () => {
        if (exampleRef.current) {
            if (isAnimating) {
                exampleRef.current.stopAnimation();
            } else {
                exampleRef.current.startAnimation();
            }
            setIsAnimating(!isAnimating);
        }
    };

    // 更新材质参数
    const updateMaterialParams = () => {
        if (exampleRef.current) {
            exampleRef.current.setDiffusionParams({
                speed: diffusionParams.speed,
                radius: diffusionParams.radius,
                width: diffusionParams.width,
                highlightColor: diffusionParams.highlightColor
            });

            // 更新透明度
            const material = exampleRef.current.getMaterial();
            material.opacity = diffusionParams.opacity;
        }
    };

    // 监听参数变化并更新材质
    useEffect(() => {
        updateMaterialParams();
    }, [diffusionParams]);

    // 场景初始化回调
    const onSceneReady = (renderer: any) => {
        const scene = renderer.scene;
        sceneRef.current = scene;
        // 添加基础环境
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        scene.add(directionalLight);
    };

    // 动画更新回调
    // const onUpdate = (deltaTime: number) => {
    //     if (exampleRef.current) {
    //         exampleRef.current.update(deltaTime);
    //     }
    // };

    return (
        <div style={{ 
            width: '100%', 
            height: '100vh', 
            display: 'flex',
            position: 'relative' 
        }}>
            {/* 3D 画布 */}
            <div style={{ flex: 1 }}>
                <Canvas3D 
                    onSceneReady={onSceneReady}
                />
            </div>

            {/* 控制面板 */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '20px',
                borderRadius: '8px',
                minWidth: '300px',
                fontFamily: 'Arial, sans-serif'
            }}>
                <h3 style={{ margin: '0 0 20px 0' }}>扩散动画材质演示</h3>
                
                {/* 动画控制 */}
                <div style={{ marginBottom: '20px' }}>
                    <button 
                        onClick={handleAnimationToggle}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: isAnimating ? '#ff4444' : '#44ff44',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {isAnimating ? '停止动画' : '开始动画'}
                    </button>
                </div>

                {/* 速度控制 */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        速度: {diffusionParams.speed.toFixed(1)}
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="5.0"
                        step="0.1"
                        value={diffusionParams.speed}
                        onChange={(e) => setDiffusionParams(prev => ({
                            ...prev,
                            speed: parseFloat(e.target.value)
                        }))}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* 半径控制 */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        半径: {diffusionParams.radius.toFixed(0)}
                    </label>
                    <input
                        type="range"
                        min="10"
                        max="200"
                        step="5"
                        value={diffusionParams.radius}
                        onChange={(e) => setDiffusionParams(prev => ({
                            ...prev,
                            radius: parseFloat(e.target.value)
                        }))}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* 宽度控制 */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        宽度: {(diffusionParams.width * 180 / Math.PI).toFixed(0)}°
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="6.28"
                        step="0.1"
                        value={diffusionParams.width}
                        onChange={(e) => setDiffusionParams(prev => ({
                            ...prev,
                            width: parseFloat(e.target.value)
                        }))}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* 透明度控制 */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        透明度: {(diffusionParams.opacity * 100).toFixed(0)}%
                    </label>
                    <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={diffusionParams.opacity}
                        onChange={(e) => setDiffusionParams(prev => ({
                            ...prev,
                            opacity: parseFloat(e.target.value)
                        }))}
                        style={{ width: '100%' }}
                    />
                </div>

                {/* 高亮颜色控制 */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        高亮颜色
                    </label>
                    <input
                        type="color"
                        value={diffusionParams.highlightColor}
                        onChange={(e) => setDiffusionParams(prev => ({
                            ...prev,
                            highlightColor: e.target.value
                        }))}
                        style={{ 
                            width: '100%', 
                            height: '40px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    />
                </div>

                <div style={{ 
                    fontSize: '12px', 
                    color: '#cccccc',
                    marginTop: '20px',
                    lineHeight: '1.4'
                }}>
                    <p><strong>说明：</strong></p>
                    <p>• 这是一个雷达扫描效果的材质演示</p>
                    <p>• 扩散动画从中心向外扩散</p>
                    <p>• 可调节速度、半径、宽度等参数</p>
                    <p>• 支持透明混合和颜色自定义</p>
                </div>
            </div>
        </div>
    );
};

export default BeforeMaterialDemo;