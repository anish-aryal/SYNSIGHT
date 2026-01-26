import api from '../apiService';

export const createChat = async (data = {}) => {
  const response = await api.post('/chats', data);
  return response.data;
};

export const getChats = async (page = 1, limit = 20, archived = false) => {
  const response = await api.get('/chats', { params: { page, limit, archived } });
  return response.data;
};

export const getChatById = async (chatId) => {
  const response = await api.get(`/chats/${chatId}`);
  return response.data;
};

export const getChatByAnalysisId = async (analysisId) => {
  const response = await api.get(`/chats/analysis/${analysisId}`);
  return response.data;
};

export const addMessage = async (chatId, messageData) => {
  const response = await api.post(`/chats/${chatId}/messages`, messageData);
  return response.data;
};

// Alias for addMessage to maintain compatibility
export const sendMessage = async (chatId, messageData) => addMessage(chatId, messageData);

export const updateChat = async (chatId, data) => {
  const response = await api.put(`/chats/${chatId}`, data);
  return response.data;
};

export const deleteChat = async (chatId) => {
  const response = await api.delete(`/chats/${chatId}`);
  return response.data;
};

export const archiveChat = async (chatId) => {
  const response = await api.put(`/chats/${chatId}/archive`);
  return response.data;
};

export const clearMessages = async (chatId) => {
  const response = await api.delete(`/chats/${chatId}/messages`);
  return response.data;
};
