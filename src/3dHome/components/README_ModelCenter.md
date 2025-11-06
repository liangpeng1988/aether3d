# 📐 模型轴中心点计算工具

这个工具集提供了完整的 Three.js 模型中心点计算和设置功能，帮助你准确地定位和调整 3D 模型的轴心点。

## 🚀 快速开始

### 1. 导入工具函数

```typescript
import { 
  calculateModelCenter, 
  setPivotToBottomCenter, 
  setPivotToGeometryCenter,
  addCenterVisualization 
} from './modelCenterUtils';
```

### 2. 基本使用

```typescript
// 假设你有一个加载好的模型对象
const modelObject = scene.getObjectByName('myModel');

// 计算模型的中心点信息
const centerInfo = calculateModelCenter(modelObject);

console.log('模型信息:', {
  center: centerInfo.center,        // 几何中心点
  size: centerInfo.size,           // 模型尺寸 (width, height, depth)
  bottomCenter: centerInfo.bottomCenter, // 底部中心点
  topCenter: centerInfo.topCenter,      // 顶部中心点
  pivot: centerInfo.pivot,         // 轴心点（默认为底部中心）
  boundingBox: centerInfo.boundingBox   // 包围盒
});
```

## 🎯 主要功能

### 1. 计算模型中心点

```typescript
const centerInfo = calculateModelCenter(object);
```

**返回值包含：**
- `center`: 几何中心点
- `size`: 模型尺寸 (Vector3)
- `boundingBox`: 包围盒 (Box3)
- `pivot`: 轴心点位置
- `bottomCenter`: 底部中心点
- `topCenter`: 顶部中心点
- `adjustedPosition`: 调整后的位置

### 2. 设置轴心点

```typescript
// 设置轴心点到底部中心（常用于地面对象）
setPivotToBottomCenter(object);

// 设置轴心点到几何中心（常用于悬浮对象）
setPivotToGeometryCenter(object);
```

### 3. 距离计算

```typescript
const distanceInfo = calculateDistance(object1, object2);
console.log('距离信息:', {
  centerDistance: distanceInfo.centerDistance,      // 中心点距离
  boundingBoxDistance: distanceInfo.boundingBoxDistance, // 包围盒最近距离
  closestPoints: distanceInfo.closestPoints         // 最近点坐标
});
```

### 4. 可视化辅助

```typescript
// 添加可视化标记
const helpers = addCenterVisualization(scene, object, {
  showCenter: true,        // 显示几何中心点（黄色球）
  showBottomCenter: true,  // 显示底部中心点（紫色球）
  showBoundingBox: true,   // 显示包围盒（青色框线）
  markerSize: 0.1         // 标记球的大小
});

// 移除可视化标记
removeCenterVisualization(scene, 'myModel');
```

## 🏠 在 Canvas3D 中使用

### 方法一：直接在组件中使用

```typescript
// 在 Canvas3D 组件的 useEffect 中
useEffect(() => {
  // ... 其他初始化代码 ...
  
  // 监听模型加载完成事件
  engine.on('model:loaded', (data) => {
    const loadedObject = data.object;
    
    // 计算并设置模型中心点
    const centerInfo = calculateModelCenter(loadedObject);
    
    // 根据模型类型设置不同的轴心点
    if (loadedObject.name.includes('ground') || loadedObject.name.includes('floor')) {
      // 地面类对象设置轴心点到底部
      setPivotToBottomCenter(loadedObject);
    } else {
      // 其他对象设置轴心点到几何中心
      setPivotToGeometryCenter(loadedObject);
    }
    
    // 添加可视化标记（开发时使用）
    if (process.env.NODE_ENV === 'development') {
      addCenterVisualization(engine.scene, loadedObject);
    }
  });
}, []);
```

### 方法二：在脚本类中使用

```typescript
// 在设备脚本中使用
export class MyDeviceScript extends ScriptBase {
  public start(): void {
    this.loadModel().then((loadedObject) => {
      // 计算模型信息
      const centerInfo = calculateModelCenter(loadedObject);
      
      // 调整模型位置，使其底部贴合地面
      setPivotToBottomCenter(loadedObject);
      
      console.log('设备模型加载完成:', {
        name: loadedObject.name,
        center: centerInfo.center,
        size: centerInfo.size
      });
    });
  }
}
```

## 🎨 实际应用场景

### 1. 智能家居设备定位

```typescript
// 空调设备 - 通常挂在墙上，轴心点在背部中心
const airConditioner = scene.getObjectByName('airConditioner');
const acInfo = calculateModelCenter(airConditioner);
// 自定义轴心点到背部中心
airConditioner.position.set(
  wallPosition.x,
  wallPosition.y,
  wallPosition.z - acInfo.size.z / 2
);
```

### 2. 家具摆放

```typescript
// 桌子 - 轴心点在底部中心，便于放置在地面上
const table = scene.getObjectByName('table');
setPivotToBottomCenter(table);
table.position.y = 0; // 直接设置为地面高度
```

### 3. 装饰品悬挂

```typescript
// 吊灯 - 轴心点在顶部中心，便于从天花板悬挂
const chandelier = scene.getObjectByName('chandelier');
const chandelierInfo = calculateModelCenter(chandelier);
// 设置轴心点到顶部
chandelier.position.set(
  centerPosition.x,
  ceilingHeight - chandelierInfo.size.y / 2,
  centerPosition.z
);
```

## 🔧 高级用法

### 自定义轴心点位置

```typescript
function setCustomPivot(object: THREE.Object3D, pivotOffset: THREE.Vector3) {
  const centerInfo = calculateModelCenter(object);
  
  // 计算自定义轴心点
  const customPivot = centerInfo.center.clone().add(pivotOffset);
  
  // 调整对象位置
  const adjustment = object.position.clone().sub(customPivot);
  object.position.copy(adjustment);
  
  return customPivot;
}

// 使用示例：设置轴心点到模型的左下角
const leftBottomPivot = new THREE.Vector3(-centerInfo.size.x / 2, -centerInfo.size.y / 2, 0);
setCustomPivot(myObject, leftBottomPivot);
```

### 批量处理多个对象

```typescript
function processMultipleObjects(objects: THREE.Object3D[], pivotType: 'bottom' | 'center' | 'custom') {
  objects.forEach(obj => {
    const centerInfo = calculateModelCenter(obj);
    
    switch (pivotType) {
      case 'bottom':
        setPivotToBottomCenter(obj);
        break;
      case 'center':
        setPivotToGeometryCenter(obj);
        break;
      default:
        // 自定义处理
        break;
    }
    
    console.log(`处理完成: ${obj.name}`, centerInfo);
  });
}
```

## 📊 调试与可视化

开发时建议启用可视化功能：

```typescript
// 开发环境下添加可视化
if (process.env.NODE_ENV === 'development') {
  // 为场景中的所有模型添加中心点可视化
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.name !== 'helper') {
      addCenterVisualization(scene, child, {
        showCenter: true,
        showBottomCenter: true,
        showBoundingBox: false, // 避免过于杂乱
        markerSize: 0.05
      });
    }
  });
}
```

## 🎯 最佳实践

1. **性能优化**: 只在需要时计算中心点，避免每帧都计算
2. **命名规范**: 为可视化辅助对象使用清晰的命名
3. **清理资源**: 及时移除不需要的可视化标记
4. **类型检查**: 确保传入的对象是有效的 THREE.Object3D
5. **坐标系统**: 注意世界坐标系和局部坐标系的区别

## 🐛 常见问题

### Q: 为什么计算的中心点不准确？
A: 确保模型已经完全加载，并且调用了 `updateMatrixWorld(true)`

### Q: 如何处理复杂的嵌套模型？
A: `calculateModelCenter` 会自动计算所有子对象，包括嵌套的 Group

### Q: 可视化标记如何自定义颜色？
A: 可以修改 `addCenterVisualization` 函数中的材质颜色配置

---

这个工具集为你的 3D 场景提供了强大的模型定位和调试能力，让复杂的空间计算变得简单直观! 🎉