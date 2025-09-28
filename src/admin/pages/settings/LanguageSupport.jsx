import React from 'react';
import { FiGlobe, FiToggleLeft, FiSettings, FiEdit } from 'react-icons/fi';

export default function LanguageSupport() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiGlobe className="text-[#015763]" />
          Language Support (Filipino / English)
        </h1>
        <p className="text-gray-600 mt-1">
          Configure language-specific settings for Filipino and English content detection
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiGlobe className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Language Configuration</h3>
          <p className="text-gray-600 mb-6">
            This page will configure language-specific settings for Filipino and English content detection.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiToggleLeft className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Enable Languages</h4>
              <p className="text-sm text-gray-600">Toggle language support</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiSettings className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Detection Settings</h4>
              <p className="text-sm text-gray-600">Language-specific rules</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiEdit className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Customize Rules</h4>
              <p className="text-sm text-gray-600">Per-language configuration</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiGlobe className="h-6 w-6 text-purple-600 mb-2" />
              <h4 className="font-medium text-gray-900">Mixed Content</h4>
              <p className="text-sm text-gray-600">Handle mixed languages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
