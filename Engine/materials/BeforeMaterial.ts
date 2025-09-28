import { THREE } from "../core/global";

export interface BasiMaterialParameters {
    color?: THREE.Color | string | number;
    opacity?: number;
    transparent?: boolean;
    speed?: number;
    radius?: number;
    width?: number;
    highlightColor?: THREE.Color | string | number;
    time?: { value: number };
}

export class BeforeMaterial extends THREE.MeshBasicMaterial {
    private _time: { value: number };

    constructor(parameters: BasiMaterialParameters = {}) {
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

            let fragmentShader = shader.fragmentShader + "";
            let vertexShader = shader.vertexShader + "";

            const fragment = `
                float lerp (float x,float y,float t ) {
                    return ( 1.0 - t ) * x + t * y;
                }
                float distanceTo(vec2 src, vec2 dst) {
                    float dx = src.x - dst.x;
                    float dy = src.y - dst.y;
                    float dv = dx * dx + dy * dy;
                    return sqrt(dv);
                }
                float atan2(float y, float x){
                    float t0, t1, t2, t3, t4;
                    t3 = abs(x);
                    t1 = abs(y);
                    t0 = max(t3, t1);
                    t1 = min(t3, t1);
                    t3 = float(1) / t0;
                    t3 = t1 * t3;
                    t4 = t3 * t3;
                    t0 = -float(0.013480470);
                    t0 = t0 * t4 + float(0.057477314);
                    t0 = t0 * t4 - float(0.121239071);
                    t0 = t0 * t4 + float(0.195635925);
                    t0 = t0 * t4 - float(0.332994597);
                    t0 = t0 * t4 + float(0.999995630);
                    t3 = t0 * t3;
                    t3 = (abs(y) > abs(x)) ? float(1.570796327) - t3 : t3;
                    t3 = (x < 0.0) ?  float(3.141592654) - t3 : t3;
                    t3 = (y < 0.0) ? -t3 : t3;
                    return t3;
                }

                uniform vec3 hightColor;
                uniform float u_speed;
                uniform float u_radius;
                uniform float u_width;
                uniform float time;
                varying vec3 v_position;
                void main() {`;

            const fragmentColor = `
                float u_time = u_speed * time;
                vec2 curr = vec2(v_position.x, v_position.z);
                float vLength = distanceTo(vec2(5.0, 0.0), curr);
                
                float len = mod(u_time, u_radius);

                float vOpacity = diffuseColor.a;
                vec3 vColor = outgoingLight; 

                float angle = atan2(v_position.x, v_position.z) + PI;
                float angleT = mod(angle + u_time, PI2); 
               
                float length = distanceTo(vec2(0.0, 0.0), curr);

                float d_opacity = 1.0 - angleT / PI * (PI / u_width);

                if (length > u_radius) { d_opacity = 0.0; };
                vec3 rColor = vec3(1.0, 1.0, 1.0);
                if (d_opacity > 0.0) {
                    rColor = vec3(
                        lerp(vColor.r, hightColor.r, d_opacity),
                        lerp(vColor.g, hightColor.g, d_opacity),
                        lerp(vColor.b, hightColor.b, d_opacity)
                    );
                }
                gl_FragColor = vec4( vColor * rColor, d_opacity);
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
    static createDiffusionMaterial(parameters: BasiMaterialParameters = {}): BasiMaterial {
        return new BasiMaterial(parameters);
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