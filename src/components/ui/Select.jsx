import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

export default function Select({
  label,
  error,
  hint,
  required,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  className = '',
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  const filtered = searchable
    ? options.filter(o => {
        const text = typeof o === 'string' ? o : o.label
        return text.toLowerCase().includes(query.toLowerCase())
      })
    : options

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getLabel = v => {
    if (!v) return null
    const found = options.find(o => (typeof o === 'string' ? o : o.value) === v)
    if (!found) return v
    return typeof found === 'string' ? found : found.label
  }

  const select = v => { onChange?.(v); setOpen(false); setQuery('') }

  return (
    <div className={`w-full ${className}`} ref={ref}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-flame-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(o => !o)}
          className={[
            'form-input flex items-center justify-between text-left cursor-pointer',
            error ? 'form-input-error' : '',
            'disabled:bg-stone-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          <span className={value ? 'text-stone-800' : 'text-stone-400'}>
            {value ? getLabel(value) : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-stone-200 shadow-elevated py-1 max-h-60 overflow-hidden flex flex-col">
            {searchable && (
              <div className="px-2 py-1.5 border-b border-stone-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-ink-400"
                    placeholder="Search..."
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                      <X className="h-3.5 w-3.5 text-stone-400" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-stone-400 text-center">No results</p>
              ) : filtered.map((o, i) => {
                const val = typeof o === 'string' ? o : o.value
                const lbl = typeof o === 'string' ? o : o.label
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => select(val)}
                    className={[
                      'w-full text-left px-3 py-2 text-sm transition-colors duration-100',
                      val === value ? 'bg-ink-50 text-ink-700 font-medium' : 'text-stone-700 hover:bg-stone-50',
                    ].join(' ')}
                  >
                    {lbl}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-crimson-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  )
}
