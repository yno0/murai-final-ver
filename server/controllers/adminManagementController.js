import Admin from '../models/adminModel.js';
import Log from '../models/logModel.js';
import ResponseUtil from '../utils/response.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';

/**
 * Admin Management Controller
 * Handles admin account management operations
 */
class AdminManagementController {
    /**
     * Get all admin accounts
     * GET /api/admin/admins
     */
    async getAdmins(req, res) {
        try {
            const { 
                page = 1, 
                limit = 20, 
                search, 
                status, 
                role,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            const query = {};
            
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { department: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (status) {
                query.status = status;
            }

            if (role) {
                query.role = role;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const [admins, total] = await Promise.all([
                Admin.find(query)
                    .select('-password -passwordResetToken -twoFactorSecret -sessionTokens')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Admin.countDocuments(query)
            ]);

            ResponseUtil.success(res, {
                admins,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }, 'Admins retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving admins', error, {
                adminId: req.admin?.adminId,
                query: req.query
            });
            ResponseUtil.error(res, 'Failed to retrieve admins', 500, error);
        }
    }

    /**
     * Create new admin account
     * POST /api/admin/admins
     */
    async createAdmin(req, res) {
        try {
            const { name, email, password, role = 'admin', department, permissions } = req.body;

            // Validate required fields
            if (!name || !email || !password) {
                return ResponseUtil.badRequest(res, 'Name, email, and password are required');
            }

            // Validate role
            if (!['super_admin', 'admin'].includes(role)) {
                return ResponseUtil.badRequest(res, 'Invalid role. Must be admin or super_admin');
            }

            // Check if admin already exists
            const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
            if (existingAdmin) {
                return ResponseUtil.badRequest(res, 'Admin with this email already exists');
            }

            // Create admin
            const adminData = {
                name,
                email: email.toLowerCase(),
                password,
                role,
                department: department || 'Administration',
                permissions: permissions || [
                    'view_dashboard',
                    'manage_dictionary',
                    'view_analytics',
                    'manage_moderation',
                    'view_users',
                    'manage_settings'
                ]
            };

            const newAdmin = await Admin.createAdmin(adminData);

            // Log the creation
            await Log.createLog({
                action: 'admin_created',
                details: `New admin account created for "${newAdmin.email}"`,
                userId: req.admin?.adminId,
                metadata: {
                    actorRole: 'admin',
                    actorName: req.admin?.name,
                    actorEmail: req.admin?.email,
                    newAdminId: newAdmin._id,
                    newAdminEmail: newAdmin.email,
                    newAdminRole: newAdmin.role,
                    ip: req.ip
                },
                isSystemLog: false
            });

            logger.info('Admin account created', {
                newAdminId: newAdmin._id,
                newAdminEmail: newAdmin.email,
                createdBy: req.admin?.adminId
            });

            // Remove sensitive data before sending response
            const adminResponse = newAdmin.toObject();
            delete adminResponse.password;
            delete adminResponse.passwordResetToken;
            delete adminResponse.twoFactorSecret;
            delete adminResponse.sessionTokens;

            ResponseUtil.success(res, { admin: adminResponse }, 'Admin account created successfully', 201);

        } catch (error) {
            logger.error('Error creating admin', error, {
                adminId: req.admin?.adminId,
                body: { ...req.body, password: '[REDACTED]' }
            });
            ResponseUtil.error(res, 'Failed to create admin account', 500, error);
        }
    }

    /**
     * Update admin account
     * PUT /api/admin/admins/:id
     */
    async updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const { name, email, role, department, permissions, status } = req.body;

            const admin = await Admin.findById(id);
            if (!admin) {
                return ResponseUtil.notFound(res, 'Admin not found');
            }

            // Prevent self-role modification for security
            if (id === req.admin?.adminId && role && role !== admin.role) {
                return ResponseUtil.badRequest(res, 'Cannot modify your own role');
            }

            // Update fields
            if (name) admin.name = name;
            if (email) admin.email = email.toLowerCase();
            if (role && ['super_admin', 'admin'].includes(role)) admin.role = role;
            if (department) admin.department = department;
            if (permissions && Array.isArray(permissions)) admin.permissions = permissions;
            if (status && ['active', 'inactive', 'suspended'].includes(status)) admin.status = status;

            await admin.save();

            // Log the update
            await Log.createLog({
                action: 'admin_updated',
                details: `Admin account "${admin.email}" updated`,
                userId: req.admin?.adminId,
                metadata: {
                    actorRole: 'admin',
                    actorName: req.admin?.name,
                    actorEmail: req.admin?.email,
                    targetAdminId: admin._id,
                    targetAdminEmail: admin.email,
                    updatedFields: Object.keys(req.body),
                    ip: req.ip
                },
                isSystemLog: false
            });

            logger.info('Admin account updated', {
                adminId: admin._id,
                adminEmail: admin.email,
                updatedBy: req.admin?.adminId
            });

            // Remove sensitive data before sending response
            const adminResponse = admin.toObject();
            delete adminResponse.password;
            delete adminResponse.passwordResetToken;
            delete adminResponse.twoFactorSecret;
            delete adminResponse.sessionTokens;

            ResponseUtil.success(res, { admin: adminResponse }, 'Admin account updated successfully');

        } catch (error) {
            logger.error('Error updating admin', error, {
                adminId: req.admin?.adminId,
                targetId: req.params.id,
                body: req.body
            });
            ResponseUtil.error(res, 'Failed to update admin account', 500, error);
        }
    }

    /**
     * Delete admin account
     * DELETE /api/admin/admins/:id
     */
    async deleteAdmin(req, res) {
        try {
            const { id } = req.params;

            // Prevent self-deletion
            if (id === req.admin?.adminId) {
                return ResponseUtil.badRequest(res, 'Cannot delete your own account');
            }

            const admin = await Admin.findByIdAndDelete(id);
            if (!admin) {
                return ResponseUtil.notFound(res, 'Admin not found');
            }

            // Log the deletion
            await Log.createLog({
                action: 'admin_deleted',
                details: `Admin account "${admin.email}" deleted`,
                userId: req.admin?.adminId,
                metadata: {
                    actorRole: 'admin',
                    actorName: req.admin?.name,
                    actorEmail: req.admin?.email,
                    deletedAdminId: admin._id,
                    deletedAdminEmail: admin.email,
                    ip: req.ip
                },
                isSystemLog: false
            });

            logger.info('Admin account deleted', {
                deletedAdminId: admin._id,
                deletedAdminEmail: admin.email,
                deletedBy: req.admin?.adminId
            });

            ResponseUtil.success(res, null, 'Admin account deleted successfully');

        } catch (error) {
            logger.error('Error deleting admin', error, {
                adminId: req.admin?.adminId,
                targetId: req.params.id
            });
            ResponseUtil.error(res, 'Failed to delete admin account', 500, error);
        }
    }

    /**
     * Change admin password
     * PUT /api/admin/admins/:id/password
     */
    async changeAdminPassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword, currentPassword } = req.body;

            if (!newPassword) {
                return ResponseUtil.badRequest(res, 'New password is required');
            }

            if (newPassword.length < 8) {
                return ResponseUtil.badRequest(res, 'Password must be at least 8 characters long');
            }

            const admin = await Admin.findById(id);
            if (!admin) {
                return ResponseUtil.notFound(res, 'Admin not found');
            }

            // If changing own password, require current password
            if (id === req.admin?.adminId) {
                if (!currentPassword) {
                    return ResponseUtil.badRequest(res, 'Current password is required');
                }
                
                const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
                if (!isCurrentPasswordValid) {
                    return ResponseUtil.badRequest(res, 'Current password is incorrect');
                }
            }

            // Update password
            admin.password = newPassword;
            admin.passwordChangedAt = new Date();
            await admin.save();

            // Log the password change
            await Log.createLog({
                action: 'admin_password_changed',
                details: `Password changed for admin "${admin.email}"`,
                userId: req.admin?.adminId,
                metadata: {
                    actorRole: 'admin',
                    actorName: req.admin?.name,
                    actorEmail: req.admin?.email,
                    targetAdminId: admin._id,
                    targetAdminEmail: admin.email,
                    isSelfChange: id === req.admin?.adminId,
                    ip: req.ip
                },
                isSystemLog: false
            });

            logger.info('Admin password changed', {
                adminId: admin._id,
                adminEmail: admin.email,
                changedBy: req.admin?.adminId
            });

            ResponseUtil.success(res, null, 'Password changed successfully');

        } catch (error) {
            logger.error('Error changing admin password', error, {
                adminId: req.admin?.adminId,
                targetId: req.params.id
            });
            ResponseUtil.error(res, 'Failed to change password', 500, error);
        }
    }
}

export default new AdminManagementController();
