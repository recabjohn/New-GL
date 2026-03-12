import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function Card({
  title,
  subtitle,
  children,
  collapsible = false,
  defaultOpen = true,
  actions,
  className = '',
  noPadding = false,
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden transition-shadow duration-200 hover:shadow-md ${className}`}>
      {title && (
        <div
          className={`flex items-center justify-between px-5 py-3 border-b border-stone-100 ${collapsible ? 'cursor-pointer select-none hover:bg-stone-25' : ''}`}
          onClick={collapsible ? () => setOpen(o => !o) : undefined}
        >
          <div>
            <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
            {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {actions && <div onClick={e => e.stopPropagation()}>{actions}</div>}
            {collapsible && (
              open
                ? <ChevronUp className="h-4 w-4 text-stone-400" />
                : <ChevronDown className="h-4 w-4 text-stone-400" />
            )}
          </div>
        </div>
      )}
      {(!collapsible || open) && (
        <div className={noPadding ? '' : 'p-5'}>
          {children}
        </div>
      )}
    </div>
  )
}
