import { useContext, useCallback } from 'react';
import { ChatContext } from '../context/ChatContext';

/**
 * useChat — convenience hook for consuming ChatContext
 */
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isStreaming,
    error,
    selectedModel,
    sidebarOpen,
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
  } = context;

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  return {
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    isLoading,
    isStreaming,
    error,
    selectedModel,
    sidebarOpen,
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
  };
}
