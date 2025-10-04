import express from 'express';
import flaggedContentController from '../controllers/flaggedContentController.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Logging middleware for flagged content routes
router.use((req, res, next) => {
    logger.info('Flagged Content API request', {
        method: req.method,
        path: req.path,
        userId: req.user?.userId,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        extensionVersion: req.headers['x-extension-version']
    });
    next();
});

/**
 * @route   POST /api/flagged-content
 * @desc    Submit a new flagged content detection
 * @access  Private (requires authentication)
 * @body    {
 *   language: string ("Filipino" | "English" | "Mixed"),
 *   detectedWord: string,
 *   context: string,
 *   sentiment?: string ("positive" | "negative" | "neutral"),
 *   confidenceScore: number (0-1),
 *   sourceUrl: string,
 *   detectionMethod?: string,
 *   aiModel?: string,
 *   processingTime?: number,
 *   severity?: string
 * }
 */
router.post('/', flaggedContentController.createFlaggedContent);

/**
 * @route   GET /api/flagged-content
 * @desc    Get user's flagged content with pagination and filtering
 * @access  Private (requires authentication)
 * @query   {
 *   page?: number (default: 1),
 *   limit?: number (default: 20, max: 50),
 *   status?: string ('flagged', 'reviewed', 'ignored'),
 *   domain?: string,
 *   language?: string ('Filipino', 'English', 'Mixed'),
 *   startDate?: string (ISO date),
 *   endDate?: string (ISO date),
 *   minConfidence?: number (0-1)
 * }
 */
router.get('/', flaggedContentController.getUserFlaggedContent);

/**
 * @route   GET /api/flagged-content/analytics
 * @desc    Get user's flagged content analytics
 * @access  Private (requires authentication)
 * @query   {
 *   days?: number (default: 30)
 * }
 */
router.get('/analytics', flaggedContentController.getAnalytics);

/**
 * @route   GET /api/flagged-content/:id
 * @desc    Get a specific flagged content by ID
 * @access  Private (requires authentication)
 * @param   id - Flagged Content ID (MongoDB ObjectId)
 */
router.get('/:id', flaggedContentController.getFlaggedContentById);

/**
 * @route   PATCH /api/flagged-content/:id/status
 * @desc    Update flagged content status (review, ignore)
 * @access  Private (requires authentication)
 * @param   id - Flagged Content ID
 * @body    { 
 *   status: 'reviewed' | 'ignored',
 *   reviewNotes?: string
 * }
 */
router.patch('/:id/status', flaggedContentController.updateFlaggedContentStatus);

/**
 * @route   DELETE /api/flagged-content/:id
 * @desc    Delete flagged content (soft delete)
 * @access  Private (requires authentication)
 * @param   id - Flagged Content ID
 */
router.delete('/:id', flaggedContentController.deleteFlaggedContent);

// Error handling middleware specific to flagged content routes
router.use((error, req, res, next) => {
    logger.error('Flagged Content route error', error, {
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
