import { createContext, useReducer, useCallback, useEffect } from 'react';
import * as api from '../services/api';
import { generateId } from '../utils/helpers';
import { DEFAULT_MODEL, INITIAL_CONVERSATIONS } from '../utils/constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const ChatContext = createContext(null);

// ─── Reducer ─────────────────────────────────────────────────

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  error: null,
  selectedModel: DEFAULT_MODEL,
  sidebarOpen: true,
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };

    case 'ADD_CONVERSATION':
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };

    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        ),
      };

    case 'DELETE_CONVERSATION': {
      const filtered = state.conversations.filter((c) => c.id !== action.payload);
      const newActive = filtered.length > 0 ? filtered[0].id : null;
      return {
        ...state,
        conversations: filtered,
        activeConversationId:
          state.activeConversationId === action.payload ? newActive : state.activeConversationId,
        messages:
          state.activeConversationId === action.payload ? [] : state.messages,
      };
    }

    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversationId: action.payload };

    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };

    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };

    case 'UPDATE_LAST_MESSAGE': {
      const msgs = [...state.messages];
      if (msgs.length > 0) msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...action.payload };
      return { ...state, messages: msgs };
    }

    case 'REMOVE_LAST_MESSAGE': {
      return { ...state, messages: state.messages.slice(0, -1) };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };

    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };

    default:
      return state;
  }
}

// ─── Provider ────────────────────────────────────────────────

export function ChatProvider({ children }) {
  const [persistedConversations, setPersistedConversations] = useLocalStorage(
    'lg_conversations',
    INITIAL_CONVERSATIONS
  );
  const [persistedMessages, setPersistedMessages] = useLocalStorage(
    'lg_messages',
    {}
  );

  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    conversations: persistedConversations,
  });

  // Persist conversations on change
  useEffect(() => {
    setPersistedConversations(state.conversations);
  }, [state.conversations]);

  // Persist messages per conversation
  useEffect(() => {
    if (state.activeConversationId) {
      setPersistedMessages((prev) => ({
        ...prev,
        [state.activeConversationId]: state.messages,
      }));
    }
  }, [state.messages, state.activeConversationId]);

  // ─── Actions ───────────────────────────────────────────────

  const newChat = useCallback(() => {
    const conv = {
      id: generateId(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    dispatch({ type: 'ADD_CONVERSATION', payload: conv });
    dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conv.id });
    dispatch({ type: 'SET_MESSAGES', payload: [] });
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const selectConversation = useCallback(
    (id) => {
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: id });
      const msgs = persistedMessages[id] || [];
      dispatch({ type: 'SET_MESSAGES', payload: msgs });
      dispatch({ type: 'CLEAR_ERROR' });
    },
    [persistedMessages]
  );

  const deleteConversation = useCallback(
    async (id) => {
      dispatch({ type: 'DELETE_CONVERSATION', payload: id });
      try {
        await api.deleteConversation(id);
      } catch {
        // Optimistic delete — ignore API errors
      }
    },
    []
  );

  const renameConversation = useCallback(async (id, title) => {
    dispatch({ type: 'UPDATE_CONVERSATION', payload: { id, title } });
    try {
      await api.renameConversation(id, title);
    } catch {
      // Ignore
    }
  }, []);

  const clearChat = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
    if (state.activeConversationId) {
      setPersistedMessages((prev) => ({
        ...prev,
        [state.activeConversationId]: [],
      }));
    }
  }, [state.activeConversationId]);

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || state.isLoading) return;

      dispatch({ type: 'CLEAR_ERROR' });

      // Ensure we have an active conversation
      let convId = state.activeConversationId;
      if (!convId) {
        const conv = {
          id: generateId(),
          title: content.slice(0, 50),
          createdAt: new Date().toISOString(),
          messages: [],
        };
        dispatch({ type: 'ADD_CONVERSATION', payload: conv });
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: conv.id });
        convId = conv.id;
      }

      // Update conversation title from first message
      const existingMsgs = persistedMessages[convId] || [];
      if (existingMsgs.length === 0) {
        dispatch({
          type: 'UPDATE_CONVERSATION',
          payload: { id: convId, title: content.slice(0, 50) },
        });
      }

      // Add user message
      const userMsg = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMsg });
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const response = await api.sendMessage(convId, content, state.selectedModel.label);
        const assistantMsg = {
          id: generateId(),
          role: 'assistant',
          content: response.message.content,
          timestamp: new Date().toISOString(),
          sources: response.sources || [],
        };
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });
      } catch {
        dispatch({
          type: 'SET_ERROR',
          payload: 'Something went wrong. Please try again.',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.activeConversationId, state.isLoading, state.selectedModel, persistedMessages]
  );

  const regenerateLastResponse = useCallback(async () => {
    const msgs = state.messages;
    if (msgs.length < 2) return;

    // Remove last assistant message
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    dispatch({ type: 'REMOVE_LAST_MESSAGE' });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await api.sendMessage(
        state.activeConversationId,
        lastUserMsg.content,
        state.selectedModel.label
      );
      const assistantMsg = {
        id: generateId(),
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date().toISOString(),
        sources: response.sources || [],
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });
    } catch {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to regenerate response. Please try again.',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.messages, state.activeConversationId, state.selectedModel]);

  const setModel = useCallback((model) => {
    dispatch({ type: 'SET_MODEL', payload: model });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setSidebarOpen = useCallback((val) => {
    dispatch({ type: 'SET_SIDEBAR', payload: val });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        dispatch,
        sendMessage,
        newChat,
        selectConversation,
        deleteConversation,
        renameConversation,
        clearChat,
        regenerateLastResponse,
        setModel,
        toggleSidebar,
        setSidebarOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
