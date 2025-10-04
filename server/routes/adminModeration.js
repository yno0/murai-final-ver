import express from 'express';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import FlaggedContent from '../models/flaggedContentModel.js';
import ResponseUtil from '../utils/response.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.use(authenticateAdmin);

/**
 * GET /api/admin/moderation/flagged
 */
router.get('/flagged', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
    const { status, domain, language, severity, search, startDate, endDate, minConfidence } = req.query;

    const filter = { $or: [{ isActive: true }, { isActive: { $exists: false } }] };
    if (status && status !== 'undefined') filter.status = status;
    if (domain && domain !== 'undefined') filter['metadata.domain'] = domain;
    if (language && language !== 'undefined') filter.language = language;
    if (severity && severity !== 'undefined') filter['metadata.severity'] = severity;
    if (search) {
      filter.$or = [
        { detectedWord: { $regex: search, $options: 'i' } },
        { context: { $regex: search, $options: 'i' } },
        { sourceUrl: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (minConfidence) filter.confidenceScore = { $gte: Number(minConfidence) };

    // Debug logging
    console.log('🔍 Admin flagged content filter (UPDATED):', JSON.stringify(filter, null, 2));
    console.log('🔍 Query params:', req.query);

    const [content, total] = await Promise.all([
      FlaggedContent.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      FlaggedContent.countDocuments(filter)
    ]);

    console.log(`🔍 Found ${content.length} content items, total: ${total}`);

    ResponseUtil.success(res, { content, pagination: { page, limit, total } }, 'Flagged content retrieved');
  } catch (error) {
    logger.error('Admin flagged content fetch failed', error);
    ResponseUtil.error(res, 'Failed to retrieve flagged content', 500, error);
  }
});

export default router;

