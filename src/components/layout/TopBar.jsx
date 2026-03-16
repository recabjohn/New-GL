import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Search, ChevronRight, X, User, HelpCircle, LogOut, Moon, Check } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { submissions } from '../../data/mockData'
import { useToast } from '../ui/Toast'
import { useAuth } from '../../context/AuthContext'

// ---------------------------------------------------------------------------
// Breadcrumb config
// ---------------------------------------------------------------------------
const BREADCRUMBS = {
  '/':            ['Dashboard'],
  '/submissions': ['Dashboard', 'Submissions'],
  '/clearance':   ['Dashboard', 'Clearance'],
  '/find':        ['Dashboard', 'Find Policy'],
  '/accounts':    ['Dashboard', 'Accounts'],
  '/documents':   ['Dashboard', 'Documents'],
  '/analytics':   ['Dashboard', 'Analytics'],
  '/activity':    ['Dashboard', 'Activity Log'],
  '/settings':    ['Dashboard', 'Settings'],
  '/help':        ['Dashboard', 'Help'],
}

function crumbsForPath(pathname) {
  if (BREADCRUMBS[pathname]) return BREADCRUMBS[pathname]
  if (pathname.includes('/product-browse')) return ['Dashboard', 'Submissions', 'Product Browse']
  if (pathname.startsWith('/submissions/'))  return ['Dashboard', 'Submissions', 'Detail']
  if (pathname.startsWith('/quotes/'))       return ['Dashboard', 'Quotes', 'Summary']
  return ['Dashboard']
}

// ---------------------------------------------------------------------------
// Static notifications data
// ---------------------------------------------------------------------------
const INITIAL_NOTIFICATIONS = [
  { id: 1, level: 'high',   text: 'Quote expiring in 3 days',              sn: 'SN129105', time: '5m ago',  read: false },
  { id: 2, level: 'high',   text: 'Clearance overdue — action needed',     sn: 'SN129111', time: '22m ago', read: false },
  { id: 3, level: 'medium', text: 'Quote Proposal ready for download',     sn: 'SN129113', time: '1h ago',  read: false },
  { id: 4, level: 'medium', text: 'SN129108 assigned to you',              sn: 'SN129108', time: '2h ago',  read: false },
  { id: 5, level: 'medium', text: 'Renewal approaching — 28 days',         sn: 'SN129106', time: '3h ago',  read: true  },
  { id: 6, level: 'low',    text: 'SN129110 status updated to Offered',    sn: 'SN129110', time: '4h ago',  read: true  },
  { id: 7, level: 'low',    text: 'SN129112 status updated to Bound',      sn: 'SN129112', time: '5h ago',  read: true  },
  { id: 8, level: 'low',    text: 'SN129115 status updated to Issued',     sn: 'SN129115', time: '1d ago',  read: true  },
]

const LEVEL_DOT = {
  high:   'bg-crimson-500',
  medium: 'bg-amber-400',
  low:    'bg-stone-300',
}

const RECENT_SEARCHES = ['SN129105', 'SN129108', 'GL-001', 'Hawthorne', 'Artisan', 'SN129113']

// ---------------------------------------------------------------------------
// NotificationsPanel
// ---------------------------------------------------------------------------
const NOTIF_FILTERS = [
  { key: 'all',    label: 'All' },
  { key: 'urgent', label: 'Urgent' },
  { key: 'info',   label: 'Info' },
]

function NotificationsPanel({ notifications, onMarkAllRead, onMarkRead, onClose, onNavigate }) {
  const ref = useRef(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const filtered = notifications.filter((n) => {
    if (filter === 'urgent') return n.level === 'high' || n.level === 'medium'
    if (filter === 'info')   return n.level === 'low'
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-elevated border border-stone-200 z-50 flex flex-col overflow-hidden"
      style={{ maxHeight: '28rem' }}
    >
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-stone-100 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700">Notifications</span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-crimson-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onMarkAllRead}
            className="text-[10px] font-semibold text-ink-500 hover:text-ink-700 transition-colors"
          >
            Mark all read
          </button>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1">
          {NOTIF_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={[
                'px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors',
                filter === f.key
                  ? 'bg-ink-100 text-ink-700'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto flex-1">
        {filtered.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-xs text-stone-400">No notifications</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={[
                'flex items-start gap-3 px-4 py-3 border-b border-stone-50 group',
                !n.read ? 'bg-ink-50' : 'bg-white',
              ].join(' ')}
            >
              {/* Level dot */}
              <span className={['mt-1.5 w-2 h-2 rounded-full shrink-0', LEVEL_DOT[n.level]].join(' ')} />

              <button
                onClick={() => { onNavigate(n.sn); onClose() }}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-xs text-stone-700 leading-snug">{n.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[10px] text-ink-500 bg-ink-50 px-1.5 py-0.5 rounded border border-ink-100">
                    {n.sn}
                  </span>
                  <span className="text-[10px] text-stone-400">{n.time}</span>
                </div>
              </button>

              {/* Individual mark-as-read */}
              {!n.read && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMarkRead(n.id) }}
                  className="mt-0.5 p-1 rounded text-stone-300 hover:text-ink-600 hover:bg-ink-50 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Mark as read"
                  title="Mark as read"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SearchPalette
// ---------------------------------------------------------------------------
function SearchPalette({ onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef(null)

  // Focus input on mount
  useEffect(() => {
    const t = setTimeout(() => { if (inputRef.current) inputRef.current.focus() }, 30)
    return () => clearTimeout(t)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Filter submissions by SN# or insured name
  const results = query.trim().length > 0
    ? submissions.filter((s) => {
        const q = query.toLowerCase()
        return (
          s.submissionNumber.toLowerCase().includes(q) ||
          s.insuredName.toLowerCase().includes(q)
        )
      }).slice(0, 8)
    : []

  // Reset highlight when results change
  useEffect(() => { setHighlighted(0) }, [query])

  const goToSubmission = useCallback((id) => {
    navigate(`/submissions/${id}`)
    onClose()
  }, [navigate, onClose])

  const handleKeyDown = (e) => {
    if (results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[highlighted]) goToSubmission(results[highlighted].id)
    }
  }

  const STATUS_COLORS = {
    'In Progress': 'bg-amber-100 text-amber-700',
    'Clearance':   'bg-ink-100 text-ink-700',
    'Offered':     'bg-sage-100 text-sage-700',
    'Registered':  'bg-stone-100 text-stone-600',
    'Bound':       'bg-ink-100 text-ink-700',
    'Issued':      'bg-sage-100 text-sage-700',
    'Declined':    'bg-crimson-100 text-crimson-700',
    'Expired':     'bg-stone-100 text-stone-500',
  }

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/50 backdrop-blur-sm flex items-start justify-center pt-[20vh] animate-fade-in" onClick={onClose}>
        <div className="w-full max-w-xl mx-4 bg-white rounded-xl shadow-modal overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Search input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
          <Search className="h-4 w-4 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search submissions, policies, accounts..."
            className="flex-1 text-sm text-stone-800 placeholder-stone-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="text-stone-400 hover:text-stone-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-100 border border-stone-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim().length === 0 ? (
            /* Recent searches */
            <div className="px-4 py-3">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                Recent Searches
              </p>
              <div className="flex flex-wrap gap-1.5">
                {RECENT_SEARCHES.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setQuery(chip)}
                    className="px-2.5 py-1 text-xs font-mono text-stone-600 bg-stone-100 hover:bg-ink-100 hover:text-ink-700 rounded-lg border border-stone-200 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            /* No results */
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-stone-400">No results for <span className="font-semibold text-stone-600">&ldquo;{query}&rdquo;</span></p>
            </div>
          ) : (
            /* Result rows */
            results.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goToSubmission(s.id)}
                className={[
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-stone-50',
                  i === highlighted ? 'bg-ink-50' : 'hover:bg-stone-50',
                ].join(' ')}
              >
                <span className="font-mono text-xs text-ink-600 shrink-0 w-20">{s.submissionNumber}</span>
                <span className="flex-1 text-sm text-stone-700 truncate">{s.insuredName}</span>
                <span className={[
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0',
                  STATUS_COLORS[s.status] || 'bg-stone-100 text-stone-500',
                ].join(' ')}>
                  {s.status}
                </span>
                <span className="text-[10px] text-stone-400 shrink-0 hidden sm:block truncate max-w-[90px]">
                  {s.agencyName.split(' ')[0]}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 border-t border-stone-100 bg-stone-50">
            <span className="text-[10px] text-stone-400">
              <kbd className="font-mono bg-white border border-stone-200 rounded px-1">↑↓</kbd>{' '}navigate
            </span>
            <span className="text-[10px] text-stone-400">
              <kbd className="font-mono bg-white border border-stone-200 rounded px-1">↵</kbd>{' '}open
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// UserProfileDropdown
// ---------------------------------------------------------------------------
function UserProfileDropdown({ onClose }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { logout } = useAuth()
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const go = (path) => { navigate(path); onClose() }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-elevated border border-stone-200 py-1 z-50"
    >
      {/* User identity */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-ink-800 flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-ink-200 shrink-0">
          UA
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-stone-800 truncate">uiuxAdmin</p>
          <p className="text-[10px] text-stone-400 truncate">UW Admin</p>
        </div>
      </div>

      <div className="h-px bg-stone-100 mx-2 mb-1" />

      <button
        onClick={() => go('/settings')}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors text-left"
      >
        <User className="h-3.5 w-3.5 text-stone-400 shrink-0" />
        Profile &amp; Settings
      </button>

      <button
        onClick={() => { toast.info('Theme', 'Dark mode coming soon'); onClose() }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors text-left"
      >
        <Moon className="h-3.5 w-3.5 text-stone-400 shrink-0" />
        Theme
      </button>

      <button
        onClick={() => go('/help')}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors text-left"
      >
        <HelpCircle className="h-3.5 w-3.5 text-stone-400 shrink-0" />
        Help Center
      </button>

      <div className="h-px bg-stone-100 mx-2 my-1" />

      <button
        onClick={() => { logout(); navigate('/login', { replace: true }); onClose() }}
        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-crimson-600 hover:bg-crimson-50 transition-colors text-left"
      >
        <LogOut className="h-3.5 w-3.5 shrink-0" />
        Sign Out
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TopBar (main export)
// ---------------------------------------------------------------------------
export default function TopBar({ onMenuToggle }) {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const crumbs = crumbsForPath(location.pathname)

  // Notifications state
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)

  // Search palette state
  const [searchOpen, setSearchOpen] = useState(false)

  // User profile dropdown state
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  // Unread badge: show when any high or medium notification is unread
  const unreadCount = notifications.filter((n) => !n.read).length
  const hasUnreadImportant = unreadCount > 0

  const handleMarkAllRead = () => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))
  }

  const handleMarkRead = (id) => {
    setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const handleNotifNavigate = (sn) => {
    const sub = submissions.find((s) => s.submissionNumber === sn)
    if (sub) navigate(`/submissions/${sub.id}`)
    else toast.info('Navigation', `Navigating to ${sn}`)
  }

  // Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header className="h-12 bg-white border-b border-stone-200 flex items-center px-5 shrink-0 gap-4 print-hide">
        {/* Mobile menu button */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors -ml-1"
            aria-label="Toggle navigation menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-xs shrink-0">
          {crumbs.map((c, i) => (
            <span key={c} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 text-stone-300" />}
              <span className={i === crumbs.length - 1 ? 'text-stone-700 font-semibold' : 'text-stone-400'}>
                {c}
              </span>
            </span>
          ))}
        </div>

        <div className="h-4 w-px bg-stone-200 shrink-0" />

        {/* Right section */}
        <div className="ml-auto flex items-center gap-1">
          {/* Notifications bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setShowNotifications((v) => !v); setShowUserMenu(false) }}
              aria-label="Notifications"
              className="relative p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Bell className="h-4 w-4" />
              {hasUnreadImportant && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold text-white bg-crimson-500 rounded-full ring-1 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationsPanel
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
                onMarkRead={handleMarkRead}
                onClose={() => setShowNotifications(false)}
                onNavigate={handleNotifNavigate}
              />
            )}
          </div>

          <div className="h-5 w-px bg-stone-200 mx-1" />

          {/* User profile chip */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => { setShowUserMenu((v) => !v); setShowNotifications(false) }}
              className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-ink-800 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-ink-200">
                UA
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-stone-800 leading-none">John</p>
                <p className="text-[9px] text-stone-400 mt-0.5">Underwriter</p>
              </div>
            </button>

            {showUserMenu && (
              <UserProfileDropdown onClose={() => setShowUserMenu(false)} />
            )}
          </div>
        </div>
      </header>

      {/* Command palette — rendered as fixed overlay outside header */}
      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
    </>
  )
}
