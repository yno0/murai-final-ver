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
  FiRefreshCw,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
import adminApiService from '../../services/adminApi.js';

export default function RolePermissions() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [tempPermissions, setTempPermissions] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

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
      const response = await adminApiService.getAdmins({
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
      const response = await adminApiService.updateAdminPermissions(adminId, tempPermissions);

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

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border border-green-200';
      case 'inactive': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'suspended': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'admin': return 'bg-blue-50 text-blue-700 border border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Filter admins based on search and role
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = !searchTerm ||
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Handle edit permissions
  const handleEditPermissions = (admin) => {
    setSelectedAdmin(admin);
    setShowPermissionModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiKey className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Role & Permission Settings</h1>
              <p className="text-sm text-gray-600">
                Configure administrator roles and permissions • {admins.length} admin accounts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdmins}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:border-gray-400 transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-2">
          <FiAlertCircle className="text-red-600 flex-shrink-0 h-4 w-4" />
          <span className="text-red-700 text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Permission Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <div key={category} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiShield className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
            </div>
            <div className="space-y-3">
              {permissions.map((permission) => (
                <div key={permission.id} className="p-3 bg-gray-50 rounded-md border border-gray-100">
                  <div className="font-medium text-gray-900 text-sm">{permission.name}</div>
                  <div className="text-gray-600 text-xs mt-1">{permission.description}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filter for Admins */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search administrators by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Administrators Permissions Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Administrator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={5}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Loading administrators...
                    </div>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={5}>
                    {searchTerm || roleFilter !== 'all'
                      ? 'No administrators match your search criteria.'
                      : 'No administrators found. Create admin accounts to manage permissions.'
                    }
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {admin.name?.charAt(0)?.toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{admin.name || 'Unknown Admin'}</div>
                          <div className="text-sm text-gray-600">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeColor(admin.status)}`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {admin.permissions?.slice(0, 3).map((permission) => (
                          <span
                            key={permission}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                          >
                            {permission.replace('_', ' ')}
                          </span>
                        ))}
                        {admin.permissions?.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                            +{admin.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleEditPermissions(admin)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Permissions"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
