import { useState } from 'react';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/helpers';

export function MessageActions({ content, onRegenerate, isLast }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null);

  const handle = async () => {
    const ok = await copyToClipboard(content);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const actions = [
    { id: 'copy', icon: copied ? Check : Copy, label: copied ? 'Copied' : 'Copy', onClick: handle, active: copied },
    ...(isLast ? [{ id: 'regen', icon: RefreshCw, label: 'Regenerate', onClick: onRegenerate }] : []),
    { id: 'like',    icon: ThumbsUp,   label: 'Like',    onClick: () => setLiked(v => v === 'up' ? null : 'up'),    active: liked === 'up'   },
    { id: 'dislike', icon: ThumbsDown, label: 'Dislike', onClick: () => setLiked(v => v === 'down' ? null : 'down'), active: liked === 'down' },
  ];

  return (
    <div className="flex items-center gap-1 mt-2.5">
      {actions.map(({ id, icon: Icon, label, onClick, active }) => (
        <button
          key={id}
          onClick={onClick}
          title={label}
          aria-label={label}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-[7px] text-[12px] transition-all duration-150 ${
            active
              ? 'bg-violet-500/15 text-violet-400'
              : 'text-[#555560] hover:text-[#888890] hover:bg-[#1e1e20]'
          }`}
        >
          <Icon size={13}/>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
