import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin'],
        default: 'admin'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    permissions: {
        type: [String],
        default: [
            'view_dashboard',
            'manage_dictionary',
            'view_analytics',
            'manage_moderation',
            'view_users',
            'manage_settings'
        ]
    },
    profileImage: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    department: {
        type: String,
        default: 'Administration'
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    lastLoginIP: {
        type: String,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpires: {
        type: Date,
        default: null
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        default: null
    },
    sessionTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: Date,
        userAgent: String,
        ipAddress: String,
        lastUsed: {
            type: Date,
            default: Date.now
        }
    }],
    securitySettings: {
        sessionTimeout: {
            type: Number,
            default: 30 // minutes
        },
        maxSessions: {
            type: Number,
            default: 5
        },
        requirePasswordChange: {
            type: Boolean,
            default: false
        },
        loginNotifications: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ status: 1 });

// Virtual for checking if account is locked
adminSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const saltRounds = 12;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
adminSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.updateOne(updates);
};

// Method to reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// Method to add session token
adminSchema.methods.addSessionToken = function(token, userAgent, ip) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    this.sessionTokens.push({
        token,
        userAgent,
        ipAddress: ip,
        expiresAt,
        lastUsed: new Date()
    });

    // Keep only last 5 sessions
    if (this.sessionTokens.length > 5) {
        this.sessionTokens = this.sessionTokens.slice(-5);
    }

    return this.save();
};

// Method to remove session token
adminSchema.methods.removeSessionToken = function(token) {
    this.sessionTokens = this.sessionTokens.filter(session => session.token !== token);
    return this.save();
};

// Method to remove session by ID
adminSchema.methods.removeSessionById = function(sessionId) {
    this.sessionTokens = this.sessionTokens.filter(session => session._id.toString() !== sessionId);
    return this.save();
};

// Method to clean expired session tokens
adminSchema.methods.cleanExpiredTokens = function() {
    const now = new Date();
    this.sessionTokens = this.sessionTokens.filter(session => session.expiresAt > now);
    return this.save();
};

// Static method to find admin by email
adminSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to create admin with hashed password
adminSchema.statics.createAdmin = async function(adminData) {
    const admin = new this(adminData);
    return admin.save();
};

export default mongoose.model("Admin", adminSchema);
