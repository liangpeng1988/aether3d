import React, { useEffect, useRef, useState } from 'react';
import { Tween, THREE } from '../../Engine/core/global';

const CurtainTweenDemo: React.FC = () => {
    const curtainLeftRef = useRef<HTMLDivElement>(null);
    const curtainRightRef = useRef<HTMLDivElement>(null);
    const [curtainState, setCurtainState] = useState(0); // 0 = 关闭, 1 = 打开
    const [isAnimating, setIsAnimating] = useState(false);

    // 应用窗帘动画效果
    const applyCurtainAnimation = (progress: number) => {
        if (curtainLeftRef.current && curtainRightRef.current) {
            // 使用缓动函数使动画更自然
            const easedProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            
            // 应用缩放和透明度效果
            const scale = easedProgress;
            const opacity = 0.2 + (0.8 * easedProgress); // 0.2到1的透明度变化
            
            curtainLeftRef.current.style.transform = `scaleX(${scale})`;
            curtainLeftRef.current.style.opacity = opacity.toString();
            
            curtainRightRef.current.style.transform = `scaleX(${scale})`;
            curtainRightRef.current.style.opacity = opacity.toString();
            
            // 更新状态
            setCurtainState(progress);
        }
    };

    // 打开窗帘
    const openCurtain = (duration: number = 1500) => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        
        // 停止任何现有的动画
        Tween.removeAll();
        
        const tweenData = { progress: curtainState };
        const tween = new Tween(tweenData)
            .to({ progress: 1 }, duration)
            .easing(Tween.Easing.Quadratic.InOut)
            .onUpdate(() => {
                applyCurtainAnimation(tweenData.progress);
            })
            .onComplete(() => {
                setIsAnimating(false);
            });
            
        tween.start();
    };

    // 关闭窗帘
    const closeCurtain = (duration: number = 1500) => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        
        // 停止任何现有的动画
        Tween.removeAll();
        
        const tweenData = { progress: curtainState };
        const tween = new Tween(tweenData)
            .to({ progress: 0 }, duration)
            .easing(Tween.Easing.Quadratic.InOut)
            .onUpdate(() => {
                applyCurtainAnimation(tweenData.progress);
            })
            .onComplete(() => {
                setIsAnimating(false);
            });
            
        tween.start();
    };

    // 切换窗帘
    const toggleCurtain = () => {
        if (curtainState > 0.5) {
            closeCurtain(1500);
        } else {
            openCurtain(1500);
        }
    };

    // 动画循环
    useEffect(() => {
        const animate = () => {
            requestAnimationFrame(animate);
            Tween.update();
        };
        
        animate();
        
        // 初始化窗帘为关闭状态
        applyCurtainAnimation(0);
        
        return () => {
            Tween.removeAll();
        };
    }, []);

    return (
        <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%',
            backgroundColor: '#87CEEB',
            overflow: 'hidden'
        }}>
            {/* 窗户背景 */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '300px',
                height: '200px',
                backgroundColor: '#1E90FF',
                border: '5px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 0 20px rgba(0,0,0,0.3)',
                zIndex: 1
            }} />
            
            {/* 左侧窗帘 */}
            <div
                ref={curtainLeftRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '50%',
                    height: '100%',
                    backgroundColor: '#8B4513',
                    transformOrigin: 'left center',
                    zIndex: 2,
                    borderRight: '1px solid #654321'
                }}
            />
            
            {/* 右侧窗帘 */}
            <div
                ref={curtainRightRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '50%',
                    height: '100%',
                    backgroundColor: '#8B4513',
                    transformOrigin: 'right center',
                    zIndex: 2,
                    borderLeft: '1px solid #654321'
                }}
            />
            
            {/* 控制面板 */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px',
                zIndex: 3
            }}>
                <button 
                    onClick={() => openCurtain(1500)}
                    disabled={isAnimating}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isAnimating ? 'not-allowed' : 'pointer',
                        opacity: isAnimating ? 0.6 : 1
                    }}
                >
                    打开窗帘
                </button>
                <button 
                    onClick={() => closeCurtain(1500)}
                    disabled={isAnimating}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isAnimating ? 'not-allowed' : 'pointer',
                        opacity: isAnimating ? 0.6 : 1
                    }}
                >
                    关闭窗帘
                </button>
                <button 
                    onClick={toggleCurtain}
                    disabled={isAnimating}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isAnimating ? 'not-allowed' : 'pointer',
                        opacity: isAnimating ? 0.6 : 1
                    }}
                >
                    切换
                </button>
            </div>
            
            {/* 状态显示 */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '10px',
                borderRadius: '4px',
                zIndex: 3
            }}>
                <div>窗帘状态: {curtainState > 0.5 ? '打开' : '关闭'}</div>
                <div>进度: {(curtainState * 100).toFixed(0)}%</div>
            </div>
        </div>
    );
};

export default CurtainTweenDemo;