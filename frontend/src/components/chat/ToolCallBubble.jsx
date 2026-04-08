import { Search, Calculator, TrendingUp, Wrench, CheckCircle, Globe, Zap } from 'lucide-react';

// Map tool names from the backend to icons, display labels and step hints
const TOOL_META = {
  search_tool:      { icon: Globe,       label: 'Web Search',   color: '#60a5fa', step: 'Searching the web…',        bg: 'rgba(96,165,250,0.06)'  },
  calculator:       { icon: Calculator,  label: 'Calculator',   color: '#a78bfa', step: 'Running calculation…',       bg: 'rgba(167,139,250,0.06)' },
  get_stock_price:  { icon: TrendingUp,  label: 'Stock Lookup', color: '#34d399', step: 'Fetching live stock data…',  bg: 'rgba(52,211,153,0.06)'  },
};

function getToolMeta(name) {
  return TOOL_META[name] ?? {
    icon: Wrench, label: name, color: '#f59e0b',
    step: 'Running tool…', bg: 'rgba(245,158,11,0.06)',
  };
}

/** Extract a short human-readable query from the tool input object */
function getQueryHint(input) {
  if (!input || typeof input !== 'object') return null;
  const val = input.query ?? input.symbol ?? input.expression ?? input.input ?? null;
  if (!val) return null;
  const str = String(val);
  return str.length > 60 ? str.slice(0, 57) + '…' : str;
}

/**
 * ToolStatusContainer — prominent status card shown while a tool is in-flight.
 * Receives: activeTool = { name: string, input: object } | null
 */
export function ToolCallBubble({ activeTool }) {
  if (!activeTool) return null;
  const { icon: Icon, label, color, step, bg } = getToolMeta(activeTool.name);
  const query = getQueryHint(activeTool.input);

  return (
    <div className="tool-status-container" style={{ '--tool-color': color, '--tool-bg': bg }}>
      {/* Left accent bar */}
      <div className="tool-status-accent" />

      {/* Icon ring */}
      <div className="tool-status-icon-ring">
        <Icon size={15} />
      </div>

      {/* Text block */}
      <div className="tool-status-body">
        <div className="tool-status-header">
          <span className="tool-status-label">{label}</span>
          <span className="tool-status-dot-row">
            <span className="tool-status-dot" style={{ animationDelay: '0s' }} />
            <span className="tool-status-dot" style={{ animationDelay: '0.2s' }} />
            <span className="tool-status-dot" style={{ animationDelay: '0.4s' }} />
          </span>
        </div>
        <div className="tool-status-step">{step}</div>
        {query && (
          <div className="tool-status-query">
            <Zap size={9} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{query}</span>
          </div>
        )}
        {/* Shimmer progress bar */}
        <div className="tool-status-bar">
          <div className="tool-status-bar-fill" />
        </div>
      </div>
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
