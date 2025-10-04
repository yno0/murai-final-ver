import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

// Middleware to authenticate admin users
export const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if this is an admin token
        if (decoded.type !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        // Find admin
        const admin = await Admin.findById(decoded.adminId)
            .select('-password -passwordResetToken -twoFactorSecret');
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check if admin is active
        if (admin.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Admin account is not active'
            });
        }

        // Check if account is locked
        if (admin.isLocked) {
            return res.status(423).json({
                success: false,
                message: 'Admin account is temporarily locked'
            });
        }

        // Check if token exists in admin's session tokens
        const hasValidSession = admin.sessionTokens.some(session => 
            session.token === token && session.expiresAt > new Date()
        );

        if (!hasValidSession) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired session'
            });
        }

        // Clean expired tokens
        await admin.cleanExpiredTokens();

        // Add admin to request object
        req.admin = {
            adminId: admin._id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            permissions: admin.permissions
        };

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        console.error('Admin authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Middleware to check admin permissions
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Super admin has all permissions
        if (req.admin.role === 'super_admin') {
            return next();
        }

        // Check if admin has the required permission
        if (!req.admin.permissions.includes(permission)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Middleware to check admin role
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Ensure roles is an array
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient role privileges'
            });
        }

        next();
    };
};

// Middleware to check if admin is super admin
export const requireSuperAdmin = (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.admin.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: 'Super admin access required'
        });
    }

    next();
};
