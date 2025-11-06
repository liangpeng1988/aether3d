/**
 * 图层信息接口
 * 定义图层的数据结构和相关操作说明
 */
export interface ILayer {
  /** 图层唯一标识符 */
  id: string;
  
  /** 图层名称 */
  name: string;
  
  /** 图层颜色 */
  color: string;
  
  /** 图层可见性状态 */
  visible: boolean;
  
  /** 图层锁定状态 */
  locked: boolean;
  
  /** 图层透明度 (可选) */
  opacity?: number;
  
  /** 图层描述信息 (可选) */
  description?: string;

}