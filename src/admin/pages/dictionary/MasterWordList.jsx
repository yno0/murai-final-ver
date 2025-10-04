import React, { useEffect, useState } from 'react';
import { FiList, FiSearch, FiFilter, FiPlus, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function MasterWordList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // word object or null
  const [form, setForm] = useState({ word: '', language: 'English', category: 'profanity', variations: '' });
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm({ word: '', language: 'English', category: 'profanity', variations: '' });
    setIsModalOpen(true);
  };

  const openEdit = (w) => {
    setEditing(w);
    setForm({
      word: w.word || '',
      language: (w.language === 'Filipino' || w.language === 'English') ? w.language : 'English',
      category: w.category || 'profanity',
      variations: Array.isArray(w.variations) ? w.variations.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
  };

  const loadWords = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await adminApiService.getDictionaryWords({ page: 1, limit: 500 });
      const words = response?.data?.words || response?.words || [];
      setRows(words);
    } catch (e) {
      console.error('Failed to load dictionary words', e);
      setError(e.message || 'Failed to load dictionary words');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadWords(); }, []);

  const filtered = rows.filter((w) => {
    const matchesSearch = !searchTerm ||
      w.word?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.language?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = languageFilter === 'all' || (w.language && w.language.toLowerCase() === languageFilter);
    return matchesSearch && matchesLang;
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    try {
      setSaving(true);
      setError('');
      const payload = {
        word: form.word.trim(),
        language: form.language,
        category: form.category,
        variations: form.variations
          ? form.variations.split(',').map(v => v.trim()).filter(Boolean)
          : []
      };

      if (!payload.word || !payload.language || !payload.category) {
        throw new Error('Word, language and category are required.');
      }

      if (editing && (editing._id || editing.id)) {
        const id = editing._id || editing.id;
        await adminApiService.updateDictionaryWord(id, payload);
      } else {
        await adminApiService.addDictionaryWord(payload);
      }

      await loadWords();
      setIsModalOpen(false);
    } catch (e) {
      console.error('Save failed', e);
      setError(e.message || 'Failed to save word');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (w) => {
    if (!window.confirm(`Delete word "${w.word}"?`)) return;
    try {
      await adminApiService.deleteDictionaryWord(w._id || w.id);
      setRows(prev => prev.filter(x => (x._id || x.id) !== (w._id || w.id)));
    } catch (e) {
      console.error('Delete failed', e);
      setError(e.message || 'Failed to delete word');
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'profanity':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'slur':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'bullying':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'sexual':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'other':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">Master Word List</h1>
            <p className="text-sm text-gray-600">
              Manage the dictionary of words and phrases for content moderation • {filtered.length} words
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAdd}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 transition-colors flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add Word
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
              placeholder="Search words, categories, or languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Language Filter */}
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
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadWords}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 transition-colors flex items-center gap-2"
          >
            <FiFilter className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Word List Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Word
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={4}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Loading words...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={4}>
                    {searchTerm || languageFilter !== 'all' ? 'No words match your search criteria.' : 'No words found. Add your first word to get started.'}
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id || w._id || `${w.word}-${w.language}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {w.word}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {w.language}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(w.category)}`}>
                        {w.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(w)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit word"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(w)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete word"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg w-full max-w-md border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? 'Edit Word' : 'Add New Word'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                disabled={saving}
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Word <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.word}
                  onChange={(e) => setForm({ ...form, word: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Enter word or phrase"
                  required
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    required
                    disabled={saving}
                  >
                    <option value="English">English</option>
                    <option value="Filipino">Filipino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    required
                    disabled={saving}
                  >
                    <option value="profanity">Profanity</option>
                    <option value="slur">Slur</option>
                    <option value="bullying">Bullying</option>
                    <option value="sexual">Sexual</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variations
                </label>
                <input
                  type="text"
                  value={form.variations}
                  onChange={(e) => setForm({ ...form, variations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="e.g. variant1, variant2, variant3"
                  disabled={saving}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate multiple variations with commas
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.word.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    editing ? 'Update Word' : 'Add Word'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
