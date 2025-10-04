import express from 'express';
import dictionaryController from '../controllers/dictionaryController.js';
import { authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Public endpoint for extension dictionary fetching (no auth required)
/**
 * @route   GET /api/dictionary/extension/words
 * @desc    Get dictionary words for extension use (public endpoint)
 * @access  Public
 * @query   {
 *   language: string ("Filipino" | "English") - required
 * }
 */
router.get('/extension/words', dictionaryController.getExtensionWords);

// Apply authentication middleware to all other routes
router.use(authenticateToken);

// Logging middleware for dictionary routes
router.use((req, res, next) => {
    logger.info('Dictionary API request', {
        method: req.method,
        path: req.path,
        userId: req.user?.userId,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
    });
    next();
});

/**
 * @route   POST /api/dictionary
 * @desc    Add a new word to the dictionary
 * @access  Private (requires authentication)
 * @body    {
 *   word: string,
 *   language: string ("Filipino" | "English"),
 *   variations?: string[],
 *   category: string ("profanity" | "slur" | "bullying" | "sexual" | "other")
 * }
 */
router.post('/', dictionaryController.addWord);

/**
 * @route   GET /api/dictionary
 * @desc    Get dictionary words with filtering and pagination
 * @access  Private (requires authentication)
 * @query   {
 *   language: string ("Filipino" | "English") - required,
 *   category?: string ("profanity" | "slur" | "bullying" | "sexual" | "other"),
 *   page?: number (default: 1),
 *   limit?: number (default: 100, max: 1000)
 * }
 */
router.get('/', dictionaryController.getDictionary);

/**
 * @route   GET /api/dictionary/search
 * @desc    Search dictionary words
 * @access  Private (requires authentication)
 * @query   {
 *   term: string - required,
 *   language: string ("Filipino" | "English") - required
 * }
 */
router.get('/search', dictionaryController.searchWords);

/**
 * @route   GET /api/dictionary/detection
 * @desc    Get words optimized for detection (used by extension)
 * @access  Private (requires authentication)
 * @query   {
 *   language: string ("Filipino" | "English") - required
 * }
 */
router.get('/detection', dictionaryController.getDetectionWords);

/**
 * @route   GET /api/dictionary/stats
 * @desc    Get dictionary statistics
 * @access  Private (requires authentication)
 */
router.get('/stats', dictionaryController.getStats);

/**
 * @route   PATCH /api/dictionary/:id/status
 * @desc    Update word status (activate/deactivate)
 * @access  Private (requires authentication)
 * @param   id - Word ID (MongoDB ObjectId)
 * @body    {
 *   isActive: boolean
 * }
 */
router.patch('/:id/status', dictionaryController.updateWordStatus);

/**
 * @route   PUT /api/dictionary/:id/variations
 * @desc    Update word variations
 * @access  Private (requires authentication)
 * @param   id - Word ID (MongoDB ObjectId)
 * @body    {
 *   variations: string[]
 * }
 */
router.put('/:id/variations', dictionaryController.updateWordVariations);

/**
 * @route   GET /api/dictionary/with-variations
 * @desc    Get words that have variations (for synonym management)
 * @access  Private (requires authentication)
 * @query   {
 *   language?: string ("Filipino" | "English"),
 *   category?: string ("profanity" | "slur" | "bullying" | "sexual" | "other"),
 *   page?: number (default: 1),
 *   limit?: number (default: 100, max: 1000)
 * }
 */
router.get('/with-variations', dictionaryController.getWordsWithVariations);

/**
 * @route   DELETE /api/dictionary/:id
 * @desc    Delete a word from dictionary
 * @access  Private (requires authentication)
 * @param   id - Word ID (MongoDB ObjectId)
 */
router.delete('/:id', dictionaryController.deleteWord);

// Error handling middleware specific to dictionary routes
router.use((error, req, res, next) => {
    logger.error('Dictionary route error', error, {
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
