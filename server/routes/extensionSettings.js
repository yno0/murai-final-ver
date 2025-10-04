import express from 'express';
import {
    getSettings,
    updateSettings,
    syncSettings,
    resetSettings
} from '../controllers/extensionSettingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Individual user settings routes
router.get('/', getSettings);                    // GET /api/extension-settings
router.put('/', updateSettings);                 // PUT /api/extension-settings
router.get('/sync', syncSettings);               // GET /api/extension-settings/sync
router.post('/reset', resetSettings);            // POST /api/extension-settings/reset



export default router;
