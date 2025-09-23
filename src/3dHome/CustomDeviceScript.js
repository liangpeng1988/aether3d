// @ts-nocheck
import { ScriptBase, THREE } from '../../dist/engine/aether3d-engine.es.js';

// 自定义设备类
export class CustomDeviceScript extends ScriptBase {
  constructor(name, position, rotation, scale) {
    super();
    this.name = name || "CustomDevice";
    this.position = position || new THREE.Vector3(0, 0, 0);
    this.rotation = rotation || new THREE.Euler(0, 0, 0);
    this.scale = scale || new THREE.Vector3(1, 1, 1);
    
    // 设备状态
    this.isActive = false;
    this.windSpeed = 1.0;
    this.windColor = '#00ff00';
    
    // 设备对象
    this.deviceObject = null;
    this.blade1 = null;
    this.blade2 = null;
    
    // 创建设备模型
    this.createDeviceModel();
  }
  
  // 脚本初始化时调用
  start() {
    console.log(`${this.name} 设备脚本已启动`);
  }
  
  // 创建设备模型
  createDeviceModel() {
    // 创建一个简单的设备模型（圆柱体+锥体组合）
    const group = new THREE.Group();
    
    // 设备主体（圆柱体）
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x333333,
      shininess: 30 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    
    // 设备顶部（锥体）
    const topGeometry = new THREE.ConeGeometry(0.4, 0.6, 16);
    const topMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00aaff,
      shininess: 50 
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 1.1;
    
    // 风效对象（旋转的叶片）
    const bladeGeometry = new THREE.BoxGeometry(0.8, 0.02, 0.1);
    const bladeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffff00,
      shininess: 80 
    });
    const blade1 = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade1.position.y = 0.8;
    
    const blade2 = blade1.clone();
    blade2.rotation.y = Math.PI / 2;
    
    // 将所有部件添加到组中
    group.add(body);
    group.add(top);
    group.add(blade1);
    group.add(blade2);
    
    // 设置位置、旋转和缩放
    group.position.copy(this.position);
    group.rotation.copy(this.rotation);
    group.scale.copy(this.scale);
    
    // 保存设备对象引用
    this.deviceObject = group;
    this.blade1 = blade1;
    this.blade2 = blade2;
    
    return group;
  }
  
  // 获取设备对象
  getDeviceObject() {
    return this.deviceObject;
  }
  
  // 切换设备状态
  toggleDevice() {
    this.isActive = !this.isActive;
    console.log(`${this.name} 设备状态: ${this.isActive ? '开启' : '关闭'}`);
    
    // 更新顶部颜色以表示状态
    if (this.deviceObject) {
      const top = this.deviceObject.children[1]; // 顶部锥体
      top.material = new THREE.MeshPhongMaterial({ 
        color: this.isActive ? 0x00ff00 : 0x00aaff,
        shininess: 50 
      });
    }
  }
  
  // 增加风速
  increaseWindSpeed(increment = 0.5) {
    this.windSpeed = Math.min(5.0, this.windSpeed + increment);
    console.log(`${this.name} 风速: ${this.windSpeed.toFixed(1)}`);
  }
  
  // 减少风速
  decreaseWindSpeed(decrement = 0.5) {
    this.windSpeed = Math.max(0.0, this.windSpeed - decrement);
    console.log(`${this.name} 风速: ${this.windSpeed.toFixed(1)}`);
  }
  
  // 改变风效颜色
  changeWindColor() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    this.windColor = randomColor;
    console.log(`${this.name} 风效颜色: ${this.windColor}`);
    
    // 更新叶片颜色
    if (this.blade1 && this.blade2) {
      this.blade1.material.color.set(randomColor);
      this.blade2.material.color.set(randomColor);
      this.blade1.material.needsUpdate = true;
      this.blade2.material.needsUpdate = true;
    }
  }
  
  // 更新方法（每帧调用）
  update(deltaTime) {
    if (this.isActive && this.deviceObject) {
      // 旋转叶片
      if (this.blade1 && this.blade2) {
        this.blade1.rotation.z += this.windSpeed * deltaTime * 10;
        this.blade2.rotation.z += this.windSpeed * deltaTime * 10;
      }
    }
  }
  
  // 获取设备状态信息
  getStatus() {
    return {
      name: this.name,
      isActive: this.isActive,
      windSpeed: this.windSpeed,
      windColor: this.windColor
    };
  }
}