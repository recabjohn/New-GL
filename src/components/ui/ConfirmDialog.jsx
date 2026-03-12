import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from './Button'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel }) {
  const dialogRef = useRef(null)

  // Focus the first button when opened
  useEffect(() => {
    if (open && dialogRef.current) {
      const btn = dialogRef.current.querySelector('button')
      btn?.focus()
    }
  }, [open])

  // Trap focus inside dialog
  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return

    const focusable = dialog.querySelectorAll('button, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    const trap = (e) => {
      if (e.key === 'Escape') { onCancel(); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [open, onCancel])

  if (!open) return null

  const iconColor = variant === 'danger' ? 'text-crimson-500 bg-crimson-50' : 'text-amber-500 bg-amber-50'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-msg"
        className="relative bg-white rounded-xl shadow-modal w-full max-w-sm p-6 animate-scale-in"
      >
        <div className={`w-10 h-10 rounded-full ${iconColor} flex items-center justify-center mb-4 mx-auto`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 id="confirm-title" className="text-sm font-semibold text-stone-900 text-center">{title}</h3>
        <p id="confirm-msg" className="text-xs text-stone-500 text-center mt-1">{message}</p>
        <div className="flex items-center gap-2 mt-5">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} size="sm" className="flex-1" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
