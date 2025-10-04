import express from 'express';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import Log from '../models/logModel.js';
import ResponseUtil from '../utils/response.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Admin-only logs endpoints
router.use(authenticateAdmin);

/**
 * GET /api/admin/logs
 * Query params:
 *  - page, limit
 *  - type: admin | system | moderator | user
 *  - action: exact action string
 *  - severity: low | medium | high | critical
 *  - startDate, endDate (ISO)
 *  - search: substring match on details
 *  - sortBy: default 'timestamp'
 *  - sortOrder: 'asc' | 'desc' (default 'desc')
 */
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 200);
    const { type, action, severity, startDate, endDate, search } = req.query;

    const sortBy = (req.query.sortBy || 'timestamp').toString();
    const sortOrder = (req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const filter = {};

    // Type filter
    if (type === 'system') {
      filter.isSystemLog = true;
    } else if (type === 'admin') {
      filter.action = { $regex: /^admin_/i };
    } else if (type === 'moderator') {
      filter.$or = [
        { action: { $regex: /moderator/i } },
        { 'metadata.actorRole': 'moderator' }
      ];
    } else if (type === 'user') {
      filter.isSystemLog = { $ne: true };
      filter.action = { $not: /^admin_/i };
    }

    // Exact action filter
    if (action) filter.action = action;

    // Severity filter
    if (severity) filter['metadata.severity'] = severity;

    // Date range on timestamp field
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Search in details
    if (search) filter.details = { $regex: new RegExp(search, 'i') };

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Log.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Log.countDocuments(filter)
    ]);

    ResponseUtil.success(res, { logs, pagination: { page, limit, total } }, 'Admin logs retrieved');
  } catch (error) {
    logger.error('Admin logs fetch failed', error);
    ResponseUtil.error(res, 'Failed to retrieve logs', 500, error);
  }
});

export default router;
