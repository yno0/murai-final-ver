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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiList className="text-[#015763]" />
          Master Word List
        </h1>
        <p className="text-gray-600 mt-1">
          Manage the dictionary of words and phrases for content moderation
        </p>
      </div>

      {/* Search and Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex-1 flex gap-3 w-full">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search words…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
              />
            </div>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
            >
              <option value="all">All Languages</option>
              <option value="english">English</option>
              <option value="filipino">Filipino</option>
            </select>
            <button onClick={loadWords} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <FiFilter className="h-4 w-4" /> Refresh
            </button>
          </div>
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <button onClick={openAdd} className="px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#014a54] transition-colors flex items-center gap-2">
              <FiPlus className="h-4 w-4" />
              Add Word
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Word List Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>Loading words…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={4}>No results.</td></tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id || w._id || `${w.word}-${w.language}`} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{w.word}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{w.language}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{w.category}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(w)} className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-1">
                          <FiEdit2 /> Edit
                        </button>
                        <button onClick={() => handleDelete(w)} className="px-3 py-1.5 border border-red-300 text-red-700 rounded-md hover:bg-red-50 flex items-center gap-1">
                          <FiTrash2 /> Delete
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg w-full max-w-md shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="text-base font-semibold text-gray-900">{editing ? 'Edit Word' : 'Add Word'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Word</label>
                <input
                  value={form.word}
                  onChange={(e) => setForm({ ...form, word: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                  placeholder="Enter word"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                    required
                  >
                    <option value="English">English</option>
                    <option value="Filipino">Filipino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                    required
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Variations (comma-separated)</label>
                <input
                  value={form.variations}
                  onChange={(e) => setForm({ ...form, variations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                  placeholder="e.g. alt1, alt2"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-3 py-2 bg-[#015763] text-white rounded-md hover:bg-[#014a54] disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
