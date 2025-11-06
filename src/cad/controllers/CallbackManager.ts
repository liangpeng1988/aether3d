/**
 * 回调管理器
 * 用于管理Canvas3D组件中的各种回调函数引用
 */

import { MutableRefObject } from "react";
import { Aether3d } from '../../../Engine';
import { THREE } from "../../../Engine/core/global";
import type { PointLightConfig } from "../../../Engine";
import { Document as CADDocument } from '../data/Document';

export class CallbackManager {
  /**
   * 更新回调函数引用
   * @param refs 回调函数引用对象
   * @param callbacks 新的回调函数
   */
  public static updateCallbackRefs(
    refs: {
      onSceneReadyRef: MutableRefObject<((renderer: Aether3d) => void) | undefined>;
      onObjectSelectedRef: MutableRefObject<((object: THREE.Object3D | null) => void) | undefined>;
      onObjectHoveredRef: MutableRefObject<((object: THREE.Object3D | null) => void) | undefined>;
      onTransformChangeRef: MutableRefObject<((object: THREE.Object3D) => void) | undefined>;
      onTransformSpaceChangeRef: MutableRefObject<((space: 'world' | 'local') => void) | undefined>;
    },
    callbacks: {
      onSceneReady?: (renderer: Aether3d) => void;
      onObjectSelected?: (object: THREE.Object3D | null) => void;
      onObjectHovered?: (object: THREE.Object3D | null) => void;
      onTransformChange?: (object: THREE.Object3D) => void;
      onTransformSpaceChange?: (space: 'world' | 'local') => void;
    }
  ): void {
    refs.onSceneReadyRef.current = callbacks.onSceneReady;
    refs.onObjectSelectedRef.current = callbacks.onObjectSelected;
    refs.onObjectHoveredRef.current = callbacks.onObjectHovered;
    refs.onTransformChangeRef.current = callbacks.onTransformChange;
    refs.onTransformSpaceChangeRef.current = callbacks.onTransformSpaceChange;
  }

  /**
   * 调用场景准备就绪回调
   * @param onSceneReadyRef 场景准备就绪回调引用
   * @param renderer 渲染器实例
   */
  public static invokeOnSceneReady(
    onSceneReadyRef: MutableRefObject<((renderer: Aether3d) => void) | undefined>,
    renderer: Aether3d
  ): void {
    onSceneReadyRef.current?.(renderer);
  }

  /**
   * 调用对象选中回调
   * @param onObjectSelectedRef 对象选中回调引用
   * @param object 选中的对象
   */
  public static invokeOnObjectSelected(
    onObjectSelectedRef: MutableRefObject<((object: THREE.Object3D | null) => void) | undefined>,
    object: THREE.Object3D | null
  ): void {
    onObjectSelectedRef.current?.(object);
  }

  /**
   * 调用对象悬停回调
   * @param onObjectHoveredRef 对象悬停回调引用
   * @param object 悬停的对象
   */
  public static invokeOnObjectHovered(
    onObjectHoveredRef: MutableRefObject<((object: THREE.Object3D | null) => void) | undefined>,
    object: THREE.Object3D | null
  ): void {
    onObjectHoveredRef.current?.(object);
  }

  /**
   * 调用变换变化回调
   * @param onTransformChangeRef 变换变化回调引用
   * @param object 变换的对象
   */
  public static invokeOnTransformChange(
    onTransformChangeRef: MutableRefObject<((object: THREE.Object3D) => void) | undefined>,
    object: THREE.Object3D
  ): void {
    onTransformChangeRef.current?.(object);
  }

  /**
   * 调用坐标系变化回调
   * @param onTransformSpaceChangeRef 坐标系变化回调引用
   * @param space 新的坐标系
   */
  public static invokeOnTransformSpaceChange(
    onTransformSpaceChangeRef: MutableRefObject<((space: 'world' | 'local') => void) | undefined>,
    space: 'world' | 'local'
  ): void {
    onTransformSpaceChangeRef.current?.(space);
  }

  /**
   * 调用点光源变化回调
   * @param onPointLightsChange 点光源变化回调
   * @param lights 新的点光源配置
   */
  public static invokeOnPointLightsChange(
    onPointLightsChange: ((lights: PointLightConfig[]) => void) | undefined,
    lights: PointLightConfig[]
  ): void {
    onPointLightsChange?.(lights);
  }

  /**
   * 调用文档变化回调
   * @param onDocumentChange 文档变化回调
   * @param document 新的文档实例
   */
  public static invokeOnDocumentChange(
    onDocumentChange: ((document: CADDocument) => void) | undefined,
    document: CADDocument
  ): void {
    onDocumentChange?.(document);
  }
}