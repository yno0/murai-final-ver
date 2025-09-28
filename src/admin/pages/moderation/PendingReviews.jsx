import React from 'react';
import { FiClock, FiUser, FiEye, FiCheck, FiX } from 'react-icons/fi';

export default function PendingReviews() {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiClock className="text-[#015763]" />
          Pending Reviews
        </h1>
        <p className="text-gray-600 mt-1">
          Review flagged content that requires manual moderation decisions
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-12">
          <FiClock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Reviews</h3>
          <p className="text-gray-600 mb-6">
            This page will display content flagged for manual review by moderators.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiEye className="h-6 w-6 text-[#015763] mb-2" />
              <h4 className="font-medium text-gray-900">Review Content</h4>
              <p className="text-sm text-gray-600">Examine flagged content in detail</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiCheck className="h-6 w-6 text-green-600 mb-2" />
              <h4 className="font-medium text-gray-900">Approve</h4>
              <p className="text-sm text-gray-600">Mark content as acceptable</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <FiX className="h-6 w-6 text-red-600 mb-2" />
              <h4 className="font-medium text-gray-900">Reject</h4>
              <p className="text-sm text-gray-600">Confirm content violation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
