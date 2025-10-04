import mongoose from 'mongoose';
import crypto from 'crypto';

const apiKeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  keyPrefix: {
    type: String,
    required: true
  },
  hashedKey: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'revoked', 'expired'],
    default: 'active'
  },
  type: {
    type: String,
    enum: ['full_access', 'read_only', 'detection_only', 'analytics_only', 'custom'],
    default: 'detection_only'
  },
  permissions: [{
    resource: {
      type: String,
      required: true
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete']
    }]
  }],
  rateLimit: {
    requestsPerMinute: {
      type: Number,
      default: 100
    },
    requestsPerHour: {
      type: Number,
      default: 1000
    },
    requestsPerDay: {
      type: Number,
      default: 10000
    }
  },
  usage: {
    totalRequests: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    },
    requestsToday: {
      type: Number,
      default: 0
    },
    requestsThisMonth: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  restrictions: {
    allowedDomains: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    allowedIPs: [{
      type: String,
      trim: true
    }],
    expiresAt: {
      type: Date
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  lastUsedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  revokedAt: {
    type: Date
  },
  revokedReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
apiKeySchema.index({ key: 1 });
apiKeySchema.index({ keyPrefix: 1 });
apiKeySchema.index({ status: 1 });
apiKeySchema.index({ createdAt: -1 });
apiKeySchema.index({ 'usage.lastUsed': -1 });

// Virtual for masked key display
apiKeySchema.virtual('maskedKey').get(function() {
  if (!this.key) return '';
  return this.keyPrefix + '...' + this.key.slice(-4);
});

// Pre-save middleware to hash the key
apiKeySchema.pre('save', function(next) {
  if (this.isNew && this.key) {
    // Generate key prefix for display
    this.keyPrefix = this.key.substring(0, 8);
    
    // Hash the full key for storage
    this.hashedKey = crypto.createHash('sha256').update(this.key).digest('hex');
  }
  next();
});

// Method to verify API key
apiKeySchema.methods.verifyKey = function(providedKey) {
  const hashedProvidedKey = crypto.createHash('sha256').update(providedKey).digest('hex');
  return this.hashedKey === hashedProvidedKey;
};

// Method to check if key is valid
apiKeySchema.methods.isValid = function() {
  if (this.status !== 'active') return false;
  if (this.restrictions.expiresAt && this.restrictions.expiresAt < new Date()) {
    this.status = 'expired';
    this.save();
    return false;
  }
  return true;
};

// Method to check rate limits
apiKeySchema.methods.checkRateLimit = function(timeframe = 'minute') {
  const now = new Date();
  const usage = this.usage;
  
  // Reset daily counter if needed
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!usage.lastResetDate || usage.lastResetDate < today) {
    usage.requestsToday = 0;
    usage.lastResetDate = today;
  }
  
  switch (timeframe) {
    case 'minute':
      // For minute-based rate limiting, we'd need more sophisticated tracking
      return usage.requestsToday < this.rateLimit.requestsPerDay;
    case 'hour':
      return usage.requestsToday < this.rateLimit.requestsPerDay;
    case 'day':
      return usage.requestsToday < this.rateLimit.requestsPerDay;
    default:
      return true;
  }
};

// Method to record usage
apiKeySchema.methods.recordUsage = function(userId = null) {
  this.usage.totalRequests += 1;
  this.usage.requestsToday += 1;
  this.usage.lastUsed = new Date();
  
  if (userId) {
    this.lastUsedBy = userId;
  }
  
  return this.save();
};

// Method to revoke key
apiKeySchema.methods.revoke = function(adminId, reason = '') {
  this.status = 'revoked';
  this.revokedBy = adminId;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

// Static method to generate new API key
apiKeySchema.statics.generateKey = function() {
  const prefix = 'murai_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return prefix + randomBytes;
};

// Static method to get default permissions for key type
apiKeySchema.statics.getDefaultPermissions = function(type) {
  const permissionSets = {
    full_access: [
      { resource: 'detections', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'dictionary', actions: ['read'] },
      { resource: 'reports', actions: ['create', 'read'] }
    ],
    read_only: [
      { resource: 'detections', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'dictionary', actions: ['read'] }
    ],
    detection_only: [
      { resource: 'detections', actions: ['create', 'read'] }
    ],
    analytics_only: [
      { resource: 'analytics', actions: ['read'] }
    ],
    custom: []
  };
  
  return permissionSets[type] || [];
};

// Static method to find active keys
apiKeySchema.statics.findActiveKeys = function() {
  return this.find({ status: 'active' }).populate('createdBy', 'name email').sort({ createdAt: -1 });
};

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
