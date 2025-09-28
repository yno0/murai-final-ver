import React, { useState, useEffect } from 'react';
import {
  FiKey,
  FiLock,
  FiUnlock,
  FiSettings,
  FiShield,
  FiUser,
  FiEdit,
  FiSave,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import adminApi from '../../services/adminApi.js';

export default function RolePermissions() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [tempPermissions, setTempPermissions] = useState([]);

  // Available permissions with descriptions
  const availablePermissions = [
    {
      id: 'view_dashboard',
      name: 'View Dashboard',
      description: 'Access to main dashboard and overview statistics',
      category: 'Dashboard'
    },
    {
      id: 'manage_dictionary',
      name: 'Manage Dictionary',
      description: 'Add, edit, and delete dictionary words and categories',
      category: 'Dictionary'
    },
    {
      id: 'view_analytics',
      name: 'View Analytics',
      description: 'Access to analytics and reporting features',
      category: 'Analytics'
    },
    {
      id: 'manage_moderation',
      name: 'Manage Moderation',
      description: 'Handle flagged content and moderation actions',
      category: 'Moderation'
    },
    {
      id: 'view_users',
      name: 'View Users',
      description: 'View end user accounts and basic information',
      category: 'User Management'
    },
    {
      id: 'manage_users',
      name: 'Manage Users',
      description: 'Edit, suspend, or delete end user accounts',
      category: 'User Management'
    },
    {
      id: 'manage_admins',
      name: 'Manage Admins',
      description: 'Create, edit, and delete administrator accounts',
      category: 'Admin Management'
    },
    {
      id: 'manage_settings',
      name: 'Manage Settings',
      description: 'Modify system settings and configurations',
      category: 'System'
    },
    {
      id: 'view_logs',
      name: 'View Logs',
      description: 'Access to system logs and audit trails',
      category: 'System'
    },
    {
      id: 'manage_integrations',
      name: 'Manage Integrations',
      description: 'Configure API keys and external integrations',
      category: 'Integrations'
    }
  ];

  // Group permissions by category
  const permissionsByCategory = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  // Fetch admins data
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAdmins({
        limit: 100, // Get all admins for role management
        sortBy: 'name',
        sortOrder: 'asc'
      });

      if (response.success) {
        setAdmins(response.data.admins);
      } else {
        setError(response.message || 'Failed to fetch administrators');
      }
    } catch (err) {
      setError('Failed to fetch administrators');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Start editing permissions
  const startEditing = (admin) => {
    setEditingAdmin(admin._id);
    setTempPermissions(admin.permissions || []);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingAdmin(null);
    setTempPermissions([]);
  };

  // Toggle permission
  const togglePermission = (permissionId) => {
    setTempPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Save permissions
  const savePermissions = async (adminId) => {
    try {
      setSaving(adminId);
      const response = await adminApi.updateAdminPermissions(adminId, tempPermissions);

      if (response.success) {
        // Update local state
        setAdmins(prev => prev.map(admin =>
          admin._id === adminId
            ? { ...admin, permissions: tempPermissions }
            : admin
        ));
        setEditingAdmin(null);
        setTempPermissions([]);
      } else {
        setError(response.message || 'Failed to update permissions');
      }
    } catch (err) {
      setError('Failed to update permissions');
      console.error('Error updating permissions:', err);
    } finally {
      setSaving(null);
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiKey className="text-[#015763]" />
          Role & Permission Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Configure roles and permissions for administrator accounts
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <FiAlertCircle className="text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Permission Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <div key={category} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FiShield className="h-5 w-5 text-[#015763]" />
              <h3 className="text-lg font-medium text-gray-900">{category}</h3>
            </div>
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="text-sm">
                  <div className="font-medium text-gray-900">{permission.name}</div>
                  <div className="text-gray-600">{permission.description}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Administrators Permissions Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Administrator Permissions
          </h3>
          <button
            onClick={fetchAdmins}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FiRefreshCw className="h-8 w-8 text-[#015763] animate-spin" />
            <span className="ml-2 text-gray-600">Loading administrators...</span>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12">
            <FiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No administrators found</h3>
            <p className="text-gray-600">No administrators have been created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administrator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-[#015763] flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {admin.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(admin.status)}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingAdmin === admin._id ? (
                        <div className="space-y-3 max-w-md">
                          {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                            <div key={category}>
                              <h4 className="text-xs font-medium text-gray-700 mb-1">{category}</h4>
                              <div className="space-y-1">
                                {permissions.map((permission) => (
                                  <label key={permission.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={tempPermissions.includes(permission.id)}
                                      onChange={() => togglePermission(permission.id)}
                                      className="rounded border-gray-300 text-[#015763] focus:ring-[#015763] h-3 w-3"
                                    />
                                    <span className="text-xs text-gray-700">{permission.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {admin.permissions && admin.permissions.length > 0 ? (
                            admin.permissions.map((permissionId) => {
                              const permission = availablePermissions.find(p => p.id === permissionId);
                              return permission ? (
                                <span
                                  key={permissionId}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1 mb-1"
                                >
                                  <FiCheck className="h-3 w-3 mr-1" />
                                  {permission.name}
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className="text-sm text-gray-500">No permissions assigned</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingAdmin === admin._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => savePermissions(admin._id)}
                            disabled={saving === admin._id}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Save Changes"
                          >
                            <FiSave className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={saving === admin._id}
                            className="text-gray-600 hover:text-gray-800 p-1"
                            title="Cancel"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(admin)}
                          disabled={admin.status !== 'active'}
                          className="text-[#015763] hover:text-[#014a54] p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit Permissions"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
