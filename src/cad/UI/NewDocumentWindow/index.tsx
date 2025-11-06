import React, { useState } from 'react';
import './style.css';

interface NewDocumentWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (documentData: {
    name: string;
    width: number;
    height: number;
    units: string;
    backgroundColor: string;
  }) => void;
}

const NewDocumentWindow: React.FC<NewDocumentWindowProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [documentName, setDocumentName] = useState('新文档');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [units, setUnits] = useState('px');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  const handleCreate = () => {
    onCreate({
      name: documentName,
      width,
      height,
      units,
      backgroundColor
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="new-document-overlay">
      <div className="new-document-dialog">
        {/* 标题栏 */}
        <div className="new-document-header">
          <h3 className="new-document-title">新建文档</h3>
          <button
            onClick={onClose}
            className="new-document-close-btn"
          >
            ×
          </button>
        </div>

        {/* 内容区域 */}
        <div className="new-document-content">
          <div className="form-field">
            <label className="form-label">
              文档名称:
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">
                宽度:
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min="1"
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                高度:
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min="1"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">
                单位:
              </label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="form-select"
              >
                <option value="px">像素 (px)</option>
                <option value="mm">毫米 (mm)</option>
                <option value="cm">厘米 (cm)</option>
                <option value="in">英寸 (in)</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">
                背景颜色:
              </label>
              <div className="color-picker-container">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="color-input"
                />
                <span className="color-value">
                  {backgroundColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="new-document-footer">
          <button
            onClick={handleCancel}
            className="cancel-btn"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            className="create-btn"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewDocumentWindow;