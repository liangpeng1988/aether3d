# BasiMaterial 使用说明

BasiMaterial 是一个创建扩散动画效果的材质类，它可以为3D物体添加动态的扩散渐变效果。

## 特性

- **扩散动画**：创建从中心向外扩散的动画效果
- **可配置参数**：支持自定义扩散速度、半径、宽度和颜色
- **时间控制**：支持动态时间更新
- **兼容性**：继承自 THREE.MeshBasicMaterial，兼容 Three.js 生态

## 基本用法

```typescript
import { BasiMaterial } from '../Engine';
import { THREE } from '../Engine/core/global';

// 创建时间uniform（通常在全局管理）
const time = { value: 0 };

// 创建材质
const material = new BasiMaterial({
    color: new THREE.Color("#444"),
    opacity: 0.5,
    speed: 1,
    radius: 100,
    width: Math.PI / 2,
    highlightColor: new THREE.Color("#ff0000"),
    time: time
});

// 应用到几何体
const geometry = new THREE.PlaneGeometry(200, 200);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// 在渲染循环中更新时间
function animate() {
    const deltaTime = clock.getDelta();
    material.updateTime(deltaTime);
    
    // 或者直接更新时间值
    // time.value += deltaTime;
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
```

## 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| color | THREE.Color \| string \| number | "#444" | 基础颜色 |
| opacity | number | 0.5 | 透明度 |
| speed | number | 1 | 扩散速度 |
| radius | number | 100 | 扩散半径 |
| width | number | Math.PI / 2 | 圆环宽度 |
| highlightColor | THREE.Color \| string \| number | "#ff0000" | 高亮颜色 |
| time | { value: number } | { value: 0 } | 时间uniform |

## 动态修改参数

```typescript
// 修改扩散速度
material.speed = 2;

// 修改扩散半径
material.radius = 150;

// 修改高亮颜色
material.highlightColor = new THREE.Color("#00ff00");

// 修改圆环宽度
material.width = Math.PI;
```

## 使用原始函数（兼容模式）

如果你想使用原始的 `handleBeforeMaterial` 函数：

```typescript
import { handleBeforeMaterial } from '../Engine';
import { THREE } from '../Engine/core/global';

const time = { value: 0 };
const material = new THREE.MeshBasicMaterial();

// 应用扩散效果
handleBeforeMaterial(material, time);
```

## 注意事项

1. **性能考虑**：扩散动画使用了自定义着色器，对于大量物体可能影响性能
2. **时间管理**：建议在全局统一管理时间uniform，避免每个材质独立更新
3. **材质类型**：该材质基于 MeshBasicMaterial，不受光照影响
4. **兼容性**：确保使用的 Three.js 版本支持自定义着色器

## 高级用法

### 多个物体共享时间

```typescript
// 全局时间管理
const globalTime = { value: 0 };

const material1 = new BasiMaterial({ time: globalTime, speed: 1 });
const material2 = new BasiMaterial({ time: globalTime, speed: 2 });

// 在渲染循环中统一更新
function animate() {
    globalTime.value += clock.getDelta();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
```

### 动态控制动画

```typescript
// 暂停/恢复动画
let isPaused = false;
function toggleAnimation() {
    isPaused = !isPaused;
}

function animate() {
    if (!isPaused) {
        material.updateTime(clock.getDelta());
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
```