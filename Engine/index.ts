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
// 导出全局依赖
export * from './core/global';

// Controllers
export * from './controllers/MirrorReflectionScript';
export * from './controllers/OrbitControlsScript';
export * from './controllers/MouseInteractionScript';
export * from './controllers/SceneLightingScript';
export * from './controllers/FPSDiagnosticTool';
export * from './controllers/BloomEffectScript';
export * from './controllers/RectAreaLightScript';
export * from './controllers/GLBLoaderScript';
export * from './controllers/UVAnimationScript';
export * from './controllers/EnvironmentMapScript'
export * from './controllers/CSS2DLabelScript'
export * from './controllers/Edit/PointLightScript'
export * from './controllers/FPSOptimizerScript'

// Events
export * from './events/EventEmitter';

// Interface
export * from './interface/IScript';
export * from './interface/IRenderer';
export * from './interface/ISystem';
export * from './interface/SceneData';

// 只导出类型定义，不导出具体实现
export type { IMaterialFactory } from './materials/MaterialFactory';
export type { MaterialConfig } from './materials/MaterialConfig';
export { AnimationMaterial } from './materials/AnimationMaterial';
export { ShaderGlowMaterial } from './materials/ShaderGlowMaterial';
export { WindMaterial } from './materials/WindMaterial';
export { RibbonMaterial } from './materials/RibbonMaterial';

// Math
export * from './math/Math';
