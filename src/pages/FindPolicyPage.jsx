import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, ChevronDown, ChevronUp, Download, ExternalLink,
  FileText, Clock, Link2, Plus, Eye, GitCompare, Copy, Flag,
  X, CheckCircle2, Calendar, ShieldCheck, Building2, User,
} from 'lucide-react'
import Button from '../components/ui/Button'
import { StatusBadge, PriorityBadge } from '../components/ui/Badge'
import SlideOver from '../components/ui/SlideOver'
import Modal from '../components/ui/Modal'
import { useToast } from '../components/ui/Toast'
import { submissions } from '../data/mockData'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CHIPS = ['All', 'Active', 'Quoted', 'Bound']

const STATUS_MAP = {
  All:    null,
  Active: ['In Progress', 'Clearance', 'Registered'],
  Quoted: ['Offered'],
  Bound:  ['Bound', 'Issued'],
}

const QUICK_LINKS = [
  { label: 'New Submission',  href: '/submissions/new',  icon: Plus },
  { label: 'Clearance Queue', href: '/?stage=Clearance', icon: Clock },
  { label: 'All Documents',   href: '/documents',        icon: FileText },
]

// Mock timeline events shown in the SlideOver timeline tab
function buildTimeline(row) {
  return [
    { event: 'Submission Received',   date: row.createdDate || '03/01/2026',     icon: FileText,     color: 'text-ink-500',     bg: 'bg-ink-50'    },
    { event: 'Clearance Completed',   date: '03/02/2026',                        icon: CheckCircle2, color: 'text-sage-600',    bg: 'bg-sage-50'   },
    { event: 'Account Setup Saved',   date: '03/03/2026',                        icon: Building2,    color: 'text-ink-500',     bg: 'bg-ink-50'    },
    { event: 'Quote Generated',       date: '03/04/2026',                        icon: ShieldCheck,  color: 'text-amber-600',   bg: 'bg-amber-50'  },
    { event: 'Quote Offered to Agent', date: '03/05/2026',                       icon: User,         color: 'text-flame-600',   bg: 'bg-flame-50'  },
  ]
}

// ---------------------------------------------------------------------------
// CSV export helper
// ---------------------------------------------------------------------------

function exportCSV(rows) {
  const headers = ['SN #', 'Insured Name', 'Agency', 'Type', 'Status', 'Effective Date', 'Need By', 'Assignee']
  const body = rows.map(r => [
    r.submissionNumber, r.insuredName, r.agencyName,
    r.transactionType, r.status, r.effectiveDate,
    r.needByDate, r.assignee,
  ])
  const csv = [headers, ...body].map(row => row.map(v => '"' + (v || '') + '"').join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'policy-search-' + new Date().toISOString().slice(0, 10) + '.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Policy SlideOver (Details + Timeline sub-tabs)
// ---------------------------------------------------------------------------

function PolicySlideOver({ open, policy, onClose }) {
  const navigate   = useNavigate()
  const [tab, setTab] = useState('details')

  if (!policy) return null

  const timeline = buildTimeline(policy)

  const detailFields = [
    { label: 'Submission #',    value: policy.submissionNumber, mono: true  },
    { label: 'Status',          value: policy.status,           badge: true },
    { label: 'Agency',          value: policy.agencyName                    },
    { label: 'Agent',           value: policy.agentName                     },
    { label: 'Transaction',     value: policy.transactionType,  mono: true  },
    { label: 'Priority',        value: policy.priority,         priority: true },
    { label: 'Effective Date',  value: policy.effectiveDate,    mono: true  },
    { label: 'Expiration Date', value: policy.expirationDate,   mono: true  },
    { label: 'Need By',         value: policy.needByDate,       mono: true  },
    { label: 'Assignee',        value: policy.assignee,         mono: true  },
    { label: 'Created',         value: policy.createdDate,      mono: true  },
  ]

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={policy.submissionNumber}
      subtitle={policy.insuredName}
      width="max-w-md"
      footer={
        <Button
          variant="primary"
          size="sm"
          icon={ExternalLink}
          onClick={() => { onClose(); navigate('/submissions/' + policy.id) }}
        >
          View Full Submission
        </Button>
      }
    >
      {/* Sub-tab selector */}
      <div className="flex gap-1 mb-5 bg-stone-100 rounded-lg p-0.5">
        {['details', 'timeline'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-1.5 text-xs font-semibold rounded-md capitalize transition-all duration-150',
              tab === t
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {tab === 'details' && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {detailFields.map(f => (
            <div key={f.label}>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{f.label}</p>
              {f.badge ? (
                <StatusBadge status={f.value} />
              ) : f.priority ? (
                <PriorityBadge priority={f.value} />
              ) : (
                <p className={'text-sm text-stone-800 ' + (f.mono ? 'font-mono' : '')}>
                  {f.value || '\u2014'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Timeline tab */}
      {tab === 'timeline' && (
        <div className="space-y-0">
          {timeline.map((item, i) => {
            const Icon = item.icon
            const isLast = i === timeline.length - 1
            return (
              <div key={i} className="flex gap-3">
                {/* Icon + vertical line */}
                <div className="flex flex-col items-center">
                  <div className={item.bg + ' w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-2 ring-white'}>
                    <Icon className={'h-4 w-4 ' + item.color} />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-stone-200 my-1" />}
                </div>
                {/* Content */}
                <div className={'pb-5 ' + (isLast ? '' : '')}>
                  <p className="text-sm font-semibold text-stone-800 leading-tight">{item.event}</p>
                  <p className="text-xs font-mono text-stone-400 mt-0.5">{item.date}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SlideOver>
  )
}

// ---------------------------------------------------------------------------
// Compare Modal — side-by-side policy columns
// ---------------------------------------------------------------------------

const COMPARE_FIELDS = [
  { label: 'SN #',           key: 'submissionNumber', mono: true  },
  { label: 'Insured',        key: 'insuredName'                   },
  { label: 'Status',         key: 'status',           badge: true },
  { label: 'Agency',         key: 'agencyName'                    },
  { label: 'Agent',          key: 'agentName'                     },
  { label: 'Transaction',    key: 'transactionType',  mono: true  },
  { label: 'Priority',       key: 'priority',         priority: true },
  { label: 'Effective Date', key: 'effectiveDate',    mono: true  },
  { label: 'Expiry Date',    key: 'expirationDate',   mono: true  },
  { label: 'Assignee',       key: 'assignee',         mono: true  },
  { label: 'State / Zip',    key: null                            },
]

function CompareModal({ open, onClose, policies }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={'Comparing ' + policies.length + ' Policies'}
      subtitle="Side-by-side policy comparison"
      size="xl"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest w-32 bg-stone-50 border-b border-stone-100">
                Field
              </th>
              {policies.map(p => (
                <th
                  key={p.id}
                  className="px-3 py-2 text-left text-[10px] font-bold text-ink-700 uppercase tracking-widest bg-ink-50 border-b border-ink-100"
                >
                  <p className="font-mono">{p.submissionNumber}</p>
                  <p className="text-stone-500 font-normal normal-case mt-0.5 truncate max-w-[140px]">{p.insuredName}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {COMPARE_FIELDS.map(f => (
              <tr key={f.label} className="hover:bg-stone-25">
                <td className="px-3 py-2.5 font-semibold text-stone-500 bg-stone-25 whitespace-nowrap">
                  {f.label}
                </td>
                {policies.map(p => {
                  const val = f.key ? p[f.key] : '—'
                  return (
                    <td key={p.id} className="px-3 py-2.5 text-stone-800">
                      {f.badge ? (
                        <StatusBadge status={val} />
                      ) : f.priority ? (
                        <PriorityBadge priority={val} />
                      ) : (
                        <span className={f.mono ? 'font-mono' : ''}>{val || '—'}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function FindPolicyPage() {
  const navigate = useNavigate()
  const toast    = useToast()

  // Search state
  const [searchQuery, setSearchQuery]   = useState('')
  const [activeChip, setActiveChip]     = useState('All')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [hasSearched, setHasSearched]   = useState(false)

  // Live search history (max 8 entries, prepend on each search)
  const [searchHistory, setSearchHistory] = useState([])

  // Advanced filter state
  const [agencyFilter, setAgencyFilter]         = useState('')
  const [agentFilter, setAgentFilter]           = useState('')
  const [effDateFrom, setEffDateFrom]           = useState('')
  const [effDateTo, setEffDateTo]               = useState('')
  const [priorityFilter, setPriorityFilter]     = useState('')
  const [transactionFilter, setTransactionFilter] = useState('')

  // SlideOver
  const [slideOver, setSlideOver] = useState({ open: false, policy: null })

  // Row-level state
  const [compareIds, setCompareIds] = useState(new Set())    // ids selected for comparison
  const [flaggedIds, setFlaggedIds] = useState(new Set())    // ids that are flagged (amber border)

  // Compare modal
  const [compareModalOpen, setCompareModalOpen] = useState(false)

  // ---------------------------------------------------------------------------
  // Derived filtered results
  // ---------------------------------------------------------------------------

  const filtered = useMemo(() => {
    if (!hasSearched) return submissions

    let data = [...submissions]

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      data = data.filter(s =>
        s.submissionNumber.toLowerCase().includes(q) ||
        s.insuredName.toLowerCase().includes(q) ||
        s.agencyName.toLowerCase().includes(q)
      )
    }

    const statuses = STATUS_MAP[activeChip]
    if (statuses) {
      data = data.filter(s => statuses.includes(s.status))
    }

    if (agencyFilter.trim()) {
      data = data.filter(s => s.agencyName.toLowerCase().includes(agencyFilter.trim().toLowerCase()))
    }
    if (agentFilter.trim()) {
      data = data.filter(s => s.agentName.toLowerCase().includes(agentFilter.trim().toLowerCase()))
    }
    if (priorityFilter) {
      data = data.filter(s => s.priority === priorityFilter)
    }
    if (transactionFilter) {
      data = data.filter(s => s.transactionType === transactionFilter)
    }
    if (effDateFrom) {
      data = data.filter(s => s.effectiveDate >= effDateFrom)
    }
    if (effDateTo) {
      data = data.filter(s => s.effectiveDate <= effDateTo)
    }

    return data
  }, [hasSearched, searchQuery, activeChip, agencyFilter, agentFilter, effDateFrom, effDateTo, priorityFilter, transactionFilter])

  // Policies selected for comparison
  const comparePolicies = filtered.filter(r => compareIds.has(r.id))

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function executeSearch(query) {
    const q = (query !== undefined ? query : searchQuery).trim()
    setHasSearched(true)
    if (q) {
      setSearchHistory(prev => {
        const without = prev.filter(h => h !== q)
        return [q, ...without].slice(0, 8)
      })
    }
  }

  function handleSearch() {
    executeSearch()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') executeSearch()
  }

  function applyHistoryItem(term) {
    setSearchQuery(term)
    setHasSearched(true)
    // re-add to front of history on re-use
    setSearchHistory(prev => {
      const without = prev.filter(h => h !== term)
      return [term, ...without].slice(0, 8)
    })
  }

  function resetAll() {
    setSearchQuery('')
    setActiveChip('All')
    setAgencyFilter('')
    setAgentFilter('')
    setEffDateFrom('')
    setEffDateTo('')
    setPriorityFilter('')
    setTransactionFilter('')
    setHasSearched(false)
  }

  function handleRowClick(row) {
    setSlideOver({ open: true, policy: row })
  }

  function toggleCompare(id, e) {
    e.stopPropagation()
    setCompareIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleFlag(id, e) {
    e.stopPropagation()
    setFlaggedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleCopySN(sn, e) {
    e.stopPropagation()
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sn).then(() => {
        toast.success(sn + ' copied', 'Submission number copied to clipboard.')
      }).catch(() => {
        toast.error('Copy failed', 'Could not copy to clipboard.')
      })
    } else {
      // Fallback for environments without clipboard API
      toast.info('Copy', sn + ' — use Ctrl+C to copy.')
    }
  }

  function clearCompare() {
    setCompareIds(new Set())
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-[1400px] mx-auto">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Find Policy</h1>
          <p className="text-sm text-stone-400 mt-0.5">Search active, bound, and expired policies</p>
        </div>
      </div>

      {/* ── Layout: main column (3/4) + sidebar (1/4) ───────────────────────── */}
      <div className="flex gap-4 items-start">

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Search Hero Card */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100 bg-gradient-to-r from-ink-700 to-ink-800">
              <h2 className="text-base font-bold text-white">Policy Search</h2>
              <p className="text-xs text-ink-200 mt-0.5">Search by policy number, insured name, or submission number</p>
            </div>

            <div className="p-6 space-y-5">

              {/* Main search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Policy # \u00b7 Insured name \u00b7 Submission # (e.g. SN129106)"
                  className="w-full pl-11 pr-4 py-3 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 shadow-sm placeholder:text-stone-400 text-stone-800 bg-stone-25 transition"
                />
              </div>

              {/* Status quick-filter chips */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest shrink-0">Filter by</span>
                <div className="flex gap-1.5 flex-wrap">
                  {STATUS_CHIPS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => setActiveChip(chip)}
                      className={[
                        'px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150',
                        activeChip === chip
                          ? 'bg-ink-700 text-white border-ink-700 shadow-sm'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-ink-300 hover:text-ink-700',
                      ].join(' ')}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Search collapsible */}
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setAdvancedOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-stone-25 hover:bg-stone-50 transition-colors select-none text-left"
                >
                  <span className="text-xs font-bold text-stone-600 uppercase tracking-widest">Advanced Search</span>
                  {advancedOpen
                    ? <ChevronUp className="h-4 w-4 text-stone-400" />
                    : <ChevronDown className="h-4 w-4 text-stone-400" />
                  }
                </button>

                {advancedOpen && (
                  <div className="px-4 pb-4 pt-3 space-y-4 bg-white border-t border-stone-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Agency Name</label>
                        <input
                          type="text"
                          value={agencyFilter}
                          onChange={e => setAgencyFilter(e.target.value)}
                          placeholder="e.g. Pacific Crest Insurance"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Agent Name</label>
                        <input
                          type="text"
                          value={agentFilter}
                          onChange={e => setAgentFilter(e.target.value)}
                          placeholder="e.g. Sarah Okonkwo"
                          className="form-input"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Effective Date From</label>
                        <input
                          type="date"
                          value={effDateFrom}
                          onChange={e => setEffDateFrom(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="form-label">Effective Date To</label>
                        <input
                          type="date"
                          value={effDateTo}
                          onChange={e => setEffDateTo(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Priority</label>
                        <select
                          value={priorityFilter}
                          onChange={e => setPriorityFilter(e.target.value)}
                          className="form-input"
                        >
                          <option value="">All Priorities</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="LOW">LOW</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Transaction Type</label>
                        <select
                          value={transactionFilter}
                          onChange={e => setTransactionFilter(e.target.value)}
                          className="form-input"
                        >
                          <option value="">All Types</option>
                          <option value="NEW-BUSINESS">NEW-BUSINESS</option>
                          <option value="RENEWAL">RENEWAL</option>
                          <option value="ENDORSEMENT">ENDORSEMENT</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search button row */}
              <div className="flex gap-2">
                <Button
                  variant="cta"
                  size="md"
                  icon={Search}
                  className="flex-1"
                  onClick={handleSearch}
                >
                  Search Policies
                </Button>
                {hasSearched && (
                  <button
                    onClick={resetAll}
                    className="px-4 py-2 text-sm font-medium text-stone-500 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:text-stone-700 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* ── Results Table ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-25">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-stone-800">Results</h2>
                <span className="text-xs font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''} found
                </span>
                {compareIds.size > 0 && (
                  <span className="text-xs font-semibold text-ink-700 bg-ink-50 px-2 py-0.5 rounded-full">
                    {compareIds.size} selected
                  </span>
                )}
              </div>
              <button
                onClick={() => exportCSV(filtered)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-100 text-sm">
                <thead className="bg-stone-25">
                  <tr>
                    {/* Checkbox column header */}
                    <th className="pl-4 pr-2 py-3 w-8">
                      <span className="sr-only">Select</span>
                    </th>
                    {['SN #', 'Insured Name', 'Agency', 'Type', 'Status', 'Effective Date', 'Need By', 'Assignee', 'Actions'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-stone-200" />
                          <p className="text-sm text-stone-400 font-medium">No policies match your search</p>
                          <p className="text-xs text-stone-300">Try adjusting your filters or search terms</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.map((row, i) => {
                    const isCompared = compareIds.has(row.id)
                    const isFlagged  = flaggedIds.has(row.id)

                    return (
                      <tr
                        key={row.id}
                        onClick={() => handleRowClick(row)}
                        className={[
                          'cursor-pointer transition-colors duration-100 hover:bg-ink-25 group',
                          i % 2 === 1 ? 'bg-stone-25/40' : '',
                          isCompared ? 'bg-ink-25' : '',
                          isFlagged  ? 'border-l-2 border-amber-400' : '',
                        ].join(' ')}
                      >
                        {/* Checkbox */}
                        <td className="pl-4 pr-2 py-3 w-8" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isCompared}
                            onChange={e => toggleCompare(row.id, e)}
                            className="rounded border-stone-300 text-ink-600 focus:ring-ink-400 cursor-pointer"
                          />
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-ink-700 group-hover:text-ink-900">
                            {row.submissionNumber}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <p className="text-xs font-semibold text-stone-800">{row.insuredName}</p>
                            {row.dba && row.dba !== row.insuredName && (
                              <p className="text-[10px] text-stone-400 mt-0.5">DBA: {row.dba}</p>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <p className="text-xs text-stone-600">{row.agencyName}</p>
                            <p className="text-[10px] text-stone-400 mt-0.5">{row.agentName}</p>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-[10px] font-semibold bg-ink-50 text-ink-700 px-2 py-0.5 rounded-full border border-ink-100 whitespace-nowrap">
                            {row.transactionType}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={row.status} />
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-mono text-stone-500">{row.effectiveDate || '\u2014'}</span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-mono text-stone-500">{row.needByDate || '\u2014'}</span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-ink-700 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                              {row.assignee[0].toUpperCase()}
                            </span>
                            <span className="text-xs text-stone-500">{row.assignee}</span>
                          </span>
                        </td>

                        {/* Quick Actions column */}
                        <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {/* Eye — navigate to submission */}
                            <div className="relative group/tip">
                              <button
                                onClick={() => navigate('/submissions/' + row.id)}
                                className="p-1.5 rounded-md text-stone-400 hover:text-ink-700 hover:bg-ink-50 transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] font-semibold bg-stone-800 text-white rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-10">
                                View submission
                              </span>
                            </div>

                            {/* GitCompare — toggle compare */}
                            <div className="relative group/tip">
                              <button
                                onClick={e => toggleCompare(row.id, e)}
                                className={'p-1.5 rounded-md transition-colors ' + (isCompared ? 'text-ink-700 bg-ink-100' : 'text-stone-400 hover:text-ink-700 hover:bg-ink-50')}
                              >
                                <GitCompare className="h-3.5 w-3.5" />
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] font-semibold bg-stone-800 text-white rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-10">
                                {isCompared ? 'Remove from compare' : 'Add to compare'}
                              </span>
                            </div>

                            {/* Copy — copy SN# to clipboard */}
                            <div className="relative group/tip">
                              <button
                                onClick={e => handleCopySN(row.submissionNumber, e)}
                                className="p-1.5 rounded-md text-stone-400 hover:text-ink-700 hover:bg-ink-50 transition-colors"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] font-semibold bg-stone-800 text-white rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-10">
                                Copy SN#
                              </span>
                            </div>

                            {/* Flag — toggle amber flag */}
                            <div className="relative group/tip">
                              <button
                                onClick={e => toggleFlag(row.id, e)}
                                className={'p-1.5 rounded-md transition-colors ' + (isFlagged ? 'text-amber-600 bg-amber-50' : 'text-stone-400 hover:text-amber-600 hover:bg-amber-50')}
                              >
                                <Flag className="h-3.5 w-3.5" />
                              </button>
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[10px] font-semibold bg-stone-800 text-white rounded whitespace-nowrap opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-10">
                                {isFlagged ? 'Unflag' : 'Flag row'}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between">
                <p className="text-xs text-stone-400">Showing all {filtered.length} results</p>
                <p className="text-[10px] text-stone-300 font-mono">GL \u00b7 Commercial Lines \u00b7 March 2026</p>
              </div>
            )}
          </div>

        </div>

        {/* ── Right Sidebar ──────────────────────────────────────────────────── */}
        <div className="w-64 shrink-0 space-y-3">

          {/* Search History (dynamic, replaces static list) */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100 bg-stone-25">
              <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Recent Searches</h3>
            </div>
            <div className="py-1">
              {searchHistory.length === 0 ? (
                <p className="px-4 py-3 text-xs text-stone-300 italic">No searches yet</p>
              ) : searchHistory.map((term, i) => (
                <button
                  key={i}
                  onClick={() => applyHistoryItem(term)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-stone-25 text-left transition-colors group"
                >
                  <Clock className="h-3 w-3 text-stone-300 group-hover:text-ink-400 shrink-0 transition-colors" />
                  <span className="flex-1 text-xs font-medium text-stone-700 truncate group-hover:text-ink-700 transition-colors">
                    {term}
                  </span>
                  <Search className="h-3 w-3 text-stone-200 group-hover:text-ink-300 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100 bg-stone-25">
              <Link2 className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              <h3 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Quick Links</h3>
            </div>
            <div className="py-1">
              {QUICK_LINKS.map((link, i) => (
                <button
                  key={i}
                  onClick={() => navigate(link.href)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-25 text-left transition-colors group"
                >
                  <div className="w-6 h-6 bg-ink-50 rounded-md flex items-center justify-center shrink-0">
                    <link.icon className="h-3.5 w-3.5 text-ink-600" />
                  </div>
                  <span className="text-xs font-medium text-stone-700 group-hover:text-ink-700 transition-colors">
                    {link.label}
                  </span>
                  <ExternalLink className="h-3 w-3 text-stone-300 ml-auto group-hover:text-ink-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Search Tips */}
          <div className="bg-ink-50 rounded-xl border border-ink-100 p-4">
            <p className="text-[10px] font-bold text-ink-700 uppercase tracking-widest mb-2">Search Tips</p>
            <ul className="space-y-1.5">
              {[
                'Use SN# for exact match',
                'Partial insured name works',
                'Agency name is case-insensitive',
                'Use Advanced Search for date ranges',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[10px] text-ink-600 leading-snug">
                  <span className="mt-0.5 w-1 h-1 rounded-full bg-ink-400 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Policy Detail SlideOver ──────────────────────────────────────────── */}
      <PolicySlideOver
        open={slideOver.open}
        policy={slideOver.policy}
        onClose={() => setSlideOver({ open: false, policy: null })}
      />

      {/* ── Comparison Mode floating bar ─────────────────────────────────────── */}
      {compareIds.size >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-3 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-modal">
            <GitCompare className="h-4 w-4 text-ink-300 shrink-0" />
            <span className="text-sm font-semibold">
              Comparing {compareIds.size} {compareIds.size === 1 ? 'policy' : 'policies'}
            </span>
            <div className="flex gap-2 ml-2">
              <button
                onClick={() => setCompareModalOpen(true)}
                className="px-3 py-1.5 bg-flame-500 hover:bg-flame-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Compare
              </button>
              <button
                onClick={clearCompare}
                className="p-1.5 text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Compare Modal ────────────────────────────────────────────────────── */}
      <CompareModal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        policies={comparePolicies}
      />

    </div>
  )
}
