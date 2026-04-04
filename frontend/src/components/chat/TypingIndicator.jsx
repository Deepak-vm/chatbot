export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 18 }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="typing-dot"
          style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#d4ff4f' }}
        />
      ))}
    </div>
  );
}
