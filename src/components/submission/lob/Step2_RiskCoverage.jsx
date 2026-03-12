import { useState } from 'react'
import Card from '../../ui/Card'
import Select from '../../ui/Select'
import Toggle from '../../ui/Toggle'
import Input from '../../ui/Input'
import { deductibleOptions, usStates } from '../../../data/mockData'
import { ChevronDown, ChevronUp, Plus, Trash2, AlertTriangle } from 'lucide-react'

const occurrenceLimits = [
  '25,000 CSL', '50,000 CSL', '100,000 CSL', '200,000 CSL', '300,000 CSL', '500,000 CSL',
  '1,000,000 CSL', '1,500,000 CSL', '2,000,000 CSL', '3,000,000 CSL', '4,000,000 CSL',
  '5,000,000 CSL', '10,000,000 CSL',
]
const aggLimits = [
  '1,000,000 CSL', '1,500,000 CSL', '2,000,000 CSL', '2,500,000 CSL', '3,000,000 CSL',
  '4,000,000 CSL', '5,000,000 CSL', '10,000,000 CSL',
]
const medPayLimits     = ['5,000', '10,000', '25,000', '50,000', 'Excluded']
const coverageForms    = ['Occurrence', 'Claims-Made']
const lossControlOpts  = [
  'Require Loss Control',
  'Waive Loss Control Requirement',
  'Not Applicable',
  'Other Require Loss Control',
  'Not Required Loss Control',
  'Require Loss Reduction',
  'Require Risk Control',
  'Live Require Risk Control',
  'Live Require Loss Reduction',
]
const sublineOptions   = [
  'Premises/Operations and Products/Completed Operations',
  'Premises/Operations',
  'Products/Completed Operations',
  'Liquor',
  'Owners and Contractors',
  'Railroad',
]
const ADDITIONAL_COVERAGES_CATALOG = [
  'Primary And Noncontributory - Other Insurance Condition',
  'Waiver of Transfer of Rights',
  'Additional Insured – Owners, Lessees or Contractors',
  'Additional Insured – Completed Operations',
  'Blanket Additional Insured',
]

const liquorLicenseOpts  = ['Beer & Wine Only', 'Full Liquor', 'BYOB Permitted', 'Temporary Permit']
const liquorEstabOpts    = ['Bar/Tavern', 'Restaurant', 'Hotel/Motel', 'Liquor Store', 'Nightclub', 'Fraternal/Social Club', 'Catering']
const ocpOperationsOpts  = ['General Contracting', 'Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Excavation', 'Demolition', 'Other']
const rrOperationsOpts   = ['Construction', 'Maintenance', 'Repair', 'Demolition', 'Excavation', 'Pipeline', 'Utility Work']
const personalInjuryLimits = ['100,000', '300,000', '500,000', '1,000,000', '2,000,000']
const yesNoOpts = ['No', 'Yes']
const liquorOccurrenceLimits = ['25,000','50,000','100,000','200,000','300,000','500,000','1,000,000','1,500,000','2,000,000','3,000,000','4,000,000','5,000,000','10,000,000']
const liquorAggLimits = ['1,000,000','1,500,000','2,000,000','2,500,000','3,000,000','4,000,000','5,000,000','10,000,000']
const ocpOccurrenceLimits = ['25,000','50,000','100,000','200,000','300,000','500,000','1,000,000','1,500,000','2,000,000','3,000,000','4,000,000','5,000,000','10,000,000']
const ocpAggLimits = ['1,000,000','1,500,000','2,000,000','2,500,000','3,000,000','4,000,000','5,000,000','10,000,000']
const rrOccurrenceLimits = ['25,000','50,000','100,000','150,000','300,000','500,000','1,000,000','1,500,000','2,000,000']
const legalEntityOpts    = [
  'Association','Corporation','C Corporation','S Corporation','Domestic Profit Corporation',
  'Foreign Corporation','Foreign Limited Liability Company','Foreign Limited Partnership',
  'General Partnership','Governmental Unit','Individual','Joint Venture','Limited Corporation',
  'Limited Liability Company','Limited Liability Partnership','Limited Partnership',
  'Nonprofit Corporation','Partnership','Professional Corporation','Religious Organization',
  'Sole Proprietor','Other',
]

function SectionRule({ color, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-0.5 h-4 rounded-full ${color}`} />
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{children}</span>
    </div>
  )
}

function CollapsibleSection({ title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-card">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-stone-25 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-stone-800">{title}</span>
          {badge != null && badge > 0 && (
            <span className="text-[10px] font-bold bg-ink-100 text-ink-700 px-1.5 py-0.5 rounded-full">{badge} on</span>
          )}
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-stone-400" />
          : <ChevronDown className="h-4 w-4 text-stone-400" />
        }
      </button>
      {open && <div className="px-5 pb-5 border-t border-stone-100">{children}</div>}
    </div>
  )
}

// Stepper — typable number input with +/- buttons for violation/recall counts
function CountStepper({ label, value = 0, onChange, warn }) {
  const v = Number(value) || 0
  return (
    <div>
      <label className="form-label mb-1.5">{label}</label>
      <div className={[
        'flex items-center rounded-lg border overflow-hidden',
        warn && v > 0 ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-stone-50',
      ].join(' ')}>
        <button
          type="button"
          onClick={() => onChange(Math.max(0, v - 1))}
          className="px-3 py-2 text-stone-500 hover:bg-stone-100 transition-colors text-sm font-bold select-none"
        >−</button>
        <input
          type="number"
          min={0}
          value={v}
          onChange={e => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className={`flex-1 text-center text-sm font-mono font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 py-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${warn && v > 0 ? 'text-amber-700' : 'text-stone-800'}`}
        />
        <button
          type="button"
          onClick={() => onChange(v + 1)}
          className="px-3 py-2 text-stone-500 hover:bg-stone-100 transition-colors text-sm font-bold select-none"
        >+</button>
      </div>
      {warn && v > 0 && (
        <p className="flex items-center gap-1 mt-1 text-xs text-amber-600">
          <AlertTriangle className="h-3 w-3 shrink-0" /> Review required
        </p>
      )}
    </div>
  )
}

export default function Step2_RiskCoverage({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  const [newCoverage, setNewCoverage] = useState('')

  const activeFlagCount = [
    'governmentalSubdivision', 'limitedProductWithdrawal', 'sizeOfRiskRating',
    'stopGapCoverage', 'medPayExclusion', 'cyberIncidentLiability',
    'lossOfElectronicData', 'experienceRating', 'scheduleRating',
    'acceptTerrorismCoverage', 'compositeRating', 'limitedCoverageUnmannedAircraft',
    'tripTerminatesEarly', 'ndPesticideApplicator',
  ].filter(k => !!data[k]).length

  const addCoverage = () => {
    if (!newCoverage) return
    const next = [...(data.additionalCoverages || []), { id: Date.now(), name: newCoverage }]
    set('additionalCoverages', next)
    setNewCoverage('')
  }
  const removeCoverage = (id) => {
    set('additionalCoverages', (data.additionalCoverages || []).filter(c => c.id !== id))
  }

  const totalViolations = (data.oshaViolations || 0) + (data.repeatedViolations || 0) + (data.willfulViolations || 0)

  // Subline-driven field visibility
  const sl = data.subline || ''
  const showPremOps  = !sl || sl === 'Premises/Operations and Products/Completed Operations' || sl === 'Premises/Operations'
  const showProdComp = !sl || sl === 'Premises/Operations and Products/Completed Operations' || sl === 'Products/Completed Operations'
  const showLiquor   = sl === 'Liquor'
  const showOCP      = sl === 'Owners and Contractors'
  const showRailroad = sl === 'Railroad'
  const showSpecial  = showLiquor || showOCP || showRailroad
  const showProdCompOnly = sl === 'Products/Completed Operations'

  return (
    <div className="space-y-5">

      {/* ── Risk Profile ── */}
      <Card title="Risk Profile">
        <div className="space-y-4">
          {/* State + Revenue + Commission */}
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="State" required searchable
              options={usStates}
              value={data.state}
              onChange={v => set('state', v)}
            />
            <Input
              label="Estimated Annual Revenue"
              type="number"
              value={data.estimatedAnnualRevenue ?? ''}
              onChange={e => set('estimatedAnnualRevenue', e.target.value === '' ? '' : Number(e.target.value))}
              prefix="$"
              hint="Used for premium calculation"
            />
            <Input
              label="General Liability Commission"
              required
              type="number"
              value={data.commission ?? ''}
              onChange={e => set('commission', e.target.value === '' ? '' : Number(e.target.value))}
              suffix="%"
              placeholder="e.g. 12.5"
              hint="Default: 12.5%"
            />
          </div>

          {/* OSHA Violations */}
          <div>
            <SectionRule color="bg-amber-400">OSHA &amp; Compliance Violations</SectionRule>
            {totalViolations > 0 && (
              <div className="flex items-center gap-1.5 mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {totalViolations} violation{totalViolations > 1 ? 's' : ''} recorded — may affect underwriting.
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <CountStepper label="OSHA Violations"    value={data.oshaViolations}      onChange={v => set('oshaViolations', v)}      warn />
              <CountStepper label="Repeated Violations" value={data.repeatedViolations}  onChange={v => set('repeatedViolations', v)}  warn />
              <CountStepper label="Willful Violations"  value={data.willfulViolations}   onChange={v => set('willfulViolations', v)}   warn />
            </div>
          </div>

          {/* Product Recalls */}
          <div>
            <SectionRule color="bg-crimson-400">Product Recalls</SectionRule>
            <div className="grid grid-cols-2 gap-3">
              <CountStepper label="CSPC Product Recalls" value={data.cspcProductRecalls} onChange={v => set('cspcProductRecalls', v)} warn />
              <CountStepper label="FDA Product Recalls"  value={data.fdaProductRecalls}  onChange={v => set('fdaProductRecalls', v)}  warn />
            </div>
          </div>
        </div>
      </Card>

      {/* ── Policy Limits ── */}
      <Card title="Policy Limits">
        {/* Subline — required, at top */}
        <div className="mb-4">
          <Select
            label="Subline" required
            options={sublineOptions}
            value={data.subline}
            onChange={v => set('subline', v)}
          />
        </div>
        <SectionRule color="bg-ink-400">Liability Limits</SectionRule>
        <div className="grid grid-cols-2 gap-4">
          {/* 1. Each Occurrence / Common Cause Limit — label + options vary by subline */}
          <Select
            label={showLiquor ? 'Each Common Cause Limit *' : 'Each Occurrence Limit *'}
            required searchable
            options={showLiquor ? liquorOccurrenceLimits : showOCP ? ocpOccurrenceLimits : showRailroad ? rrOccurrenceLimits : occurrenceLimits}
            value={data.eachOccurrenceLimit}
            onChange={v => set('eachOccurrenceLimit', v)}
          />

          {/* 2. Medical Payments Exclusion for Entire Policy — Prem/Ops only */}
          {showPremOps && (
            <Select
              label="Medical Payments Exclusion for Entire Policy"
              options={yesNoOpts}
              value={data.medPayExclusionPolicy || 'No'}
              onChange={v => set('medPayExclusionPolicy', v)}
            />
          )}

          {/* 3. Medical Payments Limit — Prem/Ops only */}
          {showPremOps && (
            <Select label="Medical Payments Limit" searchable options={medPayLimits} value={data.medPayLimit} onChange={v => set('medPayLimit', v)} />
          )}

          {/* 4. Personal & Adv Injury — Select, Prem/Ops only */}
          {showPremOps && (
            <Select
              label="Personal &amp; Adv Injury"
              searchable
              options={personalInjuryLimits}
              value={data.personalAdvInjuryLimit}
              onChange={v => set('personalAdvInjuryLimit', v)}
            />
          )}

          {/* 5. General / Aggregate Limit — hidden for Prod/Comp Only and Railroad */}
          {!showProdCompOnly && !showRailroad && (
            <Select
              label={showLiquor || showOCP ? 'Aggregate Limit *' : 'General Aggregate Limit *'}
              required searchable
              options={showLiquor ? liquorAggLimits : showOCP ? ocpAggLimits : aggLimits}
              value={data.generalAggregateLimit}
              onChange={v => set('generalAggregateLimit', v)}
            />
          )}

          {/* 6. Railroad Aggregate — auto-computed read-only */}
          {showRailroad && (
            <div>
              <label className="form-label mb-1.5">Aggregate Limit *</label>
              <div className="px-3 py-2 text-sm font-mono font-semibold text-stone-700 bg-stone-50 border border-stone-200 rounded-lg">
                {(() => {
                  const raw = String(data.eachOccurrenceLimit || '').replace(/[^0-9]/g, '')
                  const num = parseInt(raw, 10)
                  return isNaN(num) ? '—' : (num * 3).toLocaleString('en-US')
                })()}
              </div>
              <p className="text-xs text-stone-400 mt-1">Computed: 3 &times; Each Occurrence</p>
            </div>
          )}

          {/* 7. Products/Comp Ops Aggregate */}
          {showProdComp && (
            <Select label="Products/Comp Ops Aggregate" searchable options={aggLimits} value={data.prodCompOpsAggregateLimit} onChange={v => set('prodCompOpsAggregateLimit', v)} />
          )}

          {/* 8. Damage to Premises Rented — Prem/Ops only */}
          {showPremOps && (
            <Input label="Damage to Premises Rented" value={data.damageToRentedPremisesLimit} onChange={e => set('damageToRentedPremisesLimit', e.target.value)} prefix="$" />
          )}
        </div>

        {/* Coverage Form + Condominium Association side by side */}
        <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-2 gap-4">
          <Select label="Coverage Form" options={coverageForms} value={data.coverageForm} onChange={v => set('coverageForm', v)} />
          {showPremOps && (
            <Select
              label="Condominium Association"
              options={yesNoOpts}
              value={data.condominiumAssociation || 'No'}
              onChange={v => set('condominiumAssociation', v)}
            />
          )}
        </div>
      </Card>

      {/* ── Liquor Liability Details ── */}
      {showLiquor && (
        <Card title="Liquor Liability Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Type of Liquor License" required
                options={liquorLicenseOpts}
                value={data.liquorLicenseType}
                onChange={v => set('liquorLicenseType', v)}
              />
              <Select
                label="Type of Establishment" required
                options={liquorEstabOpts}
                value={data.liquorEstabType}
                onChange={v => set('liquorEstabType', v)}
              />
              <Input
                label="% of Gross Receipts from Alcohol"
                type="number"
                value={data.liquorAlcoholPct ?? ''}
                onChange={e => set('liquorAlcoholPct', e.target.value === '' ? '' : Number(e.target.value))}
                suffix="%"
                placeholder="0–100"
              />
              <Input
                label="Annual Gross Receipts"
                type="number"
                value={data.liquorGrossReceipts ?? ''}
                onChange={e => set('liquorGrossReceipts', e.target.value === '' ? '' : Number(e.target.value))}
                prefix="$"
              />
              <Input
                label="Number of Seats"
                type="number"
                value={data.liquorSeats ?? ''}
                onChange={e => set('liquorSeats', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 120"
              />
            </div>
            <SectionRule color="bg-amber-400">Operating Characteristics</SectionRule>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {[
                ['liquorBYOB',             'BYOB Permitted'],
                ['liquorOpenPastMidnight', 'Open Past Midnight'],
                ['liquorHappyHour',        'Happy Hour Promotions'],
                ['liquorLiveEntertainment','Live Entertainment'],
              ].map(([k, label]) => (
                <div key={k} className="flex items-center justify-between py-1">
                  <span className="text-sm text-stone-700">{label}</span>
                  <Toggle checked={!!data[k]} onChange={v => set(k, v)} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── OCP Project Details ── */}
      {showOCP && (
        <Card title="OCP Project Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Contractor / Subcontractor Name" required
                value={data.ocpContractorName || ''}
                onChange={e => set('ocpContractorName', e.target.value)}
                placeholder="e.g. Acme Construction LLC"
              />
              <Select
                label="Type of Operations" required
                options={ocpOperationsOpts}
                value={data.ocpOperationsType}
                onChange={v => set('ocpOperationsType', v)}
              />
              <Input
                label="Project Location Address"
                value={data.ocpProjectAddress || ''}
                onChange={e => set('ocpProjectAddress', e.target.value)}
                placeholder="Street, City, State"
              />
              <Input
                label="Estimated Total Cost of Operations"
                type="number"
                value={data.ocpEstimatedCost ?? ''}
                onChange={e => set('ocpEstimatedCost', e.target.value === '' ? '' : Number(e.target.value))}
                prefix="$"
              />
              <Input
                label="Project Start Date"
                type="date"
                value={data.ocpStartDate || ''}
                onChange={e => set('ocpStartDate', e.target.value)}
              />
              <Input
                label="Project Completion Date"
                type="date"
                value={data.ocpEndDate || ''}
                onChange={e => set('ocpEndDate', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label mb-1.5">Project Description</label>
              <textarea
                rows={3}
                value={data.ocpProjectDescription || ''}
                onChange={e => set('ocpProjectDescription', e.target.value)}
                placeholder="Describe the scope of work and operations…"
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 bg-stone-50 placeholder-stone-300 resize-none"
              />
            </div>
            <SectionRule color="bg-ink-300">OCP Named Insured Details</SectionRule>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" required value={data.ocpNamedInsuredName || ''} onChange={e => set('ocpNamedInsuredName', e.target.value)} placeholder="Full legal name" />
              <Select label="Legal Entity" options={legalEntityOpts} value={data.ocpNamedInsuredLegalEntity} onChange={v => set('ocpNamedInsuredLegalEntity', v)} />
              <Input label="Address Line 1" required value={data.ocpNamedInsuredAddr1 || ''} onChange={e => set('ocpNamedInsuredAddr1', e.target.value)} placeholder="Street address" />
              <Input label="Address Line 2" value={data.ocpNamedInsuredAddr2 || ''} onChange={e => set('ocpNamedInsuredAddr2', e.target.value)} placeholder="Suite, unit, etc." />
              <Input label="City" required value={data.ocpNamedInsuredCity || ''} onChange={e => set('ocpNamedInsuredCity', e.target.value)} />
              <Select label="State" required searchable options={usStates} value={data.ocpNamedInsuredState} onChange={v => set('ocpNamedInsuredState', v)} />
              <Input label="Zip" required value={data.ocpNamedInsuredZip || ''} onChange={e => set('ocpNamedInsuredZip', e.target.value)} placeholder="00000" />
            </div>
          </div>
        </Card>
      )}

      {/* ── Railroad Project Details ── */}
      {showRailroad && (
        <Card title="Railroad Project Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Railroad Company Name" required
                value={data.rrCompanyName || ''}
                onChange={e => set('rrCompanyName', e.target.value)}
                placeholder="e.g. Union Pacific Railroad"
              />
              <Select
                label="Type of Operations Near Railroad" required
                options={rrOperationsOpts}
                value={data.rrOperationsType}
                onChange={v => set('rrOperationsType', v)}
              />
              <Input
                label="Location of Operations"
                value={data.rrOperationsLocation || ''}
                onChange={e => set('rrOperationsLocation', e.target.value)}
                placeholder="Street / mile marker / description"
              />
              <div>
                <Input
                  label="Distance from Active Rail (ft)"
                  type="number"
                  value={data.rrDistanceFeet ?? ''}
                  onChange={e => set('rrDistanceFeet', e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 75"
                />
                {data.rrDistanceFeet !== '' && data.rrDistanceFeet !== undefined && Number(data.rrDistanceFeet) < 50 && (
                  <p className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                    <AlertTriangle className="h-3 w-3 shrink-0" /> Under 50 ft — additional review required
                  </p>
                )}
              </div>
              <Input
                label="Estimated Duration (months)"
                type="number"
                value={data.rrDurationMonths ?? ''}
                onChange={e => set('rrDurationMonths', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 6"
              />
              <Input
                label="Estimated Cost of Work Near Railroad"
                type="number"
                value={data.rrEstimatedCost ?? ''}
                onChange={e => set('rrEstimatedCost', e.target.value === '' ? '' : Number(e.target.value))}
                prefix="$"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-stone-100 bg-stone-25">
              <div>
                <p className="text-sm font-medium text-stone-800">Any Work Within 50 Feet of Tracks?</p>
                {data.rrWithin50Feet && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="h-3 w-3 shrink-0" /> Flagged for underwriter review
                  </p>
                )}
              </div>
              <Toggle checked={!!data.rrWithin50Feet} onChange={v => set('rrWithin50Feet', v)} />
            </div>
            <SectionRule color="bg-ink-300">Railroad Named Insured Details</SectionRule>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Name" required value={data.rrNamedInsuredName || ''} onChange={e => set('rrNamedInsuredName', e.target.value)} placeholder="Full legal name" />
              <Select label="Legal Entity" options={legalEntityOpts} value={data.rrNamedInsuredLegalEntity} onChange={v => set('rrNamedInsuredLegalEntity', v)} />
              <Input label="Address Line 1" required value={data.rrNamedInsuredAddr1 || ''} onChange={e => set('rrNamedInsuredAddr1', e.target.value)} placeholder="Street address" />
              <Input label="Address Line 2" value={data.rrNamedInsuredAddr2 || ''} onChange={e => set('rrNamedInsuredAddr2', e.target.value)} placeholder="Suite, unit, etc." />
              <Input label="City" required value={data.rrNamedInsuredCity || ''} onChange={e => set('rrNamedInsuredCity', e.target.value)} />
              <Select label="State" required searchable options={usStates} value={data.rrNamedInsuredState} onChange={v => set('rrNamedInsuredState', v)} />
              <Input label="Zip" required value={data.rrNamedInsuredZip || ''} onChange={e => set('rrNamedInsuredZip', e.target.value)} placeholder="00000" />
            </div>
          </div>
        </Card>
      )}

      {/* ── Deductibles ── */}
      <Card title="Deductibles">
        <SectionRule color="bg-amber-400">Deductible Schedule</SectionRule>
        <div className="rounded-lg overflow-hidden border border-stone-100">
          <table className="w-full text-sm">
            <thead className="bg-stone-25">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-stone-400 w-1/3">Coverage</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-stone-400">BI Deductible</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-stone-400">PD Deductible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {showPremOps && (
                <tr>
                  <td className="px-4 py-3 text-xs font-semibold text-stone-600 whitespace-nowrap">Prem/Ops</td>
                  <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.premOpsBI}  onChange={v => set('premOpsBI', v)} /></td>
                  <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.premOpsPD}  onChange={v => set('premOpsPD', v)} /></td>
                </tr>
              )}
              {showProdComp && (
                <tr>
                  <td className="px-4 py-3 text-xs font-semibold text-stone-600 whitespace-nowrap">Prod/Comp Ops</td>
                  <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.prodCompOpsBI} onChange={v => set('prodCompOpsBI', v)} /></td>
                  <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.prodCompOpsPD} onChange={v => set('prodCompOpsPD', v)} /></td>
                </tr>
              )}
              {!showSpecial && (
                <tr>
                  <td className="px-4 py-3 text-xs font-semibold text-stone-600">Combined BI&amp;PD</td>
                  <td className="px-3 py-2" colSpan={2}>
                    <div className="grid grid-cols-2 gap-2">
                      {showPremOps  && <Select searchable options={deductibleOptions} value={data.premOpsBIandPD}     onChange={v => set('premOpsBIandPD', v)} />}
                      {showProdComp && <Select searchable options={deductibleOptions} value={data.prodCompOpsBIandPD} onChange={v => set('prodCompOpsBIandPD', v)} />}
                    </div>
                  </td>
                </tr>
              )}
              {showLiquor && (
                <tr>
                  <td className="px-4 py-3 text-xs font-semibold text-stone-600 whitespace-nowrap">Liquor</td>
                  <td className="px-3 py-2" colSpan={2}>
                    <Select searchable options={deductibleOptions} value={data.liquorDeductible} onChange={v => set('liquorDeductible', v)} />
                  </td>
                </tr>
              )}
              {showOCP && (
                <tr>
                  <td className="px-4 py-3 text-xs font-semibold text-stone-600 whitespace-nowrap">OCP</td>
                  <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.ocpBI} onChange={v => set('ocpBI', v)} /></td>
                  <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.ocpPD} onChange={v => set('ocpPD', v)} /></td>
                </tr>
              )}
              {showRailroad && (
                <tr>
                  <td className="px-4 py-3 text-xs font-semibold text-stone-600 whitespace-nowrap">Railroad</td>
                  <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.railroadBI} onChange={v => set('railroadBI', v)} /></td>
                  <td className="px-3 py-2"><Select searchable options={deductibleOptions} value={data.railroadPD} onChange={v => set('railroadPD', v)} /></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Additional Coverages ── */}
      <Card title="Additional Coverages">
        <div className="space-y-2 mb-3">
          {(data.additionalCoverages || []).length === 0 && (
            <p className="text-xs text-stone-400 italic py-2">No additional coverages added.</p>
          )}
          {(data.additionalCoverages || []).map(c => (
            <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-stone-50 border border-stone-100">
              <span className="flex-1 text-sm text-stone-700">{c.name}</span>
              <button
                type="button"
                onClick={() => removeCoverage(c.id)}
                className="p-1 rounded text-stone-400 hover:text-crimson-500 hover:bg-crimson-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        {/* Add from catalog */}
        <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
          <select
            value={newCoverage}
            onChange={e => setNewCoverage(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 text-stone-700"
          >
            <option value="">Select additional coverage…</option>
            {ADDITIONAL_COVERAGES_CATALOG.filter(name =>
              !(data.additionalCoverages || []).some(c => c.name === name)
            ).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={addCoverage}
            disabled={!newCoverage}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-ink-800 text-white rounded-lg hover:bg-ink-700 disabled:opacity-40 transition-colors shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </Card>

      {/* Loss Control Requirements collapsible removed — Post-Bind Loss Control Override lives at LOB tab level */}

      {/* ── Coverage Flags — collapsible with active badge ── */}
      <CollapsibleSection title="Coverage Options &amp; Flags" badge={activeFlagCount}>
        <div className="pt-4 grid grid-cols-2 gap-x-8 gap-y-3">
          {/* Always-visible flags */}
          {[
            ['stopGapCoverage',        'Stop Gap Coverage'],
            ['medPayExclusion',        'Med Pay Exclusion'],
            ['cyberIncidentLiability', 'Cyber Incident Liability'],
            ['lossOfElectronicData',   'Loss Of Electronic Data'],
            ['experienceRating',       'Experience Rating'],
            ['scheduleRating',         'Schedule Rating'],
            ['acceptTerrorismCoverage','Accept Terrorism Coverage'],
            ['compositeRating',        'Composite Rating'],
            ['tripTerminatesEarly',    'TRIP Terminates Early'],
            ['ndPesticideApplicator',  'ND Pesticide Applicator'],
          ].map(([k, label]) => (
            <div key={k} className="flex items-center justify-between py-1">
              <span className="text-sm text-stone-700">{label}</span>
              <Toggle checked={!!data[k]} onChange={v => set(k, v)} />
            </div>
          ))}

          {/* Prem/Ops only */}
          {showPremOps && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-stone-700">Governmental Subdivision</span>
              <Toggle checked={!!data.governmentalSubdivision} onChange={v => set('governmentalSubdivision', v)} />
            </div>
          )}
          {showPremOps && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-stone-700">Unmanned Aircraft</span>
              <Toggle checked={!!data.limitedCoverageUnmannedAircraft} onChange={v => set('limitedCoverageUnmannedAircraft', v)} />
            </div>
          )}

          {/* Prod/Comp sublines only */}
          {showProdComp && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-stone-700">Limited Product Withdrawal</span>
              <Toggle checked={!!data.limitedProductWithdrawal} onChange={v => set('limitedProductWithdrawal', v)} />
            </div>
          )}

          {/* Non-special sublines only */}
          {!showSpecial && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-stone-700">Size Of Risk Rating</span>
              <Toggle checked={!!data.sizeOfRiskRating} onChange={v => set('sizeOfRiskRating', v)} />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* ── Minimum Premium — collapsible ── */}
      <CollapsibleSection title="Minimum Premium">
        <div className="pt-4 space-y-1">
          {showPremOps && (
            <p className="text-sm text-stone-500 py-1">Premises/Ops Premium To Reach Minimum</p>
          )}
          {showProdComp && (
            <p className="text-sm text-stone-500 py-1">Products/Comp Ops Premium To Reach Minimum</p>
          )}
          {showPremOps && showProdComp && (
            <p className="text-sm text-stone-500 py-1">Special Combined Premium To Reach Minimum</p>
          )}
          {showLiquor && (
            <p className="text-sm text-stone-500 py-1">Liquor Premium To Reach Minimum</p>
          )}
          {showOCP && (
            <p className="text-sm text-stone-500 py-1">Owners and Contractors Premium To Reach Minimum</p>
          )}
          {showRailroad && (
            <p className="text-sm text-stone-500 py-1">Railroad Premium To Reach Minimum</p>
          )}
          <p className="text-sm text-stone-500 py-1">Policy Premium To Reach Minimum</p>
        </div>
      </CollapsibleSection>

      {/* ── Additional Notes — collapsible ── */}
      <CollapsibleSection title="Additional Notes &amp; Documentation">
        <div className="pt-4 space-y-4">
          <div>
            <label className="form-label mb-1.5">Diligent Effort Documentation</label>
            <textarea
              rows={3}
              value={data.diligentEffortDocumentation || ''}
              onChange={e => set('diligentEffortDocumentation', e.target.value)}
              placeholder="Document diligent effort for surplus lines…"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 bg-stone-50 placeholder-stone-300 resize-none"
            />
          </div>
          <div>
            <label className="form-label mb-1.5">Additional Text for Quote</label>
            <textarea
              rows={3}
              value={data.additionalTextForQuote || ''}
              onChange={e => set('additionalTextForQuote', e.target.value)}
              placeholder="Additional text to appear on the quote proposal…"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 bg-stone-50 placeholder-stone-300 resize-none"
            />
          </div>
          <div>
            <label className="form-label mb-1.5">Additional Coverage Detail</label>
            <textarea
              rows={3}
              value={data.additionalCoverageDetail || ''}
              onChange={e => set('additionalCoverageDetail', e.target.value)}
              placeholder="Describe any additional coverage details…"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 bg-stone-50 placeholder-stone-300 resize-none"
            />
          </div>
          <div className="max-w-xs">
            <Input
              label="Additional Policy Fee"
              type="number"
              value={data.additionalPolicyFee ?? ''}
              onChange={e => set('additionalPolicyFee', e.target.value === '' ? '' : Number(e.target.value))}
              prefix="$"
              placeholder="0"
            />
          </div>
        </div>
      </CollapsibleSection>

    </div>
  )
}
