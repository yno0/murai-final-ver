import React from 'react';
import { FiDatabase, FiSearch, FiFilter, FiDownload } from 'react-icons/fi';

export default function IntegrationLogs() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiDatabase className="text-[#015763]" />
          Integration Logs
        </h1>
        <p className="text-gray-600 mt-1">
          View detailed logs of all system integrations and API calls
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiDatabase className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Integration Log Viewer</h3>
          <p className="text-gray-600 mb-6">
            This page will display detailed logs of all system integrations and API interactions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiSearch className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Search Logs</h4>
              <p className="text-sm text-gray-600">Find specific entries</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiFilter className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Filter Logs</h4>
              <p className="text-sm text-gray-600">Filter by type/date</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiDatabase className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Real-time</h4>
              <p className="text-sm text-gray-600">Live log monitoring</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiDownload className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Export Logs</h4>
              <p className="text-sm text-gray-600">Download log files</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
