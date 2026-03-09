import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight, FileText, ExternalLink, Paperclip, MessageSquare,
  CheckCircle2, ShieldCheck, XCircle, Send, Plus, Check, Info, AlertTriangle, Mail, FileCheck2,
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { StatusBadge } from '../components/ui/Badge'
import { quote, ratingWorksheet, scheduleForms } from '../data/mockData'
import { useToast } from '../components/ui/Toast'

// ---------------------------------------------------------------------------
// Premium breakdown bar
// ---------------------------------------------------------------------------
function PremiumBar({ items, total }) {
  return (
    <div>
      <div className="flex rounded-lg overflow-hidden h-2.5 mb-3">
        {items.filter(i => i.value > 0).map(item => (
          <div
            key={item.label}
            style={{ width: `${(item.value / total) * 100}%` }}
            className={item.color}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
            <span className="text-xs text-stone-500">{item.label}</span>
            <span className="text-xs font-semibold font-mono text-stone-700">${item.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Send-to-Agent modal
// ---------------------------------------------------------------------------
const INITIAL_EMAIL_BODY = `Dear Michael,

Please find attached the Quote Proposal for the above-referenced submission.

Insured: Test
Effective Date: 10/01/2026
Expiration Date: 10/01/2027
Each Occurrence Limit: $100,000
Total Premium: $486.00

Please review and contact us with any questions.

Best regards,
uiuxAdmin
Solaris GL PAAs`

function SendToAgentModal({ open, onClose }) {
  const toast = useToast()
  const [body, setBody]       = useState(INITIAL_EMAIL_BODY)
  const [sending, setSending] = useState(false)
  const [attachQuote, setAttachQuote]   = useState(true)
  const [attachRating, setAttachRating] = useState(true)

  const handleSend = async () => {
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    setSending(false)
    toast.success('Quote sent to Michael Grant at Hawthorne Risk Advisors, LLC', '')
    onClose()
  }

  const handleClose = () => {
    if (sending) return
    setBody(INITIAL_EMAIL_BODY)
    setAttachQuote(true)
    setAttachRating(true)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-ink-600" />
            <h3 className="text-base font-semibold text-stone-900">Send to Agent</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={sending}
            className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-40"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* To */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">To</label>
            <div className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-mono text-stone-600 bg-stone-50">
              michael.grant@hawthornerisk.com
            </div>
          </div>
          {/* CC */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">CC</label>
            <div className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-mono text-stone-600 bg-stone-50">
              uiuxadmin@solaris.com
            </div>
          </div>
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Subject</label>
            <div className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 bg-stone-50">
              Quote Proposal — SN129105 — Test — $486.00
            </div>
          </div>
          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">Message</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={10}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 resize-y focus:outline-none focus:ring-2 focus:ring-ink-300"
            />
          </div>
          {/* Attachments */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Attachments</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAttachQuote(v => !v)}
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  attachQuote
                    ? 'bg-sage-100 border-sage-300 text-sage-800'
                    : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300',
                ].join(' ')}
              >
                <FileText className="h-3.5 w-3.5" />
                QuoteProposal
                {attachQuote && <Check className="h-3 w-3" />}
              </button>
              <button
                type="button"
                onClick={() => setAttachRating(v => !v)}
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  attachRating
                    ? 'bg-sage-100 border-sage-300 text-sage-800'
                    : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300',
                ].join(' ')}
              >
                <FileText className="h-3.5 w-3.5" />
                RatingWorksheet
                {attachRating && <Check className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-25 rounded-b-2xl flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={sending}>
            Cancel
          </Button>
          <Button variant="cta" size="sm" icon={Send} loading={sending} onClick={handleSend}>
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Bind Confirmation Modal
// ---------------------------------------------------------------------------
function BindModal({ open, onClose, onConfirm }) {
  const [paymentPlan, setPaymentPlan] = useState('Annual')
  const [surplusAck, setSurplusAck]   = useState(false)
  const [uwCert, setUwCert]           = useState(false)
  const [binding, setBinding]         = useState(false)

  const canBind = surplusAck && uwCert

  const handleConfirm = async () => {
    setBinding(true)
    await new Promise(r => setTimeout(r, 900))
    setBinding(false)
    onConfirm()
  }

  const handleClose = () => {
    if (binding) return
    setSurplusAck(false)
    setUwCert(false)
    setPaymentPlan('Annual')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100">
          <div className="w-9 h-9 rounded-full bg-sage-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-sage-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-900">Bind Policy</h3>
            <p className="text-xs text-stone-500 font-mono">Q00-0014658-00 · Effective 10/01/2026</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Policy Effective Date read-only */}
          <div>
            <label className="form-label mb-1">Policy Effective Date</label>
            <div className="px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 text-sm font-mono font-semibold text-stone-600 select-none">
              10/01/2026
            </div>
          </div>

          {/* Payment Plan */}
          <div>
            <label className="form-label mb-1">Payment Plan <span className="text-flame-500">*</span></label>
            <select
              value={paymentPlan}
              onChange={e => setPaymentPlan(e.target.value)}
              className="form-input"
            >
              <option value="Annual">Annual (Full Pay)</option>
              <option value="Semi-Annual">Semi-Annual (2 installments)</option>
              <option value="Quarterly">Quarterly (4 installments)</option>
              <option value="Monthly">Monthly (10 installments)</option>
            </select>
          </div>

          {/* Surplus Lines Acknowledgment */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={surplusAck}
              onChange={e => setSurplusAck(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-ink-700 border-stone-300 rounded focus:ring-ink-400"
            />
            <div>
              <p className="text-sm font-medium text-stone-800 group-hover:text-stone-900">
                Surplus Lines Acknowledgment <span className="text-flame-500">*</span>
              </p>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                I acknowledge this policy is written on a surplus lines basis and may not carry the same statutory protections as an admitted policy.
              </p>
            </div>
          </label>

          {/* UW Certification */}
          <label className={[
            'flex items-start gap-3 cursor-pointer group rounded-xl border p-4 transition-colors',
            uwCert ? 'bg-ink-50 border-ink-200' : 'bg-stone-50 border-stone-200 hover:border-ink-200',
          ].join(' ')}>
            <input
              type="checkbox"
              checked={uwCert}
              onChange={e => setUwCert(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-ink-700 border-stone-300 rounded focus:ring-ink-400"
            />
            <div>
              <p className={`text-sm font-semibold ${uwCert ? 'text-ink-800' : 'text-stone-700'}`}>
                Underwriter Certification <span className="text-flame-500">*</span>
              </p>
              <p className={`text-xs mt-0.5 leading-relaxed ${uwCert ? 'text-ink-600' : 'text-stone-500'}`}>
                I certify that all underwriting requirements have been met and this risk has been properly evaluated per company guidelines.
              </p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={binding}>
            Cancel
          </Button>
          <Button
            variant="cta"
            size="sm"
            icon={ShieldCheck}
            loading={binding}
            onClick={handleConfirm}
            disabled={!canBind || binding}
          >
            Bind Policy
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Issue Policy Modal
// ---------------------------------------------------------------------------
function IssueModal({ open, onClose, onConfirm, onPreview }) {
  const [issuing, setIssuing] = useState(false)

  const handleIssue = async () => {
    setIssuing(true)
    await new Promise(r => setTimeout(r, 1000))
    setIssuing(false)
    onConfirm()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={!issuing ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="text-base font-semibold text-stone-900">Issue Policy</h3>
          <p className="text-xs text-stone-500 mt-0.5">This action will finalize policy issuance.</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-lg bg-stone-50 border border-stone-200 px-4 py-3 text-sm text-stone-600 leading-relaxed">
            Please click <strong className="font-semibold text-stone-800">Issue</strong> to continue the issuance process. A <strong className="font-semibold text-stone-800">PolicyIssuance</strong> document will be generated automatically.
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3.5">
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Assigned Policy Number</p>
            <p className="font-mono text-base font-bold text-amber-900">SSIC-GLN02-0014019-26</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onPreview} disabled={issuing}>
            Preview Issuance
          </Button>
          <div className="flex-1" />
          <Button variant="secondary" size="sm" onClick={onClose} disabled={issuing}>
            Discard
          </Button>
          <Button variant="cta" size="sm" icon={FileCheck2} loading={issuing} onClick={handleIssue}>
            Issue
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Summary tab
// ---------------------------------------------------------------------------
function SummaryTab({ onBind, onIssue, bound, issued, binderDoc, policyDoc, declining, setDeclining, declined, setDeclined, dismissedExpiryBanner, setDismissedExpiryBanner }) {
  const q = quote
  const toast = useToast()
  const fileInputRef = useRef(null)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [notes, setNotes]       = useState([])

  const premiumItems = [
    { label: 'Base Premium',    value: q.basePremium,    color: 'bg-ink-600' },
    { label: 'Cert. Terrorism', value: q.certTerrorism,  color: 'bg-flame-400' },
    { label: 'Taxes & Fees',    value: q.totalTaxesFees, color: 'bg-amber-400' },
    { label: 'Other Fees',      value: q.totalOtherFees, color: 'bg-stone-300' },
  ]

  // Documents: base docs + binder doc if bound + policy doc if issued
  const documents = [
    ...q.documents,
    ...(binderDoc ? [binderDoc] : []),
    ...(policyDoc ? [policyDoc] : []),
  ]

  const handleOpenDoc = doc => {
    toast.info('Opening document', `${doc.name} is loading…`)
  }

  const handleSaveNote = () => {
    if (!noteText.trim()) return
    setNotes(n => [
      ...n,
      {
        text: noteText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setNoteText('')
    setNoteOpen(false)
    toast.success('Note added', 'Diary note saved successfully.')
  }

  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (file) toast.success('File attached', `${file.name} uploaded.`)
    e.target.value = ''
  }

  const handleDeclineConfirm = () => {
    setDeclined(true)
    setDeclining(false)
    toast.error('Quote Declined', 'This quote has been declined.')
  }

  const statusLabel     = issued ? 'Issued' : bound ? 'Bound' : declined ? 'Declined' : 'Offered'
  const statusColor     = issued ? 'bg-ink-700' : bound ? 'bg-sage-500' : declined ? 'bg-crimson-500' : 'bg-sage-500'
  const statusBorder    = issued
    ? 'border-ink-200 bg-ink-50'
    : bound
      ? 'border-sage-200 bg-sage-50'
      : declined
        ? 'border-crimson-200 bg-crimson-50'
        : 'border-sage-200 bg-sage-50'
  const statusTextColor = issued ? 'text-ink-700' : bound ? 'text-sage-700' : declined ? 'text-crimson-700' : 'text-sage-700'

  const isOffered = !bound && !declined && !issued

  return (
    <div className="space-y-4">
      {/* Quote Expiry Banner — only when Offered and not dismissed */}
      {isOffered && !dismissedExpiryBanner && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-sm font-medium flex-1">
            Quote expires in <span className="font-bold font-mono">25 days</span> — bind or extend before <span className="font-mono font-bold">03/31/2026</span>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                toast.success('Quote extended. New expiry: 04/30/2026', '')
              }}
              className="text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-md transition-colors"
            >
              Extend
            </button>
            <button
              type="button"
              onClick={() => setDismissedExpiryBanner(true)}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 px-1.5 py-1 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Post-bind / post-issue banner */}
      {issued && (
        <div className="flex items-start gap-3 bg-ink-50 border border-ink-200 rounded-xl px-5 py-3.5">
          <FileCheck2 className="h-5 w-5 text-ink-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ink-800">
              Policy is Successfully Issued.
            </p>
            <p className="text-xs text-ink-500 mt-0.5 font-mono">Policy #: SSIC-GLN02-0014019-26</p>
          </div>
        </div>
      )}
      {bound && !issued && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Policy is Successfully Bound — Binder issued. Policy effective 10/01/2026.
            </p>
            <p className="text-xs text-amber-700 mt-0.5 font-mono">Policy #: POL-0014019</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left: documents + diary + attachments */}
        <div className="col-span-2 space-y-5">
          <Card title="Documents" subtitle="Auto-generated quote documents">
            {documents.length === 0 ? (
              <p className="text-sm text-stone-400 py-6 text-center">No documents generated yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-25">
                    <tr>
                      {['Type', 'Document', 'Generated By', 'Date'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {documents.map((doc, i) => (
                      <tr key={i} className="hover:bg-stone-25 group">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                            <FileText className="h-3 w-3" />{doc.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleOpenDoc(doc)}
                            className="inline-flex items-center gap-1 text-ink-600 hover:text-ink-800 font-medium text-sm hover:underline"
                          >
                            {doc.name}
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-stone-600">{doc.generatedBy}</td>
                        <td className="px-4 py-3 text-stone-500 text-xs font-mono">{doc.generatedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card
            title="Diary Notes"
            actions={
              <Button variant="secondary" size="xs" icon={MessageSquare} onClick={() => setNoteOpen(o => !o)}>
                Add Note
              </Button>
            }
          >
            {noteOpen && (
              <div className="mb-4 space-y-2">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Enter diary note…"
                  rows={3}
                  className="w-full text-sm border border-stone-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="xs" onClick={() => { setNoteOpen(false); setNoteText('') }}>
                    Cancel
                  </Button>
                  <Button variant="cta" size="xs" icon={Send} onClick={handleSaveNote}>
                    Save Note
                  </Button>
                </div>
              </div>
            )}
            {notes.length > 0 ? (
              <div className="space-y-2">
                {notes.map((n, i) => (
                  <div key={i} className="rounded-lg bg-stone-25 border border-stone-100 px-4 py-3">
                    <p className="text-sm text-stone-700">{n.text}</p>
                    <p className="text-xs text-stone-400 mt-1 font-mono">{n.time}</p>
                  </div>
                ))}
              </div>
            ) : !noteOpen && (
              <div className="py-8 text-center">
                <MessageSquare className="h-8 w-8 text-stone-200 mx-auto mb-2" />
                <p className="text-sm text-stone-400">No diary notes for this quote.</p>
              </div>
            )}
          </Card>

          <Card
            title="Attachments"
            actions={
              <>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                <Button variant="secondary" size="xs" icon={Paperclip} onClick={() => fileInputRef.current?.click()}>
                  Attach File
                </Button>
              </>
            }
          >
            <div className="py-8 text-center">
              <Paperclip className="h-8 w-8 text-stone-200 mx-auto mb-2" />
              <p className="text-sm text-stone-400">No attachments uploaded.</p>
            </div>
          </Card>
        </div>

        {/* Right: status + premium */}
        <div className="space-y-4">
          {/* Quote status */}
          <div className={`rounded-xl border overflow-hidden ${statusBorder}`}>
            <div className="px-5 py-5 flex flex-col items-center text-center">
              <div className="relative mb-3">
                {!declined && (
                  <div className={`absolute inset-0 rounded-full ${statusColor} animate-ping opacity-40`} />
                )}
                <div
                  className={`relative w-14 h-14 rounded-full ${issued ? 'bg-ink-100' : bound ? 'bg-sage-100' : declined ? 'bg-crimson-100' : 'bg-sage-100'} flex items-center justify-center`}
                >
                  {declined
                    ? <XCircle className="h-7 w-7 text-crimson-600" />
                    : issued
                      ? <FileCheck2 className="h-7 w-7 text-ink-600" />
                      : <CheckCircle2 className="h-7 w-7 text-sage-600" />
                  }
                </div>
              </div>
              <p className={`text-base font-bold ${statusTextColor}`}>
                {issued ? 'Policy Issued' : bound ? 'Policy Bound' : declined ? 'Quote Declined' : 'Successfully Offered'}
              </p>
              <StatusBadge status={statusLabel} className="mt-1" />
            </div>
            <dl
              className={`px-5 pb-5 space-y-2.5 border-t pt-4 ${bound ? 'border-sage-200' : declined ? 'border-crimson-200' : 'border-sage-200'}`}
            >
              {[
                ['Quote #',         q.id],
                ['Effective Date',  q.effectiveDate],
                ['Expiration Date', q.expirationDate],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <dt className={statusTextColor}>{k}</dt>
                  <dd className={`font-semibold font-mono ${bound ? 'text-sage-800' : declined ? 'text-crimson-800' : 'text-sage-800'}`}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Premium breakdown */}
          <Card title="Premium Breakdown">
            <PremiumBar items={premiumItems} total={q.totalPremium} />

            <div className="mt-5 space-y-2">
              {premiumItems.map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-stone-500">{label}</span>
                  <span className="font-mono font-medium text-stone-800">${value.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-stone-200 pt-3 mt-1 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900">Total Premium</span>
                <span className="text-2xl font-black font-mono text-ink-800">${q.totalPremium.toFixed(2)}</span>
              </div>
            </div>

            {!bound && !declined && !issued && (
              <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
                <Button variant="cta" size="sm" className="w-full justify-center" icon={ShieldCheck} onClick={onBind}>
                  Bind Policy
                </Button>
                {!declining ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center"
                    icon={XCircle}
                    onClick={() => setDeclining(true)}
                  >
                    Decline Quote
                  </Button>
                ) : (
                  <div className="rounded-lg bg-crimson-50 border border-crimson-200 p-3 space-y-2">
                    <p className="text-xs font-semibold text-crimson-700">Confirm decline?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeclineConfirm}
                        className="flex-1 text-xs font-semibold bg-crimson-600 text-white rounded-lg py-1.5 hover:bg-crimson-700 transition-colors"
                      >
                        Yes, Decline
                      </button>
                      <button
                        onClick={() => setDeclining(false)}
                        className="flex-1 text-xs font-semibold bg-white border border-stone-200 text-stone-600 rounded-lg py-1.5 hover:bg-stone-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {bound && !issued && (
              <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
                <Button variant="cta" size="sm" className="w-full justify-center" icon={FileCheck2} onClick={onIssue}>
                  Issue Policy
                </Button>
                <div className="rounded-lg bg-sage-50 border border-sage-200 px-4 py-3 text-center">
                  <CheckCircle2 className="h-5 w-5 text-sage-500 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-sage-700">Policy Bound</p>
                  <p className="text-xs text-sage-600 mt-0.5 font-mono">POL-0014019</p>
                </div>
              </div>
            )}

            {issued && (
              <div className="mt-5 pt-4 border-t border-stone-100">
                <div className="rounded-lg bg-ink-50 border border-ink-200 px-4 py-3 text-center">
                  <FileCheck2 className="h-5 w-5 text-ink-600 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-ink-700">Policy Issued</p>
                  <p className="text-xs text-ink-500 mt-0.5 font-mono">SSIC-GLN02-0014019-26</p>
                </div>
              </div>
            )}

            {declined && (
              <div className="mt-5 pt-4 border-t border-stone-100">
                <div className="rounded-lg bg-crimson-50 border border-crimson-200 px-4 py-3 text-center">
                  <XCircle className="h-5 w-5 text-crimson-500 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-crimson-700">Quote Declined</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Subjectivity modals
// ---------------------------------------------------------------------------
function SubjModal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

const INITIAL_SUBJECTIVITIES = [
  { id: 1, text: 'Signed application on file',          category: 'Pre-Bind',  status: 'Satisfied', waived: false },
  { id: 2, text: 'Loss runs verified (5 years)',        category: 'Pre-Bind',  status: 'Satisfied', waived: false },
  { id: 3, text: 'Inspection completed within 60 days', category: 'Post-Bind', status: 'Open',      waived: false },
  { id: 4, text: 'Certificate of insurance provided',   category: 'Post-Bind', status: 'Open',      waived: false },
  { id: 5, text: 'Asbestos exclusion acknowledged',     category: 'Pre-Bind',  status: 'Open',      waived: true  },
]

function SubjectivityTab() {
  const toast = useToast()
  const [subjectivities, setSubjectivities] = useState(INITIAL_SUBJECTIVITIES)

  const [satisfyTarget, setSatisfyTarget] = useState(null)
  const [satisfyNote, setSatisfyNote]     = useState('')
  const [waiveTarget, setWaiveTarget]     = useState(null)
  const [waiveReason, setWaiveReason]     = useState('')
  const [addOpen, setAddOpen]             = useState(false)
  const [newText, setNewText]             = useState('')
  const [newCategory, setNewCategory]     = useState('Pre-Bind')

  const preBind      = subjectivities.filter(s => s.category === 'Pre-Bind')
  const postBind     = subjectivities.filter(s => s.category === 'Post-Bind')
  const preSatisfied = preBind.filter(s => s.status === 'Satisfied' || s.waived).length
  const postOpen     = postBind.filter(s => s.status === 'Open' && !s.waived).length
  const waivedCount  = subjectivities.filter(s => s.waived).length
  const allPreBindMet = preBind.filter(s => !s.waived).every(s => s.status === 'Satisfied')

  const handleSatisfy = () => {
    setSubjectivities(prev =>
      prev.map(s => s.id === satisfyTarget.id ? { ...s, status: 'Satisfied' } : s)
    )
    toast.success('Subjectivity satisfied', `"${satisfyTarget.text}" marked as satisfied.`)
    setSatisfyTarget(null)
    setSatisfyNote('')
  }

  const handleWaive = () => {
    setSubjectivities(prev =>
      prev.map(s => s.id === waiveTarget.id ? { ...s, waived: true } : s)
    )
    toast.success('Subjectivity waived', `"${waiveTarget.text}" has been waived.`)
    setWaiveTarget(null)
    setWaiveReason('')
  }

  const handleAdd = () => {
    if (!newText.trim()) return
    const id = Date.now()
    setSubjectivities(prev => [
      { id, text: newText.trim(), category: newCategory, status: 'Open', waived: false },
      ...prev,
    ])
    toast.success('Subjectivity added', `"${newText.trim()}" added to the list.`)
    setNewText('')
    setNewCategory('Pre-Bind')
    setAddOpen(false)
  }

  return (
    <div className="space-y-5">
      {/* Satisfy Modal */}
      <SubjModal
        open={!!satisfyTarget}
        onClose={() => { setSatisfyTarget(null); setSatisfyNote('') }}
        title="Mark as Satisfied"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-700">
            Marking <strong className="font-semibold">"{satisfyTarget?.text}"</strong> as satisfied.
          </p>
          <div>
            <label className="form-label">Note (optional)</label>
            <textarea
              value={satisfyNote}
              onChange={e => setSatisfyNote(e.target.value)}
              placeholder="Add a note about how this was satisfied..."
              rows={3}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" size="sm" onClick={() => { setSatisfyTarget(null); setSatisfyNote('') }}>Cancel</Button>
            <Button variant="success" size="sm" icon={CheckCircle2} onClick={handleSatisfy}>Mark Satisfied</Button>
          </div>
        </div>
      </SubjModal>

      {/* Waive Modal */}
      <SubjModal
        open={!!waiveTarget}
        onClose={() => { setWaiveTarget(null); setWaiveReason('') }}
        title="Waive Subjectivity"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-700">
            Waiving <strong className="font-semibold">"{waiveTarget?.text}"</strong>.
          </p>
          <div>
            <label className="form-label">Reason for waiver <span className="text-flame-500">*</span></label>
            <textarea
              value={waiveReason}
              onChange={e => setWaiveReason(e.target.value)}
              placeholder="Provide a reason for waiving this subjectivity..."
              rows={3}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" size="sm" onClick={() => { setWaiveTarget(null); setWaiveReason('') }}>Cancel</Button>
            <Button variant="secondary" size="sm" onClick={handleWaive}>Waive</Button>
          </div>
        </div>
      </SubjModal>

      {/* Add Modal */}
      <SubjModal open={addOpen} onClose={() => setAddOpen(false)} title="Add Subjectivity">
        <div className="space-y-4">
          <div>
            <label className="form-label">Subjectivity Text <span className="text-flame-500">*</span></label>
            <input
              type="text"
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="Describe the requirement..."
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-300"
            />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="form-input"
            >
              <option value="Pre-Bind">Pre-Bind</option>
              <option value="Post-Bind">Post-Bind</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="cta" size="sm" icon={Plus} onClick={handleAdd}>Add</Button>
          </div>
        </div>
      </SubjModal>

      {/* Summary strip */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-4 py-2.5 shadow-sm">
          <span className="text-xs text-stone-500">Pre-Bind:</span>
          <span className="font-mono text-sm font-bold text-ink-800">{preSatisfied}/{preBind.length}</span>
          <span className="text-xs text-stone-400">satisfied</span>
        </div>
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-4 py-2.5 shadow-sm">
          <span className="text-xs text-stone-500">Post-Bind:</span>
          <span className="font-mono text-sm font-bold text-amber-600">{postOpen}</span>
          <span className="text-xs text-stone-400">open</span>
        </div>
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-4 py-2.5 shadow-sm">
          <span className="text-xs text-stone-500">Waived:</span>
          <span className="font-mono text-sm font-bold text-stone-600">{waivedCount}</span>
        </div>
        <div className="ml-auto">
          <Button variant="secondary" size="sm" icon={Plus} onClick={() => setAddOpen(true)}>
            Add Subjectivity
          </Button>
        </div>
      </div>

      {allPreBindMet && (
        <div className="flex items-center gap-3 bg-sage-50 border border-sage-200 rounded-xl px-5 py-3.5">
          <CheckCircle2 className="h-5 w-5 text-sage-600 shrink-0" />
          <p className="text-sm font-medium text-sage-700">All pre-bind requirements met. Ready to bind.</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-25 border-b border-stone-100">
              <tr>
                {['#', 'Subjectivity', 'Category', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-stone-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {subjectivities.map((s, idx) => (
                <tr key={s.id} className="hover:bg-stone-25 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-stone-400">{idx + 1}</td>
                  <td className="px-4 py-3 text-stone-800">{s.text}</td>
                  <td className="px-4 py-3">
                    {s.category === 'Pre-Bind' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-flame-100 text-flame-700">
                        Pre-Bind
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
                        Post-Bind
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.waived ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-stone-100 text-stone-600">
                        Waived
                      </span>
                    ) : s.status === 'Satisfied' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-sage-100 text-sage-700">
                        Satisfied
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-crimson-100 text-crimson-700">
                        Open
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {s.waived || s.status === 'Satisfied' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                        <Check className="h-3.5 w-3.5" />
                        {s.waived ? 'Waived' : 'Done'}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSatisfyTarget(s)}
                          className="text-xs font-medium text-sage-700 hover:text-sage-800 border border-sage-300 hover:border-sage-400 bg-sage-50 hover:bg-sage-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          Satisfy
                        </button>
                        <button
                          type="button"
                          onClick={() => setWaiveTarget(s)}
                          className="text-xs font-medium text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50 px-2.5 py-1 rounded-md transition-colors"
                        >
                          Waive
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Rating tab
// ---------------------------------------------------------------------------
const LIMITS_ROWS = [
  { type: 'Each Occurrence',              amount: '100,000 CSL' },
  { type: 'General Aggregate',            amount: '200,000 CSL' },
  { type: 'Products/Comp Ops Aggregate',  amount: '200,000 CSL' },
  { type: 'Personal & Adv Injury',        amount: '100,000' },
  { type: 'Damage to Rented Premises',    amount: '100,000' },
  { type: 'Med Pay',                      amount: '5,000' },
]

function RatingTab() {
  const ws = ratingWorksheet
  const loc = ws.locations[0]
  const cls = loc.classifications[0]
  const po  = cls.premOps
  const pc  = cls.prodCompOps

  const locTotal      = po.premium + pc.premium   // 386.00
  const terrorism     = ws.certifiedTerrorismPremium   // 100.00
  const grandTotal    = ws.totalPremium                // 486.00

  return (
    <div className="space-y-5">
      {/* Limits card */}
      <Card title="Policy Limits">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Limit Type', 'Amount'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {LIMITS_ROWS.map(r => (
                <tr key={r.type} className="hover:bg-stone-25">
                  <td className="px-4 py-3 text-stone-700 text-sm">{r.type}</td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-stone-800">{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Classification rating detail card */}
      <Card title="Rating Detail — Location 1" subtitle="Per-location per-classification rating">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {[
                  'Class Code', 'Description', 'Territory', 'Premium Basis',
                  'Exposure', 'Loss Cost', 'LCM', 'Base Rate',
                  'Final ILF', 'Ded. Factor', 'Final Rate',
                  'Prem Ops $', 'Prod Comp $',
                ].map(h => (
                  <th
                    key={h}
                    className={[
                      'px-3 py-2.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap',
                      h === 'Prem Ops $' || h === 'Prod Comp $' ? 'text-right' : 'text-left',
                    ].join(' ')}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {/* Prem Ops row */}
              <tr className="hover:bg-stone-25 transition-colors">
                <td className="px-3 py-3 font-mono font-semibold text-ink-700">{cls.classCode}</td>
                <td className="px-3 py-3 text-stone-700">{cls.classDescription}</td>
                <td className="px-3 py-3 font-mono text-stone-600">{cls.premOpsTerritoryCode}</td>
                <td className="px-3 py-3 text-stone-600">{cls.premOpsPremiumBasis}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{Number(po.exposure).toLocaleString()}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{po.lossCost.toFixed(4)}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{po.lcm.toFixed(4)}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{po.baseRate.toFixed(4)}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{po.finalIlf.toFixed(4)}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{po.finalDeductibleFactor.toFixed(4)}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{po.finalRate.toFixed(4)}</td>
                <td className="px-3 py-3 font-mono font-semibold text-stone-800 text-right">
                  ${po.premium.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-stone-400 text-right">—</td>
              </tr>
              {/* Prod/Comp Ops row */}
              <tr className="hover:bg-stone-25 transition-colors">
                <td className="px-3 py-3 font-mono font-semibold text-ink-700">{cls.classCode}</td>
                <td className="px-3 py-3 text-stone-700">{cls.classDescription}</td>
                <td className="px-3 py-3 font-mono text-stone-600">{cls.prodCompOpsTerritoryCode}</td>
                <td className="px-3 py-3 text-stone-600">{cls.prodCompOpsPremiumBasis}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{Number(pc.exposure).toLocaleString()}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{pc.lossCost.toFixed(4)}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{pc.lcm.toFixed(4)}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{pc.baseRate.toFixed(4)}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{pc.finalIlf.toFixed(4)}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{pc.finalDeductibleFactor.toFixed(4)}</td>
                <td className="px-3 py-3 font-mono text-stone-700">{pc.finalRate.toFixed(4)}</td>
                <td className="px-3 py-3 text-stone-400 text-right">—</td>
                <td className="px-3 py-3 font-mono font-semibold text-stone-800 text-right">
                  ${pc.premium.toFixed(2)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              {/* Subtotal row */}
              <tr className="bg-stone-50 border-t border-stone-200">
                <td colSpan={11} className="px-3 py-3 text-xs font-bold text-stone-700 text-right">
                  Location Subtotal
                </td>
                <td colSpan={2} className="px-3 py-3 font-mono font-bold text-stone-900 text-right">
                  ${locTotal.toFixed(2)}
                </td>
              </tr>
              {/* Certified terrorism */}
              <tr className="bg-amber-50 border-t border-amber-100">
                <td colSpan={11} className="px-3 py-3 text-xs font-semibold text-amber-700 text-right">
                  Certified Terrorism (CG 21 73 01 15)
                </td>
                <td colSpan={2} className="px-3 py-3 font-mono font-semibold text-amber-800 text-right">
                  ${terrorism.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Grand total highlighted box */}
        <div className="mt-5 flex justify-end">
          <div className="bg-ink-700 text-white rounded-xl px-8 py-4 text-right shadow-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-200 mb-1">
              Grand Total Premium
            </p>
            <p className="font-mono text-3xl font-black tracking-tight">
              ${grandTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Forms tab
// ---------------------------------------------------------------------------
function FormsTab() {
  const totalOptional = scheduleForms
    .filter(f => f.premium !== null)
    .reduce((sum, f) => sum + f.premium, 0)

  return (
    <div className="space-y-4">
      <Card title="Schedule of Forms" subtitle="Compulsory and optional policy forms">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {['Form Number', 'Form Name', 'Type', 'Premium'].map(h => (
                  <th
                    key={h}
                    className={[
                      'px-4 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap',
                      h === 'Premium' ? 'text-right' : 'text-left',
                    ].join(' ')}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {scheduleForms.map(f => (
                <tr key={f.number} className="hover:bg-stone-25 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-ink-700 whitespace-nowrap">
                    {f.number}
                  </td>
                  <td className="px-4 py-3 text-stone-700 text-xs leading-snug">{f.name}</td>
                  <td className="px-4 py-3">
                    {f.type === 'c' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-stone-100 text-stone-600">
                        Compulsory
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-700 text-right">
                    {f.premium !== null ? `$${f.premium.toFixed(2)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-amber-50 border-t border-amber-200">
                <td colSpan={3} className="px-4 py-3 text-xs font-bold text-amber-800 text-right">
                  Total Optional Premium
                </td>
                <td className="px-4 py-3 font-mono text-xs font-bold text-amber-900 text-right">
                  ${totalOptional.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ---------------------------------------------------------------------------
// QuoteSummaryPage
// ---------------------------------------------------------------------------
export default function QuoteSummaryPage() {
  const navigate      = useNavigate()
  const toast         = useToast()
  const [tab, setTab] = useState('summary')
  const [bound, setBound]         = useState(false)
  const [issued, setIssued]       = useState(false)
  const [declining, setDeclining] = useState(false)
  const [declined, setDeclined]   = useState(false)
  const [binderDoc, setBinderDoc] = useState(null)
  const [policyDoc, setPolicyDoc] = useState(null)
  const [bindModalOpen, setBindModalOpen]   = useState(false)
  const [issueModalOpen, setIssueModalOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen]   = useState(false)
  const [dismissedExpiryBanner, setDismissedExpiryBanner] = useState(false)
  const q = quote

  const handleBindClick = () => setBindModalOpen(true)

  const handleBindConfirm = () => {
    const now = new Date()
    const dateStr = [
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      now.getFullYear(),
    ].join('/') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    setBound(true)
    setDeclining(false)
    setBindModalOpen(false)
    setBinderDoc({
      type: 'Binder',
      name: 'BND-0014019',
      generatedBy: 'uiuxAdmin',
      generatedDate: dateStr,
    })
    toast.success('Policy Bound', 'Binder issued. Policy #: POL-0014019.')
  }

  const handleIssueConfirm = () => {
    const now = new Date()
    const dateStr = [
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      now.getFullYear(),
    ].join('/') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    setIssued(true)
    setIssueModalOpen(false)
    setPolicyDoc({
      type: 'PolicyIssuance',
      name: 'PolicyIssuance',
      generatedBy: 'uiuxAdmin',
      generatedDate: dateStr,
    })
    toast.success('Policy Issued', 'Policy SSIC-GLN02-0014019-26 has been successfully issued.')
  }

  const TABS = [
    { id: 'summary',      label: 'Summary' },
    { id: 'subjectivity', label: 'Subjectivity' },
    { id: 'rating',       label: 'Rating' },
    { id: 'forms',        label: 'Forms' },
  ]

  return (
    <div className="max-w-[1200px] mx-auto space-y-4">
      {/* Enterprise header with Bind CTA */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        <div className="h-1 bg-sage-500" />
        <div className="px-6 py-4">
          <nav className="flex items-center gap-1 text-xs text-stone-400 mb-3">
            <button onClick={() => navigate('/')} className="hover:text-ink-600 transition-colors">
              Dashboard
            </button>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => navigate(-1)} className="hover:text-ink-600 transition-colors">
              {q.submissionNumber}
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="font-mono font-semibold text-ink-700">{q.id}</span>
          </nav>

          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-ink-700 bg-ink-50 px-2 py-0.5 rounded">
                  {q.id}
                </span>
                <StatusBadge status={issued ? 'Issued' : bound ? 'Bound' : declined ? 'Declined' : q.status} />
                {issued && (
                  <span className="font-mono text-xs font-bold text-ink-700 bg-ink-100 px-2 py-0.5 rounded">
                    SSIC-GLN02-0014019-26
                  </span>
                )}
                {bound && !issued && (
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    POL-0014019
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-stone-900">{q.submissionNumber}</h1>
              <p className="text-sm text-stone-500 mt-0.5">
                Effective {q.effectiveDate} — {q.expirationDate}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Total Premium</p>
                <p className="text-2xl font-black font-mono text-ink-800">${q.totalPremium.toFixed(2)}</p>
              </div>
              <Button variant="secondary" size="sm" icon={Mail} onClick={() => setSendModalOpen(true)}>
                Send to Agent
              </Button>
              {!bound && !declined && !issued && (
                <Button variant="cta" size="sm" icon={ShieldCheck} onClick={handleBindClick}>
                  Bind Policy
                </Button>
              )}
              {bound && !issued && (
                <Button variant="cta" size="sm" icon={FileCheck2} onClick={() => setIssueModalOpen(true)}>
                  Issue Policy
                </Button>
              )}
              {issued && (
                <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 bg-ink-50 border border-ink-200 px-3 py-2 rounded-lg">
                  <FileCheck2 className="h-4 w-4" /> Issued
                </div>
              )}
              {bound && !issued && (
                <div className="flex items-center gap-2 text-sm font-semibold text-sage-700 bg-sage-50 border border-sage-200 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" /> Bound
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex border-t border-stone-100 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'px-6 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap',
                tab === t.id
                  ? 'text-ink-800 border-ink-700'
                  : 'text-stone-500 border-transparent hover:text-stone-700 hover:bg-stone-50',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {tab === 'summary' && (
          <SummaryTab
            onBind={handleBindClick}
            onIssue={() => setIssueModalOpen(true)}
            bound={bound}
            issued={issued}
            binderDoc={binderDoc}
            policyDoc={policyDoc}
            declining={declining}
            setDeclining={setDeclining}
            declined={declined}
            setDeclined={setDeclined}
            dismissedExpiryBanner={dismissedExpiryBanner}
            setDismissedExpiryBanner={setDismissedExpiryBanner}
          />
        )}
        {tab === 'subjectivity' && <SubjectivityTab />}
        {tab === 'rating'       && <RatingTab />}
        {tab === 'forms'        && <FormsTab />}
      </div>

      {/* Send to Agent Modal */}
      <SendToAgentModal open={sendModalOpen} onClose={() => setSendModalOpen(false)} />

      {/* Bind Confirmation Modal */}
      <BindModal
        open={bindModalOpen}
        onClose={() => setBindModalOpen(false)}
        onConfirm={handleBindConfirm}
      />

      {/* Issue Policy Modal */}
      <IssueModal
        open={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        onConfirm={handleIssueConfirm}
        onPreview={() => toast.info('Preview', 'Policy issuance preview is loading…')}
      />
    </div>
  )
}
