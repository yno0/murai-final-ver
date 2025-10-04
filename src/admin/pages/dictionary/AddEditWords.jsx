import React, { useState, useRef } from 'react';
import { FiPlus, FiSave, FiX, FiCheck, FiAlertCircle, FiUpload, FiFileText, FiFile } from 'react-icons/fi';
import { useAdminToastContext } from '../../contexts/ToastContext.jsx';
import adminApiService from '../../services/adminApi.js';

export default function AddWords() {
  const toast = useAdminToastContext();
  const [activeTab, setActiveTab] = useState('single');
  const [formData, setFormData] = useState({
    word: '',
    language: 'English',
    category: 'profanity',
    description: '',
    synonyms: '',
    variations: ''
  });
  const [bulkText, setBulkText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('text'); // 'text' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for API
      const wordData = {
        word: formData.word.trim(),
        language: formData.language,
        category: formData.category,
        variations: formData.variations
          ? formData.variations.split(',').map(v => v.trim()).filter(Boolean)
          : []
      };

      // Validate required fields
      if (!wordData.word || !wordData.language || !wordData.category) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Call real API
      await adminApiService.addDictionaryWord(wordData);
      toast.success('Word added successfully!');

      // Reset form
      setFormData({
        word: '',
        language: 'English',
        category: 'profanity',
        description: '',
        synonyms: '',
        variations: ''
      });
    } catch (err) {
      console.error('Failed to add word:', err);
      toast.error(err.message || 'Failed to add word. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel'
      ];

      if (validTypes.includes(file.type) || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast.error('Please select a valid CSV file.');
        setSelectedFile(null);
      }
    }
  };

  const parseFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          let wordsData = [];

          // Valid categories according to backend model
          const validCategories = ['profanity', 'slur', 'bullying', 'sexual', 'other'];
          const validLanguages = ['English', 'Filipino'];

          const normalizeCategory = (category) => {
            if (!category) return 'profanity';
            const normalized = category.toLowerCase().trim();
            if (validCategories.includes(normalized)) return normalized;
            // Map common variations to valid categories
            if (normalized.includes('hate') || normalized.includes('harassment')) return 'slur';
            if (normalized.includes('violence') || normalized.includes('threat')) return 'bullying';
            if (normalized.includes('spam') || normalized.includes('misinformation')) return 'other';
            return 'other'; // Default fallback
          };

          const normalizeLanguage = (language) => {
            if (!language) return 'English';
            const normalized = language.toLowerCase().trim();
            if (normalized.includes('filipino') || normalized.includes('tagalog')) return 'Filipino';
            return 'English'; // Default fallback
          };

          if (file.name.endsWith('.csv') || file.type === 'text/csv') {
            // Parse CSV - handle both comma and tab separated
            const lines = content.split('\n').filter(line => line.trim());

            // Skip header row if it exists
            const dataLines = lines.slice(1);

            wordsData = dataLines.map(line => {
              // Try tab-separated first, then comma-separated
              let columns = line.includes('\t')
                ? line.split('\t').map(col => col.trim().replace(/"/g, ''))
                : line.split(',').map(col => col.trim().replace(/"/g, ''));

              return {
                word: columns[0] || '',
                language: normalizeLanguage(columns[1]),
                category: normalizeCategory(columns[2]),
                variations: []
              };
            }).filter(item => item.word && item.word.trim());
          } else {
            // Plain text file - one word per line
            const lines = content.split('\n').filter(line => line.trim());
            wordsData = lines.map(word => ({
              word: word.trim(),
              language: 'English',
              category: 'profanity',
              variations: []
            }));
          }

          resolve(wordsData);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let wordsData = [];

      if (uploadMethod === 'file' && selectedFile) {
        wordsData = await parseFileContent(selectedFile);
      } else if (uploadMethod === 'text' && bulkText.trim()) {
        // Parse text input - handle format: word|language|category or just word
        const lines = bulkText.split('\n').filter(line => line.trim());
        wordsData = lines.map(line => {
          const parts = line.split('|').map(p => p.trim());
          return {
            word: parts[0],
            language: parts[1] || 'English',
            category: parts[2] || 'profanity',
            variations: []
          };
        }).filter(w => w.word); // Remove empty words
      } else {
        toast.error('Please provide words to import.');
        return;
      }

      if (wordsData.length === 0) {
        toast.error('No valid words found to import.');
        return;
      }

      console.log('Importing words:', wordsData);

      // Use bulk import API
      const result = await adminApiService.importDictionary(wordsData);

      const importedCount = result.data?.imported || result.imported || 0;
      const updatedCount = result.data?.updated || result.updated || 0;
      const skippedCount = result.data?.skipped || result.skipped || 0;

      toast.success(`Import completed! ${importedCount} imported, ${updatedCount} updated, ${skippedCount} skipped from ${uploadMethod === 'file' ? selectedFile.name : 'text input'}`);

      // Reset form
      setBulkText('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Bulk import failed:', err);
      toast.error(err.message || 'Failed to add words. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Add Words</h1>
              <p className="text-sm text-gray-600">
                Add new words and phrases to the moderation dictionary
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('single')}
              className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'single'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiFileText className="inline h-4 w-4 mr-2" />
              Single Word
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'bulk'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiUpload className="inline h-4 w-4 mr-2" />
              Bulk Import
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'single' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Word Input */}
                <div>
                  <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-2">
                    Word/Phrase <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="word"
                    name="word"
                    value={formData.word}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter word or phrase"
                    required
                  />
                </div>

                {/* Language */}
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    required
                  >
                    <option value="English">English</option>
                    <option value="Filipino">Filipino</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    required
                  >
                    <option value="profanity">Profanity</option>
                    <option value="slur">Slur</option>
                    <option value="bullying">Bullying</option>
                    <option value="sexual">Sexual Content</option>
                    <option value="other">Other</option>
                  </select>
                </div>

              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description/Context
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Provide context or explanation for this word..."
                />
              </div>

              {/* Synonyms */}
              <div>
                <label htmlFor="synonyms" className="block text-sm font-medium text-gray-700 mb-2">
                  Synonyms/Related Words
                </label>
                <input
                  type="text"
                  id="synonyms"
                  name="synonyms"
                  value={formData.synonyms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Comma-separated list of related words"
                />
              </div>

              {/* Variations */}
              <div>
                <label htmlFor="variations" className="block text-sm font-medium text-gray-700 mb-2">
                  Common Variations/Misspellings
                </label>
                <input
                  type="text"
                  id="variations"
                  name="variations"
                  value={formData.variations}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Common misspellings or variations"
                />
              </div>

              {/* Action Buttons */}
              <div className="md:col-span-2 flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiSave className="h-4 w-4" />
                  )}
                  {isSubmitting ? 'Adding...' : 'Add Word'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      word: '',
                      language: 'English',
                      category: 'profanity',
                      description: '',
                      synonyms: '',
                      variations: ''
                    });
                  }}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <FiX className="h-4 w-4" />
                  Clear Form
                </button>
              </div>
            </form>
          )}

          {activeTab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} className="space-y-6">
              {/* Upload Method Selection */}
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">Choose Import Method</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="uploadMethod"
                      value="text"
                      checked={uploadMethod === 'text'}
                      onChange={(e) => setUploadMethod(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <FiFileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Text Input</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="uploadMethod"
                      value="file"
                      checked={uploadMethod === 'file'}
                      onChange={(e) => setUploadMethod(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <FiFile className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">File Upload (CSV, XLSX, TXT)</span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Import Format Instructions</h3>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p><strong>Text Input:</strong> Enter one word per line. Optional format:</p>
                      <div className="bg-blue-100 border border-blue-200 rounded px-3 py-2 font-mono text-xs">
                        word|language|category
                      </div>
                      <p><strong>CSV File Format:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li><strong>Header row:</strong> word, language, category</li>
                        <li><strong>Data rows:</strong> One word per row with properties</li>
                        <li><strong>Separators:</strong> Comma or tab separated values</li>
                      </ul>
                      <p>Example: <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">badword,English,profanity</code></p>
                      <p>If language/category are not specified, defaults will be used (English, profanity).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Input Method */}
              {uploadMethod === 'text' && (
                <div>
                  <label htmlFor="bulkText" className="block text-sm font-medium text-gray-700 mb-2">
                    Words to Import <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="bulkText"
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Enter words here, one per line...&#10;&#10;Examples:&#10;badword&#10;inappropriate|filipino|profanity|high&#10;spam|english|spam|medium"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    {bulkText.split('\n').filter(line => line.trim()).length} words ready to import
                  </p>
                </div>
              )}

              {/* File Upload Method */}
              {uploadMethod === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="fileUpload"
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <FiUpload className="h-8 w-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-xs text-gray-500">CSV files only</p>
                      </div>
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-2">
                        <FiCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="ml-auto text-green-600 hover:text-green-800"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting || (uploadMethod === 'text' && !bulkText.trim()) || (uploadMethod === 'file' && !selectedFile)}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FiUpload className="h-4 w-4" />
                  )}
                  {isSubmitting ? 'Processing...' : `Import ${uploadMethod === 'file' ? 'File' : 'Words'}`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBulkText('');
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <FiX className="h-4 w-4" />
                  Clear All
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
