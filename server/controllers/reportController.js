import Report from "../models/report.js";
import FlaggedContent from "../models/flaggedContentModel.js";
import Log from "../models/logModel.js";
import { v4 as uuidv4 } from 'uuid';

// Create a new report
export const createReport = async (req, res) => {
    try {
        console.log('📝 ===== CREATE REPORT CONTROLLER =====');
        console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
        console.log('📝 User ID:', req.user._id);

        const { detectionId, reason, details, severity = 'medium', reportSource = 'modal' } = req.body;

        // Validate required fields
        if (!detectionId || !reason) {
            console.log('❌ Missing required fields:', { detectionId: !!detectionId, reason: !!reason });
            return res.status(400).json({
                success: false,
                message: "Detection ID and reason are required"
            });
        }

        // Check if flagged content exists and belongs to user
        const flaggedContent = await FlaggedContent.findOne({
            _id: detectionId,
            userId: req.user._id,
            isActive: true
        });

        if (!flaggedContent) {
            return res.status(404).json({
                success: false,
                message: "Flagged content not found"
            });
        }

        // Generate report ID
        const reportId = `rpt_${Date.now()}_${uuidv4().substring(0, 8)}`;

        // Determine category based on reason
        const getCategoryFromReason = (reason) => {
            switch (reason) {
                case 'false-positive':
                case 'missed-context':
                case 'too-sensitive':
                case 'inappropriate-flagging':
                case 'language-misidentification':
                    return 'accuracy';
                case 'technical-issue':
                    return 'technical';
                default:
                    return 'user_experience';
            }
        };

        const category = getCategoryFromReason(reason);

        // Create report document
        const report = new Report({
            reportId,
            detectionId: flaggedContent._id,
            userId: req.user._id,
            reason,
            details: details || '',
            category,
            severity,
            metadata: {
                browserInfo: {
                    userAgent: req.headers['user-agent'] || 'Unknown',
                    language: req.headers['accept-language'] || 'en',
                    timezone: req.body.timezone || 'UTC'
                },
                extensionVersion: req.headers['x-extension-version'] || '1.0.0',
                reportSource,
                originalDetectionData: {
                    confidence: flaggedContent.confidenceScore,
                    flaggedWords: [flaggedContent.detectedWord],
                    detectionMethod: flaggedContent.metadata.detectionMethod || 'hybrid'
                }
            }
        });

        console.log('💾 Saving report to database...');
        const savedReport = await report.save();
        console.log('✅ Report saved successfully:', {
            reportId: savedReport.reportId,
            _id: savedReport._id,
            category: savedReport.category,
            reason: savedReport.reason
        });

        // Update flagged content status to reported
        await flaggedContent.markAsReviewed(req.user._id, `Reported: ${reason}`);
        console.log('✅ Flagged content marked as reviewed');

        // Log the report creation
        await Log.createLog({
            action: 'detection_reported',
            details: `Flagged content reported: ${reason}`,
            userId: req.user._id,
            metadata: {
                reportId: report.reportId,
                flaggedContentId: flaggedContent._id,
                reason,
                severity,
                ip: req.ip
            }
        });

        res.status(201).json({
            success: true,
            message: "Report submitted successfully",
            data: {
                reportId: report.reportId,
                _id: report._id,
                status: report.status,
                createdAt: report.createdAt,
                detectionId: flaggedContent._id
            }
        });

    } catch (error) {
        console.error('Error creating report:', error);

        // Handle duplicate report ID
        if (error.code === 11000 && error.keyPattern?.reportId) {
            return res.status(409).json({
                success: false,
                message: "Report ID already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create report",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create a direct report without requiring existing flagged content
export const createDirectReport = async (req, res) => {
    try {
        console.log('📝 ===== CREATE DIRECT REPORT CONTROLLER =====');
        console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
        console.log('📝 User ID:', req.user._id);

        const {
            selectedText,
            reason,
            details
        } = req.body;

        // Validate required fields
        if (!selectedText || !reason) {
            console.log('❌ Missing required fields:', { selectedText: !!selectedText, reason: !!reason });
            return res.status(400).json({
                success: false,
                message: "Selected text and reason are required"
            });
        }

        // Generate report ID
        const reportId = `rpt_${Date.now()}_${uuidv4().substring(0, 8)}`;

        // Create simplified report using the static method
        const report = await Report.createReport({
            reportId,
            userId: req.user._id,
            selectedText,
            reason,
            details: details || '',
            sourceUrl: req.headers.referer || '',
            reportType: 'manual_selection'
        });

        console.log('✅ Direct report saved successfully:', {
            reportId: report.reportId,
            _id: report._id,
            reason: report.reason
        });

        // Log the report creation
        await Log.createLog({
            action: 'detection_reported',
            details: `Direct report submitted: ${reason}`,
            userId: req.user._id,
            metadata: {
                reportId: report.reportId,
                reason,
                selectedText: selectedText.substring(0, 100),
                ip: req.ip
            }
        });

        console.log('✅ Direct report creation completed successfully');

        res.status(201).json({
            success: true,
            message: "Direct report submitted successfully",
            data: {
                reportId: report.reportId,
                _id: report._id,
                status: report.status,
                createdAt: report.createdAt
            }
        });

    } catch (error) {
        console.error('❌ Error creating direct report:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            keyPattern: error.keyPattern
        });

        // Handle duplicate report ID
        if (error.code === 11000 && error.keyPattern?.reportId) {
            return res.status(409).json({
                success: false,
                message: "Report ID already exists"
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            console.error('❌ Validation error details:', error.errors);
            return res.status(400).json({
                success: false,
                message: "Validation error: " + error.message,
                error: process.env.NODE_ENV === 'development' ? error.errors : undefined
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to create direct report",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user's reports with pagination and filtering
export const getUserReports = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            page = 1,
            limit = 20,
            status,
            reason,
            severity,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = { userId };

        if (status) query.status = status;
        if (reason) query.reason = reason;
        if (severity) query.severity = severity;

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const [reports, totalCount] = await Promise.all([
            Report.find(query)
                .populate('detectionId', '_id sourceUrl metadata.domain confidenceScore detectedWord')
                .populate('resolution.resolvedBy', 'name email')
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Report.countDocuments(query)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        res.json({
            success: true,
            data: {
                reports,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    hasNextPage,
                    hasPrevPage,
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching user reports:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reports",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get a specific report by ID
export const getReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const userId = req.user._id;

        const report = await Report.findOne({
            $or: [
                { reportId },
                { _id: reportId }
            ],
            userId
        })
        .populate('detectionId')
        .populate('resolution.resolvedBy', 'name email')
        .populate('assignedTo', 'name email');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        res.json({
            success: true,
            data: report
        });

    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch report",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update report status (for admin/support purposes)
export const updateReportStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { status, assignedTo, internalNote } = req.body;

        // Validate status
        const validStatuses = ['open', 'in_review', 'resolved', 'dismissed', 'escalated'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status",
                validStatuses
            });
        }

        const report = await Report.findOne({
            $or: [
                { reportId },
                { _id: reportId }
            ]
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        // Check if user has permission (admin or report owner)
        if (req.user.role !== 'admin' && report.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions"
            });
        }

        // Update report
        if (status) report.status = status;
        if (assignedTo) report.assignedTo = assignedTo;
        
        // Add internal note if provided
        if (internalNote) {
            await report.addInternalNote(internalNote, req.user._id);
        }

        await report.save();

        res.json({
            success: true,
            message: "Report updated successfully",
            data: {
                reportId: report.reportId,
                status: report.status,
                assignedTo: report.assignedTo,
                updatedAt: report.updatedAt
            }
        });

    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update report",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Resolve a report
export const resolveReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { action, notes } = req.body;

        if (!action) {
            return res.status(400).json({
                success: false,
                message: "Resolution action is required"
            });
        }

        const validActions = ['no_action', 'updated_dictionary', 'improved_model', 'user_educated', 'escalated_to_dev'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid resolution action",
                validActions
            });
        }

        const report = await Report.findOne({
            $or: [
                { reportId },
                { _id: reportId }
            ]
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        // Check permissions (admin only for resolution)
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only administrators can resolve reports"
            });
        }

        // Resolve the report
        await report.resolve(action, notes, req.user._id);

        res.json({
            success: true,
            message: "Report resolved successfully",
            data: {
                reportId: report.reportId,
                status: report.status,
                resolution: report.resolution
            }
        });

    } catch (error) {
        console.error('Error resolving report:', error);
        res.status(500).json({
            success: false,
            message: "Failed to resolve report",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Add feedback to a report
export const addReportFeedback = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { wasHelpful, userSatisfaction, additionalComments } = req.body;

        const report = await Report.findOne({
            $or: [
                { reportId },
                { _id: reportId }
            ],
            userId: req.user._id
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        // Update feedback
        if (wasHelpful !== undefined) report.feedback.wasHelpful = wasHelpful;
        if (userSatisfaction !== undefined) {
            if (userSatisfaction < 1 || userSatisfaction > 5) {
                return res.status(400).json({
                    success: false,
                    message: "User satisfaction must be between 1 and 5"
                });
            }
            report.feedback.userSatisfaction = userSatisfaction;
        }
        if (additionalComments !== undefined) report.feedback.additionalComments = additionalComments;

        await report.save();

        res.json({
            success: true,
            message: "Feedback added successfully",
            data: {
                reportId: report.reportId,
                feedback: report.feedback
            }
        });

    } catch (error) {
        console.error('Error adding report feedback:', error);
        res.status(500).json({
            success: false,
            message: "Failed to add feedback",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get report statistics
export const getReportStats = async (req, res) => {
    try {
        const { timeRange = 30, userId } = req.query;

        // Build query based on permissions
        let query = {};
        if (req.user.role !== 'admin') {
            // Regular users can only see their own stats
            query.userId = req.user._id;
        } else if (userId) {
            // Admins can filter by specific user
            query.userId = userId;
        }

        const stats = await Report.getStats(parseInt(timeRange));

        // Additional aggregations for detailed stats
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));

        if (Object.keys(query).length > 0) {
            query.createdAt = { $gte: startDate };
        }

        const [reasonStats, severityStats, resolutionStats] = await Promise.all([
            // Reason breakdown
            Report.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$reason',
                        count: { $sum: 1 },
                        avgResolutionTime: {
                            $avg: {
                                $cond: [
                                    { $ne: ['$resolution.resolvedAt', null] },
                                    { $subtract: ['$resolution.resolvedAt', '$createdAt'] },
                                    null
                                ]
                            }
                        }
                    }
                },
                { $sort: { count: -1 } }
            ]),

            // Severity breakdown
            Report.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$severity',
                        count: { $sum: 1 },
                        avgPriority: { $avg: '$priority' }
                    }
                },
                { $sort: { count: -1 } }
            ]),

            // Resolution action breakdown
            Report.aggregate([
                { 
                    $match: { 
                        ...query,
                        status: 'resolved'
                    } 
                },
                {
                    $group: {
                        _id: '$resolution.action',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ])
        ]);

        // Get overdue reports count
        const overdueReports = await Report.getOverdueReports();
        const overdueCount = req.user.role === 'admin' 
            ? overdueReports.length
            : overdueReports.filter(r => r.userId.toString() === req.user._id.toString()).length;

        res.json({
            success: true,
            data: {
                overview: stats,
                reasonBreakdown: reasonStats,
                severityBreakdown: severityStats,
                resolutionActions: resolutionStats,
                overdueCount,
                timeRange: parseInt(timeRange)
            }
        });

    } catch (error) {
        console.error('Error fetching report stats:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch report statistics",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get overdue reports (admin only)
export const getOverdueReports = async (req, res) => {
    try {
        // Check admin permissions
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        const overdueReports = await Report.getOverdueReports();

        res.json({
            success: true,
            data: {
                reports: overdueReports,
                count: overdueReports.length
            }
        });

    } catch (error) {
        console.error('Error fetching overdue reports:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch overdue reports",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Bulk operations for reports
export const bulkUpdateReports = async (req, res) => {
    try {
        const { reportIds, action, status, assignedTo } = req.body;

        if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Report IDs array is required"
            });
        }

        if (!action || !['update_status', 'assign', 'resolve'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Must be 'update_status', 'assign', or 'resolve'"
            });
        }

        // Check permissions (admin only for bulk operations)
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Admin access required for bulk operations"
            });
        }

        let result;

        if (action === 'update_status') {
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: "Status is required for update_status action"
                });
            }

            result = await Report.updateMany(
                { _id: { $in: reportIds } },
                { status }
            );

        } else if (action === 'assign') {
            if (!assignedTo) {
                return res.status(400).json({
                    success: false,
                    message: "Assigned user ID is required for assign action"
                });
            }

            result = await Report.updateMany(
                { _id: { $in: reportIds } },
                { assignedTo, status: 'in_review' }
            );

        } else if (action === 'resolve') {
            // Bulk resolve with default action
            result = await Report.updateMany(
                { _id: { $in: reportIds } },
                {
                    status: 'resolved',
                    'resolution.action': 'no_action',
                    'resolution.resolvedBy': req.user._id,
                    'resolution.resolvedAt': new Date()
                }
            );
        }

        res.json({
            success: true,
            message: `${result.modifiedCount} reports updated successfully`,
            modifiedCount: result.modifiedCount
        });

    } catch (error) {
        console.error('Error in bulk update:', error);
        res.status(500).json({
            success: false,
            message: "Failed to perform bulk operation",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Admin-specific functions

// Get all reports for admin (with enhanced filtering and search)
export const getAdminReports = async (req, res) => {
    try {
        console.log('getAdminReports called with req.admin:', req.admin);
        console.log('Query params:', req.query);

        const {
            page = 1,
            limit = 20,
            status,
            type,
            severity,
            search,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};

        if (status && status !== 'undefined') query.status = status;
        if (severity && severity !== 'undefined') query.severity = severity;

        // Map type filter to reason field
        if (type && type !== 'undefined') {
            switch (type) {
                case 'missed_detection':
                    query.reason = { $in: ['missed-context', 'inappropriate-flagging'] };
                    break;
                case 'false_positive':
                    query.reason = { $in: ['false-positive', 'too-sensitive'] };
                    break;
                case 'user_report':
                    query.reason = { $in: ['technical-issue', 'language-misidentification', 'other'] };
                    break;
            }
        }

        // Search functionality
        if (search && search.trim()) {
            query.$or = [
                { details: { $regex: search, $options: 'i' } },
                { reportId: { $regex: search, $options: 'i' } },
                { 'resolution.notes': { $regex: search, $options: 'i' } }
            ];
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        console.log('Final query:', JSON.stringify(query, null, 2));

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const [reports, totalCount] = await Promise.all([
            Report.find(query)
                .populate('userId', 'name email')
                .populate('detectionId', '_id sourceUrl metadata.domain confidenceScore detectedWord')
                .populate('resolution.resolvedBy', 'name email')
                .populate('assignedTo', 'name email')
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Report.countDocuments(query)
        ]);

        console.log(`Found ${reports.length} reports, total: ${totalCount}`);

        // Transform reports to match frontend expectations
        const transformedReports = reports.map(report => ({
            ...report,
            type: getReportType(report.reason),
            content: report.details || 'No content provided',
            reportedText: report.details,
            sourceUrl: report.detectionId?.sourceUrl || 'Unknown source'
        }));

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        res.json({
            success: true,
            data: {
                content: transformedReports,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    totalPages
                }
            }
        });

    } catch (error) {
        console.error('Error fetching admin reports:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reports",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to map reason to type
function getReportType(reason) {
    switch (reason) {
        case 'missed-context':
        case 'inappropriate-flagging':
            return 'missed_detection';
        case 'false-positive':
        case 'too-sensitive':
            return 'false_positive';
        case 'technical-issue':
        case 'language-misidentification':
        case 'other':
            return 'user_report';
        default:
            return 'user_report';
    }
}

// Export reports to CSV
export const exportReports = async (req, res) => {
    try {
        const {
            status,
            type,
            severity,
            search,
            startDate,
            endDate
        } = req.query;

        // Build query (same as getAdminReports)
        const query = {};

        if (status) query.status = status;
        if (severity) query.severity = severity;

        if (type) {
            switch (type) {
                case 'missed_detection':
                    query.reason = { $in: ['missed-context', 'inappropriate-flagging'] };
                    break;
                case 'false_positive':
                    query.reason = { $in: ['false-positive', 'too-sensitive'] };
                    break;
                case 'user_report':
                    query.reason = { $in: ['technical-issue', 'language-misidentification', 'other'] };
                    break;
            }
        }

        if (search) {
            query.$or = [
                { details: { $regex: search, $options: 'i' } },
                { reportId: { $regex: search, $options: 'i' } },
                { 'resolution.notes': { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Get all matching reports
        const reports = await Report.find(query)
            .populate('userId', 'name email')
            .populate('detectionId', '_id sourceUrl metadata.domain confidenceScore detectedWord')
            .populate('resolution.resolvedBy', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        // Generate CSV content
        const csvHeaders = [
            'Report ID',
            'Type',
            'Status',
            'Severity',
            'Reason',
            'Details',
            'User Email',
            'Source URL',
            'Detected Word',
            'Confidence Score',
            'Created At',
            'Resolved At',
            'Resolved By',
            'Resolution Action',
            'Resolution Notes'
        ];

        const csvRows = reports.map(report => [
            report.reportId,
            getReportType(report.reason),
            report.status,
            report.severity,
            report.reason,
            `"${(report.details || '').replace(/"/g, '""')}"`,
            report.userId?.email || 'Unknown',
            report.detectionId?.sourceUrl || 'Unknown',
            report.detectionId?.detectedWord || 'Unknown',
            report.detectionId?.confidenceScore || 'N/A',
            report.createdAt?.toISOString() || 'Unknown',
            report.resolution?.resolvedAt?.toISOString() || 'Not resolved',
            report.resolution?.resolvedBy?.email || 'Not resolved',
            report.resolution?.action || 'Not resolved',
            `"${(report.resolution?.notes || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

        // Set response headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="reports-${new Date().toISOString().split('T')[0]}.csv"`);

        res.send(csvContent);

    } catch (error) {
        console.error('Error exporting reports:', error);
        res.status(500).json({
            success: false,
            message: "Failed to export reports",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
