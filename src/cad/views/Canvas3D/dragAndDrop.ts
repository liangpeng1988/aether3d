import { THREE } from "../../../../Engine/core/global";
import { Document as CADDocument } from "../../data/Document";
import { DefaultConfig } from "../../controllers/DefaultConfig";

export interface ModelData {
  id: string;
  name: string;
  filePath: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  visible: boolean;
  layerId?: string;
}

/**
 * 处理拖放创建的对象
 */
export const handleDropCreateObject = (
  modelData: any,
  dropPosition: THREE.Vector3,
  rendererRef: React.RefObject<any>,
  glbLoaderScriptRef: React.RefObject<any>
) => {
  // 获取当前选中的图层ID
  const currentLayerId = 'layer1'; // 暂时使用默认图层ID
  
  // 创建模型数据并添加到文档
  const modelId = `model_${Date.now()}`;
  const modelInfo: ModelData = {
    id: modelId,
    name: modelData.name || '未命名模型',
    filePath: modelData.filePath,
    type: modelData.filePath?.split('.').pop()?.toLowerCase() || 'unknown',
    position: { 
      x: dropPosition.x, 
      y: dropPosition.y, 
      z: dropPosition.z 
    },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    visible: true,
    layerId: currentLayerId
  };
  
  // 添加到文档
  if (rendererRef.current) {
    const document = rendererRef.current.scene as CADDocument;
    document.addModel(modelInfo);
    
    // 如果有GLB加载器，同步模型到场景
    if (glbLoaderScriptRef.current) {
      document.syncModelToScene(modelId, glbLoaderScriptRef.current);
    }
  }
};

/**
 * 处理绘制创建的线条
 */
export const handleDrawCreateLine = (
  lineData: any,
  rendererRef: React.RefObject<any>
) => {
  // 获取当前选中的图层ID
  const currentLayerId = 'layer1'; // 暂时使用默认图层ID
  
  // 为线条数据添加图层ID
  const lineWithLayer = {
    ...lineData,
    layerId: currentLayerId
  };
  
  // 添加到文档
  if (rendererRef.current) {
    const document = rendererRef.current.scene as CADDocument;
    document.addLine(lineWithLayer);
    
    // 同步线条到场景
    document.syncEntityToScene('line', lineData.id);
  }
};

/**
 * 添加默认线数据到文档
 */
export const addDefaultLinesToDocument = (document: CADDocument) => {
  // 确保至少有一个默认图层
  // 由于图层管理已移至LayerController，这里不再直接检查文档中的图层
  // 图层将在MainLayout中初始化
  
  // 添加几条默认线条作为示例，并分配到图层一
  DefaultConfig.DEFAULT_LINES.forEach(line => {
    document.addLine(line);
  });
  
  // 添加默认3D Cube并分配到图层一
  document.addModel(DefaultConfig.DEFAULT_CUBE);
  
  console.log('默认线数据和3D Cube已添加到文档');
};