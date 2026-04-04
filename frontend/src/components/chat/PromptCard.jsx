import { Layers, Database, Code2, Sparkles } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

const ICON_MAP = { Layers, Database, Code2, Sparkles };

export function PromptCard({ card }) {
  const { sendMessage } = useChat();
  const Icon = ICON_MAP[card.icon] || Sparkles;

  return (
    <button
      onClick={() => sendMessage(card.prompt)}
      aria-label={card.title}
      style={{
        background: '#0d0d0d',
        border: '0.5px solid #232323',
        borderRadius: 10,
        padding: 12,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.background = '#111'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#232323'; e.currentTarget.style.background = '#0d0d0d'; }}
    >
      {/* Lime icon */}
      <Icon size={16} style={{ color: '#d4ff4f' }} />
      {/* Title */}
      <div style={{ fontSize: 13, color: '#f5f5f5', marginTop: 6, fontWeight: 500 }}>
        {card.title}
      </div>
      {/* Description */}
      <div style={{ fontSize: 11, color: '#8a8a8a', marginTop: 2 }}>
        {card.description}
      </div>
    </button>
  );
}
