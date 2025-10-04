import React, { useState, useEffect, useRef } from 'react';
import {
  FiDatabase,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiInfo,
  FiAlertCircle,
  FiXCircle,
  FiActivity,
  FiGlobe,
  FiKey,
  FiSettings,
  FiClock,
  FiEye,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function IntegrationLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({});

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Real-time updates
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const intervalRef = useRef(null);

  // Expanded log details
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  const itemsPerPage = 50;

  // Log types and levels
  const logTypes = [
    { value: 'api_request', label: 'API Request', icon: FiActivity },
    { value: 'extension_activity', label: 'Extension Activity', icon: FiGlobe },
    { value: 'domain_health', label: 'Domain Health', icon: FiSettings },
    { value: 'key_usage', label: 'Key Usage', icon: FiKey },
    { value: 'error', label: 'Error', icon: FiXCircle },
    { value: 'warning', label: 'Warning', icon: FiAlertTriangle },
    { value: 'info', label: 'Info', icon: FiInfo }
  ];

  const logLevels = [
    { value: 'error', label: 'Error', color: 'text-red-600' },
    { value: 'warn', label: 'Warning', color: 'text-yellow-600' },
    { value: 'info', label: 'Info', color: 'text-blue-600' },
    { value: 'debug', label: 'Debug', color: 'text-gray-600' }
  ];

  const sourceTypes = [
    { value: 'api', label: 'API' },
    { value: 'extension', label: 'Extension' },
    { value: 'system', label: 'System' },
    { value: 'admin', label: 'Admin' }
  ];

  // Fetch logs
  const fetchLogs = async (page = currentPage) => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        limit: itemsPerPage
      };

      if (searchTerm) params.search = searchTerm;
      if (typeFilter) params.type = typeFilter;
      if (levelFilter) params.level = levelFilter;
      if (sourceTypeFilter) params.sourceType = sourceTypeFilter;
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await adminApiService.getIntegrationLogs(params);

      if (response.success) {
        setLogs(response.data.logs || []);
        setCurrentPage(response.data.pagination?.page || 1);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setError(response.message || 'Failed to fetch logs');
        setLogs([]);
      }
    } catch (err) {
      setError('Failed to fetch logs');
      setLogs([]);
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch log statistics
  const fetchStats = async () => {
    try {
      const response = await adminApiService.getIntegrationLogStats('24h');
      if (response.success) {
        setStats(response.data.stats || []);
      }
    } catch (err) {
      console.error('Error fetching log stats:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchLogs(1); // Always refresh from first page
      }, refreshInterval * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs(1);
  };

  // Handle filter change
  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchLogs(1);
  };

  // Toggle log expansion
  const toggleLogExpansion = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  // Get level icon and color
  const getLevelDisplay = (level) => {
    const levelConfig = logLevels.find(l => l.value === level);
    return levelConfig || { label: level, color: 'text-gray-600' };
  };

  // Get type icon
  const getTypeIcon = (type) => {
    const typeConfig = logTypes.find(t => t.value === type);
    return typeConfig?.icon || FiInfo;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Export logs
  const handleExportLogs = async () => {
    try {
      // This would typically generate and download a CSV/JSON file
      const params = {
        search: searchTerm,
        type: typeFilter,
        level: levelFilter,
        sourceType: sourceTypeFilter,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        limit: 10000 // Large limit for export
      };

      // For now, just show the data that would be exported
      console.log('Exporting logs with params:', params);
      alert('Export functionality would be implemented here');
    } catch (err) {
      console.error('Error exporting logs:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiDatabase className="text-blue-600" />
              Integration Logs
            </h1>
            <p className="text-gray-600 mt-1">
              View detailed logs of all system integrations and API calls
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportLogs}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FiDownload className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={() => fetchLogs()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
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

      {/* Auto-refresh Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Auto-refresh</span>
            </label>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value={10}>Every 10s</option>
                <option value={30}>Every 30s</option>
                <option value={60}>Every 1m</option>
                <option value={300}>Every 5m</option>
              </select>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiSearch className="h-4 w-4" />
              Search
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                handleFilterChange();
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {logTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                handleFilterChange();
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Levels</option>
              {logLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>

            <select
              value={sourceTypeFilter}
              onChange={(e) => {
                setSourceTypeFilter(e.target.value);
                handleFilterChange();
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sources</option>
              {sourceTypes.map(source => (
                <option key={source.value} value={source.value}>{source.label}</option>
              ))}
            </select>

            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => {
                setDateRange(prev => ({ ...prev, startDate: e.target.value }));
                handleFilterChange();
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Start date"
            />

            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => {
                setDateRange(prev => ({ ...prev, endDate: e.target.value }));
                handleFilterChange();
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="End date"
            />
          </div>

          {/* Reset button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('');
                setLevelFilter('');
                setSourceTypeFilter('');
                setDateRange({ startDate: '', endDate: '' });
                setCurrentPage(1);
                fetchLogs(1);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-600">
              <FiRefreshCw className="h-4 w-4 animate-spin" />
              Loading logs...
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiDatabase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No logs found</p>
            <p className="text-sm">Try adjusting your search criteria or date range.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => {
                    const TypeIcon = getTypeIcon(log.type);
                    const levelDisplay = getLevelDisplay(log.level);
                    const isExpanded = expandedLogs.has(log._id);

                    return (
                      <React.Fragment key={log._id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <FiClock className="h-4 w-4 text-gray-400" />
                              {formatTimestamp(log.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${levelDisplay.color}`}>
                              {levelDisplay.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <TypeIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{log.type}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{log.source?.type}</div>
                              {log.source?.identifier && (
                                <div className="text-gray-500 text-xs">{log.source.identifier}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate">{log.message}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.response?.statusCode && (
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  log.response.statusCode >= 400
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {log.response.statusCode}
                                </span>
                                {log.response.responseTime && (
                                  <span className="text-gray-500">{log.response.responseTime}ms</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => toggleLogExpansion(log._id)}
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="View details"
                            >
                              {isExpanded ? <FiChevronDown className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded details */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-4">
                                {/* Request details */}
                                {log.request && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                                    <div className="bg-white p-3 rounded border text-sm">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <span className="font-medium">Method:</span> {log.request.method}
                                        </div>
                                        <div>
                                          <span className="font-medium">Endpoint:</span> {log.request.endpoint}
                                        </div>
                                        <div>
                                          <span className="font-medium">IP:</span> {log.request.ip}
                                        </div>
                                        <div>
                                          <span className="font-medium">User Agent:</span>
                                          <div className="text-gray-600 text-xs mt-1 truncate">
                                            {log.request.userAgent}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Error details */}
                                {log.error && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Error Details</h4>
                                    <div className="bg-red-50 p-3 rounded border border-red-200 text-sm">
                                      <div><span className="font-medium">Name:</span> {log.error.name}</div>
                                      <div><span className="font-medium">Message:</span> {log.error.message}</div>
                                      {log.error.stack && (
                                        <div className="mt-2">
                                          <span className="font-medium">Stack:</span>
                                          <pre className="text-xs text-gray-600 mt-1 overflow-x-auto">
                                            {log.error.stack}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Additional details */}
                                {log.details && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
                                    <div className="bg-white p-3 rounded border text-sm">
                                      <pre className="text-gray-600 overflow-x-auto">
                                        {JSON.stringify(log.details, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
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
    </div>
  );
}
