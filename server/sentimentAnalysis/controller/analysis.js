import * as SentimentOrchestrator from '../services/orchestrator.js';
import Analysis from '../models/Analysis.js';
import {
  sendSuccessResponse,
  sendErrorResponse
} from '../../helpers/responseHelpers.js';

export const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return sendErrorResponse(res, 'Text is required', 400);
    }

    const startTime = Date.now();
    const result = await SentimentOrchestrator.analyzeText(text);
    const processingTime = Date.now() - startTime;

    // Save to database
    const analysis = await Analysis.create({
      user: req.user._id,
      query: text.substring(0, 100),
      source: 'text',
      sentiment: {
        overall: result.sentiment,
        scores: result.scores,
        percentages: {
          positive: result.sentiment === 'positive' ? 100 : 0,
          negative: result.sentiment === 'negative' ? 100 : 0,
          neutral: result.sentiment === 'neutral' ? 100 : 0
        }
      },
      totalAnalyzed: 1,
      samplePosts: [{
        text: text,
        platform: 'text',
        sentiment: result.sentiment,
        confidence: Math.round(result.confidence * 100),
        created_at: new Date()
      }],
      metadata: {
        processingTime
      }
    });

    return sendSuccessResponse(res, 'Text analyzed successfully', {
      analysisId: analysis._id,
      sentiment: result.sentiment,
      scores: result.scores,
      confidence: result.confidence,
      processingTime
    });
  } catch (error) {
    console.error('Analyze text error:', error);
    return sendErrorResponse(res, error.message || 'Failed to analyze text', 500);
  }
};

export const analyzeTwitter = async (req, res) => {
  try {
    const { query, maxResults = 100 } = req.body;

    if (!query || query.trim().length === 0) {
      return sendErrorResponse(res, 'Search query is required', 400);
    }

    const startTime = Date.now();
    const result = await SentimentOrchestrator.analyzeTwitter(query, maxResults);
    const processingTime = Date.now() - startTime;

    // Calculate date range
    const dates = result.samplePosts.map(post => new Date(post.created_at));
    const dateRange = {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates))
    };

    // Save to database
    const analysis = await Analysis.create({
      user: req.user._id,
      query,
      source: 'twitter',
      sentiment: {
        overall: result.overall_sentiment,
        scores: result.average_scores,
        percentages: result.percentages,
        distribution: result.sentiment_distribution
      },
      totalAnalyzed: result.total_analyzed,
      insights: result.insights,
      platformBreakdown: result.platformBreakdown,
      timeAnalysis: result.timeAnalysis,
      topKeywords: result.topKeywords,
      samplePosts: result.samplePosts,
      dateRange,
      metadata: {
        timestamp: result.timestamp,
        processingTime,
        platforms: ['twitter']
      }
    });

    return sendSuccessResponse(res, 'Twitter analysis completed successfully', {
      analysisId: analysis._id,
      query,
      source: 'twitter',
      sentiment: result.overall_sentiment,
      percentages: result.percentages,
      scores: result.average_scores,
      distribution: result.sentiment_distribution,
      totalAnalyzed: result.total_analyzed,
      insights: result.insights,
      platformBreakdown: result.platformBreakdown,
      timeAnalysis: result.timeAnalysis,
      topKeywords: result.topKeywords,
      samplePosts: result.samplePosts,
      dateRange,
      processingTime
    });
  } catch (error) {
    console.error('Analyze Twitter error:', error);
    return sendErrorResponse(res, error.message || 'Failed to analyze Twitter data', 500);
  }
};

export const analyzeReddit = async (req, res) => {
  try {
    const { query, maxResults = 100 } = req.body;

    if (!query || query.trim().length === 0) {
      return sendErrorResponse(res, 'Search query is required', 400);
    }

    const startTime = Date.now();
    const result = await SentimentOrchestrator.analyzeReddit(query, maxResults);
    const processingTime = Date.now() - startTime;

    // Calculate date range
    const dates = result.samplePosts.map(post => new Date(post.created_at));
    const dateRange = {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates))
    };

    // Save to database
    const analysis = await Analysis.create({
      user: req.user._id,
      query,
      source: 'reddit',
      sentiment: {
        overall: result.overall_sentiment,
        scores: result.average_scores,
        percentages: result.percentages,
        distribution: result.sentiment_distribution
      },
      totalAnalyzed: result.total_analyzed,
      insights: result.insights,
      platformBreakdown: result.platformBreakdown,
      timeAnalysis: result.timeAnalysis,
      topKeywords: result.topKeywords,
      samplePosts: result.samplePosts,
      dateRange,
      metadata: {
        timestamp: result.timestamp,
        processingTime,
        platforms: ['reddit']
      }
    });

    return sendSuccessResponse(res, 'Reddit analysis completed successfully', {
      analysisId: analysis._id,
      query,
      source: 'reddit',
      sentiment: result.overall_sentiment,
      percentages: result.percentages,
      scores: result.average_scores,
      distribution: result.sentiment_distribution,
      totalAnalyzed: result.total_analyzed,
      insights: result.insights,
      platformBreakdown: result.platformBreakdown,
      timeAnalysis: result.timeAnalysis,
      topKeywords: result.topKeywords,
      samplePosts: result.samplePosts,
      dateRange,
      processingTime
    });
  } catch (error) {
    console.error('Analyze Reddit error:', error);
    return sendErrorResponse(res, error.message || 'Failed to analyze Reddit data', 500);
  }
};

export const analyzeMultiPlatform = async (req, res) => {
  try {
    const { query, maxResults = 100 } = req.body;

    if (!query || query.trim().length === 0) {
      return sendErrorResponse(res, 'Search query is required', 400);
    }

    const startTime = Date.now();
    const result = await SentimentOrchestrator.analyzeMultiplePlatforms(query, maxResults);
    const processingTime = Date.now() - startTime;

    // Calculate date range
    const dates = result.samplePosts.map(post => new Date(post.created_at));
    const dateRange = {
      start: new Date(Math.min(...dates)),
      end: new Date(Math.max(...dates))
    };

    // Save to database
    const analysis = await Analysis.create({
      user: req.user._id,
      query,
      source: 'multi-platform',
      sentiment: {
        overall: result.overall_sentiment,
        percentages: result.percentages,
        distribution: result.sentiment_distribution
      },
      totalAnalyzed: result.total_analyzed,
      insights: result.insights,
      platformBreakdown: result.platformBreakdown,
      topKeywords: result.topKeywords,
      samplePosts: result.samplePosts,
      dateRange,
      metadata: {
        timestamp: result.timestamp,
        processingTime,
        platforms: ['twitter', 'reddit']
      }
    });

    return sendSuccessResponse(res, 'Multi-platform analysis completed successfully', {
      analysisId: analysis._id,
      query,
      source: 'multi-platform',
      sentiment: result.overall_sentiment,
      percentages: result.percentages,
      distribution: result.sentiment_distribution,
      totalAnalyzed: result.total_analyzed,
      insights: result.insights,
      platformBreakdown: result.platformBreakdown,
      topKeywords: result.topKeywords,
      samplePosts: result.samplePosts,
      dateRange,
      platforms: {
        twitter: result.platforms.twitter,
        reddit: result.platforms.reddit
      },
      processingTime
    });
  } catch (error) {
    console.error('Analyze multi-platform error:', error);
    return sendErrorResponse(res, error.message || 'Failed to analyze multi-platform data', 500);
  }
};

export const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, source } = req.query;

    const query = { user: req.user._id };
    if (source) {
      query.source = source;
    }

    const analyses = await Analysis.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-samplePosts -timeAnalysis');

    const count = await Analysis.countDocuments(query);

    return sendSuccessResponse(res, 'Analysis history retrieved successfully', {
      analyses,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalAnalyses: count
    });
  } catch (error) {
    console.error('Get history error:', error);
    return sendErrorResponse(res, 'Failed to fetch analysis history', 500);
  }
};

export const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await Analysis.findOne({
      _id: id,
      user: req.user._id
    });

    if (!analysis) {
      return sendErrorResponse(res, 'Analysis not found', 404);
    }

    return sendSuccessResponse(res, 'Analysis retrieved successfully', analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    return sendErrorResponse(res, 'Failed to fetch analysis', 500);
  }
};

export const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await Analysis.findOneAndDelete({
      _id: id,
      user: req.user._id
    });

    if (!analysis) {
      return sendErrorResponse(res, 'Analysis not found', 404);
    }

    return sendSuccessResponse(res, 'Analysis deleted successfully');
  } catch (error) {
    console.error('Delete analysis error:', error);
    return sendErrorResponse(res, 'Failed to delete analysis', 500);
  }
};

export const getStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total analyses
    const totalAnalyses = await Analysis.countDocuments({ user: userId });

    // Analyses by source
    const bySource = await Analysis.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    // Recent sentiment trends
    const recentAnalyses = await Analysis.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('sentiment.overall createdAt query');

    // Most analyzed topics
    const topQueries = await Analysis.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return sendSuccessResponse(res, 'Statistics retrieved successfully', {
      totalAnalyses,
      bySource,
      recentAnalyses,
      topQueries
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    return sendErrorResponse(res, 'Failed to fetch statistics', 500);
  }
};