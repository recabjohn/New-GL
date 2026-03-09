import Card from '../../ui/Card'
import Input from '../../ui/Input'
import Select from '../../ui/Select'

const legalEntities = ['Individual', 'Corporation', 'Partnership', 'LLC', 'Trust', 'Non-Profit', 'Government Entity']
const industries = ['Agriculture', 'Construction', 'Education', 'Entertainment', 'Finance', 'Food & Beverage', 'Healthcare', 'Hospitality', 'Manufacturing', 'Professional Services', 'Real Estate', 'Retail', 'Technology', 'Transportation', 'Other']

function SectionRule({ color, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-0.5 h-4 rounded-full ${color}`} />
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{children}</span>
    </div>
  )
}

function ScoreBar({ value = 0, max = 100, colorClass }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold font-mono text-stone-700 w-7 text-right">{value}</span>
    </div>
  )
}

export default function AccountInfoCard({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })

  return (
    <Card title="Account Information">
      <div className="space-y-5">
        {/* New account toggle */}
        <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
          <input
            type="checkbox"
            id="newAccount"
            className="w-4 h-4 rounded border-stone-300 text-ink-700 focus:ring-ink-400"
          />
          <label htmlFor="newAccount" className="text-sm font-medium text-stone-700">New Account</label>
        </div>

        {/* Business identity */}
        <div>
          <SectionRule color="bg-flame-400">Business Identity</SectionRule>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                label="Account Name" required
                value={data.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Legal business name"
              />
            </div>
            <Input
              label="DBA"
              value={data.dba}
              onChange={e => set('dba', e.target.value)}
              placeholder="Trade name"
            />
          </div>
        </div>

        {/* Legal & tax */}
        <div>
          <SectionRule color="bg-ink-400">Legal &amp; Tax</SectionRule>
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Legal Entity"
              options={legalEntities}
              value={data.legalEntity}
              onChange={v => set('legalEntity', v)}
            />
            <Input
              label="FEIN / Tax ID"
              value={data.fein}
              onChange={e => set('fein', e.target.value)}
              placeholder="XX-XXXXXXX"
            />
            <div />
          </div>
        </div>

        {/* Contact */}
        <div>
          <SectionRule color="bg-sage-400">Contact</SectionRule>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Phone" type="tel"
              value={data.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="(000) 000-0000"
            />
            <div className="col-span-2">
              <Input
                label="Email" type="email"
                value={data.email}
                onChange={e => set('email', e.target.value)}
                placeholder="contact@company.com"
              />
            </div>
          </div>
        </div>

        {/* Business details */}
        <div>
          <SectionRule color="bg-amber-400">Business Details</SectionRule>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <Input
              label="NAICS Code"
              value={data.naicsCode}
              onChange={e => set('naicsCode', e.target.value)}
              placeholder="000000"
            />
            <div className="col-span-2">
              <Input
                label="NAICS Description"
                value={data.naicsDescription}
                onChange={e => set('naicsDescription', e.target.value)}
                placeholder="Industry description"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Industry"
              options={industries}
              value={data.industry}
              onChange={v => set('industry', v)}
            />
            <Input
              label="Business Start Date" type="date"
              value={data.businessStartDate ? (() => { const [m,d,y] = (data.businessStartDate||'').split('/'); return y&&m&&d ? `${y}-${m}-${d}` : '' })() : ''}
              onChange={e => {
                const [y,m,d] = e.target.value.split('-')
                set('businessStartDate', y&&m&&d ? `${m}/${d}/${y}` : '')
              }}
            />
            <div />
          </div>
        </div>

        {/* Description of operations */}
        <div>
          <label className="form-label mb-1.5">Description of Operations</label>
          <textarea
            rows={3}
            value={data.descriptionOfOps || ''}
            onChange={e => set('descriptionOfOps', e.target.value)}
            placeholder="Describe the insured's primary business operations…"
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 bg-stone-50 placeholder-stone-300 resize-none"
          />
        </div>

        {/* Financial indicators */}
        <div>
          <SectionRule color="bg-crimson-400">Financial Indicators</SectionRule>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <Input
              label="Intelliscore (0–100)" type="number"
              value={data.intelliscore ?? ''}
              onChange={e => set('intelliscore', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0–100"
            />
            <Input
              label="Financial Stability Score (0–100)" type="number"
              value={data.financialStabilityScore ?? ''}
              onChange={e => set('financialStabilityScore', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0–100"
            />
          </div>
          <div className="space-y-2 bg-stone-50 rounded-xl p-3 border border-stone-100">
            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Intelliscore</p>
              <ScoreBar value={data.intelliscore ?? 0} colorClass="bg-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Financial Stability</p>
              <ScoreBar value={data.financialStabilityScore ?? 0} colorClass="bg-sage-400" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
