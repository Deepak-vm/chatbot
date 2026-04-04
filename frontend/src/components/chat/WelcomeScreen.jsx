

export function WelcomeScreen() {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      overflow: 'hidden',
      height: '100%',
    }}>
      {/* Greeting */}
      <div style={{ fontSize: 22, fontWeight: 500, color: '#f5f5f5', marginBottom: 4 }}>
        Hello, Deepak
      </div>
      <div style={{ fontSize: 14, color: '#8a8a8a', marginBottom: 20 }}>
        How can I help you today?
      </div>

      {/* 2×2 Prompt cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        width: '100%',
        maxWidth: 520,
      }}>

      </div>
    </div>
  );
}
