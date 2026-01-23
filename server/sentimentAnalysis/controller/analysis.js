import * as SentimentOrchestrator from '../services/orchestrator.js';
import Analysis from '../models/Analysis.js';
import { sendSuccessResponse, sendErrorResponse } from '../../helpers/responseHelpers.js';

const buildOptions = (body = {}) => ({
  timeframe: body.timeframe || 'last7days',
  language: body.language || 'en',
  platforms: body.platforms || { twitter: true, reddit: true, bluesky: true }
});

const buildDateRange = (samplePosts = []) => {
  const times = samplePosts
    .map(p => new Date(p.created_at).getTime())
    .filter(t => Number.isFinite(t));

  if (times.length === 0) return null;

  return {
    start: new Date(Math.min(...times)),
    end: new Date(Math.max(...times))
  };
};


export const analyzeText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) return sendErrorResponse(res, 'Text is required', 400);

    const startTime = Date.now();
    const result = await SentimentOrchestrator.analyzeText(text);
    const processingTime = Date.now() - startTime;

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
        text,
        platform: 'text',
        sentiment: result.sentiment,
        confidence: Math.round(result.confidence * 100),
        created_at: new Date()
      }],
      metadata: { processingTime }
    });

    return sendSuccessResponse(res, 'Text analyzed successfully', {
      analysisId: analysis._id,
      sentiment: result.sentiment,
      scores: result.scores,
      confidence: result.confidence,
      processingTime
    });
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to analyze text', 500);
  }
};

export const analyzeTwitter = async (req, res) => {
  try {
    const { query, maxResults = 100 } = req.body;
    if (!query || query.trim().length === 0) return sendErrorResponse(res, 'Search query is required', 400);

    const options = buildOptions(req.body);

    const startTime = Date.now();
    const result = await SentimentOrchestrator.analyzeTwitter(query, maxResults, options);
    const processingTime = Date.now() - startTime;

    const dateRange = buildDateRange(result.samplePosts);


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
      topKeywords: result.topKeywords,
      samplePosts: result.samplePosts,
      dateRange,
      metadata: { timestamp: result.timestamp, processingTime, options }
    });

    return sendSuccessResponse(res, 'Twitter analysis completed successfully', {
      ...result,
      analysisId: analysis._id,
      dateRange,
      processingTime,
      timeframe: options.timeframe,
      language: options.language,
      maxResults: result?.maxResults ?? maxResults
    });
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to analyze Twitter data', 500);
  }
};

export const analyzeReddit = async (req, res) => {
  try {
    const { query, maxResults = 100 } = req.body;
    if (!query || query.trim().length === 0) return sendErrorResponse(res, 'Search query is required', 400);

    const options = buildOptions(req.body);

    const startTime = Date.now();
    const result = await SentimentOrchestrator.analyzeReddit(query, maxResults, options);
    const processingTime = Date.now() - startTime;

    const dateRange = buildDateRange(result.samplePosts);


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
      topKeywords: result.topKeywords,
      samplePosts: result.samplePosts,
      dateRange,
      metadata: { timestamp: result.timestamp, processingTime, options }
    });

    return sendSuccessResponse(res, 'Reddit analysis completed successfully', {
      ...result,
      analysisId: analysis._id,
      dateRange,
      processingTime,
      timeframe: options.timeframe,
      language: options.language,
      maxResults: result?.maxResults ?? maxResults
    });
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to analyze Reddit data', 500);
  }
};

export const analyzeBluesky = async (req, res) => {
  try {
    const { query, maxResults = 100 } = req.body;
    if (!query || query.trim().length === 0) return sendErrorResponse(res, 'Search query is required', 400);

    const options = buildOptions(req.body);

    const startTime = Date.now();
    const result = await SentimentOrchestrator.analyzeBluesky(query, maxResults, options);
    const processingTime = Date.now() - startTime;

    const dateRange = buildDateRange(result.samplePosts);


    const analysis = await Analysis.create({
      user: req.user._id,
      query,
      source: 'bluesky',
      sentiment: {
        overall: result.overall_sentiment,
        scores: result.average_scores,
        percentages: result.percentages,
        distribution: result.sentiment_distribution
      },
      totalAnalyzed: result.total_analyzed,
      insights: result.insights,
      platformBreakdown: result.platformBreakdown,
      topKeywords: result.topKeywords,
      samplePosts: result.samplePosts,
      dateRange,
      metadata: { timestamp: result.timestamp, processingTime, options }
    });

    return sendSuccessResponse(res, 'Bluesky analysis completed successfully', {
      ...result,
      analysisId: analysis._id,
      dateRange,
      processingTime,
      timeframe: options.timeframe,
      language: options.language,
      maxResults: result?.maxResults ?? maxResults
    });
  } catch (error) {
    // ✅ If creds missing, make it a clear client message
    const msg = error.message || 'Failed to analyze Bluesky data';
    const isCreds = msg.toLowerCase().includes('credentials') || msg.toLowerCase().includes('not configured');
    return sendErrorResponse(res, msg, isCreds ? 400 : 500);
  }
};

export const analyzeMultiPlatform = async (req, res) => {
  try {
    const { query, maxResults = 100 } = req.body;
    if (!query || query.trim().length === 0) return sendErrorResponse(res, 'Search query is required', 400);

    const options = buildOptions(req.body);

    const startTime = Date.now();
    const result = await SentimentOrchestrator.analyzeMultiplePlatforms(query, maxResults, options);
    const processingTime = Date.now() - startTime;

    const dateRange = buildDateRange(result.samplePosts);


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
      metadata: { timestamp: result.timestamp, processingTime, options }
    });

    return sendSuccessResponse(res, 'Multi-platform analysis completed successfully', {
      ...result,
      analysisId: analysis._id,
      dateRange,
      processingTime,
      timeframe: options.timeframe,
      language: options.language,
      maxResults: result?.maxResults ?? maxResults
    });
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to analyze multi-platform data', 500);
  }
};
// 📜 Get user's analysis history
export const getHistory = async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return sendSuccessResponse(res, 'Analysis history fetched successfully', analyses);
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to fetch history', 500);
  }
};

// 🔍 Get single analysis by ID
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

    return sendSuccessResponse(res, 'Analysis fetched successfully', analysis);
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to fetch analysis', 500);
  }
};

// 📊 Get sentiment statistics summary
export const getStatistics = async (req, res) => {
  try {
    const stats = await Analysis.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$sentiment.overall',
          count: { $sum: 1 }
        }
      }
    ]);

    const formatted = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    stats.forEach(s => {
      formatted[s._id] = s.count;
    });

    return sendSuccessResponse(res, 'Statistics fetched successfully', formatted);
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to fetch statistics', 500);
  }
};
export const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;

    const analysis = await Analysis.findOneAndDelete({
      _id: id,
      user: req.user._id // 🔐 ensure user owns the analysis
    });

    if (!analysis) {
      return sendErrorResponse(res, 'Analysis not found', 404);
    }

    return sendSuccessResponse(res, 'Analysis deleted successfully');
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to delete analysis', 500);
  }
};
