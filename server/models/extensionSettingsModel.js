import mongoose from "mongoose";

const extensionSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Basic Settings
    enabled: {
        type: Boolean,
        default: true
    },
    language: {
        type: String,
        enum: ['English', 'Tagalog', 'Taglish', 'Both'],
        default: 'Both'
    },
    sensitivity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    // Detection Mode Settings
    detectionMode: {
        type: String,
        enum: ['term-based', 'context-aware'],
        default: 'term-based'
    },
    // Content Flagging Settings
    flaggingStyle: {
        type: String,
        enum: ['blur', 'highlight', 'asterisk'],
        default: 'highlight'
    },
    highlightColor: {
        type: String,
        default: '#374151',
        validate: {
            validator: function(v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: 'Invalid color format. Use hex format like #374151'
        }
    },
    // Whitelist Settings
    whitelist: {
        websites: [{
            type: String,
            trim: true,
            validate: {
                validator: function(v) {
                    // Basic domain validation
                    return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/.test(v);
                },
                message: 'Invalid website format'
            }
        }],
        terms: [{
            type: String,
            trim: true,
            maxlength: 100
        }]
    },
    // Dictionary Settings
    dictionary: [{
        type: String,
        trim: true,
        maxlength: 100
    }],
    // Sync and Tracking
    lastSyncAt: {
        type: Date,
        default: Date.now
    },
    syncStatus: {
        type: String,
        enum: ['synced', 'syncing', 'error', 'pending'],
        default: 'synced'
    },
    version: {
        type: String,
        default: '1.0.0'
    },
    // Metadata
    deviceInfo: {
        userAgent: String,
        platform: String,
        browser: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
extensionSettingsSchema.index({ userId: 1 });

extensionSettingsSchema.index({ lastSyncAt: -1 });
extensionSettingsSchema.index({ syncStatus: 1 });

// Pre-save middleware to update lastSyncAt
extensionSettingsSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.lastSyncAt = new Date();
    }
    next();
});

// Static method to get or create settings for a user
extensionSettingsSchema.statics.getOrCreateSettings = async function(userId) {
    let settings = await this.findOne({ userId });

    if (!settings) {
        settings = new this({
            userId,
            enabled: true,
            language: 'Both',
            sensitivity: 'medium',
            detectionMode: 'term-based',
            flaggingStyle: 'highlight',
            highlightColor: '#374151',
            whitelist: { websites: [], terms: [] },
            dictionary: [],
            lastSyncAt: new Date(),
            syncStatus: 'synced'
        });
        await settings.save();
    }
    
    return settings;
};

// Instance method to update sync status
extensionSettingsSchema.methods.updateSyncStatus = function(status) {
    this.syncStatus = status;
    this.lastSyncAt = new Date();
    return this.save();
};

// Instance method to get settings for API response
extensionSettingsSchema.methods.toApiResponse = function() {
    const settings = this.toObject();
    return {
        enabled: settings.enabled,
        language: settings.language,
        sensitivity: settings.sensitivity,
        detectionMode: settings.detectionMode,
        flaggingStyle: settings.flaggingStyle,
        highlightColor: settings.highlightColor,
        whitelist: settings.whitelist,
        dictionary: settings.dictionary,
        lastSync: settings.lastSyncAt,
        syncStatus: settings.syncStatus,
        version: settings.version
    };
};

export default mongoose.model("ExtensionSettings", extensionSettingsSchema);
