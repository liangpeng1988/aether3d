/**
 * 泛型事件发射器，支持类型安全的事件处理
 *
 * EventEmitter 是一个通用的事件系统实现，具有以下特点：
 * 1. 类型安全：通过泛型 EventMap 确保事件名称和数据类型的匹配
 * 2. 高性能：使用 Map 存储事件监听器，避免数组复制
 * 3. 灵活性：支持一次性监听器、移除监听器等常见功能
 * 4. 错误处理：事件处理函数中的异常不会影响其他监听器的执行
 *
 * 使用示例：
 * ```typescript
 * // 定义事件映射类型
 * interface MyEvents {
 *   'user-login': { userId: string; timestamp: number };
 *   'user-logout': { userId: string };
 * }
 *
 * // 创建事件发射器实例
 * const emitter = new EventEmitter<MyEvents>();
 *
 * // 注册事件监听器
 * emitter.on('user-login', (data) => {
 *   console.log(`User ${data.userId} logged in at ${data.timestamp}`);
 * });
 *
 * // 触发事件
 * emitter.emit('user-login', { userId: '123', timestamp: Date.now() });
 * ```
 */
export type EventCallback = (data?: unknown) => void;

export class EventEmitter<EventMap = Record<string, any>> {

    /**
     * 事件监听器列表
     * @private
     */
    private events: Map<string, EventCallback[]> = new Map();

    /**
     * 注册事件监听器
     *
     * 添加一个回调函数到指定事件的监听器列表中，当事件被触发时会调用该回调函数
     *
     * @template K 事件名称类型，必须是字符串、数字或符号类型
     * @param event 事件名称，用于标识要监听的事件类型
     * @param callback 回调函数，当事件被触发时会被调用
     *                 如果 EventMap 中定义了该事件，则回调函数参数类型会被自动推断
     *                 否则使用通用的 EventCallback 类型
     *
     * @example
     * ```typescript
     * // 类型安全的事件监听
     * emitter.on('user-login', (data) => {
     *   // data 类型被自动推断为 { userId: string; timestamp: number }
     *   console.log(`User ${data.userId} logged in`);
     * });
     *
     * // 通用事件监听（未在 EventMap 中定义的事件）
     * emitter.on('custom-event', (data) => {
     *   // data 类型为 unknown，需要手动处理类型
     *   console.log('Custom event triggered with data:', data);
     * });
     * ```
     */
    on<K extends string | number | symbol>(
        event: K,
        callback: K extends keyof EventMap ? (data: EventMap[K]) => void : EventCallback
    ): void {
        const eventKey = String(event);
        if (!this.events.has(eventKey)) {
            this.events.set(eventKey, []);
        }
        this.events.get(eventKey)!.push(callback as EventCallback);
    }

    /**
     * 取消事件监听器
     *
     * 从指定事件的监听器列表中移除指定的回调函数
     *
     * @template K 事件名称类型，必须是字符串、数字或符号类型
     * @param event 事件名称，用于标识要取消监听的事件类型
     * @param callback 要移除的回调函数引用，必须与注册时的引用相同
     *
     * @example
     * ```typescript
     * const handler = (data) => console.log(data);
     * emitter.on('example-event', handler);
     * // ... later
     * emitter.off('example-event', handler);
     * ```
     */
    off<K extends string | number | symbol>(
        event: K,
        callback: K extends keyof EventMap ? (data: EventMap[K]) => void : EventCallback
    ): void {
        const eventKey = String(event);
        const callbacks = this.events.get(eventKey);
        if (!callbacks) return;

        const index = callbacks.indexOf(callback as EventCallback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    /**
     * 触发事件
     *
     * 调用指定事件的所有监听器回调函数，并传递数据参数
     *
     * @template K 事件名称类型，必须是字符串、数字或符号类型
     * @param event 事件名称，用于标识要触发的事件类型
     * @param data 可选的数据参数，会传递给所有监听器回调函数
     *             如果 EventMap 中定义了该事件，则数据类型会被自动验证
     *
     * @example
     * ```typescript
     * // 触发带数据的事件
     * emitter.emit('user-login', { userId: '123', timestamp: Date.now() });
     *
     * // 触发不带数据的事件
     * emitter.emit('simple-event');
     * ```
     */
    emit<K extends string | number | symbol>(
        event: K,
        data?: K extends keyof EventMap ? EventMap[K] : any
    ): void {
        const eventKey = String(event);
        const callbacks = this.events.get(eventKey);
        if (!callbacks) return;

        // 使用迭代器避免数组复制，提升性能
        // 逐个调用回调函数，避免因某个回调函数异常影响其他回调函数执行
        for (const callback of callbacks) {
            try {
                callback(data);
            } catch (error) {
                // 捕获并记录回调函数中的异常，防止影响其他监听器
                console.error(`Error in event handler for ${eventKey}:`, error);
            }
        }
    }

    /**
     * 一次性事件监听器
     *
     * 添加一个只会被调用一次的事件监听器，触发后会自动移除
     *
     * @template K 事件名称类型，必须是字符串、数字或符号类型
     * @param event 事件名称，用于标识要监听的事件类型
     * @param callback 回调函数，当事件被触发时会被调用一次，然后自动移除
     *
     * @example
     * ```typescript
     * emitter.once('app-started', () => {
     *   console.log('Application started for the first time');
     * });
     * ```
     */
    once<K extends string | number | symbol>(
        event: K,
        callback: K extends keyof EventMap ? (data: EventMap[K]) => void : EventCallback
    ): void {
        // 创建一个包装函数，用于在调用后自动移除监听器
        const onceCallback: EventCallback = (data) => {
            // 移除监听器自身
            this.off(event, onceCallback as any);
            // 调用原始回调函数
            callback(data as any);
        };
        // 注册包装后的监听器
        this.on(event, onceCallback as any);
    }

    /**
     * 清除所有事件监听器
     *
     * 移除所有事件的所有监听器，释放内存
     *
     * @example
     * ```typescript
     * emitter.clear(); // 移除所有事件监听器
     * ```
     */
    clear(): void {
        this.events.clear();
    }
}
