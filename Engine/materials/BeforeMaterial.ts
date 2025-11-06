import { THREE } from "../core/global";

export interface BeforeMaterialParameters {
    color?: THREE.Color | string | number;
    opacity?: number;
    transparent?: boolean;
    speed?: number;
    radius?: number;
    width?: number;
    highlightColor?: THREE.Color | string | number;
    time?: { value: number };
    diffusionType?: number; // 改名：扩散动画类型 (1-4)
}

export class BeforeMaterial extends THREE.MeshBasicMaterial {
    private _time: { value: number };

    constructor(parameters: BeforeMaterialParameters = {}) {
        super();

        // 设置默认参数
        const color = parameters.color !== undefined ?
            (parameters.color instanceof THREE.Color ? parameters.color : new THREE.Color(parameters.color)) : new THREE.Color("#444");
        
        const highlightColor = parameters.highlightColor !== undefined ?
            (parameters.highlightColor instanceof THREE.Color ? parameters.highlightColor : new THREE.Color(parameters.highlightColor)) : new THREE.Color("#ff0000");

        // 初始化时间uniform
        this._time = parameters.time || { value: 0 };

        // 应用基础材质属性
        this.handleBeforeMaterial();

        // 设置颜色
        this.color = color;
        this.opacity = parameters.opacity !== undefined ? parameters.opacity : 0.5;

        // 设置自定义uniform参数
        this.userData.speed = parameters.speed !== undefined ? parameters.speed : 1;
        this.userData.radius = parameters.radius !== undefined ? parameters.radius : 100;
        this.userData.width = parameters.width !== undefined ? parameters.width : Math.PI / 2;
        this.userData.highlightColor = highlightColor;
        this.userData.diffusionType = parameters.diffusionType !== undefined ? parameters.diffusionType : 1; // 默认为雷达扫描
    }

    private handleBeforeMaterial(): void {
        this.transparent = true;
        this.depthWrite = false;
        this.side = THREE.DoubleSide;
        this.blending = THREE.AdditiveBlending;

        this.onBeforeCompile = (shader) => {
            // 添加uniform变量
            shader.uniforms.time = this._time;
            shader.uniforms.u_speed = { value: this.userData.speed };
            shader.uniforms.u_radius = { value: this.userData.radius };
            shader.uniforms.u_width = { value: this.userData.width };
            shader.uniforms.hightColor = { value: this.userData.highlightColor };
            shader.uniforms.u_type = { value: this.userData.diffusionType };

            let fragmentShader = shader.fragmentShader + "";
            let vertexShader = shader.vertexShader + "";

            const fragment = `
                #define PI_CUSTOM 3.14159265359
                
                float lerp (float x,float y,float t ) {
                    return ( 1.0 - t ) * x + t * y;
                }
                
                float getDistance(vec2 src, vec2 dst) {
                    float dx = src.x - dst.x;
                    float dy = src.y - dst.y;
                    return sqrt(dx * dx + dy * dy);
                }
                
                float atan2_custom(float y, float x){
                    if (abs(x) < 0.0001) {
                        return sign(y) * PI_CUSTOM / 2.0;
                    }
                    float result = atan(y / x);
                    if (x < 0.0) {
                        result += PI_CUSTOM;
                    }
                    return result;
                }

                uniform vec3 hightColor;
                uniform float u_speed;
                uniform float u_radius;
                uniform float u_width;
                uniform float time;
                uniform float u_type;
                varying vec3 v_position;
                
                void main() {`;

            const fragmentColor = `
                float u_time = u_speed * time;
                vec2 curr = vec2(v_position.x, v_position.z);
                float distance = getDistance(vec2(0.0, 0.0), curr);
                
                float vOpacity = diffuseColor.a;
                vec3 vColor = outgoingLight;
                float d_opacity = 0.0;
                
                // 根据类型选择不同的扩散效果
                if (u_type == 1.0) {
                    // 雷达扫描效果
                    float angle = atan2_custom(v_position.x, v_position.z) + PI_CUSTOM;
                    float angleT = mod(angle + u_time, 2.0 * PI_CUSTOM);
                    d_opacity = 1.0 - angleT / PI_CUSTOM * (PI_CUSTOM / u_width);
                    if (distance > u_radius) { d_opacity = 0.0; }
                } else if (u_type == 2.0) {
                    // 边界波纹效果
                    float bw = 5.0;
                    if (distance < u_radius && distance > u_radius - bw) {
                        float o = (distance - (u_radius - bw)) / bw;
                        d_opacity = sin(o * PI_CUSTOM);
                    }
                } else if (u_type == 3.0) {
                    // 同心圆环效果
                    float bw = 10.0;
                    if (distance > u_radius - bw && distance < u_radius) {
                        d_opacity = sin((distance - (u_radius - bw)) / bw * PI_CUSTOM);
                    }
                    float c_r = u_radius / 2.0;
                    if (distance > c_r - bw && distance < c_r) {
                        d_opacity = max(d_opacity, sin((distance - (c_r - bw)) / bw * PI_CUSTOM));
                    }
                } else if (u_type == 4.0) {
                    // 脉冲扇形效果
                    float pulse = sin(u_time * 3.0) * 0.5 + 0.5;
                    if (distance < u_radius) {
                        d_opacity = pulse * (1.0 - distance / u_radius);
                    }
                }
                
                d_opacity = clamp(d_opacity, 0.0, 1.0);
                
                vec3 rColor = vec3(1.0, 1.0, 1.0);
                if (d_opacity > 0.0) {
                    rColor = vec3(
                        lerp(vColor.r, hightColor.r, d_opacity),
                        lerp(vColor.g, hightColor.g, d_opacity),
                        lerp(vColor.b, hightColor.b, d_opacity)
                    );
                }
                gl_FragColor = vec4( vColor * rColor, max(d_opacity, vOpacity * 0.1));
                    `;

            shader.fragmentShader = fragmentShader.replace("void main() {", fragment);
            shader.fragmentShader = shader.fragmentShader.replace("gl_FragColor = vec4( outgoingLight, diffuseColor.a );", fragmentColor);

            const vertex = `
                varying vec3 v_position;
                void main() {
                    v_position = position;
                `;

            shader.vertexShader = vertexShader.replace("void main() {", vertex);
        };
    }

    // Getter和Setter方法，便于动态修改参数
    get speed(): number {
        return this.userData.speed;
    }

    set speed(value: number) {
        this.userData.speed = value;
    }

    get radius(): number {
        return this.userData.radius;
    }

    set radius(value: number) {
        this.userData.radius = value;
    }

    get width(): number {
        return this.userData.width;
    }

    set width(value: number) {
        this.userData.width = value;
    }

    get highlightColor(): THREE.Color {
        return this.userData.highlightColor;
    }

    set highlightColor(value: THREE.Color) {
        this.userData.highlightColor = value;
    }

    get diffusionType(): number {
        return this.userData.diffusionType;
    }

    set diffusionType(value: number) {
        this.userData.diffusionType = Math.max(1, Math.min(4, Math.floor(value))); // 限制在1-4之间
    }

    get time(): { value: number } {
        return this._time;
    }

    set time(value: { value: number }) {
        this._time = value;
    }

    // 更新时间，通常在渲染循环中调用
    updateTime(deltaTime: number): void {
        this._time.value += deltaTime;
    }

    // 便捷方法：创建扩散动画材质的静态工厂方法
    static createDiffusionMaterial(parameters: BeforeMaterialParameters = {}): BeforeMaterial {
        return new BeforeMaterial(parameters);
    }

    // 新增：创建特定类型的扩散材质的快捷方法
    static createRadarMaterial(parameters: Omit<BeforeMaterialParameters, 'diffusionType'> = {}): BeforeMaterial {
        return new BeforeMaterial({ ...parameters, diffusionType: 1 });
    }

    static createWaveMaterial(parameters: Omit<BeforeMaterialParameters, 'diffusionType'> = {}): BeforeMaterial {
        return new BeforeMaterial({ ...parameters, diffusionType: 2 });
    }

    static createRingMaterial(parameters: Omit<BeforeMaterialParameters, 'diffusionType'> = {}): BeforeMaterial {
        return new BeforeMaterial({ ...parameters, diffusionType: 3 });
    }

    static createPulseMaterial(parameters: Omit<BeforeMaterialParameters, 'diffusionType'> = {}): BeforeMaterial {
        return new BeforeMaterial({ ...parameters, diffusionType: 4 });
    }
}

// 导出便捷函数，保持与你原始代码的兼容性
export function handleBeforeMaterial(material: THREE.Material, time?: { value: number }): void {
    if (!(material instanceof THREE.MeshBasicMaterial)) {
        console.warn('handleBeforeMaterial: 材质类型不支持，请使用 MeshBasicMaterial 或其子类');
        return;
    }

    const basiMaterial = new BeforeMaterial({
        color: material.color,
        opacity: material.opacity,
        time: time
    });

    // 复制材质属性
    Object.assign(material, basiMaterial);
}

/**
 * 扩散动画材质使用示例
 */
export class BeforeMaterialExample {
    private material!: BeforeMaterial;
    private mesh!: THREE.Mesh;
    private scene: THREE.Scene;
    private isAnimating: boolean = false;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.initMaterial();
        this.createTestGeometry();
    }

    /**
     * 初始化材质
     */
    private initMaterial(): void {
        this.material = new BeforeMaterial({
            color: '#0088ff',
            highlightColor: '#ff4400',
            opacity: 0.7,
            transparent: true,
            speed: 2.0,
            radius: 50,
            width: Math.PI / 3
        });
    }

    /**
     * 创建测试几何体
     */
    private createTestGeometry(): void {
        const geometry = new THREE.PlaneGeometry(100, 100, 32, 32);
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.rotation.x = -Math.PI / 2; // 平放在地面
        this.scene.add(this.mesh);
    }

    /**
     * 开始动画
     */
    public startAnimation(): void {
        this.isAnimating = true;
    }

    /**
     * 停止动画
     */
    public stopAnimation(): void {
        this.isAnimating = false;
    }

    /**
     * 更新动画（在渲染循环中调用）
     * @param deltaTime 帧时间差
     */
    public update(deltaTime: number): void {
        if (this.isAnimating && this.material) {
            this.material.updateTime(deltaTime);
        }
    }

    /**
     * 设置扩散中心位置
     * @param x X坐标
     * @param y Y坐标
     */
    public setCenter(x: number, y: number): void {
        if (this.mesh) {
            this.mesh.position.x = x;
            this.mesh.position.z = y;
        }
    }

    /**
     * 设置扩散参数
     * @param params 参数对象
     */
    public setDiffusionParams(params: {
        speed?: number;
        radius?: number;
        width?: number;
        highlightColor?: THREE.Color | string | number;
        diffusionType?: number; // 新增：扩散类型
    }): void {
        if (params.speed !== undefined) {
            this.material.speed = params.speed;
        }
        if (params.radius !== undefined) {
            this.material.radius = params.radius;
        }
        if (params.width !== undefined) {
            this.material.width = params.width;
        }
        if (params.highlightColor !== undefined) {
            const color = params.highlightColor instanceof THREE.Color 
                ? params.highlightColor 
                : new THREE.Color(params.highlightColor);
            this.material.highlightColor = color;
        }
        if (params.diffusionType !== undefined) {
            this.material.diffusionType = params.diffusionType;
        }
    }

    /**
     * 销毁资源
     */
    public dispose(): void {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
        }
        if (this.material) {
            this.material.dispose();
        }
    }

    /**
     * 获取材质实例
     */
    public getMaterial(): BeforeMaterial {
        return this.material;
    }

    /**
     * 获取网格实例
     */
    public getMesh(): THREE.Mesh {
        return this.mesh;
    }
}

/**
 * 扩散动画材质使用示例和说明
 * 
 * @example
 * ```typescript
 * // 1. 创建雷达扫描效果
 * const radarMaterial = BeforeMaterial.createRadarMaterial({
 *   color: '#00ff00',
 *   highlightColor: '#ffffff',
 *   speed: 2.0,
 *   radius: 50
 * });
 * 
 * // 2. 创建边界波纹效果
 * const waveMaterial = BeforeMaterial.createWaveMaterial({
 *   color: '#0088ff',
 *   highlightColor: '#ff4400',
 *   speed: 1.5,
 *   radius: 30
 * });
 * 
 * // 3. 创建同心圆环效果
 * const ringMaterial = BeforeMaterial.createRingMaterial({
 *   color: '#ff8800',
 *   highlightColor: '#ffff00',
 *   speed: 1.0,
 *   radius: 40
 * });
 * 
 * // 4. 创建脉冲扇形效果
 * const pulseMaterial = BeforeMaterial.createPulseMaterial({
 *   color: '#ff0066',
 *   highlightColor: '#ffffff',
 *   speed: 3.0,
 *   radius: 35
 * });
 * 
 * // 5. 动态切换效果类型
 * const material = new BeforeMaterial({ diffusionType: 1 });
 * material.diffusionType = 2; // 切换为边界波纹
 * material.diffusionType = 3; // 切换为同心圆环
 * material.diffusionType = 4; // 切换为脉冲扇形
 * ```
 */
export const DiffusionEffectTypes = {
    RADAR: 1,      // 雷达扫描效果
    WAVE: 2,       // 边界波纹效果
    RING: 3,       // 同心圆环效果
    PULSE: 4       // 脉冲扇形效果
} as const;