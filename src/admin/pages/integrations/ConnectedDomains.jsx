import React, { useState, useEffect } from 'react';
import {
  FiLink,
  FiGlobe,
  FiPlus,
  FiActivity,
  FiSearch,
  FiFilter,
  FiEdit3,
  FiTrash2,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiShield,
  FiSettings,
  FiEye
} from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function ConnectedDomains() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    domain: '',
    name: '',
    description: '',
    integrationMethod: 'extension',
    settings: {
      enableProfanityDetection: true,
      enableSentimentAnalysis: true,
      autoModeration: false
    }
  });

  const itemsPerPage = 10;

  // Fetch domains
  const fetchDomains = async (page = currentPage, search = searchTerm, status = statusFilter) => {
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

      const response = await adminApiService.getDomains(params);

      if (response.success) {
        setDomains(response.data.domains || []);
        setCurrentPage(response.data.pagination?.page || 1);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(response.message || 'Failed to fetch domains');
        setDomains([]);
      }
    } catch (err) {
      setError('Failed to fetch domains');
      setDomains([]);
      console.error('Error fetching domains:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch domain statistics
  const fetchStats = async () => {
    try {
      const response = await adminApiService.getDomainStats();
      if (response.success) {
        setStats(response.data.stats || {});
      }
    } catch (err) {
      console.error('Error fetching domain stats:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchDomains();
    fetchStats();
  }, []);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchDomains(1, searchTerm, statusFilter);
  };

  // Handle filter change
  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    fetchDomains(1, searchTerm, newStatus);
  };

  // Handle sort change
  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    fetchDomains(currentPage, searchTerm, statusFilter);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border border-green-200';
      case 'inactive': return 'bg-gray-50 text-gray-700 border border-gray-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'blocked': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FiCheckCircle className="h-4 w-4" />;
      case 'inactive': return <FiXCircle className="h-4 w-4" />;
      case 'pending': return <FiClock className="h-4 w-4" />;
      case 'blocked': return <FiShield className="h-4 w-4" />;
      default: return <FiXCircle className="h-4 w-4" />;
    }
  };

  // Get health status color
  const getHealthColor = (health) => {
    switch (health?.status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  // Create domain
  const handleCreateDomain = async () => {
    try {
      setActionLoading('create');

      const response = await adminApiService.createDomain(formData);

      if (response.success) {
        setShowCreateModal(false);
        setFormData({
          domain: '',
          name: '',
          description: '',
          integrationMethod: 'extension',
          settings: {
            enableProfanityDetection: true,
            enableSentimentAnalysis: true,
            autoModeration: false
          }
        });
        await fetchDomains();
        await fetchStats();
      } else {
        setError(response.message || 'Failed to create domain');
      }
    } catch (err) {
      setError('Failed to create domain');
      console.error('Error creating domain:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete domain
  const handleDeleteDomain = async () => {
    try {
      setActionLoading('delete');

      const response = await adminApiService.deleteDomain(selectedDomain._id);

      if (response.success) {
        setShowDeleteModal(false);
        setSelectedDomain(null);
        await fetchDomains();
        await fetchStats();
      } else {
        setError(response.message || 'Failed to delete domain');
      }
    } catch (err) {
      setError('Failed to delete domain');
      console.error('Error deleting domain:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiGlobe className="text-blue-600" />
              Connected Domains
            </h1>
            <p className="text-gray-600 mt-1">
              Manage websites and domains where MURAi extension is active
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Add Domain
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Domains</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <FiGlobe className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Domains</p>
              <p className="text-2xl font-bold text-green-600">{stats.active || 0}</p>
            </div>
            <FiCheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Detections</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalDetections || 0}</p>
            </div>
            <FiShield className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Calls</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalApiCalls || 0}</p>
            </div>
            <FiActivity className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search domains..."
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
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="blocked">Blocked</option>
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
                setCurrentPage(1);
                fetchDomains(1, '', '');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <FiRefreshCw className="h-4 w-4 animate-spin" />
              Loading domains...
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={() => fetchDomains()}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        ) : domains.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiGlobe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No domains found</p>
            <p className="text-sm">Get started by adding your first domain.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Domain
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
                      onClick={() => handleSort('domain')}
                    >
                      Domain
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      Name
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Integration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Health
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statistics
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
                  {domains.map((domain) => (
                    <tr key={domain._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiGlobe className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{domain.domain}</div>
                            {domain.description && (
                              <div className="text-sm text-gray-500">{domain.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{domain.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(domain.status)}`}>
                          {getStatusIcon(domain.status)}
                          {domain.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">{domain.integrationMethod}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full mr-2 ${getHealthColor(domain.health)}`}></div>
                          <span className={`text-sm ${getHealthColor(domain.health)}`}>
                            {domain.health?.status || 'unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{domain.statistics?.totalDetections || 0} detections</div>
                          <div className="text-gray-500">{domain.statistics?.totalApiCalls || 0} API calls</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(domain.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedDomain(domain);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Edit domain"
                          >
                            <FiEdit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDomain(domain);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete domain"
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

      {/* Create Domain Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Domain</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain URL</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter display name"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Integration Method</label>
                <select
                  value={formData.integrationMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, integrationMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="extension">Browser Extension</option>
                  <option value="api">API Integration</option>
                  <option value="widget">Widget Embed</option>
                  <option value="iframe">iFrame Embed</option>
                </select>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Detection Settings</h4>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.enableProfanityDetection}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, enableProfanityDetection: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Profanity Detection</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.settings.enableSentimentAnalysis}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      settings: { ...prev.settings, enableSentimentAnalysis: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Enable Sentiment Analysis</span>
                </label>


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
                onClick={handleCreateDomain}
                disabled={!formData.domain || !formData.name || actionLoading === 'create'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === 'create' && <FiRefreshCw className="h-4 w-4 animate-spin" />}
                Add Domain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Domain Modal */}
      {showDeleteModal && selectedDomain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Domain</h3>

            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the domain "{selectedDomain.name}"? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDomain(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDomain}
                disabled={actionLoading === 'delete'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === 'delete' && <FiRefreshCw className="h-4 w-4 animate-spin" />}
                Delete Domain
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
