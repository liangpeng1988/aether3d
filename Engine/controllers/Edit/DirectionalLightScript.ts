import { ScriptBase } from "../../core/ScriptBase.ts";
import { THREE } from "../../core/global.ts";

/**
 * 平行光配置接口
 * 定义创建和控制平行光所需的所有参数
 */
export interface DirectionalLightConfig {
    /** 平行光唯一标识符 */
    id: string;
    /** 平行光名称 */
    name: string;
    /** 平行光位置坐标 */
    position: {
        x: number;
        y: number;
        z: number;
    };
    /** 平行光朝向目标 */
    target: {
        x: number;
        y: number;
        z: number;
    };
    /** 平行光颜色（十六进制字符串格式，如 "#ffffff"） */
    color: string;
    /** 平行光强度 */
    intensity: number;
}

/**
 * 平行光脚本类
 * 用于在场景中添加和控制平行光（类似太阳光）
 */
export class DirectionalLightScript extends ScriptBase {
    /** 平行光对象映射 */
    private directionalLights: Map<string, THREE.DirectionalLight> = new Map();

    /** 平行光配置映射 */
    private configs: Map<string, DirectionalLightConfig> = new Map();

    /** 平行光是否启用映射 */
    private enabledMap: Map<string, boolean> = new Map();

    /** 当前选中的光源ID */
    private selectedLightId: string | null = null;

    /**
     * 构造函数
     * @param configs 初始平行光配置数组
     */
    constructor(configs?: DirectionalLightConfig | DirectionalLightConfig[]) {
        super();
        this.name = "DirectionalLightScript";

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
     * 初始化平行光
     * 在脚本添加到场景时调用
     */
    public start(): void {
        // 为所有配置创建平行光
        for (const [id, config] of this.configs) {
            this.createLight(id, config);
        }
    }

    /**
     * 创建单个平行光
     * @param id 光源ID
     * @param config 光源配置
     */
    private createLight(id: string, config: DirectionalLightConfig): void {
        // 创建平行光
        const color = parseInt(config.color.replace('#', '0x'));
        const directionalLight = new THREE.DirectionalLight(
            color,
            config.intensity
        );

        // 设置位置
        directionalLight.position.set(
            config.position.x,
            config.position.y,
            config.position.z
        );

        // 创建并设置目标
        const target = new THREE.Object3D();
        target.position.set(
            config.target.x,
            config.target.y,
            config.target.z
        );
        
        if (this.scene) {
            this.scene.add(target);
        }
        
        directionalLight.target = target;

        // 启用阴影
        directionalLight.castShadow = true;
        
        // 设置阴影参数
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;

        // 设置用户数据
        directionalLight.userData = {
            id: config.id,
            name: config.name
        };

        // 添加到场景
        if (this.scene && this.isEnabled(id)) {
            this.scene.add(directionalLight);
        }

        // 存储引用
        this.directionalLights.set(id, directionalLight);
    }

    /**
     * 添加新的平行光
     * @param config 平行光配置
     */
    public addLight(config: DirectionalLightConfig): void {
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
     * 移除平行光
     * @param id 平行光ID
     */
    public removeLight(id: string): void {
        // 检查光源是否存在
        if (!this.configs.has(id)) {
            console.warn(`Light with ID ${id} does not exist`);
            return;
        }

        // 获取光源
        const light = this.directionalLights.get(id);

        // 从场景中移除
        if (light && light.parent) {
            // 同时移除目标对象
            if (light.target && light.target.parent) {
                light.target.parent.remove(light.target);
            }
            light.parent.remove(light);
        }

        // 从映射中删除
        this.directionalLights.delete(id);
        this.configs.delete(id);
        this.enabledMap.delete(id);

        // 如果删除的是选中的光源，则取消选择
        if (this.selectedLightId === id) {
            this.selectedLightId = null;
        }
    }

    /**
     * 更新平行光配置
     * @param id 平行光ID
     * @param config 新的平行光配置
     */
    public updateConfig(id: string, config: Partial<DirectionalLightConfig>): void {
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
        const light = this.directionalLights.get(id);
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

            // 更新位置
            if (config.position !== undefined) {
                light.position.set(
                    config.position.x ?? light.position.x,
                    config.position.y ?? light.position.y,
                    config.position.z ?? light.position.z
                );
            }

            // 更新目标位置
            if (config.target !== undefined && light.target) {
                light.target.position.set(
                    config.target.x ?? light.target.position.x,
                    config.target.y ?? light.target.position.y,
                    config.target.z ?? light.target.position.z
                );
            }
        }
    }

    /**
     * 启用平行光
     * @param id 平行光ID
     */
    public enable(id: string): void {
        // 检查光源是否存在
        if (!this.configs.has(id)) {
            console.warn(`Light with ID ${id} does not exist`);
            return;
        }

        this.enabledMap.set(id, true);

        const light = this.directionalLights.get(id);
        if (light && this.scene && !light.parent) {
            this.scene.add(light);
            // 同时添加目标对象
            if (light.target && !light.target.parent && this.scene) {
                this.scene.add(light.target);
            }
        }
    }

    /**
     * 禁用平行光
     * @param id 平行光ID
     */
    public disable(id: string): void {
        // 检查光源是否存在
        if (!this.configs.has(id)) {
            console.warn(`Light with ID ${id} does not exist`);
            return;
        }

        this.enabledMap.set(id, false);

        const light = this.directionalLights.get(id);
        if (light && light.parent) {
            light.parent.remove(light);
            // 同时移除目标对象
            if (light.target && light.target.parent) {
                light.target.parent.remove(light.target);
            }
        }
    }

    /**
     * 获取平行光是否启用
     * @param id 平行光ID
     * @returns 平行光启用状态
     */
    public isEnabled(id: string): boolean {
        return this.enabledMap.get(id) ?? false;
    }

    /**
     * 获取所有平行光配置
     * @returns 所有平行光配置映射
     */
    public getAllConfigs(): Map<string, DirectionalLightConfig> {
        return new Map(this.configs);
    }

    /**
     * 获取指定平行光配置
     * @param id 平行光ID
     * @returns 平行光配置或undefined
     */
    public getConfig(id: string): DirectionalLightConfig | undefined {
        return this.configs.get(id);
    }

    /**
     * 获取所有平行光对象
     * @returns 所有平行光对象映射
     */
    public getAllLights(): Map<string, THREE.DirectionalLight> {
        return new Map(this.directionalLights);
    }

    /**
     * 获取指定平行光对象
     * @param id 平行光ID
     * @returns THREE.DirectionalLight对象或undefined
     */
    public getLight(id: string): THREE.DirectionalLight | undefined {
        return this.directionalLights.get(id);
    }

    /**
     * 选择平行光
     * @param id 平行光ID
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
     * 取消选择平行光
     */
    public deselectLight(): void {
        this.selectedLightId = null;
    }

    /**
     * 获取当前选中的平行光ID
     * @returns 当前选中的平行光ID或null
     */
    public getSelectedLightId(): string | null {
        return this.selectedLightId;
    }

    /**
     * 获取当前选中的平行光配置
     * @returns 当前选中的平行光配置或undefined
     */
    public getSelectedLightConfig(): DirectionalLightConfig | undefined {
        if (this.selectedLightId) {
            return this.configs.get(this.selectedLightId);
        }
        return undefined;
    }

    /**
     * 获取当前选中的平行光对象
     * @returns 当前选中的平行光对象或undefined
     */
    public getSelectedLight(): THREE.DirectionalLight | undefined {
        if (this.selectedLightId) {
            return this.directionalLights.get(this.selectedLightId);
        }
        return undefined;
    }

    /**
     * 切换平行光的启用状态
     * @param id 平行光ID
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
        Array.from(this.directionalLights.values()).forEach(light => {
            if (light.parent) {
                // 同时移除目标对象
                if (light.target && light.target.parent) {
                    light.target.parent.remove(light.target);
                }
                light.parent.remove(light);
            }
        });

        // 清空所有映射
        this.directionalLights.clear();
        this.configs.clear();
        this.enabledMap.clear();
        this.selectedLightId = null;
    }
}