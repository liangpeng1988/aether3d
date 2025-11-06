// Engine 入口文件
// 导出所有核心模块

// Core modules
export * from './core/Aether3d';
export * from './core/RendererSystem';
export * from './core/SceneManager';
export * from './core/ScriptBase';
export * from './core/EngineScripts';
export * from './core/PerformanceUtils';
export * from './core/OSUtils';
export * from './core/LayerManager';
export * from './core/ObjectMetadata';
export * from './core/MetadataManager';
// 导出全局依赖
export * from './core/global';

// Controllers
export * from './controllers/MirrorReflectionScript';
export * from './controllers/OrbitControlsScript';
export * from './controllers/MouseInteractionScript';
export * from './controllers/SpotlightScript';
export * from './controllers/FPSDiagnosticTool';
export * from './controllers/BloomEffectScript';
export * from './controllers/RectAreaLightScript';
export * from './controllers/GLBLoaderScript';
export * from './controllers/EnvironmentMapScript'
export * from './controllers/Edit/PointLightScript'
export * from './controllers/FPSOptimizerScript'
export * from './controllers/CAD/CADLineDrawingScript';
export * from './controllers/ModelEditorScript';
export * from './controllers/CSS2DLabelScript';
export * from './controllers/EdgeSelectionScript';
export * from './controllers/VertexSelectionScript';
export * from './controllers/FaceSelectionScript';

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