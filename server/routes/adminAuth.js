import express from 'express';
import { body, validationResult } from 'express-validator';
import {
    adminLogin,
    getCurrentAdmin,
    adminLogout,
    updateAdminProfile,
    changeAdminPassword,
    getActiveSessions,
    terminateSession,
    terminateAllSessions,
    getLoginHistory,
    getSecuritySettings,
    updateSecuritySettings
} from '../controllers/adminAuthController.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Admin login validation
const adminLoginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 1 })
        .withMessage('Password is required')
];

// Admin profile update validation
const adminProfileValidation = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('department')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Department must be between 2 and 100 characters')
];

// Admin password change validation
const adminPasswordChangeValidation = [
    body('currentPassword')
        .isLength({ min: 1 })
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Routes

/**
 * @route   POST /api/admin/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', adminLoginValidation, handleValidationErrors, adminLogin);

/**
 * @route   GET /api/admin/auth/me
 * @desc    Get current admin user
 * @access  Private (Admin)
 */
router.get('/me', authenticateAdmin, getCurrentAdmin);

/**
 * @route   POST /api/admin/auth/logout
 * @desc    Admin logout
 * @access  Private (Admin)
 */
router.post('/logout', authenticateAdmin, adminLogout);

/**
 * @route   PUT /api/admin/auth/profile
 * @desc    Update admin profile
 * @access  Private (Admin)
 */
router.put('/profile', authenticateAdmin, adminProfileValidation, handleValidationErrors, updateAdminProfile);

/**
 * @route   PUT /api/admin/auth/change-password
 * @desc    Change admin password
 * @access  Private (Admin)
 */
router.put('/change-password', authenticateAdmin, adminPasswordChangeValidation, handleValidationErrors, changeAdminPassword);

/**
 * @route   GET /api/admin/auth/sessions
 * @desc    Get active sessions for current admin
 * @access  Private (Admin)
 */
router.get('/sessions', authenticateAdmin, getActiveSessions);

/**
 * @route   DELETE /api/admin/auth/sessions/:sessionId
 * @desc    Terminate a specific session
 * @access  Private (Admin)
 */
router.delete('/sessions/:sessionId', authenticateAdmin, terminateSession);

/**
 * @route   POST /api/admin/auth/sessions/terminate-all
 * @desc    Terminate all sessions except current
 * @access  Private (Admin)
 */
router.post('/sessions/terminate-all', authenticateAdmin, terminateAllSessions);

/**
 * @route   GET /api/admin/auth/login-history
 * @desc    Get login history for current admin
 * @access  Private (Admin)
 */
router.get('/login-history', authenticateAdmin, getLoginHistory);

/**
 * @route   GET /api/admin/auth/security-settings
 * @desc    Get security settings for current admin
 * @access  Private (Admin)
 */
router.get('/security-settings', authenticateAdmin, getSecuritySettings);

/**
 * @route   PUT /api/admin/auth/security-settings
 * @desc    Update security settings for current admin
 * @access  Private (Admin)
 */
router.put('/security-settings', authenticateAdmin, updateSecuritySettings);

export default router;
