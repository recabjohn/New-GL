const variants = {
  primary:   'bg-ink-700 text-white hover:bg-ink-800 focus:ring-ink-500 shadow-sm',
  cta:       'bg-flame-500 text-white hover:bg-flame-600 focus:ring-flame-400 shadow-sm',
  secondary: 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 focus:ring-ink-400 shadow-sm',
  ghost:     'bg-transparent text-stone-600 hover:bg-stone-100 focus:ring-stone-300',
  danger:    'bg-crimson-600 text-white hover:bg-crimson-700 focus:ring-crimson-400 shadow-sm',
  success:   'bg-sage-600 text-white hover:bg-sage-700 focus:ring-sage-400 shadow-sm',
}

const sizes = {
  xs:  'px-2.5 py-1.5 text-xs rounded',
  sm:  'px-3 py-1.5 text-sm rounded-md',
  md:  'px-4 py-2 text-sm rounded-lg',
  lg:  'px-5 py-2.5 text-base rounded-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconRight,
  ...props
}) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
      {iconRight && !loading && <iconRight className="h-4 w-4 shrink-0" />}
    </button>
  )
}
