import express from 'express';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import userController from '../controllers/userController.js';
import adminManagementController from '../controllers/adminManagementController.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(authenticateAdmin);

// Logging middleware for user management routes
router.use((req, res, next) => {
    logger.info('Admin user management API request', {
        method: req.method,
        path: req.path,
        adminId: req.admin?.adminId,
        adminEmail: req.admin?.email,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
    });
    next();
});

// ===== END USER MANAGEMENT ROUTES =====

/**
 * @route   GET /api/admin/users
 * @desc    Get all end users with pagination and filtering
 * @access  Private (Admin only)
 * @query   {
 *   page?: number (default: 1),
 *   limit?: number (default: 20),
 *   search?: string,
 *   status?: string ("active" | "pending" | "suspended" | "revoked"),
 *   sortBy?: string (default: "createdAt"),
 *   sortOrder?: string ("asc" | "desc", default: "desc")
 * }
 */
router.get('/users', userController.getUsers);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get('/users/stats', userController.getUserStats);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 * @param   id - User ID (MongoDB ObjectId)
 */
router.get('/users/:id', userController.getUserById);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Update user status
 * @access  Private (Admin only)
 * @param   id - User ID (MongoDB ObjectId)
 * @body    {
 *   status: string ("active" | "pending" | "suspended" | "revoked")
 * }
 */
router.patch('/users/:id/status', userController.updateUserStatus);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 * @param   id - User ID (MongoDB ObjectId)
 */
router.delete('/users/:id', userController.deleteUser);

// ===== ADMIN ACCOUNT MANAGEMENT ROUTES =====

/**
 * @route   GET /api/admin/admins
 * @desc    Get all admin accounts with pagination and filtering
 * @access  Private (Admin only)
 * @query   {
 *   page?: number (default: 1),
 *   limit?: number (default: 20),
 *   search?: string,
 *   status?: string ("active" | "inactive" | "suspended"),
 *   role?: string ("super_admin" | "admin"),
 *   sortBy?: string (default: "createdAt"),
 *   sortOrder?: string ("asc" | "desc", default: "desc")
 * }
 */
router.get('/admins', adminManagementController.getAdmins);

/**
 * @route   POST /api/admin/admins
 * @desc    Create new admin account
 * @access  Private (Admin only)
 * @body    {
 *   name: string,
 *   email: string,
 *   password: string,
 *   role?: string ("admin" | "super_admin", default: "admin"),
 *   department?: string,
 *   permissions?: string[]
 * }
 */
router.post('/admins', adminManagementController.createAdmin);

/**
 * @route   PUT /api/admin/admins/:id
 * @desc    Update admin account
 * @access  Private (Admin only)
 * @param   id - Admin ID (MongoDB ObjectId)
 * @body    {
 *   name?: string,
 *   email?: string,
 *   role?: string ("admin" | "super_admin"),
 *   department?: string,
 *   permissions?: string[],
 *   status?: string ("active" | "inactive" | "suspended")
 * }
 */
router.put('/admins/:id', adminManagementController.updateAdmin);

/**
 * @route   PUT /api/admin/admins/:id/password
 * @desc    Change admin password
 * @access  Private (Admin only)
 * @param   id - Admin ID (MongoDB ObjectId)
 * @body    {
 *   newPassword: string,
 *   currentPassword?: string (required when changing own password)
 * }
 */
router.put('/admins/:id/password', adminManagementController.changeAdminPassword);

/**
 * @route   DELETE /api/admin/admins/:id
 * @desc    Delete admin account
 * @access  Private (Admin only)
 * @param   id - Admin ID (MongoDB ObjectId)
 */
router.delete('/admins/:id', adminManagementController.deleteAdmin);

// Error handling middleware specific to user management routes
router.use((error, req, res, next) => {
    logger.error('Admin user management route error', error, {
        method: req.method,
        path: req.path,
        adminId: req.admin?.adminId,
        body: req.body
    });

    // Handle specific error types
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: Object.values(error.errors).map(err => err.message)
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    if (error.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry - email already exists'
        });
    }

    // Pass to global error handler
    next(error);
});

export default router;
