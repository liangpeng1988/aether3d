import { ScriptBase } from "../../core/ScriptBase";
import { THREE } from "../../core/global";
import { ILine } from "./LineBase";
import { LineFactory, LineType } from "./LineFactory";

/**
 * CAD线条绘制配置接口
 */
export interface CADLineDrawingConfig {
    /** 线条颜色 */
    lineColor?: number | string;
    /** 线条宽度 */
    lineWidth?: number;
    /** 是否启用吸附功能 */
    enableSnap?: boolean;
    /** 吸附距离 */
    snapDistance?: number;
    /** 是否显示坐标提示 */
    showCoordinates?: boolean;
    /** 线条材质类型 */
    materialType?: 'basic' | 'lambert' | 'phong' | 'standard';
}

/**
 * 点坐标接口
 */
export interface Point {
    x: number;
    y: number;
    z: number;
}

/**
 * CAD线条绘制脚本
 * 用于在3D场景中绘制线条，支持交互式绘制
 */
export class CADLineDrawingScript extends ScriptBase {
    name = "CADLineDrawingScript";

    /** 配置参数 */
    private config: Required<CADLineDrawingConfig>;

    /** 当前正在绘制的线条 */
    private currentLine: ILine | null = null;

    /** 当前线条的点 */
    private currentPoints: THREE.Vector3[] = [];

    /** 所有已绘制的线条 */
    private drawnLines: ILine[] = [];

    /** 线条材质 */
    private lineMaterial: THREE.Material | null = null;

    /** 鼠标交互相关 */
    private raycaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    /** 相机引用 */
    private originalCamera: THREE.Camera | null = null;

    /** 预览线 */
    private previewLine: THREE.Line | null = null;

    /** 坐标显示元素 */
    private coordinateDisplay: HTMLElement | null = null;

    /** 是否正在绘制 */
    private isDrawing: boolean = false;

    /** 事件处理函数 */
    private onMouseMoveHandler: (event: MouseEvent) => void;
    private onMouseDownHandler: (event: MouseEvent) => void;
    private onKeyDownHandler: (event: KeyboardEvent) => void;
    private onKeyUpHandler: (event: KeyboardEvent) => void;

    /** 线条绘制完成回调函数 */
    private onLineDrawnCallback: ((lineData: any) => void) | null = null;

    constructor(options?: CADLineDrawingConfig) {
        super();

        // 合并默认配置和用户配置
        this.config = {
            lineColor: 0x00ff00,
            lineWidth: 2,
            enableSnap: true,
            snapDistance: 1.0,
            showCoordinates: true,
            materialType: 'basic',
            ...options
        };

        // 初始化射线投射器和鼠标坐标
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // 绑定事件处理函数
        this.onMouseMoveHandler = this.onMouseMove.bind(this);
        this.onMouseDownHandler = this.onMouseDown.bind(this);
        this.onKeyDownHandler = this.onKeyDown.bind(this);
        this.onKeyUpHandler = this.onKeyUp.bind(this);
    }

    /**
     * 脚本初始化
     */
    public override async start(): Promise<void> {
        super.start?.();

        if (!this.renderer || !this.camera) {
            console.error('[CADLineDrawingScript] 渲染器或相机未初始化');
            return;
        }

        // 保存原始相机
        this.originalCamera = this.camera;

        // 创建线条材质
        this.createLineMaterial();

        // 添加事件监听器
        this.setupEventListeners();

        // 创建坐标显示元素
        if (this.config.showCoordinates) {
            this.createCoordinateDisplay();
        }

        console.log('[CADLineDrawingScript] CAD线条绘制脚本初始化完成');
    }

    /**
     * 创建线条材质
     */
    private createLineMaterial(): void {
        const color = new THREE.Color(this.config.lineColor as number);
        
        switch (this.config.materialType) {
            case 'lambert':
                this.lineMaterial = new THREE.LineBasicMaterial({ 
                    color: color,
                    linewidth: this.config.lineWidth
                });
                break;
            case 'phong':
                this.lineMaterial = new THREE.LineBasicMaterial({ 
                    color: color,
                    linewidth: this.config.lineWidth
                });
                break;
            case 'standard':
                this.lineMaterial = new THREE.LineBasicMaterial({ 
                    color: color,
                    linewidth: this.config.lineWidth
                });
                break;
            case 'basic':
            default:
                this.lineMaterial = new THREE.LineBasicMaterial({ 
                    color: color,
                    linewidth: this.config.lineWidth
                });
                break;
        }
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        if (!this.webGLRenderer) return;

        const canvas = this.webGLRenderer.domElement;
        canvas.addEventListener('mousemove', this.onMouseMoveHandler);
        canvas.addEventListener('mousedown', this.onMouseDownHandler);
        document.addEventListener('keydown', this.onKeyDownHandler);
        document.addEventListener('keyup', this.onKeyUpHandler);
    }

    /**
     * 移除事件监听器
     */
    private removeEventListeners(): void {
        if (!this.webGLRenderer) return;

        const canvas = this.webGLRenderer.domElement;
        canvas.removeEventListener('mousemove', this.onMouseMoveHandler);
        canvas.removeEventListener('mousedown', this.onMouseDownHandler);
        document.removeEventListener('keydown', this.onKeyDownHandler);
        document.removeEventListener('keyup', this.onKeyUpHandler);
    }

    /**
     * 鼠标移动事件处理
     */
    private onMouseMove(event: MouseEvent): void {
        if (!this.isDrawing || !this.camera || !this.webGLRenderer) return;
        
        const position = this.getWorldPositionFromMouse(event);
        if (position) {
            // 更新预览线
            this.updatePreviewLine(position);
            
            // 更新坐标显示
            if (this.coordinateDisplay) {
                this.coordinateDisplay.textContent = `X: ${position.x.toFixed(2)}, Y: ${position.y.toFixed(2)}, Z: ${position.z.toFixed(2)}`;
            }
        }
    }

    /**
     * 鼠标按下事件处理
     */
    private onMouseDown(event: MouseEvent): void {
        if (!this.camera || !this.webGLRenderer) return;
        
        // 只处理左键点击
        if (event.button !== 0) return;
        
        const position = this.getWorldPositionFromMouse(event);
        if (position) {
            if (!this.isDrawing) {
                // 开始绘制
                this.startDrawing(position);
            } else {
                // 添加点到线条
                this.addPointToLine(position);
            }
        }
    }

    /**
     * 键盘按下事件处理
     */
    private onKeyDown(event: KeyboardEvent): void {
        // 按下Enter键完成绘制
        if (event.key === 'Enter' && this.isDrawing) {
            this.finishDrawing();
            return;
        }
        
        // 按下ESC键取消绘制
        if (event.key === 'Escape') {
            this.cancelDrawing();
            return;
        }
        
        // 按下Delete键删除最后一条线
        if (event.key === 'Delete') {
            this.deleteLastLine();
            return;
        }
    }

    /**
     * 键盘抬起事件处理
     */
    private onKeyUp(event: KeyboardEvent): void {
        // 双击完成绘制
        if (event.key === 'Enter' && this.isDrawing) {
            this.finishDrawing();
        }
    }

    /**
     * 从鼠标事件获取世界坐标
     */
    private getWorldPositionFromMouse(event: MouseEvent): THREE.Vector3 | null {
        if (!this.camera || !this.webGLRenderer) return null;
        
        const canvas = this.webGLRenderer.domElement;
        const rect = canvas.getBoundingClientRect();
        
        const mouse = new THREE.Vector2();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // 创建一个平面用于相交检测（XZ平面，Y=0）
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new THREE.Vector3();
        
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            // 强制Y坐标为0，确保所有点都在XZ平面上，不考虑高度信息
            intersection.y = 0;
            
            // 如果启用了吸附功能，进行吸附处理
            if (this.config.enableSnap) {
                // 使用网格吸附替代原来的吸附工具
                return this.snapToGrid(intersection);
            }
            return intersection;
        }
        
        return null;
    }

    /**
     * 吸附到网格
     */
    private snapToGrid(position: THREE.Vector3): THREE.Vector3 {
        const snapDistance = this.config.snapDistance;
        const snapped = position.clone();
        
        snapped.x = Math.round(snapped.x / snapDistance) * snapDistance;
        // 强制Y坐标为0，确保所有点都在XZ平面上
        snapped.y = 0;
        snapped.z = Math.round(snapped.z / snapDistance) * snapDistance;
        
        return snapped;
    }

    /**
     * 开始绘制
     */
    private startDrawing(startPoint: THREE.Vector3): void {
        this.isDrawing = true;
        this.currentPoints = [startPoint.clone()];
        
        // 创建新的线条几何体
        const geometry = new THREE.BufferGeometry().setFromPoints(this.currentPoints);
        
        // 创建线条
        this.currentLine = LineFactory.createLine(LineType.STRAIGHT, {
            points: this.currentPoints,
            name: `CADLine_${Date.now()}`
        });
        
        // 应用材质
        if (this.lineMaterial) {
            // 注意：这里需要根据具体实现调整
        }
        
        // 添加到场景
        const lineObject = new THREE.Line(
            this.currentLine.getGeometry(), 
            this.currentLine.getMaterial()
        );
        lineObject.name = this.currentLine.getName();
        this.addObject(lineObject);
        
        console.log('[CADLineDrawingScript] 开始绘制线条');
    }

    /**
     * 更新预览线
     */
    private updatePreviewLine(endPoint: THREE.Vector3): void {
        if (!this.currentLine || this.currentPoints.length === 0) return;
        
        // 移除旧的预览线
        if (this.previewLine) {
            this.removeObject(this.previewLine);
            this.previewLine = null;
        }
        
        // 创建预览线几何体
        const points = [...this.currentPoints, endPoint.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // 创建预览线
        this.previewLine = new THREE.Line(geometry, this.lineMaterial!.clone());
        (this.previewLine.material as THREE.Material).opacity = 0.5;
        (this.previewLine.material as THREE.Material).transparent = true;
        this.previewLine.name = 'PreviewLine';
        this.addObject(this.previewLine);
    }

    /**
     * 添加点到线条
     */
    private addPointToLine(point: THREE.Vector3): void {
        if (!this.currentLine) return;
        
        // 添加点到数组
        this.currentPoints.push(point.clone());
        
        // 更新几何体
        const geometry = new THREE.BufferGeometry().setFromPoints(this.currentPoints);
        // 这里需要根据具体实现调整
        
        // 移除预览线
        if (this.previewLine) {
            this.removeObject(this.previewLine);
            this.previewLine = null;
        }
    }

    /**
     * 完成绘制
     */
    private finishDrawing(): void {
        if (!this.isDrawing || !this.currentLine) return;
        
        // 如果只有一个点，不保存线条
        if (this.currentPoints.length < 2) {
            this.cancelDrawing();
            return;
        }
        
        // 保存线条到已绘制列表
        this.drawnLines.push(this.currentLine);
        
        // 触发线条绘制完成事件，传递线条数据
        const lineData = {
            id: this.currentLine.getName(),
            points: this.currentPoints.map(point => ({
                x: point.x,
                y: point.y,
                z: point.z
            })),
            // 其他线条属性可以根据需要添加
        };
        
        // 如果有设置回调函数，调用它
        if (this.onLineDrawnCallback) {
            this.onLineDrawnCallback(lineData);
        }
        
        // 重置状态
        this.isDrawing = false;
        this.currentLine = null;
        this.currentPoints = [];
        
        // 移除预览线
        if (this.previewLine) {
            this.removeObject(this.previewLine);
            this.previewLine = null;
        }
        
        console.log('[CADLineDrawingScript] 线条绘制完成');
    }

    /**
     * 取消绘制
     */
    private cancelDrawing(): void {
        if (!this.isDrawing) return;
        
        // 移除当前线条
        if (this.currentLine) {
            // 这里需要根据具体实现调整
            this.currentLine = null;
        }
        
        // 移除预览线
        if (this.previewLine) {
            this.removeObject(this.previewLine);
            this.previewLine = null;
        }
        
        // 重置状态
        this.isDrawing = false;
        this.currentPoints = [];
        
        console.log('[CADLineDrawingScript] 绘制已取消');
    }

    /**
     * 删除最后一条线
     */
    private deleteLastLine(): void {
        if (this.drawnLines.length === 0) return;
        
        const lastLine = this.drawnLines.pop();
        if (lastLine) {
            // 这里需要根据具体实现调整
            lastLine.dispose();
            console.log('[CADLineDrawingScript] 删除了最后一条线');
        }
    }

    /**
     * 清除所有线条
     */
    public clearAllLines(): void {
        // 删除所有已绘制的线条
        for (const line of this.drawnLines) {
            // 这里需要根据具体实现调整
            line.dispose();
        }
        this.drawnLines = [];
        
        // 取消当前绘制
        this.cancelDrawing();
        
        console.log('[CADLineDrawingScript] 所有线条已清除');
    }

    /**
     * 创建坐标显示元素
     */
    private createCoordinateDisplay(): void {
        if (!this.webGLRenderer) return;
        
        this.coordinateDisplay = document.createElement('div');
        this.coordinateDisplay.style.position = 'absolute';
        this.coordinateDisplay.style.top = '10px';
        this.coordinateDisplay.style.left = '10px';
        this.coordinateDisplay.style.background = 'rgba(0, 0, 0, 0.7)';
        this.coordinateDisplay.style.color = 'white';
        this.coordinateDisplay.style.padding = '5px 10px';
        this.coordinateDisplay.style.borderRadius = '4px';
        this.coordinateDisplay.style.fontFamily = 'monospace';
        this.coordinateDisplay.style.fontSize = '12px';
        this.coordinateDisplay.style.zIndex = '1000';
        this.coordinateDisplay.textContent = 'X: 0.00, Y: 0.00, Z: 0.00';
        
        this.webGLRenderer.domElement.parentElement?.appendChild(this.coordinateDisplay);
    }

    /**
     * 设置线条颜色
     */
    public setLineColor(color: number | string): void {
        this.config.lineColor = color;
        this.createLineMaterial();
        
        // 更新现有线条的颜色
        for (const line of this.drawnLines) {
            // 这里需要根据具体实现调整
        }
    }

    /**
     * 设置线条宽度
     */
    public setLineWidth(width: number): void {
        this.config.lineWidth = width;
        this.createLineMaterial();
    }

    /**
     * 启用/禁用吸附功能
     */
    public setSnapEnabled(enabled: boolean): void {
        this.config.enableSnap = enabled;
    }

    /**
     * 设置吸附距离
     */
    public setSnapDistance(distance: number): void {
        this.config.snapDistance = distance;
    }

    /**
     * 设置吸附配置
     */
    public setSnapConfig(config: any): void {
        // 移除吸附配置设置
        console.warn('[CADLineDrawingScript] 吸附配置已移除');
    }

    /**
     * 设置线条绘制完成回调函数
     * @param callback 回调函数
     */
    public setOnLineDrawnCallback(callback: (lineData: any) => void): void {
        this.onLineDrawnCallback = callback;
    }

    /**
     * 脚本销毁
     */
    public override destroy(): void {
        super.destroy?.();
        
        // 切换回原始相机
        if (this.originalCamera && this.renderer) {
            (this.renderer as any).camera = this.originalCamera;
        }
        
        // 移除事件监听器
        this.removeEventListeners();
        
        // 移除坐标显示
        if (this.coordinateDisplay) {
            this.coordinateDisplay.remove();
            this.coordinateDisplay = null;
        }
        
        console.log('[CADLineDrawingScript] CAD线条绘制脚本已销毁');
    }
}