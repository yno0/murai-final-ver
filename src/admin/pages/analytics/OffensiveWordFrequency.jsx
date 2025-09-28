import React from 'react';
import { FiPieChart, FiList, FiFilter, FiTrendingDown } from 'react-icons/fi';

export default function OffensiveWordFrequency() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiPieChart className="text-[#015763]" />
          Offensive Word Frequency
        </h1>
        <p className="text-gray-600 mt-1">
          Track frequency and patterns of detected offensive words and phrases
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiPieChart className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Word Frequency Analytics</h3>
          <p className="text-gray-600 mb-6">
            This page will show detailed frequency analysis of detected offensive content.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiList className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Top Words</h4>
              <p className="text-sm text-gray-600">Most frequently detected</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiPieChart className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Distribution</h4>
              <p className="text-sm text-gray-600">Word category breakdown</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiFilter className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Language Filter</h4>
              <p className="text-sm text-gray-600">Filipino vs English</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiTrendingDown className="h-6 w-6 text-red-600 mb-2" />
              <h4 className="font-medium text-gray-900">Declining Terms</h4>
              <p className="text-sm text-gray-600">Reduced usage patterns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
