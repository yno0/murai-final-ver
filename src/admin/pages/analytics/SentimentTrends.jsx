import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiBarChart, FiCalendar, FiDownload, FiRefreshCw, FiSmile, FiFrown, FiMeh, FiTarget } from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function SentimentTrends() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState(null);

  // Mock sentiment data
  const mockSentimentData = [
    { date: '2024-01-01', negative: 45, neutral: 32, positive: 23, total: 100 },
    { date: '2024-01-02', negative: 52, neutral: 28, positive: 20, total: 100 },
    { date: '2024-01-03', negative: 38, neutral: 35, positive: 27, total: 100 },
    { date: '2024-01-04', negative: 41, neutral: 31, positive: 28, total: 100 },
    { date: '2024-01-05', negative: 47, neutral: 29, positive: 24, total: 100 },
    { date: '2024-01-06', negative: 35, neutral: 38, positive: 27, total: 100 },
    { date: '2024-01-07', negative: 43, neutral: 33, positive: 24, total: 100 }
  ];

  useEffect(() => {
    loadSentimentData();
  }, [timeRange]);

  const loadSentimentData = async () => {
    try {
      setLoading(true);

      // Fetch real data from API
      const response = await adminApiService.getSentimentTrends({ timeRange });

      if (response.success) {
        setData(response.data.data);
        setAnalytics(response.data.analytics);
      } else {
        console.error('Failed to load sentiment data:', response.message);
        // Fallback to mock data
        setData(mockSentimentData);

        // Calculate analytics from mock data
        const totalEntries = mockSentimentData.reduce((sum, day) => sum + day.total, 0);
        const avgNegative = Math.round(mockSentimentData.reduce((sum, day) => sum + day.negative, 0) / mockSentimentData.length);
        const avgNeutral = Math.round(mockSentimentData.reduce((sum, day) => sum + day.neutral, 0) / mockSentimentData.length);
        const avgPositive = Math.round(mockSentimentData.reduce((sum, day) => sum + day.positive, 0) / mockSentimentData.length);

        setAnalytics({
          totalEntries,
          avgNegative,
          avgNeutral,
          avgPositive,
          negativeChange: 0,
          trend: 'neutral'
        });
      }

    } catch (err) {
      console.error('Sentiment data error:', err);
      // Fallback to mock data
      setData(mockSentimentData);

      const totalEntries = mockSentimentData.reduce((sum, day) => sum + day.total, 0);
      const avgNegative = Math.round(mockSentimentData.reduce((sum, day) => sum + day.negative, 0) / mockSentimentData.length);
      const avgNeutral = Math.round(mockSentimentData.reduce((sum, day) => sum + day.neutral, 0) / mockSentimentData.length);
      const avgPositive = Math.round(mockSentimentData.reduce((sum, day) => sum + day.positive, 0) / mockSentimentData.length);

      setAnalytics({
        totalEntries,
        avgNegative,
        avgNeutral,
        avgPositive,
        negativeChange: 0,
        trend: 'neutral'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      case 'positive': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-red-600'; // Up is bad for negative sentiment
    if (trend === 'down') return 'text-green-600'; // Down is good for negative sentiment
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
                <FiTrendingUp className="h-5 w-5 text-[#015763]" />
              </div>
              Sentiment Trends
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Analyze sentiment patterns and trends across detected content
            </p>
          </div>
          <button
            onClick={loadSentimentData}
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
                <p className="text-sm font-medium text-gray-600">Avg Negative</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgNegative}%</p>
                <p className={`text-sm ${getTrendColor(analytics.trend)}`}>
                  {analytics.negativeChange > 0 ? '+' : ''}{analytics.negativeChange}% change
                </p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiFrown className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Neutral</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgNeutral}%</p>
                <p className="text-sm text-gray-600">Balanced sentiment</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiMeh className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Positive</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgPositive}%</p>
                <p className="text-sm text-green-600">Good sentiment</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiSmile className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalEntries}</p>
                <p className="text-sm text-gray-600">This {timeRange}</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiTarget className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Range Filter */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Time Range</h2>
          <button
            onClick={() => {/* Export functionality */}}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <FiDownload className="h-4 w-4" />
            Export
          </button>
        </div>
        <div className="flex gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#015763]/20 focus:border-[#015763] transition-colors"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Sentiment Trends Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daily Sentiment Breakdown</h2>
          <p className="text-sm text-gray-600 mt-1">Sentiment distribution across time periods</p>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-200 bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Negative</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Neutral</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Positive</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Distribution</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-700 text-sm font-medium">
                        {item.negative}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-gray-700 text-sm font-medium">
                        {item.neutral}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-sm font-medium">
                        {item.positive}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-semibold text-gray-900">{item.total}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="flex h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-red-300"
                              style={{ width: `${item.negative}%` }}
                            ></div>
                            <div
                              className="bg-gray-300"
                              style={{ width: `${item.neutral}%` }}
                            ></div>
                            <div
                              className="bg-green-300"
                              style={{ width: `${item.positive}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
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
