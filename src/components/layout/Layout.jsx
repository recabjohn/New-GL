import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { ToastProvider } from '../ui/Toast'
import SessionTimeoutModal from '../ui/SessionTimeoutModal'

const SHORTCUTS = [
  { keys: ['N'],        label: 'New submission (go to dashboard)' },
  { keys: ['?'],        label: 'Show keyboard shortcuts' },
  { keys: ['Esc'],      label: 'Close modal / slide-over' },
  { keys: ['\u2191', '\u2193'], label: 'Navigate table rows' },
  { keys: ['Enter'],    label: 'Open focused row' },
  { keys: ['\u2318', 'K'], label: 'Command palette' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Close mobile nav on route change
  useEffect(() => { setMobileNavOpen(false) }, [pathname])

  // Scroll to top on route change
  useEffect(() => {
    document.getElementById('main-scroll-area')?.scrollTo({ top: 0 })
  }, [pathname])

  useEffect(() => {
    function handleKey(e) {
      const tag = (e.target.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return

      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowShortcuts(s => !s)
      }
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        navigate('/')
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [navigate])

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-stone-50">
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar onMenuToggle={() => setMobileNavOpen(v => !v)} />
          <main id="main-scroll-area" className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Session timeout warning modal — renders globally over everything */}
      <SessionTimeoutModal />

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-stone-800">Keyboard Shortcuts</h2>
              <button onClick={() => setShowShortcuts(false)} className="text-stone-400 hover:text-stone-600 text-xs">Esc</button>
            </div>
            <ul className="space-y-2.5">
              {SHORTCUTS.map((s, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-xs text-stone-600">{s.label}</span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k, j) => (
                      <span key={j}>
                        <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 rounded-md shadow-sm">
                          {k}
                        </kbd>
                        {j < s.keys.length - 1 && <span className="text-[10px] text-stone-300 mx-0.5">+</span>}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </ToastProvider>
  )
}
