export * from './core/Aether3d';
export * from './core/global';
export * from './core/ScriptBase';
export * from './controllers/OrbitControlsScript';
export * from './controllers/BlenderCameraControlsScript';
export * from './controllers/MouseInteractionScript';
export * from './controllers/EnvironmentMapScript';
export * from './controllers/GLBLoaderScript';
export * from './controllers/CSS2DLabelScript';
export * from './controllers/FPSOptimizerScript';
export * from './controllers/OutlineEffectScript';
export * from './controllers/EdgeSelectionScript';
export * from './controllers/VertexSelectionScript';
export * from './controllers/FaceSelectionScript';
export * from './controllers/VertexManipulationController'; // 添加顶点操作控制器导出
export * from './controllers/Edit/PointLightScript'; // 添加点光源脚本导出

// CAD模块
export * from './controllers/CAD/LineBase';
export * from './controllers/CAD/LineTypes';
export * from './controllers/CAD/LineFactory';
export * from './controllers/CAD/CADExample';

// Alignment System
export * from './alignment';

// Events
export * from './events/EventEmitter';

// Interface
export * from './interface/IScript';
export * from './interface/IRenderer';
export * from './interface/ISystem';
export * from './interface/SceneData';
export * from './interface/Viewport';

// 只导出类型定义，不导出具体实现
export type { IMaterialFactory } from './materials/MaterialFactory';
export type { MaterialConfig } from './materials/MaterialConfig';
export { AnimationMaterial } from './materials/AnimationMaterial';
export { ShaderGlowMaterial } from './materials/ShaderGlowMaterial';
export { WindMaterial } from './materials/WindMaterial';
export { RibbonMaterial } from './materials/RibbonMaterial';
export { BeforeMaterial, DiffusionEffectTypes } from './materials/BeforeMaterial';
export { RadarMaterial } from './materials/RadarMaterial';

// Math
export * from './math/Math';