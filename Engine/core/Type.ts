// 向量类型
import {THREE} from "./global.ts";

export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

// 颜色类型
export interface Color {
    r: number;
    g: number;
    b: number;
    a?: number;
}


// 资源类型
export interface Asset {
    id: string;
    type: 'texture' | 'model' | 'audio' | 'json';
    url: string;
    data?: unknown;
}

export interface Rect {
    width: number;
    height: number;
}

/**
 * RGB 转 HSV
 * @param r Red 颜色分量，范围 0-255
 * @param g Green 颜色分量，范围 0-255
 * @param b Blue 颜色分量，范围 0-255
 * @returns HSV 颜色数组 [h, s, v]
 */
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0, s = 0;
    const v = max;
    if (delta !== 0) {
        s = delta / max;
        const dR = (((max - r) / 6) + (delta / 2)) / delta;
        const dG = (((max - g) / 6) + (delta / 2)) / delta;
        const dB = (((max - b) / 6) + (delta / 2)) / delta;
        h = delta === max ? dR : (delta === g ? dG + 2 : dB + 4);
        h *= 60;
        if (h < 0) h += 360;
    }
    return [h, s, v];
}

/**
 * HSV 转 RGB
 * @param h Hue 色调，范围 0-360
 * @param s Saturation 饱和度，范围 0-1
 * @param v Value 亮度，范围 0-1
 * @returns RGB 数组 [r, g, b]
 */
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let r = 0, g = 0;
    const b = 0;
    if (0 <= h && h < 60) { r = c; g = x; }
    else if (60 <= h && h < 120) { r = x; g = c; }
    else if (120 <= h && h < 180) { r = 0; g = c; }
    else if (180 <= h && h < 240) { r = 0; g = x; }
    else if (240 <= h && h < 300) { r = x; g = 0; }
    else { r = c; g = 0; }
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

/**
 * 颜色格式转换工具函数
 * 提供各种颜色格式之间的转换
 */

/**
 * 将十六进制颜色字符串转换为数值格式
 * @param hexColor 十六进制颜色字符串，支持 '#RRGGBB' 或 '#RGB' 格式
 * @returns 十六进制数值，如 0x4a90e2
 *
 * @example
 * ```typescript
 * hexToNumber('#17171b') // 返回 0x17171b (1513243)
 * hexToNumber('#4a90e2') // 返回 0x4a90e2 (4886754)
 * hexToNumber('#fff')    // 返回 0xffffff (16777215)
 * hexToNumber('17171b')  // 返回 0x17171b (支持不带#的格式)
 * ```
 */
export function hexToNumber(hexColor: string): number {
    // 移除可能的 # 前缀
    let cleanHex = hexColor.replace('#', '');

    // 处理 3 位简写格式 (如 #fff -> #ffffff)
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(char => char + char).join('');
    }

    // 验证格式
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        console.warn(`[ColorUtils] 无效的十六进制颜色格式: ${hexColor}`);
        return 0x000000; // 默认返回黑色
    }

    // 转换为数值
    return parseInt(cleanHex, 16);
}

/**
 * 将数值格式的颜色转换为十六进制字符串
 * @param colorNumber 颜色数值，如 0x4a90e2
 * @param includeHash 是否包含 # 前缀，默认为 true
 * @returns 十六进制颜色字符串
 *
 * @example
 * ```typescript
 * numberToHex(0x4a90e2)        // 返回 '#4a90e2'
 * numberToHex(0x17171b, false) // 返回 '17171b'
 * numberToHex(16777215)        // 返回 '#ffffff'
 * ```
 */
export function numberToHex(colorNumber: number, includeHash: boolean = true): string {
    // 确保数值在有效范围内
    const clampedNumber = Math.max(0, Math.min(0xffffff, Math.floor(colorNumber)));

    // 转换为十六进制字符串，并补齐 6 位
    let hexString = clampedNumber.toString(16);
    while (hexString.length < 6) {
        hexString = '0' + hexString;
    }

    return includeHash ? `#${hexString}` : hexString;
}

/**
 * 验证十六进制颜色字符串格式
 * @param hexColor 十六进制颜色字符串
 * @returns 是否为有效格式
 *
 * @example
 * ```typescript
 * isValidHexColor('#4a90e2') // 返回 true
 * isValidHexColor('#fff')    // 返回 true
 * isValidHexColor('4a90e2')  // 返回 true
 * isValidHexColor('#gggggg') // 返回 false
 * ```
 */
export function isValidHexColor(hexColor: string): boolean {
    const cleanHex = hexColor.replace('#', '');
    return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex);
}

/**
 * 从十六进制颜色提取 RGB 分量
 * @param hexColor 十六进制颜色字符串或数值
 * @returns RGB 分量对象 {r, g, b}，范围 0-255
 *
 * @example
 * ```typescript
 * extractRGB('#4a90e2')  // 返回 {r: 74, g: 144, b: 226}
 * extractRGB(0x4a90e2)   // 返回 {r: 74, g: 144, b: 226}
 * ```
 */
export function extractRGB(hexColor: string | number): {r: number, g: number, b: number} {
    let colorNumber: number;

    if (typeof hexColor === 'string') {
        colorNumber = hexToNumber(hexColor);
    } else {
        colorNumber = hexColor;
    }

    return {
        r: (colorNumber >> 16) & 0xff,
        g: (colorNumber >> 8) & 0xff,
        b: colorNumber & 0xff
    };
}

/**
 * 从 RGB 分量创建十六进制颜色
 * @param r 红色分量，范围 0-255
 * @param g 绿色分量，范围 0-255
 * @param b 蓝色分量，范围 0-255
 * @returns 十六进制颜色数值
 *
 * @example
 * ```typescript
 * createColorFromRGB(74, 144, 226)  // 返回 0x4a90e2
 * createColorFromRGB(255, 255, 255) // 返回 0xffffff
 * ```
 */
export function createColorFromRGB(r: number, g: number, b: number): number {
    // 确保分量在有效范围内
    const clampedR = Math.max(0, Math.min(255, Math.floor(r)));
    const clampedG = Math.max(0, Math.min(255, Math.floor(g)));
    const clampedB = Math.max(0, Math.min(255, Math.floor(b)));

    return (clampedR << 16) | (clampedG << 8) | clampedB;
}


/**
 * 类型安全工具类
 * 提供类型检查和安全的类型转换功能
 */

/**
 * 检查对象是否具有指定属性
 */
export function hasProperty<T extends object, K extends string>(
    obj: T,
    prop: K
): obj is T & Record<K, unknown> {
    return prop in obj;
}

/**
 * 检查对象是否具有指定方法
 */
export function hasMethod<T extends object, K extends string>(
    obj: T,
    method: K
): obj is T & Record<K, (...args: unknown[]) => unknown> {
    return hasProperty(obj, method) && typeof (obj as Record<K, unknown>)[method] === 'function';
}

/**
 * 安全的属性访问
 */
export function safeGet<T extends object, K extends keyof T>(
    obj: T,
    key: K
): T[K] | undefined {
    return key in obj ? obj[key] : undefined;
}

/**
 * 安全的方法调用
 */
export function safeCall<T extends object, K extends string, R>(
    obj: T,
    method: K,
    ...args: unknown[]
): R | null {
    if (hasMethod(obj, method)) {
        try {
            return (obj as Record<K, (...args: unknown[]) => R>)[method](...args);
        } catch (error) {
            console.error(`[TypeUtils] 方法调用失败: ${method}`, error);
            return null;
        }
    }
    return null;
}

/**
 * 类型守卫：检查是否为函数
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === 'function';
}

/**
 * 类型守卫：检查是否为对象
 */
export function isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null;
}

/**
 * 类型守卫：检查是否为数组
 */
export function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

/**
 * 类型守卫：检查是否为字符串
 */
export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

/**
 * 类型守卫：检查是否为数字
 */
export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
}

/**
 * 类型守卫：检查是否为布尔值
 */
export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

/**
 * 类型守卫：检查是否为null或undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
    return value === null || value === undefined;
}

/**
 * 安全的类型转换
 */
export function safeCast<T>(value: unknown, typeGuard: (value: unknown) => value is T): T | null {
    return typeGuard(value) ? value : null;
}

/**
 * 创建类型安全的Map
 */
export function createTypedMap<K, V>(): Map<K, V> {
    return new Map<K, V>();
}

/**
 * 类型安全的对象合并
 */
export function mergeObjects<T extends object, U extends object>(target: T, source: U): T & U {
    return { ...target, ...source };
}

/**
 * 深度克隆对象（类型安全）
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as T;
    }

    if (obj instanceof Array) {
        return obj.map(item => deepClone(item)) as T;
    }

    if (typeof obj === 'object') {
        const clonedObj = {} as T;
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                (clonedObj as Record<string, unknown>)[key] = deepClone((obj as Record<string, unknown>)[key]);
            }
        }
        return clonedObj;
    }

    return obj;
}

/**
 * 类型安全的异步函数包装器
 */
export async function safeAsync<T>(
    fn: () => Promise<T>,
    fallback?: T
): Promise<T | null> {
    try {
        return await fn();
    } catch (error) {
        console.error('[TypeUtils] 异步函数执行失败:', error);
        return fallback || null;
    }
}

/**
 * 类型安全的同步函数包装器
 */
export function safeSync<T>(
    fn: () => T,
    fallback?: T
): T | null {
    try {
        return fn();
    } catch (error) {
        console.error('[TypeUtils] 同步函数执行失败:', error);
        return fallback || null;
    }
}

/**
 * 创建类型安全的配置对象
 */
export function createConfig<T extends object>(defaultConfig: T, userConfig?: Partial<T>): T {
    return mergeObjects(defaultConfig, userConfig || {});
}

/**
 * 验证对象是否包含必需的属性
 */
export function validateRequiredProperties<T extends object>(
    obj: T,
    requiredProps: (keyof T)[]
): boolean {
    return requiredProps.every(prop => hasProperty(obj, prop as string));
}

/**
 * 类型安全的属性访问链
 */
export function getNestedProperty<T>(obj: unknown, path: string[]): T | undefined {
    let current = obj;

    for (const key of path) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return undefined;
        }

        if (!hasProperty(current as object, key)) {
            return undefined;
        }

        current = (current as Record<string, unknown>)[key];
    }

    return current as T;
}

/**
 * 类型安全的属性设置
 */
export function setNestedProperty<T>(obj: unknown, path: string[], value: T): boolean {
    if (path.length === 0) return false;

    let current = obj as Record<string, unknown>;

    // 遍历到倒数第二个路径
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];

        if (current === null || current === undefined) {
            current = {};
        }

        if (!hasProperty(current, key) || !isObject(current[key])) {
            current[key] = {};
        }

        current = current[key] as Record<string, unknown>;
    }

    // 设置最后一个属性
    const lastKey = path[path.length - 1];
    if (current !== null && current !== undefined && typeof current === 'object') {
        current[lastKey] = value;
        return true;
    }

    return false;
}

// 自定义类型守卫函数
export function isMesh(object: THREE.Object3D): object is THREE.Mesh {
    // 判断对象是否具有 Mesh 实例的特征
    return (object instanceof THREE.Mesh);
    // 或者进行更精确的判断
    // return (object as Mesh).isMesh === true;
}
