import User from '../models/userModel.js';
import Admin from '../models/adminModel.js';
import Log from '../models/logModel.js';
import ResponseUtil from '../utils/response.js';
import logger from '../utils/logger.js';

/**
 * User Controller
 * Handles user management operations for admin panel
 */
class UserController {
    /**
     * Get all end users with pagination and filtering
     * GET /api/admin/users
     */
    async getUsers(req, res) {
        try {
            const { 
                page = 1, 
                limit = 20, 
                search, 
                status, 
                role = 'user',
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query;

            const query = { role: 'user' }; // Only get end users, not admins
            
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (status) {
                query.status = status;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            const [users, total] = await Promise.all([
                User.find(query)
                    .select('-password -passwordResetToken -emailVerificationToken')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                User.countDocuments(query)
            ]);

            ResponseUtil.success(res, {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }, 'Users retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving users', error, {
                adminId: req.admin?.adminId,
                query: req.query
            });
            ResponseUtil.error(res, 'Failed to retrieve users', 500, error);
        }
    }

    /**
     * Get user by ID
     * GET /api/admin/users/:id
     */
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            
            const user = await User.findById(id)
                .select('-password -passwordResetToken -emailVerificationToken')
                .lean();

            if (!user) {
                return ResponseUtil.notFound(res, 'User not found');
            }

            ResponseUtil.success(res, { user }, 'User retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving user', error, {
                adminId: req.admin?.adminId,
                userId: req.params.id
            });
            ResponseUtil.error(res, 'Failed to retrieve user', 500, error);
        }
    }

    /**
     * Update user status
     * PATCH /api/admin/users/:id/status
     */
    async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'pending', 'suspended', 'revoked'].includes(status)) {
                return ResponseUtil.badRequest(res, 'Invalid status value');
            }

            const user = await User.findByIdAndUpdate(
                id,
                { status },
                { new: true, select: '-password -passwordResetToken -emailVerificationToken' }
            );

            if (!user) {
                return ResponseUtil.notFound(res, 'User not found');
            }

            // Log the status change
            await Log.createLog({
                action: 'user_status_updated',
                details: `User "${user.email}" status changed to ${status}`,
                userId: req.admin?.adminId,
                metadata: {
                    actorRole: 'admin',
                    actorName: req.admin?.name,
                    actorEmail: req.admin?.email,
                    targetUserId: user._id,
                    targetUserEmail: user.email,
                    oldStatus: user.status,
                    newStatus: status,
                    ip: req.ip
                },
                isSystemLog: false
            });

            logger.info('User status updated', {
                userId: user._id,
                userEmail: user.email,
                newStatus: status,
                adminId: req.admin?.adminId
            });

            ResponseUtil.success(res, { user }, 'User status updated successfully');

        } catch (error) {
            logger.error('Error updating user status', error, {
                adminId: req.admin?.adminId,
                userId: req.params.id,
                body: req.body
            });
            ResponseUtil.error(res, 'Failed to update user status', 500, error);
        }
    }

    /**
     * Delete user
     * DELETE /api/admin/users/:id
     */
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            
            const user = await User.findByIdAndDelete(id);

            if (!user) {
                return ResponseUtil.notFound(res, 'User not found');
            }

            // Log the deletion
            await Log.createLog({
                action: 'user_deleted',
                details: `User "${user.email}" deleted from system`,
                userId: req.admin?.adminId,
                metadata: {
                    actorRole: 'admin',
                    actorName: req.admin?.name,
                    actorEmail: req.admin?.email,
                    deletedUserId: user._id,
                    deletedUserEmail: user.email,
                    ip: req.ip
                },
                isSystemLog: false
            });

            logger.info('User deleted', {
                userId: user._id,
                userEmail: user.email,
                adminId: req.admin?.adminId
            });

            ResponseUtil.success(res, null, 'User deleted successfully');

        } catch (error) {
            logger.error('Error deleting user', error, {
                adminId: req.admin?.adminId,
                userId: req.params.id
            });
            ResponseUtil.error(res, 'Failed to delete user', 500, error);
        }
    }

    /**
     * Get user statistics
     * GET /api/admin/users/stats
     */
    async getUserStats(req, res) {
        try {
            const stats = await User.aggregate([
                { $match: { role: 'user' } },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const totalUsers = await User.countDocuments({ role: 'user' });
            const recentUsers = await User.countDocuments({
                role: 'user',
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
            });

            const formattedStats = {
                total: totalUsers,
                recent: recentUsers,
                byStatus: stats.reduce((acc, stat) => {
                    acc[stat._id] = stat.count;
                    return acc;
                }, {})
            };

            ResponseUtil.success(res, { stats: formattedStats }, 'User statistics retrieved successfully');

        } catch (error) {
            logger.error('Error retrieving user statistics', error, {
                adminId: req.admin?.adminId
            });
            ResponseUtil.error(res, 'Failed to retrieve user statistics', 500, error);
        }
    }
}

export default new UserController();
