import api from '../apiService';

export const getTrendingTopics = async (category = 'all') => {
  const response = await api.get('/trending/topics', {
    params: { category }
  });
  return response.data;
};

export const searchTrendingTopic = async (query, maxResults = 50, language = 'en') => {
  const response = await api.post('/trending/search', {
    query,
    maxResults,
    language
  });
  return response.data;
};
