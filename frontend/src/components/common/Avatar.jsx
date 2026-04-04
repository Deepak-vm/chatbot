import { getInitials } from '../../utils/helpers';

/**
 * Avatar — circular user/bot avatar
 */
export function Avatar({ name = 'User', size = 'md', src, className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-indigo-500/30 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-semibold text-white ring-2 ring-indigo-500/20 shrink-0 ${className}`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}

/**
 * BotAvatar — the LangGraph sparkle avatar
 */
export function BotAvatar({ size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-7 h-7 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white ring-2 ring-indigo-500/20 shrink-0 ${className}`}
      aria-label="LangGraph Agent"
    >
      ✦
    </div>
  );
}
