import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, FileText, Clock, TrendingUp, CheckCircle2,
  ArrowRight, AlertCircle, CalendarCheck, Activity,
  ChevronRight, ArrowUpRight, ArrowDownRight, Target, X, Check, ListTodo,
} from 'lucide-react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Select from '../ui/Select'
import Table from '../ui/Table'
import { StatusBadge, PriorityBadge } from '../ui/Badge'
import SubmissionFilters from './SubmissionFilters'
import NewSubmissionModal from './NewSubmissionModal'
import { submissions, assignees } from '../../data/mockData'
import { useToast } from '../ui/Toast'

// ── Workflow Pipeline ────────────────────────────────────────────────────────
const PIPELINE = [
  { id: 'In Progress', label: 'New Submission', count: 7,  dot: '#2A5BAD' },
  { id: 'Clearance',   label: 'Clearance',      count: 4,  dot: '#D97706' },
  { id: 'Registered',  label: 'Rating',          count: 4,  dot: '#4879C2' },
  { id: 'Offered',     label: 'Quote',           count: 5,  dot: '#1AAD61' },
  { id: 'Bound',       label: 'Bind',            count: 2,  dot: '#F05A2A' },
  { id: 'Issued',      label: 'Issue',           count: 1,  dot: '#0E713E' },
]

// ── KPI cards ────────────────────────────────────────────────────────────────
const KPIS = [
  { label: 'Total Active',       value: '20',   delta: '+3',   trendUp: true,  positive: true, sub: 'vs last month',   icon: FileText,     color: 'text-ink-600',   bg: 'bg-ink-50'   },
  { label: 'Bound MTD',          value: '3',    delta: '+1',   trendUp: true,  positive: true, sub: 'vs September',    icon: CheckCircle2, color: 'text-sage-600',  bg: 'bg-sage-50'  },
  { label: 'Avg Days to Quote',  value: '4.2d', delta: '−0.8', trendUp: false, positive: true, sub: 'day improvement', icon: Clock,        color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Quote-to-Bind Rate', value: '76%',  delta: '+4%',  trendUp: true,  positive: true, sub: 'vs last quarter', icon: Target,       color: 'text-flame-600', bg: 'bg-flame-50' },
]

// ── Needs Attention ──────────────────────────────────────────────────────────
const ATTENTION = [
  { id: 'SN129106', name: 'Anchor Marine Supply',     issue: 'Clearance overdue 2 days',    sev: 'high'   },
  { id: 'SN129113', name: 'Westgate Bar & Grill',     issue: 'Quote expires in 24 hours',   sev: 'high'   },
  { id: 'SN129108', name: 'Summit Roofing Co.',        issue: 'Missing classification data', sev: 'medium' },
  { id: 'SN129120', name: 'Emerald Lawn & Landscape', issue: 'Need By date in 3 days',      sev: 'low'    },
]

// ── Recent Activity ──────────────────────────────────────────────────────────
const ACTIVITY = [
  { action: 'Quote generated',     sub: 'SN129122 — Redstone Welding',     time: '8m',  icon: TrendingUp,   color: 'text-sage-600'   },
  { action: 'Clearance approved',  sub: 'SN129119 — Northfield Bakery',    time: '22m', icon: CheckCircle2, color: 'text-sage-600'   },
  { action: 'New submission',      sub: 'SN129124 — Desert Sun Solar LLC', time: '1h',  icon: Plus,         color: 'text-ink-500'    },
  { action: 'Endorsement filed',   sub: 'SN129117 — TechBridge Solutions', time: '2h',  icon: FileText,     color: 'text-amber-600'  },
  { action: 'Clearance requested', sub: 'SN129120 — Emerald Lawn',         time: '3h',  icon: AlertCircle,  color: 'text-crimson-500' },
]

const getSnFromSub = sub => {
  const match = sub.match(/SN\d+/)
  return match ? match[0] : null
}

const defaultFilters = { priority: '', transactionType: '', status: '', assignee: '', search: '' }

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const toast = useToast()

  const [filters, setFilters]   = useState(defaultFilters)
  const [modal, setModal]       = useState(false)
  const [activeStage, setStage] = useState(null)
  const [, forceUpdate]         = useState(0)

  // ── Bulk Action state ──
  const [selectedIds, setSelectedIds]         = useState(new Set())
  const [bulkReassignOpen, setBulkReassignOpen] = useState(false)
  const [bulkAssignee, setBulkAssignee]         = useState('')

  // ── Row-level reassign state ──
  const [submissionOverrides, setSubmissionOverrides] = useState({})
  const [reassignModal, setReassignModal] = useState({ open: false, subId: '', current: '' })
  const [reassignTo, setReassignTo]       = useState('')

  // ── Dismiss alerts state ──
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set())

  // ── Export format modal state ──
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportFormat, setExportFormat]       = useState('csv')

  // ── My Tasks state ──
  const [tasks, setTasks] = useState([
    { id: 1, sn: 'SN129106', desc: 'Follow up on clearance docs',    type: 'Follow-up',       due: '03/07/2026', priority: 'HIGH'   },
    { id: 2, sn: 'SN129108', desc: 'Request loss runs from agent',   type: 'Document Request', due: '03/08/2026', priority: 'HIGH'   },
    { id: 3, sn: 'SN129113', desc: 'Review classification codes',    type: 'Review',           due: '03/10/2026', priority: 'MEDIUM' },
    { id: 4, sn: 'SN129120', desc: 'Call agent re: premium increase', type: 'Call',             due: '03/12/2026', priority: 'LOW'    },
  ])
  const [completedToday, setCompletedToday]     = useState(0)
  const [strikingTask, setStrikingTask]         = useState(null)
  const [addTaskOpen, setAddTaskOpen]           = useState(false)
  const [newTaskSn, setNewTaskSn]               = useState('')
  const [newTaskType, setNewTaskType]           = useState('')
  const [newTaskDue, setNewTaskDue]             = useState('')
  const [newTaskNote, setNewTaskNote]           = useState('')
  const [taskFormErrors, setTaskFormErrors]     = useState({})

  const handleCompleteTask = (taskId) => {
    setStrikingTask(taskId)
    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setCompletedToday(n => n + 1)
      setStrikingTask(null)
      toast.success('Task completed', '')
    }, 600)
  }

  const handleAddTask = () => {
    const errors = {}
    if (!newTaskSn.trim())   errors.sn   = true
    if (!newTaskType)        errors.type = true
    if (Object.keys(errors).length) { setTaskFormErrors(errors); return }
    const id = Date.now()
    const formatDue = newTaskDue
      ? newTaskDue.split('-').slice(1).concat(newTaskDue.split('-')[0]).join('/')
      : ''
    setTasks(prev => [
      { id, sn: newTaskSn.trim(), desc: newTaskNote.trim() || newTaskType, type: newTaskType, due: formatDue, priority: 'MEDIUM' },
      ...prev,
    ])
    toast.success('Task added', '')
    setNewTaskSn('')
    setNewTaskType('')
    setNewTaskDue('')
    setNewTaskNote('')
    setTaskFormErrors({})
    setAddTaskOpen(false)
  }

  const TASK_TYPES = ['Follow-up', 'Document Request', 'Review', 'Call', 'Other']
  const SN_LIST = Array.from({ length: 21 }, (_, i) => `SN${129105 + i}`)

  const merged = activeStage ? { ...filters, status: activeStage } : filters

  const filtered = useMemo(() => {
    let data = [...submissions]
    if (merged.priority)        data = data.filter(s => s.priority === merged.priority)
    if (merged.transactionType) data = data.filter(s => s.transactionType === merged.transactionType)
    if (merged.status)          data = data.filter(s => s.status === merged.status)
    if (merged.assignee)        data = data.filter(s => s.assignee === merged.assignee)
    if (merged.search)          data = data.filter(s =>
      s.insuredName.toLowerCase().includes(merged.search.toLowerCase()) ||
      s.submissionNumber.toLowerCase().includes(merged.search.toLowerCase()) ||
      s.agencyName.toLowerCase().includes(merged.search.toLowerCase())
    )
    return data
  }, [merged])

  // Apply per-row overrides (reassignments) on top of filtered data
  const mergedSubmissions = filtered.map(s => ({ ...s, ...submissionOverrides[s.id] }))

  // ── Export helpers ──
  const handleExport = () => {
    const headers = ['SN #', 'Insured', 'Agency', 'Type', 'Status', 'Effective Date', 'Need By', 'Assignee', 'Priority']
    const rows = filtered.map(s => [s.submissionNumber, s.insuredName, s.agencyName, s.transactionType, s.status, s.effectiveDate, s.needByDate, s.assignee, s.priority])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `submissions-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `submissions-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportConfirm = async () => {
    await new Promise(r => setTimeout(r, 800))
    if (exportFormat === 'csv') {
      handleExport()
    } else {
      handleExportJson()
    }
    toast.success('Export ready', 'File downloading.')
    setExportModalOpen(false)
  }

  // ── Bulk reassign confirm ──
  const handleBulkReassignConfirm = async () => {
    if (!bulkAssignee) return
    await new Promise(r => setTimeout(r, 800))
    const count = selectedIds.size
    setSubmissionOverrides(prev => {
      const next = { ...prev }
      selectedIds.forEach(id => {
        next[id] = { ...next[id], assignee: bulkAssignee }
      })
      return next
    })
    toast.success('Bulk Reassigned', `${count} submissions reassigned to ${bulkAssignee}.`)
    setSelectedIds(new Set())
    setBulkAssignee('')
    setBulkReassignOpen(false)
  }

  // ── Bulk export (selected rows only) ──
  const handleBulkExport = () => {
    const selectedRows = mergedSubmissions.filter(s => selectedIds.has(s.id))
    const headers = ['SN #', 'Insured', 'Agency', 'Type', 'Status', 'Effective Date', 'Need By', 'Assignee', 'Priority']
    const rows = selectedRows.map(s => [s.submissionNumber, s.insuredName, s.agencyName, s.transactionType, s.status, s.effectiveDate, s.needByDate, s.assignee, s.priority])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `selected-submissions-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export ready', `${selectedRows.length} submissions exported.`)
  }

  // ── Row-level reassign confirm ──
  const handleRowReassignConfirm = async () => {
    await new Promise(r => setTimeout(r, 800))
    setSubmissionOverrides(prev => ({
      ...prev,
      [reassignModal.subId]: { ...prev[reassignModal.subId], assignee: reassignTo },
    }))
    toast.success('Reassigned', `Submission reassigned to ${reassignTo}.`)
    setReassignModal({ open: false, subId: '', current: '' })
  }

  // ── Visible attention items (after dismissals) ──
  const visibleAttention = ATTENTION.filter(item => !dismissedAlerts.has(item.id))

  // ── COLUMNS (with checkbox + reassignable owner) ──────────────────────────
  const COLUMNS = [
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
    { key: 'submissionNumber', header: 'SN #', sortable: true,
      render: v => <span className="font-mono text-xs font-bold text-ink-700">{v}</span> },
    { key: 'priority', header: 'Pri', sortable: true,
      render: v => <PriorityBadge priority={v} /> },
    { key: 'insuredName', header: 'Insured', sortable: true,
      render: v => <span className="font-semibold text-stone-800 text-xs">{v}</span> },
    { key: 'agencyName', header: 'Agency', sortable: true,
      render: v => <span className="text-stone-500 text-xs">{v}</span> },
    { key: 'transactionType', header: 'Type', sortable: true,
      render: v => (
        <span className="text-[10px] font-semibold bg-ink-50 text-ink-700 px-2 py-0.5 rounded-full border border-ink-100 whitespace-nowrap">
          {v}
        </span>
      ) },
    { key: 'status', header: 'Stage', sortable: true,
      render: v => <StatusBadge status={v} /> },
    { key: 'effectiveDate', header: 'Eff Date', sortable: true,
      render: v => <span className="text-xs font-mono text-stone-500">{v}</span> },
    { key: 'needByDate', header: 'Need By', sortable: true,
      render: v => <span className="text-xs font-mono text-stone-500">{v}</span> },
    {
      key: 'assignee',
      header: 'Owner',
      sortable: true,
      render: (v, row) => (
        <span
          className="flex items-center gap-1.5 cursor-pointer hover:bg-ink-50 rounded px-1 py-0.5 transition-colors"
          onClick={e => {
            e.stopPropagation()
            setReassignModal({ open: true, subId: row.id, current: row.assignee })
            setReassignTo(row.assignee)
          }}
        >
          <span className="w-5 h-5 rounded-full bg-ink-700 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
            {v[0].toUpperCase()}
          </span>
          <span className="text-stone-500 text-xs">{v}</span>
        </span>
      ),
    },
  ]

  return (
    <div className="max-w-[1600px] mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Underwriting Dashboard</h1>
          
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Export
          </button>
          <Button variant="cta" icon={Plus} size="sm" onClick={() => setModal(true)}>
            New Submission
          </Button>
        </div>
      </div>

      {/* ── Workflow Pipeline ── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card mb-4 overflow-hidden">
        <div className="flex items-stretch divide-x divide-stone-100">
          {PIPELINE.map((stage, i) => {
            const active = activeStage === stage.id
            return (
              <button
                key={stage.id}
                onClick={() => setStage(active ? null : stage.id)}
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
                  className="text-3xl font-black leading-none mb-1 transition-transform group-hover:scale-110"
                  style={{ color: stage.dot }}
                >
                  {stage.count}
                </div>
                <div className="text-[11px] font-semibold text-stone-500 group-hover:text-stone-800 transition-colors">
                  {stage.label}
                </div>
                <div
                  className="mt-1.5 w-1.5 h-1.5 rounded-full transition-colors"
                  style={{ backgroundColor: active ? stage.dot : '#E7E5E4' }}
                />
              </button>
            )
          })}
        </div>
        {activeStage && (
          <div className="px-4 py-1.5 bg-ink-50 border-t border-ink-100 flex items-center justify-between">
            <span className="text-xs text-ink-700 font-medium">
              Stage filter: <span className="font-bold">{PIPELINE.find(p => p.id === activeStage)?.label}</span>
            </span>
            <button onClick={() => setStage(null)} className="text-xs text-ink-500 hover:text-ink-800 font-medium">
              Clear ×
            </button>
          </div>
        )}
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {KPIS.map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-stone-200 shadow-card px-5 py-4 hover:shadow-elevated transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`${k.bg} p-2 rounded-lg`}>
                <k.icon className={`h-4 w-4 ${k.color}`} />
              </div>
              <span className={[
                'flex items-center gap-0.5 text-[11px] font-bold',
                k.positive ? 'text-sage-600' : 'text-crimson-600',
              ].join(' ')}>
                {k.trendUp
                  ? <ArrowUpRight className="h-3.5 w-3.5" />
                  : <ArrowDownRight className="h-3.5 w-3.5" />}
                {k.delta}
              </span>
            </div>
            <p className="text-2xl font-black text-stone-900 tracking-tight font-mono">{k.value}</p>
            <p className="text-xs font-semibold text-stone-500 mt-0.5">{k.label}</p>
            <p className="text-[10px] text-stone-300 mt-0.5 uppercase tracking-wide">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main: table + right panel ── */}
      <div className="flex gap-4 items-start">

        {/* Submissions table */}
        <div className="flex-1 min-w-0 bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-2.5 border-b border-stone-100 bg-stone-25">
            <h2 className="text-sm font-bold text-stone-800 shrink-0">Submissions</h2>
            <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full shrink-0">
              {filtered.length}
            </span>
            <div className="ml-2">
              <SubmissionFilters
                filters={filters}
                onChange={f => { setFilters(f); setStage(null) }}
              />
            </div>
          </div>

          {/* ── Bulk Action Toolbar ── */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-ink-50 border-b border-ink-100 text-sm">
              <span className="font-semibold text-ink-700">{selectedIds.size} selected</span>
              <Button size="xs" variant="secondary" onClick={() => setBulkReassignOpen(true)}>Reassign</Button>
              <Button size="xs" variant="secondary" onClick={handleBulkExport}>Export Selected</Button>
              <Button size="xs" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Button>
            </div>
          )}

          <Table
            columns={COLUMNS}
            data={mergedSubmissions}
            defaultPageSize={25}
            onRowClick={row => navigate(`/submissions/${row.id}`)}
          />
        </div>

        {/* ── Right panel ── */}
        <div className="w-[264px] shrink-0 space-y-3">

          {/* Needs Attention */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-crimson-100 bg-crimson-50">
              <AlertCircle className="h-3.5 w-3.5 text-crimson-600 shrink-0" />
              <h3 className="text-[11px] font-bold text-crimson-800 uppercase tracking-wide">Needs Attention</h3>
              <span className="ml-auto text-[10px] font-bold text-white bg-crimson-600 w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                {visibleAttention.length}
              </span>
            </div>
            <div className="divide-y divide-stone-50">
              {visibleAttention.length === 0 ? (
                <p className="px-4 py-4 text-xs text-stone-400 text-center">No alerts at this time.</p>
              ) : visibleAttention.map(item => (
                <div
                  key={item.id}
                  className="w-full flex items-start gap-2.5 px-4 py-2.5 hover:bg-stone-25 text-left transition-colors group"
                >
                  <button
                    className="mt-1 w-2 h-2 rounded-full shrink-0 focus:outline-none"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'default' }}
                    tabIndex={-1}
                    aria-hidden
                  >
                    <span className={[
                      'block w-2 h-2 rounded-full',
                      item.sev === 'high' ? 'bg-crimson-500' : item.sev === 'medium' ? 'bg-amber-400' : 'bg-stone-300',
                    ].join(' ')} />
                  </button>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/submissions/${item.id}`)}
                  >
                    <p className="text-[11px] font-semibold text-stone-800 truncate group-hover:text-ink-700">{item.name}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5 leading-snug">{item.issue}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDismissedAlerts(prev => new Set([...prev, item.id]))
                      toast.info('Alert dismissed', '')
                    }}
                    className="ml-auto p-0.5 rounded hover:bg-crimson-100 text-stone-400 hover:text-crimson-600"
                    title="Dismiss"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Due This Week */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100">
              <CalendarCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Due This Week</h3>
            </div>
            <div className="px-3 py-1.5 space-y-0.5">
              {submissions.filter(s => s.priority === 'HIGH').slice(0, 4).map(s => (
                <button
                  key={s.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50 transition-colors text-left group"
                  onClick={() => navigate(`/submissions/${s.id}`)}
                >
                  <PriorityBadge priority={s.priority} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-stone-700 truncate group-hover:text-ink-700">{s.insuredName}</p>
                    <p className="text-[10px] font-mono text-stone-400">{s.submissionNumber}</p>
                  </div>
                  <span className="text-[10px] text-stone-300 shrink-0 font-mono">{s.needByDate.slice(0, 5)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100">
              <Activity className="h-3.5 w-3.5 text-ink-500 shrink-0" />
              <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">Recent Activity</h3>
            </div>
            <div className="divide-y divide-stone-50">
              {ACTIVITY.map((a, i) => {
                const snId = getSnFromSub(a.sub)
                const inner = (
                  <>
                    <div className="bg-stone-50 p-1 rounded-md mt-0.5 shrink-0">
                      <a.icon className={`h-3 w-3 ${a.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-stone-700">{a.action}</p>
                      <p className="text-[10px] text-stone-400 truncate">{a.sub}</p>
                    </div>
                    <span className="text-[10px] text-stone-300 shrink-0 font-mono whitespace-nowrap">{a.time}</span>
                  </>
                )
                return snId ? (
                  <button
                    key={i}
                    className="w-full flex items-start gap-2.5 px-4 py-2.5 hover:bg-stone-25 text-left transition-colors"
                    onClick={() => navigate('/submissions/' + snId)}
                  >
                    {inner}
                  </button>
                ) : (
                  <div key={i} className="flex items-start gap-2.5 px-4 py-2.5">
                    {inner}
                  </div>
                )
              })}
            </div>
          </div>

          {/* My Tasks */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100">
              <ListTodo className="h-3.5 w-3.5 text-ink-500 shrink-0" />
              <h3 className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">My Tasks</h3>
              {tasks.length > 0 && (
                <span className="ml-auto text-[10px] font-bold text-white bg-ink-600 w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                  {tasks.length}
                </span>
              )}
            </div>

            <div className="divide-y divide-stone-50">
              {tasks.length === 0 ? (
                <p className="px-4 py-4 text-xs text-stone-400 text-center">No tasks remaining.</p>
              ) : tasks.map(task => (
                <div key={task.id} className="flex items-start gap-2 px-3 py-2.5 group hover:bg-stone-25 transition-colors">
                  {/* Priority dot */}
                  <span
                    className={[
                      'mt-1.5 w-1.5 h-1.5 rounded-full shrink-0',
                      task.priority === 'HIGH'   ? 'bg-crimson-500' :
                      task.priority === 'MEDIUM' ? 'bg-amber-400'   : 'bg-stone-400',
                    ].join(' ')}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="font-mono text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded shrink-0 cursor-pointer hover:text-ink-700 hover:bg-stone-200 transition-colors"
                        onClick={() => navigate('/submissions/' + task.sn)}
                      >
                        {task.sn}
                      </span>
                    </div>
                    <p className={[
                      'text-[11px] text-stone-800 leading-snug',
                      strikingTask === task.id ? 'line-through text-stone-400' : '',
                    ].join(' ')}>
                      {task.desc}
                    </p>
                    <p className="text-[10px] font-mono text-stone-400 mt-0.5">{task.due}</p>
                  </div>
                  {/* Complete button */}
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    title="Mark complete"
                    className="mt-0.5 shrink-0 w-5 h-5 rounded-full border border-stone-200 hover:border-sage-400 hover:bg-sage-50 flex items-center justify-center text-stone-300 hover:text-sage-600 transition-all"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer: completed count + add task */}
            <div className="px-3 py-2.5 border-t border-stone-100 bg-stone-25 flex items-center justify-between">
              <span className="text-[10px] text-stone-400">
                Completed today: <span className="font-mono font-semibold text-stone-600">{completedToday}</span>
              </span>
              <button
                onClick={() => setAddTaskOpen(true)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-600 hover:text-ink-800 hover:bg-ink-50 px-2 py-1 rounded transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add Task
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── New Submission Modal ── */}
      <NewSubmissionModal
        open={modal}
        onClose={() => setModal(false)}
        onCreated={() => forceUpdate(n => n + 1)}
      />

      {/* ── Bulk Reassign Modal ── */}
      <Modal
        open={bulkReassignOpen}
        onClose={() => setBulkReassignOpen(false)}
        title="Bulk Reassign"
        subtitle={`Reassign ${selectedIds.size} selected submission${selectedIds.size !== 1 ? 's' : ''} to a new owner.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setBulkReassignOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleBulkReassignConfirm}
              loading={false}
              disabled={!bulkAssignee}
            >
              Reassign
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            label="Assign to"
            required
            options={assignees}
            value={bulkAssignee}
            onChange={setBulkAssignee}
            placeholder="Select assignee..."
          />
        </div>
      </Modal>

      {/* ── Row-level Reassign Modal ── */}
      <Modal
        open={reassignModal.open}
        onClose={() => setReassignModal({ open: false, subId: '', current: '' })}
        title="Reassign Submission"
        subtitle={`Currently assigned to: ${reassignModal.current}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setReassignModal({ open: false, subId: '', current: '' })}>Cancel</Button>
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

      {/* ── Export Format Modal ── */}
      <Modal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Submissions"
        subtitle="Choose the file format for your export."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setExportModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleExportConfirm}>
              Download
            </Button>
          </>
        }
      >
        <div className="flex gap-3">
          <button
            onClick={() => setExportFormat('csv')}
            className={[
              'flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all',
              exportFormat === 'csv'
                ? 'border-flame-400 bg-flame-50 text-flame-700'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300',
            ].join(' ')}
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm font-semibold">CSV</span>
            <span className="text-[10px] text-current opacity-70">Spreadsheet format</span>
          </button>
          <button
            onClick={() => setExportFormat('json')}
            className={[
              'flex-1 flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all',
              exportFormat === 'json'
                ? 'border-flame-400 bg-flame-50 text-flame-700'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300',
            ].join(' ')}
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm font-semibold">JSON</span>
            <span className="text-[10px] text-current opacity-70">Raw data format</span>
          </button>
        </div>
      </Modal>

      {/* ── Add Task Modal ── */}
      <Modal
        open={addTaskOpen}
        onClose={() => {
          setAddTaskOpen(false)
          setNewTaskSn('')
          setNewTaskType('')
          setNewTaskDue('')
          setNewTaskNote('')
          setTaskFormErrors({})
        }}
        title="Add Task"
        subtitle="Create a new task linked to a submission."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAddTaskOpen(false)
                setNewTaskSn('')
                setNewTaskType('')
                setNewTaskDue('')
                setNewTaskNote('')
                setTaskFormErrors({})
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleAddTask}>
              Add Task
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* SN# field with datalist */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Submission # <span className="text-flame-500">*</span>
            </label>
            <input
              list="task-sn-list"
              value={newTaskSn}
              onChange={e => { setNewTaskSn(e.target.value); setTaskFormErrors(p => ({ ...p, sn: false })) }}
              placeholder="e.g. SN129105"
              className={[
                'w-full border rounded-lg px-3 py-2 text-sm font-mono text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-300',
                taskFormErrors.sn ? 'border-crimson-400 bg-crimson-50' : 'border-stone-200',
              ].join(' ')}
            />
            <datalist id="task-sn-list">
              {SN_LIST.map(sn => <option key={sn} value={sn} />)}
            </datalist>
            {taskFormErrors.sn && (
              <p className="text-[11px] text-crimson-600 mt-1">Submission # is required.</p>
            )}
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Task Type <span className="text-flame-500">*</span>
            </label>
            <select
              value={newTaskType}
              onChange={e => { setNewTaskType(e.target.value); setTaskFormErrors(p => ({ ...p, type: false })) }}
              className={[
                'w-full border rounded-lg px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-ink-300',
                taskFormErrors.type ? 'border-crimson-400 bg-crimson-50' : 'border-stone-200',
              ].join(' ')}
            >
              <option value="">Select type...</option>
              {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {taskFormErrors.type && (
              <p className="text-[11px] text-crimson-600 mt-1">Task type is required.</p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Due Date</label>
            <input
              type="date"
              value={newTaskDue}
              onChange={e => setNewTaskDue(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 font-mono focus:outline-none focus:ring-2 focus:ring-ink-300"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Note <span className="text-stone-400 font-normal">(optional)</span></label>
            <textarea
              value={newTaskNote}
              onChange={e => setNewTaskNote(e.target.value)}
              placeholder="Describe the task..."
              rows={3}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300"
            />
          </div>
        </div>
      </Modal>

    </div>
  )
}
