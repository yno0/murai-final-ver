import mongoose from 'mongoose';

const usageStatisticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  period: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    required: true
  },
  domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Domain'
  },
  apiKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey'
  },
  metrics: {
    // API Usage Metrics
    totalRequests: {
      type: Number,
      default: 0
    },
    successfulRequests: {
      type: Number,
      default: 0
    },
    failedRequests: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    totalResponseTime: {
      type: Number,
      default: 0
    },
    
    // Detection Metrics
    totalDetections: {
      type: Number,
      default: 0
    },
    profanityDetections: {
      type: Number,
      default: 0
    },
    sentimentDetections: {
      type: Number,
      default: 0
    },
    customRuleDetections: {
      type: Number,
      default: 0
    },
    
    // Content Analysis Metrics
    contentAnalyzed: {
      type: Number,
      default: 0
    },
    averageContentLength: {
      type: Number,
      default: 0
    },
    totalContentLength: {
      type: Number,
      default: 0
    },
    
    // User Engagement Metrics
    uniqueUsers: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    newUsers: {
      type: Number,
      default: 0
    },
    
    // Performance Metrics
    uptime: {
      type: Number,
      default: 100 // percentage
    },
    errorRate: {
      type: Number,
      default: 0 // percentage
    },
    throughput: {
      type: Number,
      default: 0 // requests per second
    },
    
    // Bandwidth Metrics
    totalBandwidth: {
      type: Number,
      default: 0 // bytes
    },
    averageRequestSize: {
      type: Number,
      default: 0 // bytes
    },
    averageResponseSize: {
      type: Number,
      default: 0 // bytes
    }
  },
  breakdown: {
    // Hourly breakdown for daily stats
    hourly: [{
      hour: Number,
      requests: Number,
      detections: Number,
      responseTime: Number
    }],
    
    // Status code breakdown
    statusCodes: [{
      code: Number,
      count: Number
    }],
    
    // Endpoint breakdown
    endpoints: [{
      path: String,
      count: Number,
      avgResponseTime: Number
    }],
    
    // Detection type breakdown
    detectionTypes: [{
      type: String,
      count: Number,
      percentage: Number
    }],
    
    // Geographic breakdown
    geographic: [{
      country: String,
      region: String,
      requests: Number,
      detections: Number
    }]
  },
  aggregatedFrom: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UsageStatistics'
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient querying
usageStatisticsSchema.index({ date: -1, period: 1 });
usageStatisticsSchema.index({ domain: 1, date: -1, period: 1 });
usageStatisticsSchema.index({ apiKey: 1, date: -1, period: 1 });
usageStatisticsSchema.index({ period: 1, date: -1 });

// Unique constraint to prevent duplicate entries
usageStatisticsSchema.index(
  { date: 1, period: 1, domain: 1, apiKey: 1 },
  { unique: true, sparse: true }
);

// TTL index to automatically delete old statistics (keep for 2 years)
usageStatisticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });

// Virtual for success rate
usageStatisticsSchema.virtual('successRate').get(function() {
  if (this.metrics.totalRequests === 0) return 0;
  return (this.metrics.successfulRequests / this.metrics.totalRequests) * 100;
});

// Virtual for error rate percentage
usageStatisticsSchema.virtual('errorRatePercentage').get(function() {
  if (this.metrics.totalRequests === 0) return 0;
  return (this.metrics.failedRequests / this.metrics.totalRequests) * 100;
});

// Method to update metrics
usageStatisticsSchema.methods.updateMetrics = function(data) {
  const metrics = this.metrics;
  
  // Update request metrics
  if (data.requests) {
    metrics.totalRequests += data.requests.total || 0;
    metrics.successfulRequests += data.requests.successful || 0;
    metrics.failedRequests += data.requests.failed || 0;
  }
  
  // Update response time
  if (data.responseTime) {
    const totalTime = metrics.totalResponseTime + data.responseTime;
    const totalRequests = metrics.totalRequests;
    metrics.averageResponseTime = totalRequests > 0 ? totalTime / totalRequests : 0;
    metrics.totalResponseTime = totalTime;
  }
  
  // Update detection metrics
  if (data.detections) {
    metrics.totalDetections += data.detections.total || 0;
    metrics.profanityDetections += data.detections.profanity || 0;
    metrics.sentimentDetections += data.detections.sentiment || 0;
    metrics.customRuleDetections += data.detections.customRule || 0;
  }
  
  // Update content metrics
  if (data.content) {
    metrics.contentAnalyzed += data.content.count || 0;
    const totalLength = metrics.totalContentLength + (data.content.totalLength || 0);
    metrics.averageContentLength = metrics.contentAnalyzed > 0 ? totalLength / metrics.contentAnalyzed : 0;
    metrics.totalContentLength = totalLength;
  }
  
  // Update user metrics
  if (data.users) {
    metrics.uniqueUsers = Math.max(metrics.uniqueUsers, data.users.unique || 0);
    metrics.activeUsers = data.users.active || metrics.activeUsers;
    metrics.newUsers += data.users.new || 0;
  }
  
  return this.save();
};

// Static method to create or update statistics
usageStatisticsSchema.statics.createOrUpdate = async function(date, period, filters, data) {
  const query = { date, period };
  
  if (filters.domain) query.domain = filters.domain;
  if (filters.apiKey) query.apiKey = filters.apiKey;
  
  let stats = await this.findOne(query);
  
  if (!stats) {
    stats = new this({
      date,
      period,
      domain: filters.domain,
      apiKey: filters.apiKey,
      metrics: {}
    });
  }
  
  await stats.updateMetrics(data);
  return stats;
};

// Static method to get statistics for a time range
usageStatisticsSchema.statics.getStatsForRange = function(startDate, endDate, period = 'daily', filters = {}) {
  const query = {
    date: { $gte: startDate, $lte: endDate },
    period
  };
  
  if (filters.domain) query.domain = filters.domain;
  if (filters.apiKey) query.apiKey = filters.apiKey;
  
  return this.find(query)
    .populate('domain', 'domain name')
    .populate('apiKey', 'name maskedKey')
    .sort({ date: 1 });
};

// Static method to aggregate statistics
usageStatisticsSchema.statics.aggregateStats = function(startDate, endDate, groupBy = 'domain') {
  const matchStage = {
    date: { $gte: startDate, $lte: endDate }
  };
  
  const groupStage = {
    _id: groupBy === 'domain' ? '$domain' : '$apiKey',
    totalRequests: { $sum: '$metrics.totalRequests' },
    totalDetections: { $sum: '$metrics.totalDetections' },
    avgResponseTime: { $avg: '$metrics.averageResponseTime' },
    totalBandwidth: { $sum: '$metrics.totalBandwidth' },
    uniqueUsers: { $max: '$metrics.uniqueUsers' },
    errorRate: { $avg: '$metrics.errorRate' }
  };
  
  return this.aggregate([
    { $match: matchStage },
    { $group: groupStage },
    {
      $lookup: {
        from: groupBy === 'domain' ? 'domains' : 'apikeys',
        localField: '_id',
        foreignField: '_id',
        as: 'details'
      }
    },
    { $unwind: '$details' },
    { $sort: { totalRequests: -1 } }
  ]);
};

// Static method to get top performing domains/keys
usageStatisticsSchema.statics.getTopPerformers = function(metric = 'totalRequests', limit = 10, period = 'daily') {
  const today = new Date();
  const startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate },
        period
      }
    },
    {
      $group: {
        _id: '$domain',
        totalMetric: { $sum: `$metrics.${metric}` },
        avgMetric: { $avg: `$metrics.${metric}` },
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'domains',
        localField: '_id',
        foreignField: '_id',
        as: 'domain'
      }
    },
    { $unwind: '$domain' },
    { $sort: { totalMetric: -1 } },
    { $limit: limit }
  ]);
};

// Static method to generate dashboard summary
usageStatisticsSchema.statics.getDashboardSummary = function(timeframe = '24h') {
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
    { $match: { date: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: '$metrics.totalRequests' },
        totalDetections: { $sum: '$metrics.totalDetections' },
        avgResponseTime: { $avg: '$metrics.averageResponseTime' },
        totalBandwidth: { $sum: '$metrics.totalBandwidth' },
        avgErrorRate: { $avg: '$metrics.errorRate' },
        uniqueDomains: { $addToSet: '$domain' },
        uniqueApiKeys: { $addToSet: '$apiKey' }
      }
    },
    {
      $project: {
        _id: 0,
        totalRequests: 1,
        totalDetections: 1,
        avgResponseTime: 1,
        totalBandwidth: 1,
        avgErrorRate: 1,
        uniqueDomains: { $size: { $ifNull: ['$uniqueDomains', []] } },
        uniqueApiKeys: { $size: { $ifNull: ['$uniqueApiKeys', []] } }
      }
    }
  ]);
};

const UsageStatistics = mongoose.model('UsageStatistics', usageStatisticsSchema);

export default UsageStatistics;
