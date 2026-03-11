import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FileText, ArrowRight, MoreHorizontal,
  BookmarkPlus, X, Download,
} from 'lucide-react'
import Table from '../components/ui/Table'
import Button from '../components/ui/Button'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import SubmissionFilters from '../components/dashboard/SubmissionFilters'
import NewSubmissionModal from '../components/dashboard/NewSubmissionModal'
import { submissions, assignees } from '../data/mockData'
import { useToast } from '../components/ui/Toast'
import { useSimulatedLoading } from '../hooks/useFormGuard'
import { SkeletonTable } from '../components/ui/Skeleton'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PIPELINE = [
  { id: 'In Progress', label: 'New',       count: 7,  color: '#2A5BAD' },
  { id: 'Clearance',   label: 'Clearance', count: 4,  color: '#D97706' },
  { id: 'Registered',  label: 'Rating',    count: 4,  color: '#4879C2' },
  { id: 'Offered',     label: 'Quoted',    count: 5,  color: '#1AAD61' },
  { id: 'Bound',       label: 'Bound',     count: 2,  color: '#F05A2A' },
  { id: 'Issued',      label: 'Issued',    count: 1,  color: '#0E713E' },
]

const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW']

// Project spec: today = March 6, 2026
const TODAY = new Date('2026-03-06T00:00:00')

// Exportable column definitions
const EXPORT_COLUMNS = [
  { key: 'submissionNumber', label: 'SN#' },
  { key: 'insuredName',      label: 'Insured' },
  { key: 'status',           label: 'Status' },
  { key: 'priority',         label: 'Priority' },
  { key: 'assignee',         label: 'Assignee' },
  { key: 'needByDate',       label: 'Need By' },
  { key: 'effectiveDate',    label: 'Eff Date' },
  { key: 'agencyName',       label: 'Agency' },
]

const defaultFilters = { priority: '', transactionType: '', status: '', assignee: '', search: '' }

const CURRENT_USER = 'uiuxAdmin'

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function parseDate(str) {
  if (!str) return null
  const parts = str.split('/')
  if (parts.length !== 3) return null
  const [m, d, y] = parts.map(Number)
  if (!m || !d || !y) return null
  return new Date(y, m - 1, d)
}

function daysUntil(dateStr) {
  const d = parseDate(dateStr)
  if (!d) return null
  const diffMs = d.getTime() - TODAY.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

// ---------------------------------------------------------------------------
// NeedByChip — colored pill for the Need By column (Batch J #6)
// ---------------------------------------------------------------------------
function NeedByChip({ dateStr }) {
  if (!dateStr) {
    return <span className="text-stone-300 font-mono text-xs">—</span>
  }
  const days = daysUntil(dateStr)
  if (days === null) {
    return <span className="font-mono text-xs text-stone-400">{dateStr}</span>
  }
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-crimson-500 text-white whitespace-nowrap">
        {dateStr}
        <span className="text-[9px] font-black tracking-wider">OVERDUE</span>
      </span>
    )
  }
  if (days < 3) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono bg-crimson-100 text-crimson-700 whitespace-nowrap">
        {dateStr}
      </span>
    )
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono bg-amber-100 text-amber-700 whitespace-nowrap">
        {dateStr}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono bg-sage-100 text-sage-700 whitespace-nowrap">
      {dateStr}
    </span>
  )
}

// ---------------------------------------------------------------------------
// DaysRemainingCell — "Days Left" column (Batch A #2)
// ---------------------------------------------------------------------------
function DaysRemainingCell({ dateStr }) {
  if (!dateStr) {
    return <span className="font-mono text-xs text-stone-300">—</span>
  }
  const days = daysUntil(dateStr)
  if (days === null) {
    return <span className="font-mono text-xs text-stone-400">—</span>
  }
  if (days < 0) {
    return <span className="font-mono text-xs font-bold text-crimson-600">OVERDUE</span>
  }
  if (days < 3) {
    return <span className="font-mono text-xs text-crimson-600">{days}d</span>
  }
  if (days <= 7) {
    return <span className="font-mono text-xs text-amber-600">{days}d</span>
  }
  return <span className="font-mono text-xs text-sage-600">{days}d</span>
}

// ---------------------------------------------------------------------------
// RenewalDueChip — shows expiration date with urgency color (Batch J #7)
// ---------------------------------------------------------------------------
function RenewalDueChip({ expirationDateStr }) {
  if (!expirationDateStr) {
    return <span className="text-stone-300 font-mono text-xs">—</span>
  }
  const days = daysUntil(expirationDateStr)
  if (days === null) {
    return <span className="font-mono text-xs text-stone-400">{expirationDateStr}</span>
  }
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-crimson-500 text-white whitespace-nowrap">
        {expirationDateStr}
        <span className="text-[9px] font-black tracking-wider">OVERDUE</span>
      </span>
    )
  }
  if (days < 3) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono bg-crimson-100 text-crimson-700 whitespace-nowrap">
        {expirationDateStr} · {days}d
      </span>
    )
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono bg-amber-100 text-amber-700 whitespace-nowrap">
        {expirationDateStr} · {days}d
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold font-mono bg-sage-100 text-sage-700 whitespace-nowrap">
      {expirationDateStr} · {days}d
    </span>
  )
}

// ---------------------------------------------------------------------------
// InlineSelect — keyboard-accessible inline edit (Batch A #1)
// ---------------------------------------------------------------------------
function InlineSelect({ value, options, onCommit, onCancel }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.focus()
  }, [])

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onCommit(e.target.value)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <select
      ref={ref}
      defaultValue={value}
      onChange={e => onCommit(e.target.value)}
      onBlur={e => onCommit(e.target.value)}
      onKeyDown={handleKeyDown}
      onClick={e => e.stopPropagation()}
      className="text-xs border border-ink-400 rounded px-1.5 py-0.5 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-ink-400 cursor-pointer"
    >
      {options.map(o => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

// ---------------------------------------------------------------------------
// ContextMenu — per-row action dropdown (Batch A #3)
// ---------------------------------------------------------------------------
function ContextMenu({ onView, onReassign, onChangePriority, onExportRow, onMarkUrgent }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  function invoke(fn) {
    setOpen(false)
    fn()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v) }}
        className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        title="More actions"
        aria-label="Row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 bg-white rounded-lg border border-stone-200 shadow-elevated py-1 text-xs">
          <button
            onClick={e => { e.stopPropagation(); invoke(onView) }}
            className="w-full text-left px-3 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            View
          </button>
          <button
            onClick={e => { e.stopPropagation(); invoke(onReassign) }}
            className="w-full text-left px-3 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Reassign
          </button>
          <button
            onClick={e => { e.stopPropagation(); invoke(onChangePriority) }}
            className="w-full text-left px-3 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Change Priority
          </button>
          <div className="my-1 border-t border-stone-100" />
          <button
            onClick={e => { e.stopPropagation(); invoke(onExportRow) }}
            className="w-full text-left px-3 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Export Row
          </button>
          <button
            onClick={e => { e.stopPropagation(); invoke(onMarkUrgent) }}
            className="w-full text-left px-3 py-2 text-crimson-600 font-semibold hover:bg-crimson-50 transition-colors"
          >
            Mark Urgent
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PriorityPopover — centered popover for changing priority (Batch A #3)
// ---------------------------------------------------------------------------
function PriorityPopover({ currentPriority, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="fixed z-[60] bg-white rounded-xl border border-stone-200 shadow-elevated p-4 w-52"
      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-stone-700 uppercase tracking-wide">Change Priority</p>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-600 p-0.5 rounded transition-colors"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-1">
        {PRIORITIES.map(p => (
          <label
            key={p}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer"
          >
            <input
              type="radio"
              name="priority-popover"
              value={p}
              defaultChecked={p === currentPriority}
              onChange={() => onSelect(p)}
              className="accent-ink-600"
            />
            <PriorityBadge priority={p} />
          </label>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Preset saved-filter definitions (Batch A #4)
// ---------------------------------------------------------------------------
const PRESET_FILTERS = [
  {
    id: 'my-open',
    label: 'My Open',
    apply: () => ({
      assignee: CURRENT_USER,
      status: 'In Progress',
      priority: '',
      transactionType: '',
      search: '',
    }),
  },
  {
    id: 'high-priority',
    label: 'High Priority',
    apply: () => ({
      priority: 'HIGH',
      assignee: '',
      status: '',
      transactionType: '',
      search: '',
    }),
  },
  {
    id: 'expiring-soon',
    label: 'Expiring Soon',
    // _preset sentinel triggers special filter logic in useMemo
    apply: () => ({
      _preset: 'expiring-soon',
      priority: '',
      assignee: '',
      status: '',
      transactionType: '',
      search: '',
    }),
  },
]

// ---------------------------------------------------------------------------
// SubmissionsPage
// ---------------------------------------------------------------------------
export default function SubmissionsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const loading = useSimulatedLoading(500)

  // Core filter / pipeline state
  const [filters, setFilters] = useState(defaultFilters)
  const [activeStage, setStage] = useState(null)
  const [modal, setModal] = useState(false)

  // Inline quick-edit state (Batch A #1)
  // editingCell: { id, field } | null
  const [editingCell, setEditingCell] = useState(null)
  // submissionOverrides: { [id]: { priority?, assignee? } }
  const [submissionOverrides, setSubmissionOverrides] = useState({})

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Context menu → reassign modal (Batch A #3)
  const [reassignModal, setReassignModal] = useState({ open: false, subId: '', current: '' })
  const [reassignTo, setReassignTo] = useState('')

  // Context menu → priority popover (Batch A #3)
  const [priorityPopover, setPriorityPopover] = useState({ open: false, subId: '', current: '' })

  // Saved filters (Batch A #4)
  const [activePreset, setActivePreset] = useState(null)
  const [savedFilters, setSavedFilters] = useState([])
  const [saveFilterModal, setSaveFilterModal] = useState(false)
  const [saveFilterName, setSaveFilterName] = useState('')

  // Export modal (Batch A #5)
  const [exportModal, setExportModal] = useState(false)
  const [exportColKeys, setExportColKeys] = useState(
    () => new Set(EXPORT_COLUMNS.map(c => c.key))
  )

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------
  const merged = activeStage ? { ...filters, status: activeStage } : filters

  const filtered = useMemo(() => {
    // Layer overrides on top of source data
    let data = submissions.map(s => ({ ...s, ...submissionOverrides[s.id] }))

    if (merged._preset === 'expiring-soon') {
      // Show rows with needByDate within the next 0–7 days (not overdue, not past)
      data = data.filter(s => {
        const d = daysUntil(s.needByDate)
        return d !== null && d >= 0 && d <= 7
      })
    } else {
      if (merged.priority)        data = data.filter(s => s.priority === merged.priority)
      if (merged.transactionType) data = data.filter(s => s.transactionType === merged.transactionType)
      if (merged.status)          data = data.filter(s => s.status === merged.status)
      if (merged.assignee)        data = data.filter(s => s.assignee === merged.assignee)
      if (merged.search) {
        const q = merged.search.toLowerCase()
        data = data.filter(s =>
          s.insuredName.toLowerCase().includes(q) ||
          s.submissionNumber.toLowerCase().includes(q) ||
          s.agencyName.toLowerCase().includes(q)
        )
      }
    }
    return data
  }, [merged, submissionOverrides])

  // Renewal Due column visible when transactionType filter = RENEWAL (Batch J #7)
  const showRenewalDue = merged.transactionType === 'RENEWAL'

  // Count of selected renewal rows for batch action button (Batch J #8)
  const selectedRenewalCount = useMemo(() => {
    return [...selectedIds].filter(id => {
      const row = filtered.find(s => s.id === id)
      return row && row.transactionType === 'RENEWAL'
    }).length
  }, [selectedIds, filtered])

  // ---------------------------------------------------------------------------
  // Override helper
  // ---------------------------------------------------------------------------
  const applyOverride = useCallback((id, patch) => {
    setSubmissionOverrides(prev => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }))
  }, [])

  // ---------------------------------------------------------------------------
  // Inline edit handlers
  // ---------------------------------------------------------------------------
  function commitEdit(id, field, value) {
    applyOverride(id, { [field]: value })
    setEditingCell(null)
  }

  function startEdit(id, field) {
    setEditingCell({ id, field })
  }

  // ---------------------------------------------------------------------------
  // Reassign modal (from context menu)
  // ---------------------------------------------------------------------------
  function handleRowReassignConfirm() {
    if (!reassignTo) return
    applyOverride(reassignModal.subId, { assignee: reassignTo })
    toast.success('Reassigned', `Submission reassigned to ${reassignTo}.`)
    setReassignModal({ open: false, subId: '', current: '' })
  }

  // ---------------------------------------------------------------------------
  // Priority popover
  // ---------------------------------------------------------------------------
  function handlePriorityChange(id, newPriority) {
    applyOverride(id, { priority: newPriority })
    toast.success('Priority updated', `Priority set to ${newPriority}.`)
    setPriorityPopover({ open: false, subId: '', current: '' })
  }

  // ---------------------------------------------------------------------------
  // Context menu direct actions
  // ---------------------------------------------------------------------------
  function handleMarkUrgent(row) {
    applyOverride(row.id, { priority: 'HIGH' })
    toast.warning('Marked as urgent', `${row.submissionNumber} priority set to HIGH.`)
  }

  function handleExportRow(row) {
    toast.info('Row exported', `${row.submissionNumber} exported.`)
  }

  // ---------------------------------------------------------------------------
  // Saved filter preset handlers (Batch A #4)
  // ---------------------------------------------------------------------------
  function activatePreset(presetId) {
    // Toggle off if already active
    if (activePreset === presetId) {
      setActivePreset(null)
      setFilters(defaultFilters)
      setStage(null)
      return
    }
    const preset = [...PRESET_FILTERS, ...savedFilters].find(p => p.id === presetId)
    if (!preset) return
    setActivePreset(presetId)
    setStage(null)
    setFilters(preset.apply())
  }

  function handleSaveFilter() {
    const name = saveFilterName.trim()
    if (!name) return
    const id = `custom-${Date.now()}`
    const snapshot = { ...filters }
    setSavedFilters(prev => [
      ...prev,
      { id, label: name, apply: () => ({ ...snapshot }) },
    ])
    toast.success('Filter saved', `"${name}" added to your filter presets.`)
    setSaveFilterModal(false)
    setSaveFilterName('')
  }

  // ---------------------------------------------------------------------------
  // Bulk export CSV with column selector (Batch A #5)
  // ---------------------------------------------------------------------------
  function handleExportCSV() {
    const selectedCols = EXPORT_COLUMNS.filter(c => exportColKeys.has(c.key))
    const rowsToExport = selectedIds.size > 0
      ? filtered.filter(s => selectedIds.has(s.id))
      : filtered
    const header = selectedCols.map(c => c.label)
    const rows = rowsToExport.map(s =>
      selectedCols.map(c => (s[c.key] != null ? String(s[c.key]) : ''))
    )
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `submissions-${TODAY.toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export ready', `${rowsToExport.length} row(s) downloaded.`)
    setExportModal(false)
  }

  function toggleExportCol(key) {
    setExportColKeys(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  // ---------------------------------------------------------------------------
  // Renewal batch action (Batch J #8)
  // ---------------------------------------------------------------------------
  function handleStartRenewals() {
    toast.success(
      'Renewals initiated',
      `${selectedRenewalCount} renewal submission(s) initiated.`
    )
  }

  // ---------------------------------------------------------------------------
  // Column definitions — inside useMemo so they stay reactive to cell-edit state
  // ---------------------------------------------------------------------------
  const COLUMNS = useMemo(() => {
    const cols = [
      // ── Checkbox ──────────────────────────────────────────────────────────
      {
        key: 'select',
        header: '',
        render: (_, row) => (
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-stone-300 text-ink-600 cursor-pointer"
            checked={selectedIds.has(row.id)}
            onClick={e => e.stopPropagation()}
            onChange={() => setSelectedIds(prev => {
              const n = new Set(prev)
              n.has(row.id) ? n.delete(row.id) : n.add(row.id)
              return n
            })}
          />
        ),
      },
      // ── SN # ──────────────────────────────────────────────────────────────
      {
        key: 'submissionNumber',
        header: 'SN #',
        sortable: true,
        render: v => <span className="font-mono text-xs font-bold text-ink-700">{v}</span>,
      },
      // ── Priority — inline quick-edit (Batch A #1) ──────────────────────
      {
        key: 'priority',
        header: 'Pri',
        sortable: true,
        render: (v, row) => {
          if (editingCell && editingCell.id === row.id && editingCell.field === 'priority') {
            return (
              <InlineSelect
                value={v}
                options={PRIORITIES}
                onCommit={val => commitEdit(row.id, 'priority', val)}
                onCancel={() => setEditingCell(null)}
              />
            )
          }
          return (
            <span
              onClick={e => { e.stopPropagation(); startEdit(row.id, 'priority') }}
              className="cursor-pointer hover:opacity-70 transition-opacity"
              title="Click to edit priority"
            >
              <PriorityBadge priority={v} />
            </span>
          )
        },
      },
      // ── Insured ───────────────────────────────────────────────────────────
      {
        key: 'insuredName',
        header: 'Insured',
        sortable: true,
        render: v => <span className="font-semibold text-stone-800 text-xs">{v}</span>,
      },
      // ── Agency ────────────────────────────────────────────────────────────
      {
        key: 'agencyName',
        header: 'Agency',
        sortable: true,
        render: v => <span className="text-stone-500 text-xs">{v}</span>,
      },
      // ── Type ──────────────────────────────────────────────────────────────
      {
        key: 'transactionType',
        header: 'Type',
        sortable: true,
        render: v => (
          <span className="text-[10px] font-semibold bg-ink-50 text-ink-700 px-2 py-0.5 rounded-full border border-ink-100 whitespace-nowrap">
            {v}
          </span>
        ),
      },
      // ── Stage ─────────────────────────────────────────────────────────────
      {
        key: 'status',
        header: 'Stage',
        sortable: true,
        render: v => <StatusBadge status={v} />,
      },
      // ── Eff Date ──────────────────────────────────────────────────────────
      {
        key: 'effectiveDate',
        header: 'Eff Date',
        sortable: true,
        render: v => <span className="text-xs font-mono text-stone-500">{v}</span>,
      },
      // ── Need By — colored chip (Batch J #6) ───────────────────────────────
      {
        key: 'needByDate',
        header: 'Need By',
        sortable: true,
        render: v => <NeedByChip dateStr={v} />,
      },
      // ── Days Left (Batch A #2) ────────────────────────────────────────────
      {
        key: '_daysRemaining',
        header: 'Days Left',
        sortable: false,
        render: (_, row) => <DaysRemainingCell dateStr={row.needByDate} />,
      },
      // ── Assignee — inline quick-edit (Batch A #1) ─────────────────────────
      {
        key: 'assignee',
        header: 'Owner',
        sortable: true,
        render: (v, row) => {
          if (editingCell && editingCell.id === row.id && editingCell.field === 'assignee') {
            return (
              <InlineSelect
                value={v}
                options={assignees}
                onCommit={val => commitEdit(row.id, 'assignee', val)}
                onCancel={() => setEditingCell(null)}
              />
            )
          }
          const initial = v && v[0] ? v[0].toUpperCase() : '?'
          return (
            <span
              onClick={e => { e.stopPropagation(); startEdit(row.id, 'assignee') }}
              className="flex items-center gap-1.5 cursor-pointer hover:bg-ink-50 rounded px-1 py-0.5 transition-colors"
              title="Click to reassign"
            >
              <span className="w-5 h-5 rounded-full bg-ink-700 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                {initial}
              </span>
              <span className="text-stone-500 text-xs">{v}</span>
            </span>
          )
        },
      },
    ]

    // Renewal Due column — injected right after Need By (Batch J #7)
    if (showRenewalDue) {
      const needByIdx = cols.findIndex(c => c.key === 'needByDate')
      const insertAt = needByIdx >= 0 ? needByIdx + 1 : cols.length
      cols.splice(insertAt, 0, {
        key: '_renewalDue',
        header: 'Renewal Due',
        sortable: false,
        render: (_, row) => <RenewalDueChip expirationDateStr={row.expirationDate} />,
      })
    }

    // Context menu — always last column (Batch A #3)
    cols.push({
      key: '_actions',
      header: '',
      render: (_, row) => (
        <ContextMenu
          onView={() => navigate(`/submissions/${row.id}`)}
          onReassign={() => {
            setReassignModal({ open: true, subId: row.id, current: row.assignee || '' })
            setReassignTo(row.assignee || '')
          }}
          onChangePriority={() => setPriorityPopover({
            open: true,
            subId: row.id,
            current: row.priority,
          })}
          onExportRow={() => handleExportRow(row)}
          onMarkUrgent={() => handleMarkUrgent(row)}
        />
      ),
    })

    return cols
    // editingCell, selectedIds, showRenewalDue, submissionOverrides all affect cell rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCell, selectedIds, showRenewalDue, navigate, submissionOverrides])

  const allChips = [...PRESET_FILTERS, ...savedFilters]

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-[1400px] mx-auto space-y-4">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Submissions</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            All active GL policy submissions · {submissions.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
          <Button variant="cta" icon={Plus} size="sm" onClick={() => setModal(true)}>
            New Submission
          </Button>
        </div>
      </div>

      {/* ── Pipeline strip ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        <div className="flex items-stretch divide-x divide-stone-100">
          {PIPELINE.map((stage, i) => {
            const active = activeStage === stage.id
            return (
              <button
                key={stage.id}
                onClick={() => {
                  setStage(active ? null : stage.id)
                  setActivePreset(null)
                  if (!active) setFilters(defaultFilters)
                }}
                className={[
                  'flex-1 flex flex-col items-center py-4 px-2 relative transition-all group',
                  active ? 'bg-stone-50' : 'hover:bg-stone-25',
                ].join(' ')}
              >
                {i > 0 && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10">
                    <ArrowRight className="h-3 w-3 text-stone-300" />
                  </div>
                )}
                <div
                  className="text-2xl font-black leading-none mb-1 transition-transform group-hover:scale-110"
                  style={{ color: stage.color }}
                >
                  {stage.count}
                </div>
                <div className="text-[11px] font-semibold text-stone-500 group-hover:text-stone-800 transition-colors">
                  {stage.label}
                </div>
                <div
                  className="mt-1.5 w-1.5 h-1.5 rounded-full transition-colors"
                  style={{ backgroundColor: active ? stage.color : '#E7E5E4' }}
                />
              </button>
            )
          })}
        </div>
        {activeStage && (
          <div className="px-4 py-1.5 bg-ink-50 border-t border-ink-100 flex items-center justify-between">
            <span className="text-xs text-ink-700 font-medium">
              Stage: <span className="font-bold">{PIPELINE.find(p => p.id === activeStage)?.label}</span>
            </span>
            <button
              onClick={() => setStage(null)}
              className="text-xs text-ink-500 hover:text-ink-800 font-medium"
            >
              Clear ×
            </button>
          </div>
        )}
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">

        {/* Table toolbar */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-stone-100 bg-stone-25">
          <FileText className="h-4 w-4 text-ink-500 shrink-0" />
          <h2 className="text-sm font-bold text-stone-800 shrink-0">All Submissions</h2>
          <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full shrink-0">
            {filtered.length}
          </span>
          <div className="ml-2 flex-1 min-w-0">
            <SubmissionFilters
              filters={filters}
              onChange={f => {
                setFilters(f)
                setStage(null)
                setActivePreset(null)
              }}
            />
          </div>
        </div>

        {/* Saved filter chips (Batch A #4) */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-stone-100 bg-stone-25/50 flex-wrap">
          {allChips.map(chip => {
            const isActive = activePreset === chip.id
            return (
              <button
                key={chip.id}
                onClick={() => activatePreset(chip.id)}
                className={[
                  'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all',
                  isActive
                    ? 'bg-flame-50 text-flame-700 border-flame-500 ring-1 ring-flame-400'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400 hover:text-stone-700',
                ].join(' ')}
              >
                {chip.label}
              </button>
            )
          })}
          <button
            onClick={() => setSaveFilterModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-dashed border-stone-300 text-stone-400 hover:border-ink-400 hover:text-ink-600 transition-all"
          >
            <BookmarkPlus className="h-3 w-3" />
            Save Filter
          </button>
        </div>

        {/* Bulk action toolbar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 bg-ink-50 border-b border-ink-100">
            <span className="font-semibold text-ink-700 text-xs shrink-0">
              {selectedIds.size} selected
            </span>
            {selectedRenewalCount > 0 && (
              <Button size="xs" variant="cta" onClick={handleStartRenewals}>
                Start Renewals ({selectedRenewalCount})
              </Button>
            )}
            <Button size="xs" variant="secondary" onClick={() => setExportModal(true)}>
              Export Selected
            </Button>
            <Button size="xs" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        )}

        <Table
          columns={COLUMNS}
          data={filtered}
          defaultPageSize={25}
          onRowClick={row => navigate(`/submissions/${row.id}`)}
        />
      </div>

      {/* ── New Submission Modal ── */}
      <NewSubmissionModal open={modal} onClose={() => setModal(false)} onCreated={() => {}} />

      {/* ── Reassign Modal (context menu action) ── */}
      <Modal
        open={reassignModal.open}
        onClose={() => setReassignModal({ open: false, subId: '', current: '' })}
        title="Reassign Submission"
        subtitle={`Currently assigned to: ${reassignModal.current}`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReassignModal({ open: false, subId: '', current: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRowReassignConfirm}
              disabled={!reassignTo || reassignTo === reassignModal.current}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Reassign to"
            required
            options={assignees}
            value={reassignTo}
            onChange={setReassignTo}
            placeholder="Select assignee..."
          />
        </div>
      </Modal>

      {/* ── Priority Popover backdrop + popover (context menu action) ── */}
      {priorityPopover.open && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={() => setPriorityPopover({ open: false, subId: '', current: '' })}
          />
          <PriorityPopover
            currentPriority={priorityPopover.current}
            onSelect={p => handlePriorityChange(priorityPopover.subId, p)}
            onClose={() => setPriorityPopover({ open: false, subId: '', current: '' })}
          />
        </>
      )}

      {/* ── Save Filter Modal ── */}
      <Modal
        open={saveFilterModal}
        onClose={() => { setSaveFilterModal(false); setSaveFilterName('') }}
        title="Save Current Filter"
        subtitle="Name this preset to reuse it from the chips row."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSaveFilterModal(false); setSaveFilterName('') }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveFilter}
              disabled={!saveFilterName.trim()}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="form-label">
              Filter Name <span className="text-flame-500">*</span>
            </label>
            <input
              type="text"
              value={saveFilterName}
              onChange={e => setSaveFilterName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveFilter() }}
              placeholder="e.g. My High Priority Renewals"
              className="form-input w-full"
              autoFocus
            />
          </div>
          <p className="text-xs text-stone-400">
            The current filter state will be captured and saved as a chip above the table.
          </p>
        </div>
      </Modal>

      {/* ── Export Modal with column selector (Batch A #5) ── */}
      <Modal
        open={exportModal}
        onClose={() => setExportModal(false)}
        title="Export Submissions"
        subtitle={
          selectedIds.size > 0
            ? `Exporting ${selectedIds.size} selected row(s). Choose columns below.`
            : `Exporting all ${filtered.length} visible row(s). Choose columns below.`
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setExportModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleExportCSV}
              disabled={exportColKeys.size === 0}
            >
              Export CSV
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
              Select Columns
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExportColKeys(new Set(EXPORT_COLUMNS.map(c => c.key)))}
                className="text-[11px] text-ink-600 hover:underline font-medium"
              >
                All
              </button>
              <span className="text-stone-200 select-none">|</span>
              <button
                onClick={() => setExportColKeys(new Set())}
                className="text-[11px] text-stone-400 hover:underline font-medium"
              >
                None
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EXPORT_COLUMNS.map(col => (
              <label
                key={col.key}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={exportColKeys.has(col.key)}
                  onChange={() => toggleExportCol(col.key)}
                  className="w-4 h-4 rounded border-stone-300 accent-ink-600"
                />
                <span className="text-xs font-medium text-stone-700">{col.label}</span>
              </label>
            ))}
          </div>
          {exportColKeys.size === 0 && (
            <p className="text-xs text-crimson-600 text-center">
              Select at least one column to export.
            </p>
          )}
        </div>
      </Modal>

    </div>
  )
}
