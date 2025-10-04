import React, { useState, useEffect } from 'react';
import { FiPieChart, FiList, FiFilter, FiTrendingDown, FiTrendingUp, FiRefreshCw, FiCalendar, FiTarget, FiBarChart } from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function OffensiveWordFrequency() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [analytics, setAnalytics] = useState(null);

  // Mock data for demonstration
  const mockWordData = [
    { word: 'gago', count: 45, language: 'Filipino', severity: 'high', trend: 'up', change: 12 },
    { word: 'tanga', count: 38, language: 'Filipino', severity: 'medium', trend: 'down', change: -5 },
    { word: 'stupid', count: 32, language: 'English', severity: 'medium', trend: 'up', change: 8 },
    { word: 'bobo', count: 28, language: 'Filipino', severity: 'medium', trend: 'neutral', change: 0 },
    { word: 'idiot', count: 24, language: 'English', severity: 'medium', trend: 'down', change: -3 },
    { word: 'putang', count: 22, language: 'Filipino', severity: 'high', trend: 'up', change: 15 },
    { word: 'damn', count: 18, language: 'English', severity: 'low', trend: 'neutral', change: 1 },
    { word: 'ulol', count: 16, language: 'Filipino', severity: 'medium', trend: 'down', change: -7 },
    { word: 'hate', count: 14, language: 'English', severity: 'medium', trend: 'up', change: 4 },
    { word: 'bwisit', count: 12, language: 'Filipino', severity: 'low', trend: 'neutral', change: -1 }
  ];

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, languageFilter]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch real data from API
      const response = await adminApiService.getWordFrequency({
        timeRange,
        language: languageFilter
      });

      if (response.success) {
        setData(response.data.data);
        setAnalytics(response.data.analytics);
      } else {
        console.error('Failed to load word frequency data:', response.message);
        // Fallback to mock data
        let filteredData = mockWordData;
        if (languageFilter !== 'all') {
          filteredData = mockWordData.filter(item => item.language === languageFilter);
        }

        setData(filteredData);

        // Calculate analytics from mock data
        const totalDetections = filteredData.reduce((sum, item) => sum + item.count, 0);
        const highSeverityCount = filteredData.filter(item => item.severity === 'high').length;
        const trendingUp = filteredData.filter(item => item.trend === 'up').length;
        const avgChange = filteredData.reduce((sum, item) => sum + item.change, 0) / filteredData.length;

        setAnalytics({
          totalDetections,
          uniqueWords: filteredData.length,
          highSeverityCount,
          trendingUp,
          avgChange: Math.round(avgChange)
        });
      }

    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
      // Fallback to mock data
      let filteredData = mockWordData;
      if (languageFilter !== 'all') {
        filteredData = mockWordData.filter(item => item.language === languageFilter);
      }

      setData(filteredData);

      const totalDetections = filteredData.reduce((sum, item) => sum + item.count, 0);
      const highSeverityCount = filteredData.filter(item => item.severity === 'high').length;
      const trendingUp = filteredData.filter(item => item.trend === 'up').length;
      const avgChange = filteredData.reduce((sum, item) => sum + item.change, 0) / filteredData.length;

      setAnalytics({
        totalDetections,
        uniqueWords: filteredData.length,
        highSeverityCount,
        trendingUp,
        avgChange: Math.round(avgChange)
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend, change) => {
    if (trend === 'up') return <FiTrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <FiTrendingDown className="h-4 w-4 text-red-600" />;
    return <span className="h-4 w-4 text-gray-400">—</span>;
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="rounded-md border border-gray-200 p-2">
                <FiPieChart className="h-5 w-5 text-[#015763]" />
              </div>
              Offensive Word Frequency
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Track frequency and patterns of detected offensive words and phrases
            </p>
          </div>
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
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
      ) : analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Detections</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalDetections}</p>
                <p className="text-sm text-gray-600">This {timeRange}</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiTarget className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Words</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.uniqueWords}</p>
                <p className="text-sm text-gray-600">Different terms</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiList className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Severity</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.highSeverityCount}</p>
                <p className="text-sm text-gray-600">Critical terms</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiBarChart className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trending Up</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.trendingUp}</p>
                <p className="text-sm text-green-600">+{analytics.avgChange}% avg change</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiTrendingUp className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters & Options</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">Last 3 Months</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors"
            >
              <option value="all">All Languages</option>
              <option value="English">English</option>
              <option value="Filipino">Filipino</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadAnalytics}
              className="w-full px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#015763]/90 transition-colors text-sm font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Word Frequency Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Word Frequency Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">Most frequently detected offensive words and their trends</p>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-200 bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Word</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Trend</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Change</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">"{item.word}"</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-semibold text-gray-900">{item.count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#015763]/10 text-[#015763] text-xs font-medium">
                        {item.language}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(item.severity)}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(item.trend, item.change)}
                        <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                          {item.trend}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
