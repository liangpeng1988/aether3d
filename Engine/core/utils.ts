import { THREE } from "./global";

/**
 * 屏幕坐标到世界坐标的转换
 * @param x 屏幕X坐标
 * @param y 屏幕Y坐标
 * @param canvas HTML画布元素
 * @param camera 相机实例
 * @returns 世界坐标
 */
export const screenToWorld = (
  x: number, 
  y: number, 
  canvas: HTMLCanvasElement, 
  camera: THREE.Camera
): THREE.Vector3 => {
  // 将屏幕坐标转换为标准化设备坐标(NDC)
  const mouse = new THREE.Vector2();
  mouse.x = (x / canvas.clientWidth) * 2 - 1;
  mouse.y = -(y / canvas.clientHeight) * 2 + 1;
  
  // 使用射线投射到XZ平面上
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  
  // 创建XZ平面(法向量为(0,1,0)，距离为0)
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const intersection = new THREE.Vector3();
  
  if (raycaster.ray.intersectPlane(plane, intersection)) {
    // 强制Y坐标为0，确保点在XZ平面上
    intersection.y = 0;
    return intersection;
  }
  
  return new THREE.Vector3(0, 0, 0);
};

/**
 * 世界坐标到屏幕坐标的转换
 * @param point 世界坐标点
 * @param canvas HTML画布元素
 * @param camera 相机实例
 * @returns 屏幕坐标
 */
export const worldToScreen = (
  point: THREE.Vector3, 
  canvas: HTMLCanvasElement, 
  camera: THREE.Camera
): THREE.Vector2 => {
  // 将世界坐标转换为标准化设备坐标(NDC)
  const vector = point.clone();
  vector.project(camera);
  
  // 转换为屏幕坐标
  const screenX = (vector.x + 1) / 2 * canvas.clientWidth;
  const screenY = (-vector.y + 1) / 2 * canvas.clientHeight;
  
  return new THREE.Vector2(screenX, screenY);
};