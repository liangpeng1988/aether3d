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

    /** 坐标提示元素 */
    private coordinateDisplay: HTMLElement | null = null;

    /** 鼠标位置 */
    private mousePosition: THREE.Vector3 = new THREE.Vector3();

    /** 是否正在绘制 */
    private isDrawing = false;

    /** 临时线条用于预览 */
    private previewLine: THREE.Line | null = null;

    /** 正交相机 */
    private orthographicCamera: THREE.OrthographicCamera | null = null;
    
    /** 原始相机的引用 */
    private originalCamera: THREE.PerspectiveCamera | null = null;

    constructor(options?: CADLineDrawingConfig) {
        super();

        // 合并默认配置和用户配置
        this.config = {
            lineColor: 0x00ff00,
            lineWidth: 2,
            enableSnap: true,
            snapDistance: 0.5,
            showCoordinates: true,
            materialType: 'basic',
            ...options
        };

        // 创建线条材质
        this.createLineMaterial();
    }

    /**
     * 创建线条材质
     */
    private createLineMaterial(): void {
        const color = new THREE.Color(this.config.lineColor);
        
        switch (this.config.materialType) {
            case 'lambert':
                this.lineMaterial = new THREE.MeshLambertMaterial({ color });
                break;
            case 'phong':
                this.lineMaterial = new THREE.MeshPhongMaterial({ color });
                break;
            case 'standard':
                this.lineMaterial = new THREE.MeshStandardMaterial({ color });
                break;
            case 'basic':
            default:
                this.lineMaterial = new THREE.LineBasicMaterial({ 
                    color,
                    linewidth: this.config.lineWidth
                });
                break;
        }
    }

    /**
     * 脚本初始化
     */
    public override async start(): Promise<void> {
        super.start?.();
        
        // // 检查是否已存在GridHelper，如果不存在则创建
        // let gridHelper = this.scene.getObjectByName('GridHelper');
        // if (!gridHelper) {
        //     // 创建网格辅助线
        //     gridHelper = new THREE.GridHelper(30, 30, 0x888888, 0x444444);
        //     gridHelper.name = 'GridHelper'; // 设置名称以便识别
        //     gridHelper.userData = { keepInCADMode: true }; // 标记为需要保留的对象
        //     this.scene.add(gridHelper);
        // }
        
        // // 确保GridHelper位于XZ平面上
        // gridHelper.position.set(0, 0, 0);
        // gridHelper.rotation.x = Math.PI / 2; // 旋转90度使其位于XZ平面
        
        // 创建并切换到正交相机
        this.setupOrthographicCamera();
        
        // 清除场景中的3D模型
        this.clearSceneModels();
        
        // 创建坐标显示元素
        if (this.config.showCoordinates) {
            this.createCoordinateDisplay();
        }

        // 添加事件监听器
        this.setupEventListeners();

        console.log('[CADLineDrawingScript] 初始化完成');
    }

    /**
     * 清除场景中的3D模型（保留辅助对象）
     */
    private clearSceneModels(): void {
        if (!this.scene) return;
        
        // 收集需要移除的对象
        const objectsToRemove: THREE.Object3D[] = [];
        
        this.scene.traverse((object) => {
            // 保留辅助对象（网格、坐标轴等）
            if (object.name === 'GridHelper' || 
                object.name === 'AxesHelper' || 
                object.name.startsWith('CADLine_') ||
                object.name === 'PreviewLine' ||
                object.name === 'DrawingPlane') {
                return;
            }
            
            // 保留我们自己创建的对象
            if (object.userData && object.userData.keepInCADMode) {
                return;
            }
            
            // 标记其他对象以移除
            if (object.parent) {
                objectsToRemove.push(object);
            }
        });
        
        // 移除标记的对象
        for (const object of objectsToRemove) {
            this.scene.remove(object);
        }
        
        console.log('[CADLineDrawingScript] 场景中的3D模型已清除');
    }

    /**
     * 设置正交相机
     */
    private setupOrthographicCamera(): void {
        if (!this.webGLRenderer || !this.renderer) return;
        
        // 保存原始相机
        this.originalCamera = this.renderer.camera as THREE.PerspectiveCamera;
        
        // 获取渲染器尺寸
        const width = this.webGLRenderer.domElement.width;
        const height = this.webGLRenderer.domElement.height;
        
        // 设置视锥体大小
        const frustumSize = 20;
        const aspect = width / height;
        
        // 创建正交相机
        this.orthographicCamera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / -2,
            0.1,
            1000
        );
        
        // 设置相机位置到顶视图，正对XZ平面
        this.orthographicCamera.position.set(0, 10, 0); // 从Y轴正方向看向XZ平面
        this.orthographicCamera.lookAt(0, 0, 0);
        this.orthographicCamera.up.set(0, 0, -1); // 设置上方向为负Z轴，确保正确的视角方向
        
        // 设置正交相机为当前相机
        (this.renderer as any).camera = this.orthographicCamera;
        
        console.log('[CADLineDrawingScript] 正交相机已创建并设置');
    }

    /**
     * 添加鼠标平移功能
     */
    private setupPanning(): void {
        if (!this.orthographicCamera || !this.webGLRenderer) return;
        
        let isPanning = false;
        let previousMousePosition = { x: 0, y: 0 };
        const canvas = this.webGLRenderer.domElement;
        
        const onMouseDown = (event: MouseEvent) => {
            // 只有在按住Ctrl键时才启用平移
            if (event.ctrlKey || event.metaKey) {
                isPanning = true;
                previousMousePosition = { x: event.clientX, y: event.clientY };
            }
        };
        
        const onMouseMove = (event: MouseEvent) => {
            if (isPanning && this.orthographicCamera) {
                const deltaX = event.clientX - previousMousePosition.x;
                const deltaY = event.clientY - previousMousePosition.y;
                
                // 计算相机移动距离（适应XZ平面）
                const camera = this.orthographicCamera;
                const aspect = (camera.right - camera.left) / (camera.top - camera.bottom);
                const panSpeed = 0.01;
                
                // 在XZ平面上移动相机（由于up向量设置为(0,0,-1)，需要调整坐标轴）
                camera.position.x -= deltaX * panSpeed * aspect;
                camera.position.z += deltaY * panSpeed * aspect; // 注意这里是加上，因为up向量的设置
                camera.updateMatrixWorld();
                
                previousMousePosition = { x: event.clientX, y: event.clientY };
            }
        };
        
        const onMouseUp = () => {
            isPanning = false;
        };
        
        // 添加事件监听器
        canvas.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        
        // 保存移除函数
        (this as any).removePanningListeners = () => {
            canvas.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }

    /**
     * 添加鼠标缩放功能
     */
    private setupZooming(): void {
        if (!this.orthographicCamera || !this.webGLRenderer) return;
        
        const onMouseWheel = (event: WheelEvent) => {
            if (!this.orthographicCamera) return;
            
            event.preventDefault();
            
            const camera = this.orthographicCamera;
            const zoomSpeed = 0.1;
            const delta = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
            
            // 调整视锥体大小
            camera.left *= delta;
            camera.right *= delta;
            camera.top *= delta;
            camera.bottom *= delta;
            camera.updateProjectionMatrix();
        };
        
        // 添加事件监听器
        this.webGLRenderer.domElement.addEventListener('wheel', onMouseWheel);
        
        // 保存移除函数
        (this as any).removeZoomingListener = () => {
            this.webGLRenderer.domElement.removeEventListener('wheel', onMouseWheel);
        };
    }

    /**
     * 更新正交相机尺寸（响应窗口大小变化）
     */
    public updateCameraAspect(): void {
        if (!this.orthographicCamera || !this.webGLRenderer) return;
        
        const width = this.webGLRenderer.domElement.width;
        const height = this.webGLRenderer.domElement.height;
        const aspect = width / height;
        const frustumSize = 20;
        
        this.orthographicCamera.left = frustumSize * aspect / -2;
        this.orthographicCamera.right = frustumSize * aspect / 2;
        this.orthographicCamera.top = frustumSize / 2;
        this.orthographicCamera.bottom = frustumSize / -2;
        this.orthographicCamera.updateProjectionMatrix();
    }

    /**
     * 创建坐标显示元素
     */
    private createCoordinateDisplay(): void {
        this.coordinateDisplay = document.createElement('div');
        this.coordinateDisplay.style.position = 'absolute';
        this.coordinateDisplay.style.top = '10px';
        this.coordinateDisplay.style.left = '10px';
        this.coordinateDisplay.style.background = 'rgba(0, 0, 0, 0.7)';
        this.coordinateDisplay.style.color = 'white';
        this.coordinateDisplay.style.padding = '5px 10px';
        this.coordinateDisplay.style.borderRadius = '4px';
        this.coordinateDisplay.style.fontFamily = 'monospace';
        this.coordinateDisplay.style.fontSize = '14px';
        this.coordinateDisplay.style.zIndex = '1000';
        this.coordinateDisplay.style.pointerEvents = 'none';
        this.coordinateDisplay.textContent = '坐标: (0, 0, 0)';
        
        // 将坐标显示添加到canvas的父元素中
        if (this.webGLRenderer.domElement.parentElement) {
            this.webGLRenderer.domElement.parentElement.appendChild(this.coordinateDisplay);
        }
    }

    /**
     * 设置事件监听器
     */
    private setupEventListeners(): void {
        const canvas = this.webGLRenderer.domElement;
        
        // 鼠标事件
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
        
        // 键盘事件
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        
        // 窗口大小调整事件
        window.addEventListener('resize', this.onWindowResize.bind(this));
        
        // 添加平移和缩放功能
        this.setupPanning();
        this.setupZooming();
    }

    /**
     * 移除事件监听器
     */
    private removeEventListeners(): void {
        const canvas = this.webGLRenderer.domElement;
        
        canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
        canvas.removeEventListener('dblclick', this.onDoubleClick.bind(this));
        
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
        
        // 移除窗口大小调整事件
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        
        // 移除平移和缩放监听器
        if ((this as any).removePanningListeners) {
            (this as any).removePanningListeners();
        }
        if ((this as any).removeZoomingListener) {
            (this as any).removeZoomingListener();
        }
    }

    /**
     * 窗口大小调整事件处理
     */
    private onWindowResize(): void {
        this.updateCameraAspect();
    }

    /**
     * 鼠标按下事件
     */
    private onMouseDown(event: MouseEvent): void {
        if (event.button !== 0) return; // 只处理左键
        
        // 获取点击位置的世界坐标
        const worldPosition = this.getWorldPositionFromMouse(event);
        if (!worldPosition) return;
        
        // 开始绘制
        this.startDrawing(worldPosition);
    }

    /**
     * 鼠标移动事件
     */
    private onMouseMove(event: MouseEvent): void {
        // 更新鼠标位置
        const worldPosition = this.getWorldPositionFromMouse(event);
        if (!worldPosition) return;
        
        this.mousePosition.copy(worldPosition);
        
        // 更新坐标显示
        if (this.coordinateDisplay) {
            this.coordinateDisplay.textContent = `坐标: (${worldPosition.x.toFixed(2)}, ${worldPosition.y.toFixed(2)}, ${worldPosition.z.toFixed(2)})`;
        }
        
        // 如果正在绘制，更新预览线
        if (this.isDrawing) {
            this.updatePreviewLine(worldPosition);
        }
    }

    /**
     * 鼠标抬起事件
     */
    private onMouseUp(event: MouseEvent): void {
        if (event.button !== 0) return; // 只处理左键
        
        if (this.isDrawing) {
            // 添加点到当前线条
            const worldPosition = this.getWorldPositionFromMouse(event);
            if (worldPosition) {
                this.addPointToLine(worldPosition);
            }
        }
    }

    /**
     * 双击事件
     */
    private onDoubleClick(event: MouseEvent): void {
        // 完成当前线条绘制
        this.finishDrawing();
    }

    /**
     * 键盘按下事件
     */
    private onKeyDown(event: KeyboardEvent): void {
        // ESC键取消绘制
        if (event.key === 'Escape') {
            this.cancelDrawing();
        }
        
        // Enter键完成绘制
        if (event.key === 'Enter') {
            this.finishDrawing();
        }
        
        // Delete键删除最后一条线
        if (event.key === 'Delete') {
            this.deleteLastLine();
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
     * 获取所有绘制的线条
     */
    public getDrawnLines(): ILine[] {
        return [...this.drawnLines];
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
        if (this.coordinateDisplay && this.coordinateDisplay.parentElement) {
            this.coordinateDisplay.parentElement.removeChild(this.coordinateDisplay);
        }
        
        // 清除所有线条
        this.clearAllLines();
        
        // 销毁材质
        if (this.lineMaterial) {
            this.lineMaterial.dispose();
        }
        
        console.log('[CADLineDrawingScript] 已销毁');
    }
}