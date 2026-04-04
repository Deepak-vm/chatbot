import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Dropdown — accessible select-like dropdown
 */
export function Dropdown({
  trigger,
  items = [],
  value,
  onChange,
  align = 'left',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 text-sm text-gray-200 hover:text-white bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] rounded-xl px-3 py-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {trigger || value?.label || 'Select'}
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Menu */}
      {open && (
        <div
          role="listbox"
          className={`absolute ${alignClass} top-full mt-2 min-w-[200px] bg-[#0d111c] border border-[#1f2937] rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden`}
          style={{
            animation: 'message-in 0.15s ease forwards',
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="option"
              aria-selected={value?.id === item.id}
              onClick={() => {
                onChange?.(item);
                setOpen(false);
              }}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 group-hover:text-white">
                  {item.label}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                )}
              </div>
              {value?.id === item.id && (
                <Check size={14} className="text-indigo-400 mt-0.5 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
