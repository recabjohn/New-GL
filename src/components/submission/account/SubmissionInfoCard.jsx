import Card from '../../ui/Card'
import Input from '../../ui/Input'

function SectionRule({ color, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-0.5 h-4 rounded-full ${color}`} />
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{children}</span>
    </div>
  )
}

function BillingToggle({ value, onChange }) {
  return (
    <div>
      <label className="form-label mb-1.5">Billing Method</label>
      <div className="flex rounded-lg border border-stone-200 overflow-hidden bg-stone-50">
        {['Direct Bill', 'Agency Bill'].map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={[
              'flex-1 text-xs font-semibold py-2 transition-colors duration-150',
              value === opt
                ? 'bg-ink-800 text-white'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100',
            ].join(' ')}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-stone-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          'relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0',
          checked ? 'bg-ink-700' : 'bg-stone-200',
        ].join(' ')}
      >
        <span className={[
          'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0.5',
        ].join(' ')} />
      </button>
    </div>
  )
}

export default function SubmissionInfoCard({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })

  return (
    <Card title="Submission Information">
      <div className="space-y-5">

        {/* Billing */}
        <div>
          <SectionRule color="bg-flame-400">Billing</SectionRule>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <BillingToggle value={data.billingMethod} onChange={v => set('billingMethod', v)} />
            <Input
              label="Default Commission %"
              type="number"
              value={data.defaultCommission ?? ''}
              onChange={e => set('defaultCommission', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="12.5"
            />
          </div>
          <div className="bg-stone-50 rounded-xl border border-stone-100 px-4 py-3 space-y-2.5">
            <Toggle
              label="Installments Allowed Override"
              checked={!!data.installmentsAllowed}
              onChange={v => set('installmentsAllowed', v)}
            />
            <Toggle
              label="Apply Latest ERC Version"
              checked={!!data.applyLatestERC}
              onChange={v => set('applyLatestERC', v)}
            />
          </div>
        </div>

        {/* Agency */}
        <div>
          <SectionRule color="bg-ink-400">Agency</SectionRule>
          <Input
            label="Agency Legal Entity Name"
            value={data.agencyLegalEntityName || ''}
            onChange={e => set('agencyLegalEntityName', e.target.value)}
            placeholder="Full legal name of agency"
          />
        </div>

        {/* Submission identifiers */}
        <div>
          <SectionRule color="bg-sage-400">Identifiers</SectionRule>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="External Submission Number"
              value={data.externalSubmissionNumber || ''}
              onChange={e => set('externalSubmissionNumber', e.target.value)}
              placeholder="Carrier or agency ref #"
            />
            <Input
              label="Submission Description"
              value={data.submissionDescription || ''}
              onChange={e => set('submissionDescription', e.target.value)}
              placeholder="Short description"
            />
          </div>
        </div>

        {/* Staff */}
        <div>
          <SectionRule color="bg-amber-400">Staff</SectionRule>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <Input
              label="Underwriter Email"
              type="email"
              value={data.uwEmail || ''}
              onChange={e => set('uwEmail', e.target.value)}
              placeholder="uw@company.com"
            />
            <div />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Service Specialist Name"
              value={data.serviceSpecialistName || ''}
              onChange={e => set('serviceSpecialistName', e.target.value)}
              placeholder="Full name"
            />
            <Input
              label="Service Specialist Email"
              type="email"
              value={data.serviceSpecialistEmail || ''}
              onChange={e => set('serviceSpecialistEmail', e.target.value)}
              placeholder="ss@company.com"
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="form-label mb-1.5">Submission Note</label>
          <textarea
            rows={3}
            value={data.submissionNote || ''}
            onChange={e => set('submissionNote', e.target.value)}
            placeholder="Internal notes for this submission…"
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 bg-stone-50 placeholder-stone-300 resize-none"
          />
        </div>

      </div>
    </Card>
  )
}
