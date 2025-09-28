import React, { useEffect, useState } from 'react';
import { FiFlag, FiSearch, FiFilter, FiEye, FiCheck, FiX, FiClock, FiAlertTriangle } from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function FlaggedContentLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFlagged = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await adminApiService.getFlaggedContent({ page: 1, limit: 100 });
        const content = response?.data?.content || response?.content || [];
        setRows(content);
      } catch (e) {
        console.error('Failed to load flagged content', e);
        setError(e.message || 'Failed to load flagged content');
      } finally {
        setIsLoading(false);
      }
    };
    loadFlagged();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
      case 'high': return 'bg-red-100 text-red-800';
      case 'Medium':
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'Low':
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filtered = rows.filter((item) => {
    const matchesSearch = !searchTerm ||
      item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.website?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.detectedWord?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiFlag className="text-[#015763]" />
          Flagged Content Logs
        </h1>
        <p className="text-gray-600 mt-1">
          Review and manage all flagged content detected across connected websites
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search content, website, or word…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Content Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detected Word</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>Loading flagged content…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>No results.</td></tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">{item.content}</p>
                        <p className="text-xs text-gray-500">{item.context}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.website}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{item.detectedWord}</span>
                        <p className="text-xs text-gray-500">{item.language}</p>
                        {item.confidence != null && (
                          <p className="text-xs text-gray-500">Confidence: {(Number(item.confidence) * 100).toFixed(1)}%</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(item.severity)}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.timestamp || item.detectedAt || item.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1">
                          <FiEye /> View
                        </button>
                        <button className="px-2 py-1 text-xs rounded bg-green-50 text-green-700 hover:bg-green-100 flex items-center gap-1">
                          <FiCheck /> Resolve
                        </button>
                        <button className="px-2 py-1 text-xs rounded bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-1">
                          <FiX /> Dismiss
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

      {/* Summary Stats (placeholder values until backend supplies) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <FiClock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{rows.filter(r => r.status === 'pending').length}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <FiCheck className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{rows.filter(r => r.status === 'resolved').length}</p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <FiAlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{rows.filter(r => String(r.severity).toLowerCase() === 'high').length}</p>
              <p className="text-sm text-gray-600">High Severity</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center">
            <FiFlag className="h-8 w-8 text-[#015763] mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
              <p className="text-sm text-gray-600">Total Loaded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
