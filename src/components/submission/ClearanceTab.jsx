import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { useToast } from '../ui/Toast'
import { agencies } from '../../data/mockData'
import {
  ShieldCheck, AlertTriangle, Search, CheckCircle2, CircleDot, ArrowRight,
  Flag, MapPin, Info,
} from 'lucide-react'
import Toggle from '../ui/Toggle'
import AddressMap, { lookupZip, geocodeAddress, reverseGeocodeLatLng, searchAddresses } from './AddressMap'
import useFieldValidation from '../../hooks/useFieldValidation'

const agentsByAgency = {
  'Hawthorne Risk Advisors, LLC': ['Michael Grant', 'Rebecca Torres'],
  'Pacific Crest Insurance':       ['Sarah Okonkwo', 'David Park'],
  'Meridian Specialty Lines':      ['Carlos Reyes', 'Janet Wu'],
  'Apex Commercial Risk':          ['Lisa Tran', 'Steven Moore'],
  'Greenfield Risk Partners':      ['Omar Hassan', 'Megan Bell'],
  'Coastal Commercial Group':      ['Priya Sharma', 'Andre Jackson'],
}

// ─── Workflow Timeline ────────────────────────────────────────────────────────

function WorkflowTimeline({ result }) {
  const steps = [
    { label: 'Submission Received', done: true,                   active: false },
    { label: 'Clearance Check',     done: result === 'cleared',   active: !result },
    { label: 'Proceed to Account',  done: false,                  active: result === 'cleared' },
  ]
  return (
    <div>
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={[
              'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
              s.done ? 'bg-sage-500' : s.active ? 'bg-ink-400 animate-pulse' : 'bg-stone-100 border border-stone-200',
            ].join(' ')}>
              {s.done
                ? <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                : s.active
                  ? <CircleDot className="h-3.5 w-3.5 text-white" />
                  : <span className="w-2 h-2 rounded-full bg-stone-300 block" />
              }
            </div>
            {i < steps.length - 1 && (
              <div className={`w-px h-7 mt-0.5 mb-0.5 ${s.done ? 'bg-sage-300' : 'bg-stone-200'}`} />
            )}
          </div>
          <p className={`text-xs font-medium pt-1 ${s.done ? 'text-sage-700' : s.active ? 'text-ink-600' : 'text-stone-400'}`}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Risk Assessment Score Panel ──────────────────────────────────────────────

const RISK_DIMENSIONS = [
  { label: 'Business Stability',   score: 80 },
  { label: 'Loss History',         score: 65 },
  { label: 'Exposure Type',        score: 70 },
  { label: 'Agency Relationship',  score: 90 },
  { label: 'Geographic Risk',      score: 55 },
]

function scoreColor(score) {
  if (score >= 70) return 'bg-sage-400'
  if (score >= 50) return 'bg-amber-400'
  return 'bg-crimson-400'
}

function scoreLabel(score) {
  if (score >= 80) return { text: 'Low Risk',        classes: 'bg-sage-100 text-sage-700'    }
  if (score >= 60) return { text: 'Acceptable Risk', classes: 'bg-sage-100 text-sage-700'    }
  if (score >= 40) return { text: 'Moderate Risk',   classes: 'bg-amber-100 text-amber-700'  }
  return               { text: 'High Risk',          classes: 'bg-crimson-100 text-crimson-700' }
}

function RiskAssessmentPanel() {
  const OVERALL = 72
  const { text, classes } = scoreLabel(OVERALL)

  return (
    <Card title="Risk Assessment Score" actions={
      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${classes}`}>
        {text}
      </span>
    }>
      <div className="flex items-end gap-3 mb-5">
        <span className="font-mono text-4xl font-black text-ink-800">{OVERALL}</span>
        <span className="font-mono text-lg text-stone-400 mb-1">/ 100</span>
      </div>

      <div className="space-y-3">
        {RISK_DIMENSIONS.map(({ label, score }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-stone-600">{label}</span>
              <span className="font-mono text-xs font-semibold text-stone-700">{score}</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${scoreColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Flag for Manual Review Panel ────────────────────────────────────────────

function FlagForReviewPanel() {
  const toast = useToast()
  const [isFlagged, setIsFlagged] = useState(false)
  const [flagNotes, setFlagNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSaveFlag = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    toast.success('Submission flagged', 'Submission flagged for manual review.')
  }

  return (
    <Card title="Manual Review">
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsFlagged(f => !f)}
          className={[
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150',
            isFlagged
              ? 'bg-crimson-600 text-white border-crimson-600 hover:bg-crimson-700'
              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50',
          ].join(' ')}
        >
          <Flag className="h-4 w-4" />
          {isFlagged ? 'Flagged for Review' : 'Flag for Manual Review'}
        </button>

        {isFlagged && (
          <div className="space-y-2">
            <textarea
              value={flagNotes}
              onChange={e => setFlagNotes(e.target.value)}
              placeholder="Reason for manual review..."
              rows={3}
              className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300"
            />
            <div className="flex justify-end">
              <Button
                variant="danger"
                size="sm"
                loading={saving}
                onClick={handleSaveFlag}
              >
                Save Flag
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ─── Prior Policy Lookup ──────────────────────────────────────────────────────

const MOCK_PRIOR_POLICIES = [
  { carrier: 'Travelers',  policyNum: 'TRV-00192841', effective: '10/01/2025', premium: '$1,240.00', status: 'Expired' },
  { carrier: 'Hartford',   policyNum: 'HFD-00748291', effective: '10/01/2024', premium: '$980.00',   status: 'Expired' },
]

function PriorPolicyLookup() {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setResults(null)
    await new Promise(r => setTimeout(r, 1000))
    setSearching(false)
    setResults(MOCK_PRIOR_POLICIES)
  }

  const handleUse = policy => {
    toast.success('Prior policy imported', `${policy.carrier} policy ${policy.policyNum} has been imported.`)
  }

  return (
    <Card title="Prior Policy Lookup">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Enter FEIN or Policy #..."
          className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-ink-300"
        />
        <Button
          variant="secondary"
          size="sm"
          icon={Search}
          loading={searching}
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {results !== null && (
        results.length === 0 ? (
          <p className="text-sm text-stone-400 py-3 text-center">No prior policies found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-stone-100">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr>
                  {['Carrier', 'Policy #', 'Effective', 'Premium', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {results.map(p => (
                  <tr key={p.policyNum} className="hover:bg-stone-25">
                    <td className="px-3 py-2.5 font-medium text-stone-800">{p.carrier}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-stone-600">{p.policyNum}</td>
                    <td className="px-3 py-2.5 text-stone-500">{p.effective}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-stone-700">{p.premium}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => handleUse(p)}
                        className="text-xs font-medium text-ink-700 hover:text-ink-800 border border-ink-200 hover:border-ink-300 bg-ink-50 hover:bg-ink-100 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Use This
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </Card>
  )
}

// ─── Market Intelligence Panel ────────────────────────────────────────────────

function MarketIntelligencePanel() {
  const toast = useToast()
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    toast.success('Market intelligence saved', 'Your market notes have been saved.')
  }

  return (
    <Card title="Market Intelligence">
      <div className="space-y-3">
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add market notes, competing quotes, or pricing intelligence..."
          rows={4}
          className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-ink-300"
        />
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            loading={saving}
            onClick={handleSave}
          >
            Save Note
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ─── ClearanceTab ─────────────────────────────────────────────────────────────

export default function ClearanceTab({ submission, onNext }) {
  const toast = useToast()
  const [agency, setAgency]     = useState(submission?.agencyName || '')
  const [agent, setAgent]       = useState(submission?.agentName || '')
  const [effectiveDate, setEff] = useState(submission?.effectiveDate || '')
  const [expiryDate, setExp]    = useState(submission?.expirationDate || '')
  const [checking, setChecking] = useState(false)
  const [result, setResult]     = useState(null)
  const [countdown, setCountdown] = useState(null)

  // Account Information state
  const [isNewAccount, setIsNewAccount] = useState(true)
  const [accountName, setAccountName]   = useState(submission?.insuredName || '')
  const [legalDba, setLegalDba]         = useState('')
  const [fullAddress, setFullAddress]   = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity]                 = useState('')
  const [state, setState]               = useState('')
  const [county, setCounty]             = useState('')
  const [zipcode, setZipcode]           = useState('')
  const [country, setCountry]           = useState('US')
  const [phone, setPhone]               = useState('')
  const [fein, setFein]                 = useState('')
  const [mapCenter, setMapCenter]       = useState(null)
  const [suggestions, setSuggestions]   = useState([])
  const suggestionsRef = useRef(null)
  const zipLookupRef = useRef(null)

  // Inline field validation
  const validationSchema = useMemo(() => ({
    accountName:   ['required'],
    fullAddress:   ['required'],
    addressLine1:  ['required'],
    city:          ['required'],
    state:         ['required'],
    zipcode:       ['required', 'zip'],
    country:       ['required'],
    phone:         ['phone'],
    fein:          ['fein'],
    effectiveDate: ['required', 'date'],
  }), [])
  const { validate, touchField, fieldError } = useFieldValidation(validationSchema)

  // Helpers to wire onChange + onBlur with validation
  const vProps = (field, value) => ({
    error: fieldError(field),
    onBlur: () => { touchField(field); validate(field, value) },
  })

  // Zip code auto-fill: when 5 digits are entered, look up city/state and center map
  const handleZipChange = useCallback(async (e) => {
    const val = e.target.value
    setZipcode(val)
    if (zipLookupRef.current) clearTimeout(zipLookupRef.current)
    if (/^\d{5}$/.test(val)) {
      zipLookupRef.current = setTimeout(async () => {
        const data = await lookupZip(val)
        if (data) {
          setCity(data.city)
          setState(data.state)
          setMapCenter([data.lat, data.lng])
        }
      }, 300)
    }
  }, [])

  // Map click → reverse geocode → fill all address fields
  const handleMapClick = useCallback(async ([lat, lng]) => {
    const data = await reverseGeocodeLatLng(lat, lng)
    if (data) {
      setFullAddress(data.fullAddress)
      setAddressLine1(data.addressLine1)
      setCity(data.city)
      setState(data.state)
      setCounty(data.county)
      setZipcode(data.zipcode)
      setCountry(data.country)
      setMapCenter([lat, lng])
    }
  }, [])

  // Full address search → show autocomplete suggestions
  const searchRef = useRef(null)
  const handleAddressSearch = useCallback((e) => {
    const val = e.target.value
    setFullAddress(val)
    if (searchRef.current) clearTimeout(searchRef.current)
    if (val.length < 3) { setSuggestions([]); return }
    searchRef.current = setTimeout(async () => {
      const results = await searchAddresses(val)
      setSuggestions(results)
    }, 400)
  }, [])

  // Select a suggestion → fill all fields, close dropdown, center map
  const handleSelectSuggestion = useCallback((s) => {
    setFullAddress(s.displayName)
    setAddressLine1(s.addressLine1)
    setCity(s.city)
    setState(s.state)
    setCounty(s.county)
    setZipcode(s.zipcode)
    setCountry(s.country)
    setMapCenter([s.lat, s.lng])
    setSuggestions([])
  }, [])

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Visual countdown → auto advance
  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) { onNext?.(); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, onNext])

  const agentOptions = agency ? (agentsByAgency[agency] || []) : []

  const handleCheck = async () => {
    setChecking(true)
    setResult(null)
    setCountdown(null)
    await new Promise(r => setTimeout(r, 1400))
    setChecking(false)
    setResult('cleared')
    toast.success('Clearance passed', 'No conflicting submissions found for this insured.')
    setCountdown(3)
  }

  return (
    <div className="space-y-6">
      {/* ── Phase 1: Review Risk Profile (read-only) ──────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ink-100 text-ink-700 text-xs font-bold shrink-0">1</span>
          <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">Review Risk Profile</h3>
          <div className="flex-1 h-px bg-stone-100" />
        </div>
        <RiskAssessmentPanel />
      </div>

      {/* ── Phase 2: Complete Required Fields (editable) ──────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ink-100 text-ink-700 text-xs font-bold shrink-0">2</span>
          <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">Complete Required Fields</h3>
          <div className="flex-1 h-px bg-stone-100" />
        </div>

      {/* Main clearance form grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: form (2/3 width) */}
        <div className="col-span-2 space-y-5">
          {/* ── Account Information ──────────────────────────────────────── */}
          <Card title="Account Information" actions={
            <div className="flex items-center gap-2">
              <Toggle checked={isNewAccount} onChange={setIsNewAccount} />
              <span className="text-xs text-stone-500 font-medium">New Account</span>
            </div>
          }>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Account Name" required value={accountName} onChange={e => { setAccountName(e.target.value); validate('accountName', e.target.value) }} {...vProps('accountName', accountName)} />
                <Input label="Legal Entity Name / DBA" value={legalDba} onChange={e => setLegalDba(e.target.value)} />
              </div>

              {/* Address with interactive map */}
              <div className="relative" ref={suggestionsRef}>
                <Input label="Enter Full Address" required value={fullAddress} onChange={handleAddressSearch} placeholder="Start typing to search..." {...vProps('fullAddress', fullAddress)} onFocus={() => { if (suggestions.length) setSuggestions(suggestions) }} />
                {suggestions.length > 0 && (
                  <ul className="absolute z-[9999] left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="px-3 py-2 text-sm text-stone-700 hover:bg-flame-50 hover:text-flame-700 cursor-pointer flex items-start gap-2"
                        onMouseDown={() => handleSelectSuggestion(s)}
                      >
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-stone-400" />
                        <span className="line-clamp-2">{s.displayName}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <AddressMap center={mapCenter} onMapClick={handleMapClick} />
                <p className="text-[10px] text-stone-400 mt-1">Click on the map to auto-fill the address fields</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Address Line 1" required value={addressLine1} onChange={e => { setAddressLine1(e.target.value); validate('addressLine1', e.target.value) }} {...vProps('addressLine1', addressLine1)} />
                <Input label="Address Line 2" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" required value={city} onChange={e => { setCity(e.target.value); validate('city', e.target.value) }} {...vProps('city', city)} />
                <Input label="State" required value={state} onChange={e => { setState(e.target.value); validate('state', e.target.value) }} {...vProps('state', state)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="County" required value={county} onChange={e => setCounty(e.target.value)} />
                <Input label="Zipcode" required value={zipcode} onChange={handleZipChange} {...vProps('zipcode', zipcode)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Country" required value={country} onChange={e => { setCountry(e.target.value); validate('country', e.target.value) }} {...vProps('country', country)} />
                <div />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone Number" type="tel" value={phone} onChange={e => { setPhone(e.target.value); validate('phone', e.target.value) }} {...vProps('phone', phone)} />
                <Input label="FEIN" value={fein} onChange={e => { setFein(e.target.value); validate('fein', e.target.value) }} {...vProps('fein', fein)} placeholder="XX-XXXXXXX" />
              </div>

              {/* Divider */}
              <div className="border-t border-stone-100 pt-5">
                <h4 className="text-sm font-semibold text-stone-800 mb-3">Agency Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Agency Name" required searchable
                    options={agencies} value={agency}
                    onChange={v => { setAgency(v); setAgent('') }}
                  />
                </div>
              </div>

              {/* Agent */}
              <div className="border-t border-stone-100 pt-5">
                <h4 className="text-sm font-semibold text-stone-800 mb-3">Agent Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Agent Name" searchable
                    options={agentOptions} value={agent}
                    onChange={setAgent}
                    placeholder={agency ? 'Select agent...' : 'Select agency first'}
                    disabled={!agency}
                  />
                </div>
              </div>

              {/* Policy Dates */}
              <div className="border-t border-stone-100 pt-5">
                <h4 className="text-sm font-semibold text-stone-800 mb-3">Policy Dates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Policy Effective Date"   required type="date" value={effectiveDate} onChange={e => { setEff(e.target.value); validate('effectiveDate', e.target.value) }} {...vProps('effectiveDate', effectiveDate)} />
                  <Input label="Policy Expiration Date"  type="date"          value={expiryDate}    onChange={e => setExp(e.target.value)} />
                </div>
              </div>
            </div>
          </Card>

          {/* Prior Policy Lookup */}
          <PriorPolicyLookup />
        </div>

        {/* Right: status + timeline + info (1/3 width) */}
        <div className="space-y-4">
          {/* Submission info stat grid */}
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Submission Info</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                ['Sub #',      submission?.submissionNumber],
                ['Assignee',   submission?.assignee],
                ['Created',    submission?.createdDate],
                ['Need By',    submission?.needByDate],
                ['LOB',        'General Liability'],
                ['Priority',   submission?.priority],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{k}</p>
                  <p className="text-xs font-semibold text-stone-800 mt-0.5 truncate">{v || '—'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Flag for Manual Review */}
          <FlagForReviewPanel />
        </div>
      </div>
      </div>

      {/* ── Phase 3: Run Clearance (action) ───────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ink-100 text-ink-700 text-xs font-bold shrink-0">3</span>
          <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">Run Clearance</h3>
          <div className="flex-1 h-px bg-stone-100" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">
          <Button
            variant="cta" size="lg" icon={Search}
            loading={checking} onClick={handleCheck}
            className="w-full justify-center"
          >
            {checking ? 'Checking Clearance...' : 'Check for Clearance'}
          </Button>

          {result === 'cleared' && (
            <div className="rounded-xl bg-sage-50 border border-sage-200 px-5 py-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-sage-600" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-sage-700">Clearance Passed</p>
                <p className="text-sm text-sage-600 mt-0.5">No conflicting policies found for this insured and agency combination.</p>
                {countdown !== null && countdown > 0 && (
                  <p className="text-xs text-sage-500 mt-1.5">Redirecting to Account in {countdown}s…</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <Button variant="cta" size="sm" icon={ArrowRight} onClick={onNext}>
                    Proceed to Account
                  </Button>
                  {countdown !== null && countdown > 0 && (
                    <div className="flex-1 h-1.5 rounded-full bg-sage-200 overflow-hidden">
                      <div
                        className="h-full bg-sage-500 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {result === 'conflict' && (
            <div className="rounded-xl bg-crimson-50 border border-crimson-200 px-5 py-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-crimson-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-crimson-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-crimson-700">Conflict Found</p>
                <p className="text-sm text-crimson-600 mt-0.5">One or more active policies overlap. Review before proceeding.</p>
              </div>
            </div>
          )}
          </div>

          {/* Right: clearance status panel */}
          <div>
          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Clearance Status</span>
              {result === 'cleared' && (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full">Cleared</span>
              )}
            </div>
            <div className="p-4">
              {result === null && !checking && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-2">
                    <Search className="h-5 w-5 text-stone-400" />
                  </div>
                  <p className="text-xs text-stone-400">Run clearance check to see result.</p>
                </div>
              )}
              {checking && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-ink-50 flex items-center justify-center mx-auto mb-2 animate-pulse">
                    <Search className="h-5 w-5 text-ink-500" />
                  </div>
                  <p className="text-xs text-ink-600 font-medium">Checking for conflicts…</p>
                </div>
              )}
              {result && <WorkflowTimeline result={result} />}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Market Intelligence — bottom section */}
      <MarketIntelligencePanel />
    </div>
  )
}
