import api from '../apiService';

export const analyzeMultiPlatform = async (query, maxResults = 100) => {
  const response = await api.post('/analysis/multi-platform', { query, maxResults });
  return response.data;
};

export const analyzeTwitter = async (query, maxResults = 100) => {
  const response = await api.post('/analysis/twitter', { query, maxResults });
  return response.data;
};

export const analyzeReddit = async (query, maxResults = 100) => {
  const response = await api.post('/analysis/reddit', { query, maxResults });
  return response.data;
};

export const analyzeBluesky = async (query, maxResults = 100) => {
  const response = await api.post('/analysis/bluesky', { query, maxResults });
  return response.data;
};

export const analyzeText = async (text) => {
  const response = await api.post('/analysis/text', { text });
  return response.data;
};

export const getHistory = async (page = 1, limit = 10, source = null) => {
  let url = `/analysis/history?page=${page}&limit=${limit}`;
  if (source) url += `&source=${source}`;
  const response = await api.get(url);
  return response.data;
};

export const getAnalysisById = async (id) => {
  const response = await api.get(`/analysis/${id}`);
  return response.data;
};

export const deleteAnalysis = async (id) => {
  const response = await api.delete(`/analysis/${id}`);
  return response.data;
};

export const getStatistics = async () => {
  const response = await api.get('/analysis/statistics');
  return response.data;
};