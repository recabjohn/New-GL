import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-sage-500" />,
  error:   <XCircle className="h-5 w-5 text-crimson-500" />,
  info:    <Info className="h-5 w-5 text-ink-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
}

const borders = {
  success: 'border-l-4 border-sage-400',
  error:   'border-l-4 border-crimson-400',
  info:    'border-l-4 border-ink-400',
  warning: 'border-l-4 border-amber-400',
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), toast.duration || 6000)
    return () => clearTimeout(t)
  }, [toast, onRemove])

  return (
    <div className={`flex items-start gap-3 bg-white rounded-xl shadow-elevated px-4 py-3.5 min-w-[300px] max-w-sm ${borders[toast.type] || borders.info}`}>
      <div className="shrink-0 mt-0.5">{icons[toast.type] || icons.info}</div>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-sm font-semibold text-stone-800">{toast.title}</p>}
        {toast.message && <p className="text-sm text-stone-600 mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} aria-label="Dismiss notification" className="shrink-0 p-0.5 rounded text-stone-400 hover:text-stone-600 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), [])
  const add = useCallback((type, title, message, duration) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, type, title, message, duration }])
    return id
  }, [])

  const toast = {
    success: (title, msg, dur) => add('success', title, msg, dur),
    error:   (title, msg, dur) => add('error',   title, msg, dur),
    info:    (title, msg, dur) => add('info',     title, msg, dur),
    warning: (title, msg, dur) => add('warning',  title, msg, dur),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 items-end">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
