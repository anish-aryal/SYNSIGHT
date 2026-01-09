import reportService from '../services/reportService.js';
import Report from '../models/Report.js';
import { sendSuccessResponse, sendErrorResponse } from '../../helpers/responseHelpers.js';

export const generateReport = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return sendErrorResponse(res, 'Data is required', 400);
    }

    const query = data.query;
    if (!query) {
      return sendErrorResponse(res, 'Query not found in data', 400);
    }

    const analysisId = data.analysisId || data.analysis || null;

    // Return existing report for this analysis to enforce one-report-per-analysis
    if (analysisId) {
      const existing = await Report.findOne({
        user: req.user._id,
        analysis: analysisId
      }).sort({ createdAt: -1 });

      if (existing) {
        return sendSuccessResponse(res, 'Report already exists', {
          _id: existing._id,
          content: existing.content,
          query: existing.query,
          source: existing.source,
          sentiment: existing.sentiment,
          totalAnalyzed: existing.totalAnalyzed,
          usage: existing.usage,
          createdAt: existing.createdAt
        });
      }
    }

    const generatedReport = await reportService.generateReport(data, query);

    const report = await Report.create({
      user: req.user._id,
      analysis: analysisId,
      query,
      content: generatedReport.content,
      source: data.source || 'multi-platform',
      sentiment: {
        overall: data.overall_sentiment,
        positive: data.percentages?.positive,
        negative: data.percentages?.negative,
        neutral: data.percentages?.neutral
      },
      totalAnalyzed: data.total_analyzed || 0,
      usage: generatedReport.usage
    });

    return sendSuccessResponse(res, 'Report generated successfully', {
      _id: report._id,
      content: report.content,
      query: report.query,
      source: report.source,
      sentiment: report.sentiment,
      totalAnalyzed: report.totalAnalyzed,
      usage: report.usage,
      createdAt: report.createdAt
    });
  } catch (error) {
    // If a unique index is added on (user, analysis), handle duplicate key collisions by returning the existing report.
    if (error?.code === 11000) {
      const analysisId = req.body?.data?.analysisId || req.body?.data?.analysis || null;

      if (analysisId) {
        const existing = await Report.findOne({
          user: req.user._id,
          analysis: analysisId
        }).sort({ createdAt: -1 });

        if (existing) {
          return sendSuccessResponse(res, 'Report already exists', {
            _id: existing._id,
            content: existing.content,
            query: existing.query,
            source: existing.source,
            sentiment: existing.sentiment,
            totalAnalyzed: existing.totalAnalyzed,
            usage: existing.usage,
            createdAt: existing.createdAt
          });
        }
      }
    }

    console.error('Report generation error:', error);
    return sendErrorResponse(res, error.message || 'Failed to generate report', 500);
  }
};


// Get all reports for user
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ 
      user: req.user._id,
      status: 'generated'
    })
    .sort({ createdAt: -1 })
    .select('-content')
    .limit(50);

    return sendSuccessResponse(res, 'Reports fetched successfully', reports);
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to fetch reports', 500);
  }
};

// Get single report by ID
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findOne({
      _id: id,
      user: req.user._id
    });

    if (!report) {
      return sendErrorResponse(res, 'Report not found', 404);
    }

    return sendSuccessResponse(res, 'Report fetched successfully', report);
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to fetch report', 500);
  }
};

// Get report by analysis ID
export const getReportByAnalysisId = async (req, res) => {
  try {
    const { analysisId } = req.params;

    const report = await Report.findOne({
      analysis: analysisId,
      user: req.user._id,
      status: 'generated'
    });

    if (!report) {
      return sendSuccessResponse(res, 'No report found', null);
    }

    return sendSuccessResponse(res, 'Report fetched successfully', report);
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to fetch report', 500);
  }
};


// Delete report
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { status: 'deleted' },
      { new: true }
    );

    if (!report) {
      return sendErrorResponse(res, 'Report not found', 404);
    }

    return sendSuccessResponse(res, 'Report deleted successfully');
  } catch (error) {
    return sendErrorResponse(res, error.message || 'Failed to delete report', 500);
  }
};
