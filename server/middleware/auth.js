import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Verify JWT Token
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user
        const user = await User.findById(decoded.userId)
            .select('-password -emailVerificationToken -passwordResetToken');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token - user not found'
            });
        }

        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is not active'
            });
        }

        // Add user to request
        req.user = {
            _id: user._id,
            userId: user._id,
            email: user.email,
            role: user.role
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

        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Check if user is group owner or admin
export const requireGroupAdmin = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user || user.groupId?.toString() !== groupId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied - not a group member'
            });
        }

        if (!['owner', 'admin'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied - admin role required'
            });
        }

        next();

    } catch (error) {
        console.error('Group admin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Check if user is group owner only
export const requireGroupOwner = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user || user.groupId?.toString() !== groupId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied - not a group member'
            });
        }

        if (user.role !== 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Access denied - owner role required'
            });
        }

        next();

    } catch (error) {
        console.error('Group owner middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Check if user is subscriber
export const requireSubscriber = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isSubscriber) {
            return res.status(403).json({
                success: false,
                message: 'Subscription required'
            });
        }

        next();

    } catch (error) {
        console.error('Subscriber middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};



