import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, CheckSquare, BarChart2, ChevronDown, ChevronUp, Check, Star, AlertCircle, Zap } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { FormTypeBadge } from '../components/ui/Badge'
import { glPolicy, ratingWorksheet, scheduleForms, submissions, ratingOptions } from '../data/mockData'
import { useToast } from '../components/ui/Toast'

// ─── Rate Indication ─────────────────────────────────────────────────────────

function RateIndicationTab({ submission }) {
  const navigate = useNavigate()
  const toast    = useToast()
  const ws       = ratingWorksheet
  const loc      = ws.locations[0]

  const [rating,      setRating]      = useState(false)   // loading spinner
  const [rated,       setRated]       = useState(false)   // show comparative section
  const [expanded,    setExpanded]    = useState({})       // which cards are open
  const [selected,    setSelected]    = useState(null)    // selected option id
  const [creating,    setCreating]    = useState(false)

  const primaryEntry = glPolicy.stateSchedule?.find(s => s.isPrimary) || glPolicy.stateSchedule?.[0]
  const primaryState = primaryEntry?.stateCode || 'AL'

  const totalExposure = loc.classifications.reduce((s, c) => s + (c.premOps?.exposure || 0), 0)

  const handleRate = async () => {
    setRating(true)
    await new Promise(r => setTimeout(r, 1400))
    setRating(false)
    setRated(true)
    // auto-expand the recommended option
    const rec = ratingOptions.find(o => o.recommended)
    if (rec) setExpanded({ [rec.id]: true })
    toast.success('Rating complete', 'Two quote options are ready for review.')
  }

  const handleCreateQuote = async () => {
    if (!selected) return
    setCreating(true)
    await new Promise(r => setTimeout(r, 900))
    setCreating(false)
    const opt = ratingOptions.find(o => o.id === selected)
    toast.success('Quote created', 'Q00-0014019-00 has been created successfully.')
    navigate('/quotes/Q00-0014019-00', { state: { selectedOption: opt } })
  }

  const lowestPremium  = Math.min(...ratingOptions.map(o => o.breakdown.totalPremium))
  const highestPremium = Math.max(...ratingOptions.map(o => o.breakdown.totalPremium))
  const avgPremium     = (ratingOptions.reduce((s, o) => s + o.breakdown.totalPremium, 0) / ratingOptions.length)
  const priceDiff      = highestPremium - lowestPremium

  const tagColors = {
    ink:  'bg-ink-100 text-ink-700',
    sage: 'bg-sage-100 text-sage-700',
    amber:'bg-amber-100 text-amber-700',
  }

  return (
    <div className="space-y-5">

      {/* ── 1. Risk Schedule Summary ─────────────────────────────────────── */}
      <Card title="Risk Schedule Summary" subtitle="Read-only summary of entered risk data">
        {/* KPI chips */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            ['Each Occurrence Limit', ws.limits.eachOccurrence],
            ['General Aggregate',     ws.limits.generalAggregate],
            ['Deductible',            ws.limits.eachOccurrence === '100,000 CSL' ? '$1,000' : 'None'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3">
              <p className="text-xs text-stone-400 font-medium mb-1">{label}</p>
              <p className="text-base font-bold font-mono text-stone-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Risk table */}
        <div className="rounded-xl border border-stone-200 overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-stone-50">
              <tr>
                {['State', 'Locations', 'Classifications', 'Total Exposure'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-stone-100">
                <td className="px-4 py-3 font-semibold text-stone-800">{primaryState}</td>
                <td className="px-4 py-3 font-mono text-stone-700">1</td>
                <td className="px-4 py-3 font-mono text-stone-700">{loc.classifications.length}</td>
                <td className="px-4 py-3 font-mono font-semibold text-stone-800">${totalExposure.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-stone-100 bg-stone-25">
                <td className="px-4 py-2.5 text-xs font-semibold text-stone-500">Total</td>
                <td className="px-4 py-2.5 font-mono text-xs font-semibold text-stone-600">1</td>
                <td className="px-4 py-2.5 font-mono text-xs font-semibold text-stone-600">{loc.classifications.length}</td>
                <td className="px-4 py-2.5 font-mono text-xs font-semibold text-stone-600">${totalExposure.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Additional coverages */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-stone-400 font-medium">Additional Coverages</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-ink-100 text-ink-700">
            Certified Acts of Terrorism
          </span>
        </div>
      </Card>

      {/* ── 2. Rating Configuration ──────────────────────────────────────── */}
      <Card title="Rating Configuration">
        <div className="grid grid-cols-2 gap-6 mb-5">
          <div>
            <p className="text-xs text-stone-400 font-medium mb-1">Rating Company</p>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-900">Solartis MultiLine</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ink-100 text-ink-600 uppercase tracking-wide">Default</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium mb-1">Policy Term</p>
            <span className="font-semibold text-stone-900">12 Months</span>
          </div>
        </div>

        {!rated && (
          <Button
            variant="cta"
            size="lg"
            loading={rating}
            onClick={handleRate}
            className="w-full justify-center"
          >
            {rating ? 'Rating Submission\u2026' : 'Rate Submission'}
          </Button>
        )}

        {rated && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-sage-50 border border-sage-200">
            <div className="w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center shrink-0">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-sage-800">Rating complete &mdash; 2 options ready</span>
          </div>
        )}
      </Card>

      {/* ── 3. Comparative Rating (appears after rating) ─────────────────── */}
      {rated && (
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">Quote Options</h2>
              <p className="text-sm text-stone-400">Compare {ratingOptions.length} options for this submission</p>
            </div>
          </div>

          {/* 4 KPI stat cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Lowest Premium',  value: `$${lowestPremium.toFixed(2)}`,   sub: ratingOptions.find(o => o.breakdown.totalPremium === lowestPremium)?.label,  color: 'text-sage-600',   bg: 'bg-sage-50 border-sage-200'   },
              { label: 'Highest Premium', value: `$${highestPremium.toFixed(2)}`,  sub: ratingOptions.find(o => o.breakdown.totalPremium === highestPremium)?.label, color: 'text-crimson-600', bg: 'bg-crimson-50 border-crimson-200' },
              { label: 'Price Range',     value: `$${priceDiff.toFixed(2)}`,        sub: 'Difference',                                                                color: 'text-ink-600',    bg: 'bg-ink-50 border-ink-200'    },
              { label: 'Avg. Premium',    value: `$${avgPremium.toFixed(2)}`,       sub: `Across ${ratingOptions.length} options`,                                   color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200'  },
            ].map(card => (
              <div key={card.label} className={`rounded-xl border px-4 py-3.5 ${card.bg}`}>
                <p className={`text-xs font-semibold mb-1 ${card.color}`}>{card.label}</p>
                <p className={`text-xl font-black font-mono ${card.color}`}>{card.value}</p>
                <p className={`text-xs mt-0.5 font-medium ${card.color} opacity-70`}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Option cards */}
          <div className="space-y-3">
            {ratingOptions.map(opt => {
              const isExpanded = !!expanded[opt.id]
              const isSelected = selected === opt.id
              const pct = opt.breakdown.totalPremium === lowestPremium
                ? null
                : `+${(((opt.breakdown.totalPremium - lowestPremium) / lowestPremium) * 100).toFixed(0)}%`

              return (
                <div
                  key={opt.id}
                  className={[
                    'rounded-xl border bg-white overflow-hidden transition-all',
                    isSelected ? 'border-ink-400 shadow-md ring-1 ring-ink-300' : 'border-stone-200 hover:border-stone-300',
                  ].join(' ')}
                >
                  {/* Card header row */}
                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-base font-bold text-stone-900">{opt.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${tagColors[opt.tagColor] || 'bg-stone-100 text-stone-600'}`}>
                            {opt.tag}
                          </span>
                          {opt.recommended && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide flex items-center gap-1">
                              <Star className="h-2.5 w-2.5" /> Recommended
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-stone-500">
                          <span>Each Occ: <strong className="text-stone-700">{opt.limits.eachOccurrence}</strong></span>
                          <span>Aggregate: <strong className="text-stone-700">{opt.limits.generalAggregate}</strong></span>
                          <span>Ded: <strong className="text-stone-700">{opt.limits.deductible}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right: premium + actions */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-stone-400">Total Premium</p>
                        <div className="flex items-center gap-2 justify-end">
                          <p className="text-2xl font-black font-mono text-stone-900">
                            ${opt.breakdown.totalPremium.toFixed(2)}
                          </p>
                          {pct && (
                            <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                              <Zap className="h-3 w-3" />{pct}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400">
                          Base: ${opt.breakdown.basePremium.toFixed(2)} &middot; Taxes: ${opt.breakdown.taxes.toFixed(2)}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelected(isSelected ? null : opt.id)}
                        className={[
                          'px-4 py-2 rounded-lg text-sm font-semibold border transition-all',
                          isSelected
                            ? 'bg-ink-700 text-white border-ink-700'
                            : 'bg-white text-ink-700 border-ink-300 hover:bg-ink-50',
                        ].join(' ')}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>

                      <button
                        onClick={() => setExpanded(e => ({ ...e, [opt.id]: !e[opt.id] }))}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t border-stone-100 px-5 py-4 grid grid-cols-2 gap-6">
                      {/* Coverage features */}
                      <div>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">Coverage Features</p>
                        <ul className="space-y-1.5">
                          {opt.coverageFeatures.map(f => (
                            <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
                              <Check className="h-3.5 w-3.5 text-sage-500 mt-0.5 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Premium breakdown */}
                      <div>
                        <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-3">Premium Breakdown</p>
                        <div className="rounded-lg border border-stone-200 overflow-hidden">
                          <table className="w-full text-sm">
                            <tbody className="divide-y divide-stone-100">
                              {[
                                ['Base Premium', opt.breakdown.basePremium],
                                ['Taxes',        opt.breakdown.taxes],
                                ['Policy Fee',   opt.breakdown.policyFee],
                              ].map(([label, val]) => (
                                <tr key={label} className="hover:bg-stone-25">
                                  <td className="px-4 py-2.5 text-stone-600">{label}</td>
                                  <td className="px-4 py-2.5 text-right font-mono text-stone-800">${val.toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr className="bg-stone-50 font-semibold border-t-2 border-stone-200">
                                <td className="px-4 py-2.5 text-stone-800">Total Premium</td>
                                <td className="px-4 py-2.5 text-right font-mono text-stone-900">${opt.breakdown.totalPremium.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-2 text-sage-600 text-xs font-medium">Est. Commission</td>
                                <td className="px-4 py-2 text-right font-mono text-xs text-sage-600">${opt.breakdown.estCommission.toFixed(2)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* System recommendation */}
          {(() => {
            const rec = ratingOptions.find(o => o.recommended)
            return rec ? (
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>System Recommendation:</strong> Based on the submission profile,{' '}
                  <strong>{rec.label} &mdash; {rec.tag}</strong> offers the best combination of coverage and value at{' '}
                  <strong className="font-mono">${rec.breakdown.totalPremium.toFixed(2)}</strong> total premium.
                </p>
              </div>
            ) : null
          })()}

          {/* Create quote CTA */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-stone-400">
              {selected
                ? `${ratingOptions.find(o => o.id === selected)?.label} selected \u2014 ready to create quote`
                : 'Select an option above to create a quote'}
            </p>
            <Button
              variant="cta"
              size="lg"
              icon={CheckSquare}
              disabled={!selected}
              loading={creating}
              onClick={handleCreateQuote}
            >
              Create Quote
            </Button>
          </div>
        </div>
      )}
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
                <BarChart2 className="h-4 w-4 text-ink-500" />
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
              <p className="text-3xl font-black font-mono text-ink-600">${ws.totalPremium.toFixed(2)}</p>
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
