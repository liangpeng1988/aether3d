import { THREE } from "../core/global";

/**
 * 风效材质类
 * 专门用于处理带有弯曲效果的风流材质
 */
export class WindMaterial extends THREE.ShaderMaterial {
    private _curveIntensity: number = 1.0;
    private _windStrength: number = 0.7;
    private _time: number = 0;
    private _glowIntensity: number = 0.5; // 发光强度
    private _glowColor: THREE.Color = new THREE.Color(0x00ffff); // 发光颜色
    private _speed: number = 1.0; // 车辆速度
    private _direction: number = 1.0; // 风流方向 (1为向前，-1为向后)

    constructor(params?: THREE.ShaderMaterialParameters) {
        const defaultParams = {
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uCurveIntensity: { value: 1.0 },
                uWindStrength: { value: 0.7 },
                uGlowIntensity: { value: 0.5 },
                uGlowColor: { value: new THREE.Color(0x00ffff) },
                uColor: { value: new THREE.Color(0x00ffff) },
                uSpeed: { value: 1.0 }, // 车辆速度uniform
                uDirection: { value: 1.0 } // 风流方向uniform
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                uniform float uTime;
                uniform float uCurveIntensity;
                uniform float uSpeed;
                uniform float uDirection;
                
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    
                    // 修改顶点位置以创建弯曲效果
                    vec3 newPosition = position;
                    
                    // 创建更自然的风流弯曲效果
                    float windOffset = sin(uTime * uSpeed * 0.3 + position.y * 0.15) * uCurveIntensity * 0.08;
                    // 添加基于X轴位置的波动，使效果更复杂
                    float windOffset2 = cos(uTime * uSpeed * 0.25 + position.x * 0.1) * uCurveIntensity * 0.04;
                    // 根据Y轴位置调整弯曲程度，使中心区域效果更明显
                    float yFactor = 1.0 - pow(abs(position.y) / 0.4, 1.005);
                    newPosition.x += (windOffset + windOffset2) * uDirection * yFactor;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                uniform float uTime;
                uniform float uWindStrength;
                uniform float uGlowIntensity;
                uniform vec3 uGlowColor;
                uniform vec3 uColor;
                uniform float uSpeed;
                uniform float uDirection;
                
                void main() {
                    // 计算Y轴渐变（从上到下透明度递减，并在边缘预留位置）
                    float yGradient = 1.0 - vUv.y;
                    // 在顶部和底部预留位置，使边缘完全透明
                    yGradient = smoothstep(0.4995, 0.5005, yGradient);
                    
                    // 添加时间相关的波动效果，结合速度参数
                    float wave = sin(uTime * uSpeed * 0.6 + vPosition.x * 0.8 + vPosition.y * 0.2) * 0.03;
                    // 添加第二个频率的波动
                    float wave2 = cos(uTime * uSpeed * 0.4 + vPosition.x * 0.4 + vPosition.y * 0.12) * 0.015;
                    
                    // 计算X轴渐变（中心透明度高，边缘低，并且边缘完全透明）
                    float xGradient = 1.0 - abs(vUv.x - 0.5) * 2.0;
                    // 在边缘预留位置，使效果边缘完全透明
                    xGradient = smoothstep(0.4998, 0.5002, xGradient);
                    
                    // 计算径向渐变（从中心到边缘透明度递减）
                    vec2 center = vec2(0.5, 0.5);
                    float distance = distance(vUv, center);
                    float radialGradient = 1.0 - distance * 1.0000005;
                    // 在边缘预留位置，使边缘完全透明
                    radialGradient = smoothstep(0.4995, 0.5005, radialGradient);
                    
                    // 综合透明度，结合速度影响
                    float alpha = yGradient * xGradient * radialGradient * uWindStrength + wave + wave2;
                    
                    // 确保透明度在合理范围内
                    alpha = clamp(alpha, 0.0, 1.0);
                    
                    // 添加颜色变化
                    vec3 color = uColor;
                    color.r += sin(uTime * uSpeed * 0.4 + vPosition.x * 0.1) * 0.03;
                    color.g += cos(uTime * uSpeed * 0.5 + vPosition.y * 0.04) * 0.03;
                    color.b += sin(uTime * uSpeed * 0.25 + vPosition.x * 0.05 + vPosition.y * 0.08) * 0.03;
                    
                    // 计算发光效果，结合速度参数
                    float glow = uGlowIntensity * (0.06 + abs(sin(uTime * uSpeed * 1.0 + vPosition.x * 0.5)) * 0.1);
                    vec3 glowColor = uGlowColor * glow * radialGradient;
                    
                    // 合成最终颜色
                    vec3 finalColor = color + glowColor;
                    
                    // 如果透明度太低则丢弃像素，使边缘完全透明
                    if (alpha < 0.00000005) discard;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            ...params
        };

        super(defaultParams);

        // 定义响应式属性
        Object.defineProperties(this, {
            curveIntensity: {
                get: () => this._curveIntensity,
                set: (value: number) => {
                    this._curveIntensity = value;
                    if (this.uniforms.uCurveIntensity) {
                        this.uniforms.uCurveIntensity.value = value;
                    }
                }
            },
            windStrength: {
                get: () => this._windStrength,
                set: (value: number) => {
                    this._windStrength = value;
                    if (this.uniforms.uWindStrength) {
                        this.uniforms.uWindStrength.value = value;
                    }
                }
            },
            time: {
                get: () => this._time,
                set: (value: number) => {
                    this._time = value;
                    if (this.uniforms.uTime) {
                        this.uniforms.uTime.value = value;
                    }
                }
            },
            glowIntensity: {
                get: () => this._glowIntensity,
                set: (value: number) => {
                    this._glowIntensity = value;
                    if (this.uniforms.uGlowIntensity) {
                        this.uniforms.uGlowIntensity.value = value;
                    }
                }
            },
            glowColor: {
                get: () => this._glowColor,
                set: (value: THREE.Color) => {
                    this._glowColor = value;
                    if (this.uniforms.uGlowColor) {
                        this.uniforms.uGlowColor.value = value;
                    }
                }
            },
            speed: {
                get: () => this._speed,
                set: (value: number) => {
                    this._speed = value;
                    if (this.uniforms.uSpeed) {
                        this.uniforms.uSpeed.value = value;
                    }
                }
            },
            direction: {
                get: () => this._direction,
                set: (value: number) => {
                    this._direction = value;
                    if (this.uniforms.uDirection) {
                        this.uniforms.uDirection.value = value;
                    }
                }
            }
        });
    }

    /**
     * 设置弯曲强度
     * @param intensity 弯曲强度 (0-2)
     */
    set curveIntensity(intensity: number) {
        this._curveIntensity = intensity;
        if (this.uniforms.uCurveIntensity) {
            this.uniforms.uCurveIntensity.value = intensity;
        }
    }

    /**
     * 获取弯曲强度
     */
    get curveIntensity(): number {
        return this._curveIntensity;
    }

    /**
     * 设置风力强度
     * @param strength 风力强度 (0.1-1.0)
     */
    set windStrength(strength: number) {
        this._windStrength = strength;
        if (this.uniforms.uWindStrength) {
            this.uniforms.uWindStrength.value = strength;
        }
    }

    /**
     * 获取风力强度
     */
    get windStrength(): number {
        return this._windStrength;
    }

    /**
     * 设置时间参数
     * @param time 时间值
     */
    set time(time: number) {
        this._time = time;
        if (this.uniforms.uTime) {
            this.uniforms.uTime.value = time;
        }
    }

    /**
     * 获取时间参数
     */
    get time(): number {
        return this._time;
    }

    /**
     * 设置风流颜色
     * @param color 颜色值
     */
    set color(color: THREE.Color) {
        if (this.uniforms.uColor) {
            this.uniforms.uColor.value = color;
        }
    }

    /**
     * 获取风流颜色
     */
    get color(): THREE.Color {
        return this.uniforms.uColor?.value || new THREE.Color(0x00ffff);
    }

    /**
     * 设置发光强度
     * @param intensity 发光强度 (0-1)
     */
    set glowIntensity(intensity: number) {
        this._glowIntensity = intensity;
        if (this.uniforms.uGlowIntensity) {
            this.uniforms.uGlowIntensity.value = intensity;
        }
    }

    /**
     * 获取发光强度
     */
    get glowIntensity(): number {
        return this._glowIntensity;
    }

    /**
     * 设置发光颜色
     * @param color 发光颜色
     */
    set glowColor(color: THREE.Color) {
        this._glowColor = color;
        if (this.uniforms.uGlowColor) {
            this.uniforms.uGlowColor.value = color;
        }
    }

    /**
     * 获取发光颜色
     */
    get glowColor(): THREE.Color {
        return this._glowColor;
    }

    /**
     * 设置车辆速度
     * @param speed 车辆速度 (0-5)
     */
    set speed(speed: number) {
        this._speed = speed;
        if (this.uniforms.uSpeed) {
            this.uniforms.uSpeed.value = speed;
        }
    }

    /**
     * 获取车辆速度
     */
    get speed(): number {
        return this._speed;
    }

    /**
     * 设置风流方向
     * @param direction 风流方向 (1为向前，-1为向后)
     */
    set direction(direction: number) {
        this._direction = direction;
        if (this.uniforms.uDirection) {
            this.uniforms.uDirection.value = direction;
        }
    }

    /**
     * 获取风流方向
     */
    get direction(): number {
        return this._direction;
    }
}