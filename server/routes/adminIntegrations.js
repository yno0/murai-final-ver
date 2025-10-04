import express from 'express';
import {
  // Domain controllers
  getDomains,
  getDomainById,
  createDomain,
  updateDomain,
  deleteDomain,
  getDomainStats,
  
  // API Key controllers
  getApiKeys,
  createApiKey,
  updateApiKey,
  revokeApiKey,
  deleteApiKey,
  
  // Integration Log controllers
  getIntegrationLogs,
  getLogStats,
  
  // Usage Statistics controllers
  getUsageStatistics,
  getDashboardSummary,
  getTopPerformers
} from '../controllers/integrationController.js';

import { authenticateAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// ===== DOMAIN ROUTES =====

// Get all domains with filtering and pagination
router.get('/domains', getDomains);

// Get domain statistics
router.get('/domains/stats', getDomainStats);

// Get specific domain by ID
router.get('/domains/:id', getDomainById);

// Create new domain
router.post('/domains', createDomain);

// Update domain
router.put('/domains/:id', updateDomain);

// Delete domain
router.delete('/domains/:id', deleteDomain);

// ===== API KEY ROUTES =====

// Get all API keys with filtering and pagination
router.get('/api-keys', getApiKeys);

// Create new API key
router.post('/api-keys', createApiKey);

// Update API key
router.put('/api-keys/:id', updateApiKey);

// Revoke API key
router.post('/api-keys/:id/revoke', revokeApiKey);

// Delete API key
router.delete('/api-keys/:id', deleteApiKey);

// ===== INTEGRATION LOG ROUTES =====

// Get integration logs with filtering and pagination
router.get('/logs', getIntegrationLogs);

// Get log statistics
router.get('/logs/stats', getLogStats);

// ===== USAGE STATISTICS ROUTES =====

// Get usage statistics
router.get('/usage-stats', getUsageStatistics);

// Get dashboard summary
router.get('/usage-stats/summary', getDashboardSummary);

// Get top performers
router.get('/usage-stats/top-performers', getTopPerformers);

export default router;
