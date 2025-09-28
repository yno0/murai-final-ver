import React from 'react';
import { FiLink, FiGlobe, FiPlus, FiActivity } from 'react-icons/fi';

export default function ConnectedDomains() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiLink className="text-[#015763]" />
          Connected Domains / Extensions
        </h1>
        <p className="text-gray-600 mt-1">
          Manage websites and domains where MURAi extension is active
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiGlobe className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Domain Integration Management</h3>
          <p className="text-gray-600 mb-6">
            This page will manage all connected domains and extension installations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiGlobe className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Active Domains</h4>
              <p className="text-sm text-gray-600">View connected websites</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiPlus className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Add Domain</h4>
              <p className="text-sm text-gray-600">Connect new websites</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiActivity className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Activity Status</h4>
              <p className="text-sm text-gray-600">Monitor domain activity</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiLink className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Integration Health</h4>
              <p className="text-sm text-gray-600">Check connection status</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
