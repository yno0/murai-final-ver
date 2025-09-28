import React from 'react';
import { FiBarChart, FiTrendingUp, FiCalendar, FiPieChart } from 'react-icons/fi';

export default function UsageStatistics() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiBarChart className="text-[#015763]" />
          Usage Statistics
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor API usage, extension activity, and system performance metrics
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiBarChart className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Analytics Dashboard</h3>
          <p className="text-gray-600 mb-6">
            This page will display comprehensive usage statistics and performance metrics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiTrendingUp className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Usage Trends</h4>
              <p className="text-sm text-gray-600">Track usage over time</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiPieChart className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Distribution</h4>
              <p className="text-sm text-gray-600">Usage by domain/user</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiCalendar className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Time Analysis</h4>
              <p className="text-sm text-gray-600">Peak usage times</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiBarChart className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Performance</h4>
              <p className="text-sm text-gray-600">System performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
