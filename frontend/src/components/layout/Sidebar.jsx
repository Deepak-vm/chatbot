import { useState, useRef, useEffect } from 'react';
import { Plus, Search, MessageSquare, Settings, Key, Trash2, Edit3, Check, X } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { groupConversationsByDate, truncate } from '../../utils/helpers';
import { CONVERSATION_GROUPS } from '../../utils/constants';

/* ── Inline rename ─────────────────────────────────── */
function RenameInput({ value, onSave, onCancel }) {
  const [text, setText] = useState(value);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <div className="flex items-center gap-1 flex-1 min-w-0" onClick={e => e.stopPropagation()}>
      <input
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSave(text); if (e.key === 'Escape') onCancel(); }}
        style={{ background: '#1a1a1a', border: '0.5px solid #d4ff4f55', borderRadius: 4, padding: '1px 6px', fontSize: 12, color: '#f5f5f5', flex: 1, minWidth: 0 }}
      />
      <button onClick={() => onSave(text)} style={{ color: '#d4ff4f', padding: 2 }}><Check size={11}/></button>
      <button onClick={onCancel} style={{ color: '#555', padding: 2 }}><X size={11}/></button>
    </div>
  );
}

/* ── Conversation item ─────────────────────────────── */
function ConvItem({ conv, isActive, onSelect, onDelete, onRename }) {
  const [hovered, setHovered] = useState(false);
  const [renaming, setRenaming] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={conv.title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => !renaming && onSelect(conv.id)}
      onKeyDown={e => e.key === 'Enter' && !renaming && onSelect(conv.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 8px',
        borderRadius: isActive ? '0 6px 6px 0' : 6,
        fontSize: 12,
        cursor: 'pointer',
        marginBottom: 2,
        background: isActive ? '#161616' : hovered ? '#111' : 'transparent',
        color: isActive ? '#f5f5f5' : '#8a8a8a',
        borderLeft: isActive ? '2px solid #d4ff4f' : '2px solid transparent',
        transition: 'all 0.12s ease',
        userSelect: 'none',
      }}
    >
      <MessageSquare size={13} style={{ flexShrink: 0, opacity: 0.7 }}/>
      {renaming ? (
        <RenameInput
          value={conv.title}
          onSave={t => { onRename(conv.id, t); setRenaming(false); }}
          onCancel={() => setRenaming(false)}
        />
      ) : (
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {truncate(conv.title, 24)}
        </span>
      )}
      {(hovered || isActive) && !renaming && (
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setRenaming(true)}
            title="Rename"
            style={{ padding: 2, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}
          ><Edit3 size={10}/></button>
          <button
            onClick={() => onDelete(conv.id)}
            title="Delete"
            style={{ padding: 2, color: '#555', background: 'none', border: 'none', cursor: 'pointer' }}
          ><Trash2 size={10}/></button>
        </div>
      )}
    </div>
  );
}

/* ── Sidebar ───────────────────────────────────────── */
export function Sidebar() {
  const {
    conversations, activeConversationId, sidebarOpen,
    newChat, selectConversation, deleteConversation,
    renameConversation, setSidebarOpen,
  } = useChat();
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  const groups = groupConversationsByDate(filtered);
  const order = [
    CONVERSATION_GROUPS.TODAY,
    CONVERSATION_GROUPS.YESTERDAY,
    CONVERSATION_GROUPS.PREVIOUS_7_DAYS,
    CONVERSATION_GROUPS.OLDER,
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Sidebar"
        style={{
          width: sidebarOpen ? 200 : 0,
          background: '#0a0a0a',
          borderRight: '0.5px solid #232323',
          display: 'flex',
          flexDirection: 'column',
          padding: sidebarOpen ? '14px 10px' : 0,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.25s ease, padding 0.25s ease',
          position: 'relative',
        }}
        className="fixed lg:relative inset-y-0 left-0 z-30 lg:z-auto h-full"
      >
        <div style={{ width: 180, display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px 14px', color: '#f5f5f5', fontSize: 14, fontWeight: 500 }}>
            <span style={{ fontSize: 16 }}>⌥</span>
            LangGraph Chat
          </div>

          {/* New Chat — WHITE button */}
          <button
            onClick={newChat}
            style={{
              background: '#f5f5f5',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 12,
              fontWeight: 500,
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <Plus size={15}/> New chat
          </button>

          {/* Search */}
          <div style={{
            background: '#141414',
            border: '0.5px solid #232323',
            borderRadius: 8,
            padding: '6px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 16,
          }}>
            <Search size={14} style={{ color: '#7a7a7a', flexShrink: 0 }}/>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations"
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: 12,
                color: '#7a7a7a',
                width: '100%',
              }}
              aria-label="Search conversations"
            />
          </div>

          {/* Conversations */}
          <nav style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
            {order.map(group => {
              const items = groups[group];
              if (!items?.length) return null;
              return (
                <div key={group}>
                  <div style={{ fontSize: 11, color: '#7a7a7a', padding: '0 4px 6px', marginTop: group !== order[0] ? 10 : 0 }}>
                    {group}
                  </div>
                  {items.map(conv => (
                    <ConvItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeConversationId}
                      onSelect={selectConversation}
                      onDelete={deleteConversation}
                      onRename={renameConversation}
                    />
                  ))}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ fontSize: 12, color: '#555', textAlign: 'center', marginTop: 24 }}>No results</div>
            )}
          </nav>

          {/* Bottom */}
          <div style={{ borderTop: '0.5px solid #232323', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: Settings, label: 'Settings' },
              { icon: Key, label: 'API keys' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                style={{ fontSize: 12, color: '#8a8a8a', display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', textAlign: 'left' }}
              >
                <Icon size={14}/>{label}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
