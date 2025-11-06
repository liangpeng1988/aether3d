import * as THREE from 'three';

/**
 * 命令接口 - 所有可撤销操作都需要实现这个接口
 */
export interface ICommand {
  /** 命令名称，用于调试 */
  name: string;
  /** 执行命令 */
  execute(): void;
  /** 撤销命令 */
  undo(): void;
  /** 重做命令 */
  redo(): void;
}

/**
 * 对象变换命令 - 处理位置、旋转、缩放变化
 */
export class TransformCommand implements ICommand {
  name = 'Transform';
  
  private object: THREE.Object3D;
  private oldPosition: THREE.Vector3;
  private newPosition: THREE.Vector3;
  private oldRotation: THREE.Euler;
  private newRotation: THREE.Euler;
  private oldScale: THREE.Vector3;
  private newScale: THREE.Vector3;
  
  constructor(
    object: THREE.Object3D,
    oldTransform: { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 },
    newTransform: { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }
  ) {
    this.object = object;
    this.oldPosition = oldTransform.position.clone();
    this.oldRotation = oldTransform.rotation.clone();
    this.oldScale = oldTransform.scale.clone();
    this.newPosition = newTransform.position.clone();
    this.newRotation = newTransform.rotation.clone();
    this.newScale = newTransform.scale.clone();
  }
  
  execute(): void {
    this.object.position.copy(this.newPosition);
    this.object.rotation.copy(this.newRotation);
    this.object.scale.copy(this.newScale);
  }
  
  undo(): void {
    this.object.position.copy(this.oldPosition);
    this.object.rotation.copy(this.oldRotation);
    this.object.scale.copy(this.oldScale);
  }
  
  redo(): void {
    this.execute();
  }
}

/**
 * 批量对象变换命令 - 处理多个对象的变换（如框选后移动）
 */
export class BatchTransformCommand implements ICommand {
  name = 'BatchTransform';
  
  private commands: TransformCommand[];
  
  constructor(commands: TransformCommand[]) {
    this.commands = commands;
  }
  
  execute(): void {
    this.commands.forEach(cmd => cmd.execute());
  }
  
  undo(): void {
    // 反向撤销，保持操作的一致性
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
  
  redo(): void {
    this.execute();
  }
}

/**
 * 添加对象命令
 */
export class AddObjectCommand implements ICommand {
  name = 'AddObject';
  
  private scene: THREE.Scene;
  private object: THREE.Object3D;
  
  constructor(scene: THREE.Scene, object: THREE.Object3D) {
    this.scene = scene;
    this.object = object;
  }
  
  execute(): void {
    this.scene.add(this.object);
  }
  
  undo(): void {
    this.scene.remove(this.object);
  }
  
  redo(): void {
    this.execute();
  }
}

/**
 * 批量添加对象命令
 */
export class BatchAddObjectCommand implements ICommand {
  name = 'BatchAddObject';
  
  private commands: AddObjectCommand[];
  
  constructor(commands: AddObjectCommand[]) {
    this.commands = commands;
  }
  
  execute(): void {
    this.commands.forEach(cmd => cmd.execute());
  }
  
  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
  
  redo(): void {
    this.execute();
  }
}

/**
 * 删除对象命令
 */
export class RemoveObjectCommand implements ICommand {
  name = 'RemoveObject';
  
  private scene: THREE.Scene;
  private object: THREE.Object3D;
  private parent: THREE.Object3D | null = null;
  
  constructor(scene: THREE.Scene, object: THREE.Object3D) {
    this.scene = scene;
    this.object = object;
    this.parent = object.parent;
  }
  
  execute(): void {
    if (this.parent) {
      this.parent.remove(this.object);
    } else {
      this.scene.remove(this.object);
    }
  }
  
  undo(): void {
    if (this.parent) {
      this.parent.add(this.object);
    } else {
      this.scene.add(this.object);
    }
  }
  
  redo(): void {
    this.execute();
  }
}

/**
 * 批量删除对象命令
 */
export class BatchRemoveObjectCommand implements ICommand {
  name = 'BatchRemoveObject';
  
  private commands: RemoveObjectCommand[];
  
  constructor(commands: RemoveObjectCommand[]) {
    this.commands = commands;
  }
  
  execute(): void {
    this.commands.forEach(cmd => cmd.execute());
  }
  
  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
  
  redo(): void {
    this.execute();
  }
}

/**
 * 属性修改命令
 */
export class PropertyChangeCommand implements ICommand {
  name = 'PropertyChange';
  
  private object: THREE.Object3D;
  private property: string;
  private oldValue: any;
  private newValue: any;
  
  constructor(object: THREE.Object3D, property: string, oldValue: any, newValue: any) {
    this.object = object;
    this.property = property;
    this.oldValue = oldValue;
    this.newValue = newValue;
  }
  
  execute(): void {
    this.setProperty(this.newValue);
  }
  
  undo(): void {
    this.setProperty(this.oldValue);
  }
  
  redo(): void {
    this.execute();
  }
  
  private setProperty(value: any): void {
    const parts = this.property.split('.');
    let current: any = this.object;
    
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }
}

/**
 * 可见性切换命令
 */
export class VisibilityCommand implements ICommand {
  name = 'Visibility';
  
  private objects: THREE.Object3D[];
  private oldVisibility: boolean[];
  private newVisibility: boolean[];
  
  constructor(objects: THREE.Object3D[], newVisibility: boolean[]) {
    this.objects = objects;
    this.oldVisibility = objects.map(obj => obj.visible);
    this.newVisibility = newVisibility;
  }
  
  execute(): void {
    this.objects.forEach((obj, i) => {
      obj.visible = this.newVisibility[i];
    });
  }
  
  undo(): void {
    this.objects.forEach((obj, i) => {
      obj.visible = this.oldVisibility[i];
    });
  }
  
  redo(): void {
    this.execute();
  }
}

/**
 * 对象选择命令
 */
export class ObjectSelectionCommand implements ICommand {
  name = 'ObjectSelection';
  
  private object: THREE.Object3D | null;
  private onSelect: (object: THREE.Object3D | null) => void;
  
  constructor(object: THREE.Object3D | null, onSelect: (object: THREE.Object3D | null) => void) {
    this.object = object;
    this.onSelect = onSelect;
  }
  
  execute(): void {
    this.onSelect(this.object);
  }
  
  undo(): void {
    this.onSelect(null);
  }
  
  redo(): void {
    this.execute();
  }
}

/**
 * 复制对象命令
 */
export class CopyObjectCommand implements ICommand {
  name = 'CopyObject';
  
  private originalObject: THREE.Object3D;
  private copiedObject: THREE.Object3D;
  private scene: THREE.Scene;
  private onCopy: (object: THREE.Object3D | null) => void;
  
  constructor(
    originalObject: THREE.Object3D,
    scene: THREE.Scene,
    onCopy: (object: THREE.Object3D | null) => void
  ) {
    this.originalObject = originalObject;
    this.scene = scene;
    this.onCopy = onCopy;
    // 创建复制的对象
    this.copiedObject = originalObject.clone();
    // 给复制的对象一个稍微偏移的位置，以便区分
    this.copiedObject.position.x += 1;
    this.copiedObject.position.y += 1;
  }
  
  execute(): void {
    this.scene.add(this.copiedObject);
    this.onCopy(this.copiedObject);
  }
  
  undo(): void {
    this.scene.remove(this.copiedObject);
    this.onCopy(null);
  }
  
  redo(): void {
    this.execute();
  }
}

/**
 * 剪切对象命令
 */
export class CutObjectCommand implements ICommand {
  name = 'CutObject';
  
  private object: THREE.Object3D;
  private parent: THREE.Object3D | null = null;
  private scene: THREE.Scene;
  private onCut: (object: THREE.Object3D | null) => void;
  private copiedObject: THREE.Object3D;
  
  constructor(
    object: THREE.Object3D,
    scene: THREE.Scene,
    onCut: (object: THREE.Object3D | null) => void
  ) {
    this.object = object;
    this.parent = object.parent;
    this.scene = scene;
    this.onCut = onCut;
    // 创建复制的对象用于粘贴
    this.copiedObject = object.clone();
  }
  
  execute(): void {
    // 移除原对象
    if (this.parent) {
      this.parent.remove(this.object);
    } else {
      this.scene.remove(this.object);
    }
    this.onCut(this.copiedObject);
  }
  
  undo(): void {
    // 恢复原对象
    if (this.parent) {
      this.parent.add(this.object);
    } else {
      this.scene.add(this.object);
    }
    this.onCut(null);
  }
  
  redo(): void {
    this.execute();
  }
}

/**
 * 粘贴对象命令
 */
export class PasteObjectCommand implements ICommand {
  name = 'PasteObject';
  
  private copiedObject: THREE.Object3D;
  private scene: THREE.Scene;
  private onPaste: (object: THREE.Object3D | null) => void;
  private pastedObject: THREE.Object3D;
  
  constructor(
    copiedObject: THREE.Object3D,
    scene: THREE.Scene,
    onPaste: (object: THREE.Object3D | null) => void
  ) {
    this.copiedObject = copiedObject;
    this.scene = scene;
    this.onPaste = onPaste;
    // 创建粘贴的对象
    this.pastedObject = copiedObject.clone();
    // 给粘贴的对象一个稍微偏移的位置，以便区分
    this.pastedObject.position.x += 1;
    this.pastedObject.position.z += 1;
  }
  
  execute(): void {
    this.scene.add(this.pastedObject);
    this.onPaste(this.pastedObject);
  }
  
  undo(): void {
    this.scene.remove(this.pastedObject);
    this.onPaste(null);
  }
  
  redo(): void {
    this.execute();
  }
}

/**
 * 历史管理器 - 管理所有可撤销/重做的命令
 */
export class HistoryManager {
  private history: ICommand[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 50; // 最大历史记录数
  
  /**
   * 执行命令并添加到历史记录
   */
  execute(command: ICommand): void {
    // 执行命令
    command.execute();
    
    // 如果当前不在历史末尾，删除后面的记录
    if (this.currentIndex < this.history.length - 1) {
      this.history.splice(this.currentIndex + 1);
    }
    
    // 添加新命令
    this.history.push(command);
    this.currentIndex++;
    
    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
    
    console.log(`[History] 执行命令: ${command.name}, 当前索引: ${this.currentIndex}`);
  }
  
  /**
   * 撤销
   */
  undo(): boolean {
    if (!this.canUndo()) {
      console.log('[History] 无法撤销：已到达历史起点');
      return false;
    }
    
    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;
    
    console.log(`[History] 撤销命令: ${command.name}, 当前索引: ${this.currentIndex}`);
    return true;
  }
  
  /**
   * 重做
   */
  redo(): boolean {
    if (!this.canRedo()) {
      console.log('[History] 无法重做：已到达历史末尾');
      return false;
    }
    
    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.redo();
    
    console.log(`[History] 重做命令: ${command.name}, 当前索引: ${this.currentIndex}`);
    return true;
  }
  
  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }
  
  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }
  
  /**
   * 清空历史记录
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    console.log('[History] 历史记录已清空');
  }
  
  /**
   * 获取历史记录信息
   */
  getHistoryInfo(): { total: number; current: number; canUndo: boolean; canRedo: boolean } {
    return {
      total: this.history.length,
      current: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }
  
  /**
   * 设置最大历史记录数
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
  }
}

// 创建全局历史管理器实例
export const globalHistoryManager = new HistoryManager();
