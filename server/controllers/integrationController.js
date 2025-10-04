import Domain from '../models/domainModel.js';
import ApiKey from '../models/apiKeyModel.js';
import IntegrationLog from '../models/integrationLogModel.js';
import UsageStatistics from '../models/usageStatisticsModel.js';
import ResponseUtil from '../utils/response.js';
import logger from '../utils/logger.js';

// ===== DOMAIN MANAGEMENT =====

export const getDomains = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { domain: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [domains, total] = await Promise.all([
      Domain.find(query)
        .populate('apiKey', 'name maskedKey status')
        .populate('createdBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Domain.countDocuments(query)
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    };

    ResponseUtil.success(res, { domains, pagination }, 'Domains retrieved successfully');
  } catch (error) {
    logger.error('Error fetching domains:', error);
    ResponseUtil.error(res, 'Failed to fetch domains', 500, error);
  }
};

export const getDomainById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const domain = await Domain.findById(id)
      .populate('apiKey', 'name maskedKey status permissions')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!domain) {
      return ResponseUtil.notFound(res, 'Domain not found');
    }

    ResponseUtil.success(res, { domain }, 'Domain retrieved successfully');
  } catch (error) {
    logger.error('Error fetching domain:', error);
    ResponseUtil.error(res, 'Failed to fetch domain', 500, error);
  }
};

export const createDomain = async (req, res) => {
  try {
    const {
      domain,
      name,
      description,
      integrationMethod = 'extension',
      settings = {}
    } = req.body;

    // Check if domain already exists
    const existingDomain = await Domain.findOne({ domain: domain.toLowerCase() });
    if (existingDomain) {
      return ResponseUtil.badRequest(res, 'Domain already exists');
    }

    const newDomain = new Domain({
      domain: domain.toLowerCase(),
      name,
      description,
      integrationMethod,
      settings: {
        enableProfanityDetection: settings.enableProfanityDetection ?? true,
        enableSentimentAnalysis: settings.enableSentimentAnalysis ?? true,
        detectionSensitivity: settings.detectionSensitivity || 'medium',
        autoModeration: settings.autoModeration ?? false,
        customRules: settings.customRules || []
      },
      createdBy: req.admin.adminId
    });

    await newDomain.save();

    await newDomain.populate('createdBy', 'name email');

    // Log the domain creation
    await IntegrationLog.create({
      type: 'info',
      level: 'info',
      message: `Domain ${domain} created`,
      source: { type: 'admin', identifier: req.admin.adminId },
      domain: newDomain._id,
      admin: req.admin.adminId
    });

    ResponseUtil.success(res, { domain: newDomain }, 'Domain created successfully', 201);
  } catch (error) {
    logger.error('Error creating domain:', error);
    ResponseUtil.error(res, 'Failed to create domain', 500, error);
  }
};

export const updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const domain = await Domain.findById(id);
    if (!domain) {
      return ResponseUtil.notFound(res, 'Domain not found');
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'status', 'settings'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        domain[field] = updates[field];
      }
    });

    domain.updatedBy = req.admin.adminId;
    await domain.save();

    await domain.populate(['createdBy', 'updatedBy'], 'name email');

    // Log the domain update
    await IntegrationLog.create({
      type: 'info',
      level: 'info',
      message: `Domain ${domain.domain} updated`,
      source: { type: 'admin', identifier: req.admin.adminId },
      domain: domain._id,
      admin: req.admin.adminId,
      details: { updates }
    });

    ResponseUtil.success(res, { domain }, 'Domain updated successfully');
  } catch (error) {
    logger.error('Error updating domain:', error);
    ResponseUtil.error(res, 'Failed to update domain', 500, error);
  }
};

export const deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;

    const domain = await Domain.findById(id);
    if (!domain) {
      return ResponseUtil.notFound(res, 'Domain not found');
    }

    // Check if domain has associated API key
    if (domain.apiKey) {
      return ResponseUtil.badRequest(res, 'Cannot delete domain with associated API key. Remove API key first.');
    }

    await Domain.findByIdAndDelete(id);

    // Log the domain deletion
    await IntegrationLog.create({
      type: 'warning',
      level: 'warn',
      message: `Domain ${domain.domain} deleted`,
      source: { type: 'admin', identifier: req.admin.adminId },
      admin: req.admin.adminId,
      details: { deletedDomain: domain.domain }
    });

    ResponseUtil.success(res, null, 'Domain deleted successfully');
  } catch (error) {
    logger.error('Error deleting domain:', error);
    ResponseUtil.error(res, 'Failed to delete domain', 500, error);
  }
};

export const getDomainStats = async (req, res) => {
  try {
    const stats = await Domain.getDomainStats();
    
    const summary = {
      total: 0,
      active: 0,
      inactive: 0,
      pending: 0,
      blocked: 0,
      totalDetections: 0,
      totalApiCalls: 0
    };

    stats.forEach(stat => {
      summary.total += stat.count;
      summary[stat._id] = stat.count;
      summary.totalDetections += stat.totalDetections || 0;
      summary.totalApiCalls += stat.totalApiCalls || 0;
    });

    ResponseUtil.success(res, { stats: summary }, 'Domain statistics retrieved successfully');
  } catch (error) {
    logger.error('Error fetching domain stats:', error);
    ResponseUtil.error(res, 'Failed to fetch domain statistics', 500, error);
  }
};

// ===== API KEY MANAGEMENT =====

export const getApiKeys = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      type = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { keyPrefix: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [apiKeys, total] = await Promise.all([
      ApiKey.find(query)
        .populate('createdBy', 'name email')
        .populate('lastUsedBy', 'email name')
        .populate('revokedBy', 'name email')
        .select('-key -hashedKey') // Don't return the actual key
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      ApiKey.countDocuments(query)
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    };

    ResponseUtil.success(res, { apiKeys, pagination }, 'API keys retrieved successfully');
  } catch (error) {
    logger.error('Error fetching API keys:', error);
    ResponseUtil.error(res, 'Failed to fetch API keys', 500, error);
  }
};

export const createApiKey = async (req, res) => {
  try {
    const {
      name,
      description,
      type = 'detection_only',
      permissions = [],
      rateLimit = {},
      restrictions = {}
    } = req.body;

    // Generate new API key
    const generatedKey = ApiKey.generateKey();

    // Get default permissions for the type
    const defaultPermissions = permissions.length > 0 ? permissions : ApiKey.getDefaultPermissions(type);

    const apiKey = new ApiKey({
      name,
      description,
      key: generatedKey,
      type,
      permissions: defaultPermissions,
      rateLimit: {
        requestsPerMinute: rateLimit.requestsPerMinute || 100,
        requestsPerHour: rateLimit.requestsPerHour || 1000,
        requestsPerDay: rateLimit.requestsPerDay || 10000
      },
      restrictions: {
        allowedDomains: restrictions.allowedDomains || [],
        allowedIPs: restrictions.allowedIPs || [],
        expiresAt: restrictions.expiresAt ? new Date(restrictions.expiresAt) : null
      },
      createdBy: req.admin.adminId
    });

    await apiKey.save();
    await apiKey.populate('createdBy', 'name email');

    // Log the API key creation
    await IntegrationLog.create({
      type: 'info',
      level: 'info',
      message: `API key ${name} created`,
      source: { type: 'admin', identifier: req.admin.adminId },
      apiKey: apiKey._id,
      admin: req.admin.adminId
    });

    // Return the key only once (for the user to copy)
    const response = apiKey.toObject();
    response.key = generatedKey; // Include the actual key in response
    delete response.hashedKey; // Remove hashed version from response

    ResponseUtil.success(res, { apiKey: response }, 'API key created successfully', 201);
  } catch (error) {
    logger.error('Error creating API key:', error);
    ResponseUtil.error(res, 'Failed to create API key', 500, error);
  }
};

export const updateApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const apiKey = await ApiKey.findById(id);
    if (!apiKey) {
      return ResponseUtil.notFound(res, 'API key not found');
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'status', 'permissions', 'rateLimit', 'restrictions'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        apiKey[field] = updates[field];
      }
    });

    await apiKey.save();
    await apiKey.populate(['createdBy', 'lastUsedBy', 'revokedBy'], 'name email');

    // Log the API key update
    await IntegrationLog.create({
      type: 'info',
      level: 'info',
      message: `API key ${apiKey.name} updated`,
      source: { type: 'admin', identifier: req.admin.adminId },
      apiKey: apiKey._id,
      admin: req.admin.adminId,
      details: { updates }
    });

    // Remove sensitive data from response
    const response = apiKey.toObject();
    delete response.key;
    delete response.hashedKey;

    ResponseUtil.success(res, { apiKey: response }, 'API key updated successfully');
  } catch (error) {
    logger.error('Error updating API key:', error);
    ResponseUtil.error(res, 'Failed to update API key', 500, error);
  }
};

export const revokeApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;

    const apiKey = await ApiKey.findById(id);
    if (!apiKey) {
      return ResponseUtil.notFound(res, 'API key not found');
    }

    if (apiKey.status === 'revoked') {
      return ResponseUtil.badRequest(res, 'API key is already revoked');
    }

    await apiKey.revoke(req.admin.adminId, reason);
    await apiKey.populate(['createdBy', 'revokedBy'], 'name email');

    // Log the API key revocation
    await IntegrationLog.create({
      type: 'warning',
      level: 'warn',
      message: `API key ${apiKey.name} revoked`,
      source: { type: 'admin', identifier: req.admin.adminId },
      apiKey: apiKey._id,
      admin: req.admin.adminId,
      details: { reason }
    });

    // Remove sensitive data from response
    const response = apiKey.toObject();
    delete response.key;
    delete response.hashedKey;

    ResponseUtil.success(res, { apiKey: response }, 'API key revoked successfully');
  } catch (error) {
    logger.error('Error revoking API key:', error);
    ResponseUtil.error(res, 'Failed to revoke API key', 500, error);
  }
};

export const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await ApiKey.findById(id);
    if (!apiKey) {
      return ResponseUtil.notFound(res, 'API key not found');
    }

    // Check if API key is associated with any domains
    const associatedDomains = await Domain.find({ apiKey: id });
    if (associatedDomains.length > 0) {
      return ResponseUtil.badRequest(res, 'Cannot delete API key that is associated with domains. Remove associations first.');
    }

    await ApiKey.findByIdAndDelete(id);

    // Log the API key deletion
    await IntegrationLog.create({
      type: 'warning',
      level: 'warn',
      message: `API key ${apiKey.name} deleted`,
      source: { type: 'admin', identifier: req.admin.adminId },
      admin: req.admin.adminId,
      details: { deletedKey: apiKey.name }
    });

    ResponseUtil.success(res, null, 'API key deleted successfully');
  } catch (error) {
    logger.error('Error deleting API key:', error);
    ResponseUtil.error(res, 'Failed to delete API key', 500, error);
  }
};

// ===== INTEGRATION LOGS =====

export const getIntegrationLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type = '',
      level = '',
      domain = '',
      apiKey = '',
      sourceType = '',
      startDate = '',
      endDate = '',
      search = ''
    } = req.query;

    const filters = {
      limit: parseInt(limit)
    };

    if (type) filters.type = type;
    if (level) filters.level = level;
    if (domain) filters.domain = domain;
    if (apiKey) filters.apiKey = apiKey;
    if (sourceType) filters.sourceType = sourceType;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (search) filters.search = search;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await IntegrationLog.getFilteredLogs(filters);

    // Get total count for pagination
    const query = {};
    if (type) query.type = type;
    if (level) query.level = level;
    if (domain) query.domain = domain;
    if (apiKey) query.apiKey = apiKey;
    if (sourceType) query['source.type'] = sourceType;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { message: { $regex: search, $options: 'i' } },
        { 'details.message': { $regex: search, $options: 'i' } }
      ];
    }

    const total = await IntegrationLog.countDocuments(query);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    };

    ResponseUtil.success(res, { logs, pagination }, 'Integration logs retrieved successfully');
  } catch (error) {
    logger.error('Error fetching integration logs:', error);
    ResponseUtil.error(res, 'Failed to fetch integration logs', 500, error);
  }
};

export const getLogStats = async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;

    const stats = await IntegrationLog.getLogStats(timeframe);

    ResponseUtil.success(res, { stats }, 'Log statistics retrieved successfully');
  } catch (error) {
    logger.error('Error fetching log stats:', error);
    ResponseUtil.error(res, 'Failed to fetch log statistics', 500, error);
  }
};

// ===== USAGE STATISTICS =====

export const getUsageStatistics = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      period = 'daily',
      domain = '',
      apiKey = ''
    } = req.query;

    if (!startDate || !endDate) {
      return ResponseUtil.badRequest(res, 'Start date and end date are required');
    }

    const filters = {};
    if (domain) filters.domain = domain;
    if (apiKey) filters.apiKey = apiKey;

    const stats = await UsageStatistics.getStatsForRange(
      new Date(startDate),
      new Date(endDate),
      period,
      filters
    );

    ResponseUtil.success(res, { statistics: stats }, 'Usage statistics retrieved successfully');
  } catch (error) {
    logger.error('Error fetching usage statistics:', error);
    ResponseUtil.error(res, 'Failed to fetch usage statistics', 500, error);
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;

    const [summary] = await UsageStatistics.getDashboardSummary(timeframe);

    ResponseUtil.success(res, { summary: summary || {} }, 'Dashboard summary retrieved successfully');
  } catch (error) {
    logger.error('Error fetching dashboard summary:', error);
    ResponseUtil.error(res, 'Failed to fetch dashboard summary', 500, error);
  }
};

export const getTopPerformers = async (req, res) => {
  try {
    const {
      metric = 'totalRequests',
      limit = 10,
      period = 'daily'
    } = req.query;

    const performers = await UsageStatistics.getTopPerformers(metric, parseInt(limit), period);

    ResponseUtil.success(res, { performers }, 'Top performers retrieved successfully');
  } catch (error) {
    logger.error('Error fetching top performers:', error);
    ResponseUtil.error(res, 'Failed to fetch top performers', 500, error);
  }
};
