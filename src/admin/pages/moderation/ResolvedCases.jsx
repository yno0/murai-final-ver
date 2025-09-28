import React from 'react';
import { FiCheckCircle, FiSearch, FiDownload } from 'react-icons/fi';

export default function ResolvedCases() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiCheckCircle className="text-[#015763]" />
          Resolved Cases
        </h1>
        <p className="text-gray-600 mt-1">
          View history of resolved moderation cases and their outcomes
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Resolved Cases Archive</h3>
          <p className="text-gray-600 mb-6">
            This page will show all resolved moderation cases with detailed resolution history.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiSearch className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Search Cases</h4>
              <p className="text-sm text-gray-600">Find specific resolved cases</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiCheckCircle className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">View Details</h4>
              <p className="text-sm text-gray-600">See resolution reasoning</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiDownload className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Export Reports</h4>
              <p className="text-sm text-gray-600">Download case summaries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
