import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import {
    register,
    login,
    getCurrentUser,
    updateProfile,
    changePassword,
    logout
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import {
    validateRegister,
    validateLogin,
    validateUpdateProfile,
    validateChangePassword
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, validateUpdateProfile, updateProfile);
router.put('/change-password', authenticateToken, validateChangePassword, changePassword);
router.post('/logout', authenticateToken, logout);

// Google OAuth Routes - Always define routes, but handle missing credentials gracefully
router.get('/google', (req, res, next) => {
    // Check if Google OAuth is configured at request time
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(503).json({
            success: false,
            message: 'Google OAuth is not configured on this server',
            errorCode: 'GOOGLE_OAUTH_NOT_CONFIGURED'
        });
    }

    const callbackURL = process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;
    console.log(' Initiating Google OAuth with callback URL:', callbackURL);
    next();
}, (req, res, next) => {
    // Ensure Google strategy is registered and call passport.authenticate
    if (passport.ensureGoogleStrategy && passport.ensureGoogleStrategy()) {
        passport.authenticate('google', {
            scope: ['profile', 'email'],
            prompt: 'select_account'
        })(req, res, next);
    } else {
        res.status(503).json({
            success: false,
            message: 'Google OAuth is not configured on this server',
            errorCode: 'GOOGLE_OAUTH_NOT_CONFIGURED'
        });
    }
});

router.get('/google/callback', (req, res, next) => {
    // Check if Google OAuth is configured at request time
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(503).json({
            success: false,
            message: 'Google OAuth is not configured on this server',
            errorCode: 'GOOGLE_OAUTH_NOT_CONFIGURED'
        });
    }
    next();
}, (req, res, next) => {
    // Ensure Google strategy is registered and call passport.authenticate
    if (passport.ensureGoogleStrategy && passport.ensureGoogleStrategy()) {
        passport.authenticate('google', {
            failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`
        })(req, res, next);
    } else {
        res.status(503).json({
            success: false,
            message: 'Google OAuth is not configured on this server',
            errorCode: 'GOOGLE_OAUTH_NOT_CONFIGURED'
        });
    }
}, async (req, res) => {
    try {
        const user = req.user;

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&success=true`);

    } catch (error) {
        console.error('❌ Google OAuth callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/login?error=authentication_failed`);
    }
});

export default router;
