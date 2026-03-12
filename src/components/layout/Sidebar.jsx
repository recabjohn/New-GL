import { useState, useEffect, useRef, useMemo } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Search, Users, BookOpen,
  ChevronLeft, ChevronRight, Shield, Settings, HelpCircle,
  ShieldCheck, BarChart2, Activity, ChevronDown, ChevronUp,
  X, LogOut, User, Eye,
} from 'lucide-react'
import { submissions } from '../../data/mockData'
import { useToast } from '../ui/Toast'
import { useAuth } from '../../context/AuthContext'

// ---------------------------------------------------------------------------
// Nav config — badgeKey wires to runtime-computed counts
// ---------------------------------------------------------------------------
const NAV_GROUPS = [
  {
    group: 'UNDERWRITING',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',   to: '/' },
      { icon: FileText,        label: 'Submissions', to: '/submissions' },
      { icon: ShieldCheck,     label: 'Clearance',   to: '/clearance', badgeKey: 'clearance' },
    ],
  },
  {
    group: 'POLICY',
    items: [
      { icon: Search,   label: 'Find Policy', to: '/find' },
      { icon: Users,    label: 'Accounts',    to: '/accounts' },
      { icon: BookOpen, label: 'Documents',   to: '/documents', badgeKey: 'documents' },
    ],
  },
  {
    group: 'REPORTS',
    items: [
      { icon: BarChart2, label: 'Analytics',    to: '/analytics' },
      { icon: Activity,  label: 'Activity Log', to: '/activity' },
    ],
  },
]

const BOTTOM_ITEMS = [
  { icon: Settings,   label: 'Settings', to: '/settings' },
  { icon: HelpCircle, label: 'Help',     to: '/help' },
]


// ---------------------------------------------------------------------------
// UserDropdown
// ---------------------------------------------------------------------------
function UserDropdown({ onClose }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { logout } = useAuth()
  const ref = useRef(null)
  const [showViewPicker, setShowViewPicker] = useState(false)

  const VIEWS = ['UW View', 'Manager View', 'Agent View']

  // Outside-click handler
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleProfile = () => {
    navigate('/settings')
    onClose()
  }

  const handleSwitchView = (view) => {
    toast.info('View switched', `Switched to ${view}`)
    setShowViewPicker(false)
    onClose()
  }

  const handleSignOut = () => {
    logout()
    navigate('/login', { replace: true })
    onClose()
  }

  return (
    <div
      ref={ref}
      className="absolute bottom-16 left-4 right-4 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50"
    >
      {/* My Profile */}
      <button
        onClick={handleProfile}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors text-left"
      >
        <User className="h-3.5 w-3.5 text-stone-400 shrink-0" />
        My Profile
      </button>

      {/* Switch View */}
      <button
        onClick={() => setShowViewPicker((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors text-left"
      >
        <Eye className="h-3.5 w-3.5 text-stone-400 shrink-0" />
        <span className="flex-1">Switch View</span>
        <ChevronDown
          className={[
            'h-3 w-3 text-stone-400 transition-transform duration-150',
            showViewPicker ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {showViewPicker && (
        <div className="mx-3 mb-1 mt-0.5 flex flex-col gap-0.5">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => handleSwitchView(v)}
              className="w-full text-left px-3 py-1.5 text-xs text-stone-600 bg-stone-50 hover:bg-ink-50 hover:text-ink-700 rounded-lg transition-colors font-medium"
            >
              {v}
            </button>
          ))}
        </div>
      )}

      <div className="h-px bg-stone-100 mx-2 my-1" />

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-crimson-600 hover:bg-crimson-50 transition-colors text-left"
      >
        <LogOut className="h-3.5 w-3.5 shrink-0" />
        Sign Out
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sidebar (main export)
// ---------------------------------------------------------------------------
export default function Sidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Parse active submission ID from pathname e.g. /submissions/SN129105 or /submissions/SN129105/browse
  const activeSubmissionId = useMemo(() => {
    const match = location.pathname.match(/^\/submissions\/([^/]+)/)
    return match ? match[1] : null
  }, [location.pathname])

  // Live clearance badge: count of submissions in Clearance or In Progress
  const clearanceBadgeCount = useMemo(
    () => submissions.filter((s) => s.status === 'Clearance' || s.status === 'In Progress').length,
    []
  )

  const badgeCounts = {
    clearance: clearanceBadgeCount,
    documents: 2, // hardcoded pending-generation count per spec
  }

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  // Auto-close user menu when sidebar collapses (no room for dropdown)
  useEffect(() => {
    if (collapsed) setShowUserMenu(false)
  }, [collapsed])

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-sm md:hidden animate-fade-in" onClick={onMobileClose} />
      )}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-ink-950 transition-all duration-300 ease-in-out shrink-0 print-hide',
          'md:relative md:translate-x-0',
          collapsed ? 'w-[60px]' : 'w-[224px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
      {/* ------------------------------------------------------------------ */}
      {/* Logo + "+" quick-add (expanded only)                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-ink-900">
        <div className="w-8 h-8 rounded-lg bg-flame-500 flex items-center justify-center shrink-0 shadow-sm">
          <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white tracking-tight leading-none">Solaris</p>
              <p className="text-[10px] text-ink-500 font-semibold mt-0.5 uppercase tracking-widest">
                Admin Panel
              </p>
            </div>
          </>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Grouped navigation                                                  */}
      {/* ------------------------------------------------------------------ */}
      <nav className="flex-1 px-2 py-3 overflow-hidden overflow-y-auto">
        {NAV_GROUPS.map(({ group, items }) => (
          <div key={group} className="mb-4">
            {!collapsed && (
              <p className="text-[9px] font-bold text-ink-600 uppercase tracking-widest px-2 mb-1.5">
                {group}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map(({ icon: Icon, label, to, badgeKey }) => {
                const active = isActive(to)
                const count = badgeKey ? (badgeCounts[badgeKey] || 0) : 0
                const showBadge = count > 0

                return (
                  <div key={to}>
                    <NavLink
                      to={to}
                      title={collapsed ? label : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                        active
                          ? 'bg-ink-800 text-white border-l-2 border-ink-400 pl-[6px]'
                          : 'text-ink-400 hover:bg-ink-900 hover:text-ink-100',
                      ].join(' ')}
                    >
                      {/* Icon: dot badge when collapsed, pill badge when expanded */}
                      <span className="relative shrink-0">
                        <Icon className="h-4 w-4" />
                        {collapsed && showBadge && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-crimson-500 ring-1 ring-ink-950" />
                        )}
                      </span>

                      {!collapsed && (
                        <>
                          <span className="truncate text-[13px] flex-1">{label}</span>
                          {showBadge ? (
                            <span className="bg-crimson-500 text-white text-xs font-mono px-1.5 py-0.5 rounded-full ml-auto shrink-0 leading-none">
                              {count}
                            </span>
                          ) : (
                            active && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-ink-400 shrink-0" />
                            )
                          )}
                        </>
                      )}
                    </NavLink>

                    {/* Pinned active submission chip — under Submissions when on /submissions/:id */}
                    {!collapsed && label === 'Submissions' && activeSubmissionId && (
                      <div className="mx-2 mt-0.5 flex items-center gap-1.5 bg-ink-50 text-ink-700 text-xs font-mono px-2 py-1 rounded-md border border-ink-200">
                        <span className="flex-1 truncate">{activeSubmissionId}</span>
                        <button
                          onClick={() => navigate('/submissions')}
                          className="shrink-0 text-ink-400 hover:text-ink-700 transition-colors"
                          title="Back to submissions"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom nav + user card                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-2 pb-2 border-t border-ink-900 pt-2 space-y-0.5">
        {BOTTOM_ITEMS.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium text-ink-500 hover:bg-ink-900 hover:text-ink-200 transition-colors duration-150"
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate text-[13px]">{label}</span>}
          </NavLink>
        ))}

        {/* User card removed — redundant with TopBar user menu */}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Collapse toggle                                                     */}
      {/* ------------------------------------------------------------------ */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center text-ink-400 hover:bg-ink-700 hover:text-white transition-colors duration-150 shadow-md z-10"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      </aside>
    </>
  )
}
