import React, { useEffect, useRef } from 'react';
import { ModelEditorScript, TransformMode } from '../../../Engine';

interface ModelEditorControlProps {
  renderer: any;
  onObjectSelected?: (object: any) => void;
  onObjectDeselected?: () => void;
  onScriptRef?: (script: ModelEditorScript) => void;
}

const ModelEditorControl: React.FC<ModelEditorControlProps> = ({ 
  renderer, 
  onObjectSelected,
  onObjectDeselected,
  onScriptRef
}) => {
  const editorScriptRef = useRef<ModelEditorScript | null>(null);

  useEffect(() => {
    if (!renderer) return;

    // 创建模型编辑脚本
    const editorScript = new ModelEditorScript({
      enableSelection: true,
      enableMove: true,
      enableRotate: true,
      enableScale: true,
      selectionColor: 0xff0000,
      showAxes: true,
      enableGridSnap: true,
      gridSize: 1
    });

    // 添加脚本到渲染器
    renderer.addScript(editorScript);
    editorScriptRef.current = editorScript;
    
    // 传递脚本引用给父组件
    if (onScriptRef) {
      onScriptRef(editorScript);
    }

    console.log('[ModelEditorControl] 模型编辑脚本已添加');

    // 清理函数
    return () => {
      if (editorScriptRef.current) {
        // 移除脚本
        renderer.removeScript(editorScriptRef.current);
        editorScriptRef.current = null;
        console.log('[ModelEditorControl] 模型编辑脚本已移除');
      }
    };
  }, [renderer, onScriptRef]);

  const handleMoveMode = () => {
    if (editorScriptRef.current) {
      editorScriptRef.current.setTransformMode(TransformMode.MOVE);
      console.log('[ModelEditorControl] 切换到移动模式');
    }
  };

  const handleRotateMode = () => {
    if (editorScriptRef.current) {
      editorScriptRef.current.setTransformMode(TransformMode.ROTATE);
      console.log('[ModelEditorControl] 切换到旋转模式');
    }
  };

  const handleScaleMode = () => {
    if (editorScriptRef.current) {
      editorScriptRef.current.setTransformMode(TransformMode.SCALE);
      console.log('[ModelEditorControl] 切换到缩放模式');
    }
  };

  const handleDelete = () => {
    if (editorScriptRef.current) {
      // 模拟按下Delete键
      const deleteEvent = new KeyboardEvent('keydown', { key: 'Delete' });
      document.dispatchEvent(deleteEvent);
      console.log('[ModelEditorControl] 删除选中对象');
    }
  };

  const handleCopy = () => {
    if (editorScriptRef.current) {
      const copiedObject = editorScriptRef.current.copySelectedObject();
      if (copiedObject) {
        onObjectSelected?.(copiedObject);
        console.log('[ModelEditorControl] 复制选中对象');
      }
    }
  };

  const handleDeselect = () => {
    if (editorScriptRef.current) {
      // 模拟按下Esc键
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escEvent);
      onObjectDeselected?.();
      console.log('[ModelEditorControl] 取消选择');
    }
  };

  const handleToggleGridSnap = () => {
    if (editorScriptRef.current) {
      const currentConfig = {
        enableGridSnap: !(editorScriptRef.current as any).config?.enableGridSnap
      };
      editorScriptRef.current.updateConfig(currentConfig);
      console.log(`[ModelEditorControl] ${currentConfig.enableGridSnap ? '启用' : '禁用'}网格吸附`);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      zIndex: 1000,
      width: '250px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>模型编辑工具</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          变换模式:
        </label>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            onClick={handleMoveMode}
            style={{
              flex: 1,
              padding: '6px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            移动 (G)
          </button>
          <button 
            onClick={handleRotateMode}
            style={{
              flex: 1,
              padding: '6px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            旋转 (R)
          </button>
          <button 
            onClick={handleScaleMode}
            style={{
              flex: 1,
              padding: '6px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            缩放 (S)
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
          操作:
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
          <button 
            onClick={handleCopy}
            style={{
              padding: '6px',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            复制
          </button>
          <button 
            onClick={handleDelete}
            style={{
              padding: '6px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            删除 (Del)
          </button>
          <button 
            onClick={handleDeselect}
            style={{
              padding: '6px',
              backgroundColor: '#607D8B',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            取消选择 (Esc)
          </button>
          <button 
            onClick={handleToggleGridSnap}
            style={{
              padding: '6px',
              backgroundColor: '#795548',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            网格吸附
          </button>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#ccc' }}>
        <p style={{ margin: '5px 0' }}>操作说明:</p>
        <p style={{ margin: '5px 0' }}>- 点击对象选择</p>
        <p style={{ margin: '5px 0' }}>- G/R/S键切换模式</p>
        <p style={{ margin: '5px 0' }}>- 拖拽变换控制器操作</p>
        <p style={{ margin: '5px 0' }}>- Delete删除，Esc取消选择</p>
      </div>
    </div>
  );
};

export default ModelEditorControl;