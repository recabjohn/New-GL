import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, AlertTriangle, Clock, CheckCircle2,
  Search, ChevronRight, ChevronDown, ChevronUp,
  X, Loader2,
} from 'lucide-react'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import { submissions } from '../data/mockData'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// "Today" for overdue calculations per spec: March 6, 2026
const TODAY = new Date(2026, 2, 6)
const OVERDUE_THRESHOLD_DAYS = 3

const KPI_PENDING  = 'Pending Review'
const KPI_CLEARED  = 'Cleared Today'
const KPI_CONFLICT = 'Conflicts Found'
const KPI_AVG      = 'Avg Check Time'

// Mock conflicting policies shown in the resolution modal
const CONFLICT_POLICIES = [
  {
    policyNumber:  'POL-0012847',
    insured:       'Lakeside Storage LLC',
    carrier:       'Coastal Commercial Group',
    effectiveDate: '11/15/2025',
    status:        'Active',
  },
  {
    policyNumber:  'POL-0013001',
    insured:       'Lakeside Self-Storage',
    carrier:       'Apex Commercial Risk',
    effectiveDate: '02/01/2026',
    status:        'Bound',
  },
]

const STATUS_CONFIG = {
  Clearance:     { color: 'bg-amber-100 text-amber-700', label: 'Pending'   },
  'In Progress': { color: 'bg-ink-100 text-ink-700',     label: 'In Review' },
  Registered:    { color: 'bg-sage-100 text-sage-700',   label: 'Cleared'   },
  Offered:       { color: 'bg-sage-100 text-sage-700',   label: 'Cleared'   },
  Bound:         { color: 'bg-sage-100 text-sage-700',   label: 'Cleared'   },
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function parseDateUS(str) {
  if (!str) return null
  const parts = str.split('/')
  if (parts.length !== 3) return null
  const m = Number(parts[0])
  const d = Number(parts[1])
  const y = Number(parts[2])
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null
  return new Date(y, m - 1, d)
}

function daysDiff(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function getOverdueDays(submission) {
  const created = parseDateUS(submission.createdDate)
  if (!created) return 0
  const diff = daysDiff(created, TODAY)
  return diff > OVERDUE_THRESHOLD_DAYS ? diff : 0
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function OverdueChip({ days }) {
  if (!days) return null
  return (
    <span className="bg-crimson-100 text-crimson-700 text-xs font-mono px-1.5 py-0.5 rounded shrink-0">
      Overdue {days}d
    </span>
  )
}

function ClearanceNotesAccordion({ submissionId, open, onToggle }) {
  const [note, setNote]     = useState('')
  const [saving, setSaving] = useState(false)
  const toast               = useToast()

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Note saved', 'Clearance note saved for ' + submissionId + '.')
    }, 600)
  }

  return (
    <div className="border-t border-stone-100 bg-stone-25">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-1.5 px-5 py-2 text-left text-xs font-semibold text-stone-400 hover:text-stone-600 transition-colors"
      >
        <span>Notes</span>
        {open
          ? <ChevronUp className="h-3 w-3" />
          : <ChevronDown className="h-3 w-3" />
        }
      </button>
      {open && (
        <div className="px-5 pb-3 space-y-2">
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add clearance notes..."
            rows={3}
            className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300 bg-white placeholder:text-stone-300 text-stone-700"
          />
          <Button variant="secondary" size="xs" loading={saving} onClick={handleSave}>
            Save Note
          </Button>
        </div>
      )}
    </div>
  )
}

function ConflictModal({ open, submission, onClose, onOverride, onDecline }) {
  if (!submission) return null
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Conflict Detected"
      subtitle={submission.insuredName + ' \u00b7 ' + submission.submissionNumber}
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDecline(submission.id)}>
            Decline
          </Button>
          <Button variant="success" size="sm" onClick={() => onOverride(submission.id)}>
            Override &amp; Clear
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-crimson-50 border border-crimson-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-crimson-600 mt-0.5 shrink-0" />
          <p className="text-sm text-crimson-700 leading-relaxed">
            This submission has an active policy conflict. Review the conflicting records
            below before deciding to override or decline.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
            Conflicting Policies
          </p>
          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="min-w-full text-xs divide-y divide-stone-100">
              <thead className="bg-stone-50">
                <tr>
                  {['Policy #', 'Insured', 'Carrier', 'Effective Date', 'Status'].map(h => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-100">
                {CONFLICT_POLICIES.map(p => (
                  <tr key={p.policyNumber}>
                    <td className="px-3 py-2 font-mono font-bold text-ink-700 whitespace-nowrap">{p.policyNumber}</td>
                    <td className="px-3 py-2 text-stone-700">{p.insured}</td>
                    <td className="px-3 py-2 text-stone-600">{p.carrier}</td>
                    <td className="px-3 py-2 font-mono text-stone-500 whitespace-nowrap">{p.effectiveDate}</td>
                    <td className="px-3 py-2">
                      <span className="bg-sage-100 text-sage-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function ClearancePage() {
  const navigate = useNavigate()
  const toast    = useToast()

  const [search, setSearch]               = useState('')
  const [kpiFilter, setKpiFilter]         = useState(null)
  // id -> 'checking' | 'cleared' | 'conflict' | 'declined'
  const [rowStates, setRowStates]         = useState({})
  // id -> boolean
  const [notesOpen, setNotesOpen]         = useState({})
  const [conflictModal, setConflictModal] = useState({ open: false, submission: null })
  const [batchLoading, setBatchLoading]   = useState(false)

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const pendingQueue = submissions.filter(s =>
    s.status === 'Clearance' || s.status === 'In Progress'
  )

  const recentlyCleared = submissions.filter(s =>
    ['Registered', 'Offered', 'Bound', 'Issued'].includes(s.status)
  )

  const localClearedIds = new Set(
    Object.entries(rowStates).filter(([, v]) => v === 'cleared').map(([k]) => k)
  )
  const localConflictIds = new Set(
    Object.entries(rowStates).filter(([, v]) => v === 'conflict').map(([k]) => k)
  )
  const localDeclinedIds = new Set(
    Object.entries(rowStates).filter(([, v]) => v === 'declined').map(([k]) => k)
  )

  const pendingCount  = pendingQueue.filter(s => !localClearedIds.has(s.id) && !localDeclinedIds.has(s.id)).length
  const clearedCount  = recentlyCleared.length + localClearedIds.size
  const conflictCount = localConflictIds.size

  const STATS = [
    { key: KPI_PENDING,  label: KPI_PENDING,  value: pendingCount,  color: 'text-amber-600',   bg: 'bg-amber-50',   icon: Clock },
    { key: KPI_CLEARED,  label: KPI_CLEARED,  value: clearedCount,  color: 'text-sage-600',    bg: 'bg-sage-50',    icon: CheckCircle2 },
    { key: KPI_CONFLICT, label: KPI_CONFLICT, value: conflictCount, color: 'text-crimson-600', bg: 'bg-crimson-50', icon: AlertTriangle },
    { key: KPI_AVG,      label: KPI_AVG,      value: '1.4m',        color: 'text-ink-600',     bg: 'bg-ink-50',     icon: ShieldCheck },
  ]

  function buildVisibleQueue() {
    let base = pendingQueue.filter(s => !localDeclinedIds.has(s.id))

    if (kpiFilter === KPI_PENDING) {
      base = base.filter(s => !localClearedIds.has(s.id) && !localConflictIds.has(s.id))
    } else if (kpiFilter === KPI_CLEARED) {
      base = base.filter(s => localClearedIds.has(s.id))
    } else if (kpiFilter === KPI_CONFLICT) {
      base = base.filter(s => localConflictIds.has(s.id))
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      base = base.filter(s =>
        s.insuredName.toLowerCase().includes(q) ||
        s.submissionNumber.toLowerCase().includes(q)
      )
    }

    return base
  }

  const visibleQueue = buildVisibleQueue()

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const runCheck = useCallback((id) => {
    setRowStates(prev => ({ ...prev, [id]: 'checking' }))
    setTimeout(() => {
      const isConflict = id === 'SN129111'
      setRowStates(prev => ({ ...prev, [id]: isConflict ? 'conflict' : 'cleared' }))
      if (isConflict) {
        const sub = submissions.find(s => s.id === id) || null
        setConflictModal({ open: true, submission: sub })
      }
    }, 1500)
  }, [])

  function handleBatchRunAll() {
    const unprocessedIds = pendingQueue
      .filter(s =>
        !localClearedIds.has(s.id) &&
        !localConflictIds.has(s.id) &&
        !localDeclinedIds.has(s.id) &&
        rowStates[s.id] !== 'checking'
      )
      .map(s => s.id)

    if (unprocessedIds.length === 0) {
      toast.info('Nothing to check', 'All rows have already been processed.')
      return
    }

    setBatchLoading(true)
    setRowStates(prev => {
      const next = { ...prev }
      unprocessedIds.forEach(id => { next[id] = 'checking' })
      return next
    })

    setTimeout(() => {
      setBatchLoading(false)
      let clearedN   = 0
      let conflictsN = 0
      const conflictSubs = []

      setRowStates(prev => {
        const next = { ...prev }
        unprocessedIds.forEach(id => {
          const isConflict = id === 'SN129111'
          next[id] = isConflict ? 'conflict' : 'cleared'
          if (isConflict) {
            conflictsN++
            const sub = submissions.find(s => s.id === id)
            if (sub) conflictSubs.push(sub)
          } else {
            clearedN++
          }
        })
        return next
      })

      const plural = conflictsN !== 1 ? 's' : ''
      toast.success(
        'Clearance check complete',
        clearedN + ' cleared, ' + conflictsN + ' conflict' + plural + ' found.'
      )

      if (conflictSubs.length > 0) {
        setConflictModal({ open: true, submission: conflictSubs[0] })
      }
    }, 2000)
  }

  function handleOverride(id) {
    setRowStates(prev => ({ ...prev, [id]: 'cleared' }))
    setConflictModal({ open: false, submission: null })
    toast.success('Override applied', 'Submission has been cleared via manual override.')
  }

  function handleDecline(id) {
    setRowStates(prev => ({ ...prev, [id]: 'declined' }))
    setConflictModal({ open: false, submission: null })
    toast.warning('Submission declined', 'This submission has been moved to declined state.')
  }

  function toggleNotes(id) {
    setNotesOpen(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function handleKpiClick(key) {
    if (key === KPI_AVG) return
    setKpiFilter(prev => (prev === key ? null : key))
  }

  // ---------------------------------------------------------------------------
  // Row visual helpers
  // ---------------------------------------------------------------------------

  function getRowBg(id) {
    const s = rowStates[id]
    if (s === 'cleared')  return 'bg-sage-50'
    if (s === 'conflict') return 'bg-crimson-50'
    return ''
  }

  function buildRowStatusNode(id) {
    const s = rowStates[id]
    if (s === 'checking') {
      return (
        <span className="inline-flex items-center gap-1.5">
          <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
          <span className="text-xs text-stone-400">Checking...</span>
        </span>
      )
    }
    if (s === 'cleared') {
      return (
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-sage-600" />
          <span className="text-xs font-semibold text-sage-700">Cleared</span>
        </span>
      )
    }
    if (s === 'conflict') {
      return (
        <span className="inline-flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-crimson-600" />
          <span className="text-xs font-semibold text-crimson-700">Conflict</span>
        </span>
      )
    }
    return null
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Clearance Queue</h1>
          <p className="text-sm text-stone-400 mt-0.5">Review and clear submissions before account setup</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          loading={batchLoading}
          icon={batchLoading ? undefined : ShieldCheck}
          onClick={handleBatchRunAll}
        >
          {batchLoading ? 'Running checks...' : 'Run All Pending'}
        </Button>
      </div>

      {/* ── KPI Stats — clickable filters ───────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map(stat => {
          const isActive   = kpiFilter === stat.key
          const isDisabled = stat.key === KPI_AVG
          return (
            <button
              key={stat.key}
              onClick={() => handleKpiClick(stat.key)}
              disabled={isDisabled}
              className={[
                'bg-white rounded-xl border shadow-card px-5 py-4 text-left transition-all duration-150',
                isDisabled ? 'cursor-default' : 'cursor-pointer hover:shadow-elevated',
                isActive ? 'ring-2 ring-flame-500 border-flame-300' : 'border-stone-200',
              ].join(' ')}
            >
              <div className={stat.bg + ' w-9 h-9 rounded-lg flex items-center justify-center mb-3'}>
                <stat.icon className={'h-4 w-4 ' + stat.color} />
              </div>
              <p className="text-2xl font-black font-mono text-stone-900">{stat.value}</p>
              <p className="text-xs font-semibold text-stone-500 mt-0.5">{stat.label}</p>
              {isActive && (
                <p className="text-[10px] text-flame-600 font-semibold mt-1">Filtering active</p>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Pending Clearance queue ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">

        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 bg-stone-25">
          <div className="flex items-center gap-2 flex-wrap">
            <Clock className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-sm font-bold text-stone-800">Pending Clearance</span>
            <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
              {visibleQueue.length}
            </span>
            {kpiFilter && kpiFilter !== KPI_AVG && (
              <button
                onClick={() => setKpiFilter(null)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-flame-600 bg-flame-50 px-2 py-0.5 rounded-full hover:bg-flame-100 transition-colors"
              >
                {kpiFilter}
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
          <div className="relative shrink-0">
            <Search className="h-3.5 w-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-300 bg-white w-44"
            />
          </div>
        </div>

        {visibleQueue.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-sage-300 mx-auto mb-2" />
            <p className="text-sm text-stone-400">
              {kpiFilter ? 'No submissions match this filter' : 'No submissions pending clearance'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {visibleQueue.map(s => {
              const cfg         = STATUS_CONFIG[s.status] || STATUS_CONFIG['In Progress']
              const rowBg       = getRowBg(s.id)
              const statusNode  = buildRowStatusNode(s.id)
              const rowState    = rowStates[s.id]
              const isChecking  = rowState === 'checking'
              const isCleared   = rowState === 'cleared'
              const isConflict  = rowState === 'conflict'
              const overdueDays = getOverdueDays(s)

              return (
                <div key={s.id} className={'transition-colors duration-300 ' + rowBg}>

                  {/* Main row */}
                  <div
                    onClick={() => navigate('/submissions/' + s.id)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 text-left cursor-pointer group hover:brightness-[0.97]"
                  >
                    <PriorityBadge priority={s.priority} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-semibold text-stone-800 group-hover:text-ink-700">
                          {s.insuredName}
                        </span>
                        <span className="font-mono text-xs text-ink-600 bg-ink-50 px-1.5 py-0.5 rounded">
                          {s.submissionNumber}
                        </span>
                        <OverdueChip days={overdueDays} />
                      </div>
                      <p className="text-xs text-stone-400">{s.agencyName} &middot; {s.agentName}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-stone-400">Eff {s.effectiveDate}</span>

                      {statusNode ? statusNode : (
                        <span className={'text-[10px] font-semibold px-2 py-0.5 rounded-full ' + cfg.color}>
                          {cfg.label}
                        </span>
                      )}

                      {!isChecking && !isCleared && (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={e => {
                            e.stopPropagation()
                            if (isConflict) {
                              const found = submissions.find(sub2 => sub2.id === s.id) || null
                              setConflictModal({ open: true, submission: found })
                            } else {
                              runCheck(s.id)
                            }
                          }}
                        >
                          {isConflict ? 'Resolve' : 'Run Check'}
                        </Button>
                      )}

                      <button
                        onClick={e => {
                          e.stopPropagation()
                          toggleNotes(s.id)
                        }}
                        className="inline-flex items-center gap-0.5 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        Notes
                        {notesOpen[s.id]
                          ? <ChevronUp className="h-3 w-3" />
                          : <ChevronDown className="h-3 w-3" />
                        }
                      </button>

                      <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-ink-400" />
                    </div>
                  </div>

                  {/* Notes accordion below each row */}
                  <ClearanceNotesAccordion
                    submissionId={s.submissionNumber}
                    open={!!notesOpen[s.id]}
                    onToggle={() => toggleNotes(s.id)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Recently Cleared ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-25">
          <CheckCircle2 className="h-4 w-4 text-sage-500" />
          <span className="text-sm font-bold text-stone-800">Recently Cleared</span>
          <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
            {recentlyCleared.length}
          </span>
        </div>
        <div className="divide-y divide-stone-50">
          {recentlyCleared.slice(0, 6).map(s => (
            <button
              key={s.id}
              onClick={() => navigate('/submissions/' + s.id)}
              className="w-full flex items-center gap-4 px-5 py-3 hover:bg-stone-25 text-left transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-sage-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-sage-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-stone-700 group-hover:text-ink-700">{s.insuredName}</span>
                <span className="font-mono text-xs text-stone-400 ml-2">{s.submissionNumber}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={s.status} />
                <span className="text-xs text-stone-400 font-mono">{s.createdDate}</span>
                <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-ink-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Conflict Resolution Modal ────────────────────────────────────────── */}
      <ConflictModal
        open={conflictModal.open}
        submission={conflictModal.submission}
        onClose={() => setConflictModal({ open: false, submission: null })}
        onOverride={handleOverride}
        onDecline={handleDecline}
      />
    </div>
  )
}
