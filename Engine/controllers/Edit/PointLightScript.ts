import { ScriptBase } from "../../core/ScriptBase.ts";
import { THREE } from "../../core/global.ts";

/**
 * 点光源配置接口
 * 定义创建和控制点光源所需的所有参数
 */
export interface PointLightConfig {
    /** 点光源唯一标识符 */
    id: string;
    /** 点光源名称 */
    name: string;
    /** 点光源位置坐标 */
    position: {
        x: number;
        y: number;
        z: number;
    };
    /** 点光源颜色（十六进制字符串格式，如 "#ff0000"） */
    color: string;
    /** 点光源强度 */
    intensity: number;
    /** 光源影响距离 */
    distance: number;
    /** 光源衰减系数 */
    decay: number;
}

/**
 * 点光源脚本类
 * 用于在场景中添加和控制点光源
 */
export class PointLightScript extends ScriptBase {
    /** 点光源对象映射 */
    private pointLights: Map<string, THREE.PointLight> = new Map();

    /** 点光源配置映射 */
    private configs: Map<string, PointLightConfig> = new Map();

    /** 点光源是否启用映射 */
    private enabledMap: Map<string, boolean> = new Map();

    /** 当前选中的光源ID */
    private selectedLightId: string | null = null;

    /**
     * 构造函数
     * @param configs 初始点光源配置数组
     */
    constructor(configs?: PointLightConfig | PointLightConfig[]) {
        super();

        if (configs) {
            if (Array.isArray(configs)) {
                configs.forEach(config => {
                    this.configs.set(config.id, config);
                    this.enabledMap.set(config.id, true);
                });
            } else {
                this.configs.set(configs.id, configs);
                this.enabledMap.set(configs.id, true);
            }
        }
    }

    /**
     * 初始化点光源
     * 在脚本添加到场景时调用
     */
    public start(): void {
        // 为所有配置创建点光源
        for (const [id, config] of this.configs) {
            this.createLight(id, config);
        }
    }

    /**
     * 创建单个点光源
     * @param id 光源ID
     * @param config 光源配置
     */
    private createLight(id: string, config: PointLightConfig): void {
        // 创建点光源
        const color = parseInt(config.color.replace('#', '0x'));
        const pointLight = new THREE.PointLight(
            color,
            config.intensity,
            config.distance,
            config.decay
        );

        // 设置位置
        pointLight.position.set(
            config.position.x,
            config.position.y,
            config.position.z
        );

        // 设置用户数据
        pointLight.userData = {
            id: config.id,
            name: config.name
        };

        // 添加到场景
        if (this.scene && this.isEnabled(id)) {
            this.scene.add(pointLight);
        }

        // 存储引用
        this.pointLights.set(id, pointLight);
    }

    /**
     * 添加新的点光源
     * @param config 点光源配置
     */
    public addLight(config: PointLightConfig): void {
        // 检查ID是否已存在
        if (this.configs.has(config.id)) {
            console.warn(`Light with ID ${config.id} already exists`);
            return;
        }

        // 存储配置
        this.configs.set(config.id, config);
        this.enabledMap.set(config.id, true);

        // 创建光源
        this.createLight(config.id, config);
    }

    /**
     * 移除点光源
     * @param id 点光源ID
     */
    public removeLight(id: string): void {
        // 检查光源是否存在
        if (!this.configs.has(id)) {
            console.warn(`Light with ID ${id} does not exist`);
            return;
        }

        // 获取光源
        const light = this.pointLights.get(id);

        // 从场景中移除
        if (light && light.parent) {
            light.parent.remove(light);
        }

        // 从映射中删除
        this.pointLights.delete(id);
        this.configs.delete(id);
        this.enabledMap.delete(id);

        // 如果删除的是选中的光源，则取消选择
        if (this.selectedLightId === id) {
            this.selectedLightId = null;
        }
    }

    /**
     * 更新点光源配置
     * @param id 点光源ID
     * @param config 新的点光源配置
     */
    public updateConfig(id: string, config: Partial<PointLightConfig>): void {
        // 检查光源是否存在
        if (!this.configs.has(id)) {
            console.warn(`Light with ID ${id} does not exist`);
            return;
        }

        // 更新配置
        const oldConfig = this.configs.get(id)!;
        const newConfig = { ...oldConfig, ...config };
        this.configs.set(id, newConfig);

        // 获取光源
        const light = this.pointLights.get(id);
        if (light) {
            // 更新颜色
            if (config.color !== undefined) {
                const color = parseInt(config.color.replace('#', '0x'));
                light.color.set(color as any);
            }

            // 更新强度
            if (config.intensity !== undefined) {
                light.intensity = config.intensity;
            }

            // 更新距离
            if (config.distance !== undefined) {
                light.distance = config.distance;
            }

            // 更新衰减
            if (config.decay !== undefined) {
                light.decay = config.decay;
            }

            // 更新位置
            if (config.position !== undefined) {
                light.position.set(
                    config.position.x ?? light.position.x,
                    config.position.y ?? light.position.y,
                    config.position.z ?? light.position.z
                );
            }
        }
    }

    /**
     * 启用点光源
     * @param id 点光源ID
     */
    public enable(id: string): void {
        // 检查光源是否存在
        if (!this.configs.has(id)) {
            console.warn(`Light with ID ${id} does not exist`);
            return;
        }

        this.enabledMap.set(id, true);

        const light = this.pointLights.get(id);
        if (light && this.scene && !light.parent) {
            this.scene.add(light);
        }
    }

    /**
     * 禁用点光源
     * @param id 点光源ID
     */
    public disable(id: string): void {
        // 检查光源是否存在
        if (!this.configs.has(id)) {
            console.warn(`Light with ID ${id} does not exist`);
            return;
        }

        this.enabledMap.set(id, false);

        const light = this.pointLights.get(id);
        if (light && light.parent) {
            light.parent.remove(light);
        }
    }

    /**
     * 获取点光源是否启用
     * @param id 点光源ID
     * @returns 点光源启用状态
     */
    public isEnabled(id: string): boolean {
        return this.enabledMap.get(id) ?? false;
    }

    /**
     * 获取所有点光源配置
     * @returns 所有点光源配置映射
     */
    public getAllConfigs(): Map<string, PointLightConfig> {
        return new Map(this.configs);
    }

    /**
     * 获取指定点光源配置
     * @param id 点光源ID
     * @returns 点光源配置或undefined
     */
    public getConfig(id: string): PointLightConfig | undefined {
        return this.configs.get(id);
    }

    /**
     * 获取所有点光源对象
     * @returns 所有点光源对象映射
     */
    public getAllLights(): Map<string, THREE.PointLight> {
        return new Map(this.pointLights);
    }

    /**
     * 获取指定点光源对象
     * @param id 点光源ID
     * @returns THREE.PointLight对象或undefined
     */
    public getLight(id: string): THREE.PointLight | undefined {
        return this.pointLights.get(id);
    }

    /**
     * 选择点光源
     * @param id 点光源ID
     */
    public selectLight(id: string): void {
        // 检查光源是否存在
        if (!this.configs.has(id)) {
            console.warn(`Light with ID ${id} does not exist`);
            return;
        }

        this.selectedLightId = id;
    }

    /**
     * 取消选择点光源
     */
    public deselectLight(): void {
        this.selectedLightId = null;
    }

    /**
     * 获取当前选中的点光源ID
     * @returns 当前选中的点光源ID或null
     */
    public getSelectedLightId(): string | null {
        return this.selectedLightId;
    }

    /**
     * 获取当前选中的点光源配置
     * @returns 当前选中的点光源配置或undefined
     */
    public getSelectedLightConfig(): PointLightConfig | undefined {
        if (this.selectedLightId) {
            return this.configs.get(this.selectedLightId);
        }
        return undefined;
    }

    /**
     * 获取当前选中的点光源对象
     * @returns 当前选中的点光源对象或undefined
     */
    public getSelectedLight(): THREE.PointLight | undefined {
        if (this.selectedLightId) {
            return this.pointLights.get(this.selectedLightId);
        }
        return undefined;
    }

    /**
     * 切换点光源的启用状态
     * @param id 点光源ID
     */
    public toggleLight(id: string): void {
        if (this.isEnabled(id)) {
            this.disable(id);
        } else {
            this.enable(id);
        }
    }

    /**
     * 在对象被销毁时调用
     */
    public destroy(): void {
        // 从场景中移除所有光源
        Array.from(this.pointLights.values()).forEach(light => {
            if (light.parent) {
                light.parent.remove(light);
            }
        });

        // 清空所有映射
        this.pointLights.clear();
        this.configs.clear();
        this.enabledMap.clear();
        this.selectedLightId = null;
    }
}
