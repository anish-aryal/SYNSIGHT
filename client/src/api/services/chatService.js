import api from '../apiService';

// Create new chat
export const createChat = async (data = {}) => {
  const response = await api.post('/chats', data);
  return response.data;
};

// Get all chats
export const getChats = async (page = 1, limit = 20, archived = false) => {
  const response = await api.get('/chats', { 
    params: { page, limit, archived } 
  });
  return response.data;
};

// Get single chat with messages
export const getChatById = async (chatId) => {
  const response = await api.get(`/chats/${chatId}`);
  return response.data;
};

// Add message to chat
export const addMessage = async (chatId, messageData) => {
  const response = await api.post(`/chats/${chatId}/messages`, messageData);
  return response.data;
};

// Update chat
export const updateChat = async (chatId, data) => {
  const response = await api.put(`/chats/${chatId}`, data);
  return response.data;
};

// Delete chat
export const deleteChat = async (chatId) => {
  const response = await api.delete(`/chats/${chatId}`);
  return response.data;
};

// Archive/Unarchive chat
export const archiveChat = async (chatId) => {
  const response = await api.put(`/chats/${chatId}/archive`);
  return response.data;
};

// Clear messages in chat
export const clearMessages = async (chatId) => {
  const response = await api.delete(`/chats/${chatId}/messages`);
  return response.data;
};