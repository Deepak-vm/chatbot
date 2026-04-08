import { Search, Calculator, TrendingUp, Wrench, CheckCircle } from 'lucide-react';

// Map tool names from the backend to icons and display labels
const TOOL_META = {
  search_tool:      { icon: Search,      label: 'Web Search',     color: '#60a5fa' },
  calculator:       { icon: Calculator,  label: 'Calculator',      color: '#a78bfa' },
  get_stock_price:  { icon: TrendingUp,  label: 'Stock Lookup',   color: '#34d399' },
};

function getToolMeta(name) {
  return TOOL_META[name] ?? { icon: Wrench, label: name, color: '#f59e0b' };
}

/**
 * Shown while a tool call is in-flight (spinner + tool name).
 * Receives: activeTool = { name: string, input: object } | null
 */
export function ToolCallBubble({ activeTool }) {
  if (!activeTool) return null;
  const { icon: Icon, label, color } = getToolMeta(activeTool.name);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 20,
        background: `${color}14`,
        border: `0.5px solid ${color}40`,
        margin: '4px 0',
      }}
    >
      {/* Animated pulsing icon */}
      <span style={{ color, display: 'flex', animation: 'toolPulse 1.2s ease-in-out infinite' }}>
        <Icon size={13} />
      </span>
      <span style={{ fontSize: 12, color, fontWeight: 500 }}>
        Using {label}…
      </span>
    </div>
  );
}

/**
 * Shown after a tool call completes (small "used X" badge).
 */
export function ToolUsedBadge({ name }) {
  const { icon: Icon, label, color } = getToolMeta(name);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 12,
        background: `${color}12`,
        border: `0.5px solid ${color}30`,
        fontSize: 11,
        color: `${color}cc`,
        marginRight: 4,
        marginBottom: 6,
      }}
    >
      <CheckCircle size={9} />
      <Icon size={9} />
      {label}
    </span>
  );
}
