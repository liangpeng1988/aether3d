import { THREE } from "../../../../Engine/core/global";

export interface SceneStats {
  objects: number;
  triangles: number;
  vertices: number;
  materials: number;
  textures: number;
}

/**
 * 计算场景统计信息
 */
export const calculateSceneStats = (scene: THREE.Scene): SceneStats => {
  let objects = 0;
  let triangles = 0;
  let vertices = 0;
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      objects++;
      
      // 统计面数和顶点数
      if (object.geometry) {
        const geometry = object.geometry;
        if (geometry.index) {
          triangles += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          triangles += geometry.attributes.position.count / 3;
        }
        if (geometry.attributes.position) {
          vertices += geometry.attributes.position.count;
        }
      }
      
      // 统计材质
      if (object.material) {
        const mats = Array.isArray(object.material) ? object.material : [object.material];
        mats.forEach(mat => {
          materials.add(mat);
          // 统计纹理
          Object.values(mat).forEach(value => {
            if (value instanceof THREE.Texture) {
              textures.add(value);
            }
          });
        });
      }
    }
  });

  return {
    objects,
    triangles: Math.floor(triangles),
    vertices,
    materials: materials.size,
    textures: textures.size
  };
};

/**
 * 更新FPS值，只有当FPS变化超过1时才更新，减少不必要的重渲染
 */
export const updateFpsValue = (prevFps: number, newFps: number): number => {
  if (Math.abs(prevFps - newFps) > 1) {
    return newFps;
  }
  return prevFps;
};