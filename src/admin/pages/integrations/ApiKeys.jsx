import React, { useState, useEffect } from 'react';
import {
  FiKey,
  FiPlus,
  FiEye,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiEdit3,
  FiRefreshCw,
  FiCopy,
  FiShield,
  FiClock,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiSettings
} from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [newApiKey, setNewApiKey] = useState('');

  const itemsPerPage = 10;

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'detection_only',
    rateLimit: {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      requestsPerDay: 10000
    },
    restrictions: {
      allowedDomains: [],
      allowedIPs: [],
      expiresAt: ''
    }
  });

  const [revokeReason, setRevokeReason] = useState('');

  // API key types
  const keyTypes = [
    { value: 'full_access', label: 'Full Access', description: 'Complete access to all endpoints' },
    { value: 'read_only', label: 'Read Only', description: 'Read access to data and analytics' },
    { value: 'detection_only', label: 'Detection Only', description: 'Submit and view detections only' },
    { value: 'analytics_only', label: 'Analytics Only', description: 'Access to analytics data only' },
    { value: 'custom', label: 'Custom', description: 'Custom permission set' }
  ];

  // Fetch API keys
  const fetchApiKeys = async (page = currentPage, search = searchTerm, status = statusFilter, type = typeFilter) => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        limit: itemsPerPage,
        sortBy,
        sortOrder
      };

      if (search) params.search = search;
      if (status) params.status = status;
      if (type) params.type = type;

      const response = await adminApiService.getApiKeys(params);

      if (response.success) {
        setApiKeys(response.data.apiKeys || []);
        setCurrentPage(response.data.pagination?.page || 1);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(response.message || 'Failed to fetch API keys');
        setApiKeys([]);
      }
    } catch (err) {
      setError('Failed to fetch API keys');
      setApiKeys([]);
      console.error('Error fetching API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchApiKeys(1, searchTerm, statusFilter, typeFilter);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'type') {
      setTypeFilter(value);
    }
    setCurrentPage(1);
    fetchApiKeys(1, searchTerm, filterType === 'status' ? value : statusFilter, filterType === 'type' ? value : typeFilter);
  };

  // Handle sort change
  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    fetchApiKeys(currentPage, searchTerm, statusFilter, typeFilter);
  };

  // Create API key
  const handleCreateApiKey = async () => {
    try {
      setActionLoading('create');

      const response = await adminApiService.createApiKey(formData);

      if (response.success) {
        setNewApiKey(response.data.apiKey.key);
        setShowCreateModal(false);
        setShowKeyModal(true);
        setFormData({
          name: '',
          description: '',
          type: 'detection_only',
          rateLimit: {
            requestsPerMinute: 100,
            requestsPerHour: 1000,
            requestsPerDay: 10000
          },
          restrictions: {
            allowedDomains: [],
            allowedIPs: [],
            expiresAt: ''
          }
        });
        await fetchApiKeys();
      } else {
        setError(response.message || 'Failed to create API key');
      }
    } catch (err) {
      setError('Failed to create API key');
      console.error('Error creating API key:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Revoke API key
  const handleRevokeApiKey = async () => {
    try {
      setActionLoading('revoke');

      const response = await adminApiService.revokeApiKey(selectedApiKey._id, revokeReason);

      if (response.success) {
        setShowRevokeModal(false);
        setSelectedApiKey(null);
        setRevokeReason('');
        await fetchApiKeys();
      } else {
        setError(response.message || 'Failed to revoke API key');
      }
    } catch (err) {
      setError('Failed to revoke API key');
      console.error('Error revoking API key:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete API key
  const handleDeleteApiKey = async () => {
    try {
      setActionLoading('delete');

      const response = await adminApiService.deleteApiKey(selectedApiKey._id);

      if (response.success) {
        setShowDeleteModal(false);
        setSelectedApiKey(null);
        await fetchApiKeys();
      } else {
        setError(response.message || 'Failed to delete API key');
      }
    } catch (err) {
      setError('Failed to delete API key');
      console.error('Error deleting API key:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border border-green-200';
      case 'inactive': return 'bg-gray-50 text-gray-700 border border-gray-200';
      case 'revoked': return 'bg-red-50 text-red-700 border border-red-200';
      case 'expired': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FiCheckCircle className="h-4 w-4" />;
      case 'inactive': return <FiXCircle className="h-4 w-4" />;
      case 'revoked': return <FiShield className="h-4 w-4" />;
      case 'expired': return <FiClock className="h-4 w-4" />;
      default: return <FiXCircle className="h-4 w-4" />;
    }
  };

  // Get type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'full_access': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'read_only': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'detection_only': return 'bg-green-50 text-green-700 border border-green-200';
      case 'analytics_only': return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'custom': return 'bg-gray-50 text-gray-700 border border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiKey className="text-blue-600" />
              API Keys & Tokens
            </h1>
            <p className="text-gray-600 mt-1">
              Manage API keys and authentication tokens for system integrations
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Generate API Key
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <FiAlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search API keys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {keyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiSearch className="h-4 w-4" />
              Search
            </button>

            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setTypeFilter('');
                setCurrentPage(1);
                fetchApiKeys(1, '', '', '');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <FiRefreshCw className="h-4 w-4 animate-spin" />
              Loading API keys...
            </div>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiKey className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No API keys found</p>
            <p className="text-sm">Create your first API key to get started with integrations.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate API Key
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Key
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('type')}
                    >
                      Type
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {apiKeys.map((apiKey) => (
                    <tr key={apiKey._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiKey className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                            {apiKey.description && (
                              <div className="text-sm text-gray-500">{apiKey.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                            {apiKey.maskedKey}
                          </code>
                          <button
                            onClick={() => copyToClipboard(apiKey.maskedKey)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Copy key"
                          >
                            <FiCopy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(apiKey.type)}`}>
                          {keyTypes.find(t => t.value === apiKey.type)?.label || apiKey.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(apiKey.status)}`}>
                          {getStatusIcon(apiKey.status)}
                          {apiKey.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{apiKey.usage?.totalRequests || 0} requests</div>
                          <div className="text-gray-500">Today: {apiKey.usage?.requestsToday || 0}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {apiKey.usage?.lastUsed ? new Date(apiKey.usage.lastUsed).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(apiKey.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedApiKey(apiKey);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Edit API key"
                          >
                            <FiEdit3 className="h-4 w-4" />
                          </button>
                          {apiKey.status === 'active' && (
                            <button
                              onClick={() => {
                                setSelectedApiKey(apiKey);
                                setShowRevokeModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-700 p-1"
                              title="Revoke API key"
                            >
                              <FiShield className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedApiKey(apiKey);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete API key"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New API Key</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter API key name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {keyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {keyTypes.find(t => t.value === formData.type)?.description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApiKey}
                disabled={!formData.name || actionLoading === 'create'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === 'create' && <FiRefreshCw className="h-4 w-4 animate-spin" />}
                Generate Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show New API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">API Key Generated</h3>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <FiAlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Important!</p>
                  <p className="text-sm text-yellow-700">
                    This is the only time you'll see the full API key. Please copy it now and store it securely.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your API Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded border font-mono break-all">
                  {newApiKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newApiKey)}
                  className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded"
                  title="Copy to clipboard"
                >
                  <FiCopy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowKeyModal(false);
                  setNewApiKey('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke API Key Modal */}
      {showRevokeModal && selectedApiKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revoke API Key</h3>

            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to revoke the API key "{selectedApiKey.name}"? This action cannot be undone.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter reason for revocation"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRevokeModal(false);
                  setSelectedApiKey(null);
                  setRevokeReason('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeApiKey}
                disabled={actionLoading === 'revoke'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === 'revoke' && <FiRefreshCw className="h-4 w-4 animate-spin" />}
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete API Key Modal */}
      {showDeleteModal && selectedApiKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete API Key</h3>

            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to permanently delete the API key "{selectedApiKey.name}"? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedApiKey(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteApiKey}
                disabled={actionLoading === 'delete'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === 'delete' && <FiRefreshCw className="h-4 w-4 animate-spin" />}
                Delete Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
