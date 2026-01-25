import Project from '../models/Project.js';
import Analysis from '../../sentimentAnalysis/models/Analysis.js';
import Report from '../../reports/models/Report.js';
import { sendSuccessResponse, sendErrorResponse } from '../../helpers/responseHelpers.js';

const buildCountsMap = (items = []) => {
  const map = new Map();
  items.forEach((entry) => {
    if (entry?._id) {
      map.set(String(entry._id), entry.count || 0);
    }
  });
  return map;
};

export const createProject = async (req, res) => {
  try {
    const { name, description = '', category = 'General', isStarred = false } = req.body;

    if (!name || !name.trim()) {
      return sendErrorResponse(res, 'Project name is required', 400);
    }

    const project = await Project.create({
      user: req.user._id,
      name: name.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'General',
      isStarred: Boolean(isStarred)
    });

    return sendSuccessResponse(
      res,
      'Project created successfully',
      { ...project.toObject(), analysisCount: 0, reportCount: 0 },
      201
    );
  } catch (error) {
    console.error('Create project error:', error);
    return sendErrorResponse(res, error.message || 'Failed to create project', 500);
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      user: req.user._id,
      status: { $ne: 'deleted' }
    }).sort({ isStarred: -1, lastActivityAt: -1, updatedAt: -1 });

    if (projects.length === 0) {
      return sendSuccessResponse(res, 'Projects fetched successfully', []);
    }

    const projectIds = projects.map((p) => p._id);

    const [analysisCounts, reportCounts] = await Promise.all([
      Analysis.aggregate([
        { $match: { user: req.user._id, project: { $in: projectIds } } },
        { $group: { _id: '$project', count: { $sum: 1 } } }
      ]),
      Report.aggregate([
        { $match: { user: req.user._id, project: { $in: projectIds }, status: { $ne: 'deleted' } } },
        { $group: { _id: '$project', count: { $sum: 1 } } }
      ])
    ]);

    const analysisMap = buildCountsMap(analysisCounts);
    const reportMap = buildCountsMap(reportCounts);

    const response = projects.map((project) => ({
      ...project.toObject(),
      analysisCount: analysisMap.get(String(project._id)) || 0,
      reportCount: reportMap.get(String(project._id)) || 0
    }));

    return sendSuccessResponse(res, 'Projects fetched successfully', response);
  } catch (error) {
    console.error('Get projects error:', error);
    return sendErrorResponse(res, error.message || 'Failed to fetch projects', 500);
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $ne: 'deleted' }
    });

    if (!project) {
      return sendErrorResponse(res, 'Project not found', 404);
    }

    const [analysisCount, reportCount] = await Promise.all([
      Analysis.countDocuments({ user: req.user._id, project: project._id }),
      Report.countDocuments({ user: req.user._id, project: project._id, status: { $ne: 'deleted' } })
    ]);

    return sendSuccessResponse(res, 'Project fetched successfully', {
      ...project.toObject(),
      analysisCount,
      reportCount
    });
  } catch (error) {
    console.error('Get project error:', error);
    return sendErrorResponse(res, error.message || 'Failed to fetch project', 500);
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, description, category, isStarred, status } = req.body;

    if (name !== undefined && (!name || !name.trim())) {
      return sendErrorResponse(res, 'Project name is required', 400);
    }
    if (status !== undefined && !['active', 'archived', 'deleted'].includes(status)) {
      return sendErrorResponse(res, 'Invalid project status', 400);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (category !== undefined) updateData.category = category?.trim() || 'General';
    if (isStarred !== undefined) updateData.isStarred = Boolean(isStarred);
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length > 0) {
      updateData.lastActivityAt = new Date();
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: { $ne: 'deleted' } },
      updateData,
      { new: true }
    );

    if (!project) {
      return sendErrorResponse(res, 'Project not found', 404);
    }

    const [analysisCount, reportCount] = await Promise.all([
      Analysis.countDocuments({ user: req.user._id, project: project._id }),
      Report.countDocuments({ user: req.user._id, project: project._id, status: { $ne: 'deleted' } })
    ]);

    return sendSuccessResponse(res, 'Project updated successfully', {
      ...project.toObject(),
      analysisCount,
      reportCount
    });
  } catch (error) {
    console.error('Update project error:', error);
    return sendErrorResponse(res, error.message || 'Failed to update project', 500);
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: { $ne: 'deleted' } },
      { status: 'deleted' },
      { new: true }
    );

    if (!project) {
      return sendErrorResponse(res, 'Project not found', 404);
    }

    await Promise.all([
      Analysis.updateMany(
        { user: req.user._id, project: project._id },
        { $set: { project: null } }
      ),
      Report.updateMany(
        { user: req.user._id, project: project._id },
        { $set: { project: null } }
      )
    ]);

    return sendSuccessResponse(res, 'Project deleted successfully');
  } catch (error) {
    console.error('Delete project error:', error);
    return sendErrorResponse(res, error.message || 'Failed to delete project', 500);
  }
};

export const getProjectAnalyses = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $ne: 'deleted' }
    }).select('_id');

    if (!project) {
      return sendErrorResponse(res, 'Project not found', 404);
    }

    const analyses = await Analysis.find({
      user: req.user._id,
      project: project._id
    })
      .sort({ createdAt: -1 })
      .select('query source sentiment totalAnalyzed createdAt updatedAt');

    return sendSuccessResponse(res, 'Project analyses fetched successfully', analyses);
  } catch (error) {
    console.error('Get project analyses error:', error);
    return sendErrorResponse(res, error.message || 'Failed to fetch project analyses', 500);
  }
};

export const getProjectReports = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: { $ne: 'deleted' }
    }).select('_id');

    if (!project) {
      return sendErrorResponse(res, 'Project not found', 404);
    }

    const reports = await Report.find({
      user: req.user._id,
      project: project._id,
      status: 'generated'
    })
      .sort({ createdAt: -1 })
      .select('query sentiment totalAnalyzed createdAt analysis');

    return sendSuccessResponse(res, 'Project reports fetched successfully', reports);
  } catch (error) {
    console.error('Get project reports error:', error);
    return sendErrorResponse(res, error.message || 'Failed to fetch project reports', 500);
  }
};
