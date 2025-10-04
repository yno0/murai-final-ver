import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Log from '../models/logModel.js';
import emailService from '../services/emailService.js';

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Register User
export const register = async (req, res) => {
    try {
        const { name, email, password, plan = 'personal' } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Validate password for regular registration
        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password is required and must be at least 6 characters long'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user', // Default to 'user' role
            isSubscriber: plan !== 'personal'
        });

        await user.save();



        // Log user registration
        await Log.createLog({
            action: 'user_register',
            details: `User registered with ${plan} plan`,
            userId: user._id,
            metadata: {
                plan: plan,
                ip: req.ip,
                userAgent: req.headers['user-agent']
            }
        });

        // Generate token
        const token = generateToken(user._id);

        // Send welcome email
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const loginUrl = `${frontendUrl}/login`;
            const emailTemplate = emailService.generateWelcomeEmail(user.name, loginUrl);
            
            await emailService.sendEmail({
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
                text: emailTemplate.text
            });
            console.log('✅ Welcome email sent to:', user.email);
        } catch (emailError) {
            console.error('❌ Failed to send welcome email:', emailError);
            // Don't fail registration if email fails
        }

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.emailVerificationToken;
        delete userResponse.passwordResetToken;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Login User
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password - handle OAuth users who don't have passwords
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'This account was created with Google. Please sign in with Google.'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is not active'
            });
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        // Log user login
        await Log.createLog({
            action: 'user_login',
            details: `User logged in successfully`,
            userId: user._id,
            metadata: {
                ip: req.ip,
                userAgent: req.headers['user-agent']
            }
        });

        // Generate token
        const token = generateToken(user._id);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.emailVerificationToken;
        delete userResponse.passwordResetToken;

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password -emailVerificationToken -passwordResetToken');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update User Profile
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, timezone } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (timezone) user.timezone = timezone;

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.emailVerificationToken;
        delete userResponse.passwordResetToken;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: userResponse }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if this is an OAuth user without a password
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: 'This account was created with Google. Password changes are not available for Google accounts.'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedNewPassword;

        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

export async function findOrCreateGoogleUser(profile) {
    try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user from Google profile
            const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
            
            user = new User({
                name: name || 'Google User',
                email: email,
                password: null, // No password for Google users - use null instead of empty string
                role: 'user', // Default to 'user' role
                status: 'active',
                isSubscriber: false, // Default to personal plan
                emailVerified: true,
                profileImage: profile.photos?.[0]?.value || null
            });

            await user.save();
            console.log('Created new Google user:', user.email);
        } else {
            // Update existing user's Google info
            user.emailVerified = true;
            if (profile.photos?.[0]?.value) {
                user.profileImage = profile.photos[0].value;
            }
            await user.save();
            console.log('Updated existing Google user:', user.email);
        }

        return user;
    } catch (error) {
        console.error('Error in findOrCreateGoogleUser:', error);
        throw error;
    }
}

// Logout (client-side token removal)
export const logout = async (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
};
