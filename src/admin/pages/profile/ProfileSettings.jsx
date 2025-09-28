import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiSave, FiLoader, FiCheck, FiX } from 'react-icons/fi';
import { useAdminAuth } from '../../contexts/AdminAuthContext.jsx';
import adminApi from '../../services/adminApi.js';

export default function ProfileSettings() {
  const { adminUser } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    role: ''
  });

  // Load admin data when component mounts
  useEffect(() => {
    if (adminUser) {
      setFormData({
        name: adminUser.name || '',
        email: adminUser.email || '',
        phone: adminUser.phone || '',
        department: adminUser.department || '',
        role: adminUser.role || ''
      });
    }
  }, [adminUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department
      };

      const response = await adminApi.updateProfile(updateData);

      if (response.success) {
        setSuccess(true);
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiUser className="text-[#015763]" />
          Profile Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your personal profile information and preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <FiCheck className="h-5 w-5 text-green-600" />
          <span className="text-green-800">Profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <FiX className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-600 mt-1">Update your personal details and contact information</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline h-4 w-4 mr-1" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <FiMail className="inline h-4 w-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="Email address"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact system administrator if needed.</p>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="inline h-4 w-4 mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Department Field */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                <FiBriefcase className="inline h-4 w-4 mr-1" />
                Department
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
                placeholder="Enter your department"
              />
            </div>

            {/* Role Field (Read-only) */}
            <div className="md:col-span-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="Role"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Role is assigned by system administrator.</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#014a54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <FiLoader className="h-4 w-4 animate-spin" />
              ) : (
                <FiSave className="h-4 w-4" />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
