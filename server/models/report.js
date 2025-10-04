import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    detectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FlaggedContent',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    reason: {
        type: String,
        enum: [
            'false-positive',
            'missed-context',
            'too-sensitive',
            'technical-issue',
            'inappropriate-flagging',
            'language-misidentification',
            'other'
        ],
        required: true,
        index: true
    },
    details: {
        type: String,
        maxlength: 2000,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        enum: ['accuracy', 'technical', 'content', 'user_experience'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
        index: true
    },
    status: {
        type: String,
        enum: ['open', 'in_review', 'resolved', 'dismissed', 'escalated'],
        default: 'open',
        index: true
    },
    priority: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    resolution: {
        action: {
            type: String,
            enum: ['no_action', 'updated_detection', 'improved_model', 'user_educated', 'escalated_to_dev'],
            default: null
        },
        notes: {
            type: String,
            maxlength: 1000,
            default: null
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        resolvedAt: {
            type: Date,
            default: null
        }
    },
    feedback: {
        wasHelpful: {
            type: Boolean,
            default: null
        },
        userSatisfaction: {
            type: Number,
            min: 1,
            max: 5,
            default: null
        },
        additionalComments: {
            type: String,
            maxlength: 500,
            default: null
        }
    },
    metadata: {
        browserInfo: {
            userAgent: String,
            language: String,
            timezone: String
        },
        extensionVersion: String,
        reportSource: {
            type: String,
            enum: ['tooltip', 'modal', 'settings', 'api'],
            default: 'modal'
        },
        originalDetectionData: {
            confidence: Number,
            flaggedWords: [String],
            detectionMethod: String
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    internalNotes: [{
        note: {
            type: String,
            required: true,
            maxlength: 1000
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ detectionId: 1 });
reportSchema.index({ status: 1, priority: -1 });
reportSchema.index({ reason: 1, status: 1 });
reportSchema.index({ assignedTo: 1, status: 1 });
reportSchema.index({ 'resolution.resolvedAt': -1 });

// Virtual for getting report age
reportSchema.virtual('age').get(function() {
    return Date.now() - this.createdAt;
});

// Virtual for checking if report is overdue
reportSchema.virtual('isOverdue').get(function() {
    if (this.status === 'resolved' || this.status === 'dismissed') {
        return false;
    }
    
    const daysSinceCreated = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
    const overdueThreshold = this.severity === 'critical' ? 1 : 
                           this.severity === 'high' ? 3 : 
                           this.severity === 'medium' ? 7 : 14;
    
    return daysSinceCreated > overdueThreshold;
});

// Static method to get report statistics
reportSchema.statics.getStats = async function(timeRange = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    const stats = await this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalReports: { $sum: 1 },
                openReports: {
                    $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
                },
                resolvedReports: {
                    $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                },
                averageResolutionTime: {
                    $avg: {
                        $cond: [
                            { $ne: ['$resolution.resolvedAt', null] },
                            { $subtract: ['$resolution.resolvedAt', '$createdAt'] },
                            null
                        ]
                    }
                },
                reasonBreakdown: { $push: '$reason' },
                severityBreakdown: { $push: '$severity' }
            }
        }
    ]);

    return stats[0] || {
        totalReports: 0,
        openReports: 0,
        resolvedReports: 0,
        averageResolutionTime: 0,
        reasonBreakdown: [],
        severityBreakdown: []
    };
};

// Static method to get overdue reports
reportSchema.statics.getOverdueReports = async function() {
    const reports = await this.find({
        status: { $in: ['open', 'in_review'] }
    }).populate('userId', 'name email').populate('detectionId');

    return reports.filter(report => report.isOverdue);
};

// Instance method to resolve report
reportSchema.methods.resolve = function(action, notes, resolvedBy) {
    this.status = 'resolved';
    this.resolution.action = action;
    this.resolution.notes = notes;
    this.resolution.resolvedBy = resolvedBy;
    this.resolution.resolvedAt = new Date();
    return this.save();
};

// Instance method to add internal note
reportSchema.methods.addInternalNote = function(note, addedBy) {
    this.internalNotes.push({
        note,
        addedBy,
        addedAt: new Date()
    });
    return this.save();
};

// Pre-save middleware to determine category based on reason
reportSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('reason')) {
        switch (this.reason) {
            case 'false-positive':
            case 'missed-context':
            case 'inappropriate-flagging':
            case 'language-misidentification':
                this.category = 'accuracy';
                break;
            case 'technical-issue':
                this.category = 'technical';
                break;
            case 'too-sensitive':
                this.category = 'user_experience';
                break;
            default:
                this.category = 'content';
        }
    }
    next();
});

// Pre-save middleware to set priority based on severity and reason
reportSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('severity') || this.isModified('reason')) {
        let basePriority = 3; // medium
        
        // Adjust based on severity
        switch (this.severity) {
            case 'critical': basePriority = 5; break;
            case 'high': basePriority = 4; break;
            case 'medium': basePriority = 3; break;
            case 'low': basePriority = 2; break;
        }
        
        // Adjust based on reason (some reasons are more critical)
        if (this.reason === 'technical-issue' || this.reason === 'inappropriate-flagging') {
            basePriority = Math.min(5, basePriority + 1);
        }
        
        this.priority = basePriority;
    }
    next();
});

export default mongoose.model("Report", reportSchema);
