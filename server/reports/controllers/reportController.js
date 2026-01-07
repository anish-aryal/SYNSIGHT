import reportService from '../services/reportService.js';
import { sendSuccessResponse, sendErrorResponse } from '../../helpers/responseHelpers.js';

export const generateReport = async (req, res) => {
  try {
    const { analysisData } = req.body;

    if (!analysisData) {
      return sendErrorResponse(res, 'Analysis data is required', 400);
    }

    // Extract query from analysisData - no need for separate field
    const query = analysisData.query;

    if (!query) {
      return sendErrorResponse(res, 'Query not found in analysis data', 400);
    }

    const report = await reportService.generateReport(analysisData, query);

    return sendSuccessResponse(res, 'Report generated successfully', report);
  } catch (error) {
    console.error('Report generation error:', error);
    return sendErrorResponse(res, error.message || 'Failed to generate report', 500);
  }
};