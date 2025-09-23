import { THREE } from "../core/global";

export interface GlowMaterialParameters {
    map?: THREE.Texture | null;
    aoMap?: THREE.Texture | null;  // AO贴图
    glowColor?: THREE.Color | string | number;
    glowIntensity?: number;
    baseBrightness?: number;
    side?: THREE.Side;  // 双面材质支持
}

export class ShaderGlowMaterial extends THREE.ShaderMaterial {
    constructor(parameters: GlowMaterialParameters = {}) {
        const glowColor = parameters.glowColor !== undefined ?
            (parameters.glowColor instanceof THREE.Color ? parameters.glowColor : new THREE.Color(parameters.glowColor)) : '#fffb2e';

        const baseBrightness = parameters.baseBrightness !== undefined ? parameters.baseBrightness : 0.8;

        // 设置双面材质，默认为正面渲染
        const side = parameters.side !== undefined ? parameters.side : THREE.FrontSide;

        super({
            uniforms: {
                map: { value: parameters.map || null },
                aoMap: { value: parameters.aoMap || null },
                glowColor: { value: glowColor },
                glowIntensity: { value: parameters.glowIntensity !== undefined ? parameters.glowIntensity : 2.0 },
                baseBrightness: { value: baseBrightness }
            },
            side: side,  // 设置渲染面
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec2 vUv2; // 第二UV坐标用于AO贴图
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    // 如果存在第二UV坐标则使用，否则使用第一UV坐标
                    #ifdef USE_UV2
                        vUv2 = uv2;
                    #else
                        vUv2 = uv;
                    #endif
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D map;
                uniform sampler2D glowMap;
                uniform vec3 glowColor;
                uniform float glowIntensity;
                uniform float baseBrightness;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec2 vUv2;

                void main() {
                    vec4 texColor = texture2D(map, vUv);
                    // 从AO贴图获取环境光遮蔽值
                    vec4 aoValue = texture2D(glowMap, vUv2);
                    
                    // 直接使用AO贴图的灰度值控制自发光（反向效果）
                    // AO贴图中较暗的区域（灰度值接近0）会产生更强的自发光
                    // 1.0 - aoValue.r 实现反向效果：暗部发光，亮部不发光
                    float glowFactor = (1.0 - aoValue.r) * glowIntensity;
                    
                    // 调整基础颜色亮度，避免过白
                    vec3 adjustedBaseColor = texColor.rgb * baseBrightness;
                    
                    // 计算最终颜色：调整后的基础纹理颜色 + 自发光颜色
                    vec3 finalColor = adjustedBaseColor + glowColor * glowFactor;
                    
                    // 限制最大亮度，避免过曝
                    finalColor = min(finalColor, vec3(1.0));
                    
                    gl_FragColor = vec4(finalColor, texColor.a);
                }
            `
        });
    }

    get map(): THREE.Texture | null {
        return this.uniforms.map.value;
    }

    set map(value: THREE.Texture | null) {
        this.uniforms.map.value = value;
    }

    get glowMap(): THREE.Texture | null {
        return this.uniforms.glowMap.value;
    }

    set glowMap(value: THREE.Texture | null) {
        this.uniforms.glowMap.value = value;
    }

    get glowColor(): THREE.Color {
        return this.uniforms.glowColor.value;
    }

    set glowColor(value: THREE.Color) {
        this.uniforms.glowColor.value = value;
    }

    get glowIntensity(): number {
        return this.uniforms.glowIntensity.value;
    }

    set glowIntensity(value: number) {
        this.uniforms.glowIntensity.value = value;
    }

    get baseBrightness(): number {
        return this.uniforms.baseBrightness.value;
    }

    set baseBrightness(value: number) {
        this.uniforms.baseBrightness.value = value;
    }

    // 添加双面材质设置方法
    setSide(side: THREE.Side): void {
        this.side = side;
    }
}
