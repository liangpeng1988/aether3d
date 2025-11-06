# TransformControls 与属性面板双向绑定系统

## 📋 概述

实现了 TransformControls 和属性面板之间的实时双向数据绑定，让用户可以：
- 通过拖拽 TransformControls 改变模型变换，属性面板实时更新显示
- 在属性面板修改数值，3D 场景中的模型实时响应
- **通过工具栏按钮快速切换 TransformControls 模式（移动/旋转/缩放）**

---

## 🔄 数据流设计

### **方向 1：TransformControls → 属性面板**

```
用户拖拽 TransformControls
    ↓
TransformControls 触发 'objectChange' 事件
    ↓
Canvas3D 监听事件，调用 onTransformChange 回调
    ↓
MainLayout 更新 selectedObject 状态
    ↓
PropertiesPanel 自动重新渲染，显示新值
```

### **方向 2：属性面板 → TransformControls**

```
用户在属性面板修改数值
    ↓
PropertiesPanel 调用 onPropertyChange 回调
    ↓
MainLayout 更新 selectedObject 状态
    ↓
MainLayout 调用 Canvas3D.updateObjectTransform()
    ↓
Canvas3D 直接修改 THREE.Object3D 属性
    ↓
3D 场景实时更新显示
```

---

## 🛠️ 核心实现

### **1. Canvas3D 组件**

#### **新增 Props**
```typescript
interface Canvas3DProps {
  // ... 其他属性
  /** 对象变换变化时的回调函数 */
  onTransformChange?: (object: THREE.Object3D) => void;
}
```

#### **新增 Handle 方法**
```typescript
export interface Canvas3DHandle {
  // ... 其他方法
  /** 更新对象变换属性 */
  updateObjectTransform: (object: THREE.Object3D, property: string, value: any) => void;
}
```

#### **TransformControls 事件监听**
```typescript
// 监听对象变化事件 - 实时通知属性面板更新
transformControls.addEventListener('objectChange', () => {
  if (transformControls.object && onTransformChangeRef.current) {
    // 触发回调，通知外部组件更新
    onTransformChangeRef.current(transformControls.object);
  }
});
```

#### **updateObjectTransform 方法**
```typescript
updateObjectTransform(object: THREE.Object3D, property: string, value: any) {
  if (!object) return;
  
  // 处理嵌套属性（如 position.x）
  if (property.includes('.')) {
    const parts = property.split('.');
    const mainProp = parts[0]; // position, rotation, scale
    const axis = parts[1]; // x, y, z
    
    if (mainProp === 'position' && axis && object.position) {
      object.position[axis as 'x' | 'y' | 'z'] = value;
    } else if (mainProp === 'rotation' && axis && object.rotation) {
      object.rotation[axis as 'x' | 'y' | 'z'] = value;
    } else if (mainProp === 'scale' && axis && object.scale) {
      object.scale[axis as 'x' | 'y' | 'z'] = value;
    } else if (mainProp === 'userData' && axis) {
      if (!object.userData) object.userData = {};
      object.userData[axis] = value;
    }
  } else if (property === 'userData') {
    object.userData = { ...object.userData, ...value };
  } else if (property === 'layers') {
    if (!object.userData) object.userData = {};
    object.userData.layers = value;
  }
}
```

#### **setTransformMode 方法**（新增）
```typescript
setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
  if (transformControlsRef.current) {
    transformControlsRef.current.setMode(mode);
    console.log(`切换到 ${mode === 'translate' ? '移动' : mode === 'rotate' ? '旋转' : '缩放'} 模式`);
  }
}
```

---

### **2. MainLayout 组件**

#### **TransformControls 模式状态**（新增）
```typescript
// TransformControls 模式状态
const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale' | null>(null);
```

#### **模式切换处理函数**（新增）
```typescript
// 移动模式
const handleSetTranslateMode = () => {
  if (canvas3DRef.current) {
    canvas3DRef.current.setTransformMode('translate');
    setTransformMode('translate');
  }
};

// 旋转模式
const handleSetRotateMode = () => {
  if (canvas3DRef.current) {
    canvas3DRef.current.setTransformMode('rotate');
    setTransformMode('rotate');
  }
};

// 缩放模式
const handleSetScaleMode = () => {
  if (canvas3DRef.current) {
    canvas3DRef.current.setTransformMode('scale');
    setTransformMode('scale');
  }
};
```

#### **选中对象时自动切换模式**（新增）
```typescript
const handleObjectSelected = (object: any | null) => {
  console.log('对象选中:', object?.name);
  setSelectedObject(object);
  
  // 当选中对象时，自动设置 TransformControls 为移动模式
  if (object && is3DView && canvas3DRef.current) {
    canvas3DRef.current.setTransformMode('translate');
    setTransformMode('translate');
  } else if (!object) {
    // 取消选中时清除模式
    setTransformMode(null);
  }
};
```

#### **handlePropertyChange 方法**（属性面板 → 3D）
```typescript
const handlePropertyChange = (property: string, value: any) => {
  console.log(`属性更改: ${property} = ${value}`);
  
  if (selectedObject) {
    const updatedObject = { ...selectedObject };
    
    // 处理嵌套属性（如 position.x）
    if (property.includes('.')) {
      const parts = property.split('.');
      let current = updatedObject;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    } else {
      updatedObject[property] = value;
    }
    
    setSelectedObject(updatedObject);
    
    // 同步更新 3D 场景中的对象
    if (is3DView && canvas3DRef.current) {
      canvas3DRef.current.updateObjectTransform(selectedObject, property, value);
    }
  }
};
```

#### **handleTransformChange 方法**（3D → 属性面板）
```typescript
const handleTransformChange = (object: any) => {
  // 更新选中对象的状态，触发属性面板重新渲染
  setSelectedObject({ ...object });
};
```

#### **Canvas3D 组件配置**
```tsx
<Canvas3D
  ref={canvas3DRef}
  onObjectSelected={handleObjectSelected}
  onTransformChange={handleTransformChange}  // 新增
  // ... 其他属性
/>
```

---

### **3. PropertiesPanel 组件**

#### **接收 Props**
```typescript
interface PropertiesPanelProps {
  selectedObject: any;
  onPropertyChange: (property: string, value: any) => void;
}
```

#### **输入框绑定**
```tsx
<input
  type="number"
  step="0.1"
  value={selectedObject.position?.x?.toFixed(2) || 0}
  onChange={(e) => onPropertyChange('position.x', parseFloat(e.target.value))}
  className="property-number-input"
/>
```

---

### **4. Toolbar 组件**（新增）

#### **TransformControls 模式切换按钮**
在 3D 视图下，工具栏会显示三个 TransformControls 模式切换按钮：

```typescript
// TransformControls 模式切换工具（仅3D视图下显示）
const transformTools: ToolbarButton[] = is3DView ? [
  { 
    id: 'translate', 
    label: '移动', 
    icon: '↔', 
    tooltip: '移动模式 (G)', 
    action: onSetTranslateMode 
  },
  { 
    id: 'rotate', 
    label: '旋转', 
    icon: '↻', 
    tooltip: '旋转模式 (R)', 
    action: onSetRotateMode 
  },
  { 
    id: 'scale', 
    label: '缩放', 
    icon: '⤢', 
    tooltip: '缩放模式 (S)', 
    action: onSetScaleMode 
  },
] : [];
```

#### **按钮激活状态**
当前激活的 TransformControls 模式按钮会高亮显示：

```typescript
const isActiveTransformMode = currentTransformMode && tool.id === currentTransformMode;

<button
  className={`toolbar-btn ${isActiveTransformMode || activeTool === tool.id ? 'active' : ''}`}
>
  // ...
</button>
```

#### **Props 接口**
```typescript
interface ToolbarProps {
  // ... 其他属性
  // TransformControls 模式切换回调
  onSetTranslateMode?: () => void;
  onSetRotateMode?: () => void;
  onSetScaleMode?: () => void;
  currentTransformMode?: 'translate' | 'rotate' | 'scale' | null;
}
```

---

## 📊 支持的属性类型

### **1. 变换属性**
- `position.x` / `position.y` / `position.z` - 位置
- `rotation.x` / `rotation.y` / `rotation.z` - 旋转（角度）
- `scale.x` / `scale.y` / `scale.z` - 缩放

### **2. 图层属性**
- `layers` - 所属图层

### **3. 构件属性**
- `userData.guid` - 构件唯一编码（只读）
- `userData.category` - 构件类型
- `userData.classification` - 构件分类
- `userData.volume` - 体积
- `userData.area` - 面积
- `userData.length` - 长度
- `userData.material` - 材质
- `userData.color` - 颜色
- `userData.manufacturer` - 制造商
- `userData.model` - 型号

### **4. 构件关系**
- `userData.floor` - 所在楼层
- `userData.room` - 所在房间
- `userData.neighbors` - 相邻构件
- `userData.system` - 所属系统
- `userData.systemNumber` - 系统编号
- `userData.constructionPhase` - 施工阶段
- `userData.installOrder` - 安装顺序
- `userData.predecessors` - 前置构件

---

## 🎯 使用示例

### **场景 1：拖拽移动对象**

1. 用户选择 3D 场景中的立方体
2. 按 **G** 键或点击工具栏**“移动”**按钮进入移动模式
3. 拖拽 TransformControls 的 X 轴箭头
4. **实时效果**：
   - 立方体在 X 轴移动
   - 属性面板的“位置 X”数值实时更新
   - 数值精确到小数点后 2 位

### **场景 2：输入精确数值**

1. 用户在属性面板找到"位置 Y"输入框
2. 输入 `5.75`
3. **实时效果**：
   - 立方体立即跳转到 Y=5.75 位置
   - TransformControls 跟随对象移动
   - 场景实时渲染

### **场景 3：旋转对象**

1. 按 **R** 键或点击工具栏**“旋转”**按钮进入旋转模式
2. 拖拽 TransformControls 的绿色圆环（Y 轴）
3. **实时效果**：
   - 立方体绕 Y 轴旋转
   - 属性面板的“旋转 Y”显示角度值（-180° ~ 180°）
   - 弧度自动转换为角度显示

### **场景 4：批量修改属性**

1. 在属性面板修改"体积"为 `2.5`
2. 修改"材质"为 `混凝土`
3. 修改"所在楼层"为 `3F`
4. **实时效果**：
   - 所有属性立即保存到 `object.userData`
   - 数据可用于导出 BIM 信息
   - 不影响 3D 模型的几何变换

---

## 🔧 技术细节

### **1. 状态同步机制**

- 使用 React 的 `useState` 管理 `selectedObject`
- 每次变换时创建新对象引用触发重渲染
- 避免直接修改对象导致的状态不更新

```typescript
// ✅ 正确：创建新引用
setSelectedObject({ ...object });

// ❌ 错误：直接修改不会触发更新
selectedObject.position.x = value;
setSelectedObject(selectedObject);
```

### **2. 精度控制**

- **位置/缩放**：保留 2 位小数 `.toFixed(2)`
- **旋转**：保留 1 位小数（角度），内部存储弧度
- **体积/面积**：保留 2 位小数

### **3. 性能优化**

- 使用 `useRef` 缓存回调函数，避免重复创建
- TransformControls 事件只在拖拽时触发
- 属性面板输入防抖（可选，未实现）

### **4. 类型安全**

```typescript
// 使用类型断言确保轴参数正确
object.position[axis as 'x' | 'y' | 'z'] = value;
```

---

## ⚠️ 注意事项

### **1. 旋转角度转换**

属性面板显示角度（°），Three.js 内部使用弧度（rad）

```typescript
// 显示：角度
value={selectedObject.rotation?.x ? 
  (selectedObject.rotation.x * 180 / Math.PI).toFixed(1) : 0}

// 保存：弧度
onChange={(e) => onPropertyChange('rotation.x', 
  parseFloat(e.target.value) * Math.PI / 180)}
```

### **2. userData 属性**

所有 BIM 相关属性存储在 `userData` 中，不会影响 3D 渲染

```typescript
object.userData = {
  guid: 'xxx-xxx-xxx',
  category: 'Furniture',
  volume: 2.5,
  floor: '3F'
};
```

### **3. 对象引用**

确保传递给 `updateObjectTransform` 的是同一个对象引用

```typescript
// ✅ 正确：使用原始对象引用
canvas3DRef.current.updateObjectTransform(selectedObject, property, value);

// ❌ 错误：使用复制的对象
canvas3DRef.current.updateObjectTransform({...selectedObject}, property, value);
```

---

## 🚀 扩展建议

### **1. 添加撤销/重做**

记录每次属性变更，实现历史栈

```typescript
const [history, setHistory] = useState<HistoryEntry[]>([]);

const handlePropertyChange = (property, value) => {
  // 保存到历史
  setHistory(prev => [...prev, { property, oldValue, newValue: value }]);
  // 执行更改
  // ...
};
```

### **2. 批量编辑**

支持选择多个对象，同时修改属性

```typescript
const [selectedObjects, setSelectedObjects] = useState<THREE.Object3D[]>([]);

const handlePropertyChange = (property, value) => {
  selectedObjects.forEach(obj => {
    canvas3DRef.current.updateObjectTransform(obj, property, value);
  });
};
```

### **3. 属性验证**

添加输入验证和范围限制

```typescript
const handlePropertyChange = (property, value) => {
  // 验证范围
  if (property.startsWith('scale.') && value < 0.01) {
    alert('缩放值不能小于 0.01');
    return;
  }
  // ...
};
```

### **4. 动画过渡**

属性变化时添加平滑动画

```typescript
import { gsap } from 'gsap';

const handlePropertyChange = (property, value) => {
  if (property.startsWith('position.')) {
    const axis = property.split('.')[1];
    gsap.to(selectedObject.position, {
      [axis]: value,
      duration: 0.3,
      ease: 'power2.out'
    });
  }
};
```

---

## ✅ 测试清单

- [ ] 拖拽 TransformControls，属性面板实时更新
- [ ] 在属性面板修改位置，模型实时移动
- [ ] 在属性面板修改旋转，模型实时旋转
- [ ] 在属性面板修改缩放，模型实时缩放
- [ ] 切换 TransformControls 模式（G/R/S）正常工作
- [ ] 修改 userData 属性不影响模型显示
- [ ] 数值精度显示正确（2位小数）
- [ ] 角度/弧度转换正确
- [ ] 快速连续修改不会卡顿
- [ ] 选择/取消选择对象正常

---

## 📝 总结

这个双向绑定系统实现了：

✅ **实时同步** - TransformControls 和属性面板无延迟同步  
✅ **类型安全** - TypeScript 类型检查确保正确性  
✅ **易扩展** - 清晰的接口设计便于添加新属性  
✅ **性能优化** - 避免不必要的重渲染和计算  
✅ **用户友好** - 支持多种输入方式（拖拽/输入）  

现在用户可以自由选择最舒适的方式来编辑 3D 对象属性！🎉
