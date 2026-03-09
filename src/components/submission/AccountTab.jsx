import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../ui/Button'
import AccountInfoCard from './account/AccountInfoCard'
import AddressCard from './account/AddressCard'
import LOBSelector from './account/LOBSelector'
import ContactsTable from './account/ContactsTable'
import NamedInsuredTable from './account/NamedInsuredTable'
import SubmissionInfoCard from './account/SubmissionInfoCard'
import { account as defaultAccount } from '../../data/mockData'
import { useToast } from '../ui/Toast'
import { Save, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function AccountTab() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const toast     = useToast()
  const [data, setData]     = useState(defaultAccount)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const setAddress  = addr => setData(d => ({ ...d, address: addr }))
  const setContacts = list => setData(d => ({ ...d, contacts: list }))
  const setInsureds = list => setData(d => ({ ...d, namedInsureds: list }))
  const setLOBs     = lobs => setData(d => ({ ...d, selectedLOBs: lobs }))
  const setSubType  = t    => setData(d => ({ ...d, submissionType: t }))
  const setSubInfo  = patch => setData(d => ({ ...d, ...patch }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700))
    setSaving(false)
    setSaved(true)
    toast.success('Account saved', 'Account information has been saved successfully.')
  }

  const handleNext = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    navigate(`/submissions/${id}?tab=lob`)
  }

  const sections = [
    ['Account Info',      true],
    ['Mailing Address',   !!data.address?.line1],
    ['Contacts',          (data.contacts?.length || 0) > 0],
    ['Named Insureds',    (data.namedInsureds?.length || 0) > 0],
    ['Lines of Business', (data.selectedLOBs?.length || 0) > 0],
    ['Submission Info',   !!(data.billingMethod)],
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-5">
        {/* Main column */}
        <div className="col-span-2 space-y-5">
          <AccountInfoCard    data={data}                   onChange={setData} />
          <AddressCard        data={data.address}           onChange={setAddress} />
          <ContactsTable      contacts={data.contacts}      onChange={setContacts} />
          <NamedInsuredTable  insureds={data.namedInsureds} onChange={setInsureds} />
          <SubmissionInfoCard data={data}                   onChange={setSubInfo} />
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <LOBSelector
            selected={data.selectedLOBs}
            submissionType={data.submissionType}
            onChange={setLOBs}
            onTypeChange={setSubType}
          />

          {/* Section progress */}
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Section Progress</span>
            </div>
            <div className="p-4 space-y-2.5">
              {sections.map(([label, done]) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-sage-500' : 'bg-stone-100'}`}>
                    {done && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                  </div>
                  <span className={`text-xs font-medium ${done ? 'text-stone-700' : 'text-stone-400'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer action bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-white border-t border-stone-200 flex items-center justify-between">
        <p className="text-xs text-stone-400 font-medium">
          {saved ? '✓ Changes saved' : 'Unsaved changes'}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={Save} loading={saving} onClick={handleSave}>Save</Button>
          <Button variant="cta" icon={ArrowRight} onClick={handleNext}>Save &amp; Next</Button>
        </div>
      </div>
    </div>
  )
}
