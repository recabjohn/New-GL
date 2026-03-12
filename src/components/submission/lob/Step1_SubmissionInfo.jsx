import Card from '../../ui/Card'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import Toggle from '../../ui/Toggle'

const lossRunYearsOpts        = ['1 Year', '2 Years', '3 Years', '4 Years', '5 Years']
const carrierOpts             = ['ISO', 'AAIS', 'Company Specific', 'Not Available']
const lossRunsReceivedOpts    = ['Yes', 'No']

const UW_QUESTIONS = [
  {
    key: 'uwQ_installationServiceRepair',
    text: 'Outside of the Construction Industry, installation, service and repair work are generally not within our appetite. Based on the submission and publicly available information, do you think that more than 10% of the insured\'s payroll represents employees doing installation, service or repair work?',
    required: true,
  },
]

function SectionRule({ color, children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-0.5 h-4 rounded-full ${color}`} />
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{children}</span>
    </div>
  )
}

function YesNoRadio({ value, onChange }) {
  return (
    <div className="flex items-center gap-4 shrink-0">
      {['Yes', 'No'].map(opt => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            checked={value === (opt === 'Yes')}
            onChange={() => onChange(opt === 'Yes')}
            className="w-3.5 h-3.5 text-ink-700 border-stone-300 focus:ring-ink-400"
          />
          <span className={`text-xs font-semibold ${value === (opt === 'Yes') ? 'text-ink-800' : 'text-stone-500'}`}>{opt}</span>
        </label>
      ))}
    </div>
  )
}

export default function Step1_SubmissionInfo({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })

  // Convert MM/DD/YYYY ↔ YYYY-MM-DD for date input
  const toInputDate = (val = '') => {
    const [m, d, y] = val.split('/')
    return y && m && d ? `${y}-${m}-${d}` : ''
  }
  const fromInputDate = (val = '') => {
    const [y, m, d] = val.split('-')
    return y && m && d ? `${m}/${d}/${y}` : ''
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        {/* ── Left column ── */}
        <div className="space-y-5">
          {/* Account + Agency */}
          <Card>
            <SectionRule color="bg-ink-400">Account &amp; Agency</SectionRule>
            <div className="space-y-4">
              {/* LOB Type — read-only */}
              <div>
                <label className="form-label mb-1">LOB Type</label>
                <div className="px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-sm font-mono font-semibold text-stone-600">
                  NEW-BUSINESS
                </div>
              </div>

              <Input
                label="Broker's Standard GL Commission"
                value={data.commission}
                onChange={e => set('commission', e.target.value)}
                suffix="%"
                hint="Default: 12.5%"
              />

              <div>
                <label className="form-label mb-1.5">GL Appetite Signal</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['Standard', 'Non-Standard', 'Refer to UW', 'Decline'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set('appetiteSignal', opt)}
                      className={[
                        'px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors',
                        data.appetiteSignal === opt
                          ? 'bg-ink-800 text-white border-ink-800'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-ink-400',
                      ].join(' ')}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div>
          <Card>
            <SectionRule color="bg-amber-400">Liability Loss Information</SectionRule>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Select label="Loss Run Years"           options={lossRunYearsOpts}     value={data.lossRunYears}              onChange={v => set('lossRunYears', v)} />
                <Select label="Carrier Loss Runs"        options={carrierOpts}           value={data.carrierLossRuns}           onChange={v => set('carrierLossRuns', v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Loss Runs Received"       options={lossRunsReceivedOpts}  value={data.carrierLossRunsReceived}   onChange={v => set('carrierLossRunsReceived', v)} />
                <Input
                  label="Oldest Loss Valuation" type="date"
                  value={toInputDate(data.liabilityOldestLossValuation)}
                  onChange={e => set('liabilityOldestLossValuation', fromInputDate(e.target.value))}
                />
              </div>

              <div className="pt-3 border-t border-stone-100">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Claim Counts</p>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Claims Over $1k" required type="number"
                    value={data.liabilityClaimsOver1k ?? ''}
                    onChange={e => set('liabilityClaimsOver1k', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                  />
                  <Input
                    label="Claims Over $100k" type="number"
                    value={data.liabilityClaimsOver100k ?? ''}
                    onChange={e => set('liabilityClaimsOver100k', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                  />
                  <Input
                    label="Max Claims / Year" type="number"
                    value={data.liabilityMaxClaimsInYear ?? ''}
                    onChange={e => set('liabilityMaxClaimsInYear', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Number of employees */}
              <div className="pt-3 border-t border-stone-100">
                <Input
                  label="Number of Employees" required type="number"
                  value={data.numberOfEmployees ?? ''}
                  onChange={e => set('numberOfEmployees', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Full-width: Underwriting Questions ── */}
      <Card>
        <SectionRule color="bg-crimson-400">Underwriting Questions</SectionRule>
        <div className="space-y-0 divide-y divide-stone-100">
          {UW_QUESTIONS.map(q => (
            <div key={q.key} className="flex items-start gap-4 py-4">
              <p className="flex-1 text-sm text-stone-700 leading-relaxed">
                {q.text}
                {q.required && <span className="text-crimson-500 ml-0.5">*</span>}
              </p>
              <YesNoRadio
                value={data[q.key]}
                onChange={v => set(q.key, v)}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
