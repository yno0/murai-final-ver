import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Globe, Type } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import extensionSettingsService from '../../services/extensionSettingsService';

const WhitelistManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('websites'); // 'websites' or 'terms'
  const [settings, setSettings] = useState({
    whitelist: { websites: [], terms: [] }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await extensionSettingsService.getSettings();
      const convertedSettings = extensionSettingsService.convertFromApiFormat(response.data);
      setSettings(convertedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setError('Failed to load whitelist settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const apiSettings = extensionSettingsService.convertToApiFormat(settings);
      await extensionSettingsService.updateSettings(apiSettings);
      
      // Show success message briefly
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = 'Whitelist updated successfully!';
      document.body.appendChild(successMessage);
      setTimeout(() => document.body.removeChild(successMessage), 3000);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError('Failed to save whitelist settings');
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    
    const trimmedItem = newItem.trim();
    const currentList = activeTab === 'websites' 
      ? settings.whitelist.websites 
      : settings.whitelist.terms;
    
    // Check for duplicates
    if (currentList.includes(trimmedItem)) {
      setError(`This ${activeTab.slice(0, -1)} is already in the whitelist`);
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      whitelist: {
        ...prev.whitelist,
        [activeTab]: [...currentList, trimmedItem]
      }
    }));
    
    setNewItem('');
    setShowAddForm(false);
    setError(null);
  };

  const removeItem = (index) => {
    const currentList = activeTab === 'websites' 
      ? settings.whitelist.websites 
      : settings.whitelist.terms;
    
    setSettings(prev => ({
      ...prev,
      whitelist: {
        ...prev.whitelist,
        [activeTab]: currentList.filter((_, i) => i !== index)
      }
    }));
  };

  const startEdit = (index, value) => {
    setEditingItem({ index, value, originalValue: value });
  };

  const saveEdit = () => {
    if (!editingItem.value.trim()) return;
    
    const currentList = activeTab === 'websites' 
      ? settings.whitelist.websites 
      : settings.whitelist.terms;
    
    const updatedList = [...currentList];
    updatedList[editingItem.index] = editingItem.value.trim();
    
    setSettings(prev => ({
      ...prev,
      whitelist: {
        ...prev.whitelist,
        [activeTab]: updatedList
      }
    }));
    
    setEditingItem(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
  };

  const getCurrentList = () => {
    return activeTab === 'websites' 
      ? settings.whitelist.websites 
      : settings.whitelist.terms;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#015763]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/client/extension')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Whitelist Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage websites and terms that should be excluded from content filtering
              </p>
            </div>
          </div>
          
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
              ${isSaving 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#015763] text-white hover:bg-[#014a54]'
              }
            `}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-pulse' : ''}`} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('websites')}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === 'websites'
                    ? 'border-[#015763] text-[#015763] bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Globe className="w-4 h-4" />
                Websites ({settings.whitelist.websites.length})
              </button>
              <button
                onClick={() => setActiveTab('terms')}
                className={`
                  flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === 'terms'
                    ? 'border-[#015763] text-[#015763] bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Type className="w-4 h-4" />
                Terms ({settings.whitelist.terms.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Add New Item */}
            <div className="mb-6">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#014a54] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add {activeTab === 'websites' ? 'Website' : 'Term'}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={`Enter ${activeTab === 'websites' ? 'website (e.g., example.com)' : 'term to whitelist'}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addItem()}
                    autoFocus
                  />
                  <button
                    onClick={addItem}
                    className="px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#014a54] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItem('');
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'websites' ? 'Website' : 'Term'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getCurrentList().length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                        No {activeTab} in whitelist yet
                      </td>
                    </tr>
                  ) : (
                    getCurrentList().map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {editingItem && editingItem.index === index ? (
                            <input
                              type="text"
                              value={editingItem.value}
                              onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                              onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{item}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingItem && editingItem.index === index ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={saveEdit}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEdit(index, item)}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeItem(index)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhitelistManagement;
