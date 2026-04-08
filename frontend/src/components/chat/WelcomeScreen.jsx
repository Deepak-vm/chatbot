import { Search, Calculator, TrendingUp } from 'lucide-react';
import { PromptCard } from './PromptCard';
import { PROMPT_CARDS } from '../../utils/constants';

// Pills that show which tools are available
const TOOLS = [
  { icon: Search,     label: 'Web Search',   color: '#60a5fa' },
  { icon: Calculator, label: 'Calculator',    color: '#a78bfa' },
  { icon: TrendingUp, label: 'Stock Lookup', color: '#34d399' },
];

export function WelcomeScreen() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 28px',
        overflow: 'hidden',
        height: '100%',
        width: '100%',
      }}
    >
      {/* Greeting */}
      <div style={{ fontSize: 26, fontWeight: 500, color: '#f5f5f5', marginBottom: 6 }}>
        Hello, Deepak
      </div>
      <div style={{ fontSize: 15, color: '#8a8a8a', marginBottom: 16 }}>
        How can I help you today?
      </div>

      {/* Tool pills — shows what's available */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
        {TOOLS.map(({ icon: Icon, label, color }) => (
          <span
            key={label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 20,
              background: `${color}14`,
              border: `0.5px solid ${color}40`,
              fontSize: 12,
              color: `${color}cc`,
              fontWeight: 500,
            }}
          >
            <Icon size={11} />
            {label}
          </span>
        ))}
      </div>

      {/* 2×2 Prompt cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
          width: '100%',
          maxWidth: 840,
        }}
      >
        {PROMPT_CARDS.map(card => (
          <PromptCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
