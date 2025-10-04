import Log from '../models/logModel.js';
import ResponseUtil from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * Log Controller
 * Handles system monitoring and user activity logs
 */
class LogController {
    /**
     * Get user activity logs
     * GET /api/logs/user?page=1&limit=50&action=user_login
     */
    async getUserLogs(req, res) {
        try {
            const userId = req.user.userId;
            const {
                page = 1,
                limit = 50,
                action,
                startDate,
                endDate,
                severity
            } = req.query;

            const result = await Log.getUserLogs(userId, {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 100), // Max 100 per page
                action,
                startDate,
                endDate,
                severity
            });

            ResponseUtil.success(res, result, 'User logs retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving user logs', error, {
                userId: req.user?.userId,
                query: req.query
            });

            ResponseUtil.error(res, 'Failed to retrieve user logs', 500, error);
        }
    }

    /**
     * Get system logs (admin only)
     * GET /api/logs/system?page=1&limit=100&severity=high
     */
    async getSystemLogs(req, res) {
        try {
            // Check if user has admin role
            if (req.user.role !== 'admin') {
                return ResponseUtil.forbidden(res, 'Access denied. Admin role required.');
            }

            const {
                page = 1,
                limit = 100,
                severity,
                startDate,
                endDate
            } = req.query;

            const result = await Log.getSystemLogs({
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 200), // Max 200 per page for admins
                severity,
                startDate,
                endDate
            });

            ResponseUtil.success(res, result, 'System logs retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving system logs', error, {
                userId: req.user?.userId,
                query: req.query
            });

            ResponseUtil.error(res, 'Failed to retrieve system logs', 500, error);
        }
    }

    /**
     * Get user activity statistics
     * GET /api/logs/stats?days=30
     */
    async getActivityStats(req, res) {
        try {
            const userId = req.user.userId;
            const days = parseInt(req.query.days) || 30;

            // Limit to reasonable range
            if (days < 1 || days > 365) {
                return ResponseUtil.badRequest(res, 'Days must be between 1 and 365');
            }

            const stats = await Log.getActivityStats(userId, days);

            ResponseUtil.success(res, { stats }, 'Activity statistics retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving activity statistics', error, {
                userId: req.user?.userId,
                query: req.query
            });

            ResponseUtil.error(res, 'Failed to retrieve activity statistics', 500, error);
        }
    }

    /**
     * Create a manual log entry
     * POST /api/logs
     */
    async createLog(req, res) {
        try {
            const userId = req.user.userId;
            const { action, details, metadata = {}, isSystemLog = false } = req.body;

            // Validate required fields
            if (!action || !details) {
                return ResponseUtil.badRequest(res, 'Missing required fields: action, details');
            }

            // Validate action enum
            const validActions = [
                'scan_started', 'flagged_detected', 'user_login', 'user_logout',
                'user_register', 'settings_updated', 'content_flagged', 'content_reviewed',
                'whitelist_updated', 'dictionary_updated', 'ai_analysis_completed',
                'extension_installed', 'extension_uninstalled', 'detection_dismissed',
                'detection_reported', 'system_error', 'api_request', 'other'
            ];

            if (!validActions.includes(action)) {
                return ResponseUtil.badRequest(res, `Invalid action. Must be one of: ${validActions.join(', ')}`);
            }

            // Only admins can create system logs
            if (isSystemLog && req.user.role !== 'admin') {
                return ResponseUtil.forbidden(res, 'Only admins can create system logs');
            }

            // Add request metadata
            const enhancedMetadata = {
                ...metadata,
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                extensionVersion: req.headers['x-extension-version']
            };

            const log = await Log.createLog({
                action,
                details,
                userId,
                metadata: enhancedMetadata,
                isSystemLog
            });

            logger.info('Manual log entry created', {
                logId: log._id,
                action,
                userId,
                isSystemLog
            });

            ResponseUtil.success(res, log, 'Log entry created successfully', 201);

        } catch (error) {
            logger.error('Error creating log entry', error, {
                userId: req.user?.userId,
                body: req.body
            });

            if (error.name === 'ValidationError') {
                return ResponseUtil.badRequest(res, `Validation error: ${error.message}`);
            }

            ResponseUtil.error(res, 'Failed to create log entry', 500, error);
        }
    }

    /**
     * Get log entry by ID
     * GET /api/logs/:id
     */
    async getLogById(req, res) {
        try {
            const userId = req.user.userId;
            const logId = req.params.id;

            // Build query based on user role
            const query = { _id: logId };
            
            // Non-admin users can only see their own logs
            if (req.user.role !== 'admin') {
                query.userId = userId;
            }

            const log = await Log.findOne(query).lean();

            if (!log) {
                return ResponseUtil.notFound(res, 'Log entry not found');
            }

            ResponseUtil.success(res, log, 'Log entry retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving log by ID', error, {
                userId: req.user?.userId,
                logId: req.params.id
            });

            ResponseUtil.error(res, 'Failed to retrieve log entry', 500, error);
        }
    }

    /**
     * Delete old logs (admin only)
     * DELETE /api/logs/cleanup?days=90
     */
    async cleanupLogs(req, res) {
        try {
            // Check if user has admin role
            if (req.user.role !== 'admin') {
                return ResponseUtil.forbidden(res, 'Access denied. Admin role required.');
            }

            const days = parseInt(req.query.days) || 90;

            // Safety check - don't allow deletion of logs newer than 30 days
            if (days < 30) {
                return ResponseUtil.badRequest(res, 'Cannot delete logs newer than 30 days');
            }

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            const result = await Log.deleteMany({
                timestamp: { $lt: cutoffDate },
                isSystemLog: false // Never delete system logs automatically
            });

            // Log the cleanup action
            await Log.createLog({
                action: 'system_maintenance',
                details: `Cleaned up ${result.deletedCount} log entries older than ${days} days`,
                userId: req.user.userId,
                metadata: {
                    deletedCount: result.deletedCount,
                    cutoffDate: cutoffDate.toISOString(),
                    ip: req.ip
                },
                isSystemLog: true
            });

            logger.info('Log cleanup completed', {
                deletedCount: result.deletedCount,
                days,
                userId: req.user.userId
            });

            ResponseUtil.success(res, { deletedCount: result.deletedCount }, 'Log cleanup completed successfully');

        } catch (error) {
            logger.error('Error during log cleanup', error, {
                userId: req.user?.userId,
                query: req.query
            });

            ResponseUtil.error(res, 'Failed to cleanup logs', 500, error);
        }
    }
}

export default new LogController();
