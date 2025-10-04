import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        trim: true,
        enum: [
            'scan_started',
            'flagged_detected',
            'user_login',
            'user_logout',
            'user_register',
            'settings_updated',
            'content_flagged',
            'content_reviewed',
            'whitelist_updated',
            'dictionary_updated',
            'ai_analysis_completed',
            'extension_installed',
            'extension_uninstalled',
            'detection_dismissed',
            'detection_reported',
            'system_error',
            'api_request',
            // Admin actions
            'admin_login',
            'admin_logout',
            'admin_password_change',
            'admin_profile_update',
            'admin_user_created',
            'admin_user_updated',
            'admin_user_deleted',
            'admin_dictionary_update',
            'admin_dictionary_import',
            'admin_dictionary_export',
            'admin_settings_update',
            'admin_system_action',
            // User management actions
            'user_status_updated',
            'user_created',
            'user_updated',
            'user_deleted',
            'other'
        ]
    },
    details: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    // Additional metadata for better tracking
    metadata: {
        ip: String,
        userAgent: String,
        extensionVersion: String,
        url: String,
        sessionId: String,
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        }
    },
    // For system monitoring and debugging
    isSystemLog: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
logSchema.index({ userId: 1, timestamp: -1 }); // Compound index for user logs
logSchema.index({ action: 1, timestamp: -1 }); // Compound index for action-based queries
logSchema.index({ timestamp: -1 }); // For time-based queries
logSchema.index({ 'metadata.severity': 1 }); // For severity filtering
logSchema.index({ isSystemLog: 1, timestamp: -1 }); // For system logs

// Static method to create a log entry
logSchema.statics.createLog = async function(logData) {
    const log = new this({
        action: logData.action,
        details: logData.details,
        userId: logData.userId,
        timestamp: logData.timestamp || new Date(),
        metadata: logData.metadata || {},
        isSystemLog: logData.isSystemLog || false
    });

    return await log.save();
};

// Static method to get user activity logs
logSchema.statics.getUserLogs = async function(userId, options = {}) {
    const {
        page = 1,
        limit = 50,
        action,
        startDate,
        endDate,
        severity
    } = options;

    const query = { userId };
    
    if (action) query.action = action;
    if (severity) query['metadata.severity'] = severity;
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        this.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// Static method to get system logs
logSchema.statics.getSystemLogs = async function(options = {}) {
    const {
        page = 1,
        limit = 100,
        severity,
        startDate,
        endDate
    } = options;

    const query = { isSystemLog: true };
    
    if (severity) query['metadata.severity'] = severity;
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        this.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// Static method to get activity statistics
logSchema.statics.getActivityStats = async function(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 },
                lastActivity: { $max: '$timestamp' }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    return stats;
};

export default mongoose.model("Log", logSchema);
