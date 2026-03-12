import { useState } from 'react'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Modal from '../../ui/Modal'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import ConfirmDialog from '../../ui/ConfirmDialog'
import { useToast } from '../../ui/Toast'
import { Plus, Trash2, Pencil, Building2 } from 'lucide-react'

const relationships = ['Subsidiary', 'Parent Company', 'Affiliate', 'Joint Venture', 'Additional Named Insured', 'Other']
const EMPTY_FORM = { name: '', dba: '', relationship: '' }

function InsuredAvatar({ name }) {
  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'IN'
  const palette  = ['bg-ink-700', 'bg-ink-500', 'bg-sage-500', 'bg-amber-500']
  const bg       = palette[(name?.charCodeAt(0) || 0) % palette.length]
  return (
    <div className={`w-7 h-7 rounded-lg ${bg} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
      {initials}
    </div>
  )
}

export default function NamedInsuredTable({ insureds = [], onChange }) {
  const toast = useToast()
  const [open, setOpen]     = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }))
  }

  const openAdd = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setOpen(true)
  }

  const openEdit = ins => {
    setEditId(ins.id)
    setForm({ name: ins.name, dba: ins.dba, relationship: ins.relationship })
    setErrors({})
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    setErrors({})
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Business name is required'
    return errs
  }

  const save = () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (editId !== null) {
      onChange(insureds.map(i => i.id === editId ? { ...i, ...form } : i))
      toast.success('Named insured updated', `${form.name} has been updated.`)
    } else {
      onChange([...insureds, { ...form, id: Date.now() }])
      toast.success('Named insured added', `${form.name} added.`)
    }
    closeModal()
  }

  const [confirmRemove, setConfirmRemove] = useState(null)

  const remove = id => {
    const ins = insureds.find(x => x.id === id)
    setConfirmRemove({ id, name: ins?.name })
  }

  const executeRemove = () => {
    onChange(insureds.filter(x => x.id !== confirmRemove.id))
    toast.success('Named insured removed', 'Named insured has been removed.')
    setConfirmRemove(null)
  }

  const isEditing = editId !== null

  return (
    <>
      <Card
        title="Other Named Insureds"
        subtitle={insureds.length > 0 ? `${insureds.length} insured${insureds.length !== 1 ? 's' : ''}` : undefined}
        actions={<Button variant="secondary" size="xs" icon={Plus} onClick={openAdd}>Add</Button>}
      >
        {insureds.length === 0 ? (
          <div className="py-8 text-center">
            <Building2 className="h-8 w-8 text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-stone-400">No additional named insureds</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="pb-2 w-9" />
                  {['Name', 'DBA', 'Relationship', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wide pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {insureds.map(ins => (
                  <tr key={ins.id} className="group hover:bg-stone-25">
                    <td className="py-2.5 pr-2">
                      <InsuredAvatar name={ins.name} />
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-stone-800">{ins.name}</td>
                    <td className="py-2.5 pr-4 text-stone-500">{ins.dba || '—'}</td>
                    <td className="py-2.5 pr-4 text-stone-500">{ins.relationship || '—'}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(ins)} className="p-1 rounded text-stone-300 hover:text-ink-600 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(ins.id)} className="p-1 rounded text-stone-300 hover:text-crimson-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={closeModal}
        title={isEditing ? 'Edit Named Insured' : 'Add Named Insured'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="cta" onClick={save}>{isEditing ? 'Save Changes' : 'Add'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Business Name" required value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} />
          <Input label="DBA"                    value={form.dba}  onChange={e => set('dba', e.target.value)} />
          <Select label="Relationship" options={relationships} value={form.relationship} onChange={v => set('relationship', v)} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove Named Insured"
        message={`Are you sure you want to remove ${confirmRemove?.name}? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={executeRemove}
        onCancel={() => setConfirmRemove(null)}
      />
    </>
  )
}
