import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export default function Select({
  label,
  error,
  hint,
  required,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  searchable: _searchable = false, // kept for API compat — search is disabled globally
  className = '',
  disabled = false,
}) {
  const [open, setOpen]     = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const ref     = useRef(null)
  const btnRef  = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setOpenUp(window.innerHeight - rect.bottom < 220)
    }
    setOpen(o => !o)
  }

  const getLabel = v => {
    if (!v) return null
    const found = options.find(o => (typeof o === 'string' ? o : o.value) === v)
    if (!found) return v
    return typeof found === 'string' ? found : found.label
  }

  const select = v => { onChange?.(v); setOpen(false) }

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
          ref={btnRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={[
            'form-input flex items-center justify-between text-left cursor-pointer',
            error ? 'form-input-error' : '',
            'disabled:bg-stone-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          <span className={value ? 'text-stone-800' : 'text-stone-400'}>
            {value ? getLabel(value) : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 text-stone-400 shrink-0 ml-2 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className={[
            'absolute z-50 w-full bg-white rounded-lg border border-stone-200 shadow-elevated overflow-y-auto max-h-52',
            openUp ? 'bottom-full mb-1' : 'top-full mt-1',
          ].join(' ')}>
            {options.map((o, i) => {
              const val = typeof o === 'string' ? o : o.value
              const lbl = typeof o === 'string' ? o : o.label
              const isSelected = val === value
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => select(val)}
                  className={[
                    'w-full text-left px-3 py-1.5 text-sm flex items-center justify-between gap-2 transition-colors duration-100',
                    isSelected
                      ? 'bg-ink-50 text-ink-700 font-medium'
                      : 'text-stone-700 hover:bg-stone-50',
                  ].join(' ')}
                >
                  <span>{lbl}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-ink-500 shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-crimson-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  )
}
