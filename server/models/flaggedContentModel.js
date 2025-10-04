import mongoose from "mongoose";

const flaggedContentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    language: {
        type: String,
        enum: ["Filipino", "English", "Mixed"],
        required: true,
        index: true
    },
    detectedWord: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    context: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    sentiment: {
        type: String,
        enum: ["positive", "negative", "neutral"],
        default: "neutral",
        index: true
    },
    confidenceScore: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
        index: true
    },
    sourceUrl: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                try {
                    new URL(v);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'Invalid URL format'
        }
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    status: {
        type: String,
        enum: ["flagged", "reviewed", "ignored"],
        default: "flagged",
        index: true
    },
    // Additional metadata for better tracking
    metadata: {
        domain: {
            type: String,
            index: true
        },
        detectionMethod: {
            type: String,
            enum: ['dictionary', 'ai', 'hybrid', 'term-based', 'context-aware'],
            default: 'hybrid'
        },
        aiModel: {
            type: String,
            default: 'roberta-v1'
        },
        processingTime: Number,
        extensionVersion: String,
        userAgent: String,
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'extreme'],
            default: 'medium'
        }
    },
    // Review information
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    reviewNotes: {
        type: String,
        maxlength: 1000
    },
    // For tracking and analytics
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});

// Compound indexes for better query performance
flaggedContentSchema.index({ userId: 1, timestamp: -1 }); // User's flagged content
flaggedContentSchema.index({ status: 1, timestamp: -1 }); // Status-based queries
flaggedContentSchema.index({ 'metadata.domain': 1, timestamp: -1 }); // Domain-based queries
flaggedContentSchema.index({ detectedWord: 1, language: 1 }); // Word analysis
flaggedContentSchema.index({ confidenceScore: -1 }); // High confidence content
flaggedContentSchema.index({ sentiment: 1, language: 1 }); // Sentiment analysis
flaggedContentSchema.index({ userId: 1, status: 1, timestamp: -1 }); // User status queries

// Pre-save middleware to extract domain from URL
flaggedContentSchema.pre('save', function(next) {
    if (this.sourceUrl && !this.metadata.domain) {
        try {
            const url = new URL(this.sourceUrl);
            this.metadata.domain = url.hostname;
        } catch {
            console.warn('Failed to extract domain from URL:', this.sourceUrl);
        }
    }
    next();
});

// Static method to create flagged content
flaggedContentSchema.statics.createFlaggedContent = async function(contentData) {
    const flaggedContent = new this({
        userId: contentData.userId,
        language: contentData.language,
        detectedWord: contentData.detectedWord.toLowerCase().trim(),
        context: contentData.context.trim(),
        sentiment: contentData.sentiment || 'neutral',
        confidenceScore: contentData.confidenceScore,
        sourceUrl: contentData.sourceUrl.trim(),
        metadata: {
            detectionMethod: contentData.detectionMethod || 'hybrid',
            aiModel: contentData.aiModel || 'roberta-v1',
            processingTime: contentData.processingTime || 0,
            extensionVersion: contentData.extensionVersion,
            userAgent: contentData.userAgent,
            severity: contentData.severity || 'medium'
        }
    });

    return await flaggedContent.save();
};

// Static method to get user's flagged content
flaggedContentSchema.statics.getUserFlaggedContent = async function(userId, options = {}) {
    const {
        page = 1,
        limit = 20,
        status,
        domain,
        language,
        startDate,
        endDate,
        minConfidence
    } = options;

    const query = { userId, isActive: true };
    
    if (status) query.status = status;
    if (domain) query['metadata.domain'] = domain;
    if (language) query.language = language;
    if (minConfidence) query.confidenceScore = { $gte: minConfidence };
    
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
        this.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v')
            .lean(),
        this.countDocuments(query)
    ]);

    return {
        content,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// Static method to get analytics data
flaggedContentSchema.statics.getAnalytics = async function(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await this.aggregate([
        {
            $match: {
                userId: mongoose.Types.ObjectId.createFromHexString(userId),
                timestamp: { $gte: startDate },
                isActive: true
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    language: "$language"
                },
                count: { $sum: 1 },
                avgConfidence: { $avg: "$confidenceScore" },
                domains: { $addToSet: "$metadata.domain" },
                words: { $addToSet: "$detectedWord" }
            }
        },
        {
            $sort: { "_id.date": 1 }
        }
    ]);

    return analytics;
};

// Instance method to mark as reviewed
flaggedContentSchema.methods.markAsReviewed = function(reviewerId, notes = '') {
    this.status = 'reviewed';
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
    return this.save();
};

// Instance method to ignore content
flaggedContentSchema.methods.ignore = function() {
    this.status = 'ignored';
    return this.save();
};

// Instance method to soft delete
flaggedContentSchema.methods.softDelete = function() {
    this.isActive = false;
    return this.save();
};

export default mongoose.model("FlaggedContent", flaggedContentSchema);
