import React, { useState, useEffect } from 'react';
import {
  FiUserX,
  FiShield,
  FiKey,
  FiSettings,
  FiPlus,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
  FiEye,
  FiLock,
  FiUnlock,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
  FiUser,
  FiMail,
  FiCalendar,
  FiActivity,
  FiX
} from 'react-icons/fi';
import adminApi from '../../services/adminApi.js';
import { CreateAdminModal, EditAdminModal, ChangePasswordModal } from '../../components/AdminModals.jsx';

export default function AdminAccounts() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const itemsPerPage = 10;

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
    department: 'Administration',
    permissions: []
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    status: '',
    permissions: []
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
    currentPassword: ''
  });

  // Available permissions
  const availablePermissions = [
    'view_dashboard',
    'manage_dictionary',
    'view_analytics',
    'manage_moderation',
    'view_users',
    'manage_users',
    'manage_admins',
    'manage_settings',
    'view_logs',
    'manage_integrations'
  ];

  // Fetch admins data
  const fetchAdmins = async (page = 1, search = '', status = '', role = '') => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // Convert 'all' filters to empty strings for API
      const apiStatus = status === 'all' ? '' : status;
      const apiRole = role === 'all' ? '' : role;

      const response = await adminApi.getAdmins({
        page,
        limit: itemsPerPage,
        search,
        status: apiStatus,
        role: apiRole,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      console.log('Admin API Response:', response); // Debug log

      if (response.success) {
        setAdmins(response.data.admins || []);
        setCurrentPage(response.data.pagination?.page || 1);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalAdmins(response.data.pagination?.total || 0);
      } else {
        setError(response.message || 'Failed to fetch admins');
        setAdmins([]); // Clear admins on error
      }
    } catch (err) {
      setError('Failed to fetch admins');
      setAdmins([]); // Clear admins on error
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      fetchAdmins(1, searchTerm, statusFilter, roleFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, roleFilter]);

  // Handle page change
  const handlePageChange = (page) => {
    fetchAdmins(page, searchTerm, statusFilter, roleFilter);
  };

  // Handle create admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (createForm.password !== createForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setActionLoading('create');
      const response = await adminApi.createAdmin({
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        department: createForm.department,
        permissions: createForm.permissions
      });

      if (response.success) {
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'admin',
          department: 'Administration',
          permissions: []
        });
        await fetchAdmins(currentPage, searchTerm, statusFilter, roleFilter);
      } else {
        setError(response.message || 'Failed to create admin');
      }
    } catch (err) {
      setError('Failed to create admin');
      console.error('Error creating admin:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle edit admin
  const handleEditAdmin = async (e) => {
    e.preventDefault();

    try {
      setActionLoading('edit');
      const response = await adminApi.updateAdmin(selectedAdmin._id, editForm);

      if (response.success) {
        setShowEditModal(false);
        setSelectedAdmin(null);
        await fetchAdmins(currentPage, searchTerm, statusFilter, roleFilter);
      } else {
        setError(response.message || 'Failed to update admin');
      }
    } catch (err) {
      setError('Failed to update admin');
      console.error('Error updating admin:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setActionLoading('password');
      const response = await adminApi.changeAdminPassword(selectedAdmin._id, {
        newPassword: passwordForm.newPassword,
        currentPassword: passwordForm.currentPassword
      });

      if (response.success) {
        setShowPasswordModal(false);
        setPasswordForm({
          newPassword: '',
          confirmPassword: '',
          currentPassword: ''
        });
        setSelectedAdmin(null);
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
      console.error('Error changing password:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete admin
  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin account? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(adminId);
      const response = await adminApi.deleteAdmin(adminId);

      if (response.success) {
        await fetchAdmins(currentPage, searchTerm, statusFilter, roleFilter);
      } else {
        setError(response.message || 'Failed to delete admin');
      }
    } catch (err) {
      setError('Failed to delete admin');
      console.error('Error deleting admin:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Open edit modal
  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      department: admin.department,
      status: admin.status,
      permissions: admin.permissions || []
    });
    setShowEditModal(true);
  };

  // Open password modal
  const openPasswordModal = (admin) => {
    setSelectedAdmin(admin);
    setPasswordForm({
      newPassword: '',
      confirmPassword: '',
      currentPassword: ''
    });
    setShowPasswordModal(true);
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiShield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-1">Admin Accounts</h1>
              <p className="text-sm text-gray-600">
                Manage administrator accounts and permissions • {totalAdmins} total admins
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Add Admin
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

      {/* Search and Filter Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search admins by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
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

      {/* Admins Table */}
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
                  Last Login
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
              ) : admins.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={5}>
                    {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                      ? 'No administrators match your search criteria.'
                      : 'No administrators found. Create your first admin account to get started.'
                    }
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
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
                          {admin.department && (
                            <div className="text-xs text-gray-500">{admin.department}</div>
                          )}
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
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(admin)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit Admin"
                        >
                          <FiEdit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => openPasswordModal(admin)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Change Password"
                        >
                          <FiLock className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteAdmin(admin._id)}
                          disabled={actionLoading === admin._id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Admin"
                        >
                          <FiTrash2 className="h-4 w-4" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalAdmins)} of {totalAdmins} administrators
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateAdminModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAdmin}
        form={createForm}
        setForm={setCreateForm}
        loading={actionLoading === 'create'}
        availablePermissions={availablePermissions}
      />

      <EditAdminModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditAdmin}
        form={editForm}
        setForm={setEditForm}
        loading={actionLoading === 'edit'}
        availablePermissions={availablePermissions}
      />

      <ChangePasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordChange}
        form={passwordForm}
        setForm={setPasswordForm}
        loading={actionLoading === 'password'}
        admin={selectedAdmin}
      />
    </div>
  );
}
