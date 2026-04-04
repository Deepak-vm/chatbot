/**
 * Button — reusable button with variants
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  title,
  'aria-label': ariaLabel,
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b14] disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20',
    secondary:
      'bg-[#1f2937] hover:bg-[#374151] active:bg-[#111827] text-gray-200 border border-[#374151]',
    ghost:
      'text-gray-400 hover:text-gray-200 hover:bg-white/5 active:bg-white/10',
    danger:
      'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20',
    gradient:
      'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1.5 gap-1',
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3',
    icon: 'p-2',
    'icon-sm': 'p-1.5',
  };

  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
