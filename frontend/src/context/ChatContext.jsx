import { createContext, useReducer, useCallback, useEffect, useRef } from 'react';
import * as api from '../services/api';
import { streamMessage } from '../services/api';
import { generateId } from '../utils/helpers';
import { DEFAULT_MODEL } from '../utils/constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const ChatContext = createContext(null);

// ─── Reducer ─────────────────────────────────────────────────

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  selectedModel: DEFAULT_MODEL,
  sidebarOpen: true,
  // Tool call tracking — null when idle, {name, input} while a tool is running
  activeTool: null,
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

    case 'APPEND_TOKEN': {
      const msgs = [...state.messages];
      if (msgs.length > 0) {
        const last = msgs[msgs.length - 1];
        msgs[msgs.length - 1] = { ...last, content: last.content + action.payload };
      }
      return { ...state, messages: msgs };
    }

    case 'SET_STREAMING':
      return { ...state, isStreaming: action.payload };

    case 'REMOVE_LAST_MESSAGE': {
      return { ...state, messages: state.messages.slice(0, -1) };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_ACTIVE_TOOL':
      return { ...state, activeTool: action.payload };

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
    []
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

  // Ref to abort the current stream if the user sends a new message
  const abortStreamRef = useRef(null);

  const _startStream = useCallback(
    (convId, content) => {
      // Cancel any in-flight stream
      if (abortStreamRef.current) abortStreamRef.current();

      // Add an empty assistant placeholder that we'll fill token-by-token
      const assistantMsg = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        sources: [],
        streaming: true,
      };
      dispatch({ type: 'ADD_MESSAGE', payload: assistantMsg });
      dispatch({ type: 'SET_STREAMING', payload: true });

      const abort = streamMessage(
        convId,
        content,
        state.selectedModel.label,
        // onToken — append each LLM token to the assistant placeholder
        (token) => dispatch({ type: 'APPEND_TOKEN', payload: token }),
        // onToolStart — show which tool is being called
        (name, input) => dispatch({ type: 'SET_ACTIVE_TOOL', payload: { name, input } }),
        // onToolEnd — clear the active tool indicator
        (_name, _output) => dispatch({ type: 'SET_ACTIVE_TOOL', payload: null }),
        // onDone
        (_finalConvId) => {
          dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: { streaming: false } });
          dispatch({ type: 'SET_STREAMING', payload: false });
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_ACTIVE_TOOL', payload: null });
          abortStreamRef.current = null;
        },
        // onError
        (errMsg) => {
          dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: { streaming: false } });
          dispatch({ type: 'SET_STREAMING', payload: false });
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_ACTIVE_TOOL', payload: null });
          dispatch({ type: 'SET_ERROR', payload: errMsg || 'Streaming failed. Please try again.' });
          abortStreamRef.current = null;
        },
      );

      abortStreamRef.current = abort;
    },
    [state.selectedModel]
  );

  const sendMessage = useCallback(
    (content) => {
      if (!content.trim() || state.isLoading || state.isStreaming) return;

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

      _startStream(convId, content);
    },
    [state.activeConversationId, state.isLoading, state.isStreaming, state.selectedModel, persistedMessages, _startStream]
  );

  const stopStreaming = useCallback(() => {
    if (abortStreamRef.current) {
      abortStreamRef.current();
      abortStreamRef.current = null;
    }
    dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: { streaming: false } });
    dispatch({ type: 'SET_STREAMING', payload: false });
    dispatch({ type: 'SET_LOADING', payload: false });
    dispatch({ type: 'SET_ACTIVE_TOOL', payload: null });
  }, []);

  const regenerateLastResponse = useCallback(() => {
    const msgs = state.messages;
    if (msgs.length < 2) return;

    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    dispatch({ type: 'REMOVE_LAST_MESSAGE' });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    _startStream(state.activeConversationId, lastUserMsg.content);
  }, [state.messages, state.activeConversationId, _startStream]);

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
        stopStreaming,
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
