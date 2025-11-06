import React, { useState } from 'react';

interface ModelComponent {
  id: string;
  name: string;
  category: string;
  previewImage: string;
  filePath: string;
  size: string;
  lastModified: string;
}

interface ModelLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onModelSelect: (model: ModelComponent) => void;
}

const ModelLibrary: React.FC<ModelLibraryProps> = ({ isOpen, onClose, onModelSelect }) => {
  // 示例模型数据
  const [models] = useState<ModelComponent[]>([
    {
      id: '1',
      name: '办公桌',
      category: '家具',
      previewImage: '',
      filePath: '/models/desk.ifc',
      size: '2.4 MB',
      lastModified: '2023-05-15'
    },
    {
      id: '2',
      name: '会议桌',
      category: '家具',
      previewImage: '',
      filePath: '/models/conference-table.ifc',
      size: '1.8 MB',
      lastModified: '2023-05-10'
    },
    {
      id: '3',
      name: '办公椅',
      category: '家具',
      previewImage: '',
      filePath: '/models/office-chair.ifc',
      size: '1.2 MB',
      lastModified: '2023-05-12'
    },
    {
      id: '4',
      name: '文件柜',
      category: '家具',
      previewImage: '',
      filePath: '/models/filing-cabinet.ifc',
      size: '0.9 MB',
      lastModified: '2023-05-08'
    },
    {
      id: '5',
      name: '墙体',
      category: '建筑',
      previewImage: '',
      filePath: '/models/wall.ifc',
      size: '0.5 MB',
      lastModified: '2023-05-05'
    },
    {
      id: '6',
      name: '门',
      category: '建筑',
      previewImage: '',
      filePath: '/models/door.ifc',
      size: '0.7 MB',
      lastModified: '2023-05-03'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 获取所有分类
  const categories = ['全部', ...Array.from(new Set(models.map(model => model.category)))];

  // 过滤模型
  const filteredModels = models.filter(model => {
    const matchesCategory = selectedCategory === '全部' || model.category === selectedCategory;
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        backgroundColor: '#2a2a2a',
        color: 'white',
        borderRadius: '12px',
        padding: '30px',
        width: '800px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        border: '1px solid #444'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '1px solid #444'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: 0,
            fontSize: '24px',
            fontWeight: '500',
            background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            模型构件库
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>

        {/* 搜索和分类筛选 */}
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="搜索模型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#333',
                border: '1px solid #555',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '12px',
                backgroundColor: '#333',
                border: '1px solid #555',
                borderRadius: '6px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {categories.map(category => (
                <option key={category} value={category} style={{ backgroundColor: '#333' }}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 模型列表 */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {filteredModels.map(model => (
            <div
              key={model.id}
              onClick={() => onModelSelect(model)}
              style={{
                backgroundColor: '#333',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center',
                cursor: 'pointer',
                border: '1px solid #444',
                transition: 'all 0.3s',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4CAF50';
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#444';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '100%',
                height: '100px',
                backgroundColor: '#444',
                borderRadius: '4px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                🏢
              </div>
              <div style={{ 
                fontWeight: '500',
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                {model.name}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#999',
                marginBottom: '5px'
              }}>
                {model.category}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#777'
              }}>
                {model.size}
              </div>
            </div>
          ))}
        </div>

        {/* 底部操作按钮 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px',
          paddingTop: '20px',
          borderTop: '1px solid #444'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: '#555',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#666';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#555';
            }}
          >
            关闭
          </button>
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#45a049';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4CAF50';
            }}
          >
            上传新模型
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelLibrary;