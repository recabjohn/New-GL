import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' }

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-modal w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="text-base font-semibold text-stone-900">{title}</h2>
            {subtitle && <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-stone-100 bg-stone-25 rounded-b-2xl flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
