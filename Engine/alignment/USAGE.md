# Three.js 精准对齐系统使用指南

## 概述

对齐系统是一个用于在 3D 场景中精确对齐和分布对象的工具集。该系统提供了多种对齐方式，包括基于包围盒的对齐、相对对齐和分布对齐等功能。

## 安装和集成

对齐系统已经集成到 Aether3D 引擎中，无需额外安装。只需从引擎中导入相关模块即可使用：

```typescript
import { AlignmentController } from './Engine/alignment';
```

## 核心组件

### 1. AlignmentBase（对齐基类）
提供通用的对齐功能和方法，一般不直接使用。

### 2. ObjectAligner（对象对齐器）
实现具体的对齐算法，一般不直接使用。

### 3. AlignmentController（对齐控制器）
主要使用接口，实现 IScript 接口，可在 Aether3D 引擎中作为脚本使用。

### 4. AlignmentExample（使用示例）
演示如何使用对齐系统的示例代码。

## 基本使用方法

### 1. 创建对齐控制器

```typescript
import { AlignmentController } from './Engine/alignment';

// 在 Aether3D 渲染器中创建对齐控制器
const alignmentController = new AlignmentController(
  renderer.scene, 
  renderer.camera, 
  renderer.renderer
);

// 将对齐控制器添加到渲染器脚本中
renderer.addScript(alignmentController);
```

### 2. 创建测试对象

```typescript
// 创建几个立方体用于测试
const testObjects = [];
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];

for (let i = 0; i < 5; i++) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: colors[i] });
  const cube = new THREE.Mesh(geometry, material);
  
  // 设置随机位置
  cube.position.set(
    Math.random() * 10 - 5,
    Math.random() * 10 - 5,
    Math.random() * 10 - 5
  );
  
  renderer.scene.add(cube);
  testObjects.push(cube);
}
```

### 3. 执行对齐操作

```typescript
// 对齐到中心点
const center = new THREE.Vector3(0, 0, 0);
alignmentController.alignSelectedObjects(testObjects, center, 'center');

// X轴分布
alignmentController.distributeSelectedObjects(testObjects, 'x', 2);

// 相对对齐
alignmentController.alignToTarget([sourceObject], targetObject, 'center');
```

## 对齐模式

### 对齐类型
- **min**: 对齐到对象包围盒的最小点
- **center**: 对齐到对象包围盒的中心点
- **max**: 对齐到对象包围盒的最大点

### 坐标系统
- **world**: 在世界坐标系中进行对齐计算
- **local**: 在局部坐标系中进行对齐计算

## API 参考

### AlignmentController 类方法

#### alignSelectedObjects(objects, targetPosition, alignmentType, coordinateSystem)
将多个对象对齐到指定位置
- `objects`: THREE.Object3D[] - 要对齐的对象数组
- `targetPosition`: THREE.Vector3 - 目标位置
- `alignmentType`: 'min' | 'center' | 'max' - 对齐类型
- `coordinateSystem`: 'world' | 'local' - 坐标系统

#### alignToTarget(sourceObjects, targetObject, alignmentType, coordinateSystem)
将源对象对齐到目标对象
- `sourceObjects`: THREE.Object3D[] - 源对象数组
- `targetObject`: THREE.Object3D - 目标对象
- `alignmentType`: 'min' | 'center' | 'max' - 对齐类型
- `coordinateSystem`: 'world' | 'local' - 坐标系统

#### distributeSelectedObjects(objects, direction, spacing)
将对象按指定方向和间距分布
- `objects`: THREE.Object3D[] - 要分布的对象数组
- `direction`: 'x' | 'y' | 'z' - 分布方向
- `spacing`: number - 对象间距

#### undoLastAlignment()
撤销上一次对齐操作

#### setAlignmentConfig(config)
设置对齐配置
- `config`: 配置对象，包含以下属性：
  - `snapThreshold`: number - 对齐阈值
  - `coordinateSystem`: 'world' | 'local' - 坐标系统
  - `alignmentMode`: 'min' | 'center' | 'max' - 对齐模式

## 运行示例

项目中提供了两种方式来体验对齐系统：

### 1. 独立 HTML 示例
```bash
npm run dev:alignment
```

### 2. 集成到 3D Home 界面
在 3D Home 界面中，点击"显示对齐演示"按钮即可打开对齐系统控制面板。

## 扩展开发

### 添加新的对齐算法
1. 继承 `AlignmentBase` 类或 `ObjectAligner` 类
2. 实现新的对齐方法
3. 在 `AlignmentController` 中添加相应的公开接口

### 自定义对齐控制器
1. 创建新的类继承 `ObjectAligner`
2. 实现特定的对齐逻辑
3. 确保实现 IScript 接口以兼容 Aether3D 引擎

## 注意事项

1. 对齐操作会直接修改对象的位置属性
2. 撤销功能最多保存 50 次操作历史
3. 分布对齐会保持对象在非主轴方向上的位置不变
4. 相对对齐时，源对象会移动到与目标对象对齐的位置