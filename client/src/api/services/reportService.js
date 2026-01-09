import api from '../apiService';

export const generateReport = async (data) => {
  const response = await api.post('/reports/generate', { data });
  return response.data;
};

export const getReports = async () => {
  const response = await api.get('/reports');
  return response.data;
};

export const getReportById = async (id) => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

export const getReportByAnalysisId = async (analysisId) => {
  const response = await api.get(`/reports/analysis/${analysisId}`);
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await api.delete(`/reports/${id}`);
  return response.data;
};

export default {
  generateReport,
  getReports,
  getReportById,
  getReportByAnalysisId,
  deleteReport
};