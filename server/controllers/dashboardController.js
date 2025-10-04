 import User from '../models/userModel.js';
import Log from '../models/logModel.js';
import FlaggedContent from '../models/flaggedContentModel.js';
import mongoose from 'mongoose';

// Get dashboard overview statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Get current date for time-based queries
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Parallel queries for better performance
        const [
            totalUsers,
            usersLastMonth,
            flaggedToday,
            flaggedYesterday,
            activeExtensions,
            activeExtensionsLastWeek,
            recentLogs,
            systemHealth
        ] = await Promise.all([
            // Total users
            User.countDocuments({ status: 'active' }),
            
            // Users from last month for growth calculation
            User.countDocuments({ 
                status: 'active',
                createdAt: { $gte: lastMonth, $lt: today }
            }),
            
            // Flagged content today
            FlaggedContent.countDocuments({
                createdAt: { $gte: today }
            }),
            
            // Flagged content yesterday
            FlaggedContent.countDocuments({
                createdAt: { $gte: yesterday, $lt: today }
            }),
            
            // Active extensions (users who logged in recently)
            User.countDocuments({
                status: 'active',
                lastLoginAt: { $gte: lastWeek }
            }),
            
            // Active extensions last week
            User.countDocuments({
                status: 'active',
                lastLoginAt: { $gte: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000), $lt: lastWeek }
            }),
            
            // Recent system logs for alerts
            Log.find({
                isSystemLog: true,
                timestamp: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
            })
            .sort({ timestamp: -1 })
            .limit(10)
            .lean(),
            
            // System health metrics (mock for now, can be replaced with real monitoring)
            Promise.resolve({
                apiResponseTime: Math.floor(Math.random() * 100) + 100, // 100-200ms
                databaseStatus: 'Optimal',
                aiModelStatus: 'Online',
                extensionSync: 'Active'
            })
        ]);

        // Calculate growth percentages
        const userGrowth = usersLastMonth > 0 ? 
            ((totalUsers - usersLastMonth) / usersLastMonth * 100).toFixed(1) : 0;
        
        const flaggedGrowth = flaggedYesterday > 0 ? 
            ((flaggedToday - flaggedYesterday) / flaggedYesterday * 100).toFixed(1) : 0;
        
        const extensionGrowth = activeExtensionsLastWeek > 0 ? 
            ((activeExtensions - activeExtensionsLastWeek) / activeExtensionsLastWeek * 100).toFixed(1) : 0;

        // Calculate detection accuracy (mock calculation based on flagged content)
        const detectionAccuracy = Math.min(95 + Math.random() * 4, 99).toFixed(1);

        // Process recent alerts from logs
        const recentAlerts = recentLogs.slice(0, 5).map(log => ({
            id: log._id,
            type: log.action,
            message: log.details,
            timestamp: log.timestamp,
            severity: log.metadata?.severity || 'medium'
        }));

        // Get pending cases count
        const pendingCases = await FlaggedContent.countDocuments({
            status: 'pending'
        });

        const dashboardData = {
            metrics: {
                totalUsers: {
                    value: totalUsers,
                    growth: userGrowth,
                    trend: userGrowth >= 0 ? 'up' : 'down'
                },
                flaggedToday: {
                    value: flaggedToday,
                    growth: flaggedGrowth,
                    trend: flaggedGrowth >= 0 ? 'up' : 'down'
                },
                activeExtensions: {
                    value: activeExtensions,
                    growth: extensionGrowth,
                    trend: extensionGrowth >= 0 ? 'up' : 'down'
                },
                detectionAccuracy: {
                    value: parseFloat(detectionAccuracy),
                    growth: '0.3',
                    trend: 'up'
                }
            },
            systemHealth: {
                apiResponseTime: `${systemHealth.apiResponseTime}ms`,
                databaseStatus: systemHealth.databaseStatus,
                aiModelStatus: systemHealth.aiModelStatus,
                extensionSync: systemHealth.extensionSync
            },
            recentAlerts,
            quickActions: {
                pendingCases,
                totalUsers,
                flaggedToday
            }
        };

        res.json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};

// Get detailed analytics for charts
export const getDashboardAnalytics = async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        
        let startDate;
        const now = new Date();
        
        switch (period) {
            case '24h':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        // Get flagged content over time
        const flaggedContentTrend = await FlaggedContent.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get user registration trend
        const userRegistrationTrend = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                flaggedContentTrend,
                userRegistrationTrend,
                period
            }
        });

    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard analytics',
            error: error.message
        });
    }
};
