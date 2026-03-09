import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, CheckSquare, TrendingUp, FileText, BarChart2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { FormTypeBadge, StatusBadge } from '../components/ui/Badge'
import { glPolicy, ratingWorksheet, scheduleForms, submissions } from '../data/mockData'
import { useToast } from '../components/ui/Toast'

// ─── Rate Indication ─────────────────────────────────────────────────────────

function RateIndicationTab({ submission }) {
  const navigate    = useNavigate()
  const toast       = useToast()
  const [generating, setGenerating] = useState(false)

  const primaryEntry = glPolicy.stateSchedule?.find(s => s.isPrimary) || glPolicy.stateSchedule?.[0]
  const primaryState = primaryEntry?.stateCode || 'AL'
  const lob = submission.linesOfBusiness?.[0] || 'General Liability'

  const ws  = ratingWorksheet
  const loc = ws.locations[0]

  const handleGenerate = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1000))
    setGenerating(false)
    toast.success('Quote generated', 'Q00-0014019-00 created and offered successfully.')
    navigate('/quotes/Q00-0014019-00')
  }

  return (
    <div className="space-y-5">
      {/* Policy info + total premium */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Policy Info" className="col-span-2">
          <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-sm mb-4">
            {[
              ['Policy Effective',  submission.effectiveDate],
              ['Policy Expiration', submission.expirationDate],
              ['Rating Company',    'Solartis MultiLine'],
              ['Quote Type',        submission.transactionType],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-stone-400 font-medium">{k}</p>
                <p className="font-semibold text-stone-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm pt-3 border-t border-stone-100">
            {[
              ['Line of Business', lob],
              ['Primary State',    primaryState],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-stone-400 font-medium">{k}</p>
                <p className="font-semibold text-stone-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Total premium card */}
        <Card>
          <div className="flex flex-col items-center justify-center h-full py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-flame-50 flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-flame-500" />
            </div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Total Premium</p>
            <p className="text-4xl font-black font-mono text-ink-800">${ws.totalPremium.toFixed(2)}</p>
            <p className="text-xs text-stone-400 mt-1">Base + Terrorism</p>
          </div>
        </Card>
      </div>

      {/* Limits */}
      <Card title="Limits of Liability">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          {[
            ['Each Occurrence',         ws.limits.eachOccurrence],
            ['General Aggregate',       ws.limits.generalAggregate],
            ['Personal & Adv Injury',   ws.limits.personalAdvInjury],
            ['Prod/Comp Ops Aggregate', ws.limits.prodCompOpsAggregate],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-stone-50 pb-2">
              <span className="text-stone-500">{k}</span>
              <span className="font-semibold text-stone-800">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Risk schedule */}
      <Card title="Risk Schedule">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-25">
              <tr>
                {['', 'Subline', 'State', 'Location #'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-stone-100 hover:bg-stone-25">
                <td className="px-4 py-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-stone-300 text-ink-700" />
                </td>
                <td className="px-4 py-3 text-stone-700">Premises/Operations and Products/Completed Operations</td>
                <td className="px-4 py-3 font-semibold text-stone-800">AL</td>
                <td className="px-4 py-3 text-stone-700">1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Generate quote */}
      <div className="flex justify-end">
        <Button variant="cta" size="lg" icon={CheckSquare} loading={generating} onClick={handleGenerate}>
          Generate Quote
        </Button>
      </div>
    </div>
  )
}

// ─── Worksheet ───────────────────────────────────────────────────────────────

function WorksheetTab() {
  const ws  = ratingWorksheet
  const cls = ws.locations[0].classifications[0]

  // Operator styling
  const op = (symbol) => (
    <td className="px-3 py-2.5 text-sm text-center font-bold text-stone-300">{symbol}</td>
  )
  const val = (v, highlight) => (
    <td className={`px-3 py-2.5 text-sm text-right font-mono ${highlight ? 'font-bold text-stone-900' : 'text-stone-700'}`}>{v}</td>
  )

  const calcSection = (title, cov) => (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-0.5 h-4 bg-ink-400 rounded-full" />
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-25">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-semibold text-stone-400">Calculation</th>
              {['Value 1', '÷×−', 'Value 2', '=', 'Result'].map((h, i) => (
                <th key={i} className={`py-2 text-xs font-semibold text-stone-400 ${i === 3 ? 'text-center px-2' : 'text-right px-3'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            <tr className="hover:bg-stone-25">
              <td className="px-4 py-2.5 text-sm text-stone-600 font-medium">Loss Cost × LCM = Base Rate</td>
              {val(cov.lossCost)}{op('×')}{val(cov.lcm)}{op('=')}{val(cov.baseRate, true)}
            </tr>
            <tr className="hover:bg-stone-25">
              <td className="px-4 py-2.5 text-sm text-stone-600 font-medium">BI Ded Factor + PD Ded Factor = Final Ded Factor</td>
              {val(cov.biDeductibleFactor)}{op('+')}{val(cov.pdDeductibleFactor)}{op('=')}{val(cov.finalDeductibleFactor, true)}
            </tr>
            <tr className="hover:bg-stone-25">
              <td className="px-4 py-2.5 text-sm text-stone-600 font-medium">CSL ILF − Final Ded Factor = Final ILF</td>
              {val(cov.cslIlf)}{op('−')}{val(cov.finalDeductibleFactor)}{op('=')}{val(cov.finalIlf, true)}
            </tr>
            <tr className="hover:bg-stone-25">
              <td className="px-4 py-2.5 text-sm text-stone-600 font-medium">Base Rate × Final ILF × Modifiers = Final Rate</td>
              {val(cov.baseRate)}{op('×')}{val(cov.finalIlf)}{op('×')}{val('1×1×1', true)}
            </tr>
            <tr className="bg-stone-50 hover:bg-stone-100">
              <td className="px-4 py-2.5 text-sm font-semibold text-stone-700">Final Rate × Exposure ÷ 1000 = Premium</td>
              {val(cov.finalRate)}{op('×')}{val(cov.exposure.toLocaleString())}{op('÷')}{val(`$${cov.premium.toFixed(2)}`, true)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="space-y-2">
      <Card title={`Location 1 — ${cls.classDescription} (${cls.classCode})`}>
        {/* Classification meta */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6">
          {[
            ['Prem/Ops Territory',       cls.premOpsTerritoryCode],
            ['Prod/Comp Territory',       cls.prodCompOpsTerritoryCode],
            ['Premium Basis (Prem/Ops)',  cls.premOpsPremiumBasis],
            ['Premium Basis (Prod/Comp)', cls.prodCompOpsPremiumBasis],
            ['Prem/Ops ILF',             cls.premOpsILF],
            ['Prod/Comp ILF',            cls.prodCompOpsILF],
            ['Prem/Ops BI Ded',          cls.premOpsBIDeductible],
            ['Products BI Ded',          cls.productsBIDeductible],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-stone-50 pb-1.5">
              <span className="text-stone-500">{k}</span>
              <span className="font-medium text-stone-800">{v}</span>
            </div>
          ))}
        </div>

        {calcSection('Premises / Operations Coverage', cls.premOps)}
        {calcSection('Products / Completed Operations Coverage', cls.prodCompOps)}

        {/* Terrorism + total */}
        <div className="mt-2 pt-4 border-t border-stone-100 flex justify-between items-center text-sm">
          <span className="font-medium text-stone-600">Certified Terrorism (CG 21 73 01 15)</span>
          <span className="font-semibold text-stone-800 font-mono">${ws.certifiedTerrorismPremium.toFixed(2)}</span>
        </div>
        <div className="mt-3 flex justify-between items-center bg-ink-900 text-white rounded-xl px-5 py-4">
          <span className="font-semibold tracking-wide">Policy Total Premium</span>
          <span className="text-2xl font-black font-mono">${ws.totalPremium.toFixed(2)}</span>
        </div>
      </Card>
    </div>
  )
}

// ─── Schedule of Forms ────────────────────────────────────────────────────────

function ScheduleOfFormsTab() {
  const total = scheduleForms.filter(f => f.premium).reduce((s, f) => s + f.premium, 0)
  return (
    <Card title="Schedule of Forms" subtitle={`${scheduleForms.length} forms attached`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-25">
            <tr>
              {['Form Number', 'Form Name', 'Type', 'Premium'].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {scheduleForms.map(f => (
              <tr key={f.number} className="hover:bg-stone-25">
                <td className="px-4 py-3 font-mono text-xs font-bold text-ink-700 whitespace-nowrap">{f.number}</td>
                <td className="px-4 py-3 text-stone-700">{f.name}</td>
                <td className="px-4 py-3"><FormTypeBadge type={f.type} /></td>
                <td className="px-4 py-3 text-right font-mono font-medium text-stone-800">
                  {f.premium ? `$${f.premium.toFixed(2)}` : <span className="text-stone-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-stone-200 bg-stone-25">
              <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-stone-600 text-right">Total Optional Premium</td>
              <td className="px-4 py-3 text-right font-bold font-mono text-stone-900">${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SUBTABS = [
  { id: 'rate',      label: 'Rate Indication' },
  { id: 'worksheet', label: 'Worksheet' },
  { id: 'forms',     label: 'Schedule of Forms' },
]

export default function ProductBrowsePage() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const [tab, setTab] = useState('rate')
  const submission    = submissions.find(s => s.id === id) || submissions[0]
  const ws            = ratingWorksheet

  return (
    <div className="max-w-[1200px] mx-auto space-y-4">
      {/* Enterprise banner header */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        <div className="h-1 bg-ink-700" />
        <div className="px-6 py-4">
          <nav className="flex items-center gap-1 text-xs text-stone-400 mb-3">
            <button onClick={() => navigate('/')} className="hover:text-ink-600 transition-colors">Dashboard</button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => navigate(`/submissions/${id}`)} className="hover:text-ink-600 transition-colors">{submission.submissionNumber}</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-stone-600 font-medium">Rate Indication</span>
          </nav>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <BarChart2 className="h-4 w-4 text-flame-500" />
                <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Product Browse</span>
              </div>
              <h1 className="text-xl font-bold text-stone-900">{submission.insuredName}</h1>
              <p className="text-sm text-stone-500 mt-0.5">
                <span className="font-mono text-ink-700 font-semibold">{submission.submissionNumber}</span>
                {' · '}Eff {submission.effectiveDate} — Exp {submission.expirationDate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Indicated Premium</p>
              <p className="text-3xl font-black font-mono text-flame-600">${ws.totalPremium.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Pill sub-tabs in card header */}
        <div className="px-6 pb-0 border-t border-stone-100">
          <div className="flex gap-1 pt-3 pb-0">
            {SUBTABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2 -mb-px',
                  tab === t.id
                    ? 'bg-ink-50 text-ink-800 border-ink-700'
                    : 'text-stone-500 border-transparent hover:text-stone-700 hover:bg-stone-50',
                ].join(' ')}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div>
        {tab === 'rate'      && <RateIndicationTab submission={submission} />}
        {tab === 'worksheet' && <WorksheetTab />}
        {tab === 'forms'     && <ScheduleOfFormsTab />}
      </div>
    </div>
  )
}
