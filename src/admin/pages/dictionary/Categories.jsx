import React, { useState } from 'react';
import { FiTag, FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiAlertTriangle } from 'react-icons/fi';

export default function Categories() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#015763',
    severity: 'medium'
  });

  // Mock data
  const categories = [
    {
      id: 1,
      name: 'Profanity',
      description: 'Offensive language and curse words',
      color: '#dc2626',
      wordCount: 1247,
      severity: 'high',
      isDefault: true,
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      name: 'Harassment',
      description: 'Content that targets or intimidates individuals',
      color: '#ea580c',
      wordCount: 523,
      severity: 'high',
      isDefault: true,
      createdAt: '2024-01-01'
    },
    {
      id: 3,
      name: 'Hate Speech',
      description: 'Content promoting hatred against groups',
      color: '#dc2626',
      wordCount: 342,
      severity: 'critical',
      isDefault: true,
      createdAt: '2024-01-01'
    },
    {
      id: 4,
      name: 'Spam',
      description: 'Repetitive or promotional content',
      color: '#facc15',
      wordCount: 189,
      severity: 'low',
      isDefault: false,
      createdAt: '2024-01-15'
    },
    {
      id: 5,
      name: 'Misinformation',
      description: 'False or misleading information',
      color: '#f97316',
      wordCount: 76,
      severity: 'medium',
      isDefault: false,
      createdAt: '2024-01-20'
    },
    {
      id: 6,
      name: 'Violence',
      description: 'Content promoting or describing violence',
      color: '#dc2626',
      wordCount: 234,
      severity: 'high',
      isDefault: true,
      createdAt: '2024-01-01'
    }
  ];

  const handleAddCategory = (e) => {
    e.preventDefault();
    console.log('Adding category:', newCategory);
    setShowAddForm(false);
    setNewCategory({ name: '', description: '', color: '#015763', severity: 'medium' });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      color: category.color,
      severity: category.severity
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    console.log('Saving edit:', editingCategory.id, newCategory);
    setEditingCategory(null);
    setNewCategory({ name: '', description: '', color: '#015763', severity: 'medium' });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiTag className="text-[#015763]" />
          Categories
        </h1>
        <p className="text-gray-600 mt-1">
          Manage word categories and classification systems
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-[#015763] bg-opacity-10 rounded-lg">
              <FiTag className="h-6 w-6 text-[#015763]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiEdit className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Default Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.filter(c => c.isDefault).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-gray-900">{categories.filter(c => c.severity === 'high' || c.severity === 'critical').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiPlus className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Words</p>
              <p className="text-2xl font-bold text-gray-900">{categories.reduce((sum, c) => sum + c.wordCount, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Category List</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#023a42] transition-colors"
        >
          <FiPlus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={editingCategory ? handleSaveEdit : handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity
                  </label>
                  <select
                    value={newCategory.severity}
                    onChange={(e) => setNewCategory({...newCategory, severity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#023a42] transition-colors"
                >
                  <FiSave className="h-4 w-4" />
                  {editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCategory(null);
                    setNewCategory({ name: '', description: '', color: '#015763', severity: 'medium' });
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiX className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    {category.isDefault && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  {!category.isDefault && (
                    <button className="text-red-600 hover:text-red-700 transition-colors">
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">{category.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{category.wordCount}</p>
                    <p className="text-xs text-gray-500">Words</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(category.severity)}`}>
                    {category.severity.charAt(0).toUpperCase() + category.severity.slice(1)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">{category.createdAt}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
