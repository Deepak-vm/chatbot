import axios from 'axios';
import { MOCK_RESPONSES } from '../utils/constants';
import { generateId } from '../utils/helpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to use mock data when backend is unavailable
let useMock = true;

/**
 * Try to connect to backend; fall back to mock if unavailable
 */
const withFallback = async (apiFn, mockFn) => {
  if (useMock) return mockFn();
  try {
    return await apiFn();
  } catch {
    useMock = true;
    return mockFn();
  }
};

// ─── Mock Helpers ────────────────────────────────────────────

const getMockResponse = () => {
  const idx = Math.floor(Math.random() * MOCK_RESPONSES.length);
  return MOCK_RESPONSES[idx];
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── API Functions ───────────────────────────────────────────

/**
 * Send a message to the chat API
 * @param {string} conversationId
 * @param {string} message
 * @param {string} model
 * @returns {Promise<{conversation_id: string, message: {role: string, content: string}, sources: []}>}
 */
export const sendMessage = async (conversationId, message, model) => {
  return withFallback(
    async () => {
      const { data } = await apiClient.post('/api/chat', {
        conversation_id: conversationId,
        message,
        model,
      });
      return data;
    },
    async () => {
      // Simulate network delay (1.5–3s)
      await delay(1500 + Math.random() * 1500);
      return {
        conversation_id: conversationId,
        message: {
          id: generateId(),
          role: 'assistant',
          content: getMockResponse(),
          timestamp: new Date().toISOString(),
          sources: [],
        },
        sources: [],
      };
    }
  );
};

/**
 * Get all conversations
 */
export const getConversations = async () => {
  return withFallback(
    async () => {
      const { data } = await apiClient.get('/api/conversations');
      return data;
    },
    async () => []
  );
};

/**
 * Get a specific conversation
 */
export const getConversation = async (conversationId) => {
  return withFallback(
    async () => {
      const { data } = await apiClient.get(`/api/conversations/${conversationId}`);
      return data;
    },
    async () => ({ id: conversationId, messages: [] })
  );
};

/**
 * Create a new conversation
 */
export const createConversation = async (title) => {
  return withFallback(
    async () => {
      const { data } = await apiClient.post('/api/conversations', { title });
      return data;
    },
    async () => ({
      id: generateId(),
      title: title || 'New Chat',
      createdAt: new Date().toISOString(),
      messages: [],
    })
  );
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId) => {
  return withFallback(
    async () => {
      await apiClient.delete(`/api/conversations/${conversationId}`);
    },
    async () => {}
  );
};

/**
 * Rename a conversation
 */
export const renameConversation = async (conversationId, title) => {
  return withFallback(
    async () => {
      const { data } = await apiClient.patch(`/api/conversations/${conversationId}`, { title });
      return data;
    },
    async () => ({ id: conversationId, title })
  );
};
