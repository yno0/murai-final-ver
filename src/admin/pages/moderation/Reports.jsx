import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiSearch, FiFilter, FiDownload, FiEye, FiCheck, FiX, FiAlertTriangle, FiClock, FiFlag } from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadReports();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, typeFilter]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await adminApiService.getReports({ 
        page: currentPage, 
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      });
      
      const content = response?.data?.content || response?.content || response?.data || [];
      setRows(content);
      setTotalItems(response?.data?.pagination?.total || response?.pagination?.total || content.length);
      
    } catch (e) {
      console.error('Failed to load reports', e);
      setError(e.message || 'Failed to load reports');
      setRows([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else if (filterType === 'type') {
      setTypeFilter(value);
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const response = await adminApiService.exportReports({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      });
      
      // Create download link
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'missed_detection':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'false_positive':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'user_report':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'reviewing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'resolved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'dismissed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="rounded-md border border-gray-200 p-2">
                <FiMessageSquare className="h-5 w-5 text-[#015763]" />
              </div>
              Content Reports
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage reported content for model retraining and improvement
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {totalItems} total reports
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Showing {startItem}-{endItem} of {totalItems}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              <p className="text-sm text-gray-600">Total Reports</p>
            </div>
            <div className="rounded-md border border-gray-200 p-2">
              <FiMessageSquare className="h-6 w-6 text-[#015763]" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{rows.filter(r => r.type === 'missed_detection').length}</p>
              <p className="text-sm text-gray-600">Missed Detections</p>
            </div>
            <div className="rounded-md border border-gray-200 p-2">
              <FiAlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{rows.filter(r => r.type === 'false_positive').length}</p>
              <p className="text-sm text-gray-600">False Positives</p>
            </div>
            <div className="rounded-md border border-gray-200 p-2">
              <FiFlag className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{rows.filter(r => r.status === 'open').length}</p>
              <p className="text-sm text-gray-600">Open Reports</p>
            </div>
            <div className="rounded-md border border-gray-200 p-2">
              <FiClock className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search reports, content, or source..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select 
              value={statusFilter} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            
            <select 
              value={typeFilter} 
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors text-sm"
            >
              <option value="all">All Types</option>
              <option value="missed_detection">Missed Detection</option>
              <option value="false_positive">False Positive</option>
              <option value="user_report">User Report</option>
            </select>
            
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear filters
              </button>
            )}

            <div className="ml-auto">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm"
              >
                <FiDownload className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Report Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={4}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#015763]"></div>
                      Loading reports...
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={4}>
                    <div className="flex flex-col items-center gap-2">
                      <FiMessageSquare className="h-8 w-8 text-gray-300" />
                      <span>No reports found</span>
                      <span className="text-xs text-gray-400">Reports will appear here when users submit feedback</span>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((item, index) => (
                  <tr key={item.id || item._id || index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 font-medium line-clamp-2">
                              {item.content || item.reportedText || item.description || 'Report content not available'}
                            </p>
                            {item.sourceUrl && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                Source: {item.sourceUrl}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(item.type || item.reportType)}`}>
                        {item.type === 'missed_detection' ? 'Missed Detection' :
                         item.type === 'false_positive' ? 'False Positive' :
                         item.type === 'user_report' ? 'User Report' :
                         item.type || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(item.status)}`}>
                        {item.status || 'Open'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.timestamp || item.createdAt ?
                        new Date(item.timestamp || item.createdAt).toLocaleDateString() :
                        'Unknown'
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startItem} to {endItem} of {totalItems} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                        currentPage === page
                          ? 'bg-[#015763] text-white border-[#015763]'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
