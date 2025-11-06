import { BeforeMaterial, BeforeMaterialExample } from '../../../Engine/materials/BeforeMaterial';
import { THREE } from '../../../Engine/core/global';

/**
 * BeforeMaterial 功能测试
 */
export class BeforeMaterialTest {
    private scene!: THREE.Scene;
    private renderer!: THREE.WebGLRenderer;
    private camera!: THREE.PerspectiveCamera;
    private materials: BeforeMaterial[] = [];
    private animationId: number = 0;
    private clock: THREE.Clock;

    constructor(container: HTMLElement) {
        this.clock = new THREE.Clock();
        this.initScene();
        this.initRenderer(container);
        this.initCamera();
        this.createTestMaterials();
        this.addLights();
        this.animate();
    }

    private initScene(): void {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
    }

    private initRenderer(container: HTMLElement): void {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);
    }

    private initCamera(): void {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
    }

    private addLights(): void {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // 方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
    }

    private createTestMaterials(): void {
        // 测试案例1：基础雷达扫描
        this.createTestCase({
            position: [-60, 0, 0],
            title: '雷达扫描',
            color: '#001122',
            highlightColor: '#00ff00',
            speed: 1.0,
            radius: 30,
            width: Math.PI / 6
        });

        // 测试案例2：冲击波效果
        this.createTestCase({
            position: [0, 0, 0],
            title: '冲击波',
            color: '#220000',
            highlightColor: '#ff6600',
            speed: 2.5,
            radius: 40,
            width: Math.PI * 2
        });

        // 测试案例3：能量扩散
        this.createTestCase({
            position: [60, 0, 0],
            title: '能量扩散',
            color: '#000022',
            highlightColor: '#4488ff',
            speed: 0.8,
            radius: 35,
            width: Math.PI
        });

        // 测试案例4：快速脉冲
        this.createTestCase({
            position: [-30, 0, -50],
            title: '快速脉冲',
            color: '#002200',
            highlightColor: '#88ff44',
            speed: 4.0,
            radius: 25,
            width: Math.PI / 4
        });

        // 测试案例5：慢速扫描
        this.createTestCase({
            position: [30, 0, -50],
            title: '慢速扫描',
            color: '#220022',
            highlightColor: '#ff44ff',
            speed: 0.3,
            radius: 50,
            width: Math.PI / 3
        });
    }

    private createTestCase(config: {
        position: [number, number, number];
        title: string;
        color: string;
        highlightColor: string;
        speed: number;
        radius: number;
        width: number;
    }): void {
        // 创建材质
        const material = new BeforeMaterial({
            color: config.color,
            highlightColor: config.highlightColor,
            opacity: 0.8,
            transparent: true,
            speed: config.speed,
            radius: config.radius,
            width: config.width
        });

        this.materials.push(material);

        // 创建几何体
        const geometry = new THREE.PlaneGeometry(80, 80, 32, 32);
        const mesh = new THREE.Mesh(geometry, material);
        
        // 设置位置和旋转
        mesh.position.set(...config.position);
        mesh.rotation.x = -Math.PI / 2; // 平放在地面

        this.scene.add(mesh);

        // 添加标签（可选）
        this.addLabel(config.title, config.position);
    }

    private addLabel(text: string, position: [number, number, number]): void {
        // 创建文字纹理
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = '#ffffff';
        context.font = '20px Arial';
        context.fillText(text, 10, 40);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        
        const geometry = new THREE.PlaneGeometry(20, 5);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position[0], position[1] + 25, position[2]);
        
        this.scene.add(mesh);
    }

    private animate = (): void => {
        this.animationId = requestAnimationFrame(this.animate);
        
        const deltaTime = this.clock.getDelta();
        
        // 更新所有材质的时间
        this.materials.forEach(material => {
            material.updateTime(deltaTime);
        });
        
        this.renderer.render(this.scene, this.camera);
    };

    /**
     * 销毁测试实例
     */
    public dispose(): void {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // 清理材质
        this.materials.forEach(material => {
            material.dispose();
        });
        
        // 清理场景
        this.scene.clear();
        
        // 清理渲染器
        this.renderer.dispose();
    }

    /**
     * 调整画布大小
     */
    public resize(width: number, height: number): void {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * 获取渲染器用于外部控制
     */
    public getRenderer(): THREE.WebGLRenderer {
        return this.renderer;
    }

    /**
     * 获取场景用于外部控制
     */
    public getScene(): THREE.Scene {
        return this.scene;
    }

    /**
     * 获取相机用于外部控制
     */
    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }
}

export default BeforeMaterialTest;