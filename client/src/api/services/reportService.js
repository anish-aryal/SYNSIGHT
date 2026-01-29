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

export const downloadReportPdf = async (id) => {
  const response = await api.get(`/reports/${id}/pdf`, { responseType: 'blob' });
  return response;
};

export const updateReportProject = async (id, projectId) => {
  const response = await api.patch(`/reports/${id}/project`, { projectId });
  return response.data;
};

export const updateReportContent = async (id, content) => {
  const response = await api.patch(`/reports/${id}`, { content });
  return response.data;
};

export const addReportComment = async (id, text) => {
  const response = await api.post(`/reports/${id}/comments`, { text });
  return response.data;
};

export const updateReportComment = async (id, commentId, text) => {
  const response = await api.patch(`/reports/${id}/comments/${commentId}`, { text });
  return response.data;
};

export const deleteReportComment = async (id, commentId) => {
  const response = await api.delete(`/reports/${id}/comments/${commentId}`);
  return response.data;
};

export default {
  generateReport,
  getReports,
  getReportById,
  getReportByAnalysisId,
  deleteReport,
  downloadReportPdf,
  updateReportProject,
  updateReportContent,
  addReportComment,
  updateReportComment,
  deleteReportComment
};
