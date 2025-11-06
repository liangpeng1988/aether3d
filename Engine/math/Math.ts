import { THREE } from "../core/global";
import type {Vector3} from '../core/Type.ts';

/**
 * 线性插值
 * @param start 起始值
 * @param end 结束值
 * @param factor 插值因子
 * @returns 插值结果
 */
export function lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
}

/**
 * 向量线性插值
 * @param start 起始向量
 * @param end 结束向量
 * @param factor 插值因子
 * @returns 插值后的向量
 */
export function lerpVector(start: Vector3, end: Vector3, factor: number): Vector3 {
    return {
        x: lerp(start.x, end.x, factor),
        y: lerp(start.y, end.y, factor),
        z: lerp(start.z, end.z, factor)
    };
}

/**
 * 限制数值范围
 * @param value 输入值
 * @param min 最小值
 * @param max 最大值
 * @returns 限制后的值
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * 将角度转换为弧度
 * @param degrees 角度
 * @returns 弧度
 */
export function degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * 将弧度转换为角度
 * @param radians 弧度
 * @returns 角度
 */
export function radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * 生成随机数范围
 * @param min 最小值
 * @param max 最大值
 * @returns 随机数
 */
export function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * 生成随机整数范围
 * @param min 最小值
 * @param max 最大值
 * @returns 随机整数
 */
export function randomIntRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/**
 * 创建渐变alpha贴图
 * @param direction 渐变方向，默认为从下到上
 * @returns THREE.CanvasTexture
 */
export function createGradientAlphaMap(direction: 'bottomToTop' | 'topToBottom' | 'leftToRight' | 'rightToLeft' = 'bottomToTop'): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    
    // 设置高质量绘制参数，避免点状瑕疵
    // ctx.imageSmoothingEnabled = true;
    // ctx.imageSmoothingQuality = 'high';

    let gradient;
    switch (direction) {
        case 'bottomToTop':
            gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            break;
        case 'topToBottom':
            gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            break;
        case 'leftToRight':
            gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            break;
        case 'rightToLeft':
            gradient = ctx.createLinearGradient(canvas.width, 0, 0, 0);
            break;
        default:
            gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    }

    // 创建从透明到不透明的渐变，使用更精确的颜色值
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');      // 完全透明
    gradient.addColorStop(0.05, 'rgba(0, 0, 0, 0.05)'); // 很轻微的透明
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)'); // 半透明
    gradient.addColorStop(0.95, 'rgba(255, 255, 255, 0.95)'); // 几乎不透明
    gradient.addColorStop(1, 'rgba(255, 255, 255, 1)'); // 完全不透明

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const alphaMap = new THREE.CanvasTexture(canvas);
    alphaMap.wrapS = THREE.RepeatWrapping;
    alphaMap.wrapT = THREE.RepeatWrapping;
    // alphaMap.magFilter = THREE.LinearFilter;  // 使用线性过滤提高质量
    // alphaMap.minFilter = THREE.LinearFilter;  // 使用线性过滤提高质量

    return alphaMap;
}


/**
 * 加载纹理的辅助函数
 * @param url 纹理文件路径
 * @returns Promise<THREE.Texture>
 */
export function loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(
            url,
            (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.anisotropy = 16;
                resolve(texture);
            },
            undefined,
            reject
        );
    });
}

/**
 * 计算两点之间的欧几里得距离
 * @param point1 第一个点的坐标 {x, y, z}
 * @param point2 第二个点的坐标 {x, y, z}
 * @returns 两点之间的距离
 */
export function calculateDistance(point1: {x: number, y: number, z: number}, point2: {x: number, y: number, z: number}): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 计算两点之间距离的平方（避免开方运算，性能更好）
 * @param point1 第一个点的坐标 {x, y, z}
 * @param point2 第二个点的坐标 {x, y, z}
 * @returns 两点之间距离的平方
 */
export function calculateDistanceSquared(point1: {x: number, y: number, z: number}, point2: {x: number, y: number, z: number}): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    return dx * dx + dy * dy + dz * dz;
}

/**
 * 使用Three.js Vector3计算两点之间的距离
 * @param point1 第一个点
 * @param point2 第二个点
 * @returns 两点之间的距离
 */
export function calculateDistanceWithVector3(point1: THREE.Vector3, point2: THREE.Vector3): number {
    return point1.distanceTo(point2);
}

/**
 * 使用Three.js Vector3计算两点之间距离的平方
 * @param point1 第一个点
 * @param point2 第二个点
 * @returns 两点之间距离的平方
 */
export function calculateDistanceSquaredWithVector3(point1: THREE.Vector3, point2: THREE.Vector3): number {
    return point1.distanceToSquared(point2);
}
