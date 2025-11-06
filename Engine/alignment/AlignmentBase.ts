import * as THREE from 'three';

/**
 * 对齐系统基类 - 提供通用的对齐功能和方法
 */
export class AlignmentBase {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    raycaster: THREE.Raycaster;
    tempVector: THREE.Vector3;
    tempMatrix: THREE.Matrix4;
    tempBox: THREE.Box3;
    
    // 对齐配置
    snapThreshold: number;
    coordinateSystem: 'world' | 'local';
    alignmentMode: 'min' | 'center' | 'max';

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.tempVector = new THREE.Vector3();
        this.tempMatrix = new THREE.Matrix4();
        this.tempBox = new THREE.Box3();
        
        // 对齐配置
        this.snapThreshold = 0.5;
        this.coordinateSystem = 'world'; // 'world' 或 'local'
        this.alignmentMode = 'center'; // 'min', 'center', 'max'
    }
    
    /**
     * 计算对象的世界坐标包围盒
     */
    computeWorldBoundingBox(object: THREE.Object3D): THREE.Box3 {
        const box = new THREE.Box3();
        box.setFromObject(object);
        return box;
    }
    
    /**
     * 计算对象的局部坐标包围盒
     */
    computeLocalBoundingBox(object: THREE.Object3D): THREE.Box3 {
        const box = new THREE.Box3();
        const geometry = (object as any).geometry;
        
        if (geometry) {
            // 使用几何体的边界框（局部坐标）
            if (geometry.boundingBox === null) {
                geometry.computeBoundingBox();
            }
            box.copy(geometry.boundingBox);
            
            // 应用对象的缩放
            box.min.multiply(object.scale);
            box.max.multiply(object.scale);
        }
        
        return box;
    }
    
    /**
     * 坐标系统一转换
     */
    transformToCoordinateSystem(vector: THREE.Vector3, object: THREE.Object3D, targetSystem: 'world' | 'local'): THREE.Vector3 {
        if (targetSystem === 'world') {
            return object.localToWorld(vector.clone());
        } else {
            return object.worldToLocal(vector.clone());
        }
    }
    
    /**
     * 获取包围盒的基准点
     */
    getBoundingBoxReference(box: THREE.Box3, mode: 'min' | 'center' | 'max'): THREE.Vector3 {
        const reference = new THREE.Vector3();
        
        switch (mode) {
            case 'min':
                reference.copy(box.min);
                break;
            case 'max':
                reference.copy(box.max);
                break;
            case 'center':
            default:
                box.getCenter(reference);
        }
        
        return reference;
    }
}