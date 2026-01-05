import api from '../apiService';

const PLATFORM_ENDPOINTS = {
  twitter: '/analysis/twitter',
  reddit: '/analysis/reddit',
  bluesky: '/analysis/bluesky'
};

const basePayload = (query, options, maxResults) => ({
  query,
  maxResults,
  timeframe: options?.timeframe || 'last7days',
  language: options?.language || 'en'
});

export const analyzePlatform = async (platform, query, options = {}, maxResults = 100) => {
  const endpoint = PLATFORM_ENDPOINTS[platform];
  if (!endpoint) return analyzeMultiPlatform(query, options, maxResults);

  const response = await api.post(endpoint, basePayload(query, options, maxResults));
  return response.data;
};

export const analyzeMultiPlatform = async (query, options = {}, maxResults = 100) => {
  const payload = {
    ...basePayload(query, options, maxResults),
    platforms: options?.platforms || { twitter: true, reddit: true, bluesky: true }
  };

  const response = await api.post('/analysis/multi-platform', payload);
  return response.data;
};

export const analyzeText = async (text) => {
  const response = await api.post('/analysis/text', { text });
  return response.data;
};
