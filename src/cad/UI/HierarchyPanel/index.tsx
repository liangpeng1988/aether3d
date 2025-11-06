import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import './style.css';
import { Document, LineData, ModelData } from '../../data/Document';
import { LayerManagerService } from '../../controllers/LayerManagerService';
import { ILayer } from '../../../../Engine/interface/ILayer';

interface HierarchyPanelProps {
  /** Canvas3D 渲染器引用 */
  renderer: any | null;
  /** 选中对象时的回调 */
  onObjectSelected?: (object: THREE.Object3D | null) => void;
  /** 当前选中的对象 */
  selectedObject?: THREE.Object3D | null;
  /** Document 实例 */
  document?: Document | null;
}

interface TreeNode {
  object: THREE.Object3D;
  name: string;
  type: string;
  visible: boolean;
  children: TreeNode[];
  expanded: boolean;
}

const HierarchyPanel: React.FC<HierarchyPanelProps> = ({
  renderer,
  onObjectSelected,
  selectedObject,
  document
}) => {
  const [sceneTree, setSceneTree] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['Scene']));
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const editInputRef = React.useRef<HTMLInputElement>(null);

  // 构建场景树
  useEffect(() => {
    if (document) {
      // 构建基于 Document 数据的树结构
      buildTreeFromDocument();
    } else if (renderer) {
      // 保持原有的场景树构建逻辑（向后兼容）
      buildTreeFromScene();
    }

    // 每秒更新一次场景树（可以根据需要调整频率）
    const interval = setInterval(() => {
      if (document) {
        buildTreeFromDocument();
      } else if (renderer?.scene) {
        buildTreeFromScene();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [renderer, document, expandedNodes]);

  // 从 Document 构建树结构
  const buildTreeFromDocument = () => {
    if (!document) return;

    // 构建实体分类节点
    const rootNode: TreeNode = {
      object: document as unknown as THREE.Object3D, // 类型转换以兼容接口
      name: 'Collection',
      type: 'Scene',
      visible: true,
      children: [],
      expanded: expandedNodes.has('Scene')
    };

    // 添加线条分类节点
    const lines = document.getAllLines();
    if (lines.length > 0) {
      const linesNode: TreeNode = {
        object: document as unknown as THREE.Object3D,
        name: `线条 (${lines.length})`,
        type: 'LinesGroup',
        visible: true,
        children: lines.map(line => ({
          object: document as unknown as THREE.Object3D,
          name: `Line_${line.id}`,
          type: 'LineData',
          visible: true,
          children: [],
          expanded: false
        })),
        expanded: expandedNodes.has('LinesGroup')
      };
      rootNode.children.push(linesNode);
    }

    // 添加模型分类节点
    const models = document.getAllModels();
    if (models.length > 0) {
      const modelsNode: TreeNode = {
        object: document as unknown as THREE.Object3D,
        name: `模型 (${models.length})`,
        type: 'ModelsGroup',
        visible: true,
        children: models.map(model => ({
          object: document as unknown as THREE.Object3D,
          name: model.name || `Model_${model.id}`,
          type: 'ModelData',
          visible: model.visible,
          children: [],
          expanded: false
        })),
        expanded: expandedNodes.has('ModelsGroup')
      };
      rootNode.children.push(modelsNode);
    }

    // 添加图层分类节点，使用图层管理服务过滤掉图层0
    // 由于图层管理已移至LayerController，这里需要从外部传入图层数据
    // 暂时注释掉图层显示部分，因为需要从外部获取图层数据
    // if (document && typeof document.getAllLayers === 'function') {
    //   // 获取所有图层并过滤掉系统图层
    //   const allLayers = document.getAllLayers();
    //   const userLayers = allLayers.filter(layer => layer.id !== 'layer0');
    //   if (userLayers.length > 0) {
    //     const layersNode: TreeNode = {
    //       object: document as unknown as THREE.Object3D,
    //       name: `图层 (${userLayers.length})`,
    //       type: 'LayersGroup',
    //       visible: true,
    //       children: userLayers.map(layer => ({
    //         object: document as unknown as THREE.Object3D,
    //         name: layer.name || `Layer_${layer.id}`,
    //         type: 'LayerData',
    //         visible: layer.visible,
    //         children: [],
    //         expanded: false
    //       })),
    //       expanded: expandedNodes.has('LayersGroup')
    //     };
    //     rootNode.children.push(layersNode);
    //   }
    // }

    // 添加材质分类节点
    const materials = document.getAllMaterials();
    if (materials.length > 0) {
      const materialsNode: TreeNode = {
        object: document as unknown as THREE.Object3D,
        name: `材质 (${materials.length})`,
        type: 'MaterialsGroup',
        visible: true,
        children: materials.map(material => ({
          object: document as unknown as THREE.Object3D,
          name: material.type || `Material_${material.id}`,
          type: 'MaterialData',
          visible: true,
          children: [],
          expanded: false
        })),
        expanded: expandedNodes.has('MaterialsGroup')
      };
      rootNode.children.push(materialsNode);
    }

    // 添加纹理分类节点
    const textures = document.getAllTextures();
    if (textures.length > 0) {
      const texturesNode: TreeNode = {
        object: document as unknown as THREE.Object3D,
        name: `纹理 (${textures.length})`,
        type: 'TexturesGroup',
        visible: true,
        children: textures.map(texture => ({
          object: document as unknown as THREE.Object3D,
          name: texture.url || `Texture_${texture.id}`,
          type: 'TextureData',
          visible: true,
          children: [],
          expanded: false
        })),
        expanded: expandedNodes.has('TexturesGroup')
      };
      rootNode.children.push(texturesNode);
    }

    // 添加几何体分类节点
    const geometries = document.getAllGeometries();
    if (geometries.length > 0) {
      const geometriesNode: TreeNode = {
        object: document as unknown as THREE.Object3D,
        name: `几何体 (${geometries.length})`,
        type: 'GeometriesGroup',
        visible: true,
        children: geometries.map(geometry => ({
          object: document as unknown as THREE.Object3D,
          name: geometry.type || `Geometry_${geometry.id}`,
          type: 'GeometryData',
          visible: true,
          children: [],
          expanded: false
        })),
        expanded: expandedNodes.has('GeometriesGroup')
      };
      rootNode.children.push(geometriesNode);
    }

    // 添加场景对象节点
    if (renderer?.scene) {
      const sceneObjectsNode = buildTreeFromSceneObject(renderer.scene);
      if (sceneObjectsNode) {
        rootNode.children.push(sceneObjectsNode);
      }
    }

    setSceneTree([rootNode]);
  };

  // 从场景构建树结构（原有逻辑）
  const buildTreeFromScene = () => {
    if (!renderer) return;

    // 需要过滤的辅助对象名称和类型
    const shouldFilterObject = (object: THREE.Object3D): boolean => {
      // 按名称过滤
      const filteredNames = [
        'TransformControlsHelper',
        'TransformControlsGizmo',
        'TransformControlsPlane',
        'GridHelper',
        'AxesHelper'
      ];
      if (filteredNames.includes(object.name)) return true;

      // 按类型过滤
      const filteredTypes = ['GridHelper', 'AxesHelper'];
      if (filteredTypes.includes(object.type)) return true;

      return false;
    };

    const buildTreeFromSceneObject = (object: THREE.Object3D): TreeNode | null => {
      // 过滤掉辅助对象
      if (shouldFilterObject(object)) return null;

      // 过滤子对象，只保留非辅助对象
      const filteredChildren = object.children
        .map(child => buildTreeFromSceneObject(child))
        .filter((node): node is TreeNode => node !== null);

      return {
        object,
        name: object.type === 'Scene' ? 'Collection' : (object.name || `${object.type}_${object.uuid.slice(0, 8)}`),
        type: object.type,
        visible: object.visible,
        children: filteredChildren,
        expanded: expandedNodes.has(object.uuid)
      };
    };

    const scene = renderer.scene;
    if (scene) {
      const tree = buildTreeFromSceneObject(scene);
      setSceneTree(tree ? [tree] : []);
    }
  };

  // 从场景对象构建树结构
  const buildTreeFromSceneObject = (object: THREE.Object3D): TreeNode | null => {
    // 需要过滤的辅助对象名称和类型
    const shouldFilterObject = (obj: THREE.Object3D): boolean => {
      // 按名称过滤
      const filteredNames = [
        'TransformControlsHelper',
        'TransformControlsGizmo',
        'TransformControlsPlane',
        'GridHelper',
        'AxesHelper'
      ];
      if (filteredNames.includes(obj.name)) return true;

      // 按类型过滤
      const filteredTypes = ['GridHelper', 'AxesHelper'];
      if (filteredTypes.includes(obj.type)) return true;

      return false;
    };

    // 过滤掉辅助对象
    if (shouldFilterObject(object)) return null;

    // 过滤子对象，只保留非辅助对象
    const filteredChildren = object.children
      .map(child => buildTreeFromSceneObject(child))
      .filter((node): node is TreeNode => node !== null);

    return {
      object,
      name: object.type === 'Scene' ? 'Collection' : (object.name || `${object.type}_${object.uuid.slice(0, 8)}`),
      type: object.type,
      visible: object.visible,
      children: filteredChildren,
      expanded: expandedNodes.has(object.uuid)
    };
  };

  // 切换节点展开/折叠
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // 选中对象
  const handleSelectObject = (object: THREE.Object3D) => {
    // 检查对象是否被锁定
    if (object.userData && object.userData.locked) {
      console.log(`对象 ${object.name} 已被锁定，无法选择`);
      alert(`对象 "${object.name}" 已被锁定，无法选择`);
      return;
    }
    
    if (onObjectSelected) {
      onObjectSelected(object);
    }
  };
  
  // 切换对象可见性
  const toggleVisibility = (object: THREE.Object3D, e: React.MouseEvent) => {
    e.stopPropagation();
    object.visible = !object.visible;
    // 强制更新
    setSceneTree([...sceneTree]);
  };
  
  // 切换对象锁定状态
  const toggleLock = (object: THREE.Object3D, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!object.userData) {
      object.userData = {};
    }
    object.userData.locked = !object.userData.locked;
    
    // 如果有Aether3D引擎实例，更新元数据中的locked属性
    if (renderer && renderer.updateObjectMetadata) {
      renderer.updateObjectMetadata(object, { locked: object.userData.locked });
    }
    
    // 如果有Document实例，也更新Document中的元数据
    if (document && document.getMetadataManager) {
      const metadataManager = document.getMetadataManager();
      if (metadataManager) {
        metadataManager.updateObjectMetadata(object, { locked: object.userData.locked });
      }
    }
    
    console.log(`对象 ${object.name} ${object.userData.locked ? '已锁定' : '已解锁'}`);
    // 强制更新
    setSceneTree([...sceneTree]);
  };

  // 开始编辑名称
  const startEditing = (object: THREE.Object3D, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNode(object.uuid);
    setEditingName(object.name || '');
  };

  // 完成编辑
  const finishEditing = (object: THREE.Object3D) => {
    if (editingName.trim()) {
      object.name = editingName.trim();
      console.log(`对象名称已更改为: ${object.name}`);
    }
    setEditingNode(null);
    setEditingName('');
    // 强制更新场景树
    setSceneTree([...sceneTree]);
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingNode(null);
    setEditingName('');
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent, object: THREE.Object3D) => {
    if (e.key === 'Enter') {
      finishEditing(object);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // 自动聚焦输入框
  React.useEffect(() => {
    if (editingNode && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingNode]);

  // 获取对象图标
  const getObjectIcon = (type: string): string => {
    const iconMap: { [key: string]: string } = {
      'Scene': '📦',
      'Mesh': '🔲',
      'Group': '📁',
      'DirectionalLight': '☀️',
      'PointLight': '💡',
      'SpotLight': '🔦',
      'AmbientLight': '🌟',
      'HemisphereLight': '🌓',
      'PerspectiveCamera': '📷',
      'OrthographicCamera': '📹',
      'GridHelper': '⊞',
      'AxesHelper': '⚡',
      'Line': '➖',
      'LineSegments': '⚊',
      'Points': '⚫',
      'Sprite': '🖼️',
      'Bone': '🦴',
      'SkinnedMesh': '👤',
      'LinesGroup': '📏',
      'ModelsGroup': '🏛️',
      'LayersGroup': '🎨',
      'MaterialsGroup': '🌈',
      'TexturesGroup': '🖼️',
      'GeometriesGroup': '📐',
      'LineData': '📏',
      'ModelData': '🏛️',
      'LayerData': '🎨',
      'MaterialData': '🌈',
      'TextureData': '🖼️',
      'GeometryData': '📐'
    };
    return iconMap[type] || '⚙️';
  };

  // 渲染树节点
  const renderTreeNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.object.uuid);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedObject && selectedObject.uuid === node.object.uuid;
    const isHovered = hoveredNode === node.object.uuid;
    const isLocked = node.object.userData && node.object.userData.locked;
    
    // 检查是否为Collection节点（Scene类型且名称为Collection）
    const isCollection = node.type === 'Scene' && node.name === 'Collection';

    return (
      <div key={node.object.uuid} className="hierarchy-node">
        <div
          className={`hierarchy-node-content ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleSelectObject(node.object)}
          onMouseEnter={() => setHoveredNode(node.object.uuid)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          {/* 展开/折叠按钮 */}
          {hasChildren ? (
            <span
              className="hierarchy-toggle"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.object.uuid);
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </span>
          ) : (
            <span className="hierarchy-toggle-placeholder"></span>
          )}

          {/* 对象图标 */}
          <span className="hierarchy-icon">{getObjectIcon(node.type)}</span>

          {/* 对象名称 */}
          {editingNode === node.object.uuid ? (
            // Collection节点不允许编辑名称
            isCollection ? (
              <span 
                className={`hierarchy-name ${isLocked ? 'locked' : ''}`} 
                title={`${node.name} (${node.type})${isLocked ? '\n对象已锁定' : ''}`}
              >
                {node.name}
                {isLocked && <span className="hierarchy-locked-indicator">🔒</span>}
              </span>
            ) : (
              <input
                ref={editInputRef}
                type="text"
                className="hierarchy-name-input"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => finishEditing(node.object)}
                onKeyDown={(e) => handleKeyDown(e, node.object)}
                onClick={(e) => e.stopPropagation()}
              />
            )
          ) : (
            <span 
              className={`hierarchy-name ${isLocked ? 'locked' : ''}`} 
              title={`${node.name} (${node.type})\n${isCollection ? '根节点不可编辑' : '双击编辑名称'}${isLocked ? '\n对象已锁定' : ''}`}
              // Collection节点不允许双击编辑
              onDoubleClick={(e) => {
                if (!isCollection) {
                  startEditing(node.object, e);
                }
              }}
            >
              {node.name}
              {isLocked && <span className="hierarchy-locked-indicator">🔒</span>}
            </span>
          )}

          {/* 对象类型 */}
          <span className="hierarchy-type">{node.type}</span>

          {/* 锁定切换按钮 */}
          {/* Collection节点不显示锁定按钮 */}
          {!isCollection && (
            <span
              className="hierarchy-lock"
              onClick={(e) => toggleLock(node.object, e)}
              title={isLocked ? '解锁' : '锁定'}
            >
              {isLocked ? '🔒' : '🔓'}
            </span>
          )}

          {/* 可见性切换按钮 */}
          {/* Collection节点不显示可见性按钮 */}
          {!isCollection && (
            <span
              className="hierarchy-visibility"
              onClick={(e) => toggleVisibility(node.object, e)}
              title={node.visible ? '隐藏' : '显示'}
            >
              {node.visible ? '👁️' : '🙈'}
            </span>
          )}
        </div>

        {/* 子节点 */}
        {isExpanded && hasChildren && (
          <div className="hierarchy-children">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // 统计信息
  const getSceneStats = () => {
    if (!renderer?.scene) return { total: 0, meshes: 0, lights: 0 };

    let total = 0;
    let meshes = 0;
    let lights = 0;

    renderer.scene.traverse((object: THREE.Object3D) => {
      total++;
      if (object instanceof THREE.Mesh) meshes++;
      if (object instanceof THREE.Light) lights++;
    });

    return { total, meshes, lights };
  };

  const stats = getSceneStats();

  return (
    <div className="hierarchy-panel">
      {/* 标题和统计 */}
      <div className="hierarchy-header">
        <h4 className="hierarchy-title">场景层级</h4>
        <div className="hierarchy-stats">
          <span title="总对象数">📊 {stats.total}</span>
          <span title="网格数">📦 {stats.meshes}</span>
          <span title="光源数">💡 {stats.lights}</span>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="hierarchy-toolbar">
        <button
          className="hierarchy-tool-btn"
          onClick={() => setExpandedNodes(new Set())}
          title="折叠所有"
        >
          ⏶ 折叠
        </button>
        <button
          className="hierarchy-tool-btn"
          onClick={() => {
            const allIds = new Set<string>();
            const collectIds = (node: TreeNode) => {
              allIds.add(node.object.uuid);
              node.children.forEach(collectIds);
            };
            sceneTree.forEach(collectIds);
            setExpandedNodes(allIds);
          }}
          title="展开所有"
        >
          ⏷ 展开
        </button>
      </div>

      {/* 场景树 */}
      <div className="hierarchy-content">
        {sceneTree.length > 0 ? (
          sceneTree.map(node => renderTreeNode(node))
        ) : (
          <p className="hierarchy-placeholder">场景为空</p>
        )}
      </div>
    </div>
  );
};

export default HierarchyPanel;
