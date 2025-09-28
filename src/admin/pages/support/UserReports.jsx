import React from 'react';
import { FiFlag, FiUser, FiMessageSquare, FiEye } from 'react-icons/fi';

export default function UserReports() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiFlag className="text-[#015763]" />
          User Reports
        </h1>
        <p className="text-gray-600 mt-1">
          Manage reports and issues submitted by end users of the MURAi system
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiFlag className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Report Management</h3>
          <p className="text-gray-600 mb-6">
            This page will manage reports and issues submitted by end users of the MURAi system.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiMessageSquare className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">New Reports</h4>
              <p className="text-sm text-gray-600">Unread user reports</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiEye className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Review Reports</h4>
              <p className="text-sm text-gray-600">Investigate issues</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiUser className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">User Contact</h4>
              <p className="text-sm text-gray-600">Respond to users</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiFlag className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Report Status</h4>
              <p className="text-sm text-gray-600">Track resolution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
