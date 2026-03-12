import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpRight, ArrowDownRight, DollarSign,
  Target, Clock, FileText, ChevronRight,
  Download, ChevronDown, ChevronUp, Mail, X,
  RefreshCw,
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'

// ── Period-driven data ────────────────────────────────────────────────────────
const PERIOD_DATA = {
  MTD: {
    totalPremiumLabel:  '$4,730',
    premiumTrend:       '+8%',
    premiumTrendUp:     true,
    bindRate:           71,
    bindRateTrend:      '+2%',
    bindRateTrendUp:    true,
    avgDaysToQuote:     4.8,
    avgDaysTrend:       '-0.3d',
    submissions:        8,
    submissionsTrend:   '+1',
    submissionsTrendUp: true,
    barData: [
      { month: 'Oct', value: 3200 },
      { month: 'Nov', value: 4100 },
      { month: 'Dec', value: 2800 },
      { month: 'Jan', value: 5400 },
      { month: 'Feb', value: 4600 },
      { month: 'Mar', value: 4730, current: true },
    ],
    agencyVolume: [
      { name: 'Hawthorne Risk Advisors, LLC', count: 2 },
      { name: 'Pacific Crest Insurance',      count: 2 },
      { name: 'Meridian Specialty Lines',     count: 2 },
      { name: 'Apex Commercial Risk',         count: 1 },
      { name: 'Greenfield Risk Partners',     count: 1 },
    ],
    txMix: [
      { type: 'NEW-BUSINESS', count: 5, pct: 62 },
      { type: 'RENEWAL',      count: 2, pct: 25 },
      { type: 'ENDORSEMENT',  count: 1, pct: 13 },
    ],
  },
  QTD: {
    totalPremiumLabel:  '$14,130',
    premiumTrend:       '+10%',
    premiumTrendUp:     true,
    bindRate:           74,
    bindRateTrend:      '+3%',
    bindRateTrendUp:    true,
    avgDaysToQuote:     4.5,
    avgDaysTrend:       '-0.5d',
    submissions:        14,
    submissionsTrend:   '+2',
    submissionsTrendUp: true,
    barData: [
      { month: 'Oct', value: 3200 },
      { month: 'Nov', value: 4100 },
      { month: 'Dec', value: 2800 },
      { month: 'Jan', value: 5400 },
      { month: 'Feb', value: 4600 },
      { month: 'Mar', value: 4730, current: true },
    ],
    agencyVolume: [
      { name: 'Hawthorne Risk Advisors, LLC', count: 4 },
      { name: 'Pacific Crest Insurance',      count: 3 },
      { name: 'Meridian Specialty Lines',     count: 3 },
      { name: 'Apex Commercial Risk',         count: 2 },
      { name: 'Coastal Commercial Group',     count: 2 },
    ],
    txMix: [
      { type: 'NEW-BUSINESS', count: 8, pct: 57 },
      { type: 'RENEWAL',      count: 4, pct: 29 },
      { type: 'ENDORSEMENT',  count: 2, pct: 14 },
    ],
  },
  YTD: {
    totalPremiumLabel:  '$24,830',
    premiumTrend:       '+12%',
    premiumTrendUp:     true,
    bindRate:           76,
    bindRateTrend:      '+4%',
    bindRateTrendUp:    true,
    avgDaysToQuote:     4.2,
    avgDaysTrend:       '-0.8d',
    submissions:        20,
    submissionsTrend:   '+3',
    submissionsTrendUp: true,
    barData: [
      { month: 'Oct', value: 3200 },
      { month: 'Nov', value: 4100 },
      { month: 'Dec', value: 2800 },
      { month: 'Jan', value: 5400 },
      { month: 'Feb', value: 4600 },
      { month: 'Mar', value: 4730, current: true },
    ],
    agencyVolume: [
      { name: 'Hawthorne Risk Advisors, LLC', count: 5 },
      { name: 'Pacific Crest Insurance',      count: 4 },
      { name: 'Meridian Specialty Lines',     count: 4 },
      { name: 'Apex Commercial Risk',         count: 4 },
      { name: 'Greenfield Risk Partners',     count: 3 },
    ],
    txMix: [
      { type: 'NEW-BUSINESS', count: 12, pct: 60 },
      { type: 'RENEWAL',      count: 5,  pct: 25 },
      { type: 'ENDORSEMENT',  count: 3,  pct: 15 },
    ],
  },
}

// ── Pipeline stages ───────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  { label: 'In Progress', count: 7, colorBar: 'bg-ink-500',   colorBadge: 'bg-ink-50 text-ink-700 border-ink-100'       },
  { label: 'Clearance',   count: 4, colorBar: 'bg-amber-400', colorBadge: 'bg-amber-50 text-amber-700 border-amber-100' },
  { label: 'Rating',      count: 4, colorBar: 'bg-ink-300',   colorBadge: 'bg-stone-50 text-stone-600 border-stone-200' },
  { label: 'Quoted',      count: 5, colorBar: 'bg-sage-500',  colorBadge: 'bg-sage-50 text-sage-700 border-sage-100'    },
  { label: 'Bound',       count: 2, colorBar: 'bg-sage-500', colorBadge: 'bg-sage-50 text-sage-700 border-sage-100' },
  { label: 'Issued',      count: 1, colorBar: 'bg-sage-700',  colorBadge: 'bg-sage-50 text-sage-800 border-sage-200'    },
]
const PIPELINE_TOTAL = PIPELINE_STAGES.reduce((s, p) => s + p.count, 0)

// ── Quote activity ────────────────────────────────────────────────────────────
const QUOTE_ACTIVITY = [
  { sn: 'SN129122', id: 'SN129122', insured: 'Redstone Welding Inc.',  premium: '$4,280.00', status: 'Offered', days: 3, assignee: 'adavis' },
  { sn: 'SN129119', id: 'SN129119', insured: 'Northfield Bakery',      premium: '$3,640.00', status: 'Offered', days: 5, assignee: 'jsmith' },
  { sn: 'SN129116', id: 'SN129116', insured: 'Harbor View Hotel',      premium: '$6,120.00', status: 'Offered', days: 4, assignee: 'jsmith' },
  { sn: 'SN129112', id: 'SN129112', insured: 'Pinnacle Pediatrics',    premium: '$2,890.00', status: 'Bound',   days: 6, assignee: 'jsmith' },
  { sn: 'SN129107', id: 'SN129107', insured: 'Riverside Auto Repair',  premium: '$3,150.00', status: 'Offered', days: 2, assignee: 'adavis' },
]

// ── Loss ratio by agency ──────────────────────────────────────────────────────
const LOSS_RATIO_DATA = [
  { agency: 'Hawthorne Risk Advisors, LLC', ratio: 52 },
  { agency: 'Pacific Crest Insurance',      ratio: 68 },
  { agency: 'Meridian Specialty Lines',     ratio: 44 },
  { agency: 'Apex Commercial Risk',         ratio: 71 },
  { agency: 'Greenfield Risk Partners',     ratio: 59 },
  { agency: 'Coastal Commercial Group',     ratio: 38 },
]

// ── UW performance ────────────────────────────────────────────────────────────
const UW_PERFORMANCE = [
  { name: 'uiuxAdmin',    openSubs: 6, boundMTD: 3, avgDays: 3.8, winRate: 82, premium: '$18,420' },
  { name: 'J. Smith',     openSubs: 5, boundMTD: 2, avgDays: 4.6, winRate: 74, premium: '$14,230' },
  { name: 'A. Davis',     openSubs: 4, boundMTD: 2, avgDays: 5.1, winRate: 68, premium: '$11,580' },
  { name: 'M. Rodriguez', openSubs: 5, boundMTD: 1, avgDays: 6.2, winRate: 61, premium: '$9,940'  },
]

// ── Color maps ────────────────────────────────────────────────────────────────
const TX_COLORS = {
  'NEW-BUSINESS': { bar: 'bg-ink-500',   text: 'text-ink-700',   bg: 'bg-ink-50',   border: 'border-ink-100'   },
  'RENEWAL':      { bar: 'bg-sage-500',  text: 'text-sage-700',  bg: 'bg-sage-50',  border: 'border-sage-100'  },
  'ENDORSEMENT':  { bar: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
}

const UW_AVATAR_COLORS = {
  'uiuxAdmin':    'bg-ink-700',
  'J. Smith':     'bg-sage-600',
  'A. Davis':     'bg-amber-500',
  'M. Rodriguez': 'bg-ink-500',
}

// ── Renewal pipeline data ─────────────────────────────────────────────────────
const RENEWAL_MONTHS = [
  {
    label: 'October 2026',
    count: 4,
    rows: [
      { sn: 'SN129106', insured: 'Anchor Marine',       renewalDate: '11/01/2026', premium: '$3,200', daysUntil: 56 },
      { sn: 'SN129116', insured: 'Harbor View',         renewalDate: '12/01/2026', premium: '$8,200', daysUntil: 86 },
      { sn: 'SN129119', insured: 'Northfield Bakery',   renewalDate: '10/01/2026', premium: '$540',   daysUntil: 25 },
      { sn: 'SN129122', insured: 'Redstone Welding',    renewalDate: '09/15/2026', premium: '$2,450', daysUntil: 9  },
    ],
  },
  {
    label: 'November 2026',
    count: 3,
    rows: [
      { sn: 'SN129109', insured: 'Lakeshore Dental',    renewalDate: '11/10/2026', premium: '$1,870', daysUntil: 64 },
      { sn: 'SN129112', insured: 'Pinnacle Pediatrics', renewalDate: '11/22/2026', premium: '$2,890', daysUntil: 76 },
      { sn: 'SN129114', insured: 'Summit Auto Spa',     renewalDate: '11/30/2026', premium: '$1,340', daysUntil: 84 },
    ],
  },
  {
    label: 'December 2026',
    count: 2,
    rows: [
      { sn: 'SN129123', insured: 'Blue Ridge Catering', renewalDate: '12/12/2026', premium: '$3,110', daysUntil: 96 },
      { sn: 'SN129124', insured: 'Orion Metal Works',   renewalDate: '12/28/2026', premium: '$5,620', daysUntil: 112},
    ],
  },
]

// ── Loss ratio by class ───────────────────────────────────────────────────────
const LOSS_RATIO_CLASS = [
  { label: 'Mercantile',    ratio: 58 },
  { label: 'Contractor',    ratio: 71 },
  { label: 'Restaurant',    ratio: 82 },
  { label: 'Service',       ratio: 44 },
  { label: 'Habitational',  ratio: 69 },
  { label: 'Professional',  ratio: 37 },
]

// ── Combined ratio trend data ─────────────────────────────────────────────────
const COMBINED_RATIO_DATA = [
  { month: 'Oct', loss: 62, expense: 28 },
  { month: 'Nov', loss: 71, expense: 28 },
  { month: 'Dec', loss: 68, expense: 28 },
  { month: 'Jan', loss: 75, expense: 28 },
  { month: 'Feb', loss: 82, expense: 28 },
  { month: 'Mar', loss: 58, expense: 28 },
]

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const map = {
    Offered: 'bg-sage-50 text-sage-700 border border-sage-100',
    Bound:   'bg-sage-50 text-sage-700 border border-sage-100',
    Issued:  'bg-ink-50 text-ink-700 border border-ink-100',
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[status] || 'bg-stone-50 text-stone-500 border border-stone-200'}`}>
      {status}
    </span>
  )
}

function TrendBadge({ up = true, label }) {
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-bold ${up ? 'text-sage-600' : 'text-crimson-600'}`}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {label}
    </span>
  )
}

function Assignee({ name }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-5 h-5 rounded-full bg-ink-700 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
        {name[0].toUpperCase()}
      </span>
      <span className="text-xs text-stone-500">{name}</span>
    </span>
  )
}

function UWChip({ name }) {
  const parts    = name.replace(/\./g, ' ').trim().split(/\s+/)
  const initials = parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
  return (
    <span className="flex items-center gap-2">
      <span className={`w-6 h-6 rounded-full ${UW_AVATAR_COLORS[name] || 'bg-stone-400'} text-white text-[9px] font-black flex items-center justify-center shrink-0`}>
        {initials}
      </span>
      <span className="text-sm font-semibold text-stone-800">{name}</span>
    </span>
  )
}

// ── Renewal row color helper ──────────────────────────────────────────────────
function renewalRowClass(days) {
  if (days < 30)  return 'text-crimson-600 font-bold'
  if (days <= 60) return 'text-amber-600 font-semibold'
  return 'text-stone-600'
}

// ── Email Report Modal ────────────────────────────────────────────────────────
function EmailReportModal({ open, onClose, toast }) {
  const [to,       setTo]       = useState('analytics@solaris-gl.com')
  const [subject,  setSubject]  = useState('GL Analytics Report — March 2026')
  const [body,     setBody]     = useState(
    'Please find attached the GL PAAs analytics summary for the period ending March 2026.\n\nKey metrics:\n- Total Premium YTD: $24,830 (+12% vs last year)\n- Quote-to-Bind Rate: 76% (+4% vs last quarter)\n- Avg Days to Quote: 4.2d (improved by 0.8d)\n- Total Submissions: 20 (+3 vs last month)\n- Combined Ratio (latest month): 86%\n\nThis report was generated automatically by the GL PAAs Analytics module.'
  )
  const [sending, setSending] = useState(false)

  const handleSend = useCallback(() => {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      toast.success('Report emailed', `Report emailed to ${to}`)
      onClose()
    }, 1200)
  }, [to, toast, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal panel */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="bg-ink-50 p-1.5 rounded-lg">
              <Mail className="h-4 w-4 text-ink-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900">Email Report</h3>
              <p className="text-[11px] text-stone-400">Send analytics summary via email</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* To field */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
              To
            </label>
            <input
              type="email"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-transparent transition text-stone-800 placeholder:text-stone-300"
            />
          </div>

          {/* Subject field */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-transparent transition text-stone-800"
            />
          </div>

          {/* Body textarea */}
          <div>
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
              Body
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={7}
              className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-transparent transition text-stone-700 resize-none font-sans leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-100 bg-stone-50">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="cta"
            size="sm"
            icon={Mail}
            loading={sending}
            onClick={handleSend}
          >
            Send Report
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const navigate = useNavigate()
  const toast    = useToast()

  const [period,           setPeriod]           = useState('YTD')
  const [exportLoading,    setExportLoading]     = useState(false)
  const [uwExporting,      setUwExporting]       = useState(false)
  const [emailModalOpen,   setEmailModalOpen]    = useState(false)
  const [expandedMonths,   setExpandedMonths]    = useState({})
  const [hoveredBar,       setHoveredBar]        = useState(null)

  const data      = PERIOD_DATA[period]
  const barMax    = useMemo(() => Math.max(...data.barData.map(d => d.value)), [data])
  const agencyMax = data.agencyVolume[0]?.count || 1

  const handleExportReport = useCallback(() => {
    setExportLoading(true)
    setTimeout(() => {
      setExportLoading(false)
      toast.success('Report exported', 'Downloading PDF summary.')
    }, 800)
  }, [toast])

  const handleUwExport = useCallback(() => {
    setUwExporting(true)
    setTimeout(() => {
      setUwExporting(false)
      toast.success('Exported', 'UW performance exported.')
    }, 600)
  }, [toast])

  const handleUwRowClick = useCallback((name) => {
    toast.info('Filter applied', `Filtering activity log for ${name}`)
  }, [toast])

  const toggleMonth = useCallback((label) => {
    setExpandedMonths(prev => ({ ...prev, [label]: !prev[label] }))
  }, [])

  const handleStartRenewal = useCallback((insured) => {
    toast.success('Renewal initiated', `Renewal initiated for ${insured}`)
  }, [toast])

  return (
    <div className="max-w-[1600px] mx-auto space-y-4">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-stone-400 mt-0.5">Commercial GL · March 2026</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period toggle */}
          <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-1 shadow-card">
            {['MTD', 'QTD', 'YTD'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={[
                  'px-3.5 py-1.5 text-xs font-bold rounded-md transition-all',
                  period === p
                    ? 'bg-ink-800 text-white shadow-sm'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50',
                ].join(' ')}
              >
                {p}
              </button>
            ))}
          </div>
          {/* Email Report button */}
          <Button
            variant="secondary"
            size="sm"
            icon={Mail}
            onClick={() => setEmailModalOpen(true)}
          >
            Email Report
          </Button>
          {/* Export Report CTA */}
          <Button
            variant="cta"
            size="sm"
            icon={Download}
            loading={exportLoading}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-4">

        <div className="bg-white rounded-xl border border-stone-200 shadow-card px-5 py-4 hover:shadow-elevated transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-ink-50 p-2 rounded-lg">
              <DollarSign className="h-4 w-4 text-ink-600" />
            </div>
            <TrendBadge up={data.premiumTrendUp} label={data.premiumTrend} />
          </div>
          <p className="text-2xl font-black text-ink-800 tracking-tight font-mono">{data.totalPremiumLabel}</p>
          <p className="text-xs font-semibold text-stone-500 mt-0.5">Total Premium {period}</p>
          <p className="text-[10px] text-stone-300 mt-0.5 uppercase tracking-widest">vs last year</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 shadow-card px-5 py-4 hover:shadow-elevated transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-ink-50 p-2 rounded-lg">
              <Target className="h-4 w-4 text-ink-600" />
            </div>
            <TrendBadge up={data.bindRateTrendUp} label={data.bindRateTrend} />
          </div>
          <p className="text-2xl font-black text-stone-900 tracking-tight font-mono">{data.bindRate}%</p>
          <p className="text-xs font-semibold text-stone-500 mt-0.5">Quote-to-Bind Rate</p>
          <p className="text-[10px] text-stone-300 mt-0.5 uppercase tracking-widest">vs last quarter</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 shadow-card px-5 py-4 hover:shadow-elevated transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-amber-50 p-2 rounded-lg">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <TrendBadge up={false} label={data.avgDaysTrend} />
          </div>
          <p className="text-2xl font-black text-stone-900 tracking-tight font-mono">{data.avgDaysToQuote}d</p>
          <p className="text-xs font-semibold text-stone-500 mt-0.5">Avg Days to Quote</p>
          <p className="text-[10px] text-stone-300 mt-0.5 uppercase tracking-widest">day improvement</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 shadow-card px-5 py-4 hover:shadow-elevated transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className="bg-sage-50 p-2 rounded-lg">
              <FileText className="h-4 w-4 text-sage-600" />
            </div>
            <TrendBadge up={data.submissionsTrendUp} label={data.submissionsTrend} />
          </div>
          <p className="text-2xl font-black text-stone-900 tracking-tight font-mono">{data.submissions}</p>
          <p className="text-xs font-semibold text-stone-500 mt-0.5">Submissions {period}</p>
          <p className="text-[10px] text-stone-300 mt-0.5 uppercase tracking-widest">vs last month</p>
        </div>

      </div>

      {/* ── Row 2: Bar chart + Pipeline Breakdown ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Premium by Month — 2/3 width */}
        <div className="col-span-2">
          <Card
            title="Premium by Month"
            subtitle={`${period} gross written premium`}
            actions={
              <span className="font-mono font-black text-ink-800 text-base">
                {data.totalPremiumLabel}
              </span>
            }
          >
            {/* Bar chart with delta labels */}
            <div className="flex items-end justify-between gap-3 h-52 pt-2">
              {data.barData.map(({ month, value, current }, idx) => {
                const barH = Math.round((value / barMax) * 168)

                // Delta vs previous bar
                let deltaEl = null
                if (idx > 0) {
                  const prev = data.barData[idx - 1].value
                  const pct  = Math.round(Math.abs((value - prev) / prev) * 100)
                  const up   = value >= prev
                  deltaEl = (
                    <span className={`text-[10px] font-bold font-mono leading-none ${up ? 'text-sage-600' : 'text-crimson-600'}`}>
                      {up ? '\u2191' : '\u2193'} {pct}%
                    </span>
                  )
                }

                return (
                  <div key={month} className="flex flex-col items-center gap-0.5 flex-1">
                    {/* Delta label — fixed-height row keeps all bars baseline-aligned */}
                    <span className="h-4 flex items-center justify-center">
                      {deltaEl}
                    </span>
                    {/* Dollar value */}
                    <span className="text-[10px] font-bold font-mono text-stone-400">
                      ${(value / 1000).toFixed(1)}k
                    </span>
                    {/* Bar */}
                    <div className="flex-1 flex items-end w-full">
                      <div
                        className={`w-full rounded-t-md transition-all ${current ? 'bg-ink-500' : 'bg-ink-200'}`}
                        style={{ height: `${barH}px` }}
                      />
                    </div>
                    {/* Month label */}
                    <span className={`text-[11px] font-semibold ${current ? 'text-ink-600' : 'text-stone-400'}`}>
                      {month}
                    </span>
                    {current && (
                      <span className="text-[9px] font-bold bg-ink-100 text-ink-600 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        Current
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-100 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-ink-500" />
                <span className="text-[11px] text-stone-500">Current month</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-ink-200" />
                <span className="text-[11px] text-stone-500">Prior months</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-sage-600">&uarr; Up</span>
                <span className="text-[10px] font-bold text-crimson-600">&darr; Down</span>
                <span className="text-[10px] text-stone-400">vs prior month</span>
              </div>
              <div className="ml-auto text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Gross Written Premium
              </div>
            </div>
          </Card>
        </div>

        {/* Pipeline Breakdown — 1/3 width */}
        <div className="col-span-1">
          <Card title="Pipeline Breakdown" subtitle={`${PIPELINE_TOTAL} total submissions`}>
            <div className="space-y-3">
              {PIPELINE_STAGES.map(({ label, count, colorBar, colorBadge }) => {
                const pct = Math.round((count / PIPELINE_TOTAL) * 100)
                return (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-700">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorBadge}`}>
                          {count}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono w-7 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colorBar} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Pipeline</span>
              <span className="font-mono font-black text-ink-800 text-lg">{PIPELINE_TOTAL}</span>
            </div>
          </Card>
        </div>

      </div>

      {/* ── Row 3: Top Agencies + Transaction Mix ── */}
      <div className="grid grid-cols-2 gap-4">

        <Card title="Top Agencies by Volume" subtitle={`Submissions count — ${period}`}>
          <div className="space-y-3">
            {data.agencyVolume.map(({ name, count }, idx) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-ink-100 text-ink-700 text-[10px] font-black flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-800 truncate pr-2">{name}</span>
                    <span className="text-[10px] font-bold bg-ink-50 text-ink-700 border border-ink-100 px-2 py-0.5 rounded-full shrink-0">
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-ink-400 transition-all"
                      style={{ width: `${Math.round((count / agencyMax) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Transaction Mix" subtitle={`Breakdown by transaction type — ${period}`}>
          {/* Stacked bar */}
          <div className="flex h-8 rounded-lg overflow-hidden gap-0.5 mb-5">
            {data.txMix.map(({ type, pct }) => (
              <div
                key={type}
                className={`${TX_COLORS[type]?.bar || 'bg-stone-300'} transition-all`}
                style={{ width: `${pct}%` }}
                title={`${type}: ${pct}%`}
              />
            ))}
          </div>
          <div className="space-y-3">
            {data.txMix.map(({ type, count, pct }) => {
              const c = TX_COLORS[type] || { text: 'text-stone-600', bg: 'bg-stone-50', border: 'border-stone-200', bar: 'bg-stone-300' }
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-sm ${c.bar} shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-700">{type}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
                          {count}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Submissions</span>
            <span className="font-mono font-black text-ink-800 text-lg">
              {data.txMix.reduce((s, t) => s + t.count, 0)}
            </span>
          </div>
        </Card>

      </div>

      {/* ── Row 4: Loss Ratio by Agency ── */}
      <Card title="Loss Ratio by Agency" subtitle="Paid + Reserved losses / Earned premium · rolling 12 months">
        {/* Top spacing so the first row's threshold label has room */}
        <div className="mt-6 space-y-3">
          {LOSS_RATIO_DATA.map(({ agency, ratio }, idx) => {
            const acceptable = ratio < 65
            return (
              <div key={agency} className="flex items-center gap-4">
                {/* Agency name — fixed width column */}
                <span className="text-xs font-semibold text-stone-700 w-52 shrink-0 truncate">{agency}</span>

                {/* Bar track */}
                <div className="flex-1 relative h-4">
                  {/* Background track */}
                  <div className="absolute inset-0 bg-stone-100 rounded-full" />
                  {/* Filled portion */}
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${acceptable ? 'bg-sage-500' : 'bg-crimson-500'}`}
                    style={{ width: `${ratio}%` }}
                  />
                  {/* 65% dashed threshold — label only on first row to avoid repetition */}
                  <div
                    className="absolute top-0 bottom-0 z-10"
                    style={{ left: '65%', borderLeft: '1.5px dashed #a8a29e' /* stone-300 */ }}
                  >
                    {idx === 0 && (
                      <span
                        className="absolute bottom-full mb-1 text-[9px] font-bold text-stone-400 whitespace-nowrap"
                        style={{ transform: 'translateX(-50%)' }}
                      >
                        65% Target
                      </span>
                    )}
                  </div>
                </div>

                {/* Numeric value */}
                <span className={`font-mono text-xs font-bold w-10 text-right shrink-0 ${acceptable ? 'text-sage-700' : 'text-crimson-600'}`}>
                  {ratio}%
                </span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-5 pt-3 border-t border-stone-100 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-sage-500 shrink-0" />
            <span className="text-[11px] text-stone-500">Acceptable (&lt; 65%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-crimson-500 shrink-0" />
            <span className="text-[11px] text-stone-500">Review Needed (&ge; 65%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 shrink-0" style={{ borderLeft: '1.5px dashed #a8a29e' /* stone-300 */, width: '1px' }} />
            <span className="text-[11px] text-stone-500">65% Threshold</span>
          </div>
        </div>
      </Card>

      {/* ── Row 5: UW Performance Table ── */}
      <Card
        title="Underwriter Performance"
        subtitle={`Individual UW metrics — ${period}`}
        actions={
          <Button
            variant="secondary"
            size="xs"
            icon={Download}
            loading={uwExporting}
            onClick={handleUwExport}
          >
            Export
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100">
                {['UW Name', 'Open Submissions', 'Bound MTD', 'Avg Days to Quote', 'Win Rate', 'Total Premium Written'].map(h => (
                  <th
                    key={h}
                    className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pb-2.5 pr-4 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {UW_PERFORMANCE.map(row => (
                <tr
                  key={row.name}
                  className="hover:bg-stone-50 cursor-pointer transition-colors"
                  onClick={() => handleUwRowClick(row.name)}
                >
                  <td className="py-3 pr-4">
                    <UWChip name={row.name} />
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-mono text-sm font-bold text-stone-800">{row.openSubs}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-mono text-sm font-bold text-stone-800">{row.boundMTD}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`font-mono text-sm font-bold ${row.avgDays <= 4 ? 'text-sage-700' : row.avgDays <= 5.5 ? 'text-amber-600' : 'text-crimson-600'}`}>
                      {row.avgDays}d
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-700 w-8 shrink-0">{row.winRate}%</span>
                      <div className="relative bg-stone-100 rounded-full h-1.5 w-16 shrink-0">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full bg-sage-500"
                          style={{ width: `${row.winRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-mono text-sm font-bold text-ink-700">{row.premium}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Row 6: Quote Activity Table ── */}
      <Card title="Quote Activity — Last 30 Days" subtitle="Submissions with active or bound quotes">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100">
                {['Submission #', 'Insured', 'Quoted Premium', 'Status', 'Days to Quote', 'Assignee'].map(h => (
                  <th key={h} className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pb-2.5 pr-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {QUOTE_ACTIVITY.map(row => (
                <tr
                  key={row.sn}
                  className="hover:bg-stone-25 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/submissions/${row.id}`)}
                >
                  <td className="py-3 pr-4">
                    <span className="font-mono text-xs font-bold text-ink-700 group-hover:text-ink-900">
                      {row.sn}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-sm font-semibold text-stone-800">{row.insured}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-mono text-sm font-bold text-stone-900">{row.premium}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusChip status={row.status} />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-stone-700">{row.days}d</span>
                      <div className="h-1.5 w-16 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.days <= 3 ? 'bg-sage-500' : row.days <= 5 ? 'bg-amber-400' : 'bg-crimson-400'}`}
                          style={{ width: `${Math.min((row.days / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <Assignee name={row.assignee} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
            Showing {QUOTE_ACTIVITY.length} of {QUOTE_ACTIVITY.length} records
          </span>
          <button
            className="text-xs font-semibold text-ink-600 hover:text-ink-900 flex items-center gap-1 transition-colors"
            onClick={() => navigate('/submissions')}
          >
            View all submissions <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
          NEW SECTIONS — Batch I additions below
      ══════════════════════════════════════════════════════════════════════════ */}

      {/* ── Section 1: Renewal Pipeline Panel ── */}
      <Card
        title="Renewal Pipeline — Next 3 Months"
        subtitle="Upcoming renewals by effective date"
        actions={
          <span className="flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-stone-400" />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              {RENEWAL_MONTHS.reduce((sum, m) => sum + m.count, 0)} renewals
            </span>
          </span>
        }
      >
        <div className="space-y-2">
          {RENEWAL_MONTHS.map((month) => {
            const isOpen = !!expandedMonths[month.label]
            return (
              <div key={month.label} className="border border-stone-100 rounded-xl overflow-hidden">
                {/* Month header — clickable accordion toggle */}
                <button
                  className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
                  onClick={() => toggleMonth(month.label)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-stone-800">{month.label}</span>
                    <span className="text-[10px] font-bold bg-ink-50 text-ink-700 border border-ink-100 px-2 py-0.5 rounded-full font-mono">
                      {month.count} renewal{month.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 text-stone-400 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-stone-400 shrink-0" />
                  }
                </button>

                {/* Expandable rows */}
                {isOpen && (
                  <div className="divide-y divide-stone-50">
                    {/* Table header */}
                    <div className="grid grid-cols-5 px-4 py-2 bg-white border-b border-stone-100">
                      {['Submission #', 'Insured', 'Renewal Date', 'Current Premium', 'Days Until'].map(h => (
                        <span key={h} className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                          {h}
                        </span>
                      ))}
                    </div>

                    {month.rows.map((row) => {
                      const rowColorClass = renewalRowClass(row.daysUntil)
                      return (
                        <div
                          key={row.sn}
                          className="grid grid-cols-5 items-center px-4 py-3 bg-white hover:bg-stone-50 transition-colors"
                        >
                          <span className={`font-mono text-xs font-bold ${rowColorClass}`}>
                            {row.sn}
                          </span>
                          <span className={`text-sm ${rowColorClass}`}>
                            {row.insured}
                          </span>
                          <span className={`font-mono text-xs ${rowColorClass}`}>
                            {row.renewalDate}
                          </span>
                          <span className={`font-mono text-xs ${rowColorClass}`}>
                            {row.premium}
                          </span>
                          <div className="flex items-center justify-between gap-3">
                            <span className={`font-mono text-xs font-bold ${rowColorClass}`}>
                              {row.daysUntil}d
                            </span>
                            <button
                              className="text-[11px] font-bold text-ink-600 hover:text-ink-900 border border-ink-200 hover:border-ink-400 bg-ink-50 hover:bg-ink-100 px-2.5 py-1 rounded-md transition-all whitespace-nowrap"
                              onClick={() => handleStartRenewal(row.insured)}
                            >
                              Start Renewal
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Color-coding legend */}
        <div className="flex items-center gap-5 mt-4 pt-3 border-t border-stone-100 flex-wrap">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Days Until Renewal:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-stone-400 shrink-0" />
            <span className="text-[11px] text-stone-500">&gt; 60 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-[11px] text-stone-500">30–60 days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-crimson-500 shrink-0" />
            <span className="text-[11px] font-bold text-stone-500">&lt; 30 days (urgent)</span>
          </div>
        </div>
      </Card>

      {/* ── Section 2: Loss Ratio by Class of Business ── */}
      <Card
        title="Loss Ratio by Class of Business"
        subtitle="Paid + Reserved losses / Earned premium · rolling 12 months"
      >
        <div className="mt-6 space-y-3">
          {LOSS_RATIO_CLASS.map(({ label, ratio }, idx) => {
            const acceptable = ratio < 65
            return (
              <div key={label} className="flex items-center gap-4">
                {/* Class label — fixed width */}
                <span className="text-xs font-semibold text-stone-700 w-28 shrink-0">{label}</span>

                {/* Bar track */}
                <div className="flex-1 relative h-4">
                  {/* Background track */}
                  <div className="absolute inset-0 bg-stone-100 rounded-full" />
                  {/* Filled bar */}
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all ${acceptable ? 'bg-sage-500' : 'bg-crimson-500'}`}
                    style={{ width: `${ratio}%` }}
                  />
                  {/* 65% dashed threshold line */}
                  <div
                    className="absolute top-0 bottom-0 z-10"
                    style={{ left: '65%', borderLeft: '1.5px dashed #a8a29e' /* stone-300 */ }}
                  >
                    {/* "65% Target" label — first row only */}
                    {idx === 0 && (
                      <span
                        className="absolute bottom-full mb-1 text-[9px] font-bold text-stone-400 whitespace-nowrap"
                        style={{ transform: 'translateX(-50%)' }}
                      >
                        65% Target
                      </span>
                    )}
                  </div>
                </div>

                {/* Numeric value */}
                <span className={`font-mono text-xs font-bold w-10 text-right shrink-0 ${acceptable ? 'text-sage-700' : 'text-crimson-600'}`}>
                  {ratio}%
                </span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-5 pt-3 border-t border-stone-100 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-sage-500 shrink-0" />
            <span className="text-[11px] text-stone-500">Acceptable (&lt; 65%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-crimson-500 shrink-0" />
            <span className="text-[11px] text-stone-500">Review Needed (&ge; 65%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 shrink-0" style={{ borderLeft: '1.5px dashed #a8a29e' /* stone-300 */, width: '1px' }} />
            <span className="text-[11px] text-stone-500">65% Threshold</span>
          </div>
        </div>
      </Card>

      {/* ── Section 3: Combined Ratio Trend ── */}
      <Card
        title="Combined Ratio Trend"
        subtitle="Loss Ratio + Expense Ratio · last 6 months"
      >
        <div className="flex gap-6">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between items-end pb-6 shrink-0" style={{ height: '12rem' }}>
            {['150%', '100%', '50%', '0%'].map(label => (
              <span key={label} className="font-mono text-[10px] text-stone-400 leading-none">
                {label}
              </span>
            ))}
          </div>

          {/* Chart area */}
          <div className="flex-1 relative">
            {/* 100% dashed horizontal marker */}
            <div
              className="absolute left-0 right-0 z-10 pointer-events-none"
              style={{
                bottom: `${(100 / 150) * 100}%`,
                borderTop: '1.5px dashed #a8a29e' /* stone-300 */,
              }}
            >
              <span
                className="absolute right-0 text-[9px] font-bold text-stone-400 leading-none"
                style={{ transform: 'translateY(-100%)' }}
              >
                100%
              </span>
            </div>

            {/* Bars container */}
            <div className="flex items-end justify-around h-48 pb-6 gap-2">
              {COMBINED_RATIO_DATA.map(({ month, loss, expense }, idx) => {
                const total      = loss + expense
                const totalPct   = total   / 150   // scale: 150% = full height
                const lossPct    = loss    / 150
                const expensePct = expense / 150
                const isHovered  = hoveredBar === idx

                return (
                  <div
                    key={month}
                    className="flex flex-col items-center gap-1 flex-1 relative"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div
                        className="absolute z-20 bg-stone-900 text-white text-[11px] font-semibold px-3 py-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
                        style={{ bottom: `calc(${totalPct * 100}% + 0.5rem)` }}
                      >
                        <div className="text-[10px] font-bold text-stone-300 mb-1">{month}</div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-sm bg-ink-400 shrink-0" />
                            <span>Loss: <span className="font-mono">{loss}%</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-sm bg-stone-300 shrink-0" />
                            <span>Expense: <span className="font-mono">{expense}%</span></span>
                          </div>
                          <div className="border-t border-stone-700 pt-0.5 mt-0.5">
                            Total: <span className="font-mono font-bold">{total}%</span>
                          </div>
                        </div>
                        {/* Tooltip arrow */}
                        <div
                          className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
                          style={{
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #1c1917', /* stone-800 */
                          }}
                        />
                      </div>
                    )}

                    {/* Stacked bar */}
                    <div
                      className="w-full flex flex-col-reverse rounded-t-md overflow-hidden transition-all cursor-pointer"
                      style={{ height: `${totalPct * 100}%` }}
                    >
                      {/* Bottom segment: Loss Ratio */}
                      <div
                        className={`w-full shrink-0 transition-all ${isHovered ? 'bg-ink-500' : 'bg-ink-400'}`}
                        style={{ height: `${(lossPct / totalPct) * 100}%` }}
                      />
                      {/* Top segment: Expense Ratio */}
                      <div
                        className={`w-full shrink-0 transition-all ${isHovered ? 'bg-stone-400' : 'bg-stone-300'}`}
                        style={{ height: `${(expensePct / totalPct) * 100}%` }}
                      />
                    </div>

                    {/* Month label */}
                    <span className={`text-[11px] font-semibold ${total > 100 ? 'text-crimson-600' : 'text-stone-500'}`}>
                      {month}
                    </span>
                    {/* Total label */}
                    <span className={`font-mono text-[10px] font-bold ${total > 100 ? 'text-crimson-600' : 'text-stone-400'}`}>
                      {total}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-2 pt-3 border-t border-stone-100 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-ink-400 shrink-0" />
            <span className="text-[11px] text-stone-500">Loss Ratio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-stone-300 shrink-0" />
            <span className="text-[11px] text-stone-500">Expense Ratio (28%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 shrink-0" style={{ borderLeft: '1.5px dashed #a8a29e' /* stone-300 */, width: '1px' }} />
            <span className="text-[11px] text-stone-500">100% Breakeven Line</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] font-bold text-crimson-600">103%, 110%</span>
            <span className="text-[11px] text-stone-400">above breakeven — review needed</span>
          </div>
          <div className="ml-auto text-[10px] text-stone-300 uppercase tracking-widest font-bold">
            Hover bar for breakdown
          </div>
        </div>
      </Card>

      {/* ── Email Report Modal ── */}
      <EmailReportModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        toast={toast}
      />

    </div>
  )
}
