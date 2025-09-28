import React, { useState } from 'react';
import { FiList, FiPlus, FiEdit, FiTrash2, FiSearch, FiSave, FiX, FiEye, FiUsers } from 'react-icons/fi';

export default function CustomLists() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  // Mock data
  const customLists = [
    {
      id: 1,
      name: 'Gaming Toxicity',
      description: 'Words commonly used in toxic gaming environments',
      wordCount: 156,
      isActive: true,
      createdBy: 'Admin',
      createdAt: '2024-01-20',
      lastModified: '2024-01-25',
      category: 'Gaming',
      visibility: 'Public'
    },
    {
      id: 2,
      name: 'Social Media Slang',
      description: 'Current social media slang that may be inappropriate',
      wordCount: 89,
      isActive: true,
      createdBy: 'Moderator',
      createdAt: '2024-01-18',
      lastModified: '2024-01-24',
      category: 'Social Media',
      visibility: 'Private'
    },
    {
      id: 3,
      name: 'Political Terms',
      description: 'Political terms that require careful moderation',
      wordCount: 234,
      isActive: false,
      createdBy: 'Admin',
      createdAt: '2024-01-15',
      lastModified: '2024-01-22',
      category: 'Politics',
      visibility: 'Public'
    },
    {
      id: 4,
      name: 'Regional Dialects',
      description: 'Regional Filipino dialects and expressions',
      wordCount: 67,
      isActive: true,
      createdBy: 'Moderator',
      createdAt: '2024-01-12',
      lastModified: '2024-01-20',
      category: 'Regional',
      visibility: 'Public'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiList className="text-[#015763]" />
          Custom Lists
        </h1>
        <p className="text-gray-600 mt-1">
          Create and manage custom word lists for specific use cases
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-[#015763] bg-opacity-10 rounded-lg">
              <FiList className="h-6 w-6 text-[#015763]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Lists</p>
              <p className="text-2xl font-bold text-gray-900">{customLists.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiEye className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Lists</p>
              <p className="text-2xl font-bold text-gray-900">{customLists.filter(l => l.isActive).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUsers className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Public Lists</p>
              <p className="text-2xl font-bold text-gray-900">{customLists.filter(l => l.visibility === 'Public').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiPlus className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Words</p>
              <p className="text-2xl font-bold text-gray-900">{customLists.reduce((sum, l) => sum + l.wordCount, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Create */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search custom lists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent w-full"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#023a42] transition-colors"
          >
            <FiPlus className="h-4 w-4" />
            Create List
          </button>
        </div>
      </div>

      {/* Custom Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customLists.map((list) => (
          <div key={list.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{list.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      list.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {list.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{list.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{list.category}</span>
                    <span>{list.visibility}</span>
                    <span>{list.wordCount} words</span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setSelectedList(list)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <FiEdit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-700 transition-colors">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-500">Created by {list.createdBy}</p>
                    <p className="text-gray-500">{list.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Modified</p>
                    <p className="text-gray-500">{list.lastModified}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
