import React, { useState, useEffect } from 'react';
import { FiGlobe, FiBarChart, FiTrendingUp, FiTrendingDown, FiRefreshCw, FiTarget, FiMessageSquare, FiUsers, FiPieChart } from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function LanguageAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState(null);

  // Mock language data
  const mockLanguageData = [
    { 
      language: 'Filipino', 
      flaggedCount: 234, 
      totalContent: 3450, 
      flaggedRate: 6.8, 
      trend: 'up', 
      change: 15,
      topWords: ['gago', 'tanga', 'bobo', 'putang', 'ulol'],
      severity: { high: 89, medium: 102, low: 43 }
    },
    { 
      language: 'English', 
      flaggedCount: 156, 
      totalContent: 4200, 
      flaggedRate: 3.7, 
      trend: 'down', 
      change: -8,
      topWords: ['stupid', 'hate', 'idiot', 'damn', 'hell'],
      severity: { high: 45, medium: 78, low: 33 }
    },
    { 
      language: 'Mixed (Taglish)', 
      flaggedCount: 89, 
      totalContent: 1890, 
      flaggedRate: 4.7, 
      trend: 'up', 
      change: 12,
      topWords: ['gago ka', 'stupid naman', 'tanga mo'],
      severity: { high: 32, medium: 41, low: 16 }
    },
    { 
      language: 'Bisaya', 
      flaggedCount: 67, 
      totalContent: 1200, 
      flaggedRate: 5.6, 
      trend: 'neutral', 
      change: 2,
      topWords: ['buang', 'yawa', 'animal'],
      severity: { high: 23, medium: 31, low: 13 }
    },
    { 
      language: 'Ilocano', 
      flaggedCount: 34, 
      totalContent: 680, 
      flaggedRate: 5.0, 
      trend: 'down', 
      change: -5,
      topWords: ['agkaykaysa', 'naimas', 'bassit'],
      severity: { high: 12, medium: 15, low: 7 }
    }
  ];

  useEffect(() => {
    loadLanguageAnalytics();
  }, [timeRange]);

  const loadLanguageAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch real data from API
      const response = await adminApiService.getLanguageAnalytics({ timeRange });

      if (response.success) {
        setData(response.data.data);
        setAnalytics(response.data.analytics);
      } else {
        console.error('Failed to load language analytics:', response.message);
        // Fallback to mock data
        setData(mockLanguageData);

        // Calculate analytics from mock data
        const totalFlagged = mockLanguageData.reduce((sum, lang) => sum + lang.flaggedCount, 0);
        const totalContent = mockLanguageData.reduce((sum, lang) => sum + lang.totalContent, 0);
        const avgFlaggedRate = (totalFlagged / totalContent * 100).toFixed(1);
        const activeLanguages = mockLanguageData.length;
        const dominantLanguage = mockLanguageData.reduce((prev, current) =>
          prev.flaggedCount > current.flaggedCount ? prev : current
        );

        setAnalytics({
          totalFlagged,
          totalContent,
          avgFlaggedRate,
          activeLanguages,
          dominantLanguage: dominantLanguage.language,
          dominantCount: dominantLanguage.flaggedCount
        });
      }

    } catch (err) {
      console.error('Language analytics error:', err);
      // Fallback to mock data
      setData(mockLanguageData);

      const totalFlagged = mockLanguageData.reduce((sum, lang) => sum + lang.flaggedCount, 0);
      const totalContent = mockLanguageData.reduce((sum, lang) => sum + lang.totalContent, 0);
      const avgFlaggedRate = (totalFlagged / totalContent * 100).toFixed(1);
      const activeLanguages = mockLanguageData.length;
      const dominantLanguage = mockLanguageData.reduce((prev, current) =>
        prev.flaggedCount > current.flaggedCount ? prev : current
      );

      setAnalytics({
        totalFlagged,
        totalContent,
        avgFlaggedRate,
        activeLanguages,
        dominantLanguage: dominantLanguage.language,
        dominantCount: dominantLanguage.flaggedCount
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <FiTrendingUp className="h-4 w-4 text-red-600" />;
    if (trend === 'down') return <FiTrendingDown className="h-4 w-4 text-green-600" />;
    return <span className="h-4 w-4 text-gray-400">—</span>;
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-red-600';
    if (trend === 'down') return 'text-green-600';
    return 'text-gray-600';
  };

  const getRiskLevel = (rate) => {
    if (rate > 6) return { label: 'High', color: 'bg-red-100 text-red-800' };
    if (rate > 4) return { label: 'Medium', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Low', color: 'bg-green-100 text-green-800' };
  };

  const getLanguageFlag = (language) => {
    const flags = {
      'Filipino': '🇵🇭',
      'English': '🇺🇸',
      'Mixed (Taglish)': '🇵🇭',
      'Bisaya': '🇵🇭',
      'Ilocano': '🇵🇭'
    };
    return flags[language] || '🌐';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <div className="rounded-md border border-gray-200 p-2">
                <FiGlobe className="h-5 w-5 text-[#015763]" />
              </div>
              Language Analytics
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Analyze content moderation patterns across different languages and dialects
            </p>
          </div>
          <button
            onClick={loadLanguageAnalytics}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Flagged</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalFlagged}</p>
                <p className="text-sm text-gray-600">All languages</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiTarget className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalContent.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Analyzed pieces</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiMessageSquare className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Flag Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgFlaggedRate}%</p>
                <p className="text-sm text-gray-600">Detection rate</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiBarChart className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Languages</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeLanguages}</p>
                <p className="text-sm text-gray-600">Detected</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiUsers className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dominant</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.dominantCount}</p>
                <p className="text-sm text-gray-600">{analytics.dominantLanguage}</p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiPieChart className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Range Filter */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Time Range</h2>
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

      {/* Language Analytics Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Language Performance</h2>
          <p className="text-sm text-gray-600 mt-1">Content moderation metrics by language and dialect</p>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Flagged</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Flag Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Trend</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Top Words</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((lang, index) => {
                  const risk = getRiskLevel(lang.flaggedRate);
                  return (
                    <tr key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getLanguageFlag(lang.language)}</span>
                          <span className="font-medium text-gray-900">{lang.language}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-semibold text-gray-900">{lang.flaggedCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{lang.totalContent.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{lang.flaggedRate}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${risk.color}`}>
                          {risk.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(lang.trend)}
                          <span className={`text-sm font-medium ${getTrendColor(lang.trend)}`}>
                            {lang.change > 0 ? '+' : ''}{lang.change}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {lang.topWords.slice(0, 3).map((word, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-[#015763]/10 text-[#015763] text-xs">
                              {word}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Language Distribution Chart */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Language Distribution</h2>
          <p className="text-sm text-gray-600 mt-1">Flagged content breakdown by language</p>
        </div>

        {loading ? (
          <div className="animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((lang, index) => {
              const percentage = analytics ? ((lang.flaggedCount / analytics.totalFlagged) * 100).toFixed(1) : 0;
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex items-center gap-2 w-32">
                    <span className="text-sm">{getLanguageFlag(lang.language)}</span>
                    <span className="text-sm font-medium text-gray-900">{lang.language}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-[#015763] h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12">{percentage}%</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-16">{lang.flaggedCount}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
