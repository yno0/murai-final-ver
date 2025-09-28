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
  FiActivity
} from 'react-icons/fi';
import adminApi from '../../services/adminApi.js';
import { CreateAdminModal, EditAdminModal, ChangePasswordModal } from '../../components/AdminModals.jsx';

export default function AdminAccounts() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const itemsPerPage = 20;

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
      const response = await adminApi.getAdmins({
        page,
        limit: itemsPerPage,
        search,
        status,
        role,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.success) {
        setAdmins(response.data.admins);
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.totalPages);
        setTotalAdmins(response.data.pagination.total);
      } else {
        setError(response.message || 'Failed to fetch admins');
      }
    } catch (err) {
      setError('Failed to fetch admins');
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiUserX className="text-[#015763]" />
          Admin Accounts
        </h1>
        <p className="text-gray-600 mt-1">
          Manage administrator accounts with full system access
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{totalAdmins}</p>
            </div>
            <FiUserX className="h-8 w-8 text-[#015763]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {admins.filter(admin => admin.status === 'active').length}
              </p>
            </div>
            <FiShield className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-purple-600">
                {admins.filter(admin => admin.role === 'super_admin').length}
              </p>
            </div>
            <FiKey className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Regular Admins</p>
              <p className="text-2xl font-bold text-blue-600">
                {admins.filter(admin => admin.role === 'admin').length}
              </p>
            </div>
            <FiSettings className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search admins by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Role Filter */}
            <div className="relative">
              <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#015763] focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Refresh Button */}
            <button
              onClick={() => fetchAdmins(currentPage, searchTerm, statusFilter, roleFilter)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Create Admin Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#015763] text-white rounded-lg hover:bg-[#014a54]"
            >
              <FiPlus className="h-4 w-4" />
              Create Admin
            </button>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Administrators ({totalAdmins})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FiRefreshCw className="h-8 w-8 text-[#015763] animate-spin" />
            <span className="ml-2 text-gray-600">Loading administrators...</span>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12">
            <FiUserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No administrators found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter || roleFilter ? 'Try adjusting your search or filter criteria.' : 'No administrators have been created yet.'}
            </p>
          </div>
        ) : (
          <>
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
                      Last Login
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
                            <div className="text-xs text-gray-400">{admin.department}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(admin)}
                            className="text-[#015763] hover:text-[#014a54] p-1"
                            title="Edit Admin"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openPasswordModal(admin)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Change Password"
                          >
                            <FiLock className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteAdmin(admin._id)}
                            disabled={actionLoading === admin._id}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Admin"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalAdmins)} of {totalAdmins} administrators
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

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
