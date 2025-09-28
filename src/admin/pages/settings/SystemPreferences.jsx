import React from 'react';
import { FiMonitor, FiSettings, FiDatabase, FiCpu } from 'react-icons/fi';

export default function SystemPreferences() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiMonitor className="text-[#015763]" />
          System Preferences
        </h1>
        <p className="text-gray-600 mt-1">
          Configure general system settings and performance preferences
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiMonitor className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Configuration</h3>
          <p className="text-gray-600 mb-6">
            This page will configure general system settings and performance preferences.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiSettings className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">General Settings</h4>
              <p className="text-sm text-gray-600">Basic system configuration</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiCpu className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Performance</h4>
              <p className="text-sm text-gray-600">System performance tuning</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiDatabase className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Data Management</h4>
              <p className="text-sm text-gray-600">Data retention settings</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiMonitor className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Monitoring</h4>
              <p className="text-sm text-gray-600">System monitoring settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
