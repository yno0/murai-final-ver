import React from 'react';
import { FiKey, FiPlus, FiEye, FiTrash2 } from 'react-icons/fi';

export default function ApiKeys() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiKey className="text-[#015763]" />
          API Keys & Tokens
        </h1>
        <p className="text-gray-600 mt-1">
          Manage API keys and authentication tokens for system integrations
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiKey className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">API Key Management</h3>
          <p className="text-gray-600 mb-6">
            This page will manage API keys and authentication tokens for system integrations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiPlus className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Generate Keys</h4>
              <p className="text-sm text-gray-600">Create new API keys</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiEye className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">View Keys</h4>
              <p className="text-sm text-gray-600">Manage existing keys</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiKey className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Permissions</h4>
              <p className="text-sm text-gray-600">Set key permissions</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiTrash2 className="h-6 w-6 text-red-600 mb-2" />
              <h4 className="font-medium text-gray-900">Revoke Keys</h4>
              <p className="text-sm text-gray-600">Disable unused keys</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
