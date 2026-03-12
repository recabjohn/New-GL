import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download, FilePlus, ShieldCheck, TrendingUp, CheckCircle2,
  FileEdit, FileText, RefreshCw, MessageSquare, ChevronDown,
  ChevronUp, Activity, Clock, Calendar, Plus, X,
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import { useSimulatedLoading } from '../hooks/useFormGuard'
import { SkeletonTable } from '../components/ui/Skeleton'

// ── Icon + color map per event type ──────────────────────────────────────────
const TYPE_META = {
  submission_created: { Icon: FilePlus,      dot: 'bg-ink-500',     label: 'Submission Created'   },
  clearance_check:    { Icon: ShieldCheck,   dot: 'bg-amber-400',   label: 'Clearance Check'      },
  quote_generated:    { Icon: TrendingUp,    dot: 'bg-sage-500',    label: 'Quote Generated'      },
  policy_bound:       { Icon: CheckCircle2,  dot: 'bg-sage-500',   label: 'Policy Bound'         },
  endorsement_filed:  { Icon: FileEdit,      dot: 'bg-crimson-500', label: 'Endorsement Filed'    },
  document_generated: { Icon: FileText,      dot: 'bg-stone-400',   label: 'Document Generated'   },
  status_changed:     { Icon: RefreshCw,     dot: 'bg-ink-300',     label: 'Status Changed'       },
  note_added:         { Icon: MessageSquare, dot: 'bg-stone-300',   label: 'Note Added'           },
}

// ── Event-specific accordion detail renderer ─────────────────────────────────
// Returns the detail fields for a given event type as an object array
function getEventDetail(ev) {
  switch (ev.type) {
    case 'quote_generated':
      return [
        { label: 'Quote ID',       value: `Q00-${ev.submissionId.replace('SN', '')}-00`, mono: true },
        { label: 'Premium Amount', value: ev.premiumAmount || '$4,280.00',               mono: true },
        { label: 'Limits',         value: ev.limits       || '$1M / $2M CSL',           mono: false },
      ]
    case 'status_changed': {
      const parts = ev.action.match(/Status changed(?:\sto\s(.+))?/)
      const to    = parts?.[1] || ev.toStatus || 'Offered'
      return [
        { label: 'From Status', value: ev.fromStatus || 'In Progress', mono: false },
        { label: 'To Status',   value: to,                             mono: false },
        { label: 'Changed By',  value: ev.user,                        mono: false },
      ]
    }
    case 'document_generated': {
      const docName = ev.action.replace(/document generated:?\s*/i, '').replace(/rating worksheet generated/i, 'RatingWorksheet') || 'Document'
      return [
        { label: 'Document Type', value: docName,          mono: false },
        { label: 'File Size',     value: '142 KB',         mono: true  },
        { label: 'Download',      value: 'Download file',  mono: false, isLink: true, evId: ev.id },
      ]
    }
    case 'clearance_check':
      return [
        { label: 'Clearance Result', value: ev.action.toLowerCase().includes('approved') ? 'Approved' : 'Requested', mono: false },
        { label: 'Notes',            value: ev.clearanceNotes || 'No adverse findings on ISO clearance check.', mono: false },
      ]
    default:
      return [
        { label: 'Detail', value: ev.detail, mono: false },
        { label: 'User',   value: ev.user,   mono: false },
      ]
  }
}

// ── Filter chip groups (maps to event type keys) ──────────────────────────────
const FILTER_CHIPS = [
  { label: 'All Events',      key: 'all'               },
  { label: 'Quote Events',    key: 'quote_generated'    },
  { label: 'Bind Events',     key: 'policy_bound'       },
  { label: 'Doc Events',      key: 'document_generated' },
  { label: 'Status Changes',  key: 'status_changed'     },
]

// ── 25-item activity log ──────────────────────────────────────────────────────
const SEED_EVENTS = [
  // Today
  { id: 1,  type: 'quote_generated',    action: 'Quote generated',                     detail: 'SN129122 — Redstone Welding Inc.',     user: 'uiuxAdmin',  time: '8m ago',             submissionId: 'SN129122' },
  { id: 2,  type: 'clearance_check',    action: 'Clearance approved',                  detail: 'SN129119 — Northfield Bakery',         user: 'jsmith',     time: '22m ago',            submissionId: 'SN129119' },
  { id: 3,  type: 'submission_created', action: 'New submission',                      detail: 'SN129124 — Desert Sun Solar LLC',      user: 'uiuxAdmin',  time: '1h ago',             submissionId: 'SN129124' },
  { id: 4,  type: 'document_generated', action: 'Document generated: QuoteProposal',   detail: 'SN129105 — Test',                      user: 'uiuxAdmin',  time: '1h ago',             submissionId: 'SN129105' },
  { id: 5,  type: 'policy_bound',       action: 'Policy bound',                        detail: 'SN129112 — Pinnacle Pediatrics',       user: 'jsmith',     time: '2h ago',             submissionId: 'SN129112' },
  { id: 6,  type: 'endorsement_filed',  action: 'Endorsement filed',                   detail: 'SN129117 — TechBridge Solutions',      user: 'mrodriguez', time: '2h ago',             submissionId: 'SN129117' },
  { id: 7,  type: 'clearance_check',    action: 'Clearance requested',                 detail: 'SN129120 — Emerald Lawn & Landscape',  user: 'adavis',     time: '3h ago',             submissionId: 'SN129120' },
  { id: 8,  type: 'status_changed',     action: 'Status changed to Offered',           detail: 'SN129116 — Harbor View Hotel',         user: 'jsmith',     time: '3h ago',             submissionId: 'SN129116' },
  { id: 9,  type: 'submission_created', action: 'New submission',                      detail: 'SN129121 — Magnolia Event Center',     user: 'mrodriguez', time: '4h ago',             submissionId: 'SN129121' },
  { id: 10, type: 'document_generated', action: 'Rating worksheet generated',          detail: 'SN129115 — Cypress Creek Nursery',     user: 'adavis',     time: '5h ago',             submissionId: 'SN129115' },
  { id: 11, type: 'quote_generated',    action: 'Quote generated',                     detail: 'SN129116 — Harbor View Hotel',         user: 'jsmith',     time: '5h ago',             submissionId: 'SN129116' },
  { id: 12, type: 'note_added',         action: 'Note added',                          detail: 'SN129108 — Summit Roofing Co.',        user: 'uiuxAdmin',  time: '6h ago',             submissionId: 'SN129108' },
  // Yesterday
  { id: 13, type: 'policy_bound',       action: 'Policy bound',                        detail: 'SN129107 — Riverside Auto Repair',     user: 'adavis',     time: 'Yesterday 4:30 PM',  submissionId: 'SN129107' },
  { id: 14, type: 'clearance_check',    action: 'Clearance approved',                  detail: 'SN129122 — Redstone Welding Inc.',     user: 'jsmith',     time: 'Yesterday 2:15 PM',  submissionId: 'SN129122' },
  { id: 15, type: 'submission_created', action: 'New submission',                      detail: 'SN129123 — Valley Springs Gym',        user: 'uiuxAdmin',  time: 'Yesterday 1:05 PM',  submissionId: 'SN129123' },
  { id: 16, type: 'endorsement_filed',  action: 'Endorsement filed',                   detail: 'SN129110 — Crestview Contractors',     user: 'mrodriguez', time: 'Yesterday 11:42 AM', submissionId: 'SN129110' },
  { id: 17, type: 'document_generated', action: 'Document generated: RatingWorksheet', detail: 'SN129119 — Northfield Bakery',         user: 'jsmith',     time: 'Yesterday 10:18 AM', submissionId: 'SN129119' },
  { id: 18, type: 'status_changed',     action: 'Status changed to Clearance',         detail: 'SN129111 — Lakeside Storage LLC',      user: 'adavis',     time: 'Yesterday 9:55 AM',  submissionId: 'SN129111' },
  { id: 19, type: 'note_added',         action: 'Note added',                          detail: 'SN129106 — Anchor Marine Supply',      user: 'uiuxAdmin',  time: 'Yesterday 9:10 AM',  submissionId: 'SN129106' },
  { id: 20, type: 'quote_generated',    action: 'Quote generated',                     detail: 'SN129112 — Pinnacle Pediatrics',       user: 'jsmith',     time: 'Yesterday 8:30 AM',  submissionId: 'SN129112' },
  // Earlier
  { id: 21, type: 'submission_created', action: 'New submission',                      detail: 'SN129118 — Bayside Car Wash',          user: 'adavis',     time: 'Mar 4, 3:44 PM',     submissionId: 'SN129118' },
  { id: 22, type: 'clearance_check',    action: 'Clearance requested',                 detail: 'SN129115 — Cypress Creek Nursery',     user: 'adavis',     time: 'Mar 4, 2:20 PM',     submissionId: 'SN129115' },
  { id: 23, type: 'status_changed',     action: 'Status changed to Offered',           detail: 'SN129119 — Northfield Bakery',         user: 'jsmith',     time: 'Mar 4, 11:05 AM',    submissionId: 'SN129119' },
  { id: 24, type: 'document_generated', action: 'Document generated: QuoteProposal',   detail: 'SN129107 — Riverside Auto Repair',     user: 'adavis',     time: 'Mar 3, 4:55 PM',     submissionId: 'SN129107' },
  { id: 25, type: 'submission_created', action: 'New submission',                      detail: 'SN129122 — Redstone Welding Inc.',     user: 'adavis',     time: 'Mar 3, 9:00 AM',     submissionId: 'SN129122' },
]

const ACTION_TYPES = [
  { value: '',                   label: 'All Actions'       },
  { value: 'submission_created', label: 'Submission Created'},
  { value: 'clearance_check',    label: 'Clearance Check'   },
  { value: 'quote_generated',    label: 'Quote Generated'   },
  { value: 'policy_bound',       label: 'Policy Bound'      },
  { value: 'endorsement_filed',  label: 'Endorsement Filed' },
  { value: 'document_generated', label: 'Document Generated'},
]

const USERS = [
  { value: '',           label: 'All Users'  },
  { value: 'uiuxAdmin',  label: 'uiuxAdmin'  },
  { value: 'jsmith',     label: 'jsmith'     },
  { value: 'adavis',     label: 'adavis'     },
  { value: 'mrodriguez', label: 'mrodriguez' },
]

const DATE_RANGES = [
  { value: 'today', label: 'Today'        },
  { value: 'week',  label: 'Last 7 Days'  },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'all',   label: 'All Time'     },
]

const LOG_EVENT_TYPES = [
  { value: 'quote_generated',    label: 'Quote Generated'   },
  { value: 'status_changed',     label: 'Status Changed'    },
  { value: 'document_generated', label: 'Document Generated'},
  { value: 'clearance_check',    label: 'Clearance'         },
  { value: 'note_added',         label: 'Note'              },
  { value: 'submission_created', label: 'Other'             },
]

const USER_COLORS = {
  uiuxAdmin:  'bg-ink-700',
  jsmith:     'bg-sage-600',
  adavis:     'bg-amber-500',
  mrodriguez: 'bg-ink-500',
}

const PAGE_SIZE = 10

// ── Helpers ───────────────────────────────────────────────────────────────────
function FilterSelect({ value, onChange, options, icon: Icon }) {
  return (
    <div className="relative flex items-center">
      {Icon && <Icon className="absolute left-2.5 h-3.5 w-3.5 text-stone-400 pointer-events-none" />}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={[
          'text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg',
          'pr-7 appearance-none focus:outline-none focus:ring-2 focus:ring-ink-300 transition-shadow',
          Icon ? 'pl-8 py-1.5' : 'pl-3 py-1.5',
        ].join(' ')}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 h-3 w-3 text-stone-400 pointer-events-none" />
    </div>
  )
}

// ── Log Event Modal ───────────────────────────────────────────────────────────
function LogEventModal({ onClose, onSubmit }) {
  const [eventType, setEventType] = useState('note_added')
  const [subNum,    setSubNum]    = useState('')
  const [notes,     setNotes]     = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!subNum.trim()) return
    onSubmit({ eventType, subNum: subNum.trim(), notes: notes.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-base font-bold text-stone-900">Log Manual Event</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Event Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={e => setEventType(e.target.value)}
              className="w-full text-sm font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink-300 appearance-none"
            >
              {LOG_EVENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Submission # */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Submission #
            </label>
            <input
              type="text"
              value={subNum}
              onChange={e => setSubNum(e.target.value)}
              placeholder="e.g. SN129122"
              required
              className="w-full text-sm font-mono font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink-300 placeholder:text-stone-300 placeholder:font-sans"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest">
              Detail / Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add context or notes for this event..."
              rows={3}
              className="w-full text-sm text-stone-700 bg-white border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink-300 resize-none placeholder:text-stone-300"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Event
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ActivityLogPage() {
  const navigate  = useNavigate()
  const toast     = useToast()
  const isLoading = useSimulatedLoading()
  const nextIdRef = useRef(100)

  const [filterType,  setFilterType]  = useState('')
  const [filterUser,  setFilterUser]  = useState('')
  const [filterRange, setFilterRange] = useState('all')
  const [filterSN,    setFilterSN]    = useState('')
  const [chipFilter,  setChipFilter]  = useState('all')
  const [page,        setPage]        = useState(1)
  const [localEvents, setLocalEvents] = useState([])
  const [expanded,    setExpanded]    = useState({})  // id → boolean
  const [showModal,   setShowModal]   = useState(false)
  const [csvLoading,  setCsvLoading]  = useState(false)

  // All events = manually logged (prepended) + seed
  const allEvents = useMemo(() => [...localEvents, ...SEED_EVENTS], [localEvents])

  // Filter pipeline
  const filtered = useMemo(() => {
    let data = [...allEvents]

    // Chip filter (quick type filter)
    if (chipFilter !== 'all') data = data.filter(e => e.type === chipFilter)

    // Dropdown filters
    if (filterType)  data = data.filter(e => e.type === filterType)
    if (filterUser)  data = data.filter(e => e.user === filterUser)
    if (filterSN)    data = data.filter(e =>
      e.submissionId.toLowerCase().includes(filterSN.toLowerCase()) ||
      e.detail.toLowerCase().includes(filterSN.toLowerCase())
    )

    return data
  }, [allEvents, chipFilter, filterType, filterUser, filterRange, filterSN])

  const visible = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < filtered.length

  // Group with date separators
  const grouped = useMemo(() => {
    const items = []
    let lastGroup = null
    visible.forEach(ev => {
      const group = ev.time.startsWith('Yesterday') ? 'Yesterday'
        : ev.time.includes('Mar') ? ev.time.split(',')[0]
        : 'Today'
      if (group !== lastGroup) {
        items.push({ type: 'separator', label: group, id: `sep-${group}-${ev.id}` })
        lastGroup = group
      }
      items.push({ type: 'event', data: ev })
    })
    return items
  }, [visible])

  // Toggle accordion
  const toggleExpanded = useCallback((id, e) => {
    e.stopPropagation()
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  // Log manual event
  const handleLogEvent = useCallback(({ eventType, subNum, notes }) => {
    const newEv = {
      id:           nextIdRef.current++,
      type:         eventType,
      action:       TYPE_META[eventType]?.label || 'Event',
      detail:       `${subNum}${notes ? ' — ' + notes : ''}`,
      user:         'uiuxAdmin',
      time:         'Just now',
      submissionId: subNum,
      notes,
      isManual:     true,
    }
    setLocalEvents(prev => [newEv, ...prev])
    setShowModal(false)
    toast.success('Event logged', `${TYPE_META[eventType]?.label || 'Event'} recorded for ${subNum}`)
  }, [toast])

  // Export CSV
  const handleExportCsv = useCallback(() => {
    setCsvLoading(true)
    setTimeout(() => {
      const header  = 'Date,Event Type,Description,Submission #,User\n'
      const rows    = allEvents.map(e =>
        [
          `"${e.time}"`,
          `"${TYPE_META[e.type]?.label || e.type}"`,
          `"${e.action}"`,
          `"${e.submissionId}"`,
          `"${e.user}"`,
        ].join(',')
      ).join('\n')
      const blob = new Blob([header + rows], { type: 'text/csv' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'activity-log.csv'
      a.click()
      URL.revokeObjectURL(url)
      setCsvLoading(false)
      toast.success('Activity log exported', `${allEvents.length} events downloaded.`)
    }, 600)
  }, [allEvents, toast])

  // Document download (cosmetic)
  const handleDocDownload = useCallback((evId) => {
    toast.info('Downloading', 'Document download started.')
  }, [toast])

  const clearFilters = useCallback(() => {
    setFilterType('')
    setFilterUser('')
    setFilterSN('')
    setChipFilter('all')
    setPage(1)
  }, [])

  const hasActiveFilters = filterType || filterUser || filterSN || chipFilter !== 'all'

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Activity Log</h1>
          <p className="text-sm text-stone-400 mt-0.5">All system events across submissions</p>
        </div>
        <SkeletonTable rows={10} cols={5} />
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-4">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Activity Log</h1>
          <p className="text-sm text-stone-400 mt-0.5">All system events across submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            loading={csvLoading}
            onClick={handleExportCsv}
          >
            Export Log
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Log Event
          </Button>
        </div>
      </div>

      {/* ── Filter bar + Stats strip ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card px-5 py-4 space-y-4">

        {/* Filter chip row */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.key}
              onClick={() => {
                setChipFilter(chip.key)
                setFilterType('')
                setPage(1)
              }}
              className={[
                'px-3 py-1 rounded-full text-xs font-bold transition-all',
                chipFilter === chip.key
                  ? 'bg-ink-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
              ].join(' ')}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Dropdown filters row */}
        <div className="flex items-center gap-3 flex-wrap border-t border-stone-100 pt-4">
          <FilterSelect
            value={filterType}
            onChange={v => { setFilterType(v); setChipFilter('all'); setPage(1) }}
            options={ACTION_TYPES}
            icon={Activity}
          />
          <FilterSelect
            value={filterUser}
            onChange={v => { setFilterUser(v); setPage(1) }}
            options={USERS}
          />
          <FilterSelect
            value={filterRange}
            onChange={v => { setFilterRange(v); setPage(1) }}
            options={DATE_RANGES}
            icon={Calendar}
          />
          {/* SN search */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={filterSN}
              onChange={e => { setFilterSN(e.target.value); setPage(1) }}
              placeholder="Submission # ..."
              className="text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg pl-3 pr-3 py-1.5 w-36 focus:outline-none focus:ring-2 focus:ring-ink-300 placeholder:text-stone-300 transition-shadow"
            />
          </div>
          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-stone-400 hover:text-crimson-600 transition-colors px-1"
            >
              Clear filters &times;
            </button>
          )}
          <div className="ml-auto text-xs text-stone-400 font-semibold">
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-0 border-t border-stone-100 pt-3">
          {[
            { label: 'Events Today', value: 12, icon: Clock,    color: 'text-ink-600',   bg: 'bg-ink-50'   },
            { label: 'This Week',    value: 47, icon: Activity, color: 'text-sage-600',  bg: 'bg-sage-50'  },
            { label: 'This Month',   value: 183, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 flex-1 ${i > 0 ? 'border-l border-stone-100 pl-5 ml-5' : ''}`}
            >
              <div className={`${bg} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-black text-stone-900 font-mono leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-stone-100 bg-stone-25">
          <Activity className="h-3.5 w-3.5 text-ink-500 shrink-0" />
          <h3 className="text-sm font-bold text-stone-800">Event Timeline</h3>
          <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
        </div>

        <div className="px-6 py-4">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
              <Activity className="h-8 w-8 mb-3 opacity-30" />
              <p className="text-sm font-semibold">No events match your filters</p>
            </div>
          ) : (
            <div className="relative">
              {grouped.map((item, idx) => {
                if (item.type === 'separator') {
                  return (
                    <div key={item.id} className="flex items-center gap-3 mb-3 mt-4 first:mt-0">
                      <div className="h-px flex-1 bg-stone-100" />
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2 py-1 bg-stone-50 rounded-full border border-stone-100">
                        {item.label}
                      </span>
                      <div className="h-px flex-1 bg-stone-100" />
                    </div>
                  )
                }

                const ev      = item.data
                const meta    = TYPE_META[ev.type] || TYPE_META.note_added
                const { Icon, dot } = meta
                const isOpen  = !!expanded[ev.id]
                const details = getEventDetail(ev)

                // Connector line to next event row
                const nextItem  = grouped[idx + 1]
                const showLine  = nextItem && nextItem.type === 'event'

                return (
                  <div key={ev.id} className="relative">
                    {/* Vertical connector */}
                    {showLine && (
                      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-stone-100 z-0" />
                    )}

                    {/* Row */}
                    <div
                      className="relative flex items-start gap-4 py-2.5 px-3 rounded-lg hover:bg-stone-25 transition-colors group z-10"
                    >
                      {/* Circle icon */}
                      <div className={`w-[30px] h-[30px] rounded-full ${dot} flex items-center justify-center shrink-0 shadow-sm mt-0.5`}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          {/* Left: action + detail — clicking navigates */}
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => navigate(`/submissions/${ev.submissionId}`)}
                          >
                            <p className="text-sm font-semibold text-stone-800 group-hover:text-ink-800 transition-colors leading-snug">
                              {ev.action}
                              {ev.isManual && (
                                <span className="ml-2 text-[9px] font-bold bg-ink-100 text-ink-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                  Manual
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-stone-400 mt-0.5 truncate">{ev.detail}</p>
                          </div>

                          {/* Right: user + time + expand toggle */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-5 h-5 rounded-full ${USER_COLORS[ev.user] || 'bg-stone-400'} text-white text-[9px] font-black flex items-center justify-center`}>
                                {ev.user[0].toUpperCase()}
                              </span>
                              <span className="text-xs text-stone-500 font-medium">{ev.user}</span>
                            </div>
                            <span className="text-[11px] text-stone-300 font-mono whitespace-nowrap">{ev.time}</span>
                            {/* Expand toggle */}
                            <button
                              onClick={e => toggleExpanded(ev.id, e)}
                              className="p-1 rounded-md text-stone-300 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                              title={isOpen ? 'Collapse' : 'Expand details'}
                            >
                              {isOpen
                                ? <ChevronUp className="h-3.5 w-3.5" />
                                : <ChevronDown className="h-3.5 w-3.5" />
                              }
                            </button>
                          </div>
                        </div>

                        {/* Accordion detail panel — CSS max-height transition */}
                        <div
                          className="overflow-hidden transition-all duration-200"
                          style={{ maxHeight: isOpen ? '200px' : '0px', opacity: isOpen ? 1 : 0 }}
                        >
                          <div className="mt-2 ml-0 bg-stone-50 rounded-lg border border-stone-100 px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2">
                            {details.map(d => (
                              <div key={d.label} className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                                  {d.label}
                                </span>
                                {d.isLink ? (
                                  <button
                                    onClick={() => handleDocDownload(ev.id)}
                                    className="text-xs font-semibold text-ink-600 hover:text-ink-900 text-left transition-colors underline underline-offset-2"
                                  >
                                    {d.value}
                                  </button>
                                ) : (
                                  <span className={`text-xs font-semibold text-stone-700 ${d.mono ? 'font-mono' : ''}`}>
                                    {d.value}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="border-t border-stone-100 px-6 py-3 flex items-center justify-center bg-stone-25">
            <button
              onClick={() => setPage(p => p + 1)}
              className="flex items-center gap-2 text-xs font-bold text-ink-600 hover:text-ink-900 transition-colors px-4 py-2 rounded-lg hover:bg-white border border-transparent hover:border-stone-200 hover:shadow-sm"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Load more ({filtered.length - visible.length} remaining)
            </button>
          </div>
        )}
        {!hasMore && filtered.length > 0 && (
          <div className="border-t border-stone-100 px-6 py-3 text-center">
            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">
              All {filtered.length} events loaded
            </span>
          </div>
        )}
      </div>

      {/* ── Log Event Modal ── */}
      {showModal && (
        <LogEventModal
          onClose={() => setShowModal(false)}
          onSubmit={handleLogEvent}
        />
      )}

    </div>
  )
}
