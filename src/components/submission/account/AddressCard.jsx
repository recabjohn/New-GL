import { useState } from 'react'
import Card from '../../ui/Card'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import { usStates } from '../../../data/mockData'
import { MapPin, Check, Loader2 } from 'lucide-react'

export default function AddressCard({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  const [verified, setVerified]   = useState(false)
  const [verifying, setVerifying] = useState(false)

  const handleVerify = async () => {
    setVerifying(true)
    await new Promise(r => setTimeout(r, 900))
    setVerifying(false)
    setVerified(true)
  }

  const verifyAction = verified ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-sage-50 text-sage-700 border border-sage-200 px-2.5 py-1 rounded-full">
      <Check className="h-3 w-3" /> USPS Verified
    </span>
  ) : (
    <button
      onClick={handleVerify}
      disabled={verifying}
      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white text-stone-600 border border-stone-200 px-2.5 py-1 rounded-full hover:border-ink-400 hover:text-ink-600 transition-colors disabled:opacity-60"
    >
      {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
      {verifying ? 'Verifying…' : 'Verify Address'}
    </button>
  )

  return (
    <Card title="Mailing Address" actions={verifyAction}>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Address Line 1" required
              value={data.line1}
              onChange={e => { set('line1', e.target.value); setVerified(false) }}
              placeholder="Street address"
            />
          </div>
          <Input
            label="Line 2"
            value={data.line2}
            onChange={e => set('line2', e.target.value)}
            placeholder="Suite, unit…"
          />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <Input
              label="City" required
              value={data.city}
              onChange={e => { set('city', e.target.value); setVerified(false) }}
            />
          </div>
          <Select
            label="State" required searchable
            options={usStates}
            value={data.state}
            onChange={v => { set('state', v); setVerified(false) }}
          />
          <Input
            label="ZIP" required
            value={data.zip}
            onChange={e => { set('zip', e.target.value); setVerified(false) }}
            placeholder="00000"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input label="County" value={data.county} onChange={e => set('county', e.target.value)} />
          <Select label="Country" options={['US', 'CA', 'MX']} value={data.country} onChange={v => set('country', v)} />
          <div />
        </div>

        {verified && (
          <div className="rounded-xl bg-stone-25 border border-stone-200 p-3.5 flex items-start gap-3">
            <MapPin className="h-4 w-4 text-flame-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-stone-800">{data.line1}{data.line2 ? `, ${data.line2}` : ''}</p>
              <p className="text-sm text-stone-600">{data.city}, {data.state} {data.zip}</p>
              <p className="text-xs text-stone-400 mt-0.5">{data.county} County · {data.country}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
