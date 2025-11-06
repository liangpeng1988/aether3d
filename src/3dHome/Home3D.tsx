import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Aether3d } from '../../Engine';
import { EnvironmentMapScript } from '../../Engine';
import { GLBLoaderScript } from '../../Engine';
import "./common.css";
import "./index.css";

// 导入新创建的组件
import Navbar from './components/Navbar';
import WeatherInfo from './components/WeatherInfo';
import LightControl from './components/LightControl';
import AcControlEnhanced from './components/AcControlEnhanced';
import CurtainControl from './components/CurtainControl';
import ToggleSwitch from './components/ToggleSwitch';
import Canvas3D, { Scene3DHandle } from './components/Canvas3D';
import Group4 from './components/Group4';
import OverviewPanel from './components/OverviewPanel';
import FloorPlanPanel from './components/FloorPlanPanel';
import AlignmentDemo from './components/AlignmentDemo';

const Home3D: React.FC = () => {
  const navigate = useNavigate();
  const rendererRef = useRef<Aether3d | null>(null);
  const environmentMapScriptRef = useRef<EnvironmentMapScript | null>(null);
  const glbLoaderScriptRef = useRef<GLBLoaderScript | null>(null);
  const scene3DRef = useRef<Scene3DHandle | null>(null);
  const [showAlignmentDemo, setShowAlignmentDemo] = useState(false);

  // 处理点击事件的函数
  const handleItemClick = (item: string) => {
    console.log(`点击了 ${item}`);
  };

  // 导航到LibreDWG测试页面
  const handleNavigateToTest = () => {
    navigate('/libredwg-test');
  };

  // 场景准备就绪的回调函数
  const handleSceneReady = (renderer: Aether3d, environmentMapScript: EnvironmentMapScript, glbLoaderScript: GLBLoaderScript) => {
    rendererRef.current = renderer;
    environmentMapScriptRef.current = environmentMapScript;
    glbLoaderScriptRef.current = glbLoaderScript;
  };

  // 切换对齐演示的显示状态
  const toggleAlignmentDemo = () => {
    setShowAlignmentDemo(!showAlignmentDemo);
  };

  useEffect(() => {
    // 窗口大小调整
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current?.resize();
      }
    };

    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current?.stop();
        rendererRef.current?.dispose();
      }
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 原有UI内容 - 覆盖在3D场景之上 */}
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="page" style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="box_1" style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div className="section_1" style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div className="group_11" style={{
                width: 'calc(100% - 48px)',
                height: 'calc(100% - 64px)',
                margin: '31px 24px 25px 24px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                        <Canvas3D
                          ref={scene3DRef}
                          onSceneReady={handleSceneReady}
                          showFPS={true} // 启用FPS显示
                        />
                </div>

                <div className="box_7" style={{
                  boxShadow: 'inset 0px 0px 1px 0px rgba(255, 255, 255, 0.3)', // 降低阴影透明度
                  backgroundColor: 'transparent', // 完全透明背景
                  borderRadius: '16px',
                  width: '280px',
                  height: '100%',
                  border: '1px gradient',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 2
                }}>
                  {/* 导航栏控件 */}
                  <Navbar />

                  {/* 天气信息控件 */}
                  <WeatherInfo />

                  {/* 灯光详细信息组件 */}
                  <Group4
                    onArrowClick={() => handleItemClick('灯光详情')}
                    onMenuClick={() => handleItemClick('灯光菜单')}
                  />

                  {/* 切换按钮组件 */}
                  <ToggleSwitch
                    label="常用开关"
                    onClick={() => handleItemClick('常用开关')}
                  />

                  {/* 灯光组件 */}
                  <LightControl
                    onToggle={() => handleItemClick('灯光')}
                    status="ON"
                  />

                  {/* 空调组件 */}
                  <AcControlEnhanced
                    onToggle={() => handleItemClick('空调')}
                    status="ON"
                  />

                  {/* 窗帘组件 */}
                  <CurtainControl
                    onToggle={() => handleItemClick('窗帘')}
                    status="OFF"
                  />
                  
                  {/* LibreDWG测试页面导航按钮 */}
                  <div style={{ padding: '10px', textAlign: 'center' }}>
                    <button 
                      onClick={handleNavigateToTest}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginBottom: '10px'
                      }}
                    >
                      测试LibreDWG库
                    </button>
                    
                    {/* 对齐系统演示切换按钮 */}
                    <button 
                      onClick={toggleAlignmentDemo}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {showAlignmentDemo ? '隐藏对齐演示' : '显示对齐演示'}
                    </button>
                  </div>
                  
                  {/* 总览面板组件 */}
                  <OverviewPanel
                    onOverviewClick={() => handleItemClick('全屋总览')}
                    onControlPanelClick={() => handleItemClick('控制面板')}
                  />
                </div>

                {/* 楼层平面图面板组件 */}
                <FloorPlanPanel
                  activeFloor="全部"
                  onFloorClick={(floor) => handleItemClick(`楼层-${floor}`)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 对齐系统演示组件 */}
      {showAlignmentDemo && rendererRef.current && (
        <AlignmentDemo 
          renderer={rendererRef.current} 
          onAlignmentComplete={() => console.log('对齐操作完成')}
        />
      )}
    </div>
  );
};

export default Home3D;