import reportService from '../services/reportService.js';
import { generateReportPdf } from '../services/pdfService.js';
import Report from '../models/Report.js';
import Analysis from '../../sentimentAnalysis/models/Analysis.js';
import Project from '../../projects/models/Project.js';
import { sendSuccessResponse, sendErrorResponse } from '../../helpers/responseHelpers.js';

const buildReportFilename = (report) => {
  const nameSource = report?.query || report?.title || 'analysis';
  const slug = nameSource
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `sentiment-report-${slug || 'analysis'}-${Date.now()}.pdf`;
};

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
          project: existing.project || null,
          createdAt: existing.createdAt
        });
      }
    }

    let project = null;
    const requestedProjectId = data.projectId || null;

    if (requestedProjectId) {
      project = await Project.findOne({
        _id: requestedProjectId,
        user: req.user._id,
        status: { $ne: 'deleted' }
      });

      if (!project) {
        return sendErrorResponse(res, 'Project not found', 404);
      }
    } else if (analysisId) {
      const analysis = await Analysis.findOne({
        _id: analysisId,
        user: req.user._id
      }).select('project');

      if (analysis?.project) {
        project = await Project.findOne({
          _id: analysis.project,
          user: req.user._id,
          status: { $ne: 'deleted' }
        });
      }
    }

    const generatedReport = await reportService.generateReport(data, query);

    // Calculate dominant sentiment based on highest percentage
    const positive = Number(data.percentages?.positive ?? 0);
    const negative = Number(data.percentages?.negative ?? 0);
    const neutral = Number(data.percentages?.neutral ?? 0);

    let overallSentiment = data.overall_sentiment || 'neutral';
    if (positive >= negative && positive >= neutral) {
      overallSentiment = 'positive';
    } else if (negative >= positive && negative >= neutral) {
      overallSentiment = 'negative';
    } else {
      overallSentiment = 'neutral';
    }

    const report = await Report.create({
      user: req.user._id,
      analysis: analysisId,
      project: project?._id,
      query,
      content: generatedReport.content,
      source: data.source || 'multi-platform',
      sentiment: {
        overall: overallSentiment,
        positive: data.percentages?.positive,
        negative: data.percentages?.negative,
        neutral: data.percentages?.neutral
      },
      totalAnalyzed: data.total_analyzed || 0,
      usage: generatedReport.usage
    });

    if (project) {
      await Project.findByIdAndUpdate(project._id, { lastActivityAt: new Date() });
    }

    return sendSuccessResponse(res, 'Report generated successfully', {
      _id: report._id,
      content: report.content,
      query: report.query,
      source: report.source,
      sentiment: report.sentiment,
      totalAnalyzed: report.totalAnalyzed,
      usage: report.usage,
      project: report.project || null,
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
            project: existing.project || null,
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
    .populate('project', 'name')
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
      user: req.user._id,
      status: 'generated'
    }).populate('project', 'name');

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
    }).populate('project', 'name');

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

export const updateReportProject = async (req, res) => {
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

    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'generated' },
      { project: project ? project._id : null },
      { new: true }
    ).populate('project', 'name');

    if (!report) {
      return sendErrorResponse(res, 'Report not found', 404);
    }

    if (project) {
      await Project.findByIdAndUpdate(project._id, { lastActivityAt: new Date() });
    }

    return sendSuccessResponse(res, 'Report updated successfully', report);
  } catch (error) {
    console.error('Update report project error:', error);
    return sendErrorResponse(res, error.message || 'Failed to update report', 500);
  }
};

export const downloadReportPdf = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findOne({
      _id: id,
      user: req.user._id,
      status: 'generated'
    });

    if (!report) {
      return sendErrorResponse(res, 'Report not found', 404);
    }

    const title = report.query || report.title || 'Sentiment Report';
    const pdfBuffer = await generateReportPdf({
      title,
      markdown: report.content,
      meta: {
        createdAt: report.createdAt,
        totalAnalyzed: report.totalAnalyzed,
        sentiment: report.sentiment
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${buildReportFilename(report)}"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Report PDF generation error:', error);
    return sendErrorResponse(res, error.message || 'Failed to generate report PDF', 500);
  }
};
