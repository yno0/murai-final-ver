import React, { useState, useEffect } from 'react';
import { FiEye, FiUsers, FiShield, FiActivity, FiTrendingUp, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { useAdminAuth } from '../../contexts/AdminAuthContext.jsx';
import adminApiService from '../../services/adminApi.js';

export default function SystemOverview() {
  const { adminUser } = useAdminAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.getDashboardStats();

      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Good {getTimeOfDay()}, {adminUser?.name || 'Administrator'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Here's what's happening with your MURAi system today
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>



      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <FiRefreshCw className="h-6 w-6 animate-spin text-[#015763]" />
            <span className="text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-red-700 font-medium">Error loading dashboard</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-3 inline-flex items-center px-4 py-2 border border-red-300 rounded-lg bg-red-600 text-white hover:bg-red-700 hover:border-red-400 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Key Metrics Grid */}
      {!loading && !error && dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData.metrics.totalUsers.value)}
                </p>
                <p className={`text-sm ${getGrowthColor(dashboardData.metrics.totalUsers.growth, dashboardData.metrics.totalUsers.trend)}`}>
                  {getGrowthText(dashboardData.metrics.totalUsers.growth, dashboardData.metrics.totalUsers.trend)} from last month
                </p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiUsers className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Flagged Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData.metrics.flaggedToday.value)}
                </p>
                <p className={`text-sm ${getGrowthColor(dashboardData.metrics.flaggedToday.growth, dashboardData.metrics.flaggedToday.trend)}`}>
                  {getGrowthText(dashboardData.metrics.flaggedToday.growth, dashboardData.metrics.flaggedToday.trend)} from yesterday
                </p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiShield className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Extensions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(dashboardData.metrics.activeExtensions.value)}
                </p>
                <p className={`text-sm ${getGrowthColor(dashboardData.metrics.activeExtensions.growth, dashboardData.metrics.activeExtensions.trend)}`}>
                  {getGrowthText(dashboardData.metrics.activeExtensions.growth, dashboardData.metrics.activeExtensions.trend)} from last week
                </p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiActivity className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Detection Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.metrics.detectionAccuracy.value}%
                </p>
                <p className={`text-sm ${getGrowthColor(dashboardData.metrics.detectionAccuracy.growth, dashboardData.metrics.detectionAccuracy.trend)}`}>
                  +{dashboardData.metrics.detectionAccuracy.growth}% improvement
                </p>
              </div>
              <div className="rounded-md border border-gray-200 p-2">
                <FiTrendingUp className="h-6 w-6 text-[#015763]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      {!loading && !error && dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-gray-600">API Response Time</span>
                <span className="text-sm font-medium text-green-600">
                  {dashboardData.systemHealth.apiResponseTime}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-gray-600">Database Performance</span>
                <span className="text-sm font-medium text-green-600">
                  {dashboardData.systemHealth.databaseStatus}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-gray-600">AI Model Status</span>
                <span className="text-sm font-medium text-green-600">
                  {dashboardData.systemHealth.aiModelStatus}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-gray-600">Extension Sync</span>
                <span className="text-sm font-medium text-green-600">
                  {dashboardData.systemHealth.extensionSync}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {dashboardData.recentAlerts.length > 0 ? (
                dashboardData.recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-md border border-gray-100 hover:border-gray-200 transition-colors">
                    <FiAlertTriangle className={`h-4 w-4 mt-0.5 ${
                      alert.severity === 'high' ? 'text-red-500' :
                      alert.severity === 'medium' ? 'text-yellow-500' :
                      alert.severity === 'low' ? 'text-blue-500' :
                      'text-green-500'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-md">
                  <p className="text-sm text-gray-500">No recent alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!loading && !error && dashboardData && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left">
              <div className="rounded-md border border-gray-200 p-2 w-fit mb-3 group-hover:border-gray-300 transition-colors">
                <FiShield className="h-5 w-5 text-[#015763]" />
              </div>
              <h4 className="font-medium text-gray-900">Review Pending Cases</h4>
              <p className="text-sm text-gray-600 mt-1">
                {dashboardData.quickActions.pendingCases} cases awaiting review
              </p>
            </button>
            <button className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left">
              <div className="rounded-md border border-gray-200 p-2 w-fit mb-3 group-hover:border-gray-300 transition-colors">
                <FiUsers className="h-5 w-5 text-[#015763]" />
              </div>
              <h4 className="font-medium text-gray-900">Manage Users</h4>
              <p className="text-sm text-gray-600 mt-1">
                {formatNumber(dashboardData.quickActions.totalUsers)} total users
              </p>
            </button>
            <button className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left">
              <div className="rounded-md border border-gray-200 p-2 w-fit mb-3 group-hover:border-gray-300 transition-colors">
                <FiActivity className="h-5 w-5 text-[#015763]" />
              </div>
              <h4 className="font-medium text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-600 mt-1">
                {dashboardData.quickActions.flaggedToday} flagged today
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
