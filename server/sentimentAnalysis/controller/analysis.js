import * as SentimentOrchestrator from '../services/orchestrator.js';
import Analysis from '../models/Analysis.js';
import Project from '../../projects/models/Project.js';
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

const normalizeCommentText = (value) => (typeof value === 'string' ? value.trim() : '');


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
      sentimentOverTime: result.sentimentOverTime || result.sentiment_over_time || [],
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
      sentimentOverTime: result.sentimentOverTime || result.sentiment_over_time || [],
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
      sentimentOverTime: result.sentimentOverTime || result.sentiment_over_time || [],
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
      sentimentOverTime: result.sentimentOverTime || result.sentiment_over_time || [],
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

export const updateAnalysisProject = async (req, res) => {
  try {
    const { projectId } = req.body;

    let project = null;
    if (projectId) {
      project = await Project.findOne({
        _id: projectId,
        user: req.user._id,
        status: { $ne: 'deleted' }
      });

      if (!project) {
        return sendErrorResponse(res, 'Project not found', 404);
      }
    }

    const analysis = await Analysis.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { project: project ? project._id : null },
      { new: true }
    );

    if (!analysis) {
      return sendErrorResponse(res, 'Analysis not found', 404);
    }

    if (project) {
      await Project.findByIdAndUpdate(project._id, { lastActivityAt: new Date() });
    }

    return sendSuccessResponse(res, 'Analysis updated successfully', analysis);
  } catch (error) {
    console.error('Update analysis project error:', error);
    return sendErrorResponse(res, error.message || 'Failed to update analysis', 500);
  }
};

export const refreshAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeframe, platforms, language, maxResults = 100 } = req.body || {};

    const analysis = await Analysis.findOne({
      _id: id,
      user: req.user._id
    });

    if (!analysis) {
      return sendErrorResponse(res, 'Analysis not found', 404);
    }

    const query = analysis.query;
    const platformSelections = platforms && typeof platforms === 'object' ? platforms : null;
    const selectedPlatformIds = platformSelections
      ? Object.keys(platformSelections).filter((key) => platformSelections[key])
      : [];

    const effectiveTimeframe = timeframe || 'last7days';
    const effectiveLanguage = language || 'en';

    const options = {
      timeframe: effectiveTimeframe,
      language: effectiveLanguage,
      platforms: platformSelections || { twitter: true, reddit: true, bluesky: true }
    };

    const startTime = Date.now();
    let result = null;
    let source = analysis.source;

    if (analysis.source === 'text') {
      result = await SentimentOrchestrator.analyzeText(query);
      source = 'text';
    } else if (selectedPlatformIds.length === 1) {
      const platform = selectedPlatformIds[0];
      if (platform === 'twitter') {
        result = await SentimentOrchestrator.analyzeTwitter(query, maxResults, options);
      } else if (platform === 'reddit') {
        result = await SentimentOrchestrator.analyzeReddit(query, maxResults, options);
      } else if (platform === 'bluesky') {
        result = await SentimentOrchestrator.analyzeBluesky(query, maxResults, options);
      }
      source = platform;
    } else {
      result = await SentimentOrchestrator.analyzeMultiplePlatforms(query, maxResults, options);
      source = 'multi-platform';
    }

    if (!result) {
      return sendErrorResponse(res, 'Failed to refresh analysis', 500);
    }

    const processingTime = Date.now() - startTime;
    const dateRange = result.samplePosts ? buildDateRange(result.samplePosts) : null;

    if (source === 'text') {
      analysis.sentiment = {
        overall: result.sentiment,
        scores: result.scores,
        percentages: {
          positive: result.sentiment === 'positive' ? 100 : 0,
          negative: result.sentiment === 'negative' ? 100 : 0,
          neutral: result.sentiment === 'neutral' ? 100 : 0
        }
      };
      analysis.totalAnalyzed = 1;
      analysis.samplePosts = [{
        text: query,
        platform: 'text',
        sentiment: result.sentiment,
        confidence: Math.round(result.confidence * 100),
        created_at: new Date()
      }];
      analysis.topKeywords = [];
      analysis.platformBreakdown = [];
      analysis.insights = {};
      analysis.sentimentOverTime = [];
      analysis.dateRange = null;
    } else {
      analysis.sentiment = {
        overall: result.overall_sentiment,
        scores: result.average_scores,
        percentages: result.percentages,
        distribution: result.sentiment_distribution
      };
      analysis.totalAnalyzed = result.total_analyzed;
      analysis.insights = result.insights;
      analysis.platformBreakdown = result.platformBreakdown;
      analysis.topKeywords = result.topKeywords;
      analysis.sentimentOverTime = result.sentimentOverTime || result.sentiment_over_time || [];
      analysis.samplePosts = result.samplePosts;
      analysis.dateRange = dateRange;
    }

    analysis.source = source;
    analysis.metadata = {
      timestamp: result.timestamp || new Date().toISOString(),
      processingTime,
      timeframe: effectiveTimeframe,
      language: effectiveLanguage,
      platforms: selectedPlatformIds.length > 0 ? selectedPlatformIds : ['twitter', 'reddit', 'bluesky']
    };

    const updated = await analysis.save();
    return sendSuccessResponse(res, 'Analysis refreshed successfully', updated);
  } catch (error) {
    console.error('Refresh analysis error:', error);
    return sendErrorResponse(res, error.message || 'Failed to refresh analysis', 500);
  }
};

export const addAnalysisComment = async (req, res) => {
  try {
    const text = normalizeCommentText(req.body?.text);
    if (!text) {
      return sendErrorResponse(res, 'Comment text is required', 400);
    }

    const analysis = await Analysis.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $push: { comments: { text } } },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!analysis) {
      return sendErrorResponse(res, 'Analysis not found', 404);
    }

    return sendSuccessResponse(res, 'Comment added', analysis.comments);
  } catch (error) {
    console.error('Add analysis comment error:', error);
    return sendErrorResponse(res, error.message || 'Failed to add comment', 500);
  }
};

export const updateAnalysisComment = async (req, res) => {
  try {
    const text = normalizeCommentText(req.body?.text);
    if (!text) {
      return sendErrorResponse(res, 'Comment text is required', 400);
    }

    const analysis = await Analysis.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, 'comments._id': req.params.commentId },
      { $set: { 'comments.$.text': text } },
      { new: true, runValidators: true, context: 'query' }
    );

    if (!analysis) {
      return sendErrorResponse(res, 'Comment not found', 404);
    }

    return sendSuccessResponse(res, 'Comment updated', analysis.comments);
  } catch (error) {
    console.error('Update analysis comment error:', error);
    return sendErrorResponse(res, error.message || 'Failed to update comment', 500);
  }
};

export const deleteAnalysisComment = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, 'comments._id': req.params.commentId },
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    );

    if (!analysis) {
      return sendErrorResponse(res, 'Comment not found', 404);
    }

    return sendSuccessResponse(res, 'Comment deleted', analysis.comments);
  } catch (error) {
    console.error('Delete analysis comment error:', error);
    return sendErrorResponse(res, error.message || 'Failed to delete comment', 500);
  }
};
