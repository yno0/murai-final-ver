import React from 'react';
import { FiTrendingUp, FiBarChart, FiCalendar, FiDownload } from 'react-icons/fi';

export default function SentimentTrends() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiTrendingUp className="text-[#015763]" />
          Sentiment Trends
        </h1>
        <p className="text-gray-600 mt-1">
          Analyze sentiment patterns and trends across detected content
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiTrendingUp className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sentiment Analysis Dashboard</h3>
          <p className="text-gray-600 mb-6">
            This page will display comprehensive sentiment analysis and trending patterns.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiBarChart className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Trend Charts</h4>
              <p className="text-sm text-gray-600">Visual sentiment trends</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiCalendar className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Time Periods</h4>
              <p className="text-sm text-gray-600">Daily, weekly, monthly views</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiTrendingUp className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Predictions</h4>
              <p className="text-sm text-gray-600">Sentiment forecasting</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiDownload className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Export Data</h4>
              <p className="text-sm text-gray-600">Download trend reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
