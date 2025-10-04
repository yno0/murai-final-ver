import express from 'express';
import { authenticateAdmin } from '../middleware/adminAuth.js';
import FlaggedContent from '../models/flaggedContentModel.js';
import ResponseUtil from '../utils/response.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

/**
 * GET /api/admin/analytics/sentiment-trends
 * Get sentiment analysis trends over time
 */
router.get('/sentiment-trends', async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Aggregate sentiment data by day
    const sentimentData = await FlaggedContent.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isActive: { $ne: false }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            sentiment: "$sentiment"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          sentiments: {
            $push: {
              sentiment: "$_id.sentiment",
              count: "$count"
            }
          },
          total: { $sum: "$count" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Process data to ensure all sentiment types are represented
    const processedData = sentimentData.map(day => {
      const sentimentMap = { negative: 0, neutral: 0, positive: 0 };
      
      day.sentiments.forEach(s => {
        if (s.sentiment && sentimentMap.hasOwnProperty(s.sentiment)) {
          sentimentMap[s.sentiment] = s.count;
        }
      });

      return {
        date: day._id,
        negative: sentimentMap.negative,
        neutral: sentimentMap.neutral,
        positive: sentimentMap.positive,
        total: day.total
      };
    });

    // Calculate analytics
    const totalEntries = processedData.reduce((sum, day) => sum + day.total, 0);
    const avgNegative = processedData.length > 0 
      ? Math.round(processedData.reduce((sum, day) => sum + day.negative, 0) / processedData.length)
      : 0;
    const avgNeutral = processedData.length > 0
      ? Math.round(processedData.reduce((sum, day) => sum + day.neutral, 0) / processedData.length)
      : 0;
    const avgPositive = processedData.length > 0
      ? Math.round(processedData.reduce((sum, day) => sum + day.positive, 0) / processedData.length)
      : 0;

    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(processedData.length / 2);
    const firstHalf = processedData.slice(0, midPoint);
    const secondHalf = processedData.slice(midPoint);
    
    const firstHalfNeg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, day) => sum + day.negative, 0) / firstHalf.length
      : 0;
    const secondHalfNeg = secondHalf.length > 0
      ? secondHalf.reduce((sum, day) => sum + day.negative, 0) / secondHalf.length
      : 0;
    
    const negativeChange = firstHalfNeg > 0 
      ? Math.round(((secondHalfNeg - firstHalfNeg) / firstHalfNeg) * 100)
      : 0;

    const analytics = {
      totalEntries,
      avgNegative,
      avgNeutral,
      avgPositive,
      negativeChange,
      trend: negativeChange > 0 ? 'up' : negativeChange < 0 ? 'down' : 'neutral'
    };

    ResponseUtil.success(res, { data: processedData, analytics }, 'Sentiment trends retrieved successfully');
  } catch (error) {
    logger.error('Error fetching sentiment trends:', error);
    ResponseUtil.error(res, 'Failed to fetch sentiment trends', 500, error);
  }
});

/**
 * GET /api/admin/analytics/word-frequency
 * Get offensive word frequency analysis
 */
router.get('/word-frequency', async (req, res) => {
  try {
    const { timeRange = 'week', language = 'all' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Build match criteria
    const matchCriteria = {
      createdAt: { $gte: startDate },
      isActive: { $ne: false },
      detectedWord: { $exists: true, $ne: null, $ne: '' }
    };

    if (language !== 'all') {
      matchCriteria.language = language;
    }

    // Aggregate word frequency data
    const wordData = await FlaggedContent.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            word: { $toLower: "$detectedWord" },
            language: "$language",
            severity: "$metadata.severity"
          },
          count: { $sum: 1 },
          avgConfidence: { $avg: "$confidenceScore" }
        }
      },
      {
        $group: {
          _id: "$_id.word",
          count: { $sum: "$count" },
          languages: { $addToSet: "$_id.language" },
          severities: { $addToSet: "$_id.severity" },
          avgConfidence: { $avg: "$avgConfidence" }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 50
      }
    ]);

    // Process data and calculate trends (mock trend calculation for now)
    const processedData = wordData.map((item, index) => ({
      word: item._id,
      count: item.count,
      language: item.languages[0] || 'Unknown',
      severity: item.severities.includes('high') ? 'high' : 
                item.severities.includes('medium') ? 'medium' : 'low',
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change: Math.floor(Math.random() * 30) - 15 // -15 to +15
    }));

    // Calculate analytics
    const totalDetections = processedData.reduce((sum, word) => sum + word.count, 0);
    const uniqueWords = processedData.length;
    const highSeverity = processedData.filter(word => word.severity === 'high').length;
    const trendingUp = processedData.filter(word => word.trend === 'up').length;

    const analytics = {
      totalDetections,
      uniqueWords,
      highSeverity,
      trendingUp
    };

    ResponseUtil.success(res, { data: processedData, analytics }, 'Word frequency data retrieved successfully');
  } catch (error) {
    logger.error('Error fetching word frequency:', error);
    ResponseUtil.error(res, 'Failed to fetch word frequency data', 500, error);
  }
});

/**
 * GET /api/admin/analytics/website-analytics
 * Get website/domain analytics
 */
router.get('/website-analytics', async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Aggregate website data
    const websiteData = await FlaggedContent.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isActive: { $ne: false },
          sourceUrl: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $addFields: {
          domain: {
            $let: {
              vars: {
                url: { $split: ["$sourceUrl", "/"] }
              },
              in: { $arrayElemAt: ["$$url", 2] }
            }
          }
        }
      },
      {
        $group: {
          _id: "$domain",
          flaggedCount: { $sum: 1 },
          topWords: { $addToSet: "$detectedWord" },
          severities: { $push: "$metadata.severity" },
          avgConfidence: { $avg: "$confidenceScore" }
        }
      },
      {
        $sort: { flaggedCount: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Process data and add mock total scanned counts
    const processedData = websiteData.map(site => {
      const flaggedCount = site.flaggedCount;
      const totalScanned = Math.floor(flaggedCount * (10 + Math.random() * 40)); // Mock total scanned
      const flaggedRate = ((flaggedCount / totalScanned) * 100).toFixed(1);
      
      const severityCounts = {
        high: site.severities.filter(s => s === 'high').length,
        medium: site.severities.filter(s => s === 'medium').length,
        low: site.severities.filter(s => s === 'low').length
      };

      return {
        domain: site._id || 'Unknown',
        flaggedCount,
        totalScanned,
        flaggedRate: parseFloat(flaggedRate),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: Math.floor(Math.random() * 30) - 15,
        topWords: site.topWords.filter(w => w).slice(0, 5),
        severity: severityCounts
      };
    });

    // Calculate analytics
    const totalFlagged = processedData.reduce((sum, site) => sum + site.flaggedCount, 0);
    const totalScanned = processedData.reduce((sum, site) => sum + site.totalScanned, 0);
    const avgFlaggedRate = totalScanned > 0 ? (totalFlagged / totalScanned * 100).toFixed(1) : '0.0';
    const activeSites = processedData.length;
    const highRiskSites = processedData.filter(site => site.flaggedRate > 5).length;

    const analytics = {
      totalFlagged,
      totalScanned,
      avgFlaggedRate: parseFloat(avgFlaggedRate),
      activeSites,
      highRiskSites
    };

    ResponseUtil.success(res, { data: processedData, analytics }, 'Website analytics retrieved successfully');
  } catch (error) {
    logger.error('Error fetching website analytics:', error);
    ResponseUtil.error(res, 'Failed to fetch website analytics', 500, error);
  }
});

/**
 * GET /api/admin/analytics/language-analytics
 * Get language-specific analytics
 */
router.get('/language-analytics', async (req, res) => {
  try {
    const { timeRange = 'week' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Aggregate language data
    const languageData = await FlaggedContent.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isActive: { $ne: false },
          language: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: "$language",
          flaggedCount: { $sum: 1 },
          topWords: { $addToSet: "$detectedWord" },
          severities: { $push: "$metadata.severity" },
          avgConfidence: { $avg: "$confidenceScore" },
          sources: { $addToSet: "$sourceUrl" }
        }
      },
      {
        $sort: { flaggedCount: -1 }
      }
    ]);

    // Process data and add mock total content counts
    const processedData = languageData.map(lang => {
      const flaggedCount = lang.flaggedCount;
      const totalContent = Math.floor(flaggedCount * (15 + Math.random() * 50)); // Mock total content
      const flaggedRate = ((flaggedCount / totalContent) * 100).toFixed(1);

      const severityCounts = {
        high: lang.severities.filter(s => s === 'high').length,
        medium: lang.severities.filter(s => s === 'medium').length,
        low: lang.severities.filter(s => s === 'low').length
      };

      return {
        language: lang._id,
        flaggedCount,
        totalContent,
        flaggedRate: parseFloat(flaggedRate),
        trend: Math.random() > 0.5 ? 'up' : 'down',
        change: Math.floor(Math.random() * 30) - 15,
        topWords: lang.topWords.filter(w => w).slice(0, 5),
        severity: severityCounts
      };
    });

    // Calculate analytics
    const totalFlagged = processedData.reduce((sum, lang) => sum + lang.flaggedCount, 0);
    const totalContent = processedData.reduce((sum, lang) => sum + lang.totalContent, 0);
    const avgFlaggedRate = totalContent > 0 ? (totalFlagged / totalContent * 100).toFixed(1) : '0.0';
    const activeLanguages = processedData.length;
    const dominantLanguage = processedData.length > 0
      ? processedData.reduce((prev, current) => prev.flaggedCount > current.flaggedCount ? prev : current)
      : null;

    const analytics = {
      totalFlagged,
      totalContent,
      avgFlaggedRate: parseFloat(avgFlaggedRate),
      activeLanguages,
      dominantLanguage: dominantLanguage ? dominantLanguage.language : 'None',
      dominantCount: dominantLanguage ? dominantLanguage.flaggedCount : 0
    };

    ResponseUtil.success(res, { data: processedData, analytics }, 'Language analytics retrieved successfully');
  } catch (error) {
    logger.error('Error fetching language analytics:', error);
    ResponseUtil.error(res, 'Failed to fetch language analytics', 500, error);
  }
});

/**
 * GET /api/admin/analytics/flagged-content-kpis
 * Get KPI data for flagged content page
 */
router.get('/flagged-content-kpis', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalFlagged,
      todayFlagged,
      yesterdayFlagged,
      lastWeekFlagged,
      highSeverityCount,
      avgResponseTime
    ] = await Promise.all([
      // Total flagged content
      FlaggedContent.countDocuments({ isActive: { $ne: false } }),

      // Today's flagged content
      FlaggedContent.countDocuments({
        createdAt: { $gte: today },
        isActive: { $ne: false }
      }),

      // Yesterday's flagged content
      FlaggedContent.countDocuments({
        createdAt: { $gte: yesterday, $lt: today },
        isActive: { $ne: false }
      }),

      // Last week's flagged content
      FlaggedContent.countDocuments({
        createdAt: { $gte: lastWeek, $lt: today },
        isActive: { $ne: false }
      }),

      // High severity content
      FlaggedContent.countDocuments({
        'metadata.severity': { $in: ['high', 'extreme'] },
        isActive: { $ne: false }
      }),

      // Mock average response time calculation
      Promise.resolve(Math.floor(Math.random() * 120) + 60) // 60-180 minutes
    ]);

    // Calculate growth percentages
    const todayGrowth = yesterdayFlagged > 0
      ? Math.round(((todayFlagged - yesterdayFlagged) / yesterdayFlagged) * 100)
      : 0;

    const weekGrowth = Math.floor(Math.random() * 20) - 10; // Mock week growth

    const kpiData = {
      totalFlagged: {
        value: totalFlagged,
        growth: weekGrowth,
        trend: weekGrowth >= 0 ? 'up' : 'down'
      },
      todayFlagged: {
        value: todayFlagged,
        growth: todayGrowth,
        trend: todayGrowth >= 0 ? 'up' : 'down'
      },
      highSeverity: {
        value: highSeverityCount,
        growth: Math.floor(Math.random() * 15) - 5, // Mock growth
        trend: Math.random() > 0.5 ? 'up' : 'down'
      },
      avgResponseTime: {
        value: avgResponseTime,
        growth: Math.floor(Math.random() * 10) - 5, // Mock growth
        trend: Math.random() > 0.5 ? 'up' : 'down'
      }
    };

    ResponseUtil.success(res, kpiData, 'Flagged content KPIs retrieved successfully');
  } catch (error) {
    logger.error('Error fetching flagged content KPIs:', error);
    ResponseUtil.error(res, 'Failed to fetch flagged content KPIs', 500, error);
  }
});

export default router;
