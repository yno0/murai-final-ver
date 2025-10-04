import express from 'express';
import { getDashboardStats, getDashboardAnalytics } from '../controllers/dashboardController.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get dashboard overview statistics
 * @access  Private (Admin)
 */
router.get('/stats', authenticateAdmin, getDashboardStats);

/**
 * @route   GET /api/admin/dashboard/analytics
 * @desc    Get detailed analytics for charts
 * @access  Private (Admin)
 */
router.get('/analytics', authenticateAdmin, getDashboardAnalytics);

export default router;
