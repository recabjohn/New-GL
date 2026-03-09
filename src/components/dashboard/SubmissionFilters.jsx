import { Search, X } from 'lucide-react'
import { assignees } from '../../data/mockData'

const PRIORITIES  = ['HIGH', 'MEDIUM', 'LOW']
const TX_TYPES    = ['NEW-BUSINESS', 'RENEWAL', 'ENDORSEMENT', 'AUDIT', 'CANCELLATION']
const STATUSES    = ['In Progress', 'Clearance', 'Offered', 'Registered', 'Bound', 'Cancelled']

const PRIORITY_COLORS = {
  HIGH:   'bg-crimson-600 text-white border-crimson-600',
  MEDIUM: 'bg-amber-500 text-white border-amber-500',
  LOW:    'bg-stone-500 text-white border-stone-500',
}

export default function SubmissionFilters({ filters, onChange }) {
  const set = (k, v) => onChange({ ...filters, [k]: v })
  const toggle = (k, v) => set(k, filters[k] === v ? '' : v)
  const hasFilters = Object.values(filters).some(v => v)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-stone-400" />
        <input
          type="text"
          placeholder="Search..."
          value={filters.search || ''}
          onChange={e => set('search', e.target.value)}
          className="pl-6 pr-3 py-1 text-xs border border-stone-200 rounded-md w-32 focus:outline-none focus:ring-1 focus:ring-ink-400 focus:border-ink-400 bg-stone-50 text-stone-700 placeholder-stone-400"
        />
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-stone-200" />

      {/* Priority chips */}
      {PRIORITIES.map(p => (
        <button
          key={p}
          onClick={() => toggle('priority', p)}
          className={[
            'px-2 py-0.5 text-[11px] font-bold rounded border transition-colors',
            filters.priority === p
              ? PRIORITY_COLORS[p]
              : 'bg-white text-stone-400 border-stone-200 hover:border-stone-400 hover:text-stone-600',
          ].join(' ')}
        >
          {p === 'HIGH' ? 'High' : p === 'MEDIUM' ? 'Med' : 'Low'}
        </button>
      ))}

      {/* Separator */}
      <div className="h-4 w-px bg-stone-200" />

      {/* Status select */}
      <select
        value={filters.status}
        onChange={e => set('status', e.target.value)}
        className="px-2 py-1 text-xs border border-stone-200 rounded-md bg-white text-stone-600 focus:outline-none focus:ring-1 focus:ring-ink-400 cursor-pointer"
      >
        <option value="">All Stages</option>
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Type select */}
      <select
        value={filters.transactionType}
        onChange={e => set('transactionType', e.target.value)}
        className="px-2 py-1 text-xs border border-stone-200 rounded-md bg-white text-stone-600 focus:outline-none focus:ring-1 focus:ring-ink-400 cursor-pointer"
      >
        <option value="">All Types</option>
        {TX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Assignee select */}
      <select
        value={filters.assignee}
        onChange={e => set('assignee', e.target.value)}
        className="px-2 py-1 text-xs border border-stone-200 rounded-md bg-white text-stone-600 focus:outline-none focus:ring-1 focus:ring-ink-400 cursor-pointer"
      >
        <option value="">All Owners</option>
        {assignees.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={() => onChange({ priority: '', transactionType: '', status: '', assignee: '', search: '' })}
          className="flex items-center gap-1 text-[11px] font-medium text-stone-400 hover:text-crimson-600 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  )
}
