import React, { useState, useEffect, useRef, useImperativeHandle, useCallback } from 'react';
import Canvas2D from '../../views/Canvas2D';
import Canvas3D from '../../views/Canvas3D';
import { Canvas3DHandle } from '../../views/Canvas3D/types'; // 导入Canvas3DHandle类型
import './style.css'; // 添加样式文件导入
import { 
  TitleBar, 
  MenuBar, 
  Toolbar, 
  Toolbar3D, // 添加Toolbar3D导入
  TaskBar, 
  LayerManager, 
  LayerLinesViewer, // 添加LayerLinesViewer导入
  UploadWindow, 
  HomeWindow, 
  HomePage, 
  ContextMenu,
  ModelLibrary,
  NewDocumentWindow, // 添加NewDocumentWindow导入
  LeftLayout, // 添加LeftLayout导入
  RightLayout, // 添加RightLayout导入
  MeasurementPanel, // 添加测量面板导入
  PropertiesPanel // 添加PropertiesPanel导入
} from '..';
import { DocumentManager } from '../../data';
import { ViewController } from '../../controllers/ViewController';
import { 
  LineData, 
  DocumentData, 
  ModelData 
} from '../../data/Document';
import { LayerController } from '../../controllers/LayerController';
import { DocumentController } from '../../controllers/DocumentController'; // 添加DocumentController导入
import { 
  AddObjectCommand, 
  RemoveObjectCommand, 
  TransformCommand, 
  ObjectSelectionCommand,
  CopyObjectCommand,
  CutObjectCommand,
  PasteObjectCommand,
  globalHistoryManager
} from '../../controllers/HistoryManager';
import { ContextMenuItem } from '../ContextMenu';
import { THREE } from '../../../../Engine/core/global'; // 修正THREE导入路径

const MainLayout: React.FC = () => {
  const canvas2DRef = useRef<any>(null);
  const canvas3DRef = useRef<Canvas3DHandle>(null);
  const sidebarRef = useRef<any>(null);
  const [drawnLines, setDrawnLines] = useState<any[]>([]);
  const [lineColor, setLineColor] = useState<string>('#ffffff'); // 默认白色
  const documentControllerRef = useRef<DocumentController>(new DocumentController());
  const layerControllerRef = useRef<LayerController>(new LayerController());
  const viewControllerRef = useRef<ViewController>(new ViewController());
  const [documents, setDocuments] = useState<{ id: string; name: string; updatedAt: Date }[]>([]);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string>('新文档');
  const [isCreateDocumentWindowOpen, setIsCreateDocumentWindowOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'view' | 'document'>('view');
  const [viewTabs, setViewTabs] = useState<Array<{id: string, name: string}>>([]);
  const [selectedObject, setSelectedObject] = useState<any>(null); // 添加选中对象状态
  
  // 添加2D/3D视图切换状态
  const [is3DView, setIs3DView] = useState<boolean>(true);
  
  // TransformControls 模式状态
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale' | null>(null);
  
  // TransformControls 坐标系状态
  const [transformSpace, setTransformSpace] = useState<'world' | 'local'>('world');
  
  // 图层管理相关状态
  const [isLayerManagerOpen, setIsLayerManagerOpen] = useState<boolean>(false);
  // 添加图层线条查看器状态
  const [isLayerLinesViewerOpen, setIsLayerLinesViewerOpen] = useState<boolean>(false);
  const [viewingLayerId, setViewingLayerId] = useState<string | null>(null);
  const [currentLayerId, setCurrentLayerId] = useState<string>('layer1'); // 当前选中的图层ID
  

  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false); // 添加绘制模式状态

  // 添加上传窗口状态
  const [isUploadWindowOpen, setIsUploadWindowOpen] = useState<boolean>(false);
  
  // 添加主页显示状态
  const [showHomePage, setShowHomePage] = useState<boolean>(true); // 默认显示主页
  
  // 添加模型构件库状态
  const [isModelLibraryOpen, setIsModelLibraryOpen] = useState<boolean>(false);

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
  }>({
    visible: false,
    x: 0,
    y: 0,
    items: []
  });

  // 右侧属性栏收缩状态
  const [isPropertiesPanelCollapsed, setIsPropertiesPanelCollapsed] = useState(false);
  
  // 左侧侧边栏收缩状态
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  
  // 右侧Tab状态
  const [activeRightTab, setActiveRightTab] = useState<'library' | 'properties' | 'hierarchy'>('library');

  // 添加侧边栏展开状态
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // 撤销/重做状态
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // 添加状态控制工具栏功能显示/隐藏
  const [isToolbarFeaturesVisible, setIsToolbarFeaturesVisible] = useState(true);

  // 添加复制的对象状态
  const [copiedObject, setCopiedObject] = useState<THREE.Object3D | null>(null);
  
  // 添加FPS和场景统计状态
  const [fps, setFps] = useState(0);
  const [sceneStats, setSceneStats] = useState({
    objects: 0,
    triangles: 0,
    vertices: 0,
    materials: 0,
    textures: 0
  });
  
  // 添加背景颜色状态
  const [backgroundColor, setBackgroundColor] = useState('#222222');
  
  // 添加网格显示状态
  const [showGrid, setShowGrid] = useState(true);
  
  // 添加坐标轴显示状态
  const [showAxes, setShowAxes] = useState(true);
  
  // 添加相机位置状态
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([5, 5, 5]);
  
  // 添加相机目标点状态
  const [cameraTarget, setCameraTarget] = useState<[number, number, number]>([0, 0, 0]);
  
  // 添加FPS显示状态
  const [showFPS, setShowFPS] = useState(true);
  
  // 添加处理FPS更新的函数
  const handleUpdateFps = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);
  
  // 添加处理场景统计更新的函数
  const handleUpdateSceneStats = useCallback((stats: typeof sceneStats) => {
    setSceneStats(stats);
  }, []);
  
  // 添加场景准备就绪处理函数
  const handleSceneReady = useCallback((renderer: any) => {
    console.log('场景准备就绪');
  }, []);
  
  // 添加对象悬停处理函数
  const handleObjectHovered = useCallback((object: any | null) => {
    console.log('对象悬停:', object?.name);
  }, []);
  
  // 更新撤销/重做状态
  const updateHistoryState = useCallback(() => {
    setCanUndo(globalHistoryManager.canUndo());
    setCanRedo(globalHistoryManager.canRedo());
  }, [setCanUndo, setCanRedo]);

  const handleUndo = useCallback(() => {
    console.log('[Undo] 撤销操作');
    const success = globalHistoryManager.undo();
    if (success) {
      console.log('[Undo] 撤销成功');
    } else {
      console.log('[Undo] 无法撤销');
    }
    updateHistoryState();
  }, [updateHistoryState]);

  const handleRedo = useCallback(() => {
    console.log('[Redo] 重做操作');
    const success = globalHistoryManager.redo();
    if (success) {
      console.log('[Redo] 重做成功');
    } else {
      console.log('[Redo] 无法重做');
    }
    updateHistoryState();
  }, [updateHistoryState]);

  const handleCut = useCallback(() => {
    console.log('剪切');
    if (selectedObject && is3DView && canvas3DRef.current) {
      const scene = canvas3DRef.current.getRenderer()?.scene;
      if (scene) {
        // 创建剪切命令
        const cutCommand = new CutObjectCommand(
          selectedObject,
          scene,
          (copiedObj) => {
            setCopiedObject(copiedObj);
            // 如果剪切成功，清除选中对象
            if (copiedObj) {
              setSelectedObject(null);
            }
          }
        );
        
        // 执行并记录命令
        globalHistoryManager.execute(cutCommand);
        updateHistoryState();
      }
    }
  }, [selectedObject, is3DView, canvas3DRef, setCopiedObject, setSelectedObject, updateHistoryState]);

  const handleCopy = useCallback(() => {
    console.log('复制');
    if (selectedObject) {
      // 创建复制的对象
      const copiedObj = selectedObject.clone();
      setCopiedObject(copiedObj);
      alert('对象已复制到剪贴板');
    }
  }, [selectedObject, setCopiedObject]);

  const handlePaste = useCallback(() => {
    console.log('粘贴');
    if (copiedObject && is3DView && canvas3DRef.current) {
      const scene = canvas3DRef.current.getRenderer()?.scene;
      if (scene) {
        // 创建粘贴命令
        const pasteCommand = new PasteObjectCommand(
          copiedObject,
          scene,
          (pastedObj) => {
            // 如果粘贴成功，选中新粘贴的对象
            if (pastedObj) {
              setSelectedObject(pastedObj);
            }
          }
        );
        
        // 执行并记录命令
        globalHistoryManager.execute(pasteCommand);
        updateHistoryState();
      }
    }
  }, [copiedObject, is3DView, canvas3DRef, setSelectedObject, updateHistoryState]);

  // 左侧侧边栏切换处理函数
  const handleLeftSidebarToggle = (collapsed: boolean) => {
    setIsLeftSidebarCollapsed(collapsed);
    // 触发窗口resize事件，使Canvas重新调整大小
    viewControllerRef.current.handleResize(canvas2DRef, canvas3DRef, is3DView);
  };

  // 侧边栏切换处理函数
  const handleSidebarToggle = (isExpanded: boolean) => {
    setIsSidebarExpanded(isExpanded);
    // 触发窗口resize事件，使Canvas重新调整大小
    viewControllerRef.current.handleResize(canvas2DRef, canvas3DRef, is3DView);
  };

  // 右侧属性栏切换处理函数
  const handlePropertiesPanelToggle = (collapsed: boolean) => {
    setIsPropertiesPanelCollapsed(collapsed);
    // 触发窗口resize事件，使Canvas重新调整大小
    viewControllerRef.current.handleResize(canvas2DRef, canvas3DRef, is3DView);
  };

  useEffect(() => {
    // 初始化文档列表
    updateDocumentList();
    
    // 初始化默认图层
    const layers = layerControllerRef.current.getAllLayers();
    if (layers.length === 0) {
      // 添加系统图层（图层0）
      const systemLayer = {
        id: 'layer0',
        name: '系统图层',
        color: '#808080',
        visible: false,
        locked: true
      };
      layerControllerRef.current.addLayer(systemLayer);
      
      // 添加默认用户图层（图层1）
      const defaultLayer = {
        id: 'layer1',
        name: '图层一',
        color: '#ffffff',
        visible: true,
        locked: false
      };
      layerControllerRef.current.addLayer(defaultLayer);
      
      // 设置当前图层ID
      setCurrentLayerId('layer1');
    }
    
    // 如果没有文档，则创建一个默认文档
    const docs = documentControllerRef.current.listDocuments();
    if (docs.length === 0) {
      const id = documentControllerRef.current.createDocument('默认文档');
      setCurrentDocumentId(id);
      setDocumentName('默认文档');
      updateDocumentList();
    }
  }, []);

  // 设置键盘快捷键：Ctrl+Z 撤销，Ctrl+Y 或 Ctrl+Shift+Z 重做
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z 撤销
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Ctrl+Shift+Z 或 Ctrl+Y 重做
      if ((e.ctrlKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y')) {
        e.preventDefault();
        handleRedo();
      }
      
      // Ctrl+X 剪切
      if (e.ctrlKey && e.key === 'x') {
        e.preventDefault();
        handleCut();
      }
      
      // Ctrl+C 复制
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      }
      
      // Ctrl+V 粘贴
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleCut, handleCopy, handlePaste]);

  // 初始化时更新历史状态
  useEffect(() => {
    console.log('[History] 初始化历史状态');
    updateHistoryState();
    console.log('[History] canUndo:', canUndo, 'canRedo:', canRedo);
  }, []);

  const handleLineDrawn = (lineData: any) => {
    console.log('线条绘制完成:', lineData);
    
    // 如果lineData包含points属性，直接使用；否则从line对象中提取
    let points = [];
    if (lineData.points) {
      points = lineData.points;
    } else if (lineData.line && lineData.line.geometry) {
      // 从THREE.Line对象中提取点
      const positions = lineData.line.geometry.attributes.position;
      if (positions) {
        points = [];
        for (let i = 0; i < positions.count; i++) {
          points.push({
            x: positions.getX(i),
            y: positions.getY(i),
            z: positions.getZ(i)
          });
        }
      }
    }
    
    // 创建线条数据对象
    const line = {
      id: lineData.id || lineData.line?.name || `line_${Date.now()}`,
      points: points,
      color: lineColor,
      width: 2,
      layerId: currentLayerId // 将线条关联到当前图层
    };
    
    // 更新状态
    setDrawnLines(prev => [...prev, line]);
    
    // 将线条添加到当前文档的当前图层
    if (currentDocumentId) {
      try {
        // 创建添加对象命令
        const document = canvas3DRef.current?.getDocument();
        if (document) {
          const addObjectCommand = new AddObjectCommand(
            document, // Document实例本身就是Scene对象
            lineData.line
          );
          
          // 执行并记录命令
          globalHistoryManager.execute(addObjectCommand);
          updateHistoryState();
        }
        
        documentControllerRef.current.addLineToCurrentDocument(line);
        console.log('线段已保存到文档和当前图层:', line);
      } catch (error) {
        console.error('保存线段到文档时出错:', error);
      }
    }
  };

  const handleLineSelected = (line: any | null) => {
    console.log('线条选中:', line);
    setSelectedObject(line);
  };

  const handleObjectSelected = (object: any | null) => {
    console.log('对象选中:', object?.name);
    
    // 创建对象选择命令
    const selectionCommand = new ObjectSelectionCommand(
      object,
      (selectedObj: any | null) => {
        setSelectedObject(selectedObj);
        
        // 当选中对象时，不自动设置 TransformControls 为移动模式
        // 只有当用户从工具栏明确选择移动工具时才激活
        if (!selectedObj) {
          // 取消选中时清除模式
          setTransformMode(null);
          // viewControllerRef.current.setTransformMode(null);
        }
      }
    );
    
    // 执行并记录命令
    globalHistoryManager.execute(selectionCommand);
    updateHistoryState();
  };

  const handleObjectDeselected = () => {
    console.log('对象取消选中');
    setSelectedObject(null);
  };

  const handleDimensionCreated = (dimension: any) => {
    console.log('标注创建完成:', dimension);
  };

  const handleClearAll = () => {
    setDrawnLines([]);
  };

  const handleSetLineColor = (color: string) => {
    setLineColor(color); // 更新颜色状态
  };

  const handleSetLineWidth = (width: number) => {
    console.log('设置线宽:', width);
  };

  const handleSwitchToTopView = () => {
    viewControllerRef.current.handleSwitchToTopView(canvas2DRef, canvas3DRef, is3DView);
  };

  const handleSwitchToCADMode = () => {
    // 新的相机控制脚本默认就是CAD模式，无需额外设置
    console.log('已切换到CAD模式');
  };

  const handleCreateHorizontalDimension = () => {
    if (canvas2DRef.current && !is3DView) {
      canvas2DRef.current.startDimensionCreation('horizontal');
    }
  };

  const handleCreateVerticalDimension = () => {
    if (canvas2DRef.current && !is3DView) {
      canvas2DRef.current.startDimensionCreation('vertical');
    }
  };

  const handleCreateAlignedDimension = () => {
    if (canvas2DRef.current && !is3DView) {
      canvas2DRef.current.startDimensionCreation('aligned');
    }
  };

  // 切换绘制模式
  const toggleDrawingMode = () => {
    const newMode = !isDrawingMode;
    setIsDrawingMode(newMode);
    if (canvas2DRef.current && !is3DView) {
      canvas2DRef.current.setDrawingMode(newMode);
    }
  };

  // 处理颜色选择
  const handleColorSelect = (color: string) => {
    setLineColor(color);
  };

  // 更新文档列表
  const updateDocumentList = () => {
    const docs = documentControllerRef.current.listDocuments();
    setDocuments(docs);
    
    // 如果有文档且当前没有选中的图层，设置默认图层
    if (docs.length > 0 && !currentLayerId) {
      setCurrentLayerId('layer1');
    }
  };

  // 创建新文档
  const handleCreateDocument = () => {
    const id = documentControllerRef.current.createDocument(documentName);
    setCurrentDocumentId(id);
    updateDocumentList();
    handleClearAll(); // 清除当前画布
  };

  // 保存文档
  const handleSaveDocument = () => {
    if (!currentDocumentId) {
      alert('请先创建或选择一个文档');
      return;
    }
    
    // 这里应该从Canvas2D获取实际的线条数据
    // 为了演示，我们创建一些示例数据
    const lineData = drawnLines.map((line, index) => ({
      id: `line_${index}`,
      points: line.points || [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }],
      color: lineColor,
      width: 2
    }));
    
    documentControllerRef.current.saveDocument(currentDocumentId, lineData);
    updateDocumentList();
    alert('文档已保存');
  };

  // 加载文档
  const handleLoadDocument = (documentId: string) => {
    const document = documentControllerRef.current.loadDocument(documentId);
    if (document) {
      setCurrentDocumentId(documentId);
      setDocumentName(document.name);
      // 这里应该加载实际的线条数据到Canvas2D
      console.log('加载文档:', document);
      alert(`文档 "${document.name}" 已加载`);
    }
  };

  // 删除文档
  const handleDeleteDocument = (documentId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    documentControllerRef.current.deleteDocument(documentId);
    if (currentDocumentId === documentId) {
      setCurrentDocumentId(null);
      setDocumentName('新文档');
    }
    updateDocumentList();
  };

  // 处理新建文档窗口的打开
  const handleOpenCreateDocumentWindow = () => {
    setIsCreateDocumentWindowOpen(true);
  };

  // 处理新建文档窗口的关闭
  const handleCloseCreateDocumentWindow = () => {
    setIsCreateDocumentWindowOpen(false);
  };

  // 处理创建新文档
  const handleCreateNewDocument = (documentData: {
    name: string;
    width: number;
    height: number;
    units: string;
    backgroundColor: string;
  }) => {
    console.log('创建新文档:', documentData);
    // 这里应该创建一个新的文档实例
    // 为了演示，我们只更新文档名称
    setDocumentName(documentData.name);
    
    // 创建新文档并更新文档列表
    const id = documentControllerRef.current.createDocument(documentData.name);
    setCurrentDocumentId(id);
    updateDocumentList();
    handleClearAll(); // 清除当前画布
    
    // 确保至少有一个默认图层
    const currentDoc = canvas3DRef.current?.getDocument();
    const layers = layerControllerRef.current.getAllLayers();
    if (currentDoc && layers.length === 0) {
      // 添加系统图层（图层0）
      const systemLayer = {
        id: 'layer0',
        name: '系统图层',
        color: '#808080',
        visible: false,
        locked: true
      };
      // 使用LayerController添加图层
      layerControllerRef.current.addLayer(systemLayer);
      
      // 添加默认用户图层（图层1）
      const defaultLayer = {
        id: 'layer1',
        name: '图层一',
        color: '#ffffff',
        visible: true,
        locked: false
      };
      // 使用LayerController添加图层
      layerControllerRef.current.addLayer(defaultLayer);
    }
    
    // 设置当前图层ID
    setCurrentLayerId('layer1');
  
    // 关闭新建文档窗口
    setIsCreateDocumentWindowOpen(false);
    
    // 确保切换到3D视图
    setIs3DView(true);
    viewControllerRef.current.set3DViewMode(true);
  };

  // MenuBar 回调函数
  const handleNewDocument = () => {
    handleOpenCreateDocumentWindow();
  };

  const handleNewView = () => {
    handleCreateView();
  };

  const handleOpenDocument = () => {
    // 在实际应用中，这里可能需要一个文件选择对话框
    console.log('打开文档');
  };

  // 添加导入GLB模型函数
  const handleImportGLBModel = () => {
    console.log('导入GLB模型');
    // 创建一个隐藏的文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.glb,.gltf';
    fileInput.style.display = 'none';
    
    // 添加change事件监听器
    fileInput.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        // 检查文件类型
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (fileExtension !== 'glb' && fileExtension !== 'gltf') {
          alert('请选择GLB或GLTF格式的文件');
          return;
        }
        
        handleLoadGLBModel(file);
      }
      
      // 清理文件输入元素
      document.body.removeChild(fileInput);
    };
    
    // 添加到DOM并触发点击
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  // 处理GLB模型加载
  const handleLoadGLBModel = (file: File) => {
    // 获取GLB加载器
    const glbLoader = canvas3DRef.current?.getGLBLoader();
    if (!glbLoader) {
      console.error('GLB加载器未初始化');
      alert('GLB加载器未初始化');
      return;
    }

    // 创建对象URL
    const url = URL.createObjectURL(file);
    
    // 为模型创建一个唯一的ID
    const modelId = `model_${Date.now()}`;
    
    // 创建模型数据
    const modelData = {
      id: modelId,
      name: file.name,
      filePath: url,
      type: file.name.split('.').pop()?.toLowerCase() || 'glb',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      visible: true,
      layerId: 'layer1' // 默认添加到图层一
    };
    
    // 将模型添加到当前文档
    const currentDoc = canvas3DRef.current?.getDocument();
    if (currentDoc) {
      currentDoc.addModel(modelData);
      
      // 同步模型到场景
      currentDoc.syncModelToScene(modelId, glbLoader).then(() => {
        console.log('GLB模型加载成功:', file.name);
        alert(`模型 "${file.name}" 导入成功！`);
      }).catch((error: any) => {
        console.error('加载GLB模型失败:', error);
        alert('模型加载失败，请检查文件格式是否正确');
      }).finally(() => {
        // 释放对象URL
        URL.revokeObjectURL(url);
      });
    } else {
      console.error('无法获取当前文档');
      alert('无法获取当前文档');
      URL.revokeObjectURL(url);
    }
  };

  const handleSaveDocumentFromMenu = () => {
    handleSaveDocument();
  };

  const handleSaveAsDocument = () => {
    // 在实际应用中，这里可能需要一个文件保存对话框
    console.log('另存为文档');
  };

  // 添加处理上传构建的函数
  const handleUploadBuild = () => {
    console.log('上传构建');
    // 打开上传窗口
    setIsUploadWindowOpen(true);
  };

  // 处理文件上传
  const handleUploadFile = (file: File | null, metadata: any) => {
    if (!file) {
      alert('请选择要上传的文件');
      return;
    }

    console.log('上传文件:', file.name);
    console.log('BIM元数据:', metadata);

    // 这里可以实现具体的文件上传逻辑
    // 例如发送到服务器等
    alert(`文件 "${file.name}" 上传成功！`);

    // 关闭上传窗口
    setIsUploadWindowOpen(false);
  };

  // 处理关闭上传窗口
  const handleCloseUploadWindow = () => {
    setIsUploadWindowOpen(false);
  };

  const handleSelectAll = () => {
    console.log('全选');
  };

  const handleDeselect = () => {
    console.log('取消选择');
  };

  const handleDrawLine = () => {
    console.log('开始绘制直线');
  };

  const handleDrawCircle = () => {
    console.log('绘制圆');
  };

  const handleDrawRectangle = () => {
    console.log('绘制矩形');
  };

  const handleDrawPolygon = () => {
    console.log('绘制多边形');
  };

  // 添加模型构件库相关处理函数
  const handleUploadModel = () => {
    console.log('上传模型');
    // 打开上传窗口
    setIsUploadWindowOpen(true);
  };

  const handleManageModels = () => {
    console.log('管理构件');
    // 打开模型构件库
    setIsModelLibraryOpen(true);
  };

  // 添加处理模型选择的函数
  const handleModelSelect = (model: any) => {
    console.log('选择模型:', model.name);
    // 这里可以实现具体的模型加载逻辑
    alert(`已选择模型: ${model.name}`);
    // 关闭模型构件库
    setIsModelLibraryOpen(false);
  };

  // 添加关闭模型构件库的函数
  const handleCloseModelLibrary = () => {
    setIsModelLibraryOpen(false);
  };

  const handleDimensionLinear = () => {
    handleCreateHorizontalDimension();
  };

  const handleDimensionAligned = () => {
    handleCreateAlignedDimension();
  };

  const handleDimensionAngular = () => {
    console.log('角度标注');
    // 在实际应用中，这里需要实现角度测量逻辑
    // 可以通过选择三个点来计算角度
    alert('请在画布上选择三个点来测量角度（第二个点为顶点）');
  };

  const handleDimensionDiameter = () => {
    console.log('直径标注');
    // 在实际应用中，这里需要实现直径测量逻辑
    // 可以通过选择圆心和圆上一点来计算直径
    alert('请在画布上选择圆心和圆上一点来测量直径');
  };

  const handleDimensionRadius = () => {
    console.log('半径标注');
    // 在实际应用中，这里需要实现半径测量逻辑
    // 可以通过选择圆心和圆上一点来计算半径
    alert('请在画布上选择圆心和圆上一点来测量半径');
  };

  const handleZoomIn = () => {
    console.log('放大');
  };

  const handleZoomOut = () => {
    console.log('缩小');
  };

  const handleZoomExtent = () => {
    handleSwitchToTopView();
  };

  const handlePan = () => {
    console.log('平移');
  };

  const handleOrbit = () => {
    console.log('环绕');
  };

  const handleTopView = () => {
    handleSwitchToTopView();
  };

  const handleFrontView = () => {
    console.log('前视图');
  };

  const handleSideView = () => {
    console.log('侧视图');
  };

  const handleHelp = () => {
    console.log('帮助');
  };

  const handleAbout = () => {
    console.log('关于');
  };

  // Logo 点击处理 - 显示主页
  const handleLogoClick = () => {
    setShowHomePage(true);
  };

  // 打开文档 - 隐藏主页
  const handleOpenDocumentFromHome = (documentId: string) => {
    handleLoadDocument(documentId);
    setShowHomePage(false);
  };

  // 创建文档 - 隐藏主页并打开新建窗口
  const handleCreateDocumentFromHome = () => {
    setShowHomePage(false);
    handleOpenCreateDocumentWindow();
  };

  // AI协助功能处理函数
  const handleAIChat = () => {
    console.log('AI对话助手');
    alert('🤖 AI对话助手\n\n您可以向AI助手提问，获取设计建议和技术支持。');
  };

  const handleAIAutoDesign = () => {
    console.log('AI自动设计');
    alert('🎨 AI自动设计\n\n根据您的需求描述，AI将自动生成设计方案。');
  };

  const handleAIOptimize = () => {
    console.log('AI优化建议');
    alert('💡 AI优化建议\n\nAI将分析当前设计，提供优化建议，包括结构、材料、成本等方面。');
  };

  const handleAIAnalyze = () => {
    console.log('AI分析报告');
    alert('📊 AI分析报告\n\nAI将生成详细的设计分析报告，包括性能评估、成本预算和风险评估。');
  };

  // 选择功能处理函数
  const handleSelect = () => {
    console.log('选择工具');
  };

  const handleDeselectAll = () => {
    console.log('取消选择');
  };

  const handleInvertSelection = () => {
    console.log('反转选择');
  };

  const handleBoxSelect = () => {
    console.log('框选模式');
  };

  // 右键菜单处理函数
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    
    const menuItems: ContextMenuItem[] = [
      {
        id: 'select-all',
        label: '全选',
        icon: '☑',
        shortcut: 'Ctrl+A',
        action: handleSelectAll
      },
      {
        id: 'deselect-all',
        label: '取消选择',
        icon: '☐',
        shortcut: 'Ctrl+D',
        action: handleDeselectAll
      },
      {
        id: 'separator1',
        label: '-',
        separator: true
      },
      {
        id: 'cut',
        label: '剪切',
        icon: '✂',
        shortcut: 'Ctrl+X',
        action: handleCut
      },
      {
        id: 'copy',
        label: '复制',
        icon: '📄',
        shortcut: 'Ctrl+C',
        action: handleCopy
      },
      {
        id: 'paste',
        label: '粘贴',
        icon: '📋',
        shortcut: 'Ctrl+V',
        action: handlePaste
      },
      {
        id: 'separator2',
        label: '-',
        separator: true
      },
      {
        id: 'delete',
        label: '删除',
        icon: '🗑️',
        shortcut: 'Delete',
        action: () => {
          if (selectedObject) {
            // 创建删除对象命令
            const document = canvas3DRef.current?.getDocument();
            if (document) {
              const removeObjectCommand = new RemoveObjectCommand(
                document, // Document实例本身就是Scene对象
                selectedObject
              );
              
              // 执行并记录命令
              globalHistoryManager.execute(removeObjectCommand);
              updateHistoryState();
            }
            
            console.log('删除');
          }
        }
      },
      {
        id: 'separator3',
        label: '-',
        separator: true
      },
      {
        id: 'properties',
        label: '属性',
        icon: '⚙️',
        action: () => console.log('属性')
      },
      {
        id: 'view',
        label: '视图',
        icon: '👁️',
        children: [
          {
            id: 'top-view',
            label: '顶视图',
            shortcut: '小键盘7',
            action: handleTopView
          },
          {
            id: 'front-view',
            label: '前视图',
            shortcut: '小键盘1',
            action: handleFrontView
          },
          {
            id: 'side-view',
            label: '侧视图',
            shortcut: '小键盘3',
            action: handleSideView
          }
        ]
      }
    ];

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      items: menuItems
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // 处理2D/3D视图切换
  const handleViewToggle = (is3D: boolean) => {
    setIs3DView(is3D);
    viewControllerRef.current.set3DViewMode(is3D);
    console.log(`切换到${is3D ? '3D' : '2D'}视图`);
  };

  // 处理创建新主页标签
  const handleCreateView = () => {
    const newViewId = `view_${Date.now()}`;
    const newViewName = `主页${viewTabs.length + 1}`;
    
    setViewTabs(prev => [...prev, { id: newViewId, name: newViewName }]);
    
    // 切换到主页模式
    setCurrentView('view');
    
    console.log(`创建新主页标签: ${newViewName}`);
  };

  // 处理关闭主页标签
  const handleCloseViewTab = (viewId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setViewTabs(prev => prev.filter(tab => tab.id !== viewId));
    
    console.log(`关闭主页标签: ${viewId}`);
  };

  // 处理切换主页标签
  const handleSwitchViewTab = (viewId: string) => {
    console.log(`切换到主页标签: ${viewId}`);
  };

  // 处琅属性更改
  const handlePropertyChange = (property: string, value: any) => {
    console.log(`属性更改: ${property} = ${value}`);
    
    // 更新选中对象的属性
    if (selectedObject) {
      const updatedObject = { ...selectedObject };
      
      // 特殊处理图层ID更新
      if (property === 'userData.layerId') {
        if (!updatedObject.userData) {
          updatedObject.userData = {};
        }
        updatedObject.userData.layerId = value;
        console.log(`更新对象图层ID: ${value}`);
      }
      // 处理嵌套属性（如 position.x）
      else if (property.includes('.')) {
        const parts = property.split('.');
        let current = updatedObject;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      } else {
        updatedObject[property] = value;
      }
      
      setSelectedObject(updatedObject);
      
      // 同步更新 3D 场景中的对象
      if (is3DView && canvas3DRef.current) {
        canvas3DRef.current.updateObjectTransform(selectedObject, property, value);
      }
      
      // 如果是颜色属性，同时更新线条颜色
      if (property === 'color') {
        setLineColor(value);
      }
    }
  };

  // 处理 TransformControls 变换变化
  const handleTransformChange = (object: any) => {
    // 更新选中对象的状态，触发属性面板重新渲染
    setSelectedObject({ ...object });
    
    // 如果是3D视图，记录变换命令到历史管理器
    if (is3DView && selectedObject) {
      // 创建变换命令
      const transformCommand = new TransformCommand(
        selectedObject,
        {
          position: selectedObject.position.clone(),
          rotation: selectedObject.rotation.clone(),
          scale: selectedObject.scale.clone()
        },
        {
          position: object.position.clone(),
          rotation: object.rotation.clone(),
          scale: object.scale.clone()
        }
      );
      
      // 执行并记录命令
      globalHistoryManager.execute(transformCommand);
      updateHistoryState();
    }
  };

  // 从当前文档获取图层数据
  const getCurrentDocumentLayers = () => {
    // 过滤掉系统图层（id为'layer0'的图层）
    return layerControllerRef.current.getAllLayers().filter(layer => layer.id !== 'layer0');
  };
  
  // 处理图层选择
  const handleLayerSelect = (layerId: string) => {
    console.log('选择图层:', layerId);
    const currentDoc = canvas3DRef.current?.getDocument() || null; // 修复：确保传递正确的类型
    const success = layerControllerRef.current.handleLayerSelect(layerId, currentDoc);
    if (success) {
      setCurrentLayerId(layerId);
    }
  };

  // 图层管理相关处理函数
  const handleLayerVisibilityChange = (layerId: string, visible: boolean) => {
    layerControllerRef.current.handleLayerVisibilityChange(layerId, visible);
  };

  const handleLayerLockChange = (layerId: string, locked: boolean) => {
    layerControllerRef.current.handleLayerLockChange(layerId, locked);
  };

  const handleLayerColorChange = (layerId: string, color: string) => {
    layerControllerRef.current.handleLayerColorChange(layerId, color);
  };

  const handleLayerRename = (layerId: string, name: string) => {
    layerControllerRef.current.handleLayerRename(layerId, name);
  };

  const handleAddLayer = () => {
    layerControllerRef.current.handleAddLayer();
    // 强制更新状态以触发重新渲染
    forceUpdate();
  };

  const handleDeleteLayer = (layerId: string) => {
    const success = layerControllerRef.current.handleDeleteLayer(layerId);
    if (success) {
      // 如果删除成功，更新图层列表
      const layers = getCurrentDocumentLayers();
      if (currentLayerId === layerId && layers.length > 0) {
        setCurrentLayerId(layers[0].id);
      }
    }
  };

  // 处理图层刷新
  const handleRefreshLayers = () => {
    // 触发重新渲染图层列表
    console.log('刷新图层列表');
    // 获取最新的文档数据
    const documentId = currentDocumentId || '';
    if (documentId) {
      const lines = documentControllerRef.current.getAllLines(documentId);
      const models = documentControllerRef.current.getAllModels(documentId);
      console.log('刷新后的文档数据:', { lines, models });
    }
  };

  // 处理图层线条查看
  const handleViewLayerLines = (layerId: string) => {
    // 这里应该显示一个弹窗，列出指定图层中的所有线条
    console.log(`查看图层 ${layerId} 的线条`);
    // 实际实现中，您可能需要从DocumentManager获取指定图层的线条数据
    // 并显示在一个弹窗中
    setIsLayerLinesViewerOpen(true);
    setViewingLayerId(layerId);
  };

  const handleOpenLayerManager = () => {
    setIsLayerManagerOpen(true);
  };

  const handleCloseLayerManager = () => {
    setIsLayerManagerOpen(false);
  };

  // 切扢2D/3D视图
  const toggleViewMode = () => {
    viewControllerRef.current.toggleViewMode();
    setIs3DView(!is3DView);
  };
    
  // TransformControls 模式切换处理函数
  const handleSetTranslateMode = () => {
    if (canvas3DRef.current) {
      // 附加TransformControls到当前选中的对象
      if (selectedObject && (selectedObject instanceof THREE.Mesh || selectedObject instanceof THREE.Group)) {
        canvas3DRef.current.attachTransformControls(selectedObject);
      }
      
      canvas3DRef.current.setTransformMode('translate');
      setTransformMode('translate');
      viewControllerRef.current.setTransformMode('translate');
    }
  };
    
  const handleSetRotateMode = () => {
    if (canvas3DRef.current) {
      // 附加TransformControls到当前选中的对象
      if (selectedObject && (selectedObject instanceof THREE.Mesh || selectedObject instanceof THREE.Group)) {
        canvas3DRef.current.attachTransformControls(selectedObject);
      }
      
      canvas3DRef.current.setTransformMode('rotate');
      setTransformMode('rotate');
      viewControllerRef.current.setTransformMode('rotate');
    }
  };
    
  const handleSetScaleMode = () => {
    if (canvas3DRef.current) {
      // 附加TransformControls到当前选中的对象
      if (selectedObject && (selectedObject instanceof THREE.Mesh || selectedObject instanceof THREE.Group)) {
        canvas3DRef.current.attachTransformControls(selectedObject);
      }
      
      canvas3DRef.current.setTransformMode('scale');
      setTransformMode('scale');
      viewControllerRef.current.setTransformMode('scale');
    }
  };
  
  // TransformControls 坐标系切换处理函数
  const handleToggleTransformSpace = () => {
    if (canvas3DRef.current) {
      const newSpace = canvas3DRef.current.toggleTransformSpace();
      setTransformSpace(newSpace);
      viewControllerRef.current.setTransformSpace(newSpace);
    }
  };
  
  // TransformControls 坐标系变化回调
  const handleTransformSpaceChange = (space: 'world' | 'local') => {
    setTransformSpace(space);
    viewControllerRef.current.setTransformSpace(space);
  };

  // 添加强制更新函数
  const [, updateState] = React.useState<object>();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  // 顶点选择处理函数
  const handleVertexSelect = useCallback(() => {
    console.log('顶点选择模式');
    setTransformMode(null);
    
    // 通知Canvas3D切换到顶点选择模式
    if (canvas3DRef.current) {
      // 获取顶点操作控制器并启用顶点选择模式
      const vertexManipulationController = canvas3DRef.current.getVertexManipulationController();
      if (vertexManipulationController) {
        // 启用顶点选择和移动功能
        vertexManipulationController.updateConfig({
          enableVertexSelection: true,
          enableVertexMovement: true
        });
        console.log('顶点操作控制器已启用');
      }
    }
  }, []);

  // 边选择处理函数
  const handleEdgeSelect = useCallback(() => {
    console.log('边选择模式');
    setTransformMode(null);
    
    // 禁用顶点操作控制器的顶点选择功能
    if (canvas3DRef.current) {
      const vertexManipulationController = canvas3DRef.current.getVertexManipulationController();
      if (vertexManipulationController) {
        vertexManipulationController.updateConfig({
          enableVertexSelection: false,
          enableVertexMovement: false
        });
      }
    }
  }, []);

  // 面选择处理函数
  const handleFaceSelect = useCallback(() => {
    console.log('面选择模式');
    setTransformMode(null);
    
    // 禁用顶点操作控制器的顶点选择功能
    if (canvas3DRef.current) {
      const vertexManipulationController = canvas3DRef.current.getVertexManipulationController();
      if (vertexManipulationController) {
        vertexManipulationController.updateConfig({
          enableVertexSelection: false,
          enableVertexMovement: false
        });
      }
    }
  }, []);

  // 添加全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 切换全屏模式
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 处理键盘事件，按ESC键退出全屏
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <div className="main-layout">
      {showHomePage ? (
        <HomePage 
          onOpenDocument={handleOpenDocumentFromHome}
          onCreateDocument={handleCreateDocumentFromHome}
        />
      ) : (
        <>
          {/* 顶部菜单栏 */}
          <div className="top-toolbar">
            <MenuBar 
              onNewDocument={handleNewDocument}
              onOpenDocument={handleOpenDocument}
              onSaveDocument={handleSaveDocumentFromMenu}
              onImportGLBModel={handleImportGLBModel}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
          </div>

          {/* 顶部工具栏 */}
            <Toolbar 
              onDrawLine={handleDrawLine}
              onDrawCircle={handleDrawCircle}
              onDrawRectangle={handleDrawRectangle}
              onDrawPolygon={handleDrawPolygon}
              onDimensionLinear={handleDimensionLinear}
              onDimensionAligned={handleDimensionAligned}
              onDimensionAngular={handleDimensionAngular}
              onDimensionDiameter={handleDimensionDiameter}
              onDimensionRadius={handleDimensionRadius}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomExtent={handleZoomExtent}
              onOrbit={handleOrbit}
              onTopView={handleTopView}
              onFrontView={handleFrontView}
              onSideView={handleSideView}
              onNewDocument={handleNewDocument}
              onOpenDocument={handleOpenDocument}
              onSaveDocument={handleSaveDocumentFromMenu}
              onUploadBuild={handleUploadBuild}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={canUndo}
              canRedo={canRedo}
              onCut={handleCut}
              onCopy={handleCopy}
              onPaste={handlePaste}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselect}
              onInvertSelection={handleInvertSelection}
              onBoxSelect={handleBoxSelect}
              onSetTranslateMode={handleSetTranslateMode}
              onSetRotateMode={handleSetRotateMode}
              onSetScaleMode={handleSetScaleMode}
              currentTransformMode={transformMode}
              onToggleTransformSpace={handleToggleTransformSpace}
              currentTransformSpace={transformSpace}
              onToggleViewMode={toggleViewMode}
              is3DView={is3DView}
              onLayerManager={handleOpenLayerManager}
            />

          {/* 主内容区域 */}
          <div className="main-content">
            {/* 中间画布区域 */}
            <div className="canvas-area">
              {/* {is3DView ? (
                <Canvas3D
                  ref={canvas3DRef}
                  backgroundColor={backgroundColor}
                  showGrid={showGrid}
                  showAxes={showAxes}
                  cameraPosition={cameraPosition}
                  cameraTarget={cameraTarget}
                  showFPS={showFPS}
                  updateFps={handleUpdateFps}
                  updateSceneStats={handleUpdateSceneStats}
                  onSceneReady={handleSceneReady}
                  onObjectSelected={handleObjectSelected}
                  onObjectHovered={handleObjectHovered}
                  onTransformChange={handleTransformChange}
                  onTransformSpaceChange={handleTransformSpaceChange}
                  onVertexSelect={handleVertexSelect}
                  onEdgeSelect={handleEdgeSelect}
                  onFaceSelect={handleFaceSelect}
                />
              ) : (
                <Canvas2D
                  ref={canvas2DRef}
                  backgroundColor={backgroundColor}
                  showGrid={showGrid}
                  showAxes={showAxes}
                  onLineDrawn={handleLineDrawn}
                  onLineSelected={handleLineSelected}
                  onDimensionCreated={handleDimensionCreated}
                  onObjectSelected={handleObjectSelected}
                />
              )} */}
            </div>

            {/* 右侧属性栏 */}
            <div className="right-toolbar">
              <PropertiesPanel 
                selectedObject={selectedObject}
                onPropertyChange={handlePropertyChange}
              />
            </div>
          </div>

          {/* 底部任务栏 */}
          <TaskBar
            documentName={documentName}
            currentLayerName={currentLayerId}
            lineCount={drawnLines.length}
            isDrawingMode={isDrawingMode}
            cameraPosition={{ x: cameraPosition[0], y: cameraPosition[1], z: cameraPosition[2] }}
          />
        </>
      )}
    </div>
  );
};

export default MainLayout;