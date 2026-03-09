import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, AlertCircle, Users, TrendingUp, CalendarClock,
  CheckCircle2, ChevronLeft, ChevronRight, Search,
  X, Download, ExternalLink, Phone, Mail,
  Clock, FileCheck, RefreshCw, UserCheck,
  ChevronRight as Arrow, Loader2,
} from 'lucide-react'
import Button from '../components/ui/Button'
import { StatusBadge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import { submissions, assignees, agencies, usStates } from '../data/mockData'

// ── Helpers ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-ink-600',
  'bg-flame-500',
  'bg-sage-600',
  'bg-amber-500',
  'bg-crimson-600',
  'bg-ink-400',
]

function avatarColor(name) {
  const idx = (name.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}

function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] || '')
    .join('')
    .toUpperCase()
}

const ASSIGNEE_COLORS = {
  uiuxAdmin:  'bg-ink-700',
  jsmith:     'bg-sage-600',
  adavis:     'bg-flame-500',
  mrodriguez: 'bg-amber-500',
}

function assigneeColor(a) {
  return ASSIGNEE_COLORS[a] || 'bg-stone-400'
}

const ACTIVE_STATUSES = ['Offered', 'Bound', 'Issued']
const PAGE_SIZE = 10

// ── SlideOver mock data ───────────────────────────────────────────────────────

const MOCK_HISTORY = [
  { id: 1, icon: FileCheck,    label: 'Account Created',  date: '03/05/2026', color: 'text-sage-500',  bg: 'bg-sage-50'  },
  { id: 2, icon: RefreshCw,    label: 'Quote Issued',     date: '03/06/2026', color: 'text-ink-500',   bg: 'bg-ink-50'   },
  { id: 3, icon: CheckCircle2, label: 'Policy Bound',     date: '03/07/2026', color: 'text-flame-500', bg: 'bg-flame-50' },
  { id: 4, icon: Clock,        label: 'Renewal Started',  date: '03/08/2026', color: 'text-amber-500', bg: 'bg-amber-50' },
]

const MOCK_CONTACTS = [
  { id: 1, name: 'Michael Grant',  title: 'Primary Agent',   phone: '(312) 555-0101', email: 'michael.grant@hawthornerisk.com' },
  { id: 2, name: 'Jennifer Walsh', title: 'Account Manager', phone: '(312) 555-0192', email: 'j.walsh@hawthornerisk.com'       },
]

const MOCK_FEINS = {
  SN129105: '83-4471029',
  SN129106: '47-2093811',
  SN129107: '59-1847362',
  SN129108: '72-3904815',
  SN129109: '61-0928374',
  SN129110: '38-4719203',
}

function getFein(id) {
  return MOCK_FEINS[id] || '00-0000000'
}

const LEGAL_ENTITIES = ['LLC', 'Corp', 'Partnership', 'Sole Proprietor', 'Other']

// ── KPI strip builder ─────────────────────────────────────────────────────────

function buildKpis(subs) {
  return [
    {
      label: 'Total Accounts',
      value: subs.length,
      icon:  Users,
      bg:    'bg-ink-50',
      color: 'text-ink-600',
      sub:   'all lines of business',
      delta: '+2 this week',
      alert: false,
    },
    {
      label: 'Active Policies',
      value: subs.filter(s => ACTIVE_STATUSES.includes(s.status)).length,
      icon:  CheckCircle2,
      bg:    'bg-sage-50',
      color: 'text-sage-600',
      sub:   'offered or bound',
      delta: '+1 this month',
      alert: false,
    },
    {
      label: 'New This Month',
      value: 8,
      icon:  TrendingUp,
      bg:    'bg-flame-50',
      color: 'text-flame-600',
      sub:   'March 2026',
      delta: '+3 vs Feb',
      alert: false,
    },
    {
      label: 'Expiring Soon',
      value: 3,
      icon:  CalendarClock,
      bg:    'bg-amber-50',
      color: 'text-amber-600',
      sub:   'within 30 days',
      delta: 'action needed',
      alert: true,
    },
  ]
}

const ASSIGNEES_ALL = ['All', ...assignees]

// ── Account SlideOver ─────────────────────────────────────────────────────────

function AccountSlideOver({ account, onClose, navigate }) {
  const [tab, setTab] = useState('overview')
  const isOpen = !!account

  // Lock body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Reset tab each time a new account is selected
  useEffect(() => {
    if (account) setTab('overview')
  }, [account])

  const fein = account ? getFein(account.id) : ''

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      {/* Slide panel */}
      <div
        className={[
          'fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col',
          'transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {account && (
          <>
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-stone-100 flex-none">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full ${avatarColor(account.insuredName)} text-white text-sm font-bold flex items-center justify-center shrink-0`}>
                    {initials(account.insuredName)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-stone-900 leading-tight truncate">{account.insuredName}</h2>
                    <p className="text-[11px] font-mono text-stone-400 mt-0.5">{account.submissionNumber}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors shrink-0"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-1 mt-4">
                {['overview', 'history', 'contacts'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={[
                      'px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors',
                      tab === t
                        ? 'bg-ink-700 text-white'
                        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700',
                    ].join(' ')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">

              {/* Overview */}
              {tab === 'overview' && (
                <div>
                  {[
                    { label: 'Account Name', value: account.insuredName,          mono: false },
                    { label: 'FEIN',         value: fein,                         mono: true  },
                    { label: 'Legal Entity', value: account.legalEntity || 'LLC', mono: false },
                    { label: 'State',        value: account.state || 'Illinois',  mono: false },
                    { label: 'Phone',        value: '(312) 555-0101',             mono: true  },
                    { label: 'Email',        value: 'contact@example.com',        mono: false },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-stone-50">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest shrink-0 w-28">{label}</span>
                      <span className={['text-xs text-stone-700 text-right truncate max-w-[160px]', mono ? 'font-mono' : ''].join(' ')}>
                        {value}
                      </span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between py-2.5 border-b border-stone-50">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest shrink-0 w-28">Agency</span>
                    <span className="text-xs text-stone-700 text-right max-w-[160px] truncate">{account.agencyName}</span>
                  </div>

                  <div className="flex items-center justify-between py-2.5 border-b border-stone-50">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest w-28">Status</span>
                    <StatusBadge status={account.status} />
                  </div>

                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest w-28">SN#</span>
                    <button
                      onClick={() => { navigate(`/submissions/${account.id}`); onClose() }}
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold text-ink-700 hover:text-ink-900 hover:underline underline-offset-2 transition-colors"
                    >
                      {account.submissionNumber}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </button>
                  </div>

                  {account.dba && account.dba !== account.insuredName && (
                    <div className="bg-stone-50 rounded-lg px-3 py-2.5 mt-3">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">DBA</p>
                      <p className="text-xs text-stone-600">{account.dba}</p>
                    </div>
                  )}
                </div>
              )}

              {/* History */}
              {tab === 'history' && (
                <div>
                  {MOCK_HISTORY.map((entry, idx) => {
                    const Icon = entry.icon
                    return (
                      <div key={entry.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full ${entry.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className={`h-3.5 w-3.5 ${entry.color}`} />
                          </div>
                          {idx < MOCK_HISTORY.length - 1 && (
                            <div className="w-px flex-1 bg-stone-100 my-1 min-h-[16px]" />
                          )}
                        </div>
                        <div className="pb-5 flex-1 pt-1">
                          <p className="text-xs font-semibold text-stone-700 leading-tight">{entry.label}</p>
                          <p className="text-[10px] font-mono text-stone-400 mt-0.5">{entry.date}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Contacts */}
              {tab === 'contacts' && (
                <div className="space-y-3">
                  {MOCK_CONTACTS.map(c => (
                    <div key={c.id} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full ${avatarColor(c.name)} text-white text-[11px] font-bold flex items-center justify-center shrink-0`}>
                          {initials(c.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-stone-800">{c.name}</p>
                          <p className="text-[10px] text-stone-400 font-medium mt-0.5">{c.title}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-stone-300 shrink-0" />
                          <span className="text-xs font-mono text-stone-600">{c.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-stone-300 shrink-0" />
                          <span className="text-xs text-stone-600 truncate">{c.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-stone-100 flex-none bg-stone-25">
              <button
                onClick={() => { navigate(`/submissions/${account.id}`); onClose() }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-ink-700 hover:bg-ink-800 rounded-lg transition-colors"
              >
                View Full Submission
                <Arrow className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ── New Account Modal ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  accountName: '',
  legalEntity: 'LLC',
  fein: '',
  state: 'Illinois',
  phone: '',
  email: '',
  agency: agencies[0],
  lob: 'GL',
}

function NewAccountModal({ open, onClose, onCreated }) {
  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!form.accountName.trim()) e.accountName = 'Required'
    if (!form.fein.trim()) {
      e.fein = 'Required'
    } else if (!/^\d{2}-\d{7}$/.test(form.fein.trim())) {
      e.fein = 'Format must be XX-XXXXXXX'
    }
    return e
  }

  function handleChange(field) {
    return (ev) => {
      const val = ev.target.value
      setForm(f => ({ ...f, [field]: val }))
      if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const suffix = String(Date.now()).slice(-2)
      const newId  = `SN1291${suffix}`
      onCreated({
        id:               newId,
        submissionNumber: newId,
        insuredName:      form.accountName,
        dba:              form.accountName,
        agencyName:       form.agency,
        agentName:        'New Agent',
        priority:         'MEDIUM',
        transactionType:  'NEW-BUSINESS',
        status:           'In Progress',
        effectiveDate:    '',
        expirationDate:   '',
        assignee:         'uiuxAdmin',
        needByDate:       '',
        createdDate:      '03/09/2026',
        legalEntity:      form.legalEntity,
        state:            form.state,
      })
      setForm(EMPTY_FORM)
      onClose()
    }, 800)
  }

  function handleClose() {
    if (loading) return
    setForm(EMPTY_FORM)
    setErrors({})
    onClose()
  }

  if (!open) return null

  const fieldCls = (f) => [
    'w-full px-3 py-2 text-sm border rounded-lg transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400',
    errors[f]
      ? 'border-crimson-400 bg-crimson-50 focus:ring-crimson-400'
      : 'border-stone-200 bg-white',
  ].join(' ')

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-center justify-between flex-none">
          <div>
            <h2 className="text-base font-bold text-stone-900">New Account</h2>
            <p className="text-xs text-stone-400 mt-0.5">Create a new insured account</p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5" noValidate>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">

            {/* Account Name — full width */}
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                Account Name <span className="text-crimson-500">*</span>
              </label>
              <input
                type="text"
                value={form.accountName}
                onChange={handleChange('accountName')}
                placeholder="Acme Corp"
                className={fieldCls('accountName')}
              />
              {errors.accountName && (
                <p className="text-[10px] text-crimson-500 mt-1 font-medium">{errors.accountName}</p>
              )}
            </div>

            {/* Legal Entity */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                Legal Entity
              </label>
              <select
                value={form.legalEntity}
                onChange={handleChange('legalEntity')}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400"
              >
                {LEGAL_ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* FEIN */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                FEIN <span className="text-crimson-500">*</span>
              </label>
              <input
                type="text"
                value={form.fein}
                onChange={handleChange('fein')}
                placeholder="XX-XXXXXXX"
                className={[fieldCls('fein'), 'font-mono'].join(' ')}
              />
              {errors.fein
                ? <p className="text-[10px] text-crimson-500 mt-1 font-medium">{errors.fein}</p>
                : <p className="text-[10px] text-stone-400 mt-1">Format: XX-XXXXXXX</p>
              }
            </div>

            {/* State */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                State
              </label>
              <select
                value={form.state}
                onChange={handleChange('state')}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400"
              >
                {usStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="(312) 555-0100"
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="contact@example.com"
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400"
              />
            </div>

            {/* Agency */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                Agency
              </label>
              <select
                value={form.agency}
                onChange={handleChange('agency')}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400"
              >
                {agencies.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            {/* LOB */}
            <div>
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">
                Line of Business
              </label>
              <select
                value={form.lob}
                onChange={handleChange('lob')}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400"
              >
                <option value="GL">GL — General Liability</option>
                <option value="CA">CA — Commercial Auto</option>
                <option value="CP">CP — Property</option>
              </select>
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-end gap-3 flex-none bg-stone-25">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-flame-500 hover:bg-flame-600 rounded-lg disabled:opacity-60 transition-colors"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const navigate = useNavigate()
  const toast    = useToast()

  // Prepend newly created rows on top of base data
  const [extraRows, setExtraRows] = useState([])
  const allRows = useMemo(() => [...extraRows, ...submissions], [extraRows])
  const kpis    = useMemo(() => buildKpis(allRows), [allRows])

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search,          setSearch]          = useState('')
  const [statusFilter,    setStatusFilter]    = useState('All')
  const [lobFilter,       setLobFilter]       = useState('All')
  const [assigneeFilter,  setAssigneeFilter]  = useState('All')
  const [showExpiring,    setShowExpiring]    = useState(false)

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1)

  // ── SlideOver ─────────────────────────────────────────────────────────────
  const [slideAccount, setSlideAccount] = useState(null)

  // ── New Account Modal ─────────────────────────────────────────────────────
  const [showNewModal, setShowNewModal] = useState(false)

  // ── Expiry banner ─────────────────────────────────────────────────────────
  const [dismissedExpiryBanner, setDismissedExpiryBanner] = useState(false)

  // ── Export ────────────────────────────────────────────────────────────────
  const [exportLoading, setExportLoading] = useState(false)

  // ── Inline assignee edit ──────────────────────────────────────────────────
  const [assigneeOverrides,  setAssigneeOverrides]  = useState(new Map())
  const [editingAssigneeId,  setEditingAssigneeId]  = useState(null)
  const assigneeSelectRef = useRef(null)

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...allRows]

    // Banner shortcut overrides all filters
    if (showExpiring) {
      return data.filter(s => s.status === 'Offered')
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      data = data.filter(s =>
        s.insuredName.toLowerCase().includes(q) ||
        s.submissionNumber.toLowerCase().includes(q) ||
        s.agencyName.toLowerCase().includes(q) ||
        s.agentName.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'All') {
      if (statusFilter === 'Active')   data = data.filter(s => ACTIVE_STATUSES.includes(s.status))
      if (statusFilter === 'Expiring') data = data.filter(s => s.status === 'Offered')
      if (statusFilter === 'Inactive') data = data.filter(s => ['Cancelled', 'Registered'].includes(s.status))
    }

    if (lobFilter !== 'All') {
      data = data.filter(() => lobFilter === 'GL')
    }

    if (assigneeFilter !== 'All') {
      data = data.filter(s => {
        const eff = assigneeOverrides.get(s.id) || s.assignee
        return eff === assigneeFilter
      })
    }

    return data
  }, [allRows, search, statusFilter, lobFilter, assigneeFilter, assigneeOverrides, showExpiring])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilterChange(setter) {
    return (e) => { setter(e.target.value); setPage(1) }
  }

  // ── Inline assignee handlers ──────────────────────────────────────────────
  function startEditAssignee(e, rowId) {
    e.stopPropagation()
    setEditingAssigneeId(rowId)
    setTimeout(() => assigneeSelectRef.current && assigneeSelectRef.current.focus(), 30)
  }

  function commitAssignee(rowId, value) {
    setAssigneeOverrides(prev => new Map(prev).set(rowId, value))
    setEditingAssigneeId(null)
    toast.success('Assignee updated', `Reassigned to ${value}`)
  }

  // ── Account created handler ───────────────────────────────────────────────
  function handleAccountCreated(newRow) {
    setExtraRows(prev => [newRow, ...prev])
    toast.success('Account created', `${newRow.insuredName} has been added.`)
  }

  // ── Export CSV ────────────────────────────────────────────────────────────
  function handleExport() {
    if (exportLoading) return
    setExportLoading(true)
    setTimeout(() => {
      const headers = ['SN#', 'Account Name', 'Agency', 'Agent', 'Status', 'Eff Date', 'Assignee']
      const rows = filtered.map(r => [
        r.submissionNumber,
        `"${r.insuredName}"`,
        `"${r.agencyName}"`,
        `"${r.agentName}"`,
        r.status,
        r.effectiveDate || '',
        assigneeOverrides.get(r.id) || r.assignee,
      ])
      const csv  = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = 'accounts_export.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setExportLoading(false)
      toast.success('Accounts exported to CSV', `${filtered.length} accounts downloaded.`)
    }, 800)
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1400px] mx-auto">

      {/* ── Expiry Alert Banner ────────────────────────────────────────────── */}
      {!dismissedExpiryBanner && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="flex-1 text-sm text-amber-800">
            <span className="font-semibold">3 accounts</span> have policies expiring within 30 days.{' '}
            Review renewals before they lapse.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { setShowExpiring(true); setPage(1) }}
              className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-md transition-colors"
            >
              View Expiring
            </button>
            <button
              onClick={() => setDismissedExpiryBanner(true)}
              className="p-0.5 rounded text-amber-400 hover:text-amber-600 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Expiring filter active chip */}
      {showExpiring && (
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold rounded-full">
            <CalendarClock className="h-3.5 w-3.5" />
            Showing expiring accounts only
            <button
              onClick={() => { setShowExpiring(false); setPage(1) }}
              className="ml-1 text-amber-600 hover:text-amber-800"
              aria-label="Clear filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Accounts</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            Manage insured accounts across all lines of business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-60 transition-colors shadow-sm"
          >
            {exportLoading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Download className="h-4 w-4" />
            }
            {exportLoading ? 'Exporting…' : 'Export'}
          </button>
          <Button
            variant="cta"
            size="sm"
            icon={Plus}
            onClick={() => setShowNewModal(true)}
          >
            New Account
          </Button>
        </div>
      </div>

      {/* ── KPI Strip ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {kpis.map(k => (
          <div
            key={k.label}
            className="bg-white rounded-xl border border-stone-200 shadow-card px-5 py-4 hover:shadow-elevated transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${k.bg} p-2 rounded-lg`}>
                <k.icon className={`h-4 w-4 ${k.color}`} />
              </div>
              {k.alert && <AlertCircle className="h-4 w-4 text-amber-500" />}
            </div>
            <p className="text-2xl font-black text-stone-900 tracking-tight font-mono">{k.value}</p>
            <p className="text-xs font-semibold text-stone-600 mt-0.5">{k.label}</p>
            <p className="text-[10px] text-stone-300 mt-1 uppercase tracking-widest">{k.sub}</p>
            <p className={`text-[10px] font-bold mt-1 ${k.alert ? 'text-amber-500' : 'text-sage-500'}`}>{k.delta}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card px-4 py-3 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search accounts, agencies…"
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 placeholder:text-stone-400 bg-stone-25"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</span>
            <select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              className="text-xs border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400"
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Expiring">Expiring</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">LOB</span>
            <select
              value={lobFilter}
              onChange={handleFilterChange(setLobFilter)}
              className="text-xs border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400"
            >
              <option value="All">All</option>
              <option value="GL">GL</option>
              <option value="CA">CA</option>
              <option value="CP">CP</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Assignee</span>
            <select
              value={assigneeFilter}
              onChange={handleFilterChange(setAssigneeFilter)}
              className="text-xs border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400"
            >
              {ASSIGNEES_ALL.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <span className="ml-auto text-xs font-semibold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full shrink-0">
            {filtered.length} accounts
          </span>
        </div>
      </div>

      {/* ── Accounts Table ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100 bg-stone-25">
          <h2 className="text-sm font-bold text-stone-800">All Accounts</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-100 text-sm">
            <thead className="bg-stone-25">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest w-8" />
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Account</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Agency · Agent</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">LOB</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Eff Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Assignee</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-stone-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-stone-200" />
                      <p className="text-sm text-stone-400 font-medium">No accounts match your filters</p>
                      <p className="text-xs text-stone-300">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((row, i) => {
                const effAssignee       = assigneeOverrides.get(row.id) || row.assignee
                const isEditingAssignee = editingAssigneeId === row.id
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSlideAccount(row)}
                    className={[
                      'cursor-pointer transition-colors duration-100 hover:bg-ink-25 group',
                      i % 2 === 1 ? 'bg-stone-25/40' : '',
                    ].join(' ')}
                  >
                    {/* Avatar */}
                    <td className="pl-4 pr-2 py-3 whitespace-nowrap">
                      <div className={`w-8 h-8 rounded-full ${avatarColor(row.insuredName)} text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-sm`}>
                        {initials(row.insuredName)}
                      </div>
                    </td>

                    {/* Account */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-bold text-stone-800 group-hover:text-ink-700 transition-colors">
                        {row.insuredName}
                      </p>
                      {row.dba && row.dba !== row.insuredName && (
                        <p className="text-[10px] text-stone-400 mt-0.5">DBA: {row.dba}</p>
                      )}
                      <p className="text-[10px] font-mono text-stone-300 mt-0.5">{row.submissionNumber}</p>
                    </td>

                    {/* Agency · Agent */}
                    <td className="px-4 py-3 whitespace-nowrap max-w-[180px]">
                      <p className="text-xs text-stone-600 truncate">{row.agencyName}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5 truncate">{row.agentName}</p>
                    </td>

                    {/* LOB badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-ink-50 text-ink-700 border border-ink-100">
                        GL
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Effective Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono text-stone-500">{row.effectiveDate || '—'}</span>
                    </td>

                    {/* Assignee — inline edit */}
                    <td
                      className="px-4 py-3 whitespace-nowrap"
                      onClick={e => e.stopPropagation()}
                    >
                      {isEditingAssignee ? (
                        <select
                          ref={assigneeSelectRef}
                          defaultValue={effAssignee}
                          onBlur={e => commitAssignee(row.id, e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter')  commitAssignee(row.id, e.target.value)
                            if (e.key === 'Escape') setEditingAssigneeId(null)
                          }}
                          onClick={e => e.stopPropagation()}
                          className="text-xs border border-ink-400 rounded-md px-1.5 py-1 bg-white focus:outline-none ring-2 ring-ink-200"
                        >
                          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      ) : (
                        <button
                          onClick={e => startEditAssignee(e, row.id)}
                          title="Click to change assignee"
                          className="flex items-center gap-1.5 group/assignee"
                        >
                          <div className={`w-6 h-6 rounded-full ${assigneeColor(effAssignee)} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}>
                            {(effAssignee[0] || '?').toUpperCase()}
                          </div>
                          <span className="text-xs text-stone-500 group-hover/assignee:text-ink-700 transition-colors">{effAssignee}</span>
                          <UserCheck className="h-3 w-3 text-stone-300 group-hover/assignee:text-ink-400 transition-colors" />
                        </button>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/submissions/${row.id}`)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-ink-700 bg-ink-50 border border-ink-100 rounded-md hover:bg-ink-100 hover:border-ink-200 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────────────────────────────────────── */}
        <div className="px-5 py-3.5 border-t border-stone-100 flex items-center justify-between bg-stone-25">
          <p className="text-xs text-stone-400">
            Showing{' '}
            <span className="font-semibold text-stone-600">
              {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
            </span>
            {' '}of{' '}
            <span className="font-semibold text-stone-600">{filtered.length}</span>
            {' '}accounts
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-stone-200 rounded-lg bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={[
                    'w-7 h-7 text-xs font-medium rounded-md transition-colors',
                    p === page
                      ? 'bg-ink-700 text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-stone-200 rounded-lg bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Account SlideOver ─────────────────────────────────────────────────── */}
      <AccountSlideOver
        account={slideAccount}
        onClose={() => setSlideAccount(null)}
        navigate={navigate}
      />

      {/* ── New Account Modal ─────────────────────────────────────────────────── */}
      <NewAccountModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={handleAccountCreated}
      />
    </div>
  )
}
