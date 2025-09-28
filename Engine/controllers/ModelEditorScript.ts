import { ScriptBase } from "../core/ScriptBase";
import { THREE } from "../core/global";
// 导入TransformControls
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

/**
 * 模型编辑配置接口
 */
export interface ModelEditorConfig {
    /** 是否启用选择功能 */
    enableSelection?: boolean;
    /** 是否启用移动功能 */
    enableMove?: boolean;
    /** 是否启用旋转功能 */
    enableRotate?: boolean;
    /** 是否启用缩放功能 */
    enableScale?: boolean;
    /** 选择颜色 */
    selectionColor?: number | string;
    /** 是否显示坐标轴 */
    showAxes?: boolean;
    /** 是否启用网格吸附 */
    enableGridSnap?: boolean;
    /** 网格大小 */
    gridSize?: number;
}

/**
 * 变换类型枚举
 */
export enum TransformMode {
    MOVE = 'move',
    ROTATE = 'rotate',
    SCALE = 'scale'
}

/**
 * 模型编辑脚本
 * 用于在3D场景中选择和编辑模型
 */
export class ModelEditorScript extends ScriptBase {
    name = "ModelEditorScript";

    /** 配置参数 */
    private config: Required<ModelEditorConfig>;

    /** 当前选中的对象 */
    private selectedObject: THREE.Object3D | null = null;

    /** 变换控制器 */
    private transformControls: any | null = null;

    /** 选择框辅助线 */
    private selectionBox: THREE.Box3Helper | null = null;

    /** 坐标轴辅助线 */
    private axesHelper: THREE.AxesHelper | null = null;

    /** 鼠标交互相关 */
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    /** 当前变换模式 */
    private currentMode: TransformMode = TransformMode.MOVE;

    /** 事件处理函数 */
    private onMouseDownHandler: (event: MouseEvent) => void;
    private onKeyDownHandler: (event: KeyboardEvent) => void;

    constructor(options?: ModelEditorConfig) {
        super();

        // 合并默认配置和用户配置
        this.config = {
            enableSelection: true,
            enableMove: true,
            enableRotate: true,
            enableScale: true,
            selectionColor: 0xff0000,
            showAxes: true,
            enableGridSnap: true,
            gridSize: 1,
            ...options
        };

        // 初始化射线投射器和鼠标坐标
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 绑定事件处理函数
        this.onMouseDownHandler = this.onMouseDown.bind(this);
        this.onKeyDownHandler = this.onKeyDown.bind(this);
    }

    /**
     * 脚本初始化
     */
    public override async start(): Promise<void> {
        super.start?.();

        // 添加事件监听器
        this.setupEventListeners();

        // 创建坐标轴辅助线
        if (this.config.showAxes) {
            this.createAxesHelper();
        }

        // 创建变换控制器
        this.createTransformControls();

        console.log('[ModelEditorScript] 模型编辑脚本初始化完成');
    }

    /**
     * 创建坐标轴辅助线
     */
    private createAxesHelper(): void {
        this.axesHelper = new THREE.AxesHelper(5);
        this.addObject(this.axesHelper);
    }

    /**
     * 创建变换控制器
     */
    private createTransformControls(): void {
        if (!this.camera || !this.webGLRenderer) return;
        
        // 创建TransformControls实例
        this.transformControls = new TransformControls(this.camera, this.webGLRenderer.domElement);
        this.transformControls.setSize(0.75);
        this.transformControls.setMode('translate'); // 默认为移动模式
        
        // 设置变换控制器的事件监听
        this.transformControls.addEventListener('dragging-changed', (event: any) => {
          // 当开始或结束拖拽时，禁用或启用轨道控制器
          // 遍历所有脚本查找OrbitControlsScript
          if (this.renderer) {
            const scripts = (this.renderer as any).scripts || [];
            for (const script of scripts) {
              if (script.name === 'OrbitControlsScript') {
                (script as any)._enabled = !event.value;
                break;
              }
            }
          }
        });
        
        // 将变换控制器添加到场景中
        this.addObject(this.transformControls);
        
        console.log('[ModelEditorScript] 变换控制器已创建');
    }

    /**
     * 移除事件监听器
     */
    private removeEventListeners(): void {
        if (!this.webGLRenderer) return;

        const canvas = this.webGLRenderer.domElement;
        canvas.removeEventListener('mousedown', this.onMouseDownHandler);
        document.removeEventListener('keydown', this.onKeyDownHandler);
        
        // 移除变换控制器的事件监听
        if (this.transformControls) {
          // 注意：这里需要传递原始的事件处理函数来正确移除监听器
          this.transformControls.removeEventListener('change', this.onTransformChange.bind(this));
          this.transformControls.removeEventListener('dragging-changed', this.onDraggingChanged.bind(this));
        }
    }

    /**
     * 变换控制器变化事件处理
     */
    private onTransformChange(): void {
      // 更新选择框
      if (this.selectedObject && this.selectionBox) {
        const box = new THREE.Box3().setFromObject(this.selectedObject);
        this.selectionBox.box.copy(box);
      }
    }

    /**
     * 拖拽状态改变事件处理
     */
    private onDraggingChanged(event: any): void {
      // 当开始或结束拖拽时，禁用或启用轨道控制器
      // 遍历所有脚本查找OrbitControlsScript
      if (this.renderer) {
        const scripts = (this.renderer as any).scripts || [];
        for (const script of scripts) {
          if (script.name === 'OrbitControlsScript') {
            (script as any)._enabled = !event.value;
            break;
          }
        }
      }
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        if (!this.webGLRenderer) return;

        const canvas = this.webGLRenderer.domElement;
        canvas.addEventListener('mousedown', this.onMouseDownHandler);
        document.addEventListener('keydown', this.onKeyDownHandler);
        
        // 添加变换控制器的事件监听
        if (this.transformControls) {
          this.transformControls.addEventListener('change', this.onTransformChange.bind(this));
          this.transformControls.addEventListener('dragging-changed', this.onDraggingChanged.bind(this));
        }
    }

    /**
     * 鼠标按下事件处理
     */
    private onMouseDown(event: MouseEvent): void {
        if (!this.config.enableSelection || !this.camera || !this.webGLRenderer) return;

        // 计算鼠标位置
        const canvas = this.webGLRenderer.domElement;
        const rect = canvas.getBoundingClientRect();
        
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // 射线投射检测
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // 获取场景中的所有对象（除了辅助对象）
        const objects = this.scene.children.filter(obj => 
            obj !== this.axesHelper && obj !== this.selectionBox
        );
        
        const intersects = this.raycaster.intersectObjects(objects, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.selectObject(object);
        } else {
            this.deselectObject();
        }
    }

    /**
     * 键盘按下事件处理
     */
    private onKeyDown(event: KeyboardEvent): void {
        // 按下Delete键删除选中对象
        if (event.key === 'Delete' && this.selectedObject) {
            this.deleteSelectedObject();
            return;
        }

        // 按下Esc键取消选择
        if (event.key === 'Escape') {
            this.deselectObject();
            return;
        }

        // 按下G键切换到移动模式
        if (event.key === 'g' || event.key === 'G') {
            this.setTransformMode(TransformMode.MOVE);
            return;
        }

        // 按下R键切换到旋转模式
        if (event.key === 'r' || event.key === 'R') {
            this.setTransformMode(TransformMode.ROTATE);
            return;
        }

        // 按下S键切换到缩放模式
        if (event.key === 's' || event.key === 'S') {
            this.setTransformMode(TransformMode.SCALE);
            return;
        }
    }

    /**
     * 选择对象
     */
    private selectObject(object: THREE.Object3D): void {
        // 取消之前的选择
        this.deselectObject();

        this.selectedObject = object;

        // 添加选择框辅助线
        const box = new THREE.Box3().setFromObject(object);
        this.selectionBox = new THREE.Box3Helper(box, new THREE.Color(this.config.selectionColor as number));
        this.addObject(this.selectionBox);

        // 如果启用了变换控制器，将其附加到选中对象
        if (this.transformControls) {
          this.transformControls.attach(object);
        }

        console.log(`[ModelEditorScript] 选中对象: ${object.name}`);
    }

    /**
     * 取消选择对象
     */
    private deselectObject(): void {
        if (this.selectedObject) {
            // 移除选择框辅助线
            if (this.selectionBox) {
                this.removeObject(this.selectionBox);
                this.selectionBox = null;
            }

            // 如果启用了变换控制器，将其分离
            if (this.transformControls) {
                this.transformControls.detach();
            }

            this.selectedObject = null;
            console.log('[ModelEditorScript] 取消选择');
        }
    }

    /**
     * 删除选中对象
     */
    private deleteSelectedObject(): void {
        if (this.selectedObject) {
            const objectName = this.selectedObject.name;
            this.scene.remove(this.selectedObject);
            this.deselectObject();
            console.log(`[ModelEditorScript] 删除对象: ${objectName}`);
        }
    }

    /**
     * 设置变换模式
     */
    public setTransformMode(mode: TransformMode): void {
        if (!this.config.enableMove && mode === TransformMode.MOVE) return;
        if (!this.config.enableRotate && mode === TransformMode.ROTATE) return;
        if (!this.config.enableScale && mode === TransformMode.SCALE) return;

        this.currentMode = mode;

        // 更新变换控制器模式
        if (this.transformControls) {
          switch (mode) {
            case TransformMode.MOVE:
              this.transformControls.setMode('translate');
              break;
            case TransformMode.ROTATE:
              this.transformControls.setMode('rotate');
              break;
            case TransformMode.SCALE:
              this.transformControls.setMode('scale');
              break;
          }
        }

        console.log(`[ModelEditorScript] 变换模式设置为: ${mode}`);
    }

    /**
     * 移动选中对象
     */
    public moveSelectedObject(delta: THREE.Vector3): void {
        if (this.selectedObject && this.config.enableMove) {
            // 如果启用了网格吸附，对位置进行取整
            if (this.config.enableGridSnap) {
                this.selectedObject.position.x += Math.round(delta.x / this.config.gridSize) * this.config.gridSize;
                this.selectedObject.position.y += Math.round(delta.y / this.config.gridSize) * this.config.gridSize;
                this.selectedObject.position.z += Math.round(delta.z / this.config.gridSize) * this.config.gridSize;
            } else {
                this.selectedObject.position.add(delta);
            }

            // 更新选择框
            if (this.selectionBox) {
                const box = new THREE.Box3().setFromObject(this.selectedObject);
                this.selectionBox.box.copy(box);
            }

            console.log(`[ModelEditorScript] 移动对象到: ${this.selectedObject.position.x}, ${this.selectedObject.position.y}, ${this.selectedObject.position.z}`);
        }
    }

    /**
     * 旋转选中对象
     */
    public rotateSelectedObject(delta: THREE.Euler): void {
        if (this.selectedObject && this.config.enableRotate) {
            this.selectedObject.rotation.x += delta.x;
            this.selectedObject.rotation.y += delta.y;
            this.selectedObject.rotation.z += delta.z;

            console.log(`[ModelEditorScript] 旋转对象到: ${this.selectedObject.rotation.x}, ${this.selectedObject.rotation.y}, ${this.selectedObject.rotation.z}`);
        }
    }

    /**
     * 缩放选中对象
     */
    public scaleSelectedObject(delta: THREE.Vector3): void {
        if (this.selectedObject && this.config.enableScale) {
            this.selectedObject.scale.x += delta.x;
            this.selectedObject.scale.y += delta.y;
            this.selectedObject.scale.z += delta.z;

            // 确保缩放值不为负数
            this.selectedObject.scale.x = Math.max(0.01, this.selectedObject.scale.x);
            this.selectedObject.scale.y = Math.max(0.01, this.selectedObject.scale.y);
            this.selectedObject.scale.z = Math.max(0.01, this.selectedObject.scale.z);

            // 更新选择框
            if (this.selectionBox) {
                const box = new THREE.Box3().setFromObject(this.selectedObject);
                this.selectionBox.box.copy(box);
            }

            console.log(`[ModelEditorScript] 缩放对象到: ${this.selectedObject.scale.x}, ${this.selectedObject.scale.y}, ${this.selectedObject.scale.z}`);
        }
    }

    /**
     * 复制选中对象
     */
    public copySelectedObject(): THREE.Object3D | null {
        if (this.selectedObject) {
            // 创建选中对象的克隆
            const clonedObject = this.selectedObject.clone();
            clonedObject.position.x += 2; // 稍微偏移位置以区分原对象
            clonedObject.name = `${this.selectedObject.name}_copy`;
            
            // 添加到场景中
            this.addObject(clonedObject);
            
            console.log(`[ModelEditorScript] 复制对象: ${clonedObject.name}`);
            return clonedObject;
        }
        return null;
    }

    /**
     * 获取选中对象
     */
    public getSelectedObject(): THREE.Object3D | null {
        return this.selectedObject;
    }

    /**
     * 获取当前变换模式
     */
    public getCurrentMode(): TransformMode {
        return this.currentMode;
    }

    /**
     * 更新配置
     */
    public updateConfig(newConfig: Partial<ModelEditorConfig>): void {
        Object.assign(this.config, newConfig);
        
        // 如果坐标轴显示设置改变
        if (newConfig.showAxes !== undefined) {
            if (newConfig.showAxes && !this.axesHelper) {
                this.createAxesHelper();
            } else if (!newConfig.showAxes && this.axesHelper) {
                this.removeObject(this.axesHelper);
                this.axesHelper = null;
            }
        }
    }

    /**
     * 脚本销毁
     */
    public override destroy(): void {
        super.destroy?.();

        // 移除事件监听器
        this.removeEventListeners();

        // 移除辅助对象
        if (this.axesHelper) {
            this.removeObject(this.axesHelper);
        }

        if (this.selectionBox) {
            this.removeObject(this.selectionBox);
        }

        // 销毁变换控制器
        if (this.transformControls) {
            this.transformControls.dispose();
        }

        console.log('[ModelEditorScript] 模型编辑脚本已销毁');
    }
}