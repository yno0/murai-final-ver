import express from 'express';
import {
    createReport,
    getUserReports,
    getReport,
    updateReportStatus,
    resolveReport,
    getReportStats
} from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new report
router.post('/', (req, res, next) => {
    console.log('📝 ===== REPORT ROUTE HIT =====');
    console.log('📝 Method:', req.method);
    console.log('📝 URL:', req.originalUrl);
    console.log('📝 Headers:', JSON.stringify({
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? 'Bearer [TOKEN_PRESENT]' : 'NO_AUTH',
        'user-agent': req.headers['user-agent']?.substring(0, 50) + '...'
    }, null, 2));
    console.log('📝 Body size:', JSON.stringify(req.body).length, 'characters');
    next();
}, createReport);

// Get all reports for the authenticated user
router.get('/', getUserReports);

// Get report statistics
router.get('/stats', getReportStats);

// Get a specific report by ID
router.get('/:reportId', getReport);

// Update report status (admin functionality)
router.patch('/:reportId/status', updateReportStatus);

// Resolve a report
router.patch('/:reportId/resolve', resolveReport);

export default router;
