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

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-[#015763] to-[#023a42] rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {adminUser?.name || 'Administrator'}!
        </h1>
        <p className="text-[#a0d4db]">
          Last login: {adminUser?.lastLogin ? new Date(adminUser.lastLogin).toLocaleString() : 'First time login'}
        </p>
      </div>

      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiEye className="text-[#015763]" />
              System Overview
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor key metrics and system health across the MURAi platform
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#023a42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FiAlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-red-700 font-medium">Error loading dashboard</span>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Key Metrics Grid */}
      {!loading && !error && dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
              <FiUsers className="h-8 w-8 text-[#015763]" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
              <FiShield className="h-8 w-8 text-[#015763]" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
              <FiActivity className="h-8 w-8 text-[#015763]" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
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
              <FiTrendingUp className="h-8 w-8 text-[#015763]" />
            </div>
          </div>
        </div>
      )}

      {/* System Status */}
      {!loading && !error && dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Response Time</span>
                <span className="text-sm font-medium text-green-600">
                  {dashboardData.systemHealth.apiResponseTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Performance</span>
                <span className="text-sm font-medium text-green-600">
                  {dashboardData.systemHealth.databaseStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Model Status</span>
                <span className="text-sm font-medium text-green-600">
                  {dashboardData.systemHealth.aiModelStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Extension Sync</span>
                <span className="text-sm font-medium text-green-600">
                  {dashboardData.systemHealth.extensionSync}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
            <div className="space-y-3">
              {dashboardData.recentAlerts.length > 0 ? (
                dashboardData.recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3">
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
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!loading && !error && dashboardData && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FiShield className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Review Pending Cases</h4>
              <p className="text-sm text-gray-600">
                {dashboardData.quickActions.pendingCases} cases awaiting review
              </p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FiUsers className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Manage Users</h4>
              <p className="text-sm text-gray-600">
                {formatNumber(dashboardData.quickActions.totalUsers)} total users
              </p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <FiActivity className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">View Analytics</h4>
              <p className="text-sm text-gray-600">
                {dashboardData.quickActions.flaggedToday} flagged today
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
