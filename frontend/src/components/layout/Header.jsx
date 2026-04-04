import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, ChevronDown, Check, Menu } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { MODELS } from '../../utils/constants';

function ModelPicker() {
  const { selectedModel, setModel } = useChat();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          fontSize: 13, color: '#f5f5f5',
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#141414', border: '0.5px solid #232323',
          borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4ff4f', display: 'inline-block', flexShrink: 0 }}/>
        {selectedModel.label}
        <ChevronDown size={13} style={{ color: '#8a8a8a', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}/>
      </button>

      {open && (
        <div
          className="drop-in"
          role="listbox"
          style={{
            position: 'absolute', left: 0, top: 'calc(100% + 6px)',
            width: 220, background: '#0a0a0a',
            border: '0.5px solid #232323', borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)', zIndex: 50, overflow: 'hidden',
          }}
        >
          {MODELS.map(m => (
            <button
              key={m.id}
              role="option"
              aria-selected={selectedModel.id === m.id}
              onClick={() => { setModel(m); setOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#141414'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: '#f5f5f5', fontWeight: 500 }}>{m.label}</p>
                <p style={{ fontSize: 11, color: '#7a7a7a', marginTop: 2 }}>{m.description}</p>
              </div>
              {selectedModel.id === m.id && <Check size={13} style={{ color: '#d4ff4f', flexShrink: 0 }}/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { toggleSidebar } = useChat();
  const [dark, setDark] = useState(true);

  return (
    <header style={{
      height: 48,
      borderBottom: '0.5px solid #232323',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
      background: '#000',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={toggleSidebar}
          className="lg:hidden"
          style={{ color: '#7a7a7a', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          aria-label="Toggle sidebar"
        >
          <Menu size={17}/>
        </button>
        <ModelPicker/>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setDark(v => !v)}
          style={{ color: '#8a8a8a', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={16}/> : <Moon size={16}/>}
        </button>
        {/* Avatar */}
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: '#232323', color: '#f5f5f5', fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 500, border: '0.5px solid #333',
        }}>
          D
        </div>
      </div>
    </header>
  );
}
