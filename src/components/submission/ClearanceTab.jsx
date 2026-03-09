import { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useToast } from '../ui/Toast'
import { agencies } from '../../data/mockData'
import {
  ShieldCheck, AlertTriangle, Search, CheckCircle2, CircleDot, ArrowRight,
  Flag,
} from 'lucide-react'

const agentsByAgency = {
  'Hawthorne Risk Advisors, LLC': ['Michael Grant', 'Rebecca Torres'],
  'Pacific Crest Insurance':       ['Sarah Okonkwo', 'David Park'],
  'Meridian Specialty Lines':      ['Carlos Reyes', 'Janet Wu'],
  'Apex Commercial Risk':          ['Lisa Tran', 'Steven Moore'],
  'Greenfield Risk Partners':      ['Omar Hassan', 'Megan Bell'],
  'Coastal Commercial Group':      ['Priya Sharma', 'Andre Jackson'],
}

// ─── Workflow Timeline ────────────────────────────────────────────────────────

function WorkflowTimeline({ result }) {
  const steps = [
    { label: 'Submission Received', done: true,                   active: false },
    { label: 'Clearance Check',     done: result === 'cleared',   active: !result },
    { label: 'Proceed to Account',  done: false,                  active: result === 'cleared' },
  ]
  return (
    <div>
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={[
              'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
              s.done ? 'bg-sage-500' : s.active ? 'bg-flame-400 animate-pulse' : 'bg-stone-100 border border-stone-200',
            ].join(' ')}>
              {s.done
                ? <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                : s.active
                  ? <CircleDot className="h-3.5 w-3.5 text-white" />
                  : <span className="w-2 h-2 rounded-full bg-stone-300 block" />
              }
            </div>
            {i < steps.length - 1 && (
              <div className={`w-px h-7 mt-0.5 mb-0.5 ${s.done ? 'bg-sage-300' : 'bg-stone-200'}`} />
            )}
          </div>
          <p className={`text-xs font-medium pt-1 ${s.done ? 'text-sage-700' : s.active ? 'text-flame-600' : 'text-stone-400'}`}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Risk Assessment Score Panel ──────────────────────────────────────────────

const RISK_DIMENSIONS = [
  { label: 'Business Stability',   score: 80 },
  { label: 'Loss History',         score: 65 },
  { label: 'Exposure Type',        score: 70 },
  { label: 'Agency Relationship',  score: 90 },
  { label: 'Geographic Risk',      score: 55 },
]

function scoreColor(score) {
  if (score >= 70) return 'bg-sage-400'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-crimson-400'
}

function scoreLabel(score) {
  if (score >= 80) return { text: 'Low Risk',        classes: 'bg-sage-100 text-sage-700'    }
  if (score >= 60) return { text: 'Acceptable Risk', classes: 'bg-sage-100 text-sage-700'    }
  if (score >= 40) return { text: 'Moderate Risk',   classes: 'bg-amber-100 text-amber-700'  }
  return               { text: 'High Risk',          classes: 'bg-crimson-100 text-crimson-700' }
}

function RiskAssessmentPanel() {
  const OVERALL = 72
  const { text, classes } = scoreLabel(OVERALL)

  return (
    <Card title="Risk Assessment Score" actions={
      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${classes}`}>
        {text}
      </span>
    }>
      <div className="flex items-end gap-3 mb-5">
        <span className="font-mono text-4xl font-black text-ink-800">{OVERALL}</span>
        <span className="font-mono text-lg text-stone-400 mb-1">/ 100</span>
      </div>

      <div className="space-y-3">
        {RISK_DIMENSIONS.map(({ label, score }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-stone-600">{label}</span>
              <span className="font-mono text-xs font-semibold text-stone-700">{score}</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${scoreColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Flag for Manual Review Panel ────────────────────────────────────────────

function FlagForReviewPanel() {
  const toast = useToast()
  const [isFlagged, setIsFlagged] = useState(false)
  const [flagNotes, setFlagNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSaveFlag = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    toast.success('Submission flagged', 'Submission flagged for manual review.')
  }

  return (
    <Card title="Manual Review">
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsFlagged(f => !f)}
          className={[
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150',
            isFlagged
              ? 'bg-crimson-600 text-white border-crimson-600 hover:bg-crimson-700'
              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50',
          ].join(' ')}
        >
          <Flag className="h-4 w-4" />
          {isFlagged ? 'Flagged for Review' : 'Flag for Manual Review'}
        </button>

        {isFlagged && (
          <div className="space-y-2">
            <textarea
              value={flagNotes}
              onChange={e => setFlagNotes(e.target.value)}
              placeholder="Reason for manual review..."
              rows={3}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300"
            />
            <div className="flex justify-end">
              <Button
                variant="danger"
                size="sm"
                loading={saving}
                onClick={handleSaveFlag}
              >
                Save Flag
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Prior Policy Lookup ──────────────────────────────────────────────────────

const MOCK_PRIOR_POLICIES = [
  { carrier: 'Travelers',  policyNum: 'TRV-00192841', effective: '10/01/2025', premium: '$1,240.00', status: 'Expired' },
  { carrier: 'Hartford',   policyNum: 'HFD-00748291', effective: '10/01/2024', premium: '$980.00',   status: 'Expired' },
]

function PriorPolicyLookup() {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setResults(null)
    await new Promise(r => setTimeout(r, 1000))
    setSearching(false)
    setResults(MOCK_PRIOR_POLICIES)
  }

  const handleUse = policy => {
    toast.success('Prior policy imported', `${policy.carrier} policy ${policy.policyNum} has been imported.`)
  }

  return (
    <Card title="Prior Policy Lookup">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Enter FEIN or Policy #..."
          className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-300"
        />
        <Button
          variant="secondary"
          size="sm"
          icon={Search}
          loading={searching}
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {results !== null && (
        results.length === 0 ? (
          <p className="text-sm text-stone-400 py-3 text-center">No prior policies found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-100">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  {['Carrier', 'Policy #', 'Effective', 'Premium', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {results.map(p => (
                  <tr key={p.policyNum} className="hover:bg-stone-25">
                    <td className="px-3 py-2.5 font-medium text-stone-800">{p.carrier}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-stone-600">{p.policyNum}</td>
                    <td className="px-3 py-2.5 text-stone-500">{p.effective}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-stone-700">{p.premium}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => handleUse(p)}
                        className="text-xs font-medium text-ink-700 hover:text-ink-800 border border-ink-200 hover:border-ink-300 bg-ink-50 hover:bg-ink-100 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Use This
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </Card>
  )
}

// ─── Market Intelligence Panel ────────────────────────────────────────────────

function MarketIntelligencePanel() {
  const toast = useToast()
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    toast.success('Market intelligence saved', 'Your market notes have been saved.')
  }

  return (
    <Card title="Market Intelligence">
      <div className="space-y-3">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add market notes, competing quotes, or pricing intelligence..."
          rows={4}
          className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300"
        />
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            loading={saving}
            onClick={handleSave}
          >
            Save Note
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ─── ClearanceTab ─────────────────────────────────────────────────────────────

export default function ClearanceTab({ submission, onNext }) {
  const toast = useToast()
  const [agency, setAgency]     = useState(submission?.agencyName || '')
  const [agent, setAgent]       = useState(submission?.agentName || '')
  const [effectiveDate, setEff] = useState(submission?.effectiveDate || '')
  const [expiryDate, setExp]    = useState(submission?.expirationDate || '')
  const [checking, setChecking] = useState(false)
  const [result, setResult]     = useState(null)

  const agentOptions = agency ? (agentsByAgency[agency] || []) : []

  const handleCheck = async () => {
    setChecking(true)
    setResult(null)
    await new Promise(r => setTimeout(r, 1400))
    setChecking(false)
    setResult('cleared')
    toast.success('Clearance passed', 'No conflicting submissions found for this insured.')
  }

  return (
    <div className="space-y-6">
      {/* Risk Assessment Score — new panel above the main form grid */}
      <RiskAssessmentPanel />

      {/* Main clearance form grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: form (2/3 width) */}
        <div className="col-span-2 space-y-5">
          <Card title="Agency &amp; Agent">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Agency Name" required searchable
                options={agencies} value={agency}
                onChange={v => { setAgency(v); setAgent('') }}
              />
              <Select
                label="Agent Name" searchable
                options={agentOptions} value={agent}
                onChange={setAgent}
                placeholder={agency ? 'Select agent...' : 'Select agency first'}
                disabled={!agency}
              />
            </div>
          </Card>

          <Card title="Policy Dates">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Policy Effective Date"   required type="date" value={effectiveDate} onChange={e => setEff(e.target.value)} />
              <Input label="Policy Expiration Date"  type="date"          value={expiryDate}    onChange={e => setExp(e.target.value)} />
            </div>
          </Card>

          <Button
            variant="cta" size="lg" icon={Search}
            loading={checking} onClick={handleCheck}
            className="w-full justify-center"
          >
            {checking ? 'Checking Clearance...' : 'Check for Clearance'}
          </Button>

          {result === 'cleared' && (
            <div className="rounded-xl bg-sage-50 border border-sage-200 px-5 py-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-sage-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-sage-700">Clearance Passed</p>
                <p className="text-sm text-sage-600 mt-0.5">No conflicting policies found for this insured and agency combination.</p>
                <button onClick={onNext} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sage-700 hover:underline">
                  Proceed to Account <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {result === 'conflict' && (
            <div className="rounded-xl bg-crimson-50 border border-crimson-200 px-5 py-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-crimson-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-crimson-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-crimson-700">Conflict Found</p>
                <p className="text-sm text-crimson-600 mt-0.5">One or more active policies overlap. Review before proceeding.</p>
              </div>
            </div>
          )}

          {/* Prior Policy Lookup — new panel */}
          <PriorPolicyLookup />
        </div>

        {/* Right: status + timeline + info (1/3 width) */}
        <div className="space-y-4">
          {/* Clearance status panel */}
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Clearance Status</span>
              {result === 'cleared' && (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full">Cleared</span>
              )}
            </div>
            <div className="p-4">
              {result === null && !checking && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-2">
                    <Search className="h-5 w-5 text-stone-400" />
                  </div>
                  <p className="text-xs text-stone-400">Run clearance check to see result.</p>
                </div>
              )}
              {checking && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-ink-50 flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <Search className="h-5 w-5 text-ink-500" />
                  </div>
                  <p className="text-xs text-ink-600 font-medium">Checking for conflicts…</p>
                </div>
              )}
              {result && <WorkflowTimeline result={result} />}
            </div>
          </div>

          {/* Submission info stat grid */}
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Submission Info</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                ['Sub #',      submission?.submissionNumber],
                ['Assignee',   submission?.assignee],
                ['Created',    submission?.createdDate],
                ['Need By',    submission?.needByDate],
                ['LOB',        'General Liability'],
                ['Priority',   submission?.priority],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{k}</p>
                  <p className="text-xs font-semibold text-stone-800 mt-0.5 truncate">{v || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Flag for Manual Review — new panel */}
          <FlagForReviewPanel />
        </div>
      </div>

      {/* Market Intelligence — new panel at bottom */}
      <MarketIntelligencePanel />
    </div>
  )
}
