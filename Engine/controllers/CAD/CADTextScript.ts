import { THREE } from "../../core/global";
import { ScriptBase } from "../../core/ScriptBase";

/**
 * CAD文本配置接口
 */
export interface CADTextConfig {
    /** 文本颜色 */
    textColor?: number;
    /** 文本大小 */
    textSize?: number;
    /** 字体 */
    fontFamily?: string;
}

export class CADTextScript extends ScriptBase {
    name = 'CADTextScript';
    
    /** 配置参数 */
    private config: Required<CADTextConfig>;
    
    /** 文字材质 */
    private textMaterial: THREE.MeshBasicMaterial;
    
    /** 所有文本对象 */
    private texts: THREE.Mesh[] = [];
    
    constructor(options?: CADTextConfig) {
        super();
        // 合并默认配置和用户配置
        this.config = {
            textColor: 0xffffff, // 白色
            textSize: 1,
            fontFamily: 'Arial',
            ...options
        };
        
        // 创建材质
        this.textMaterial = new THREE.MeshBasicMaterial({
            color: this.config.textColor
        });
    }
    
    /**
     * 脚本初始化
     */
    public override async start(): Promise<void> {
        super.start?.();
        console.log('[CADTextScript] 初始化完成');
    }
    
    /**
     * 每帧更新
     */
    public override update(deltaTime: number): void {
        super.update?.(deltaTime);
    }
    
    /**
     * 脚本销毁
     */
    public override destroy(): void {
        super.destroy?.();
        this.clearAllTexts();
    }
    
    /**
     * 创建文本
     * @param text 文本内容
     * @param position 文本位置
     * @param options 文本选项
     * @returns 文本对象
     */
    createText(text: string, position: THREE.Vector3, options?: { 
        color?: number, 
        size?: number 
    }): THREE.Mesh | null {
        if (!this.scene) {
            console.warn('[CADTextScript] 场景未初始化');
            return null;
        }
        
        // 创建简单的文本表示（在实际项目中，您可能需要使用TextGeometry）
        const size = options?.size || this.config.textSize;
        const color = options?.color || this.config.textColor;
        
        // 创建一个简单的几何体来表示文本
        const geometry = new THREE.BoxGeometry(size * 0.6, size * 0.3, 0.1);
        const material = new THREE.MeshBasicMaterial({ color });
        const textMesh = new THREE.Mesh(geometry, material);
        
        textMesh.position.copy(position);
        textMesh.userData = { text, size, color };
        
        this.texts.push(textMesh);
        this.scene.add(textMesh);
        
        return textMesh;
    }
    
    /**
     * 更新文本内容
     * @param textMesh 文本对象
     * @param newText 新文本内容
     */
    updateText(textMesh: THREE.Mesh, newText: string): void {
        textMesh.userData.text = newText;
        // 在实际项目中，您需要重新创建几何体来显示新文本
    }
    
    /**
     * 删除文本
     * @param textMesh 要删除的文本对象
     */
    removeText(textMesh: THREE.Mesh): void {
        const index = this.texts.indexOf(textMesh);
        if (index !== -1) {
            this.scene?.remove(textMesh);
            if (textMesh.geometry) {
                textMesh.geometry.dispose();
            }
            if (textMesh.material instanceof THREE.Material) {
                textMesh.material.dispose();
            }
            this.texts.splice(index, 1);
            console.log('[CADTextScript] 文本已删除');
        }
    }
    
    /**
     * 清除所有文本
     */
    clearAllTexts(): void {
        for (const text of this.texts) {
            this.scene?.remove(text);
            if (text.geometry) {
                text.geometry.dispose();
            }
            if (text.material instanceof THREE.Material) {
                text.material.dispose();
            }
        }
        this.texts = [];
        console.log('[CADTextScript] 所有文本已清除');
    }
    
    /**
     * 设置文本颜色
     * @param color 颜色值
     */
    setTextColor(color: number): void {
        this.config.textColor = color;
        this.textMaterial.color.set(color);
    }
    
    /**
     * 获取所有文本
     * @returns 文本数组
     */
    getTexts(): THREE.Mesh[] {
        return [...this.texts];
    }
}