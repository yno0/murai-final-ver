import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import passport from './passport.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import middleware
import { corsConfig } from './cors.js';
import { sessionConfig } from './session.js';
import { rateLimitConfig } from './rateLimit.js';
import { requestLogger, errorLogger } from '../middleware/requestLogger.js';
import logger from '../utils/logger.js';
import ResponseUtil from '../utils/response.js';

// Import routes
import authRoutes from "../routes/auth.js";
import adminAuthRoutes from "../routes/adminAuth.js";
import dashboardRoutes from "../routes/dashboard.js";

import emailRoutes from "../routes/email.js";
import extensionSettingsRoutes from "../routes/extensionSettings.js";
import reportRoutes from "../routes/reports.js";
import flaggedContentRoutes from "../routes/flaggedContent.js";
import dictionaryRoutes from "../routes/dictionary.js";
import logRoutes from "../routes/logs.js";
import adminLogsRoutes from "../routes/adminLogs.js";
import adminModerationRoutes from "../routes/adminModeration.js";
import adminDictionaryRoutes from "../routes/adminDictionary.js";
import adminUsersRoutes from "../routes/adminUsers.js";
import adminReportsRoutes from "../routes/adminReports.js";
import adminIntegrationsRoutes from "../routes/adminIntegrations.js";

export function createApp() {
    const app = express();

    // Security middleware
    app.use(helmet());
    
    // CORS configuration
    app.use(cors(corsConfig));
    
    // Explicitly handle preflight requests
    app.options('*', (req, res) => {
        console.log('🔗 Preflight request from:', req.headers.origin);
        console.log('🔗 Requested headers:', req.headers['access-control-request-headers']);
        console.log('🔗 Requested method:', req.headers['access-control-request-method']);

        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Extension-Version,X-Requested-With,Accept,Origin,User-Agent,DNT,Cache-Control,X-Mx-ReqToken,Keep-Alive');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400'); // 24 hours
        res.sendStatus(200);
    });

    // Rate limiting
    app.use(rateLimit(rateLimitConfig));

    // Additional CORS headers middleware
    app.use((req, res, next) => {
        const origin = req.headers.origin;

        // Set CORS headers for all responses
        if (origin) {
            const allowedDomains = [
                'http://localhost:5173',
                'https://www.facebook.com',
                'https://facebook.com',
                'https://www.reddit.com',
                'https://reddit.com',
                'https://twitter.com',
                'https://www.twitter.com',
                'https://x.com',
                'https://www.x.com',
                'https://instagram.com',
                'https://www.instagram.com',
                'https://youtube.com',
                'https://www.youtube.com',
                'https://linkedin.com',
                'https://www.linkedin.com'
            ];

            if (allowedDomains.includes(origin) || origin.startsWith('chrome-extension://')) {
                res.header('Access-Control-Allow-Origin', origin);
                res.header('Access-Control-Allow-Credentials', 'true');
            }
        }

        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Extension-Version,X-Requested-With,Accept,Origin,User-Agent,DNT,Cache-Control,X-Mx-ReqToken,Keep-Alive');

        next();
    });

    // Request logging middleware
    app.use(requestLogger);

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Session configuration
    app.use(session(sessionConfig));

    // Initialize Passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Serve static files from frontend build (if SERVE_FRONTEND is enabled)
    if (process.env.SERVE_FRONTEND === 'true') {
        console.log('🔍 Current working directory:', process.cwd());
        console.log('🔍 __dirname:', __dirname);

        // Try multiple possible paths for the dist folder
        const possiblePaths = [
            path.join(__dirname, '..', 'dist'),                 // server/config -> server/dist (copied during build)
            path.join(__dirname, '..', '..', 'dist'),           // server/config -> root/dist
            path.join(process.cwd(), 'dist'),                   // server/dist (if cwd is server)
            path.join(process.cwd(), '..', 'dist'),             // server -> root/dist
            '/opt/render/project/src/dist',                     // Render absolute path
            '/opt/render/project/src/server/dist'               // Render server/dist path
        ];

        let frontendPath = null;

        for (const testPath of possiblePaths) {
            console.log('🔍 Testing path:', testPath);
            if (fs.existsSync(testPath)) {
                frontendPath = testPath;
                console.log('✅ Frontend dist folder found at:', frontendPath);
                break;
            }
        }

        if (frontendPath) {
            app.use(express.static(frontendPath));
            console.log('✅ Static files middleware configured');
        } else {
            console.log('❌ Frontend dist folder not found in any expected location');
            console.log('📁 Available directories:');
            possiblePaths.forEach(testPath => {
                const dir = path.dirname(testPath);
                if (fs.existsSync(dir)) {
                    try {
                        const contents = fs.readdirSync(dir);
                        console.log(`📂 ${dir}: [${contents.join(', ')}]`);
                    } catch (e) {
                        console.log(`📂 ${dir}: Error reading directory`);
                    }
                }
            });
        }
    }

    // Health check endpoint
    app.get('/health', (req, res) => {
        logger.info('Health check requested');
        ResponseUtil.success(res, {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '1.0.0',
            servingFrontend: process.env.SERVE_FRONTEND === 'true'
        }, "Server is running");
    });

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/admin/auth', adminAuthRoutes);
    app.use('/api/admin/dashboard', dashboardRoutes);
    app.use('/api/admin/logs', adminLogsRoutes);
    app.use('/api/admin/moderation', adminModerationRoutes);
    app.use('/api/admin/dictionary', adminDictionaryRoutes);
    app.use('/api/admin/reports', adminReportsRoutes);
    app.use('/api/admin/integrations', adminIntegrationsRoutes);
    // User management routes - must be last among admin routes to avoid conflicts
    app.use('/api/admin', adminUsersRoutes);

    app.use('/api/email', emailRoutes);
    app.use('/api/extension-settings', extensionSettingsRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/flagged-content', flaggedContentRoutes);
    app.use('/api/dictionary', dictionaryRoutes);
    app.use('/api/logs', logRoutes);

    // Error logging middleware (before error handlers)
    app.use(errorLogger);

    // Serve React app for all non-API routes (if serving frontend)
    if (process.env.SERVE_FRONTEND === 'true') {
        app.get('*', (req, res) => {
            // Don't serve index.html for API routes
            if (req.path.startsWith('/api/')) {
                logger.warn('API route not found', {
                    method: req.method,
                    url: req.url,
                    ip: req.ip || req.connection.remoteAddress
                });
                return ResponseUtil.notFound(res, "API route not found");
            }

            // Serve React app for all other routes
            const possibleIndexPaths = [
                path.join(__dirname, '..', 'dist', 'index.html'),                 // server/config -> server/dist/index.html
                path.join(__dirname, '..', '..', 'dist', 'index.html'),           // server/config -> root/dist/index.html
                path.join(process.cwd(), 'dist', 'index.html'),                   // server/dist/index.html
                path.join(process.cwd(), '..', 'dist', 'index.html'),             // server -> root/dist/index.html
                '/opt/render/project/src/dist/index.html',                        // Render absolute path
                '/opt/render/project/src/server/dist/index.html'                  // Render server/dist path
            ];

            let frontendIndexPath = null;

            for (const testPath of possibleIndexPaths) {
                if (fs.existsSync(testPath)) {
                    frontendIndexPath = testPath;
                    break;
                }
            }

            if (frontendIndexPath) {
                console.log('🔍 Serving index.html from:', frontendIndexPath);
                res.sendFile(frontendIndexPath, (err) => {
                    if (err) {
                        logger.error('Error serving frontend:', err);
                        console.log('❌ Failed to serve index.html from:', frontendIndexPath);
                        ResponseUtil.error(res, "Frontend not available", 500);
                    }
                });
            } else {
                console.log('❌ index.html not found in any expected location');
                ResponseUtil.error(res, "Frontend not available", 500);
            }
        });
    } else {
        // 404 handler when not serving frontend
        app.use('*', (req, res) => {
            logger.warn('Route not found', {
                method: req.method,
                url: req.url,
                ip: req.ip || req.connection.remoteAddress
            });
            ResponseUtil.notFound(res, "Route not found");
        });
    }

    // Global error handler
    app.use((err, req, res, next) => {
        logger.error('Unhandled error in global handler', err, {
            method: req.method,
            url: req.url,
            userId: req.user?.userId
        });

        // Don't send response if headers already sent
        if (res.headersSent) {
            return next(err);
        }

        ResponseUtil.error(res, "Internal server error", 500, err);
    });

    return app;
}
