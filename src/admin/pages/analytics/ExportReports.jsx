import React from 'react';
import { FiDownload, FiFileText, FiCalendar, FiSettings } from 'react-icons/fi';

export default function ExportReports() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiDownload className="text-[#015763]" />
          Export Reports
        </h1>
        <p className="text-gray-600 mt-1">
          Generate and download comprehensive reports for analysis and compliance
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiDownload className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Report Generation Center</h3>
          <p className="text-gray-600 mb-6">
            This page will allow generation and export of various analytical reports.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiFileText className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Report Types</h4>
              <p className="text-sm text-gray-600">PDF, CSV, Excel formats</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiCalendar className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Date Ranges</h4>
              <p className="text-sm text-gray-600">Custom time periods</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiSettings className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Customization</h4>
              <p className="text-sm text-gray-600">Filter and configure</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiDownload className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Scheduled</h4>
              <p className="text-sm text-gray-600">Automated exports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
