import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Download, Search, Filter,
  File, BookOpen, Shield, Award, Clipboard,
  X, RefreshCw, Send, CheckSquare, Square,
  Loader2, Eye,
} from 'lucide-react'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import { quote, ratingWorksheet, submissions, account } from '../data/mockData'

// ── Document base data ────────────────────────────────────────────────────────

const EXTRA_DOCS = [
  { type: 'QuoteProposal',   name: 'QuoteProposal',     submission: 'SN129106', generatedBy: 'jsmith',     date: '03/04/2026 14:33:12', status: 'Ready' },
  { type: 'RatingWorksheet', name: 'RatingWorksheet',   submission: 'SN129106', generatedBy: 'jsmith',     date: '03/04/2026 14:33:45', status: 'Ready' },
  { type: 'QuoteProposal',   name: 'QuoteProposal',     submission: 'SN129107', generatedBy: 'adavis',     date: '03/03/2026 09:15:30', status: 'Ready' },
  { type: 'Policy',          name: 'Policy Document',   submission: 'SN129112', generatedBy: 'jsmith',     date: '03/01/2026 16:44:20', status: 'Ready' },
  { type: 'Certificate',     name: 'Cert of Insurance', submission: 'SN129112', generatedBy: 'jsmith',     date: '03/01/2026 16:50:00', status: 'Ready' },
  { type: 'Endorsement',     name: 'Endorsement Form',  submission: 'SN129110', generatedBy: 'mrodriguez', date: '03/05/2026 08:22:11', status: 'Ready' },
  { type: 'QuoteProposal',   name: 'QuoteProposal',     submission: 'SN129116', generatedBy: 'jsmith',     date: '03/04/2026 11:05:55', status: 'Ready' },
  { type: 'RatingWorksheet', name: 'RatingWorksheet',   submission: 'SN129116', generatedBy: 'jsmith',     date: '03/04/2026 11:06:30', status: 'Ready' },
  { type: 'Policy',          name: 'Policy Document',   submission: 'SN129119', generatedBy: 'jsmith',     date: '03/02/2026 13:20:00', status: 'Ready' },
  { type: 'Certificate',     name: 'Cert of Insurance', submission: 'SN129122', generatedBy: 'adavis',     date: '03/03/2026 10:45:00', status: 'Ready' },
  { type: 'QuoteProposal',   name: 'QuoteProposal',     submission: 'SN129108', generatedBy: 'uiuxAdmin',  date: '03/05/2026 07:30:00', status: 'Ready' },
  { type: 'Endorsement',     name: 'Endorsement Form',  submission: 'SN129117', generatedBy: 'mrodriguez', date: '03/05/2026 09:00:00', status: 'Ready' },
  // 2 pending (Generating) docs
  { type: 'QuoteProposal',   name: 'QuoteProposal',     submission: 'SN129120', generatedBy: 'uiuxAdmin',  date: '03/06/2026 08:00:00', status: 'Generating' },
  { type: 'RatingWorksheet', name: 'RatingWorksheet',   submission: 'SN129121', generatedBy: 'mrodriguez', date: '03/06/2026 08:05:00', status: 'Generating' },
]

// Seed from quote.documents, add extras, assign ids
const INITIAL_DOCUMENTS = [
  ...quote.documents.map(d => ({
    type:        d.type,
    name:        d.name,
    submission:  quote.submissionNumber,
    generatedBy: d.generatedBy,
    date:        d.generatedDate,
    status:      'Ready',
  })),
  ...EXTRA_DOCS,
].map((d, i) => ({ ...d, id: i + 1 }))

// ── Type badge config ─────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  QuoteProposal:   { bg: 'bg-ink-50',     text: 'text-ink-700',     ring: 'ring-ink-200',     icon: BookOpen,  label: 'Quote Proposal'   },
  RatingWorksheet: { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200',   icon: Clipboard, label: 'Rating Worksheet' },
  Policy:          { bg: 'bg-sage-50',    text: 'text-sage-700',    ring: 'ring-sage-200',    icon: Shield,    label: 'Policy'           },
  Certificate:     { bg: 'bg-flame-50',   text: 'text-flame-700',   ring: 'ring-flame-200',   icon: Award,     label: 'Certificate'      },
  Endorsement:     { bg: 'bg-crimson-50', text: 'text-crimson-700', ring: 'ring-crimson-200', icon: File,      label: 'Endorsement'      },
}

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || { bg: 'bg-stone-100', text: 'text-stone-600', ring: 'ring-stone-200', icon: FileText, label: type }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
      <Icon className="h-3 w-3 shrink-0" />
      {cfg.label}
    </span>
  )
}

// ── Avatar helpers ────────────────────────────────────────────────────────────

const AVATAR_COLORS = {
  uiuxAdmin:  'bg-ink-700',
  jsmith:     'bg-sage-600',
  adavis:     'bg-amber-600',
  mrodriguez: 'bg-amber-500',
}

function avatarColor(name) {
  return AVATAR_COLORS[name] || 'bg-stone-400'
}

// ── Date range filter helper ──────────────────────────────────────────────────

function parseDocDate(dateStr) {
  const [datePart] = dateStr.split(' ')
  const [month, day, year] = datePart.split('/')
  return new Date(`${year}-${month}-${day}`)
}

function withinRange(dateStr, range) {
  if (range === 'all') return true
  const docDate = parseDocDate(dateStr)
  const now = new Date('2026-03-06')
  const msPerDay = 86400000
  if (range === '7d')  return now - docDate <= 7  * msPerDay
  if (range === '30d') return now - docDate <= 30 * msPerDay
  return true
}

// ── Quote Letter Preview (rendered HTML "PDF") ────────────────────────────────

function QuoteLetterPreview({ doc }) {
  // Find the matching submission to pull insured info
  const sub = submissions.find(s => s.submissionNumber === doc.submission) || submissions[0]
  const cls = ratingWorksheet.locations[0]?.classifications[0]
  const limits = ratingWorksheet.limits
  const isRatingSheet = doc.type === 'RatingWorksheet'

  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-8 text-[11px] leading-relaxed text-stone-800 font-mono print-content">
      {/* Letterhead */}
      <div className="flex items-start justify-between border-b border-stone-300 pb-4 mb-6">
        <div>
          <p className="text-base font-black text-ink-700 tracking-tight font-sans">SOLARIS</p>
          <p className="text-[10px] text-stone-400 font-sans">General Liability Policy Administration</p>
        </div>
        <div className="text-right text-[10px] text-stone-500">
          <p>Document Generated: {doc.date}</p>
          <p>By: {doc.generatedBy}</p>
        </div>
      </div>

      {/* Document Title */}
      <h3 className="text-sm font-bold text-stone-900 mb-4 font-sans uppercase tracking-wide">
        {isRatingSheet ? 'Rating Worksheet' : 'Quote Proposal'}
      </h3>

      {/* Submission / Insured Info */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mb-6 border border-stone-200 rounded p-4 bg-stone-50/50">
        <Row label="Submission #" value={doc.submission} />
        <Row label="Quote #" value={quote.id} />
        <Row label="Named Insured" value={sub.insuredName} />
        <Row label="DBA" value={sub.dba || '—'} />
        <Row label="Agency" value={sub.agencyName} />
        <Row label="Agent" value={sub.agentName} />
        <Row label="Effective" value={sub.effectiveDate || quote.effectiveDate} />
        <Row label="Expiration" value={sub.expirationDate || quote.expirationDate} />
        <Row label="State" value={sub.state} />
        <Row label="Transaction" value={sub.transactionType} />
      </div>

      {/* Limits Table */}
      <SectionTitle>Coverage Limits</SectionTitle>
      <table className="w-full mb-6 border border-stone-200 text-[10px]">
        <thead>
          <tr className="bg-stone-100">
            <th className="text-left px-3 py-1.5 font-bold text-stone-600 border-b border-stone-200">Limit Type</th>
            <th className="text-right px-3 py-1.5 font-bold text-stone-600 border-b border-stone-200">Limit</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(limits).map(([key, val]) => (
            <tr key={key} className="border-b border-stone-100">
              <td className="px-3 py-1.5">{formatLimitLabel(key)}</td>
              <td className="px-3 py-1.5 text-right">{val}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Classification Detail — shown for both types */}
      {cls && (
        <>
          <SectionTitle>Classification Detail</SectionTitle>
          <div className="border border-stone-200 rounded p-4 bg-stone-50/50 mb-6 text-[10px] grid grid-cols-2 gap-x-8 gap-y-1.5">
            <Row label="Class Code" value={cls.classCode} />
            <Row label="Description" value={cls.classDescription} />
            <Row label="Prem/Ops Territory" value={cls.premOpsTerritoryCode} />
            <Row label="Prod/CompOps Territory" value={cls.prodCompOpsTerritoryCode} />
            <Row label="Premium Basis" value={cls.premOpsPremiumBasis} />
            <Row label="Exposure" value={`$${cls.premOps.exposure.toLocaleString()}`} />
          </div>
        </>
      )}

      {/* Rating Detail (for RatingWorksheet) */}
      {isRatingSheet && cls && (
        <>
          <SectionTitle>Rating Factors — Premises / Operations</SectionTitle>
          <RatingFactorTable section={cls.premOps} />

          <SectionTitle>Rating Factors — Products / Completed Ops</SectionTitle>
          <RatingFactorTable section={cls.prodCompOps} />
        </>
      )}

      {/* Premium Breakdown */}
      <SectionTitle>Premium Summary</SectionTitle>
      <table className="w-full mb-6 border border-stone-200 text-[10px]">
        <tbody>
          <tr className="border-b border-stone-100"><td className="px-3 py-1.5">Prem/Ops Premium</td><td className="px-3 py-1.5 text-right">${cls?.premOps.premium.toFixed(2) ?? '—'}</td></tr>
          <tr className="border-b border-stone-100"><td className="px-3 py-1.5">Prod/CompOps Premium</td><td className="px-3 py-1.5 text-right">${cls?.prodCompOps.premium.toFixed(2) ?? '—'}</td></tr>
          <tr className="border-b border-stone-100"><td className="px-3 py-1.5 font-bold">Base Premium</td><td className="px-3 py-1.5 text-right font-bold">${quote.basePremium.toFixed(2)}</td></tr>
          <tr className="border-b border-stone-100"><td className="px-3 py-1.5">Cert. Terrorism</td><td className="px-3 py-1.5 text-right">${quote.certTerrorism.toFixed(2)}</td></tr>
          <tr className="bg-ink-50 font-bold"><td className="px-3 py-2">Total Premium</td><td className="px-3 py-2 text-right">${quote.totalPremium.toFixed(2)}</td></tr>
        </tbody>
      </table>

      {/* Footer */}
      <div className="border-t border-stone-300 pt-4 text-[9px] text-stone-400 text-center">
        This document is system-generated for internal use. Solaris GL PaaS — Confidential.
      </div>
    </div>
  )
}

/* Small helpers for the letter */
function Row({ label, value }) {
  return (
    <>
      <span className="font-bold text-stone-500">{label}</span>
      <span>{value}</span>
    </>
  )
}
function SectionTitle({ children }) {
  return <p className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-2">{children}</p>
}
function formatLimitLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
}
function RatingFactorTable({ section }) {
  const rows = [
    ['Loss Cost', section.lossCost],
    ['LCM', section.lcm],
    ['Base Rate', section.baseRate],
    ['BI Deductible Factor', section.biDeductibleFactor],
    ['PD Deductible Factor', section.pdDeductibleFactor],
    ['CSL ILF', section.cslIlf],
    ['Final ILF', section.finalIlf],
    ['Pkg Mod Factor', section.packageModFactor],
    ['Exp Rating Mod', section.expRatingMod],
    ['Final Rate', section.finalRate],
    ['Exposure', `$${section.exposure.toLocaleString()}`],
    ['Premium', `$${section.premium.toFixed(2)}`],
  ]
  return (
    <table className="w-full mb-6 border border-stone-200 text-[10px]">
      <tbody>
        {rows.map(([label, val]) => (
          <tr key={label} className="border-b border-stone-100">
            <td className="px-3 py-1">{label}</td>
            <td className="px-3 py-1 text-right">{typeof val === 'number' ? val.toFixed(3) : val}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Document Preview Modal ────────────────────────────────────────────────────

function PreviewModal({ doc, onClose }) {
  if (!doc) return null

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-stone-100 flex items-center justify-between flex-none">
          <div className="flex items-center gap-3 min-w-0">
            <TypeBadge type={doc.type} />
            <h2 className="text-sm font-bold text-stone-900 truncate">{doc.name}</h2>
            <span className="text-xs font-mono text-stone-400 shrink-0">{doc.submission}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* PDF-style rendered document — 60% */}
          <div className="flex-[3] border-r border-stone-100 p-6 overflow-y-auto bg-stone-50">
            <QuoteLetterPreview doc={doc} />
          </div>

          {/* Metadata panel — 40% */}
          <div className="flex-[2] p-6 overflow-y-auto">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">Document Details</p>
            <div className="space-y-0">
              {[
                { label: 'Doc Type',       value: TYPE_CONFIG[doc.type]?.label || doc.type, mono: false },
                { label: 'Submission #',   value: doc.submission,     mono: true  },
                { label: 'Generated Date', value: doc.date,           mono: true  },
                { label: 'Status',         value: doc.status || 'Ready', mono: false },
                { label: 'File Size',      value: '248 KB',           mono: true  },
                { label: 'Generated By',   value: doc.generatedBy,    mono: false },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between py-2.5 border-b border-stone-50 last:border-0">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest shrink-0 w-32 pt-0.5">{label}</span>
                  <span className="text-xs text-stone-700 text-right font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Send to Agent Modal ───────────────────────────────────────────────────────

function SendModal({ doc, onClose }) {
  const toast   = useToast()
  const [loading, setLoading] = useState(false)

  if (!doc) return null

  const subject = `GL Document — ${doc.name} — ${doc.submission}`
  const body    = `Dear Agent,\n\nPlease find attached the ${TYPE_CONFIG[doc.type]?.label || doc.type} document for submission ${doc.submission}.\n\nThis document has been generated as part of the GL policy workflow on the Solaris PAAS platform. Please review at your earliest convenience and contact your underwriter with any questions.\n\nThank you,\nSolaris Commercial Lines`

  function handleSend() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Document sent to agent', `${doc.name} delivered to michael.grant@hawthornerisk.com`)
      onClose()
    }, 1000)
  }

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-stone-100 flex items-center justify-between flex-none">
          <div>
            <h2 className="text-base font-bold text-stone-900">Send Document</h2>
            <p className="text-xs text-stone-400 mt-0.5">Email this document to the agent of record</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* To */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">To</label>
            <input
              type="text"
              defaultValue="michael.grant@hawthornerisk.com"
              readOnly
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-700 focus:outline-none font-mono"
            />
          </div>

          {/* CC */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">CC</label>
            <input
              type="text"
              defaultValue="uiuxadmin@solaris.com"
              readOnly
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-700 focus:outline-none font-mono"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">Subject</label>
            <input
              type="text"
              defaultValue={subject}
              readOnly
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-700 focus:outline-none"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">Message</label>
            <textarea
              defaultValue={body}
              rows={6}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 text-stone-700 focus:outline-none resize-none"
            />
          </div>

          {/* Attachment chip */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">Attachments</label>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-ink-50 border border-ink-200 text-ink-700 text-xs font-semibold rounded-full">
                <FileText className="h-3 w-3 shrink-0" />
                {doc.name}.pdf
                <span className="w-2 h-2 bg-sage-500 rounded-full" title="Selected" />
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-end gap-3 flex-none bg-stone-25">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-ink-700 hover:bg-ink-800 rounded-lg disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Stat card (clickable for filter) ─────────────────────────────────────────

function StatCard({ label, value, icon: Icon, bg, color, sub, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'bg-white rounded-xl border border-stone-200 shadow-card px-5 py-4 hover:shadow-elevated transition-all text-left w-full',
        active ? 'ring-2 ring-ink-500' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`${bg} p-2 rounded-lg`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-black text-stone-900 tracking-tight font-mono">{value}</p>
      <p className="text-xs font-semibold text-stone-600 mt-0.5">{label}</p>
      <p className="text-[10px] text-stone-300 mt-1 uppercase tracking-widest">{sub}</p>
    </button>
  )
}

// ── Row component (handles per-row regenerate + new badge) ────────────────────

function DocumentRow({ doc, i, isChecked, onToggleCheck, onPreview, onSend, onNavigate }) {
  const toast = useToast()

  // Per-row state
  const [regenerating, setRegenerating] = useState(false)
  const [rowStatus,    setRowStatus]    = useState(doc.status || 'Ready')
  const [showNew,      setShowNew]      = useState(false)
  const [newOpacity,   setNewOpacity]   = useState(1)

  const handleRegenerate = useCallback((e) => {
    e.stopPropagation()
    if (regenerating) return
    setRegenerating(true)
    setTimeout(() => {
      setRegenerating(false)
      setRowStatus('Ready')
      setShowNew(true)
      setNewOpacity(1)
      toast.success('Document regenerated successfully', doc.name)
      // Fade NEW badge after 5 seconds
      setTimeout(() => {
        setNewOpacity(0)
        setTimeout(() => setShowNew(false), 600)
      }, 5000)
    }, 1200)
  }, [regenerating, doc.name, toast])

  const isGenerating = rowStatus === 'Generating'

  return (
    <tr
      className={[
        'transition-colors duration-100 hover:bg-stone-25 group',
        i % 2 === 1 ? 'bg-stone-25/30' : '',
      ].join(' ')}
    >
      {/* Checkbox */}
      <td className="pl-4 pr-2 py-3.5 whitespace-nowrap" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onToggleCheck(doc.id)}
          className="text-stone-400 hover:text-ink-600 transition-colors"
        >
          {isChecked
            ? <CheckSquare className="h-4 w-4 text-ink-700" />
            : <Square className="h-4 w-4" />
          }
        </button>
      </td>

      {/* Type badge */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <TypeBadge type={doc.type} />
      </td>

      {/* Document Name — clickable */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPreview(doc)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700 hover:text-ink-900 hover:underline underline-offset-2 transition-colors"
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-ink-400" />
            {doc.name}
          </button>
          {/* NEW badge */}
          {showNew && (
            <span
              style={{ opacity: newOpacity, transition: 'opacity 0.6s ease' }}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-crimson-500 text-white uppercase tracking-widest"
            >
              NEW
            </span>
          )}
        </div>
      </td>

      {/* Submission # */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <button
          onClick={() => onNavigate(doc.submission)}
          className="font-mono text-xs font-bold text-ink-700 hover:text-ink-900 hover:underline underline-offset-2 transition-colors"
        >
          {doc.submission}
        </button>
      </td>

      {/* Generated By */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full ${avatarColor(doc.generatedBy)} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}>
            {doc.generatedBy[0].toUpperCase()}
          </div>
          <span className="text-xs text-stone-600">{doc.generatedBy}</span>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <span className="text-xs font-mono text-stone-400">{doc.date}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {isGenerating ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200 animate-pulse">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Generating
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-50 text-sage-700 ring-1 ring-sage-200">
            <span className="w-1.5 h-1.5 bg-sage-500 rounded-full" />
            Ready
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          {/* Preview */}
          <button
            onClick={() => onPreview(doc)}
            title="Preview"
            className="p-1.5 rounded-md text-stone-400 hover:text-ink-600 hover:bg-ink-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Regenerate */}
          <button
            onClick={handleRegenerate}
            disabled={regenerating || isGenerating}
            title="Regenerate"
            className="p-1.5 rounded-md text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={['h-3.5 w-3.5', regenerating ? 'animate-spin' : ''].join(' ')} />
          </button>

          {/* Send to agent */}
          <button
            onClick={e => { e.stopPropagation(); onSend(doc) }}
            title="Send to agent"
            className="p-1.5 rounded-md text-stone-400 hover:text-sage-600 hover:bg-sage-50 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>

          {/* Download */}
          <button
            onClick={e => { e.stopPropagation(); }}
            title="Download"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-stone-600 bg-white border border-stone-200 rounded-md hover:bg-stone-50 hover:text-stone-800 hover:border-stone-300 transition-colors"
          >
            <Download className="h-3 w-3 shrink-0" />
            Download
          </button>
        </div>
      </td>
    </tr>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const navigate = useNavigate()
  const toast    = useToast()

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState('')
  const [typeFilter,  setTypeFilter]  = useState('All')
  const [dateRange,   setDateRange]   = useState('all')
  const [snFilter,    setSnFilter]    = useState('')
  const [kpiFilter,   setKpiFilter]   = useState('all') // 'all' | 'ready' | 'pending'

  // ── Selection for bulk download ───────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set())

  // ── Modals ────────────────────────────────────────────────────────────────
  const [previewDoc, setPreviewDoc] = useState(null)
  const [sendDoc,    setSendDoc]    = useState(null)

  // ── Bulk download loading ─────────────────────────────────────────────────
  const [bulkLoading, setBulkLoading] = useState(false)

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...INITIAL_DOCUMENTS]

    // KPI card filter
    if (kpiFilter === 'ready')   data = data.filter(d => d.status !== 'Generating')
    if (kpiFilter === 'pending') data = data.filter(d => d.status === 'Generating')

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      data = data.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.submission.toLowerCase().includes(q) ||
        d.generatedBy.toLowerCase().includes(q)
      )
    }

    if (typeFilter !== 'All') {
      data = data.filter(d => d.type === typeFilter)
    }

    if (snFilter.trim()) {
      const q = snFilter.trim().toLowerCase()
      data = data.filter(d => d.submission.toLowerCase().includes(q))
    }

    if (dateRange !== 'all') {
      data = data.filter(d => withinRange(d.date, dateRange))
    }

    return data
  }, [search, typeFilter, snFilter, dateRange, kpiFilter])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalDocs      = INITIAL_DOCUMENTS.length
  const readyDocs      = INITIAL_DOCUMENTS.filter(d => d.status !== 'Generating').length
  const pendingDocs    = INITIAL_DOCUMENTS.filter(d => d.status === 'Generating').length

  // ── Checkbox helpers ──────────────────────────────────────────────────────
  function toggleCheck(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  // ── Bulk download ─────────────────────────────────────────────────────────
  function handleBulkDownload() {
    if (bulkLoading || selectedIds.size === 0) return
    setBulkLoading(true)
    const count = selectedIds.size
    setTimeout(() => {
      setBulkLoading(false)
      clearSelection()
      toast.success(`${count} document${count !== 1 ? 's' : ''} downloaded`, 'Files saved to your downloads folder.')
    }, 1000)
  }

  // ── KPI filter setter (toggle) ────────────────────────────────────────────
  function handleKpiClick(filterKey) {
    setKpiFilter(prev => prev === filterKey ? 'all' : filterKey)
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1400px] mx-auto">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            Document Library
            <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full font-mono">
              {totalDocs} docs
            </span>
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            Generated documents across all submissions · GL · Commercial Lines
          </p>
        </div>
      </div>

      {/* ── Stats Row (clickable KPI filter) ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <StatCard
          label="Total Documents"
          value={totalDocs}
          icon={FileText}
          bg="bg-ink-50"
          color="text-ink-600"
          sub="all time"
          active={kpiFilter === 'all'}
          onClick={() => handleKpiClick('all')}
        />
        <StatCard
          label="Ready"
          value={readyDocs}
          icon={Download}
          bg="bg-sage-50"
          color="text-sage-600"
          sub="available for download"
          active={kpiFilter === 'ready'}
          onClick={() => handleKpiClick('ready')}
        />
        <StatCard
          label="Pending Generation"
          value={pendingDocs}
          icon={Filter}
          bg="bg-amber-50"
          color="text-amber-600"
          sub="awaiting trigger"
          active={kpiFilter === 'pending'}
          onClick={() => handleKpiClick('pending')}
        />
      </div>

      {/* Active KPI filter chip */}
      {kpiFilter !== 'all' && (
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ink-50 border border-ink-200 text-ink-800 text-xs font-semibold rounded-full">
            Filtered: {kpiFilter === 'ready' ? 'Ready docs' : 'Pending docs'}
            <button
              onClick={() => setKpiFilter('all')}
              className="ml-1 text-ink-600 hover:text-ink-800"
              aria-label="Clear KPI filter"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card px-4 py-3 mb-4">
        <div className="flex items-center gap-3 flex-wrap">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents, types, users…"
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 placeholder:text-stone-400 bg-stone-25"
            />
          </div>

          {/* Type */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Type</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="text-xs border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-ink-400"
            >
              <option value="All">All Types</option>
              <option value="QuoteProposal">Quote Proposal</option>
              <option value="RatingWorksheet">Rating Worksheet</option>
              <option value="Policy">Policy</option>
              <option value="Endorsement">Endorsement</option>
              <option value="Certificate">Certificate</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date</span>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="text-xs border border-stone-200 rounded-lg px-2.5 py-1.5 bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-ink-400"
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {/* Submission # */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Sub #</span>
            <input
              type="text"
              value={snFilter}
              onChange={e => setSnFilter(e.target.value)}
              placeholder="SN129106"
              className="w-28 text-xs border border-stone-200 rounded-lg px-2.5 py-1.5 bg-stone-25 text-stone-700 font-mono focus:outline-none focus:ring-2 focus:ring-ink-400 placeholder:text-stone-300"
            />
          </div>

          {/* Results count */}
          <span className="ml-auto text-xs font-semibold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full shrink-0">
            {filtered.length} of {totalDocs}
          </span>
        </div>
      </div>

      {/* ── Documents Table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100 bg-stone-25 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-800">Documents</h2>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-100 text-sm">
            <thead className="bg-stone-25">
              <tr>
                <th className="pl-4 pr-2 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest w-8" />
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Type</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Document Name</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Submission #</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Generated By</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-right text-[10px] font-bold text-stone-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-stone-200" />
                      <p className="text-sm text-stone-400 font-medium">No documents match your filters</p>
                      <p className="text-xs text-stone-300">Try adjusting the type, date range, or search terms</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((doc, i) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  i={i}
                  isChecked={selectedIds.has(doc.id)}
                  onToggleCheck={toggleCheck}
                  onPreview={setPreviewDoc}
                  onSend={setSendDoc}
                  onNavigate={sn => navigate(`/submissions/${sn}`)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-stone-100 bg-stone-25 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              Showing <span className="font-semibold text-stone-600">{filtered.length}</span> document{filtered.length !== 1 ? 's' : ''}
              {typeFilter !== 'All' && (
                <span className="ml-1">
                  · type: <span className="font-semibold text-stone-600">{typeFilter}</span>
                </span>
              )}
            </p>
            <p className="text-[10px] text-stone-300 font-mono uppercase tracking-widest">
              GL · Solaris PAAS · March 2026
            </p>
          </div>
        )}
      </div>

      {/* ── Bulk Download Floating Action Bar ────────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-ink-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-ink-700">
          <span className="text-sm font-semibold">
            <span className="font-mono text-ink-400">{selectedIds.size}</span>
            {' '}document{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="w-px h-4 bg-ink-600" />
          <Button variant="cta" size="xs" icon={Download} loading={bulkLoading} onClick={handleBulkDownload}>
            {bulkLoading ? 'Downloading…' : 'Download Selected'}
          </Button>
          <button
            onClick={clearSelection}
            disabled={bulkLoading}
            className="text-xs font-medium text-stone-400 hover:text-white transition-colors disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      )}

      {/* ── Document Preview Modal ────────────────────────────────────────────── */}
      {previewDoc && (
        <PreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* ── Send to Agent Modal ────────────────────────────────────────────────── */}
      {sendDoc && (
        <SendModal
          doc={sendDoc}
          onClose={() => setSendDoc(null)}
        />
      )}
    </div>
  )
}
