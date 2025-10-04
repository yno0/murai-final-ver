import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'blocked'],
    default: 'pending'
  },
  integrationMethod: {
    type: String,
    enum: ['extension', 'api', 'widget', 'iframe'],
    default: 'extension'
  },
  settings: {
    enableProfanityDetection: {
      type: Boolean,
      default: true
    },
    enableSentimentAnalysis: {
      type: Boolean,
      default: true
    },
    detectionSensitivity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    autoModeration: {
      type: Boolean,
      default: false
    },
    customRules: [{
      name: String,
      pattern: String,
      action: {
        type: String,
        enum: ['flag', 'block', 'warn'],
        default: 'flag'
      }
    }]
  },
  statistics: {
    totalDetections: {
      type: Number,
      default: 0
    },
    lastDetection: {
      type: Date
    },
    averageDetectionsPerDay: {
      type: Number,
      default: 0
    },
    totalApiCalls: {
      type: Number,
      default: 0
    },
    lastApiCall: {
      type: Date
    }
  },
  health: {
    status: {
      type: String,
      enum: ['healthy', 'warning', 'error', 'unknown'],
      default: 'unknown'
    },
    lastCheck: {
      type: Date
    },
    uptime: {
      type: Number, // percentage
      default: 0
    },
    responseTime: {
      type: Number, // milliseconds
      default: 0
    },
    errorRate: {
      type: Number, // percentage
      default: 0
    }
  },
  apiKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
domainSchema.index({ domain: 1 });
domainSchema.index({ status: 1 });
domainSchema.index({ createdAt: -1 });
domainSchema.index({ 'statistics.lastDetection': -1 });

// Virtual for domain URL
domainSchema.virtual('url').get(function() {
  return `https://${this.domain}`;
});

// Method to update statistics
domainSchema.methods.updateStatistics = function(detectionCount = 0, apiCallCount = 0) {
  this.statistics.totalDetections += detectionCount;
  this.statistics.totalApiCalls += apiCallCount;
  
  if (detectionCount > 0) {
    this.statistics.lastDetection = new Date();
  }
  
  if (apiCallCount > 0) {
    this.statistics.lastApiCall = new Date();
  }
  
  // Calculate average detections per day
  const daysSinceCreation = Math.max(1, Math.ceil((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)));
  this.statistics.averageDetectionsPerDay = Math.round(this.statistics.totalDetections / daysSinceCreation);
  
  return this.save();
};

// Method to update health status
domainSchema.methods.updateHealth = function(status, responseTime = null, errorRate = null) {
  this.health.status = status;
  this.health.lastCheck = new Date();
  
  if (responseTime !== null) {
    this.health.responseTime = responseTime;
  }
  
  if (errorRate !== null) {
    this.health.errorRate = errorRate;
  }
  
  return this.save();
};

// Static method to get active domains
domainSchema.statics.getActiveDomains = function() {
  return this.find({ status: 'active' }).populate('apiKey').sort({ createdAt: -1 });
};

// Static method to get domain statistics
domainSchema.statics.getDomainStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalDetections: { $sum: '$statistics.totalDetections' },
        totalApiCalls: { $sum: '$statistics.totalApiCalls' }
      }
    }
  ]);
};

const Domain = mongoose.model('Domain', domainSchema);

export default Domain;
