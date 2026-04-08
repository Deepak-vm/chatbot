import { Terminal, Database, Bug, CheckSquare, Sparkles, TrendingUp, Calculator, Search, Zap } from 'lucide-react';
import { useChat } from '../../hooks/useChat';

// Add all icons used by PROMPT_CARDS in constants.js here
const ICON_MAP = { Terminal, Database, Bug, CheckSquare, Sparkles, TrendingUp, Calculator, Search, Zap };

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
        padding: '16px 18px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 100,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.background = '#111'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#232323'; e.currentTarget.style.background = '#0d0d0d'; }}
    >
      <Icon size={18} style={{ color: '#d4ff4f' }}/>
      <div style={{ fontSize: 14, color: '#f5f5f5', marginTop: 10, fontWeight: 500 }}>
        {card.title}
      </div>
      <div style={{ fontSize: 12, color: '#8a8a8a', marginTop: 4, lineHeight: 1.5 }}>
        {card.description}
      </div>
    </button>
  );
}
