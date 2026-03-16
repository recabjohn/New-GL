import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'

export default function Select({
  label, error, hint, required,
  options = [], value, onChange,
  placeholder = 'Select...',
  searchable = false,
  className = '',
  disabled = false,
}) {
  const [open, setOpen]               = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, bottom: 0, left: 0, width: 0, openUp: false })
  const [query, setQuery]             = useState('')
  const ref      = useRef(null)
  const btnRef   = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (
        ref.current && !ref.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) setOpen(false)
    }
    const closeOnScroll = e => {
      if (panelRef.current && panelRef.current.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    window.addEventListener('scroll', closeOnScroll, true)
    window.addEventListener('resize', closeOnScroll)
    return () => {
      document.removeEventListener('mousedown', handler)
      window.removeEventListener('scroll', closeOnScroll, true)
      window.removeEventListener('resize', closeOnScroll)
    }
  }, [])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      const openUp = (window.innerHeight - r.bottom) < 220
      setDropdownPos({ top: r.bottom + 4, bottom: window.innerHeight - r.top + 4, left: r.left, width: r.width, openUp })
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

  const panelStyle = {
    position: 'fixed',
    left: dropdownPos.left,
    width: dropdownPos.width,
    zIndex: 9999,
    ...(dropdownPos.openUp ? { bottom: dropdownPos.bottom } : { top: dropdownPos.top }),
  }

  const filteredOptions = useMemo(() => {
    if (!query) return options
    const lowerQ = query.toLowerCase()
    return options.filter(o => {
      const lbl = typeof o === 'string' ? o : o.label
      return lbl.toLowerCase().includes(lowerQ)
    })
  }, [options, query])

  return (
    <div className={'w-full ' + className} ref={ref}>
      {label && (
        <label className="form-label">
          {label}{required && <span className="text-crimson-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className={['form-input flex items-center justify-between text-left cursor-pointer', error ? 'form-input-error' : '', 'disabled:bg-stone-50 disabled:cursor-not-allowed'].join(' ')}
        >
          <span className={value ? 'text-stone-800 truncate pr-2' : 'text-stone-400 truncate pr-2'}>
            {value ? getLabel(value) : placeholder}
          </span>
          <ChevronDown className={'h-4 w-4 text-stone-400 shrink-0 ml-auto transition-transform duration-150 ' + (open ? 'rotate-180' : '')} />
        </button>

        {open && (
          <div ref={panelRef} style={panelStyle} className="bg-white rounded-lg border border-stone-200 shadow-elevated flex flex-col max-h-64">
            {searchable && (
              <div className="p-2 border-b border-stone-100 flex-shrink-0 relative">
                <Search className="h-4 w-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-transparent placeholder-stone-400"
                  placeholder="Search..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
            )}
            <div className="overflow-y-auto w-full">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-sm text-stone-400 text-center">No results found</div>
              ) : (
                filteredOptions.map((o, i) => {
                  const val = typeof o === 'string' ? o : o.value
                  const lbl = typeof o === 'string' ? o : o.label
                  const isSelected = val === value
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => select(val)}
                      className={['w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors duration-100', isSelected ? 'bg-ink-50 text-ink-700 font-medium' : 'text-stone-700 hover:bg-stone-50'].join(' ')}
                    >
                      <span className="truncate">{lbl}</span>
                      {isSelected && <Check className="h-4 w-4 text-ink-500 shrink-0" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-crimson-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  )
}