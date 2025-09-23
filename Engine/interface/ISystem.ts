/**
 * 系统扩展接口
 *
 * 定义系统组件必须实现的基本接口，用于标准化系统的行为规范。
 * 系统是引擎的核心组件，负责处理特定领域的功能，如物理、音频、动画等。
 */
export interface ISystem {
  /**
   * 系统名称
   */
  name: string;

  /**
   * 系统优先级，数字越小优先级越高
   */
  priority: number;

  /**
   * 系统是否启用
   */
  enabled: boolean;

  /**
   * 初始化系统
   */
  init(): Promise<void>;

  /**
   * 更新系统状态
   * @param deltaTime 帧时间差（秒）
   */
  update(deltaTime: number): void;

  /**
   * 渲染前调用
   */
  preRender?(): void;

  /**
   * 渲染后调用
   */
  postRender?(): void;

  /**
   * 销毁系统，释放资源
   */
  destroy(): Promise<void>;

  /**
   * 启用系统
   */
  enable(): void;

  /**
   * 禁用系统
   */
  disable(): void;
}
