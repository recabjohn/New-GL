import { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import SubmissionHeader from './SubmissionHeader'
import ClearanceTab from './ClearanceTab'
import AccountTab from './AccountTab'
import LOBTab from './lob/LOBTab'
import { submissions, claims } from '../../data/mockData'
import { Check, BarChart2, Shield } from 'lucide-react'

// ---------------------------------------------------------------------------
// Mock quote versions (only for SN129105)
// ---------------------------------------------------------------------------
const QUOTE_VERSIONS = [
  { id: 'Q00-0014019-00', version: 'v1 (current)', status: 'Offered',  date: '03/05/2026', premium: '$486.00' },
  { id: 'Q00-0014019-01', version: 'v2',           status: 'Declined', date: '02/28/2026', premium: '$512.00' },
  { id: 'Q00-0014019-02', version: 'v3',           status: 'Draft',    date: '02/20/2026', premium: '$498.00' },
]

// ---------------------------------------------------------------------------
// Status badge colour helpers
// ---------------------------------------------------------------------------
function quoteStatusBadge(status) {
  if (status === 'Offered')  return 'bg-sage-100 text-sage-700'
  if (status === 'Declined') return 'bg-crimson-100 text-crimson-700'
  return 'bg-stone-100 text-stone-600'
}

function claimStatusBadge(status) {
  if (status === 'Closed')         return 'bg-sage-100 text-sage-700'
  if (status === 'Open')           return 'bg-crimson-100 text-crimson-700'
  if (status === 'In Investigation') return 'bg-amber-100 text-amber-700'
  return 'bg-stone-100 text-stone-600'
}

// ---------------------------------------------------------------------------
// Quotes tab
// ---------------------------------------------------------------------------
function QuotesTab({ submissionId }) {
  const navigate = useNavigate()
  const isTarget = submissionId === 'SN129105'

  if (!isTarget) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
        <BarChart2 className="h-10 w-10 text-stone-200" />
        <p className="text-sm font-semibold text-stone-500">No quotes yet.</p>
        <p className="text-xs text-stone-400 max-w-xs">
          Complete all steps to generate a quote.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-800">
          Quote Versions —{' '}
          <span className="font-mono text-ink-700">{submissionId}</span>
        </h3>
        <span className="font-mono text-xs text-stone-500">{QUOTE_VERSIONS.length} versions</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Quote ID', 'Version', 'Status', 'Date', 'Premium', 'Action'].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {QUOTE_VERSIONS.map(q => (
                <tr key={q.id} className="hover:bg-stone-25 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-ink-700">
                    {q.id}
                  </td>
                  <td className="px-4 py-3 text-stone-700 text-xs">{q.version}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${quoteStatusBadge(q.status)}`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{q.date}</td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-stone-800">
                    {q.premium}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/quotes/${q.id}`)}
                      className="text-xs font-medium text-ink-700 hover:text-ink-800 border border-ink-200 hover:border-ink-300 bg-ink-50 hover:bg-ink-100 px-2.5 py-1 rounded-md transition-colors"
                    >
                      View Quote
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Claims tab
// ---------------------------------------------------------------------------
function ClaimsTab({ submissionId }) {
  const submissionClaims = claims.filter(c => c.submissionId === submissionId)

  if (submissionClaims.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
        <Shield className="h-10 w-10 text-sage-400" />
        <p className="text-sm font-semibold text-stone-500">No open claims</p>
        <p className="text-xs text-stone-400">No claims on record for this submission.</p>
      </div>
    )
  }

  const totalReserve = submissionClaims.reduce((sum, c) => sum + c.reserve, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-800">
          {submissionClaims.length} Claims —{' '}
          <span className="font-mono text-ink-700">{submissionId}</span>
        </h3>
      </div>

      <div className="overflow-hidden rounded-xl border border-stone-200 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Claim #', 'Date of Loss', 'Type', 'Status', 'Reserve', 'Paid', 'Claimant'].map(h => (
                  <th
                    key={h}
                    className={[
                      'px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap',
                      h === 'Reserve' || h === 'Paid' ? 'text-right' : 'text-left',
                    ].join(' ')}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {submissionClaims.map(c => (
                <tr key={c.id} className="hover:bg-stone-25 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-ink-700">
                    {c.id}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{c.date}</td>
                  <td className="px-4 py-3 text-stone-700 text-xs">{c.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${claimStatusBadge(c.status)}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-800 text-right">
                    ${c.reserve.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-800 text-right">
                    ${c.paid.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-stone-700 text-xs">{c.claimant}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-stone-50 border-t border-stone-200">
                <td colSpan={4} className="px-4 py-3 text-xs font-bold text-stone-700 text-right">
                  Total Reserve
                </td>
                <td className="px-4 py-3 font-mono text-xs font-bold text-ink-800 text-right">
                  ${totalReserve.toLocaleString()}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// GL Lifecycle Timeline — shown in a side card on every tab if desired,
// but per spec it lives alongside the Clearance tab content area.
// We expose it as a named component so ClearanceTab can import it,
// but for Batch G we render it directly inside SubmissionDetail when
// the clearance tab is active (wrapping the existing ClearanceTab output
// with a sidebar panel).
// ---------------------------------------------------------------------------

// 8-step lifecycle timeline for SN129105
const TIMELINE_STEPS = [
  { label: 'Registered',       timestamp: '03/01/2026 09:15 AM', done: true,  current: false },
  { label: 'Clearance Check',  timestamp: '03/02/2026 10:30 AM', done: true,  current: false },
  { label: 'Account Setup',    timestamp: '03/03/2026 02:14 PM', done: false, current: true  },
  { label: 'GL Policy Input',  timestamp: null,                  done: false, current: false },
  { label: 'Rated',            timestamp: null,                  done: false, current: false },
  { label: 'Quoted',           timestamp: null,                  done: false, current: false },
  { label: 'Bound',            timestamp: null,                  done: false, current: false },
  { label: 'Issued',           timestamp: null,                  done: false, current: false },
]

function LifecycleTimeline({ submissionId }) {
  const steps = submissionId === 'SN129105' ? TIMELINE_STEPS : TIMELINE_STEPS.map((s, i) => ({
    ...s,
    done: false,
    current: i === 0,
    timestamp: i === 0 ? '03/06/2026 09:00 AM' : null,
  }))

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-card">
      <div className="px-4 py-3 border-b border-stone-100">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">
          Progress
        </span>
      </div>
      <div className="p-4">
        <div className="space-y-0">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-start gap-3">
              {/* Icon column */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className={[
                    'w-5 h-5 rounded-full flex items-center justify-center',
                    s.done
                      ? 'bg-sage-500'
                      : s.current
                        ? 'bg-ink-400 animate-pulse'
                        : 'bg-stone-100 border border-stone-200',
                  ].join(' ')}
                >
                  {s.done ? (
                    <Check className="h-3 w-3 text-white" />
                  ) : s.current ? (
                    <span className="w-2 h-2 rounded-full bg-white block" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 block" />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-px flex-1 mt-0.5 mb-0.5 min-h-[20px] ${s.done ? 'bg-sage-300' : 'bg-stone-200'}`}
                  />
                )}
              </div>

              {/* Text column */}
              <div className="pb-3 min-w-0">
                <p
                  className={[
                    'text-xs font-semibold leading-tight',
                    s.done
                      ? 'text-sage-700'
                      : s.current
                        ? 'text-ink-600'
                        : 'text-stone-400',
                  ].join(' ')}
                >
                  {s.label}
                  {s.current && (
                    <span className="ml-1.5 text-[9px] font-bold uppercase tracking-widest text-ink-600 bg-ink-50 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </p>
                {s.timestamp ? (
                  <p className="font-mono text-[10px] text-stone-400 mt-0.5">{s.timestamp}</p>
                ) : (
                  <p className="text-[10px] text-stone-300 mt-0.5">Pending</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Clearance tab wrapper — injects the lifecycle timeline as a right panel
// ---------------------------------------------------------------------------
function ClearanceWithTimeline({ submission, onNext }) {
  return (
    <div className="relative">
      {/* Render the existing ClearanceTab */}
      <ClearanceTab submission={submission} onNext={onNext} />

      {/* Lifecycle timeline floated to the right — we inject it as an
          absolutely-positioned sticky sidebar that overlays the right column.
          Because ClearanceTab already uses a 3-col grid internally, we add
          the timeline as an additional floating card anchored top-right of
          the outer container so it doesn't conflict with interior layout. */}
      <div className="mt-4">
        <LifecycleTimeline submissionId={submission?.id} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------
const TABS = [
  { id: 'clearance', label: 'Clearance', step: 1 },
  { id: 'account',   label: 'Account',   step: 2 },
  { id: 'lob',       label: 'LOB',       step: 3 },
  { id: 'quotes',    label: 'Quotes',    step: null },
  { id: 'claims',    label: 'Claims',    step: null },
]

// ---------------------------------------------------------------------------
// SubmissionDetail
// ---------------------------------------------------------------------------
export default function SubmissionDetail() {
  const { id }  = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'clearance'
  const [lobComplete, setLobComplete] = useState(false)

  const submission   = submissions.find(s => s.id === id) || submissions[0]
  const currentIndex = TABS.findIndex(t => t.id === tab)

  const changeTab = t => {
    setSearchParams({ tab: t })
    document.getElementById('main-scroll-area')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      <SubmissionHeader submission={submission} lobComplete={lobComplete} />

      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        {/* Tab bar with step indicators */}
        <div className="flex border-b border-stone-100 overflow-x-auto">
          {TABS.map((t, idx) => {
            const isActive = tab === t.id
            // A "done" step is one of the first 3 workflow tabs that comes before current
            const isWorkflowStep = t.step !== null
            const isDone = isWorkflowStep && idx < currentIndex && currentIndex <= 2
            return (
              <button
                key={t.id}
                onClick={() => changeTab(t.id)}
                className={[
                  'flex items-center gap-2.5 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
                  isActive
                    ? 'text-ink-800 border-ink-700 bg-ink-50/30'
                    : 'text-stone-500 border-transparent hover:text-stone-700 hover:bg-stone-50',
                ].join(' ')}
              >
                {isWorkflowStep ? (
                  <span
                    className={[
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors',
                      isActive
                        ? 'bg-ink-700 text-white'
                        : isDone
                          ? 'bg-sage-500 text-white'
                          : 'bg-stone-100 text-stone-400',
                    ].join(' ')}
                  >
                    {isDone ? <Check className="h-3 w-3" /> : t.step}
                  </span>
                ) : null}
                {t.label}
              </button>
            )
          })}
        </div>

        <div key={tab} className="p-6 animate-fade-in">
          {tab === 'clearance' && (
            <ClearanceWithTimeline submission={submission} onNext={() => changeTab('account')} />
          )}
          {tab === 'account' && <AccountTab />}
          {tab === 'lob'     && <LOBTab onComplete={() => setLobComplete(true)} />}
          {tab === 'quotes'  && <QuotesTab submissionId={submission?.id} />}
          {tab === 'claims'  && <ClaimsTab submissionId={submission?.id} />}
        </div>
      </div>
    </div>
  )
}
