import { useRef, useEffect, useState } from 'react';
import { Paperclip, Globe, Image, ArrowUp, Square } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

export function MessageComposer() {
  const { sendMessage, isLoading, selectedModel } = useChat();
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  /* Auto-grow */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [value]);

  const canSend = value.trim().length > 0 && !isLoading;

  const handleSend = () => {
    if (!canSend) return;
    sendMessage(value.trim());
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ padding: '8px 28px 16px', flexShrink: 0 }}>
      <div style={{ width: '100%' }}>
        {/* Input card — matches reference exactly */}
        <div style={{
          background: '#0d0d0d',
          border: '0.5px solid #2a2a2a',
          borderRadius: 14,
          padding: '10px 14px',
        }}>
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKey}
            disabled={isLoading}
            placeholder={`Message ${selectedModel.label}…`}
            rows={1}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 13,
              color: '#f5f5f5',
              lineHeight: 1.6,
              marginBottom: 8,
              minHeight: 22,
              maxHeight: 160,
            }}
            aria-label="Message input"
          />

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left tools */}
            <div style={{ display: 'flex', gap: 10, color: '#8a8a8a' }}>
              {[Paperclip, Globe, Image].map((Icon, i) => (
                <button
                  key={i}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8a8a', padding: 0, display: 'flex' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f5f5f5'}
                  onMouseLeave={e => e.currentTarget.style.color = '#8a8a8a'}
                >
                  <Icon size={15}/>
                </button>
              ))}
            </div>

            {/* Send button — WHITE circle */}
            <button
              onClick={isLoading ? undefined : handleSend}
              disabled={!canSend && !isLoading}
              aria-label={isLoading ? 'Stop' : 'Send'}
              style={{
                width: 26, height: 26, borderRadius: '50%',
                background: canSend || isLoading ? '#f5f5f5' : '#2a2a2a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: canSend || isLoading ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s, transform 0.1s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (canSend) e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {isLoading
                ? <Square size={10} fill="#000" style={{ color: '#000' }}/>
                : <ArrowUp size={14} style={{ color: canSend ? '#000' : '#555' }}/>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
