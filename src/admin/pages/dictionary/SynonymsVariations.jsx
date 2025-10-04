import React, { useState, useEffect } from 'react';
import { FiLink, FiEdit, FiPlus, FiTrash2, FiSearch, FiSave, FiX, FiRefreshCw, FiFilter } from 'react-icons/fi';
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Pagination
  const totalItems = filteredGroups.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroups = filteredGroups.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, languageFilter, categoryFilter]);

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
      {/* Welcome Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Synonyms & Variations</h1>
            <p className="text-sm text-gray-600">
              Manage word relationships and variations • {totalItems} word groups
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 transition-colors flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add Group
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
              placeholder="Search word groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-gray-400" />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="all">All Languages</option>
              <option value="english">English</option>
              <option value="filipino">Filipino</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="all">All Categories</option>
              <option value="profanity">Profanity</option>
              <option value="slur">Slur</option>
              <option value="bullying">Bullying</option>
              <option value="sexual">Sexual</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadWords}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 transition-colors flex items-center gap-2"
          >
            <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Word Groups Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Main Word
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Variations
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={5}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Loading word groups...
                    </div>
                  </td>
                </tr>
              ) : paginatedGroups.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={5}>
                    {searchTerm || languageFilter !== 'all' || categoryFilter !== 'all'
                      ? 'No word groups match your search criteria.'
                      : 'No word groups found. Add variations to existing words to see them here.'
                    }
                  </td>
                </tr>
              ) : (
                paginatedGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {group.mainWord}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {group.language}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                        {group.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {group.variations.length > 0 ? (
                          group.variations.slice(0, 3).map((variation, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                            >
                              {variation}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">No variations</span>
                        )}
                        {group.variations.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{group.variations.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setSelectedWord(group)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit word group"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(group)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete word group"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} word groups
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

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
