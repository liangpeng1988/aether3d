# Three.js 精准对齐系统架构设计

## 概述

对齐系统是一个用于在 3D 场景中精确对齐和分布对象的工具集。该系统提供了多种对齐方式，包括基于包围盒的对齐、相对对齐和分布对齐等功能。

## 架构组成

### 1. AlignmentBase（对齐基类）
- **功能**：提供通用的对齐功能和方法
- **主要特性**：
  - 计算对象的世界坐标和局部坐标包围盒
  - 坐标系统一转换
  - 获取包围盒的基准点（最小点、中心点、最大点）

### 2. ObjectAligner（对象对齐器）
- **功能**：继承自 AlignmentBase，实现具体的对齐算法
- **主要特性**：
  - 多对象包围盒对齐
  - 相对对齐（对象间对齐）
  - 分布对齐（等间距分布）
  - 操作历史记录（支持撤销）

### 3. AlignmentController（对齐控制器）
- **功能**：实现 IScript 接口，可在 Aether3D 引擎中作为脚本使用
- **主要特性**：
  - 可启用/禁用
  - 符合引擎脚本生命周期
  - 提供简化的对齐操作接口

### 4. AlignmentExample（使用示例）
- **功能**：演示如何使用对齐系统
- **主要特性**：
  - 创建测试对象
  - 演示各种对齐功能
  - 展示配置更新和撤销操作

## 核心功能详解

### 对齐模式
- **Min（最小点对齐）**：对象的最小坐标点对齐到目标位置
- **Center（中心点对齐）**：对象的中心点对齐到目标位置
- **Max（最大点对齐）**：对象的最大坐标点对齐到目标位置

### 坐标系统
- **World（世界坐标）**：在世界坐标系中进行对齐计算
- **Local（局部坐标）**：在局部坐标系中进行对齐计算

### 对齐类型
1. **多对象包围盒对齐**：将多个对象作为一个整体对齐到指定位置
2. **相对对齐**：将源对象对齐到目标对象的指定基准点
3. **分布对齐**：将多个对象按指定方向和间距均匀分布

## 使用方法

详细使用说明请参考 [USAGE.md](./USAGE.md) 文件。

### 基本使用
```typescript
// 创建对齐控制器
const alignmentController = new AlignmentController(scene, camera, renderer);

// 对齐对象到中心点
const center = new THREE.Vector3(0, 0, 0);
alignmentController.alignSelectedObjects(objects, center, 'center');

// 相对对齐
alignmentController.alignToTarget([sourceObject], targetObject, 'center');

// 分布对齐
alignmentController.distributeSelectedObjects(objects, 'x', 2);
```

### 配置更新
```typescript
// 更新对齐配置
alignmentController.setAlignmentConfig({
    snapThreshold: 1.0,
    coordinateSystem: 'world',
    alignmentMode: 'min'
});
```

### 撤销操作
```typescript
// 撤销上一次对齐操作
const success = alignmentController.undoLastAlignment();
```

## 运行示例

项目中提供了两种方式来体验对齐系统：

### 1. 独立 HTML 示例
```bash
npm run dev:alignment
```

示例文件位于 [example.html](./example.html)，提供了完整的对齐系统演示界面。

### 2. 集成到 3D Home 界面
在 3D Home 界面中，点击"显示对齐演示"按钮即可打开对齐系统控制面板。

## 扩展性

系统采用模块化设计，易于扩展：
1. 可通过继承 AlignmentBase 添加新的对齐算法
2. 可通过扩展 ObjectAligner 添加新的对齐类型
3. 可通过实现新的控制器适配不同的引擎或框架