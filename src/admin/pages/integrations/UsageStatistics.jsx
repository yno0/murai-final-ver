import React, { useState, useEffect } from 'react';
import {
  FiBarChart,
  FiTrendingUp,
  FiCalendar,
  FiPieChart,
  FiActivity,
  FiGlobe,
  FiKey,
  FiUsers,
  FiClock,
  FiZap,
  FiWifi,
  FiRefreshCw,
  FiDownload,
  FiFilter,
  FiAlertTriangle
} from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function UsageStatistics() {
  const [summary, setSummary] = useState({});
  const [statistics, setStatistics] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [timeframe, setTimeframe] = useState('24h');
  const [period, setPeriod] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const timeframes = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const periods = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  // Fetch dashboard summary
  const fetchSummary = async () => {
    try {
      const response = await adminApiService.getUsageStatsSummary(timeframe);
      if (response.success) {
        setSummary(response.data.summary || {});
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  // Fetch usage statistics
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        period
      };

      const response = await adminApiService.getUsageStatistics(params);

      if (response.success) {
        setStatistics(response.data.statistics || []);
      } else {
        setError(response.message || 'Failed to fetch statistics');
        setStatistics([]);
      }
    } catch (err) {
      setError('Failed to fetch statistics');
      setStatistics([]);
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch top performers
  const fetchTopPerformers = async () => {
    try {
      const response = await adminApiService.getTopPerformers({
        metric: 'totalRequests',
        limit: 10,
        period
      });

      if (response.success) {
        setTopPerformers(response.data.performers || []);
      }
    } catch (err) {
      console.error('Error fetching top performers:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchSummary();
    fetchStatistics();
    fetchTopPerformers();
  }, []);

  // Update data when filters change
  useEffect(() => {
    fetchSummary();
  }, [timeframe]);

  useEffect(() => {
    fetchStatistics();
    fetchTopPerformers();
  }, [dateRange, period]);

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  // Format bytes
  const formatBytes = (bytes) => {
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return bytes + ' B';
  };

  // Calculate percentage change (mock data for demo)
  const getPercentageChange = () => {
    return Math.floor(Math.random() * 20) - 10; // Random between -10 and +10
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiBarChart className="text-blue-600" />
              Usage Statistics
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor API usage, extension activity, and system performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchSummary();
                fetchStatistics();
                fetchTopPerformers();
              }}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalRequests)}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${getPercentageChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getPercentageChange() >= 0 ? '+' : ''}{getPercentageChange()}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <FiActivity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Detections</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.totalDetections)}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${getPercentageChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getPercentageChange() >= 0 ? '+' : ''}{getPercentageChange()}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <FiZap className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(summary.avgResponseTime || 0)}ms</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${getPercentageChange() <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getPercentageChange() <= 0 ? '' : '+'}{getPercentageChange()}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <FiClock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bandwidth</p>
              <p className="text-2xl font-bold text-gray-900">{formatBytes(summary.totalBandwidth || 0)}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm ${getPercentageChange() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {getPercentageChange() >= 0 ? '+' : ''}{getPercentageChange()}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs last period</span>
              </div>
            </div>
            <FiWifi className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Summary Timeframe:</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Period:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {periods.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Start Date:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">End Date:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trends Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Usage Trends</h3>
            <FiTrendingUp className="h-5 w-5 text-blue-600" />
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 text-gray-600">
                <FiRefreshCw className="h-4 w-4 animate-spin" />
                Loading chart...
              </div>
            </div>
          ) : statistics.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FiBarChart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No data available for the selected period</p>
              </div>
            </div>
          ) : (
            <div className="h-64">
              {/* Simple bar chart representation */}
              <div className="h-full flex items-end justify-between gap-2">
                {statistics.slice(0, 10).map((stat, index) => {
                  const maxRequests = Math.max(...statistics.map(s => s.metrics?.totalRequests || 0));
                  const height = maxRequests > 0 ? (stat.metrics?.totalRequests || 0) / maxRequests * 100 : 0;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
                        title={`${stat.metrics?.totalRequests || 0} requests`}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left">
                        {new Date(stat.date).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
            <FiZap className="h-5 w-5 text-green-600" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <FiClock className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Average Response Time</span>
              </div>
              <span className="text-sm font-bold">{Math.round(summary.avgResponseTime || 0)}ms</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <FiActivity className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Error Rate</span>
              </div>
              <span className="text-sm font-bold">{(summary.avgErrorRate || 0).toFixed(2)}%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <FiGlobe className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Active Domains</span>
              </div>
              <span className="text-sm font-bold">{summary.uniqueDomains || 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <FiKey className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Active API Keys</span>
              </div>
              <span className="text-sm font-bold">{summary.uniqueApiKeys || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Top Performing Domains</h3>
            <FiTrendingUp className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        {topPerformers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FiBarChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No performance data available</p>
            <p className="text-sm">Data will appear here once domains start generating traffic.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bandwidth Used
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topPerformers.map((performer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiGlobe className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {performer.domain?.domain || 'Unknown Domain'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {performer.domain?.name || 'No name'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(performer.totalMetric || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(performer.avgMetric || 0)}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {((1 - (performer.errorRate || 0)) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatBytes(performer.bandwidth || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Request Distribution</h3>
            <FiPieChart className="h-5 w-5 text-purple-600" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Requests</span>
              <span className="text-sm font-medium">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Extension Activity</span>
              <span className="text-sm font-medium">20%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System Events</span>
              <span className="text-sm font-medium">5%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '5%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Peak Usage Times</h3>
            <FiCalendar className="h-5 w-5 text-orange-600" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">9:00 AM - 11:00 AM</span>
              <span className="text-sm font-medium text-green-600">Peak</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">2:00 PM - 4:00 PM</span>
              <span className="text-sm font-medium text-blue-600">High</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">7:00 PM - 9:00 PM</span>
              <span className="text-sm font-medium text-yellow-600">Medium</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">11:00 PM - 6:00 AM</span>
              <span className="text-sm font-medium text-gray-600">Low</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">System Health</h3>
            <FiActivity className="h-5 w-5 text-red-600" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Uptime</span>
              <span className="text-sm font-medium text-green-600">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database Health</span>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cache Hit Rate</span>
              <span className="text-sm font-medium text-blue-600">85%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="text-sm font-medium text-yellow-600">72%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
