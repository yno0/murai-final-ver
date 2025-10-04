import FlaggedContent from '../models/flaggedContentModel.js';
import Log from '../models/logModel.js';
import Dictionary from '../models/dictionaryModel.js';
import ResponseUtil from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * Flagged Content Controller
 * Handles flagged content submissions and management
 */
class FlaggedContentController {
    /**
     * Create a new flagged content record
     * POST /api/flagged-content
     */
    async createFlaggedContent(req, res) {
        try {
            const userId = req.user.userId;
            const {
                language,
                detectedWord,
                context,
                sentiment,
                confidenceScore,
                sourceUrl,
                detectionMethod,
                aiModel,
                processingTime,
                severity
            } = req.body;

            // Validate required fields
            if (!language || !detectedWord || !context || !sourceUrl || confidenceScore === undefined) {
                return ResponseUtil.badRequest(res, 'Missing required fields: language, detectedWord, context, sourceUrl, confidenceScore');
            }

            // Validate confidence score
            if (confidenceScore < 0 || confidenceScore > 1) {
                return ResponseUtil.badRequest(res, 'Confidence score must be between 0 and 1');
            }

            // Create flagged content
            const flaggedContent = await FlaggedContent.createFlaggedContent({
                userId,
                language,
                detectedWord,
                context,
                sentiment: sentiment || 'neutral',
                confidenceScore,
                sourceUrl,
                detectionMethod: detectionMethod || 'hybrid',
                aiModel: aiModel || 'roberta-v1',
                processingTime: processingTime || 0,
                extensionVersion: req.headers['x-extension-version'],
                userAgent: req.headers['user-agent'],
                severity: severity || 'medium'
            });

            // Record detection in dictionary
            await Dictionary.recordDetection(detectedWord, language);

            // Log the flagged content creation
            await Log.createLog({
                action: 'content_flagged',
                details: `Content flagged: "${detectedWord}" in ${language}`,
                userId,
                metadata: {
                    flaggedContentId: flaggedContent._id,
                    domain: flaggedContent.metadata.domain,
                    confidence: confidenceScore,
                    method: detectionMethod,
                    ip: req.ip,
                    userAgent: req.headers['user-agent']
                }
            });

            logger.info('Flagged content created successfully', {
                flaggedContentId: flaggedContent._id,
                userId,
                domain: flaggedContent.metadata.domain,
                detectedWord,
                confidence: confidenceScore
            });

            ResponseUtil.success(res, flaggedContent, 'Content flagged successfully', 201);

        } catch (error) {
            logger.error('Error creating flagged content', error, {
                userId: req.user?.userId,
                body: req.body
            });

            if (error.name === 'ValidationError') {
                return ResponseUtil.badRequest(res, `Validation error: ${error.message}`);
            }

            ResponseUtil.error(res, 'Failed to create flagged content', 500, error);
        }
    }

    /**
     * Get user's flagged content with pagination
     * GET /api/flagged-content?page=1&limit=20&status=flagged
     */
    async getUserFlaggedContent(req, res) {
        try {
            const userId = req.user.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = Math.min(parseInt(req.query.limit) || 20, 50); // Max 50 per page
            const status = req.query.status;
            const domain = req.query.domain;
            const language = req.query.language;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const minConfidence = req.query.minConfidence ? parseFloat(req.query.minConfidence) : null;

            const result = await FlaggedContent.getUserFlaggedContent(userId, {
                page,
                limit,
                status,
                domain,
                language,
                startDate,
                endDate,
                minConfidence
            });

            ResponseUtil.success(res, result, 'Flagged content retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving user flagged content', error, {
                userId: req.user?.userId,
                query: req.query
            });

            ResponseUtil.error(res, 'Failed to retrieve flagged content', 500, error);
        }
    }

    /**
     * Get a specific flagged content by ID
     * GET /api/flagged-content/:id
     */
    async getFlaggedContentById(req, res) {
        try {
            const userId = req.user.userId;
            const contentId = req.params.id;

            const flaggedContent = await FlaggedContent.findOne({
                _id: contentId,
                userId,
                isActive: true
            }).select('-__v').lean();

            if (!flaggedContent) {
                return ResponseUtil.notFound(res, 'Flagged content not found');
            }

            ResponseUtil.success(res, flaggedContent, 'Flagged content retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving flagged content by ID', error, {
                userId: req.user?.userId,
                contentId: req.params.id
            });

            ResponseUtil.error(res, 'Failed to retrieve flagged content', 500, error);
        }
    }

    /**
     * Update flagged content status
     * PATCH /api/flagged-content/:id/status
     */
    async updateFlaggedContentStatus(req, res) {
        try {
            const userId = req.user.userId;
            const contentId = req.params.id;
            const { status, reviewNotes } = req.body;

            if (!['reviewed', 'ignored'].includes(status)) {
                return ResponseUtil.badRequest(res, 'Invalid status. Must be: reviewed or ignored');
            }

            const flaggedContent = await FlaggedContent.findOne({
                _id: contentId,
                userId,
                isActive: true
            });

            if (!flaggedContent) {
                return ResponseUtil.notFound(res, 'Flagged content not found');
            }

            // Update status using model methods
            if (status === 'reviewed') {
                await flaggedContent.markAsReviewed(userId, reviewNotes);
            } else if (status === 'ignored') {
                await flaggedContent.ignore();
            }

            // Log the status update
            await Log.createLog({
                action: 'content_reviewed',
                details: `Flagged content marked as ${status}`,
                userId,
                metadata: {
                    flaggedContentId: contentId,
                    newStatus: status,
                    reviewNotes: reviewNotes || '',
                    ip: req.ip
                }
            });

            logger.info('Flagged content status updated', {
                flaggedContentId: contentId,
                userId,
                newStatus: status
            });

            ResponseUtil.success(res, flaggedContent, `Content ${status} successfully`);

        } catch (error) {
            logger.error('Error updating flagged content status', error, {
                userId: req.user?.userId,
                contentId: req.params.id,
                status: req.body.status
            });

            ResponseUtil.error(res, 'Failed to update flagged content status', 500, error);
        }
    }

    /**
     * Delete flagged content (soft delete)
     * DELETE /api/flagged-content/:id
     */
    async deleteFlaggedContent(req, res) {
        try {
            const userId = req.user.userId;
            const contentId = req.params.id;

            const flaggedContent = await FlaggedContent.findOne({
                _id: contentId,
                userId,
                isActive: true
            });

            if (!flaggedContent) {
                return ResponseUtil.notFound(res, 'Flagged content not found');
            }

            await flaggedContent.softDelete();

            logger.info('Flagged content deleted', {
                flaggedContentId: contentId,
                userId
            });

            ResponseUtil.success(res, null, 'Flagged content deleted successfully');

        } catch (error) {
            logger.error('Error deleting flagged content', error, {
                userId: req.user?.userId,
                contentId: req.params.id
            });

            ResponseUtil.error(res, 'Failed to delete flagged content', 500, error);
        }
    }

    /**
     * Get user analytics
     * GET /api/flagged-content/analytics
     */
    async getAnalytics(req, res) {
        try {
            const userId = req.user.userId;
            const days = parseInt(req.query.days) || 30;

            const analytics = await FlaggedContent.getAnalytics(userId, days);

            ResponseUtil.success(res, analytics, 'Analytics retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving analytics', error, {
                userId: req.user?.userId
            });

            ResponseUtil.error(res, 'Failed to retrieve analytics', 500, error);
        }
    }
}

export default new FlaggedContentController();
