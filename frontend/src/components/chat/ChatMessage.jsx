import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { formatTimestamp, copyToClipboard } from '../../utils/helpers';
import { useChat } from '../../hooks/useChat';

/* ── Code block ─────────────────────────────────────── */
function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    const ok = await copyToClipboard(String(children));
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '0.5px solid #232323', margin: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: '#0a0a0a', borderBottom: '0.5px solid #232323' }}>
        <span style={{ fontSize: 11, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{language || 'code'}</span>
        <button onClick={handle} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: copied ? '#d4ff4f' : '#7a7a7a', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: 4 }}>
          {copied ? <Check size={10}/> : <Copy size={10}/>} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div style={{ padding: '12px 14px', background: '#080808', overflowX: 'auto' }}>
        <code style={{ fontSize: 13, color: '#d4d4d8', fontFamily: 'monospace', whiteSpace: 'pre', lineHeight: 1.6 }}>{children}</code>
      </div>
    </div>
  );
}

const mdComponents = {
  code({ node, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    // Inline code: no language class and content is a single line string
    const isInline = !match && !String(children).includes('\n');
    return isInline
      ? <code style={{ background: '#1a1a1a', color: '#d4ff4f', padding: '2px 6px', borderRadius: 4, fontSize: '0.85em', fontFamily: 'monospace' }} {...props}>{children}</code>
      : <CodeBlock language={match?.[1]}>{children}</CodeBlock>;
  },
  pre({ children }) { return <>{children}</>; },
};

/* ── Message actions ─────────────────────────────────── */
function MessageActions({ content, onRegenerate, isLast }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);

  const actions = [
    { id: 'copy', icon: copied ? Check : Copy, label: copied ? 'Copied' : 'Copy', onClick: async () => { const ok = await copyToClipboard(content); if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); } }, active: copied },
    ...(isLast ? [{ id: 'regen', icon: RefreshCw, label: 'Regenerate', onClick: onRegenerate }] : []),
    { id: 'like',    icon: ThumbsUp,   label: 'Like',    onClick: () => setLiked(v => v === 'up'   ? null : 'up'),   active: liked === 'up'   },
    { id: 'dislike', icon: ThumbsDown, label: 'Dislike', onClick: () => setLiked(v => v === 'down' ? null : 'down'), active: liked === 'down' },
  ];

  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
      {actions.map(({ id, icon: Icon, label, onClick, active }) => (
        <button
          key={id}
          onClick={onClick}
          title={label}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
            fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer',
            background: active ? 'rgba(212,255,79,0.1)' : 'none',
            color: active ? '#d4ff4f' : '#7a7a7a',
            transition: 'all 0.12s',
          }}
          onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#f5f5f5'; }}
          onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#7a7a7a'; }}
        >
          <Icon size={12}/> <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── ChatMessage ─────────────────────────────────────── */
export function ChatMessage({ message, isLast }) {
  const { regenerateLastResponse, selectedModel } = useChat();
  const isUser = message.role === 'user';

  return (
    <div className="msg-in" style={{ display: 'flex', gap: 10 }}>
      {/* Avatar */}
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: isUser ? '#1a1a1a' : '#1a1a1a',
        border: '0.5px solid #333',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: isUser ? 11 : 12, fontWeight: 500,
        color: isUser ? '#f5f5f5' : '#d4ff4f',
        marginTop: 2,
      }}>
        {isUser ? 'D' : '✦'}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: isUser ? '#f5f5f5' : '#f5f5f5' }}>
            {isUser ? 'Deepak' : selectedModel.label}
          </span>
          <span style={{ fontSize: 11, color: '#444' }}>{formatTimestamp(message.timestamp)}</span>
        </div>

        {isUser ? (
          <p style={{ fontSize: 14, color: '#d4d4d4', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{message.content}</p>
        ) : (
          <div className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {message.content}
            </ReactMarkdown>
            {message.streaming && (
              <span style={{
                display: 'inline-block',
                width: 8,
                height: 16,
                background: '#d4ff4f',
                borderRadius: 2,
                marginLeft: 2,
                verticalAlign: 'middle',
                animation: 'blink 0.8s step-end infinite',
              }} />
            )}
          </div>
        )}

        {!isUser && (
          <MessageActions content={message.content} onRegenerate={regenerateLastResponse} isLast={isLast}/>
        )}
      </div>
    </div>
  );
}
