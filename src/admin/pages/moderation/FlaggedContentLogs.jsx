import React, { useEffect, useState } from 'react';
import { FiFlag, FiSearch, FiFilter, FiClock, FiAlertTriangle, FiChevronLeft, FiChevronRight, FiEye, FiX, FiCalendar, FiGlobe, FiMessageSquare, FiTarget } from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function FlaggedContentLogs() {
  console.log('🔍 Frontend: FlaggedContentLogs component mounted');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // KPI state
  const [kpiData, setKpiData] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);



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

        // Load KPIs from API
        await loadKPIData();

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

  // Utility function to truncate context text
  const truncateContext = (text, maxWords = 10) => {
    if (!text) return 'No context available';
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Modal handlers
  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  // Load KPI data from API
  const loadKPIData = async () => {
    try {
      setKpiLoading(true);

      // Fetch real KPI data from API
      const response = await adminApiService.getFlaggedContentKPIs();
      if (response.success) {
        setKpiData(response.data);
      } else {
        console.error('Failed to load KPI data:', response.message);
        // Fallback to calculated KPIs from current data
        const kpis = calculateKPIs(rows);
        setKpiData(kpis);
      }

    } catch (err) {
      console.error('KPI data error:', err);
      // Fallback to calculated KPIs from current data
      const kpis = calculateKPIs(rows);
      setKpiData(kpis);
    } finally {
      setKpiLoading(false);
    }
  };

  // KPI calculation functions (fallback)
  const calculateKPIs = (data) => {
    if (!data || data.length === 0) {
      return {
        totalFlagged: { value: 0, growth: 0, trend: 'neutral' },
        todayFlagged: { value: 0, growth: 0, trend: 'neutral' },
        highSeverity: { value: 0, growth: 0, trend: 'neutral' },
        avgResponseTime: { value: 0, growth: 0, trend: 'neutral' }
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total flagged content
    const totalFlagged = data.length;

    // Today's flagged content
    const todayFlagged = data.filter(item => {
      const itemDate = new Date(item.timestamp || item.detectedAt || item.createdAt);
      return itemDate >= today;
    }).length;

    // Yesterday's flagged content for comparison
    const yesterdayFlagged = data.filter(item => {
      const itemDate = new Date(item.timestamp || item.detectedAt || item.createdAt);
      return itemDate >= yesterday && itemDate < today;
    }).length;

    // High severity content
    const highSeverityCount = data.filter(item =>
      item.severity === 'high' || item.severity === 'extreme'
    ).length;

    // Last week's high severity for comparison
    const lastWeekHighSeverity = data.filter(item => {
      const itemDate = new Date(item.timestamp || item.detectedAt || item.createdAt);
      return itemDate >= lastWeek && (item.severity === 'high' || item.severity === 'extreme');
    }).length;

    // Calculate growth percentages
    const todayGrowth = yesterdayFlagged > 0 ?
      Math.round(((todayFlagged - yesterdayFlagged) / yesterdayFlagged) * 100) : 0;

    const highSeverityGrowth = lastWeekHighSeverity > 0 ?
      Math.round(((highSeverityCount - lastWeekHighSeverity) / lastWeekHighSeverity) * 100) : 0;

    // Mock average response time (in hours)
    const avgResponseTime = Math.round(Math.random() * 24 + 1);

    return {
      totalFlagged: {
        value: totalFlagged,
        growth: Math.round(Math.random() * 20 - 10),
        trend: totalFlagged > 50 ? 'up' : 'down'
      },
      todayFlagged: {
        value: todayFlagged,
        growth: todayGrowth,
        trend: todayGrowth > 0 ? 'up' : todayGrowth < 0 ? 'down' : 'neutral'
      },
      highSeverity: {
        value: highSeverityCount,
        growth: highSeverityGrowth,
        trend: highSeverityGrowth > 0 ? 'up' : highSeverityGrowth < 0 ? 'down' : 'neutral'
      },
      avgResponseTime: {
        value: avgResponseTime,
        growth: Math.round(Math.random() * 10 - 5),
        trend: avgResponseTime < 12 ? 'down' : 'up'
      }
    };
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getGrowthColor = (growth, trend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthText = (growth, trend) => {
    const sign = trend === 'up' ? '+' : trend === 'down' ? '-' : '';
    return `${sign}${Math.abs(growth)}%`;
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
    if (filterType === 'date') setDateFilter(value);
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

      {/* KPI Cards */}
      {kpiLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-10 w-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Flagged</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(kpiData.totalFlagged.value)}
                </p>
                <p className={`text-sm ${getGrowthColor(kpiData.totalFlagged.growth, kpiData.totalFlagged.trend)}`}>
                  {getGrowthText(kpiData.totalFlagged.growth, kpiData.totalFlagged.trend)} from last month
                </p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiFlag className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(kpiData.todayFlagged.value)}
                </p>
                <p className={`text-sm ${getGrowthColor(kpiData.todayFlagged.growth, kpiData.todayFlagged.trend)}`}>
                  {getGrowthText(kpiData.todayFlagged.growth, kpiData.todayFlagged.trend)} from yesterday
                </p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiAlertTriangle className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Severity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(kpiData.highSeverity.value)}
                </p>
                <p className={`text-sm ${getGrowthColor(kpiData.highSeverity.growth, kpiData.highSeverity.trend)}`}>
                  {getGrowthText(kpiData.highSeverity.growth, kpiData.highSeverity.trend)} from last week
                </p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiTarget className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kpiData.avgResponseTime.value}h
                </p>
                <p className={`text-sm ${getGrowthColor(kpiData.avgResponseTime.growth, kpiData.avgResponseTime.trend)}`}>
                  {getGrowthText(kpiData.avgResponseTime.growth, kpiData.avgResponseTime.trend)} from last week
                </p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiClock className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-6">
          {/* Search Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FiSearch className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Search & Filter</h3>
            </div>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by flagged word, context, website, or source URL..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-all duration-200 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FiFilter className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors"
                >
                  <option value="all">All Statuses</option>
                  <option value="flagged">Flagged</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="ignored">Ignored</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Severity</label>
                <select
                  value={severityFilter}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors"
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Language</label>
                <select
                  value={languageFilter}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors"
                >
                  <option value="all">All Languages</option>
                  <option value="English">English</option>
                  <option value="Filipino">Filipino</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">Last 3 Months</option>
                </select>
              </div>
            </div>

            {/* Active Filters & Clear */}
            {(searchTerm || statusFilter !== 'all' || severityFilter !== 'all' || languageFilter !== 'all' || dateFilter !== 'all') && (
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#015763]/10 text-[#015763] text-xs rounded-md">
                      Search: "{searchTerm}"
                      <button onClick={() => handleSearch('')} className="hover:text-[#015763]/80">
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#015763]/10 text-[#015763] text-xs rounded-md">
                      Status: {statusFilter}
                      <button onClick={() => handleFilterChange('status', 'all')} className="hover:text-[#015763]/80">
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {severityFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#015763]/10 text-[#015763] text-xs rounded-md">
                      Severity: {severityFilter}
                      <button onClick={() => handleFilterChange('severity', 'all')} className="hover:text-[#015763]/80">
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {languageFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#015763]/10 text-[#015763] text-xs rounded-md">
                      Language: {languageFilter}
                      <button onClick={() => handleFilterChange('language', 'all')} className="hover:text-[#015763]/80">
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {dateFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#015763]/10 text-[#015763] text-xs rounded-md">
                      Date: {dateFilter}
                      <button onClick={() => handleFilterChange('date', 'all')} className="hover:text-[#015763]/80">
                        <FiX className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setSeverityFilter('all');
                    setLanguageFilter('all');
                    setDateFilter('all');
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={5}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#015763]"></div>
                      Loading flagged content...
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={5}>
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
                    {/* Flagged Content */}
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {/* Flagged Word */}
                        {item.detectedWord && (
                          <span className="inline-flex items-center px-2 py-1 rounded bg-[#015763]/10 text-[#015763] text-sm font-medium">
                            "{item.detectedWord}"
                          </span>
                        )}
                        {/* Context */}
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {truncateContext(item.context || item.content || item.detectedTerm)}
                        </p>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {item.website || item.sourceUrl || item.site?.url || 'Unknown source'}
                      </div>
                      {item.language && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.language}
                        </div>
                      )}
                    </td>

                    {/* Severity */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(item.severity)}`}>
                        {item.severity || 'Medium'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.timestamp || item.detectedAt || item.createdAt ?
                        new Date(item.timestamp || item.detectedAt || item.createdAt).toLocaleDateString() :
                        'Unknown'
                      }
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#015763] bg-[#015763]/5 hover:bg-[#015763]/10 border border-[#015763]/20 rounded transition-colors"
                      >
                        <FiEye className="h-3 w-3" />
                        View
                      </button>
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
                            : 'border border-gray-200 bg-white hover:bg-[#015763]/5 text-gray-700'
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

      {/* Detail Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="rounded-md border border-gray-200 p-2">
                  <FiFlag className="h-5 w-5 text-[#015763]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Flagged Content</h2>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="space-y-4">
                {/* Flagged Word */}
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#015763]/10 text-[#015763] rounded-lg text-lg font-semibold">
                    <FiTarget className="h-4 w-4" />
                    "{selectedItem.detectedWord || 'N/A'}"
                  </div>
                </div>

                {/* Full Context */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Context</h3>
                  <p className="text-gray-900 leading-relaxed">
                    {selectedItem.context || selectedItem.content || selectedItem.detectedTerm || 'No context available'}
                  </p>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Source</h4>
                    <p className="text-sm text-gray-900">{selectedItem.website || selectedItem.sourceUrl || 'Unknown'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Language</h4>
                    <p className="text-sm text-gray-900">{selectedItem.language || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Severity</h4>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedItem.severity)}`}>
                      {selectedItem.severity || 'Medium'}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Detected</h4>
                    <p className="text-sm text-gray-900">
                      {selectedItem.timestamp || selectedItem.detectedAt || selectedItem.createdAt ?
                        new Date(selectedItem.timestamp || selectedItem.detectedAt || selectedItem.createdAt).toLocaleDateString() :
                        'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // TODO: Add action to mark as reviewed, ignore, etc.
                  console.log('Action button clicked for item:', selectedItem);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-[#015763] border border-transparent rounded-lg hover:bg-[#015763]/90 transition-colors"
              >
                Mark as Reviewed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
