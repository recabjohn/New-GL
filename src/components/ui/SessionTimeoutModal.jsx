// ---------------------------------------------------------------------------
// SessionTimeoutModal — warns user before auto-logout due to inactivity
// ---------------------------------------------------------------------------
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Clock, LogOut, RefreshCw } from 'lucide-react'
import Button from './Button'

export default function SessionTimeoutModal() {
  const { showTimeoutWarning, extendSession, logout } = useAuth()
  const [countdown, setCountdown] = useState(120) // 2 minutes in seconds

  // Countdown timer
  useEffect(() => {
    if (!showTimeoutWarning) {
      setCountdown(120)
      return
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [showTimeoutWarning])

  if (!showTimeoutWarning) return null

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm z-[9999]" />

      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-modal w-full max-w-md overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Session Expiring Soon</h3>
              <p className="text-xs text-amber-700 mt-0.5">Your session will expire due to inactivity</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border-4 border-amber-200 mb-4">
              <span className="font-mono text-2xl font-bold text-amber-700">
                {mins}:{secs.toString().padStart(2, '0')}
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed max-w-xs mx-auto">
              You will be automatically signed out in{' '}
              <span className="font-semibold text-amber-700">{mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}</span>.
              Click below to stay signed in.
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <Button variant="secondary" size="md" icon={LogOut} onClick={logout} className="flex-1">
              Sign Out Now
            </Button>
            <Button variant="cta" size="md" icon={RefreshCw} onClick={extendSession} className="flex-1">
              Stay Signed In
            </Button>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </>
  )
}
