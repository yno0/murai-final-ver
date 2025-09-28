import React, { useState } from 'react';
import { FiEdit, FiPlus, FiSave, FiX, FiCheck, FiAlertCircle, FiUpload } from 'react-icons/fi';

export default function AddEditWords() {
  const [activeTab, setActiveTab] = useState('single');
  const [formData, setFormData] = useState({
    word: '',
    language: 'english',
    category: 'profanity',
    severity: 'medium',
    description: '',
    synonyms: '',
    variations: ''
  });
  const [bulkText, setBulkText] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    // Handle bulk submission
    console.log('Bulk text:', bulkText);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiEdit className="text-[#015763]" />
          Add / Edit Words
        </h1>
        <p className="text-gray-600 mt-1">
          Add new words to the dictionary or edit existing entries
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('single')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'single'
                  ? 'border-[#015763] text-[#015763]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiPlus className="inline h-4 w-4 mr-2" />
              Single Word
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bulk'
                  ? 'border-[#015763] text-[#015763]'
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
                    Word/Phrase *
                  </label>
                  <input
                    type="text"
                    id="word"
                    name="word"
                    value={formData.word}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                    placeholder="Enter word or phrase"
                    required
                  />
                </div>

                {/* Language */}
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    Language *
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                    required
                  >
                    <option value="english">English</option>
                    <option value="filipino">Filipino</option>
                    <option value="both">Both Languages</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                    required
                  >
                    <option value="profanity">Profanity</option>
                    <option value="harassment">Harassment</option>
                    <option value="hate-speech">Hate Speech</option>
                    <option value="spam">Spam</option>
                    <option value="misinformation">Misinformation</option>
                    <option value="violence">Violence</option>
                    <option value="sexual">Sexual Content</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Severity */}
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                    Severity Level *
                  </label>
                  <select
                    id="severity"
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                    required
                  >
                    <option value="low">Low - Warning only</option>
                    <option value="medium">Medium - Content flagged</option>
                    <option value="high">High - Content blocked</option>
                    <option value="critical">Critical - Account action</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description/Context
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                  placeholder="Common misspellings or variations"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#023a42] transition-colors"
                >
                  <FiSave className="h-4 w-4" />
                  Save Word
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiX className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          )}

          {activeTab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FiAlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Bulk Import Instructions</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Enter one word per line. You can optionally specify properties using this format:</p>
                      <code className="bg-blue-100 px-2 py-1 rounded mt-2 block">
                        word|language|category|severity
                      </code>
                      <p className="mt-2">Example: <code>badword|english|profanity|high</code></p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="bulkText" className="block text-sm font-medium text-gray-700 mb-2">
                  Words to Import
                </label>
                <textarea
                  id="bulkText"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent font-mono text-sm"
                  placeholder="Enter words here, one per line..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#023a42] transition-colors"
                >
                  <FiUpload className="h-4 w-4" />
                  Import Words
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiX className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Recent Additions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Additions</h3>
          <p className="text-sm text-gray-600">Words added in the last 24 hours</p>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[
              { word: 'newbadword', language: 'English', category: 'Profanity', severity: 'High', time: '2 hours ago' },
              { word: 'masama na salita', language: 'Filipino', category: 'Profanity', severity: 'Medium', time: '4 hours ago' },
              { word: 'spam content', language: 'English', category: 'Spam', severity: 'Low', time: '6 hours ago' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <FiCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <span className="font-medium text-gray-900">{item.word}</span>
                    <span className="text-sm text-gray-500 ml-2">({item.language})</span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.severity === 'High' ? 'bg-red-100 text-red-800' :
                    item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.severity}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
