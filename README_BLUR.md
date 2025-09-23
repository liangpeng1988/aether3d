# 镜面反射模糊效果使用说明

## 概述

本项目实现了基于Three.js的镜面反射模糊效果，通过修改MirrorReflectionScript来支持动态模糊。

## 功能特性

1. **基础反射**: 使用Three.js的Reflector对象实现基础镜面反射
2. **动态模糊**: 支持实时调整模糊强度和半径
3. **渐变模糊**: 支持中心清晰边缘模糊的渐变效果
4. **性能优化**: 使用双通道高斯模糊算法

## 核心文件

- `Engine/controllers/MirrorReflectionScript.ts`: 主要实现文件
- `Engine/core/global.ts`: 导出必要的着色器模块
- `src/3dHome/components/Script/BlurExample.ts`: 使用示例

## 使用方法

### 1. 创建反射器实例

```typescript
const mirrorScript = new MirrorReflectionScript({
  textureWidth: 2048,
  textureHeight: 2048,
  color: 0x888888,
  opacity: 0.8,
  blurStrength: 0.5,    // 模糊强度 (0-1)
  blurRadius: 10,       // 模糊半径
  gradientBlur: true,   // 启用渐变模糊
  blurCenter: new THREE.Vector2(0.5, 0.5)  // 模糊中心点
});
renderer.addScript(mirrorScript);
```

### 2. 动态调整模糊效果

```typescript
// 调整模糊强度
mirrorScript.setBlurStrength(0.8);

// 调整模糊半径
mirrorScript.setBlurRadius(15);

// 启用/禁用渐变模糊
mirrorScript.setGradientBlurEnabled(true);

// 设置模糊中心点
mirrorScript.setBlurCenter(0.5, 0.5);
```

### 3. 批量更新参数

```typescript
mirrorScript.updateParameters({
  blurStrength: 0.7,
  blurRadius: 12,
  gradientBlur: true
});
```

## 技术实现

### 模糊算法

使用双通道高斯模糊算法：
1. 水平模糊通道 (HorizontalBlurShader)
2. 垂直模糊通道 (VerticalBlurShader)

### 性能优化

1. 只在参数变化时重新计算模糊效果
2. 使用WebGL渲染目标复用纹理
3. 延迟更新机制避免每帧重复计算

## 注意事项

1. 较高的纹理分辨率会消耗更多GPU资源
2. 过高的模糊半径可能影响性能
3. 模糊效果在移动设备上可能性能较差

## 示例代码

参考 `src/3dHome/components/Script/BlurExample.ts` 文件中的动态模糊示例。