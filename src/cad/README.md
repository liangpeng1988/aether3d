# CAD模块使用说明

## 概述

本CAD模块提供了基于Aether3d渲染引擎的2D/3D CAD功能，包括线条绘制和模型编辑功能。

## 组件介绍

### 1. Canvas2D
基于Aether3d渲染引擎的CAD画布组件，支持2D线条绘制和3D模型编辑。

#### Props
- `width`: 容器宽度，默认为'100%'
- `height`: 容器高度，默认为'100%'
- `backgroundColor`: 背景颜色，默认为'#485163'
- `showGrid`: 是否显示网格，默认为true
- `showAxes`: 是否显示坐标轴，默认为true
- `cameraPosition`: 相机位置，默认为[0, 10, 0]
- `cameraTarget`: 相机目标点，默认为[0, 0, 0]
- `onLineDrawn`: 线条绘制完成回调
- `onLineSelected`: 线条选中回调
- `onObjectSelected`: 对象选中回调
- `onObjectDeselected`: 对象取消选中回调

#### Ref Methods
- `clearAllLines()`: 清除所有线条
- `setLineColor(color)`: 设置线条颜色
- `setLineWidth(width)`: 设置线条宽度
- `setSnapEnabled(enabled)`: 启用/禁用吸附功能
- `setSnapDistance(distance)`: 设置吸附距离
- `switchToCADMode()`: 切换到CAD模式
- `switchToModelMode()`: 切换到模型编辑模式
- `getDrawnLines()`: 获取当前绘制的线条
- `focusOnObject(object)`: 聚焦到指定对象
- `setCameraToDefault()`: 设置相机到默认视角

### 2. 示例文件
提供了多种示例文件，展示如何使用Canvas2D组件：

- **[canvas2d.html](file:///E:/UGit/aether3d/src/CAD/canvas2d.html)**: HTML示例页面，展示了Canvas2D组件的基础UI设计和交互，但不包含实际的组件引用
- **[canvas2d-complete-example.html](file:///E:/UGit/aether3d/src/CAD/canvas2d-complete-example.html)**: 完整的HTML示例页面，展示了Canvas2D组件的完整UI设计和交互
- **[Canvas2DExample.tsx](file:///E:/UGit/aether3d/src/CAD/Canvas2DExample.tsx)**: React组件示例，展示了如何在React应用中使用Canvas2D组件
- **[Canvas2DCompleteExample.tsx](file:///E:/UGit/aether3d/src/CAD/Canvas2DCompleteExample.tsx)**: 完整的React组件示例，展示了Canvas2D组件的所有功能

## 使用示例

### React组件使用示例

```tsx
import React from 'react';
import { Canvas2D } from './src/CAD';

const MyCADComponent: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas2D 
        width="100%" 
        height="100%"
        backgroundColor="#f0f0f0"
        showGrid={true}
        showAxes={true}
        cameraPosition={[0, 10, 0]}
        cameraTarget={[0, 0, 0]}
        onLineDrawn={(line) => {
          console.log('线条绘制完成:', line);
        }}
        onLineSelected={(line) => {
          console.log('线条选中:', line);
        }}
      />
    </div>
  );
};

export default MyCADComponent;
```

### 在HTML页面中使用

要在HTML页面中使用Canvas2D组件，您需要：

1. 通过构建工具（如Webpack、Vite等）将React组件编译为浏览器可执行的JavaScript代码
2. 在HTML页面中引用编译后的JavaScript文件
3. 通过JavaScript代码初始化和使用Canvas2D组件

有关UI设计和交互的参考，请查看[canvas2d.html](file:///E:/UGit/aether3d/src/CAD/canvas2d.html)和[canvas2d-complete-example.html](file:///E:/UGit/aether3d/src/CAD/canvas2d-complete-example.html)文件。

## 功能说明

### CAD绘制模式
- 支持直线、曲线、圆弧、矩形、多边形等线条类型
- 支持吸附功能
- 支持坐标显示
- 支持线条颜色和宽度设置
- 支持撤销/删除操作

### 模型编辑模式
- 支持对象选择
- 支持移动、旋转、缩放操作
- 支持对象复制和删除
- 支持网格吸附

## 快捷键

### CAD绘制模式
- 左键点击：开始绘制/添加点
- 双击或按Enter：完成绘制
- ESC：取消绘制
- Delete：删除最后绘制的线条

### 模型编辑模式
- 左键点击：选择对象
- G：切换到移动模式
- R：切换到旋转模式
- S：切换到缩放模式
- Delete：删除选中对象
- ESC：取消选择