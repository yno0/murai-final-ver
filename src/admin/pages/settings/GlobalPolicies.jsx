import React from 'react';
import { FiShield, FiSettings, FiEdit, FiSave } from 'react-icons/fi';

export default function GlobalPolicies() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiShield className="text-[#015763]" />
          Global Moderation Policies
        </h1>
        <p className="text-gray-600 mt-1">
          Configure system-wide moderation policies and enforcement rules
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiShield className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Global Policy Configuration</h3>
          <p className="text-gray-600 mb-6">
            This page will configure system-wide moderation policies and enforcement rules.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiSettings className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Policy Rules</h4>
              <p className="text-sm text-gray-600">Define moderation rules</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiEdit className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Edit Policies</h4>
              <p className="text-sm text-gray-600">Modify existing policies</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiShield className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Enforcement</h4>
              <p className="text-sm text-gray-600">Set enforcement levels</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiSave className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Apply Changes</h4>
              <p className="text-sm text-gray-600">Save policy updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
