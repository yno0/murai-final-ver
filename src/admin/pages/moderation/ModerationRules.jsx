import React from 'react';
import { FiFileText, FiEdit, FiPlus, FiSettings } from 'react-icons/fi';

export default function ModerationRules() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiFileText className="text-[#015763]" />
          Moderation Rules
        </h1>
        <p className="text-gray-600 mt-1">
          Configure and manage automated moderation rules and policies
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiFileText className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Moderation Rules Management</h3>
          <p className="text-gray-600 mb-6">
            This page will allow configuration of automated moderation rules and policies.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiPlus className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Create Rules</h4>
              <p className="text-sm text-gray-600">Add new moderation rules</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiEdit className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Edit Rules</h4>
              <p className="text-sm text-gray-600">Modify existing rules</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiSettings className="h-6 w-6 text-gray-600 mb-2" />
              <h4 className="font-medium text-gray-900">Configure</h4>
              <p className="text-sm text-gray-600">Set rule parameters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
