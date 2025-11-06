import * as THREE from 'three';
import { AlignmentBase } from './AlignmentBase';

/**
 * 对象对齐功能 - 基于包围盒计算的最小/中心/最大基准对齐
 */
export class ObjectAligner extends AlignmentBase {
    alignmentHistory: any[];

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        super(scene, camera, renderer);
        this.alignmentHistory = [];
    }
    
    /**
     * 多对象包围盒对齐
     */
    alignObjects(objects: THREE.Object3D[], targetPosition: THREE.Vector3, alignmentType: 'min' | 'center' | 'max' = 'center', coordinateSystem: 'world' | 'local' = 'world'): THREE.Vector3 | null {
        if (objects.length === 0) return null;
        
        // 计算组合包围盒
        const combinedBox = this.computeCombinedBoundingBox(objects, coordinateSystem);
        const referencePoint = this.getBoundingBoxReference(combinedBox, alignmentType);
        
        // 计算偏移量
        const offset = new THREE.Vector3().subVectors(targetPosition, referencePoint);
        
        // 应用对齐
        objects.forEach(obj => {
            this.applyAlignment(obj, offset, coordinateSystem);
        });
        
        // 记录操作历史
        this.recordAlignment(objects, offset, alignmentType);
        
        return offset;
    }
    
    /**
     * 计算多个对象的组合包围盒
     */
    computeCombinedBoundingBox(objects: THREE.Object3D[], coordinateSystem: 'world' | 'local'): THREE.Box3 {
        const combinedBox = new THREE.Box3();
        
        objects.forEach(obj => {
            let bbox;
            if (coordinateSystem === 'world') {
                bbox = this.computeWorldBoundingBox(obj);
            } else {
                bbox = this.computeLocalBoundingBox(obj);
            }
            combinedBox.union(bbox);
        });
        
        return combinedBox;
    }
    
    /**
     * 应用对齐变换
     */
    applyAlignment(object: THREE.Object3D, offset: THREE.Vector3, coordinateSystem: 'world' | 'local'): void {
        if (coordinateSystem === 'world') {
            // 世界坐标系 - 直接调整位置
            object.position.add(offset);
        } else {
            // 局部坐标系 - 需要应用变换矩阵
            this.tempMatrix.makeTranslation(offset.x, offset.y, offset.z);
            object.applyMatrix4(this.tempMatrix);
        }
        
        object.updateMatrixWorld(true);
    }
    
    /**
     * 相对对齐（对象间对齐）
     */
    alignRelative(sourceObjects: THREE.Object3D[], targetObject: THREE.Object3D, alignmentType: 'min' | 'center' | 'max' = 'center', coordinateSystem: 'world' | 'local' = 'world'): THREE.Vector3 | null {
        const targetBox = coordinateSystem === 'world' ? 
            this.computeWorldBoundingBox(targetObject) : 
            this.computeLocalBoundingBox(targetObject);
        
        const targetReference = this.getBoundingBoxReference(targetBox, alignmentType);
        
        return this.alignObjects(sourceObjects, targetReference, alignmentType, coordinateSystem);
    }
    
    /**
     * 分布对齐（等间距分布）
     */
    distributeObjects(objects: THREE.Object3D[], direction: 'x' | 'y' | 'z' = 'x', spacing: number = 0): void {
        if (objects.length < 2) return;
        
        // 按指定方向排序对象
        const sortedObjects = this.sortObjectsByDirection(objects, direction);
        
        // 计算总长度和间距
        const totalLength = this.calculateDistributionLength(sortedObjects, direction);
        const actualSpacing = spacing > 0 ? spacing : totalLength / (sortedObjects.length - 1);
        
        // 应用分布
        let currentPosition = 0;
        sortedObjects.forEach((obj, index) => {
            const newPosition = new THREE.Vector3();
            
            // 根据方向设置新位置，避免使用字符串索引
            switch (direction) {
                case 'x':
                    newPosition.setX(currentPosition);
                    newPosition.setY(obj.position.y);
                    newPosition.setZ(obj.position.z);
                    break;
                case 'y':
                    newPosition.setX(obj.position.x);
                    newPosition.setY(currentPosition);
                    newPosition.setZ(obj.position.z);
                    break;
                case 'z':
                    newPosition.setX(obj.position.x);
                    newPosition.setY(obj.position.y);
                    newPosition.setZ(currentPosition);
                    break;
            }
            
            obj.position.copy(newPosition);
            
            if (index < sortedObjects.length - 1) {
                const objSize = this.getObjectSize(obj, direction);
                currentPosition += objSize + actualSpacing;
            }
        });
    }
    
    /**
     * 按指定方向排序对象
     */
    sortObjectsByDirection(objects: THREE.Object3D[], direction: 'x' | 'y' | 'z'): THREE.Object3D[] {
        return [...objects].sort((a, b) => {
            switch (direction) {
                case 'x': return a.position.x - b.position.x;
                case 'y': return a.position.y - b.position.y;
                case 'z': return a.position.z - b.position.z;
                default: return 0;
            }
        });
    }
    
    /**
     * 计算分布长度
     */
    calculateDistributionLength(objects: THREE.Object3D[], direction: 'x' | 'y' | 'z'): number {
        if (objects.length < 2) return 0;
        
        const sorted = this.sortObjectsByDirection(objects, direction);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        
        switch (direction) {
            case 'x': return Math.abs(last.position.x - first.position.x);
            case 'y': return Math.abs(last.position.y - first.position.y);
            case 'z': return Math.abs(last.position.z - first.position.z);
            default: return 0;
        }
    }
    
    /**
     * 获取对象在指定方向上的尺寸
     */
    getObjectSize(object: THREE.Object3D, direction: 'x' | 'y' | 'z'): number {
        const box = this.computeWorldBoundingBox(object);
        const size = new THREE.Vector3();
        box.getSize(size);
        
        switch (direction) {
            case 'x': return size.x;
            case 'y': return size.y;
            case 'z': return size.z;
            default: return 0;
        }
    }
    
    /**
     * 记录对齐操作历史（支持撤销）
     */
    recordAlignment(objects: THREE.Object3D[], offset: THREE.Vector3, alignmentType: string): void {
        const historyEntry = {
            objects: objects.map(obj => ({ 
                object: obj, 
                originalPosition: obj.position.clone(),
                originalMatrix: obj.matrix.clone() 
            })),
            offset: offset.clone(),
            alignmentType,
            timestamp: Date.now()
        };
        
        this.alignmentHistory.push(historyEntry);
        
        // 限制历史记录长度
        if (this.alignmentHistory.length > 50) {
            this.alignmentHistory.shift();
        }
    }
}