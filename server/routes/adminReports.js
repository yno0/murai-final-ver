import express from 'express';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import {
    getAdminReports,
    exportReports,
    updateReportStatus,
    resolveReport,
    getReportStats,
    getOverdueReports,
    bulkUpdateReports
} from '../controllers/reportController.js';
import ResponseUtil from '../utils/response.js';
import logger from '../utils/logger.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateAdmin);

/**
 * GET /api/admin/reports
 * Get all reports with filtering, search, and pagination
 */
router.get('/', async (req, res) => {
    try {
        logger.info('Admin reports fetch requested', {
            query: req.query,
            adminId: req.admin?.adminId
        });

        await getAdminReports(req, res);
    } catch (error) {
        logger.error('Admin reports fetch failed', error);
        ResponseUtil.error(res, 'Failed to retrieve reports', 500, error);
    }
});

/**
 * GET /api/admin/reports/export
 * Export reports to CSV
 */
router.get('/export', async (req, res) => {
    try {
        logger.info('Admin reports export requested', {
            query: req.query,
            adminId: req.admin?.adminId
        });

        await exportReports(req, res);
    } catch (error) {
        logger.error('Admin reports export failed', error);
        ResponseUtil.error(res, 'Failed to export reports', 500, error);
    }
});

/**
 * GET /api/admin/reports/stats
 * Get report statistics
 */
router.get('/stats', async (req, res) => {
    try {
        logger.info('Admin reports stats requested', {
            query: req.query,
            adminId: req.user._id
        });
        
        await getReportStats(req, res);
    } catch (error) {
        logger.error('Admin reports stats failed', error);
        ResponseUtil.error(res, 'Failed to retrieve report statistics', 500, error);
    }
});

/**
 * GET /api/admin/reports/overdue
 * Get overdue reports
 */
router.get('/overdue', async (req, res) => {
    try {
        logger.info('Admin overdue reports requested', {
            adminId: req.user._id
        });
        
        await getOverdueReports(req, res);
    } catch (error) {
        logger.error('Admin overdue reports fetch failed', error);
        ResponseUtil.error(res, 'Failed to retrieve overdue reports', 500, error);
    }
});

/**
 * PUT /api/admin/reports/:reportId/status
 * Update report status
 */
router.put('/:reportId/status', async (req, res) => {
    try {
        logger.info('Admin report status update requested', {
            reportId: req.params.reportId,
            body: req.body,
            adminId: req.user._id
        });
        
        await updateReportStatus(req, res);
    } catch (error) {
        logger.error('Admin report status update failed', error);
        ResponseUtil.error(res, 'Failed to update report status', 500, error);
    }
});

/**
 * PUT /api/admin/reports/:reportId/resolve
 * Resolve a report
 */
router.put('/:reportId/resolve', async (req, res) => {
    try {
        logger.info('Admin report resolution requested', {
            reportId: req.params.reportId,
            body: req.body,
            adminId: req.user._id
        });
        
        await resolveReport(req, res);
    } catch (error) {
        logger.error('Admin report resolution failed', error);
        ResponseUtil.error(res, 'Failed to resolve report', 500, error);
    }
});

/**
 * POST /api/admin/reports/bulk
 * Bulk update reports
 */
router.post('/bulk', async (req, res) => {
    try {
        logger.info('Admin bulk report update requested', {
            body: req.body,
            adminId: req.user._id
        });
        
        await bulkUpdateReports(req, res);
    } catch (error) {
        logger.error('Admin bulk report update failed', error);
        ResponseUtil.error(res, 'Failed to perform bulk operation', 500, error);
    }
});

export default router;
