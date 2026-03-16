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

      {/* ── General Liability Loss Control Requirements ── */}
      <Card title="General Liability Loss Control Requirements">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Post-Bind Loss Control Override"
            options={lossControlOpts}
            value={data.postBindLossControlOverride}
            onChange={v => set('postBindLossControlOverride', v)}
          />
          <Select
            label="Subline" required
            options={sublineOptions}
            value={data.subline}
            onChange={v => set('subline', v)}
          />
          {showPremOps && (
            <Select
              label="Governmental Subdivision" required
              options={yesNoOpts}
              value={data.governmentalSubdivision ? 'Yes' : 'No'}
              onChange={v => set('governmentalSubdivision', v === 'Yes')}
            />
          )}
          {showProdComp && (
            <Select
              label="Limited Product Withdrawal Coverage" required
              options={yesNoOpts}
              value={data.limitedProductWithdrawal ? 'Yes' : 'No'}
              onChange={v => set('limitedProductWithdrawal', v === 'Yes')}
            />
          )}
          {!showSpecial && (
            <Select
              label="Size Of Risk Rating" required
              options={yesNoOpts}
              value={data.sizeOfRiskRating ? 'Yes' : 'No'}
              onChange={v => set('sizeOfRiskRating', v === 'Yes')}
            />
          )}
          <Select
            label={showLiquor ? 'Each Common Cause Limit *' : 'Each Occurrence Limit *'}
            required searchable
            options={showLiquor ? liquorOccurrenceLimits : showOCP ? ocpOccurrenceLimits : showRailroad ? rrOccurrenceLimits : occurrenceLimits}
            value={data.eachOccurrenceLimit}
            onChange={v => set('eachOccurrenceLimit', v)}
          />
          {showPremOps && (
            <Select
              label="Medical Payments Exclusion for Entire Policy"
              options={yesNoOpts}
              value={data.medPayExclusionPolicy || 'No'}
              onChange={v => set('medPayExclusionPolicy', v)}
            />
          )}
          {showPremOps && (
            <Select label="Medical Payments Limit" searchable options={medPayLimits} value={data.medPayLimit} onChange={v => set('medPayLimit', v)} />
          )}
          {showPremOps && (
            <Select
              label="Personal and Advertising Injury Limit"
              searchable
              options={personalInjuryLimits}
              value={data.personalAdvInjuryLimit}
              onChange={v => set('personalAdvInjuryLimit', v)}
            />
          )}
          {!showProdCompOnly && !showRailroad && (
            <Select
              label={showLiquor || showOCP ? 'Aggregate Limit *' : 'General Aggregate Limit *'}
              required searchable
              options={showLiquor ? liquorAggLimits : showOCP ? ocpAggLimits : aggLimits}
              value={data.generalAggregateLimit}
              onChange={v => set('generalAggregateLimit', v)}
            />
          )}
          {showRailroad && (
            <div className="col-span-1">
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
          {showProdComp && (
            <Select label="Products/Completed Operations Aggregate Limit" searchable options={aggLimits} value={data.prodCompOpsAggregateLimit} onChange={v => set('prodCompOpsAggregateLimit', v)} />
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
        <div className="grid grid-cols-2 gap-4">
          {showPremOps && <Select label="Premises/Operations BI Deductible" searchable options={deductibleOptions} value={data.premOpsBI} onChange={v => set('premOpsBI', v)} />}
          {showProdComp && <Select label="Products/Completed Operations BI Deductible" searchable options={deductibleOptions} value={data.prodCompOpsBI} onChange={v => set('prodCompOpsBI', v)} />}
          {showPremOps && <Select label="Premises/Operations PD Deductible" searchable options={deductibleOptions} value={data.premOpsPD} onChange={v => set('premOpsPD', v)} />}
          {showProdComp && <Select label="Products/Completed Operations PD Deductible" searchable options={deductibleOptions} value={data.prodCompOpsPD} onChange={v => set('prodCompOpsPD', v)} />}
          {showPremOps && <Select label="Premises/Operations BI and PD Deductible" searchable options={deductibleOptions} value={data.premOpsBIandPD} onChange={v => set('premOpsBIandPD', v)} />}
          {showProdComp && <Select label="Products/Completed Operations BI and PD Deductible" searchable options={deductibleOptions} value={data.prodCompOpsBIandPD} onChange={v => set('prodCompOpsBIandPD', v)} />}
          {showLiquor && <Select label="Liquor Deductible" searchable options={deductibleOptions} value={data.liquorDeductible} onChange={v => set('liquorDeductible', v)} />}
          {showOCP && <Select label="OCP BI Deductible" searchable options={deductibleOptions} value={data.ocpBI} onChange={v => set('ocpBI', v)} />}
          {showOCP && <Select label="OCP PD Deductible" searchable options={deductibleOptions} value={data.ocpPD} onChange={v => set('ocpPD', v)} />}
          {showRailroad && <Select label="Railroad BI Deductible" searchable options={deductibleOptions} value={data.railroadBI} onChange={v => set('railroadBI', v)} />}
          {showRailroad && <Select label="Railroad PD Deductible" searchable options={deductibleOptions} value={data.railroadPD} onChange={v => set('railroadPD', v)} />}
          <Select label="Coverage Form" options={coverageForms} value={data.coverageForm} onChange={v => set('coverageForm', v)} />
          <Select label="Legal Entity" options={legalEntityOpts} value={data.legalEntity} onChange={v => set('legalEntity', v)} />
          <Select
            label="Limited Coverage For Designated Unmanned Aircraft"
            options={yesNoOpts}
            value={data.limitedCoverageUnmannedAircraft ? 'Yes' : 'No'}
            onChange={v => set('limitedCoverageUnmannedAircraft', v === 'Yes')}
          />
        </div>
      </Card>

      {/* ── Experience Rating and Schedule Rating ── */}
      <Card title="Experience Rating and Schedule Rating">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Experience Rating"
            options={yesNoOpts}
            value={data.experienceRating ? 'Yes' : 'No'}
            onChange={v => set('experienceRating', v === 'Yes')}
          />
          <Select
            label="Schedule Rating"
            options={yesNoOpts}
            value={data.scheduleRating ? 'Yes' : 'No'}
            onChange={v => set('scheduleRating', v === 'Yes')}
          />
          <div className="col-span-2">
            <Select
              label="Terrorism Risk Insurance Program (TRIP) terminates before policy expiration date"
              options={yesNoOpts}
              value={data.tripTerminatesEarly ? 'Yes' : 'No'}
              onChange={v => set('tripTerminatesEarly', v === 'Yes')}
            />
          </div>
          <Select
            label="Accept Certified Acts of Terrorism Coverage"
            options={yesNoOpts}
            value={data.acceptTerrorismCoverage ? 'Yes' : 'No'}
            onChange={v => set('acceptTerrorismCoverage', v === 'Yes')}
          />
          <Select
            label="Composite Rating Applies"
            options={yesNoOpts}
            value={data.compositeRating ? 'Yes' : 'No'}
            onChange={v => set('compositeRating', v === 'Yes')}
          />
        </div>
      </Card>

      {/* ── Additional Coverages ── */}
      <Card title="Additional Coverages">
        <div className="flex items-center gap-2 mb-2">
          <select
            value={newCoverage}
            onChange={e => setNewCoverage(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 text-stone-700"
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
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-ink-800 text-white rounded-lg hover:bg-ink-700 disabled:opacity-40 transition-colors shrink-0"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        {(data.additionalCoverages || []).length > 0 && (
          <div className="space-y-1">
            {(data.additionalCoverages || []).map(c => (
              <div key={c.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-stone-50 border border-stone-100">
                <span className="flex-1 text-xs text-stone-700">{c.name}</span>
                <button
                  type="button"
                  onClick={() => removeCoverage(c.id)}
                  className="p-0.5 rounded text-stone-400 hover:text-crimson-500 hover:bg-crimson-50 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
