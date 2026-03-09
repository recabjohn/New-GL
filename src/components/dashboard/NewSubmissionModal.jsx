import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { agencies, assignees, usStates } from '../../data/mockData'
import { useToast } from '../ui/Toast'
import { Upload, X } from 'lucide-react'

const priorities    = ['HIGH', 'MEDIUM', 'LOW']
const linesOfBiz    = ['General Liability', 'Commercial Auto', 'Commercial Property', 'Umbrella', 'BOP', 'Cyber', 'EPLI', 'Excess']
const agentsByAgency = {
  'Hawthorne Risk Advisors, LLC': ['Michael Grant', 'Rebecca Torres'],
  'Pacific Crest Insurance':       ['Sarah Okonkwo', 'David Park'],
  'Meridian Specialty Lines':      ['Carlos Reyes', 'Janet Wu'],
  'Apex Commercial Risk':          ['Lisa Tran', 'Steven Moore'],
  'Greenfield Risk Partners':      ['Omar Hassan', 'Megan Bell'],
  'Coastal Commercial Group':      ['Priya Sharma', 'Andre Jackson'],
}

export default function NewSubmissionModal({ open, onClose, onCreated }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState({
    priority: 'MEDIUM',
    submissionType: 'NEW-BUSINESS',
    assignee: 'uiuxAdmin',
    effectiveDate: '',
    expirationDate: '',
    receiveDate: '',
    needByDate: '',
    agencyName: '',
    agentName: '',
    insuredName: '',
    dba: '',
    linesOfBusiness: [],
    attachments: [],
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const err = (k, msg) => setErrors(e => ({ ...e, [k]: msg }))
  const clearErr = k => setErrors(e => { const n = { ...e }; delete n[k]; return n })

  const validate = () => {
    const e = {}
    if (!form.insuredName.trim()) e.insuredName = 'Insured name is required'
    if (!form.agencyName)         e.agencyName  = 'Agency is required'
    if (!form.effectiveDate)      e.effectiveDate = 'Effective date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    const newId = 'SN129125'
    toast.success('Submission created', `${newId} created — opening now.`)
    onCreated?.()
    onClose()
    navigate(`/submissions/${newId}`)
  }

  const agentOptions = form.agencyName ? (agentsByAgency[form.agencyName] || []) : []

  const toggleLOB = lob => {
    set('linesOfBusiness', form.linesOfBusiness.includes(lob)
      ? form.linesOfBusiness.filter(l => l !== lob)
      : [...form.linesOfBusiness, lob])
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Submission"
      subtitle="Create a new GL policy submission"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="cta" loading={saving} onClick={handleSave}>Create Submission</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Row 1: Priority / Assignee / Submission Type (read-only) */}
        <div className="grid grid-cols-3 gap-4">
          <Select label="Priority" required options={priorities} value={form.priority} onChange={v => set('priority', v)} />
          <Select label="Assignee" options={assignees} value={form.assignee} onChange={v => set('assignee', v)} />
          <div>
            <label className="form-label mb-1">Submission Type</label>
            <div className="px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-sm font-mono font-semibold text-stone-500 select-none">
              NEW-BUSINESS
            </div>
            <p className="text-[11px] text-stone-400 mt-1">Renewals &amp; endorsements are created from existing policies.</p>
          </div>
        </div>

        {/* Row 2: Dates */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Policy Effective Date" required type="date" value={form.effectiveDate} onChange={e => { set('effectiveDate', e.target.value); clearErr('effectiveDate') }} error={errors.effectiveDate} />
          <Input label="Policy Expiration Date" type="date" value={form.expirationDate} onChange={e => set('expirationDate', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Receive Date" type="date" value={form.receiveDate} onChange={e => set('receiveDate', e.target.value)} />
          <Input label="Need By Date" type="date" value={form.needByDate} onChange={e => set('needByDate', e.target.value)} />
        </div>

        {/* Divider */}
        <div className="border-t border-stone-100" />

        {/* Row 3: Agency / Agent */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Agency Name" required searchable
            options={agencies} value={form.agencyName}
            onChange={v => { set('agencyName', v); set('agentName', '') }}
            error={errors.agencyName}
          />
          <Select
            label="Agent Name" searchable
            options={agentOptions} value={form.agentName}
            onChange={v => set('agentName', v)}
            placeholder={form.agencyName ? 'Select agent...' : 'Select agency first'}
            disabled={!form.agencyName}
          />
        </div>

        {/* Row 4: Insured / DBA */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Insured Name" required
            value={form.insuredName}
            onChange={e => { set('insuredName', e.target.value); clearErr('insuredName') }}
            error={errors.insuredName}
            placeholder="Legal insured name"
          />
          <Input
            label="DBA (Doing Business As)"
            value={form.dba}
            onChange={e => set('dba', e.target.value)}
            placeholder="Trade name if different"
          />
        </div>

        {/* Lines of Business */}
        <div>
          <label className="form-label">Lines of Business</label>
          <div className="grid grid-cols-4 gap-2 mt-1">
            {linesOfBiz.map(lob => (
              <button
                key={lob}
                type="button"
                onClick={() => toggleLOB(lob)}
                className={[
                  'px-3 py-2 rounded-lg text-xs font-medium border transition-colors duration-150 text-left',
                  form.linesOfBusiness.includes(lob)
                    ? 'bg-ink-800 text-white border-ink-800'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-ink-400',
                ].join(' ')}
              >
                {lob}
              </button>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label className="form-label">Attachments</label>
          <div className="mt-1 border-2 border-dashed border-stone-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-ink-400 transition-colors cursor-pointer bg-stone-25">
            <Upload className="h-8 w-8 text-stone-300" />
            <p className="text-sm text-stone-500 font-medium">Drop files here or <span className="text-ink-600 underline cursor-pointer">browse</span></p>
            <p className="text-xs text-stone-400">PDF, DOCX, XLSX — max 20 MB each</p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
