import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';
import Log from '../models/logModel.js';

// Generate JWT Token for admin
const generateAdminToken = (adminId) => {
    return jwt.sign(
        { adminId, type: 'admin' }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Admin Login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ip = req.ip || req.connection.remoteAddress || 'Unknown';

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find admin by email
        const admin = await Admin.findByEmail(email);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is locked
        if (admin.isLocked) {
            return res.status(423).json({
                success: false,
                message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
            });
        }

        // Check if account is active
        if (admin.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is not active. Please contact system administrator.'
            });
        }

        // Verify password
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            // Increment login attempts
            await admin.incLoginAttempts();
            
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Reset login attempts on successful login
        if (admin.loginAttempts > 0) {
            await admin.resetLoginAttempts();
        }

        // Update last login info
        admin.lastLoginAt = new Date();
        admin.lastLoginIP = ip;
        await admin.save();

        // Generate token
        const token = generateAdminToken(admin._id);

        // Add session token to admin record
        await admin.addSessionToken(token, userAgent, ip);

        // Log admin login
        try {
            await Log.createLog({
                action: 'admin_login',
                details: `Admin ${admin.name} logged in successfully`,
                userId: admin._id,
                metadata: {
                    ip: ip,
                    userAgent: userAgent,
                    role: admin.role,
                    severity: 'low'
                },
                isSystemLog: true
            });
        } catch (logError) {
            console.warn('Failed to log admin login:', logError.message);
        }

        // Remove sensitive data from response
        const adminResponse = admin.toObject();
        delete adminResponse.password;
        delete adminResponse.passwordResetToken;
        delete adminResponse.twoFactorSecret;
        delete adminResponse.sessionTokens;
        delete adminResponse.loginAttempts;
        delete adminResponse.lockUntil;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                admin: adminResponse,
                token
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Current Admin
export const getCurrentAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.adminId)
            .select('-password -passwordResetToken -twoFactorSecret -sessionTokens -loginAttempts -lockUntil');
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (admin.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is not active'
            });
        }

        res.json({
            success: true,
            data: { admin }
        });

    } catch (error) {
        console.error('Get current admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Admin Logout
export const adminLogout = async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            // Remove session token from admin record
            const admin = await Admin.findById(req.admin.adminId);
            if (admin) {
                await admin.removeSessionToken(token);
                
                // Log admin logout
                await Log.createLog({
                    action: 'admin_logout',
                    details: `Admin ${admin.name} logged out`,
                    userId: admin._id,
                    metadata: {
                        ip: req.ip || 'Unknown',
                        userAgent: req.headers['user-agent'] || 'Unknown'
                    }
                });
            }
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Admin logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update Admin Profile
export const updateAdminProfile = async (req, res) => {
    try {
        const { name, phone, department } = req.body;
        const adminId = req.admin.adminId;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Update fields
        if (name) admin.name = name;
        if (phone) admin.phone = phone;
        if (department) admin.department = department;

        await admin.save();

        // Remove sensitive data from response
        const adminResponse = admin.toObject();
        delete adminResponse.password;
        delete adminResponse.passwordResetToken;
        delete adminResponse.twoFactorSecret;
        delete adminResponse.sessionTokens;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { admin: adminResponse }
        });

    } catch (error) {
        console.error('Update admin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Change Admin Password
export const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.admin.adminId;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long'
            });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password (will be hashed by pre-save middleware)
        admin.password = newPassword;
        admin.passwordChangedAt = new Date();
        await admin.save();

        // Log password change
        await Log.createLog({
            action: 'admin_password_change',
            details: `Admin ${admin.name} changed password`,
            userId: admin._id,
            metadata: {
                ip: req.ip || 'Unknown',
                userAgent: req.headers['user-agent'] || 'Unknown'
            }
        });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change admin password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Active Sessions
export const getActiveSessions = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Get active sessions from admin model
        const sessions = admin.sessionTokens || [];
        const currentToken = req.headers.authorization?.replace('Bearer ', '');

        // Format sessions for response
        const formattedSessions = sessions.map(session => ({
            id: session._id,
            device: session.userAgent || 'Unknown Device',
            ip: session.ipAddress || 'Unknown IP',
            location: 'Unknown Location', // In real app, you'd use IP geolocation
            lastActive: session.lastUsed || session.createdAt,
            current: session.token === currentToken
        }));

        res.json({
            success: true,
            data: { sessions: formattedSessions }
        });

    } catch (error) {
        console.error('Get active sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Terminate Session
export const terminateSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const admin = await Admin.findById(req.admin.adminId);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Remove the specific session
        await admin.removeSessionById(sessionId);

        res.json({
            success: true,
            message: 'Session terminated successfully'
        });

    } catch (error) {
        console.error('Terminate session error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Terminate All Sessions
export const terminateAllSessions = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.adminId);
        const currentToken = req.headers.authorization?.replace('Bearer ', '');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Keep only the current session
        admin.sessionTokens = admin.sessionTokens.filter(session => session.token === currentToken);
        await admin.save();

        res.json({
            success: true,
            message: 'All other sessions terminated successfully'
        });

    } catch (error) {
        console.error('Terminate all sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Login History
export const getLoginHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const adminId = req.admin.adminId;

        // Get login logs from Log model
        const loginLogs = await Log.find({
            userId: adminId,
            action: { $in: ['user_login', 'admin_login', 'admin_logout'] }
        })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();

        // Format login history
        const formattedHistory = loginLogs.map(log => ({
            id: log._id,
            timestamp: log.timestamp,
            ip: log.metadata?.ip || 'Unknown',
            location: 'Unknown Location', // In real app, you'd use IP geolocation
            device: log.metadata?.userAgent || 'Unknown Device',
            success: log.action.includes('login') && !log.action.includes('failed'),
            action: log.action
        }));

        res.json({
            success: true,
            data: {
                history: formattedHistory,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: loginLogs.length
                }
            }
        });

    } catch (error) {
        console.error('Get login history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Security Settings
export const getSecuritySettings = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Return security settings (with defaults)
        const securitySettings = {
            sessionTimeout: admin.securitySettings?.sessionTimeout || 30,
            maxSessions: admin.securitySettings?.maxSessions || 5,
            requirePasswordChange: admin.securitySettings?.requirePasswordChange || false,
            loginNotifications: admin.securitySettings?.loginNotifications || true,
            lastPasswordChange: admin.passwordChangedAt,
            accountCreated: admin.createdAt,
            lastLogin: admin.lastLoginAt
        };

        res.json({
            success: true,
            data: { settings: securitySettings }
        });

    } catch (error) {
        console.error('Get security settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update Security Settings
export const updateSecuritySettings = async (req, res) => {
    try {
        const { sessionTimeout, maxSessions, requirePasswordChange, loginNotifications } = req.body;
        const admin = await Admin.findById(req.admin.adminId);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Update security settings
        admin.securitySettings = {
            ...admin.securitySettings,
            sessionTimeout: sessionTimeout || admin.securitySettings?.sessionTimeout || 30,
            maxSessions: maxSessions || admin.securitySettings?.maxSessions || 5,
            requirePasswordChange: requirePasswordChange !== undefined ? requirePasswordChange : admin.securitySettings?.requirePasswordChange || false,
            loginNotifications: loginNotifications !== undefined ? loginNotifications : admin.securitySettings?.loginNotifications || true
        };

        await admin.save();

        res.json({
            success: true,
            message: 'Security settings updated successfully',
            data: { settings: admin.securitySettings }
        });

    } catch (error) {
        console.error('Update security settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
