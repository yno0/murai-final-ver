import mongoose from 'mongoose';

const integrationLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['api_request', 'extension_activity', 'domain_health', 'key_usage', 'error', 'warning', 'info'],
    required: true
  },
  level: {
    type: String,
    enum: ['error', 'warn', 'info', 'debug'],
    default: 'info'
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  source: {
    type: {
      type: String,
      enum: ['api', 'extension', 'system', 'admin'],
      required: true
    },
    identifier: {
      type: String, // API key ID, extension ID, system component, admin ID
      trim: true
    },
    version: {
      type: String,
      trim: true
    }
  },
  request: {
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      uppercase: true
    },
    endpoint: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    },
    ip: {
      type: String,
      trim: true
    },
    headers: {
      type: mongoose.Schema.Types.Mixed
    },
    body: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  response: {
    statusCode: {
      type: Number
    },
    responseTime: {
      type: Number // milliseconds
    },
    size: {
      type: Number // bytes
    },
    data: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  },
  apiKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  error: {
    name: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
    stack: {
      type: String,
      trim: true
    },
    code: {
      type: String,
      trim: true
    }
  },
  metadata: {
    sessionId: {
      type: String,
      trim: true
    },
    correlationId: {
      type: String,
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'production'
    },
    location: {
      country: String,
      region: String,
      city: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
integrationLogSchema.index({ type: 1, createdAt: -1 });
integrationLogSchema.index({ level: 1, createdAt: -1 });
integrationLogSchema.index({ 'source.type': 1, createdAt: -1 });
integrationLogSchema.index({ domain: 1, createdAt: -1 });
integrationLogSchema.index({ apiKey: 1, createdAt: -1 });
integrationLogSchema.index({ createdAt: -1 });
integrationLogSchema.index({ 'response.statusCode': 1, createdAt: -1 });

// Compound indexes for common queries
integrationLogSchema.index({ type: 1, level: 1, createdAt: -1 });
integrationLogSchema.index({ domain: 1, type: 1, createdAt: -1 });

// TTL index to automatically delete old logs (keep for 90 days)
integrationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Virtual for formatted timestamp
integrationLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toISOString();
});

// Method to add context information
integrationLogSchema.methods.addContext = function(context) {
  this.metadata = { ...this.metadata, ...context };
  return this.save();
};

// Static method to log API request
integrationLogSchema.statics.logApiRequest = function(data) {
  return this.create({
    type: 'api_request',
    level: data.statusCode >= 400 ? 'error' : 'info',
    message: `${data.method} ${data.endpoint} - ${data.statusCode}`,
    source: {
      type: 'api',
      identifier: data.apiKeyId,
      version: data.version
    },
    request: {
      method: data.method,
      endpoint: data.endpoint,
      userAgent: data.userAgent,
      ip: data.ip,
      headers: data.headers,
      body: data.body
    },
    response: {
      statusCode: data.statusCode,
      responseTime: data.responseTime,
      size: data.responseSize,
      data: data.responseData
    },
    domain: data.domainId,
    apiKey: data.apiKeyId,
    user: data.userId
  });
};

// Static method to log extension activity
integrationLogSchema.statics.logExtensionActivity = function(data) {
  return this.create({
    type: 'extension_activity',
    level: 'info',
    message: data.message,
    details: data.details,
    source: {
      type: 'extension',
      identifier: data.extensionId,
      version: data.extensionVersion
    },
    domain: data.domainId,
    user: data.userId,
    metadata: {
      sessionId: data.sessionId,
      tags: data.tags || []
    }
  });
};

// Static method to log errors
integrationLogSchema.statics.logError = function(error, context = {}) {
  return this.create({
    type: 'error',
    level: 'error',
    message: error.message || 'Unknown error',
    source: {
      type: context.sourceType || 'system',
      identifier: context.sourceId,
      version: context.version
    },
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    },
    domain: context.domainId,
    apiKey: context.apiKeyId,
    user: context.userId,
    admin: context.adminId,
    metadata: {
      correlationId: context.correlationId,
      tags: context.tags || [],
      environment: process.env.NODE_ENV || 'production'
    }
  });
};

// Static method to get logs with filters
integrationLogSchema.statics.getFilteredLogs = function(filters = {}) {
  const query = {};
  
  if (filters.type) query.type = filters.type;
  if (filters.level) query.level = filters.level;
  if (filters.domain) query.domain = filters.domain;
  if (filters.apiKey) query.apiKey = filters.apiKey;
  if (filters.sourceType) query['source.type'] = filters.sourceType;
  
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }
  
  if (filters.search) {
    query.$or = [
      { message: { $regex: filters.search, $options: 'i' } },
      { 'details.message': { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  return this.find(query)
    .populate('domain', 'domain name')
    .populate('apiKey', 'name maskedKey')
    .populate('user', 'email name')
    .populate('admin', 'name email')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100);
};

// Static method to get log statistics
integrationLogSchema.statics.getLogStats = function(timeframe = '24h') {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
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
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          type: '$type',
          level: '$level'
        },
        count: { $sum: 1 },
        avgResponseTime: { $avg: '$response.responseTime' }
      }
    },
    {
      $group: {
        _id: '$_id.type',
        levels: {
          $push: {
            level: '$_id.level',
            count: '$count',
            avgResponseTime: '$avgResponseTime'
          }
        },
        totalCount: { $sum: '$count' }
      }
    }
  ]);
};

const IntegrationLog = mongoose.model('IntegrationLog', integrationLogSchema);

export default IntegrationLog;
