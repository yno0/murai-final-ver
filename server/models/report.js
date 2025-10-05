import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    reportId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    selectedText: {
        type: String,
        required: true,
        maxlength: 5000,
        trim: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    details: {
        type: String,
        maxlength: 1000,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['open', 'in_review', 'resolved', 'dismissed'],
        default: 'open',
        index: true
    },
    sourceUrl: {
        type: String,
        trim: true,
        default: ''
    },
    reportType: {
        type: String,
        enum: ['manual_selection', 'flagged_content'],
        required: true,
        index: true
    },

}, {
    timestamps: true
});

// Indexes for better query performance
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportType: 1, createdAt: -1 });

// Simple static method to create a report
reportSchema.statics.createReport = async function(reportData) {
    const report = new this({
        reportId: reportData.reportId,
        userId: reportData.userId,
        selectedText: reportData.selectedText,
        reason: reportData.reason,
        details: reportData.details || '',
        sourceUrl: reportData.sourceUrl || '',
        reportType: reportData.reportType
    });

    return await report.save();
};



const Report = mongoose.model('Report', reportSchema);

export default Report;
