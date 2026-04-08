import { useEffect, useRef } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeScreen } from './WelcomeScreen';
import { MessageComposer } from './MessageComposer';
import { ToolCallBubble } from './ToolCallBubble';

function ThinkingBubble({ model }) {
  return (
    <div className="msg-in" style={{ display: 'flex', gap: 10, padding: '4px 0' }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: '#1a1a1a', border: '0.5px solid #333',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, color: '#d4ff4f', marginTop: 2,
      }}>✦</div>
      <div style={{ paddingTop: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#f5f5f5', marginBottom: 8 }}>{model.label}</div>
        <TypingIndicator/>
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      margin: '0 16px 8px',
      padding: '12px 14px',
      background: 'rgba(255,60,60,0.06)',
      border: '0.5px solid rgba(255,60,60,0.2)',
      borderRadius: 10,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <AlertTriangle size={14} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }}/>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#fca5a5' }}>Something went wrong</p>
        <p style={{ fontSize: 12, color: '#f8717160', marginTop: 2 }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, color: '#f87171', background: 'rgba(248,113,113,0.1)',
            border: '0.5px solid rgba(248,113,113,0.2)', borderRadius: 6,
            padding: '4px 10px', cursor: 'pointer',
          }}
        >
          <RefreshCw size={11}/> Retry
        </button>
      )}
    </div>
  );
}

export function ChatWindow() {
  const { messages, isLoading, isStreaming, error, selectedModel, regenerateLastResponse, dispatch, activeTool } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {messages.length === 0 && !isLoading ? (
          <WelcomeScreen/>
        ) : (
          <div style={{ width: '100%', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isLast={i === messages.length - 1 && msg.role === 'assistant'}
              />
            ))}
            {/* Tool-call indicator: shown while a tool is running */}
            {activeTool && (
              <ToolCallBubble activeTool={activeTool} />
            )}
            {isLoading && !isStreaming && !activeTool && <ThinkingBubble model={selectedModel}/>}
            <div ref={bottomRef}/>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => { dispatch({ type: 'CLEAR_ERROR' }); regenerateLastResponse(); }}
        />
      )}

      <MessageComposer/>
    </div>
  );
}
