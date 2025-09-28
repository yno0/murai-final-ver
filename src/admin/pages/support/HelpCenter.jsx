import React from 'react';
import { FiHelpCircle, FiBook, FiVideo, FiDownload } from 'react-icons/fi';

export default function HelpCenter() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiHelpCircle className="text-[#015763]" />
          Help Center / Documentation
        </h1>
        <p className="text-gray-600 mt-1">
          Access documentation, guides, and resources for the MURAi admin system
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiHelpCircle className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Help & Documentation Center</h3>
          <p className="text-gray-600 mb-6">
            This page will provide access to documentation, guides, and resources for the MURAi admin system.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiBook className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">User Guides</h4>
              <p className="text-sm text-gray-600">Step-by-step guides</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiVideo className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Video Tutorials</h4>
              <p className="text-sm text-gray-600">Visual learning resources</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiHelpCircle className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">FAQ</h4>
              <p className="text-sm text-gray-600">Common questions</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiDownload className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Downloads</h4>
              <p className="text-sm text-gray-600">Resources and tools</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
