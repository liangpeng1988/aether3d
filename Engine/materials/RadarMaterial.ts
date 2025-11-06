import { THREE } from "../core/global";

// 扇形雷达材质类
export class RadarMaterial extends THREE.MeshBasicMaterial {
    private _time: { value: number };

    constructor(parameters: any = {}) {
        super();

        const color = parameters.color !== undefined ?
            (parameters.color instanceof THREE.Color ? parameters.color : new THREE.Color(parameters.color)) : new THREE.Color("#00ff00");

        this._time = parameters.time || { value: 0 };

        // 设置基本属性
        this.color = color;
        this.opacity = parameters.opacity !== undefined ? parameters.opacity : 0.8;

        // 初始化userData
        this.userData = this.userData || {};

        // 自定义属性
        this.userData.speed = parameters.speed !== undefined ? parameters.speed : 1.5;
        this.userData.radius = parameters.radius !== undefined ? parameters.radius : 50;
        this.userData.angle = parameters.angle !== undefined ? parameters.angle : Math.PI / 2; // 90度扇形
        this.userData.radarColor = color;

        this.initRadarMaterial();
    }

    initRadarMaterial(): void {
        this.transparent = true;
        this.depthWrite = false;
        this.side = THREE.DoubleSide;
        this.blending = THREE.AdditiveBlending;

        this.onBeforeCompile = (shader: any) => {
            if (shader.uniforms.time) {
                return; // 避免重复编译
            }

            try {
                // 添加uniform
                shader.uniforms.time = this._time;
                shader.uniforms.u_speed = { value: this.userData.speed };
                shader.uniforms.u_radius = { value: this.userData.radius };
                shader.uniforms.u_angle = { value: this.userData.angle };
                shader.uniforms.radarColor = { value: this.userData.radarColor };
                
                // 修改片段着色器 - 基于radar-scan.html的实现
                shader.fragmentShader = `
                    uniform float time;
                    uniform float u_speed;
                    uniform float u_radius;
                    uniform float u_angle;
                    uniform vec3 radarColor;
                    
                    varying vec2 vUv;
                    
                    #define PI 3.14159265359
                    #define PI2 6.28318530718
                    
                    void main() {
                        vec2 center = vec2(0.5, 0.5);
                        vec2 pos = vUv - center;
                        
                        float distance = length(pos) * u_radius * 2.0;
                        float angle = atan(pos.y, pos.x) + PI;
                        
                        float u_time = u_speed * time;
                        float scanAngle = mod(u_time, PI2);
                        
                        float angleDiff = angle - scanAngle;
                        if (angleDiff < 0.0) angleDiff += PI2;
                        
                        float opacity = 0.0;
                        if (angleDiff <= u_angle && distance <= u_radius) {
                            opacity = 1.0 - angleDiff / u_angle;
                            opacity *= (1.0 - distance / u_radius); // 距离衰减
                        }
                        
                        gl_FragColor = vec4(radarColor, opacity * 0.8);
                    }
                `;
                
                // 修改顶点着色器 - 基于radar-scan.html的实现
                shader.vertexShader = `
                    varying vec2 vUv;
                    
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `;

            } catch (error) {
                console.error('雷达着色器编译错误:', error);
            }
        };
    }

    updateTime(deltaTime: number): void {
        this._time.value += deltaTime;
    }

    updateParameters(params: {
        speed?: number;
        radius?: number;
        angle?: number;
        color?: string | THREE.Color;
        opacity?: number;
    }): void {
        if (this.userData) {
            this.userData.speed = params.speed || this.userData.speed;
            this.userData.radius = params.radius || this.userData.radius;
            this.userData.angle = params.angle || this.userData.angle;

            if (params.color) {
                this.userData.radarColor = params.color instanceof THREE.Color ?
                    params.color : new THREE.Color(params.color);
            }

            this.opacity = params.opacity !== undefined ? params.opacity : this.opacity;

            // 实时更新uniform值（如果材质已经编译）
            this.needsUpdate = true;
        }
    }
}
