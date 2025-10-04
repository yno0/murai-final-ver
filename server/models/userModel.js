import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
        required: false,
        validate: {
            validator: function(v) {
                // Allow null, undefined, or empty string for OAuth users
                if (v === null || v === undefined || v === '') {
                    return true;
                }
                // If password is provided, it must be at least 6 characters
                return v.length >= 6;
            },
            message: 'Password must be at least 6 characters long'
        }
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'suspended', 'revoked'],
        default: 'active'
    },

    profileImage: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    timezone: {
        type: String,
        default: 'UTC'
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    passwordResetToken: {
        type: String,
        default: null
    },
    passwordResetExpires: {
        type: Date,
        default: null
    },
    isSubscriber: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);