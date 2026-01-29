import api from '../apiService';

export const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data;
};

export const getProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const getProjectAnalyses = async (id) => {
  const response = await api.get(`/projects/${id}/analyses`);
  return response.data;
};

export const getProjectReports = async (id) => {
  const response = await api.get(`/projects/${id}/reports`);
  return response.data;
};

export const createProject = async (payload) => {
  const response = await api.post('/projects', payload);
  return response.data;
};

export const updateProject = async (id, payload) => {
  const response = await api.put(`/projects/${id}`, payload);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

export const addProjectComment = async (id, text) => {
  const response = await api.post(`/projects/${id}/comments`, { text });
  return response.data;
};

export const updateProjectComment = async (id, commentId, text) => {
  const response = await api.patch(`/projects/${id}/comments/${commentId}`, { text });
  return response.data;
};

export const deleteProjectComment = async (id, commentId) => {
  const response = await api.delete(`/projects/${id}/comments/${commentId}`);
  return response.data;
};

export default {
  getProjects,
  getProjectById,
  getProjectAnalyses,
  getProjectReports,
  createProject,
  updateProject,
  deleteProject,
  addProjectComment,
  updateProjectComment,
  deleteProjectComment
};
