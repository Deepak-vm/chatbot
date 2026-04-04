import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Send a user message to the LangGraph backend.
 * @param {string} conversationId
 * @param {string} message
 * @param {string} model
 */
export const sendMessage = async (conversationId, message, model) => {
  const { data } = await apiClient.post('/api/chat', {
    conversation_id: conversationId,
    message,
    model,
  });
  return data;
};

export const getConversations = async () => {
  const { data } = await apiClient.get('/api/conversations');
  return data;
};

export const getConversation = async (conversationId) => {
  const { data } = await apiClient.get(`/api/conversations/${conversationId}`);
  return data;
};

export const createConversation = async (title) => {
  const { data } = await apiClient.post('/api/conversations', { title });
  return data;
};

export const deleteConversation = async (conversationId) => {
  await apiClient.delete(`/api/conversations/${conversationId}`);
};

export const renameConversation = async (conversationId, title) => {
  const { data } = await apiClient.patch(`/api/conversations/${conversationId}`, { title });
  return data;
};
