import React, { useState, useEffect } from 'react';
import { FiLink, FiEdit, FiPlus, FiTrash2, FiSearch, FiSave, FiX, FiRefreshCw } from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function SynonymsVariations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [languageFilter, setLanguageFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load words from API
  const loadWords = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await adminApiService.getDictionaryWords({ page: 1, limit: 1000 });
      const wordList = response?.data?.words || response?.words || [];
      setWords(wordList);
    } catch (e) {
      console.error('Failed to load words', e);
      setError(e.message || 'Failed to load words');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
  }, []);

  // Group words by main word (words with variations)
  const wordGroups = words
    .filter(word => word.variations && word.variations.length > 0)
    .map(word => ({
      id: word._id || word.id,
      mainWord: word.word,
      synonyms: [], // We'll treat variations as both synonyms and variations for now
      variations: word.variations || [],
      language: word.language,
      category: word.category,
      wordCount: 1 + (word.variations?.length || 0),
      originalWord: word
    }));

  // Filter word groups
  const filteredGroups = wordGroups.filter(group => {
    const matchesSearch = !searchTerm ||
      group.mainWord.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.variations.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLanguage = languageFilter === 'all' || group.language.toLowerCase() === languageFilter;
    const matchesCategory = categoryFilter === 'all' || group.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesLanguage && matchesCategory;
  });

  // Handle form submission
  const handleSave = async (formData) => {
    try {
      setSaving(true);
      setError('');

      const payload = {
        word: formData.mainWord.trim(),
        language: formData.language,
        category: formData.category,
        variations: formData.variations
          .split(',')
          .map(v => v.trim())
          .filter(Boolean)
      };

      if (selectedWord) {
        // Update existing word
        await adminApiService.updateDictionaryWord(selectedWord.id, payload);
      } else {
        // Create new word
        await adminApiService.addDictionaryWord(payload);
      }

      await loadWords();
      setShowAddForm(false);
      setSelectedWord(null);
    } catch (e) {
      console.error('Save failed', e);
      setError(e.message || 'Failed to save word');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (group) => {
    if (!window.confirm(`Delete word "${group.mainWord}" and all its variations?`)) return;

    try {
      await adminApiService.deleteDictionaryWord(group.id);
      await loadWords();
    } catch (e) {
      console.error('Delete failed', e);
      setError(e.message || 'Failed to delete word');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiLink className="text-[#015763]" />
          Synonyms & Variations
        </h1>
        <p className="text-gray-600 mt-1">
          Manage word relationships, synonyms, and common variations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-[#015763] bg-opacity-10 rounded-lg">
              <FiLink className="h-6 w-6 text-[#015763]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Word Groups</p>
              <p className="text-2xl font-bold text-gray-900">{filteredGroups.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiEdit className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Words</p>
              <p className="text-2xl font-bold text-gray-900">{words.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiPlus className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Variations</p>
              <p className="text-2xl font-bold text-gray-900">{filteredGroups.reduce((sum, g) => sum + g.variations.length, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiRefreshCw className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Linked Words</p>
              <p className="text-2xl font-bold text-gray-900">{filteredGroups.reduce((sum, g) => sum + g.wordCount, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search word groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent w-full"
              />
            </div>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
            >
              <option value="all">All Languages</option>
              <option value="english">English</option>
              <option value="filipino">Filipino</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="profanity">Profanity</option>
              <option value="slur">Slur</option>
              <option value="bullying">Bullying</option>
              <option value="sexual">Sexual</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadWords}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#023a42] transition-colors"
            >
              <FiPlus className="h-4 w-4" />
              Add Word Group
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
        )}
      </div>

      {/* Word Groups */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
            <FiRefreshCw className="h-8 w-8 text-[#015763] mx-auto mb-2 animate-spin" />
            <p className="text-gray-600">Loading word groups...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm text-center">
            <FiLink className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No word groups found with variations.</p>
            <p className="text-sm text-gray-500 mt-1">Add variations to existing words to see them here.</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{group.mainWord}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{group.language}</span>
                    <span>{group.category}</span>
                    <span>{group.wordCount} total words</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedWord(group)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                    title="Edit word group"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(group)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                    title="Delete word group"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Variations</h4>
                <div className="flex flex-wrap gap-2">
                  {group.variations.length > 0 ? (
                    group.variations.map((variation, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        {variation}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">No variations</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || selectedWord) && (
        <WordGroupModal
          selectedWord={selectedWord}
          onSave={handleSave}
          onClose={() => {
            setShowAddForm(false);
            setSelectedWord(null);
          }}
          saving={saving}
        />
      )}
    </div>
  );
}

// Modal component for adding/editing word groups
function WordGroupModal({ selectedWord, onSave, onClose, saving }) {
  const [formData, setFormData] = useState({
    mainWord: selectedWord?.mainWord || '',
    language: selectedWord?.language || 'English',
    category: selectedWord?.category || 'profanity',
    variations: selectedWord?.variations?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {selectedWord ? 'Edit Word Group' : 'Add New Word Group'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Word *
              </label>
              <input
                type="text"
                value={formData.mainWord}
                onChange={(e) => handleChange('mainWord', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                placeholder="Enter main word"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language *
              </label>
              <select
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                required
              >
                <option value="English">English</option>
                <option value="Filipino">Filipino</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
              required
            >
              <option value="profanity">Profanity</option>
              <option value="slur">Slur</option>
              <option value="bullying">Bullying</option>
              <option value="sexual">Sexual</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variations
            </label>
            <textarea
              value={formData.variations}
              onChange={(e) => handleChange('variations', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
              placeholder="Enter variations separated by commas (e.g., w0rd, w@rd, w-o-r-d)"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Variations are alternative spellings or character substitutions of the main word
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#023a42] disabled:opacity-50 transition-colors"
            >
              <FiSave className="h-4 w-4" />
              {saving ? 'Saving...' : (selectedWord ? 'Save Changes' : 'Add Group')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <FiX className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
