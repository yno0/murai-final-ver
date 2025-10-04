import React, { useEffect, useState } from 'react';
import { FiFlag, FiSearch, FiFilter, FiClock, FiAlertTriangle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function FlaggedContentLogs() {
  console.log('🔍 Frontend: FlaggedContentLogs component mounted');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);



  useEffect(() => {
    console.log('🔍 Frontend: useEffect triggered, calling loadFlagged');
    const loadFlagged = async () => {
      try {
        setIsLoading(true);
        setError('');

        console.log('🔍 Frontend: Making API call with params:', {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          severity: severityFilter !== 'all' ? severityFilter : undefined,
          language: languageFilter !== 'all' ? languageFilter : undefined
        });

        // Build params object, only including defined values
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        };

        // Only add filter params if they have valid values
        if (statusFilter && statusFilter !== 'all') {
          params.status = statusFilter;
        }
        if (severityFilter && severityFilter !== 'all') {
          params.severity = severityFilter;
        }
        if (languageFilter && languageFilter !== 'all') {
          params.language = languageFilter;
        }

        const response = await adminApiService.getFlaggedContent(params);

        console.log('🔍 Frontend: API response:', response);
        console.log('🔍 Frontend: Response structure:', {
          hasData: !!response?.data,
          hasContent: !!response?.data?.content,
          contentLength: response?.data?.content?.length,
          hasPagination: !!response?.data?.pagination,
          total: response?.data?.pagination?.total
        });

        const content = response?.data?.content || response?.content || response?.data || [];
        console.log('🔍 Frontend: Extracted content:', content);
        console.log('🔍 Frontend: Content length:', content.length);

        setRows(content);
        setTotalItems(response?.data?.pagination?.total || response?.pagination?.total || content.length);

        console.log('🔍 Frontend: State updated - rows:', content.length, 'total:', response?.data?.pagination?.total || response?.pagination?.total || content.length);

      } catch (e) {
        console.error('🔍 Frontend: Failed to load flagged content', e);
        console.error('🔍 Frontend: Error details:', {
          message: e.message,
          stack: e.stack,
          name: e.name
        });
        setError(e.message || 'Failed to load flagged content');
        setRows([]);
        setTotalItems(0);
      } finally {
        console.log('🔍 Frontend: Loading finished, isLoading set to false');
        setIsLoading(false);
      }
    };
    loadFlagged();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, severityFilter, languageFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-green-100 text-green-800';
      case 'ignored': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
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

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Debug logging for render
  console.log('🔍 Frontend: Render state:', {
    isLoading,
    rowsLength: rows.length,
    totalItems,
    error,
    currentPage,
    itemsPerPage,
    statusFilter,
    severityFilter,
    languageFilter,
    searchTerm
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'status') setStatusFilter(value);
    if (filterType === 'severity') setSeverityFilter(value);
    if (filterType === 'language') setLanguageFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="rounded-md border border-gray-200 p-2">
                <FiFlag className="h-5 w-5 text-[#015763]" />
              </div>
              Flagged Content
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View all flagged content detected across connected websites
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {totalItems} total entries
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Showing {startItem}-{endItem} of {totalItems}
            </p>
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
              placeholder="Search content, website, or detected word..."
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
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="flagged">Flagged</option>
              <option value="reviewed">Reviewed</option>
              <option value="ignored">Ignored</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="extreme">Extreme</option>
            </select>

            <select
              value={languageFilter}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors"
            >
              <option value="all">All Languages</option>
              <option value="English">English</option>
              <option value="Filipino">Filipino</option>
              <option value="Mixed">Mixed</option>
            </select>

            {(searchTerm || statusFilter !== 'all' || severityFilter !== 'all' || languageFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSeverityFilter('all');
                  setLanguageFilter('all');
                  setCurrentPage(1);
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-red-700 font-medium">Error loading flagged content</span>
          </div>
          <p className="text-red-600 mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Content Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Flagged Content</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={4}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#015763]"></div>
                      Loading flagged content...
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={4}>
                    <div className="flex flex-col items-center gap-2">
                      <FiFlag className="h-8 w-8 text-gray-300" />
                      <span>No flagged content found</span>
                      <span className="text-xs text-gray-400">Content will appear here when detected by the system</span>
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
                              {item.context || item.content || item.detectedTerm || 'Content not available'}
                            </p>
                            {item.detectedWord && (
                              <span className="inline-flex items-center px-2 py-1 mt-2 rounded-md bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                                "{item.detectedWord}"
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {item.website || item.sourceUrl || item.site?.url || 'Unknown source'}
                      </div>
                      {item.language && (
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {item.language}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(item.severity)}`}>
                        {item.severity || 'Medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.timestamp || item.detectedAt || item.createdAt ?
                        new Date(item.timestamp || item.detectedAt || item.createdAt).toLocaleDateString() :
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
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#015763] text-white'
                            : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <FiChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              <p className="text-sm text-gray-600">Total Flagged</p>
            </div>
            <div className="rounded-md border border-gray-200 p-2">
              <FiFlag className="h-6 w-6 text-[#015763]" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{rows.filter(r => String(r.severity).toLowerCase() === 'high').length}</p>
              <p className="text-sm text-gray-600">High Severity</p>
            </div>
            <div className="rounded-md border border-gray-200 p-2">
              <FiAlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{new Set(rows.map(r => r.website || r.sourceUrl || r.site?.url)).size}</p>
              <p className="text-sm text-gray-600">Unique Sources</p>
            </div>
            <div className="rounded-md border border-gray-200 p-2">
              <FiClock className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
