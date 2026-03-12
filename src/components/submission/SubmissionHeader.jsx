import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronUp, ChevronDown, FileBarChart2, ShoppingCart } from 'lucide-react'
import Button from '../ui/Button'
import { StatusBadge, PriorityBadge } from '../ui/Badge'

const PRIORITY_BAR = {
  HIGH:   'bg-crimson-500',
  MEDIUM: 'bg-amber-500',
  LOW:    'bg-stone-300',
}

function StatChip({ label, value }) {
  return (
    <div className="text-center px-3 py-2 rounded-lg bg-stone-50 border border-stone-100 min-w-[76px]">
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-xs font-semibold font-mono text-stone-800 leading-tight">{value}</p>
    </div>
  )
}

function AssigneeAvatar({ name }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'UW'
  return (
    <div className="flex items-center gap-2">
      <div title={name} className="w-7 h-7 rounded-full bg-ink-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0 ring-2 ring-white ring-offset-0">
        {initials}
      </div>
      <span className="text-xs text-stone-500 hidden xl:block">{name}</span>
    </div>
  )
}

export default function SubmissionHeader({ submission, lobComplete = false }) {
  const navigate   = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const barColor   = PRIORITY_BAR[submission.priority] || PRIORITY_BAR.LOW

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
      {/* Priority accent bar */}
      <div className={`h-1 ${barColor}`} />

      <div className={collapsed ? 'px-4 py-1.5' : 'px-6 pt-3 pb-3'}>
        {/* Collapsed: compact single-line summary */}
        {collapsed ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[11px] font-bold text-ink-700 bg-ink-50 px-1.5 py-0.5 rounded shrink-0">{submission.submissionNumber}</span>
              <StatusBadge status={submission.status} />
              <span className="text-xs font-semibold text-stone-900 truncate">{submission.insuredName}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden md:inline text-[10px] text-stone-400">Eff <span className="font-semibold text-stone-700">{submission.effectiveDate || '—'}</span></span>
              <span className="hidden md:inline text-[10px] text-stone-400">Exp <span className="font-semibold text-stone-700">{submission.expirationDate || '—'}</span></span>
              {submission.assignee && <AssigneeAvatar name={submission.assignee} />}
              {lobComplete && (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" icon={FileBarChart2} onClick={() => navigate(`/submissions/${submission.id}/browse`)}>Rate</Button>
                  <Button variant="cta" size="sm" icon={ShoppingCart} onClick={() => navigate('/quotes/Q00-0014019-00')}>Quote</Button>
                </div>
              )}
              <button
                onClick={() => setCollapsed(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-ink-700 hover:bg-stone-100 transition-colors"
                aria-label="Expand header"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-xs text-stone-400 mb-3">
              <button onClick={() => navigate('/')} className="hover:text-ink-600 transition-colors">Dashboard</button>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <button onClick={() => navigate('/')} className="hover:text-ink-600 transition-colors">Submissions</button>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className="font-mono font-semibold text-ink-700">{submission.submissionNumber}</span>
            </nav>

            <div className="flex items-end justify-between gap-4 flex-wrap">
              {/* Left: identity */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs font-bold text-ink-700 bg-ink-50 px-2 py-0.5 rounded">{submission.submissionNumber}</span>
                  <StatusBadge status={submission.status} />
                  <PriorityBadge priority={submission.priority} />
                  {submission.transactionType && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                      {submission.transactionType}
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-stone-900 leading-tight">{submission.insuredName}</h1>
                <p className="text-sm text-stone-500 mt-0.5">
                  {submission.dba && <><span className="text-stone-700">{submission.dba}</span> · </>}
                  {submission.agencyName} · {submission.agentName}
                </p>
              </div>

              {/* Right: date chips + assignee + actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="hidden md:flex items-center gap-2">
                  <StatChip label="Effective" value={submission.effectiveDate || '—'} />
                  <StatChip label="Expiry"    value={submission.expirationDate || '—'} />
                  <StatChip label="Need By"   value={submission.needByDate || '—'} />
                </div>

                <div className="w-px h-8 bg-stone-200 hidden md:block" />

                {submission.assignee && <AssigneeAvatar name={submission.assignee} />}

                <div className="flex items-center gap-2">
                  {lobComplete && (
                    <>
                      <Button
                        variant="secondary" size="sm" icon={FileBarChart2}
                        onClick={() => navigate(`/submissions/${submission.id}/browse`)}
                      >Rate</Button>
                      <Button
                        variant="cta" size="sm" icon={ShoppingCart}
                        onClick={() => navigate('/quotes/Q00-0014019-00')}
                      >Quote</Button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setCollapsed(true)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-ink-700 hover:bg-stone-100 transition-colors"
                  aria-label="Collapse header"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
