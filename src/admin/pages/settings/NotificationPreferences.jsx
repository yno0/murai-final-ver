import React from 'react';
import { FiMessageSquare, FiBell, FiMail, FiSettings } from 'react-icons/fi';

export default function NotificationPreferences() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiMessageSquare className="text-[#015763]" />
          Notification Preferences
        </h1>
        <p className="text-gray-600 mt-1">
          Configure system notifications and alert preferences for administrators
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiMessageSquare className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Settings</h3>
          <p className="text-gray-600 mb-6">
            This page will configure system notifications and alert preferences for administrators.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiBell className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Alert Types</h4>
              <p className="text-sm text-gray-600">Configure alert categories</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiMail className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Email alert settings</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiSettings className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Frequency</h4>
              <p className="text-sm text-gray-600">Set notification frequency</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiMessageSquare className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Channels</h4>
              <p className="text-sm text-gray-600">Notification channels</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
