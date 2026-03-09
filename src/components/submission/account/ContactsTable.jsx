import { useState } from 'react'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Modal from '../../ui/Modal'
import Input from '../../ui/Input'
import { useToast } from '../../ui/Toast'
import { Plus, Trash2, Pencil, User } from 'lucide-react'

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', title: '' }

function ContactAvatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  const palette  = ['bg-ink-700', 'bg-flame-500', 'bg-sage-500', 'bg-amber-500']
  const bg       = palette[(firstName?.charCodeAt(0) || 0) % palette.length]
  return (
    <div className={`w-7 h-7 rounded-full ${bg} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
      {initials || <User className="h-3.5 w-3.5" />}
    </div>
  )
}

export default function ContactsTable({ contacts = [], onChange }) {
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

  const openEdit = c => {
    setEditId(c.id)
    setForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, title: c.title })
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
    if (!form.firstName.trim()) errs.firstName = 'First name is required'
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required'
    return errs
  }

  const save = () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const { firstName, lastName } = form
    if (editId !== null) {
      onChange(contacts.map(c => c.id === editId ? { ...c, ...form } : c))
      toast.success('Contact updated', `${firstName} ${lastName} has been updated.`)
    } else {
      onChange([...contacts, { ...form, id: Date.now() }])
      toast.success('Contact added', `${firstName} ${lastName} added.`)
    }
    closeModal()
  }

  const remove = id => {
    const c = contacts.find(x => x.id === id)
    if (!window.confirm(`Remove ${c?.firstName} ${c?.lastName}?`)) return
    onChange(contacts.filter(x => x.id !== id))
    toast.success('Contact removed', 'Contact has been removed.')
  }

  const isEditing = editId !== null

  return (
    <>
      <Card
        title="Account Contacts"
        subtitle={contacts.length > 0 ? `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}` : undefined}
        actions={<Button variant="secondary" size="xs" icon={Plus} onClick={openAdd}>Add Contact</Button>}
      >
        {contacts.length === 0 ? (
          <div className="py-8 text-center">
            <User className="h-8 w-8 text-stone-300 mx-auto mb-2" />
            <p className="text-sm text-stone-400">No contacts added yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="pb-2 w-9" />
                  {['Name', 'Title', 'Email', 'Phone', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-stone-400 uppercase tracking-wide pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {contacts.map(c => (
                  <tr key={c.id} className="group hover:bg-stone-25">
                    <td className="py-2.5 pr-2">
                      <ContactAvatar firstName={c.firstName} lastName={c.lastName} />
                    </td>
                    <td className="py-2.5 pr-4 font-medium text-stone-800">{c.firstName} {c.lastName}</td>
                    <td className="py-2.5 pr-4 text-stone-500">{c.title || '—'}</td>
                    <td className="py-2.5 pr-4 text-stone-500">{c.email || '—'}</td>
                    <td className="py-2.5 pr-4 text-stone-500">{c.phone || '—'}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)} className="p-1 rounded text-stone-300 hover:text-ink-600 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => remove(c.id)} className="p-1 rounded text-stone-300 hover:text-crimson-500 transition-colors">
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
        title={isEditing ? 'Edit Contact' : 'Add Contact'}
        subtitle={isEditing ? 'Update contact details' : 'Add an account contact person'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button variant="cta" onClick={save}>{isEditing ? 'Save Changes' : 'Add Contact'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" required value={form.firstName} onChange={e => set('firstName', e.target.value)} error={errors.firstName} />
            <Input label="Last Name"  required value={form.lastName}  onChange={e => set('lastName', e.target.value)}  error={errors.lastName} />
          </div>
          <Input label="Title / Role" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. CFO, Risk Manager" />
          <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          <Input label="Phone" type="tel"   value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </Modal>
    </>
  )
}
