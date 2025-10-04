import React, { useState } from 'react';
import { FiTag, FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiAlertTriangle, FiSearch, FiFilter } from 'react-icons/fi';

export default function Categories() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
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
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'critical': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Filter categories based on search and severity
  const filteredCategories = categories.filter(category => {
    const matchesSearch = !searchTerm ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || category.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Categories</h1>
            <p className="text-sm text-gray-600">
              Manage word categories and classification systems • {filteredCategories.length} categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 transition-colors flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] text-sm"
            />
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-gray-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] text-sm bg-white"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#015763]/10 rounded-lg">
              <FiTag className="h-5 w-5 text-[#015763]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Categories</p>
              <p className="text-xl font-semibold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <FiEdit className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Default Categories</p>
              <p className="text-xl font-semibold text-gray-900">{categories.filter(c => c.isDefault).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <FiAlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Severity</p>
              <p className="text-xl font-semibold text-gray-900">{categories.filter(c => c.severity === 'high' || c.severity === 'critical').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FiPlus className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Words</p>
              <p className="text-xl font-semibold text-gray-900">{categories.reduce((sum, c) => sum + c.wordCount, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                ></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  {category.isDefault && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#015763]/10 text-[#015763] border border-[#015763]/20 mt-1">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Edit category"
                >
                  <FiEdit className="h-4 w-4" />
                </button>
                {!category.isDefault && (
                  <button
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete category"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-900">{category.wordCount}</p>
                  <p className="text-xs text-gray-500">Words</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getSeverityColor(category.severity)}`}>
                  {category.severity.charAt(0).toUpperCase() + category.severity.slice(1)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm text-gray-900">{category.createdAt}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <FiTag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || severityFilter !== 'all'
              ? 'No categories match your search criteria.'
              : 'Get started by creating your first category.'
            }
          </p>
          {(!searchTerm && severityFilter === 'all') && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#015763] text-white rounded-md hover:bg-[#015763]/90 transition-colors"
            >
              Add Category
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingCategory) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCategory(null);
                  setNewCategory({ name: '', description: '', color: '#015763', severity: 'medium' });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingCategory ? handleSaveEdit : handleAddCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] text-sm"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] text-sm"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    value={newCategory.severity}
                    onChange={(e) => setNewCategory({...newCategory, severity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] text-sm bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCategory(null);
                    setNewCategory({ name: '', description: '', color: '#015763', severity: 'medium' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#015763] border border-transparent rounded-md hover:bg-[#015763]/90 transition-colors flex items-center gap-2"
                >
                  <FiSave className="h-4 w-4" />
                  {editingCategory ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
