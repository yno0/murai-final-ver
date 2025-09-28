import React from 'react';
import { FiGlobe, FiBarChart, FiMap, FiActivity } from 'react-icons/fi';

export default function WebsiteReports() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiGlobe className="text-[#015763]" />
          Website Reports
        </h1>
        <p className="text-gray-600 mt-1">
          Analyze content moderation metrics across different websites and domains
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiGlobe className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Website Analytics Dashboard</h3>
          <p className="text-gray-600 mb-6">
            This page will provide detailed analytics for each connected website and domain.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiBarChart className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Site Metrics</h4>
              <p className="text-sm text-gray-600">Per-site statistics</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiMap className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Domain Mapping</h4>
              <p className="text-sm text-gray-600">Geographic distribution</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiActivity className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Activity Levels</h4>
              <p className="text-sm text-gray-600">Traffic and engagement</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiGlobe className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Top Domains</h4>
              <p className="text-sm text-gray-600">Most active websites</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
