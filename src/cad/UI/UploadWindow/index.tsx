import React, { useState } from 'react';
import './style.css';

interface UploadWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File | null, metadata: BIMMetadata) => void;
}

interface BIMMetadata {
  projectName: string;
  projectLocation: string;
  buildingType: string;
  constructionYear: string;
  architect: string;
  buildingArea: string;
  floors: string;
  // 新增模型文件信息字段
  fileFormat: string;
  creationSoftware: string;
  softwareVersion: string;
  creationTime: string;
  modificationTime: string;
  fileSize: string;
  modelPrecision: string;
  // 新增构件属性字段
  componentCode: string;
  geometryProperties: string;
  nonGeometryProperties: string;
  classificationInfo: string;
  // 新增构件关系字段
  spatialRelationships: string;
  systemRelationships: string;
  processRelationships: string;
}

const UploadWindow: React.FC<UploadWindowProps> = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<BIMMetadata>({
    projectName: '',
    projectLocation: '',
    buildingType: '',
    constructionYear: '',
    architect: '',
    buildingArea: '',
    floors: '',
    // 初始化新增字段
    fileFormat: '',
    creationSoftware: '',
    softwareVersion: '',
    creationTime: '',
    modificationTime: '',
    fileSize: '',
    modelPrecision: '',
    componentCode: '',
    geometryProperties: '',
    nonGeometryProperties: '',
    classificationInfo: '',
    spatialRelationships: '',
    systemRelationships: '',
    processRelationships: ''
  });

  // 处理文件选择
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // 自动填充文件相关信息
      setMetadata(prev => ({
        ...prev,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileFormat: file.name.split('.').pop()?.toUpperCase() || ''
      }));
    }
  };

  // 处理元数据字段变化
  const handleMetadataChange = (field: keyof BIMMetadata, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理上传
  const handleUpload = () => {
    onUpload(selectedFile, metadata);
    // 重置表单
    setSelectedFile(null);
    setMetadata({
      projectName: '',
      projectLocation: '',
      buildingType: '',
      constructionYear: '',
      architect: '',
      buildingArea: '',
      floors: '',
      fileFormat: '',
      creationSoftware: '',
      softwareVersion: '',
      creationTime: '',
      modificationTime: '',
      fileSize: '',
      modelPrecision: '',
      componentCode: '',
      geometryProperties: '',
      nonGeometryProperties: '',
      classificationInfo: '',
      spatialRelationships: '',
      systemRelationships: '',
      processRelationships: ''
    });
  };

  // 处理取消
  const handleCancel = () => {
    // 重置表单
    setSelectedFile(null);
    setMetadata({
      projectName: '',
      projectLocation: '',
      buildingType: '',
      constructionYear: '',
      architect: '',
      buildingArea: '',
      floors: '',
      fileFormat: '',
      creationSoftware: '',
      softwareVersion: '',
      creationTime: '',
      modificationTime: '',
      fileSize: '',
      modelPrecision: '',
      componentCode: '',
      geometryProperties: '',
      nonGeometryProperties: '',
      classificationInfo: '',
      spatialRelationships: '',
      systemRelationships: '',
      processRelationships: ''
    });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="upload-overlay">
      <div className="upload-window">
        <div className="upload-header">
          <h3 className="upload-title">
            构建3D模型
          </h3>
          <p className="upload-subtitle">
            上传模型文件并填写标准建构信息
          </p>
        </div>
        
        {/* 文件上传区域 */}
        <div className="upload-file-section">
          <label className="upload-file-label">
            选择模型文件:
          </label>
          <div className="upload-dropzone">
            <input
              type="file"
              accept=".ifc,.rvt,.dwg,.dxf"
              onChange={handleFileChange}
            />
            <div className="upload-icon">
              📁
            </div>
            <div className="upload-instruction">
              点击选择或拖拽文件到此处
            </div>
            <div className="upload-format">
              支持格式: IFC, RVT, DWG, DXF
            </div>
          </div>
          {selectedFile && (
            <div className="upload-file-info">
              <div className="upload-file-icon">
                📄
              </div>
              <div>
                <div className="upload-file-name">
                  {selectedFile.name}
                </div>
                <div className="upload-file-size">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 模型文件信息 */}
        <div className="upload-section">
          <h5 className="upload-section-title">
            模型文件信息
          </h5>
          
          <div className="upload-form-grid">
            <div>
              <label className="upload-form-label">
                文件格式:
              </label>
              <input
                type="text"
                value={metadata.fileFormat}
                onChange={(e) => handleMetadataChange('fileFormat', e.target.value)}
                placeholder="例如：IFC、RVT、DWG"
                className="upload-input"
              />
            </div>
            
            <div>
              <label className="upload-form-label">
                文件大小:
              </label>
              <input
                type="text"
                value={metadata.fileSize}
                readOnly
                className="upload-input"
              />
            </div>
          </div>
          
          <div className="upload-form-grid">
            <div>
              <label className="upload-form-label">
                创建软件:
              </label>
              <input
                type="text"
                value={metadata.creationSoftware}
                onChange={(e) => handleMetadataChange('creationSoftware', e.target.value)}
                placeholder="例如：Revit、ArchiCAD"
                className="upload-input"
              />
            </div>
            
            <div>
              <label className="upload-form-label">
                软件版本:
              </label>
              <input
                type="text"
                value={metadata.softwareVersion}
                onChange={(e) => handleMetadataChange('softwareVersion', e.target.value)}
                placeholder="例如：2023、2024"
                className="upload-input"
              />
            </div>
          </div>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px'
          }}>
            <div>
              <label className="upload-form-label">
                创建时间:
              </label>
              <input
                type="date"
                value={metadata.creationTime}
                onChange={(e) => handleMetadataChange('creationTime', e.target.value)}
                className="upload-input"
              />
            </div>
            
            <div>
              <label className="upload-form-label">
                修改时间:
              </label>
              <input
                type="date"
                value={metadata.modificationTime}
                onChange={(e) => handleMetadataChange('modificationTime', e.target.value)}
                className="upload-input"
              />
            </div>
          </div>
        </div>
        
        {/* 构件属性信息 */}
        <div className="upload-section">
          <h5 className="upload-section-title">
            构件属性信息
          </h5>
          
          <div className="upload-form-grid">
            <div>
              <label className="upload-form-label">
                构件唯一编码:
              </label>
              <input
                type="text"
                value={metadata.componentCode}
                onChange={(e) => handleMetadataChange('componentCode', e.target.value)}
                placeholder="例如：IFD编码"
                className="upload-input"
              />
            </div>
            
            <div>
              <label className="upload-form-label">
                分类信息:
              </label>
              <input
                type="text"
                value={metadata.classificationInfo}
                onChange={(e) => handleMetadataChange('classificationInfo', e.target.value)}
                placeholder="例如：门、窗、墙"
                className="upload-input"
              />
            </div>
          </div>
          
          <div className="upload-form-field">
            <label className="upload-form-label">
              几何属性:
            </label>
            <textarea
              value={metadata.geometryProperties}
              onChange={(e) => handleMetadataChange('geometryProperties', e.target.value)}
              placeholder="例如：尺寸、体积、面积"
              className="upload-textarea"
            />
          </div>
          
          <div className="upload-form-field">
            <label className="upload-form-label">
              非几何属性:
            </label>
            <textarea
              value={metadata.nonGeometryProperties}
              onChange={(e) => handleMetadataChange('nonGeometryProperties', e.target.value)}
              placeholder="例如：材质、供应商、物理性能"
              className="upload-textarea"
            />
          </div>
        </div>
        
        {/* 构件关系信息 */}
        <div className="upload-section">
          <h5 className="upload-section-title">
            构件关系信息
          </h5>
          
          <div className="upload-form-field">
            <label className="upload-form-label">
              空间关系:
            </label>
            <textarea
              value={metadata.spatialRelationships}
              onChange={(e) => handleMetadataChange('spatialRelationships', e.target.value)}
              placeholder="例如：连接、包含"
              className="upload-textarea"
            />
          </div>
          
          <div className="upload-form-field">
            <label className="upload-form-label">
              系统关系:
            </label>
            <textarea
              value={metadata.systemRelationships}
              onChange={(e) => handleMetadataChange('systemRelationships', e.target.value)}
              placeholder="例如：电力系统拓扑"
              className="upload-textarea"
            />
          </div>
          
          <div className="upload-form-field">
            <label className="upload-form-label">
              过程关系:
            </label>
            <textarea
              value={metadata.processRelationships}
              onChange={(e) => handleMetadataChange('processRelationships', e.target.value)}
              placeholder="例如：施工顺序"
              className="upload-textarea"
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="upload-actions">
          <button
            onClick={handleCancel}
            className="upload-btn-cancel"
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="upload-btn-submit"
          >
            构建模型
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadWindow;