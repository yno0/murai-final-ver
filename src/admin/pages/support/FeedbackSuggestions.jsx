import React from 'react';
import { FiMessageSquare, FiThumbsUp, FiZap, FiStar } from 'react-icons/fi';

export default function FeedbackSuggestions() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiMessageSquare className="text-[#015763]" />
          Feedback & Suggestions
        </h1>
        <p className="text-gray-600 mt-1">
          Review user feedback and feature suggestions for system improvements
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiMessageSquare className="h-12 w-12 text-[#015763] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Feedback Management</h3>
          <p className="text-gray-600 mb-6">
            This page will review user feedback and feature suggestions for system improvements.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiThumbsUp className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Positive Feedback</h4>
              <p className="text-sm text-gray-600">User satisfaction</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiZap className="h-6 w-6 text-blue-600 mb-2" />
              <h4 className="font-medium text-gray-900">Feature Requests</h4>
              <p className="text-sm text-gray-600">Improvement suggestions</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiStar className="h-6 w-6 text-yellow-600 mb-2" />
              <h4 className="font-medium text-gray-900">Ratings</h4>
              <p className="text-sm text-gray-600">User ratings</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiMessageSquare className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Comments</h4>
              <p className="text-sm text-gray-600">Detailed feedback</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
