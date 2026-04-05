import { PromptCard } from './PromptCard';
import { PROMPT_CARDS } from '../../utils/constants';

export function WelcomeScreen() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 28px',
      overflow: 'hidden',
      height: '100%',
      width: '100%',
    }}>
      {/* Greeting */}
      <div style={{ fontSize: 26, fontWeight: 500, color: '#f5f5f5', marginBottom: 6 }}>
        Hello, Deepak
      </div>
      <div style={{ fontSize: 15, color: '#8a8a8a', marginBottom: 28 }}>
        How can I help you today?
      </div>

      {/* 2×2 Prompt cards — fills available width */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        width: '100%',
        maxWidth: 840,
      }}>
        {PROMPT_CARDS.map(card => (
          <PromptCard key={card.id} card={card}/>
        ))}
      </div>
    </div>
  );
}
