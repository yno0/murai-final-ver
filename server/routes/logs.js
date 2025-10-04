import express from 'express';
import logController from '../controllers/logController.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Logging middleware for log routes
router.use((req, res, next) => {
    logger.info('Logs API request', {
        method: req.method,
        path: req.path,
        userId: req.user?.userId,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
    });
    next();
});

/**
 * @route   GET /api/logs/user
 * @desc    Get user activity logs with pagination and filtering
 * @access  Private (requires authentication)
 * @query   {
 *   page?: number (default: 1),
 *   limit?: number (default: 50, max: 100),
 *   action?: string,
 *   startDate?: string (ISO date),
 *   endDate?: string (ISO date),
 *   severity?: string ("low" | "medium" | "high" | "critical")
 * }
 */
router.get('/user', logController.getUserLogs);

/**
 * @route   GET /api/logs/system
 * @desc    Get system logs (admin only)
 * @access  Private (requires authentication + admin role)
 * @query   {
 *   page?: number (default: 1),
 *   limit?: number (default: 100, max: 200),
 *   severity?: string ("low" | "medium" | "high" | "critical"),
 *   startDate?: string (ISO date),
 *   endDate?: string (ISO date)
 * }
 */
router.get('/system', logController.getSystemLogs);

/**
 * @route   GET /api/logs/stats
 * @desc    Get user activity statistics
 * @access  Private (requires authentication)
 * @query   {
 *   days?: number (default: 30, max: 365)
 * }
 */
router.get('/stats', logController.getActivityStats);

/**
 * @route   POST /api/logs
 * @desc    Create a manual log entry
 * @access  Private (requires authentication)
 * @body    {
 *   action: string,
 *   details: string,
 *   metadata?: object,
 *   isSystemLog?: boolean (admin only)
 * }
 */
router.post('/', logController.createLog);

/**
 * @route   GET /api/logs/:id
 * @desc    Get a specific log entry by ID
 * @access  Private (requires authentication)
 * @param   id - Log ID (MongoDB ObjectId)
 */
router.get('/:id', logController.getLogById);

/**
 * @route   DELETE /api/logs/cleanup
 * @desc    Delete old logs (admin only)
 * @access  Private (requires authentication + admin role)
 * @query   {
 *   days?: number (default: 90, min: 30)
 * }
 */
router.delete('/cleanup', logController.cleanupLogs);

// Error handling middleware specific to log routes
router.use((error, req, res, next) => {
    logger.error('Logs route error', error, {
        method: req.method,
        path: req.path,
        userId: req.user?.userId,
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

    // Pass to global error handler
    next(error);
});

export default router;
