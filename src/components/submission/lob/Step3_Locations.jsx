import { useState, useEffect, useRef } from 'react'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Modal from '../../ui/Modal'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import { useToast } from '../../ui/Toast'
import { deductibleOptions, usStates } from '../../../data/mockData'
import { Plus, X, MoreVertical, MapPin, AlertTriangle, Pencil, Check } from 'lucide-react'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const premiumBasisOpts     = ['Gross Sales', 'Payroll', 'Area (Sq Ft)', 'Units', 'Admissions', 'Other']
const premOpsCoverageOpts  = ['Premises/Operations', 'Premises Only', 'Operations Only']
const prodCompCoverageOpts = ['Products/Completed Operations', 'Products Only', 'Completed Operations Only']
const litigationHazardOpts = ['Low', 'Average', 'High', 'Very High']
const mainOpsOpts          = ['Manufacturing', 'Mercantile', 'Service', 'Contractor', 'Office', 'Warehouse', 'Other']

const sublineOptions = [
  'Premises/Operations and Products/Completed Operations',
  'Premises/Operations',
  'Products/Completed Operations',
  'Liquor',
  'Owners and Contractors',
  'Railroad',
]

const STATE_ABBR_TO_NAME = {
  AL: 'Alabama',       AK: 'Alaska',        AZ: 'Arizona',       AR: 'Arkansas',
  CA: 'California',    CO: 'Colorado',      CT: 'Connecticut',   DE: 'Delaware',
  FL: 'Florida',       GA: 'Georgia',       HI: 'Hawaii',        ID: 'Idaho',
  IL: 'Illinois',      IN: 'Indiana',       IA: 'Iowa',          KS: 'Kansas',
  KY: 'Kentucky',      LA: 'Louisiana',     ME: 'Maine',         MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan',      MN: 'Minnesota',     MS: 'Mississippi',
  MO: 'Missouri',      MT: 'Montana',       NE: 'Nebraska',      NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey',    NM: 'New Mexico',    NY: 'New York',
  NC: 'North Carolina',ND: 'North Dakota',  OH: 'Ohio',          OK: 'Oklahoma',
  OR: 'Oregon',        PA: 'Pennsylvania',  RI: 'Rhode Island',  SC: 'South Carolina',
  SD: 'South Dakota',  TN: 'Tennessee',     TX: 'Texas',         UT: 'Utah',
  VT: 'Vermont',       VA: 'Virginia',      WA: 'Washington',    WV: 'West Virginia',
  WI: 'Wisconsin',     WY: 'Wyoming',       DC: 'Washington DC',
}

const STATE_NAME_TO_ABBR = Object.fromEntries(
  Object.entries(STATE_ABBR_TO_NAME).map(([abbr, name]) => [name, abbr])
)

// Classification-level additional coverages catalog
const CLASS_COVERAGES_CATALOG = [
  'Products/Completed Operations Exclusion',
  'Classification Limitation Endorsement',
  'Specific Trade or Activity Exclusion',
  'Limited Coverage for Designated Products',
  'Exclusion of Specific Products or Operations',
  'Exclusion – Designated Work',
  'Exclusion – Contractors – Professional Liability',
  'Limited Coverage for Designated Unmanned Aircraft',
  'Exclusion – Violation of Law Addressing Data Privacy',
  'Exclusion – Cyber Incident',
  'Exclusion – Access or Disclosure of Confidential Information',
  'Exclusion – War',
]

// ISO GL class code → description lookup
const GL_CLASS_CODES = {
  '10000': 'Vacant Land',
  '10070': 'Apartments',
  '10100': 'Artisans',
  '11127': 'Beauty Parlors & Barber Shops',
  '12361': 'Buildings – Office',
  '15601': 'Carpentry Contractors',
  '16820': 'Dry Cleaning or Laundry Stores',
  '18078': 'Drug Stores',
  '18091': 'Electrical Wiring – Within Buildings',
  '20010': 'Gasoline Dealers',
  '22338': 'Hardware Stores',
  '24126': 'Hotels',
  '26000': 'Janitors',
  '41650': 'Physicians',
  '41667': 'Dentists',
  '44444': 'Restaurants',
  '46202': 'Shopping Centers',
  '47050': 'Sporting Goods Stores',
  '47201': 'Supermarkets',
  '48260': 'Taverns',
  '49003': 'Theaters',
  '51170': 'Clothing Stores',
  '51770': 'Cosmetics Stores',
  '51970': 'Cosmetics Mfg.',
  '52002': 'Manufacturing – Not Classified',
  '56010': 'Office Buildings',
  '57102': 'Warehouse',
  '58161': 'Wholesale Distribution',
  '59223': 'Contractors – General',
  '61217': 'Contractors – Electrical',
  '62003': 'Contractors – Plumbing',
  '63217': 'Contractors – Roofing',
  '64159': 'Contractors – Painting',
  '65145': 'Contractors – Masonry',
  '67513': 'Security Guard Services',
  '91340': 'Mercantile Stores',
  '91577': 'Service Establishments',
  '91746': 'Schools & Colleges',
  '92451': 'Churches',
  '97650': 'Farm Operations',
}

// ---------------------------------------------------------------------------
// Subline helpers
// ---------------------------------------------------------------------------

function sublineFlags(sl) {
  const s = sl || ''
  return {
    showPremOps:  !s || s === 'Premises/Operations and Products/Completed Operations' || s === 'Premises/Operations',
    showProdComp: !s || s === 'Premises/Operations and Products/Completed Operations' || s === 'Products/Completed Operations',
  }
}

// ---------------------------------------------------------------------------
// Blank form factories
// ---------------------------------------------------------------------------

function blankLocForm() {
  return {
    name: '', address: '', address2: '', city: '', zip: '',
    capindexCrimeScore: '', litigationHazard: 'Average', mainOperations: '',
    premOpsBI: 'No Deductible', premOpsPD: 'No Deductible', premOpsBIandPD: 'No Deductible',
    prodCompOpsBI: 'No Deductible', prodCompOpsPD: 'No Deductible', prodCompOpsBIandPD: 'No Deductible',
    premOpsTerritoryCode: '', prodCompOpsTerritoryCode: '',
  }
}

function blankClassForm() {
  return {
    classCode: '', classDescription: '', classificationType: 'Mercantile',
    productCoverageOnly: false, highHazardCode: false,
    premOpsCoverage: 'Premises/Operations',
    premOpsBIDeductible: 'No Deductible', premOpsPDDeductible: 'No Deductible', premOpsBIandPDDeductible: 'No Deductible',
    premOpsPremiumBasis: 'Gross Sales', premOpsIfAnyBasis: false, premOpsExposure: '',
    prodCompOpsCoverage: 'Products/Completed Operations',
    prodCompOpsBIDeductible: 'No Deductible', prodCompOpsPDDeductible: 'No Deductible', prodCompOpsBIandPDDeductible: 'No Deductible',
    prodCompOpsPremiumBasis: 'Gross Sales', prodCompOpsIfAnyBasis: false, prodCompOpsExposure: '',
    additionalCoverages: [],
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function YesNo({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {['Yes', 'No'].map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt === 'Yes')}
          className={[
            'px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors',
            value === (opt === 'Yes')
              ? 'bg-ink-800 text-white border-ink-800'
              : 'bg-white text-stone-600 border-stone-200 hover:border-ink-400',
          ].join(' ')}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function SectionHeading({ children }) {
  return (
    <div className="border-t border-stone-100 pt-5 mt-2">
      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">{children}</p>
    </div>
  )
}

function AutoFillHint({ children }) {
  return (
    <p className="text-xs text-sage-600 mt-1 flex items-center gap-1">
      <Check className="h-3 w-3 shrink-0" />{children}
    </p>
  )
}

// ---------------------------------------------------------------------------
// Action menu (3-dot)
// ---------------------------------------------------------------------------

function ActionMenu({ onEdit, onDelete, onClose }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-2 top-full mt-1 z-30 bg-white border border-stone-200 rounded-lg shadow-elevated py-1 w-44">
      <button type="button" onClick={() => { onEdit(); onClose() }}
        className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50 text-stone-700">
        Edit Location
      </button>
      <div className="my-1 border-t border-stone-100" />
      <button type="button" onClick={() => { onDelete(); onClose() }}
        className="w-full text-left px-3 py-2 text-sm text-crimson-600 hover:bg-crimson-50">
        Delete Location
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Step3_Locations({ data, onChange }) {
  const schedule    = data.stateSchedule || []
  const setSchedule = newSchedule => onChange({ ...data, stateSchedule: newSchedule })
  const toast = useToast()

  const primaryEntry = schedule.find(s => s.isPrimary) || schedule[0]
  const [activeStateId, setActiveStateId] = useState(primaryEntry ? primaryEntry.id : null)
  const [addingState, setAddingState]     = useState(false)
  const [newStateCode, setNewStateCode]   = useState('')
  const [newSubline, setNewSubline]       = useState('')
  const [addStateError, setAddStateError] = useState('')
  const [openMenu, setOpenMenu]           = useState(null)

  // Location modal
  const [locOpen, setLocOpen]           = useState(false)
  const [editingLocId, setEditingLocId] = useState(null)
  const [locForm, setLocForm]           = useState(blankLocForm())
  const setLF = (k, v) => setLocForm(f => ({ ...f, [k]: v }))

  // Classification modal
  const [classOpen, setClassOpen]                   = useState(false)
  const [classTargetStateId, setClassTargetStateId] = useState(null)
  const [classTargetLocId, setClassTargetLocId]     = useState(null)
  const [editingClassId, setEditingClassId]         = useState(null)
  const [classForm, setClassForm]                   = useState(blankClassForm())
  const [classCodeKnown, setClassCodeKnown]         = useState(false)
  const [newClassCoverage, setNewClassCoverage]     = useState('')
  const setCF = (k, v) => setClassForm(f => ({ ...f, [k]: v }))

  // Manage classifications modal
  const [manageOpen, setManageOpen]     = useState(false)
  const [manageStateId, setManageStateId] = useState(null)
  const [manageLocId2, setManageLocId2] = useState(null)

  const openManageModal = (stateId, locId) => {
    setManageStateId(stateId)
    setManageLocId2(locId)
    setManageOpen(true)
  }

  // ---------------------------------------------------------------------------
  const activeEntry  = schedule.find(s => s.id === activeStateId) || null
  const { showPremOps, showProdComp } = sublineFlags(activeEntry?.subline)

  const classTargetState = schedule.find(s => s.id === classTargetStateId)
  const classTargetLoc   = classTargetState
    ? (classTargetState.locations || []).find(l => l.id === classTargetLocId)
    : null
  const existingClasses = classTargetLoc ? (classTargetLoc.classifications || []) : []
  const { showPremOps: clsShowPremOps, showProdComp: clsShowProdComp } = sublineFlags(classTargetState?.subline)

  // ---------------------------------------------------------------------------
  // Autofill handlers
  // ---------------------------------------------------------------------------

  const handleClassCodeChange = code => {
    const desc = GL_CLASS_CODES[code]
    setClassForm(f => ({ ...f, classCode: code, classDescription: desc || f.classDescription }))
    setClassCodeKnown(!!desc)
  }

  // ---------------------------------------------------------------------------
  // State pill handlers
  // ---------------------------------------------------------------------------

  const handleAddState = () => {
    setAddStateError('')
    if (!newStateCode) { setAddStateError('Select a state.'); return }
    if (!newSubline)   { setAddStateError('Select a subline.'); return }
    const abbr = STATE_NAME_TO_ABBR[newStateCode] || newStateCode
    if (schedule.some(s => s.stateCode === abbr)) { setAddStateError('This state is already in the schedule.'); return }
    const newEntry = { id: Date.now(), stateCode: abbr, subline: newSubline, isPrimary: false, locations: [] }
    const updated  = [...schedule, newEntry]
    setSchedule(updated)
    setActiveStateId(newEntry.id)
    setAddingState(false)
    setNewStateCode('')
    setNewSubline('')
  }

  const handleRemoveState = (stateId, e) => {
    e.stopPropagation()
    const updated = schedule.filter(s => s.id !== stateId)
    setSchedule(updated)
    if (activeStateId === stateId) setActiveStateId(updated[0]?.id ?? null)
  }

  // ---------------------------------------------------------------------------
  // Location handlers
  // ---------------------------------------------------------------------------

  const openAddLocation = () => {
    setLocForm(blankLocForm())
    setEditingLocId(null)
    setLocOpen(true)
  }

  const openEditLocation = loc => {
    setLocForm({
      name: loc.name || '', address: loc.address || '', address2: loc.address2 || '',
      city: loc.city || '', zip: loc.zip || '',
      capindexCrimeScore: loc.capindexCrimeScore ?? '', litigationHazard: loc.litigationHazard || 'Average',
      mainOperations: loc.mainOperations || '',
      premOpsBI: loc.premOpsBI || 'No Deductible', premOpsPD: loc.premOpsPD || 'No Deductible',
      premOpsBIandPD: loc.premOpsBIandPD || 'No Deductible',
      prodCompOpsBI: loc.prodCompOpsBI || 'No Deductible', prodCompOpsPD: loc.prodCompOpsPD || 'No Deductible',
      prodCompOpsBIandPD: loc.prodCompOpsBIandPD || 'No Deductible',
      premOpsTerritoryCode: loc.premOpsTerritoryCode || '',
      prodCompOpsTerritoryCode: loc.prodCompOpsTerritoryCode || '',
    })
    setEditingLocId(loc.id)
    setLocOpen(true)
  }

  const saveLocation = () => {
    if (!activeEntry) return
    const updatedSchedule = schedule.map(s => {
      if (s.id !== activeStateId) return s
      const locs = s.locations || []
      if (editingLocId) {
        return { ...s, locations: locs.map(l => l.id === editingLocId ? { ...l, ...locForm, state: s.stateCode } : l) }
      }
      const newLoc = { ...locForm, id: Date.now(), locationNumber: locs.length + 1, state: s.stateCode, premium: 0, classifications: [] }
      return { ...s, locations: [...locs, newLoc] }
    })
    setSchedule(updatedSchedule)
    setLocOpen(false)
  }

  const deleteLocation = (stateId, locId) => {
    setSchedule(schedule.map(s => s.id !== stateId ? s : { ...s, locations: (s.locations || []).filter(l => l.id !== locId) }))
  }

  // ---------------------------------------------------------------------------
  // Classification handlers
  // ---------------------------------------------------------------------------

  const openManageClasses = (stateId, locId, cls = null) => {
    setClassTargetStateId(stateId)
    setClassTargetLocId(locId)
    if (cls) {
      setEditingClassId(cls.id)
      setClassForm({
        classCode: cls.classCode || '', classDescription: cls.classDescription || '',
        classificationType: cls.classificationType || 'Mercantile',
        productCoverageOnly: cls.productCoverageOnly || false,
        highHazardCode: cls.highHazardCode || false,
        premOpsCoverage: cls.premOpsCoverage || 'Premises/Operations',
        premOpsBIDeductible: cls.premOpsBIDeductible || 'No Deductible',
        premOpsPDDeductible: cls.premOpsPDDeductible || 'No Deductible',
        premOpsBIandPDDeductible: cls.premOpsBIandPDDeductible || 'No Deductible',
        premOpsPremiumBasis: cls.premOpsPremiumBasis || 'Gross Sales',
        premOpsIfAnyBasis: cls.premOpsIfAnyBasis || false,
        premOpsExposure: cls.premOpsExposure || '',
        prodCompOpsCoverage: cls.prodCompOpsCoverage || 'Products/Completed Operations',
        prodCompOpsBIDeductible: cls.prodCompOpsBIDeductible || 'No Deductible',
        prodCompOpsPDDeductible: cls.prodCompOpsPDDeductible || 'No Deductible',
        prodCompOpsBIandPDDeductible: cls.prodCompOpsBIandPDDeductible || 'No Deductible',
        prodCompOpsPremiumBasis: cls.prodCompOpsPremiumBasis || 'Gross Sales',
        prodCompOpsIfAnyBasis: cls.prodCompOpsIfAnyBasis || false,
        prodCompOpsExposure: cls.prodCompOpsExposure || '',
        additionalCoverages: cls.additionalCoverages || [],
      })
      setClassCodeKnown(!!GL_CLASS_CODES[cls.classCode])
    } else {
      setEditingClassId(null)
      setClassForm(blankClassForm())
      setClassCodeKnown(false)
    }
    setNewClassCoverage('')
    setClassOpen(true)
  }

  const saveClass = () => {
    const isEdit = !!editingClassId
    const updatedSchedule = schedule.map(s => {
      if (s.id !== classTargetStateId) return s
      return {
        ...s,
        locations: (s.locations || []).map(l => {
          if (l.id !== classTargetLocId) return l
          if (isEdit) {
            return { ...l, classifications: (l.classifications || []).map(c => c.id === editingClassId ? { ...classForm, id: c.id } : c) }
          }
          return { ...l, classifications: [...(l.classifications || []), { ...classForm, id: Date.now() }] }
        }),
      }
    })
    setSchedule(updatedSchedule)
    setEditingClassId(null)
    setClassOpen(false)
    const desc = classForm.classDescription || classForm.classCode || 'Classification'
    toast.success(
      isEdit ? 'Classification updated' : 'Classification added',
      isEdit ? `${desc} has been saved.` : `${desc} has been added to this location.`
    )
  }

  const deleteClass = (stateId, locId, classId) => {
    setSchedule(schedule.map(s => s.id !== stateId ? s : {
      ...s,
      locations: (s.locations || []).map(l => l.id !== locId ? l : {
        ...l, classifications: (l.classifications || []).filter(c => c.id !== classId),
      }),
    }))
  }

  // ---------------------------------------------------------------------------
  const locations      = activeEntry ? (activeEntry.locations || []) : []
  const totalLocations = schedule.reduce((sum, s) => sum + (s.locations || []).length, 0)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex gap-6">
    {/* Main content */}
    <div className="flex-1 min-w-0">
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Main Card                                                           */}
      {/* ------------------------------------------------------------------ */}
      <Card
        title="State Schedule & Locations"
        subtitle={`${schedule.length} state${schedule.length !== 1 ? 's' : ''} · ${totalLocations} location${totalLocations !== 1 ? 's' : ''} total`}
        noPadding
      >
        {/* State pills */}
        <div className="px-5 py-4 border-b border-stone-100 flex flex-wrap items-center gap-2">
          {schedule.map(entry => {
            const isActive = entry.id === activeStateId
            const fullName = STATE_ABBR_TO_NAME[entry.stateCode] || entry.stateCode
            return (
              <button
                key={entry.id} type="button"
                onClick={() => { setActiveStateId(entry.id); setAddingState(false) }}
                className={[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                  isActive ? 'bg-ink-800 text-white border-ink-800' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300',
                ].join(' ')}
              >
                {entry.isPrimary && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/70' : 'bg-ink-500'}`} />}
                {entry.stateCode}
                {entry.isPrimary && <span className={`text-xs ${isActive ? 'text-white/70' : 'text-stone-400'}`}>Primary</span>}
                {!entry.isPrimary && (
                  <span
                    role="button" tabIndex={0}
                    onClick={e => handleRemoveState(entry.id, e)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRemoveState(entry.id, e) }}
                    className={['ml-0.5 rounded-full p-0.5 transition-colors', isActive ? 'hover:bg-white/20' : 'hover:bg-stone-100'].join(' ')}
                    aria-label={`Remove ${fullName}`}
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>
            )
          })}

          {!addingState ? (
            <button
              type="button" onClick={() => setAddingState(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-stone-300 text-stone-500 hover:border-ink-400 hover:text-ink-600 transition-colors bg-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add State
            </button>
          ) : (
            <div className="flex flex-wrap items-end gap-2 mt-1 w-full">
              <div className="w-48">
                <Select label="State" searchable options={usStates} value={newStateCode} onChange={v => setNewStateCode(v)} placeholder="Select state..." />
              </div>
              <div className="w-72">
                <Select label="Subline" options={sublineOptions} value={newSubline} onChange={v => setNewSubline(v)} placeholder="Select subline..." />
              </div>
              <Button variant="secondary" size="sm" onClick={handleAddState}>Add</Button>
              <button type="button"
                onClick={() => { setAddingState(false); setNewStateCode(''); setNewSubline(''); setAddStateError('') }}
                aria-label="Cancel adding state"
                className="p-1.5 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              {addStateError && <p className="w-full text-xs text-crimson-600 mt-0.5">{addStateError}</p>}
            </div>
          )}
        </div>

        {/* Active state + location table */}
        {activeEntry ? (
          <div>
            <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-800">{STATE_ABBR_TO_NAME[activeEntry.stateCode] || activeEntry.stateCode}</p>
                <p className="text-xs text-stone-400 mt-0.5">{activeEntry.subline}</p>
              </div>
              <Button variant="secondary" size="xs" icon={Plus} onClick={openAddLocation}>Add Location</Button>
            </div>

            {locations.length === 0 ? (
              <div className="py-12 text-center">
                <MapPin className="h-10 w-10 text-stone-200 mx-auto mb-2" />
                <p className="text-sm text-stone-400 mb-3">No locations for {activeEntry.stateCode} yet</p>
                <Button variant="secondary" size="sm" icon={Plus} onClick={openAddLocation}>Add First Location</Button>
              </div>
            ) : (
              /* No overflow-hidden — allows 3-dot dropdown to render above rows */
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-25 border-b border-stone-100">
                      <th className="px-2 py-2.5 text-left text-xs font-semibold text-stone-500 w-10">#</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-stone-500">Name</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-stone-500">Address</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-stone-500">City</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-stone-500">State</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-stone-500">Classifications</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-stone-500">Premium</th>
                      <th className="px-3 py-2.5 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {locations.map(loc => {
                      const classCount = (loc.classifications || []).length

                      return (
                        <tr key={loc.id} className="hover:bg-stone-25">
                          {/* Location # */}
                          <td className="px-2 py-3">
                            <span className="w-6 h-6 rounded-full bg-ink-800 text-white text-xs font-bold flex items-center justify-center">
                              {loc.locationNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-stone-800">{loc.name || <span className="text-stone-400">—</span>}</td>
                          <td className="px-4 py-3 text-stone-600">{loc.address || <span className="text-stone-400">—</span>}</td>
                          <td className="px-4 py-3 text-stone-600">{loc.city || <span className="text-stone-400">—</span>}</td>
                          <td className="px-4 py-3 text-stone-600">{loc.state}</td>
                          {/* Classifications cell — single CTA */}
                          <td className="px-4 py-3">
                            {classCount === 0 ? (
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); openManageClasses(activeStateId, loc.id) }}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-dashed border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-100 hover:border-amber-400 transition-colors"
                              >
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Add Classification
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); openManageModal(activeStateId, loc.id) }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-sage-700 bg-sage-50 border border-sage-200 rounded-full px-2.5 py-1 hover:bg-sage-100 transition-colors"
                              >
                                <Check className="h-3 w-3 shrink-0" />
                                {classCount} class{classCount !== 1 ? 'es' : ''}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-stone-800">
                            {loc.premium ? `$${loc.premium.toFixed(2)}` : '—'}
                          </td>
                          {/* 3-dot actions */}
                          <td className="px-3 py-3 relative">
                            <button
                              type="button"
                              onClick={() => setOpenMenu(
                                openMenu && openMenu.locId === loc.id && openMenu.stateId === activeStateId
                                  ? null
                                  : { locId: loc.id, stateId: activeStateId }
                              )}
                              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {openMenu && openMenu.locId === loc.id && openMenu.stateId === activeStateId && (
                              <ActionMenu
                                onEdit={() => openEditLocation(loc)}
                                onDelete={() => deleteLocation(activeStateId, loc.id)}
                                onClose={() => setOpenMenu(null)}
                              />
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-stone-400">No states in schedule. Add a state to begin.</p>
          </div>
        )}
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Location Modal                                                      */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        open={locOpen}
        onClose={() => setLocOpen(false)}
        title={editingLocId ? 'Edit Location' : 'Add Location'}
        subtitle={activeEntry ? `${STATE_ABBR_TO_NAME[activeEntry.stateCode] || activeEntry.stateCode} — state is auto-set` : ''}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLocOpen(false)}>Cancel</Button>
            <Button variant="cta" onClick={saveLocation}>Save Location</Button>
          </>
        }
      >
        {/* ── Location Details ── */}
        <div className="space-y-4">
          {/* Location Number (read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Location Number</label>
              <div className="px-3 py-2 text-sm font-mono font-semibold text-stone-700 bg-stone-50 border border-stone-200 rounded-lg">
                {editingLocId
                  ? (activeEntry?.locations || []).find(l => l.id === editingLocId)?.locationNumber ?? '—'
                  : ((activeEntry?.locations || []).length + 1)}
              </div>
            </div>
            <Input
              label="Name"
              value={locForm.name}
              onChange={e => setLF('name', e.target.value)}
              placeholder="e.g. Main Office"
            />
          </div>

          <SectionHeading>Address</SectionHeading>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Address Line 1" required value={locForm.address} onChange={e => setLF('address', e.target.value)} placeholder="e.g. 123 Main St" />
            <Input label="Address Line 2" value={locForm.address2} onChange={e => setLF('address2', e.target.value)} placeholder="Suite, Floor, etc." />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* City — shows auto-fill badge when filled from ZIP */}
            <div>
              <Input
                label="City" required
                value={locForm.city}
                onChange={e => setLF('city', e.target.value)}
              />
            </div>
          </div>
          {/* State — auto-set from schedule, full width */}
          <div>
            <label className="form-label">State</label>
            <div className="px-3 py-2 text-sm font-semibold text-stone-700 bg-stone-50 border border-stone-200 rounded-lg">
              {activeEntry ? `${STATE_ABBR_TO_NAME[activeEntry.stateCode] || activeEntry.stateCode}${activeEntry.subline ? ` - ${activeEntry.subline}` : ''}` : '—'}
            </div>
          </div>
        </div>

        {/* ── Risk Profile ── */}
        <SectionHeading>Risk Profile</SectionHeading>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Capindex Crime Score" type="number"
            value={locForm.capindexCrimeScore}
            onChange={e => setLF('capindexCrimeScore', e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 5"
          />
          <Select label="Litigation Hazard" options={litigationHazardOpts} value={locForm.litigationHazard} onChange={v => setLF('litigationHazard', v)} />
          <Select label="Main Operations at This Location" options={mainOpsOpts} value={locForm.mainOperations} onChange={v => setLF('mainOperations', v)} />
        </div>

        {/* ── Deductibles ── */}
        {(showPremOps || showProdComp) && (
          <>
            <SectionHeading>DC-{activeEntry?.subline || 'Deductibles'}</SectionHeading>
            {showPremOps && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Premises/Operations</p>
                <div className="grid grid-cols-3 gap-4">
                  <Select label="BI Deductible"      searchable options={deductibleOptions} value={locForm.premOpsBI}      onChange={v => setLF('premOpsBI', v)} />
                  <Select label="PD Deductible"      searchable options={deductibleOptions} value={locForm.premOpsPD}      onChange={v => setLF('premOpsPD', v)} />
                  <Select label="BI and PD Deductible" searchable options={deductibleOptions} value={locForm.premOpsBIandPD} onChange={v => setLF('premOpsBIandPD', v)} />
                </div>
              </div>
            )}
            {showProdComp && (
              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Products/Completed Operations</p>
                <div className="grid grid-cols-3 gap-4">
                  <Select label="BI Deductible"      searchable options={deductibleOptions} value={locForm.prodCompOpsBI}      onChange={v => setLF('prodCompOpsBI', v)} />
                  <Select label="PD Deductible"      searchable options={deductibleOptions} value={locForm.prodCompOpsPD}      onChange={v => setLF('prodCompOpsPD', v)} />
                  <Select label="BI and PD Deductible" searchable options={deductibleOptions} value={locForm.prodCompOpsBIandPD} onChange={v => setLF('prodCompOpsBIandPD', v)} />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Territory ── */}
        {(showPremOps || showProdComp) && (
          <>
            <SectionHeading>Territory</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              {showPremOps  && <Input label="Premises/Operations Code"          value={locForm.premOpsTerritoryCode}     onChange={e => setLF('premOpsTerritoryCode', e.target.value)}     placeholder="e.g. 001" />}
              {showProdComp && <Input label="Products/Completed Operations Code" value={locForm.prodCompOpsTerritoryCode} onChange={e => setLF('prodCompOpsTerritoryCode', e.target.value)} placeholder="e.g. 999" />}
            </div>
          </>
        )}
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* Classification Modal                                                */}
      {/* ------------------------------------------------------------------ */}
      <Modal
        open={classOpen}
        onClose={() => { setClassOpen(false); setEditingClassId(null) }}
        title={editingClassId ? 'Edit Classification' : 'Manage Classifications'}
        subtitle={classTargetLoc ? `Location ${classTargetLoc.locationNumber}: ${classTargetLoc.name || classTargetLoc.address || '—'}` : ''}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setClassOpen(false); setEditingClassId(null) }}>Cancel</Button>
            <Button variant="cta" onClick={saveClass} disabled={!classForm.classCode}>
              {editingClassId ? 'Save Changes' : 'Add Classification'}
            </Button>
          </>
        }
      >
        {/* Existing classifications list (add mode only) */}
        {!editingClassId && existingClasses.length > 0 && (
          <>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
              Existing Classifications ({existingClasses.length})
            </p>
            <div className="space-y-2 mb-6">
              {existingClasses.map(cls => (
                <div key={cls.id} className="flex items-center justify-between bg-stone-50 rounded-xl border border-stone-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs bg-ink-50 text-ink-700 px-2 py-1 rounded font-bold">{cls.classCode}</span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{cls.classDescription || cls.classCode}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {cls.classificationType} · {cls.premOpsPremiumBasis || cls.prodCompOpsPremiumBasis || '—'}{(cls.premOpsExposure || cls.prodCompOpsExposure) ? ` · Exp: ${cls.premOpsExposure || cls.prodCompOpsExposure}` : ''}
                      </p>
                    </div>
                  </div>
                  <button type="button"
                    onClick={() => deleteClass(classTargetStateId, classTargetLocId, cls.id)}
                    aria-label="Delete classification"
                    className="p-1.5 text-stone-400 hover:text-crimson-600 hover:bg-crimson-50 rounded transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-1" />
          </>
        )}

        {/* ── Classification form ── */}
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 mt-2">
          {editingClassId ? 'Edit Details' : existingClasses.length > 0 ? 'Add New Classification' : 'Classification Details'}
        </p>

        {/* Row 1: Class # + Code */}
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '80px 1fr' }}>
          <div>
            <label className="form-label">Class #</label>
            <div className="px-2 py-2 text-sm font-mono font-bold text-ink-700 bg-ink-50 border border-ink-200 rounded-lg text-center">
              {editingClassId
                ? ((existingClasses.findIndex(c => c.id === editingClassId) + 1) || '—')
                : (existingClasses.length + 1)}
            </div>
          </div>
          <div>
            <Select
              label="Class Code"
              required
              searchable
              options={Object.entries(GL_CLASS_CODES).map(([code, desc]) => ({
                value: code,
                label: `${code} - ${desc}`,
              }))}
              value={classForm.classCode}
              onChange={handleClassCodeChange}
              placeholder="Search by code or description..."
            />
            {classCodeKnown && <AutoFillHint>Known ISO GL code</AutoFillHint>}
          </div>
        </div>

        {/* Row 2: Flags strip */}
        <div className="grid grid-cols-2 gap-4 mb-5 bg-stone-50 rounded-xl p-3.5 border border-stone-100">
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Product Coverage Only</p>
            <YesNo value={classForm.productCoverageOnly} onChange={v => setCF('productCoverageOnly', v)} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">High Hazard Code?</p>
            <YesNo value={classForm.highHazardCode} onChange={v => setCF('highHazardCode', v)} />
          </div>
        </div>

        {/* ── Subline premium panels (side-by-side when both apply) ── */}
        {(clsShowPremOps || clsShowProdComp) && (
          <div className={`grid gap-4 ${clsShowPremOps && clsShowProdComp ? 'grid-cols-2' : 'grid-cols-1'}`}>

            {/* Premises/Operations panel */}
            {clsShowPremOps && (
              <div className="rounded-xl border border-ink-100 bg-ink-25 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-3.5 rounded-full bg-ink-500 shrink-0" />
                  <p className="text-xs font-bold text-ink-700 uppercase tracking-widest">Premises/Operations</p>
                </div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 pl-3">Premium</p>
                <div className="space-y-3">
                  <Select label="Coverage" required options={premOpsCoverageOpts} value={classForm.premOpsCoverage} onChange={v => setCF('premOpsCoverage', v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="BI Deductible"  searchable options={deductibleOptions} value={classForm.premOpsBIDeductible} onChange={v => setCF('premOpsBIDeductible', v)} />
                    <Select label="PD Deductible"  searchable options={deductibleOptions} value={classForm.premOpsPDDeductible} onChange={v => setCF('premOpsPDDeductible', v)} />
                  </div>
                  <Select label="BI and PD Deductible" searchable options={deductibleOptions} value={classForm.premOpsBIandPDDeductible} onChange={v => setCF('premOpsBIandPDDeductible', v)} />
                  <Select label="Premium Basis" options={premiumBasisOpts} value={classForm.premOpsPremiumBasis} onChange={v => setCF('premOpsPremiumBasis', v)} />
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">'If Any' Basis</p>
                      <YesNo value={classForm.premOpsIfAnyBasis} onChange={v => setCF('premOpsIfAnyBasis', v)} />
                    </div>
                    <Input label="Exposure" required value={classForm.premOpsExposure} onChange={e => setCF('premOpsExposure', e.target.value)} placeholder="e.g. 1,500,000.00" />
                  </div>
                </div>
              </div>
            )}

            {/* Products/Completed Operations panel */}
            {clsShowProdComp && (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-3.5 rounded-full bg-stone-400 shrink-0" />
                  <p className="text-xs font-bold text-stone-600 uppercase tracking-widest">Products/Completed Ops</p>
                </div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 pl-3">Premium</p>
                <div className="space-y-3">
                  <Select label="Coverage" required options={prodCompCoverageOpts} value={classForm.prodCompOpsCoverage} onChange={v => setCF('prodCompOpsCoverage', v)} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="BI Deductible"  searchable options={deductibleOptions} value={classForm.prodCompOpsBIDeductible} onChange={v => setCF('prodCompOpsBIDeductible', v)} />
                    <Select label="PD Deductible"  searchable options={deductibleOptions} value={classForm.prodCompOpsPDDeductible} onChange={v => setCF('prodCompOpsPDDeductible', v)} />
                  </div>
                  <Select label="BI and PD Deductible" searchable options={deductibleOptions} value={classForm.prodCompOpsBIandPDDeductible} onChange={v => setCF('prodCompOpsBIandPDDeductible', v)} />
                  <Select label="Premium Basis" options={premiumBasisOpts} value={classForm.prodCompOpsPremiumBasis} onChange={v => setCF('prodCompOpsPremiumBasis', v)} />
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">'If Any' Basis</p>
                      <YesNo value={classForm.prodCompOpsIfAnyBasis} onChange={v => setCF('prodCompOpsIfAnyBasis', v)} />
                    </div>
                    <Input label="Exposure" required value={classForm.prodCompOpsExposure} onChange={e => setCF('prodCompOpsExposure', e.target.value)} placeholder="e.g. 1,500,000.00" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Additional Coverages ── */}
        <SectionHeading>Additional Coverages</SectionHeading>
        {(classForm.additionalCoverages || []).length === 0 ? (
          <p className="text-xs text-stone-400 italic py-2 mb-3">No additional coverages added.</p>
        ) : (
          <div className="space-y-1.5 mb-3">
            {(classForm.additionalCoverages || []).map((cov, idx) => (
              <div key={idx} className="flex items-center justify-between bg-stone-50 border border-stone-100 rounded-lg px-3 py-2.5">
                <span className="text-sm text-stone-700">{cov}</span>
                <button
                  type="button"
                  onClick={() => setCF('additionalCoverages', classForm.additionalCoverages.filter((_, i) => i !== idx))}
                  aria-label="Remove coverage"
                  className="p-1 text-stone-300 hover:text-crimson-600 hover:bg-crimson-50 rounded transition-colors ml-3"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
          <select
            value={newClassCoverage}
            onChange={e => setNewClassCoverage(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 text-stone-700"
          >
            <option value="">Select additional coverage…</option>
            {CLASS_COVERAGES_CATALOG.filter(name => !(classForm.additionalCoverages || []).includes(name)).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={!newClassCoverage}
            onClick={() => {
              if (!newClassCoverage) return
              setCF('additionalCoverages', [...(classForm.additionalCoverages || []), newClassCoverage])
              setNewClassCoverage('')
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-ink-800 text-white rounded-lg hover:bg-ink-700 disabled:opacity-40 transition-colors shrink-0"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </Modal>

      {/* ── Manage Classifications modal ── */}
      {manageOpen && (() => {
        const mState = schedule.find(s => s.id === manageStateId)
        const mLoc = mState?.locations?.find(l => l.id === manageLocId2)
        const mClasses = mLoc?.classifications || []
        return (
          <Modal
            open={manageOpen}
            onClose={() => setManageOpen(false)}
            title={`Classifications — ${mLoc?.name || 'Location'}`}
            subtitle={`${mState?.stateCode || ''} · ${mClasses.length} classification${mClasses.length !== 1 ? 's' : ''}`}
            size="md"
            footer={
              <>
                <Button variant="secondary" onClick={() => setManageOpen(false)}>Close</Button>
                <Button variant="cta" icon={Plus} onClick={() => { setManageOpen(false); openManageClasses(manageStateId, manageLocId2) }}>
                  Add Classification
                </Button>
              </>
            }
          >
            {mClasses.length === 0 ? (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-lg px-4 py-4">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">No classifications added</p>
                  <p className="text-xs text-amber-600 mt-0.5">At least one classification with an exposure amount is required before this location can be rated.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {mClasses.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between bg-stone-50 rounded-lg border border-stone-100 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs bg-ink-50 text-ink-700 px-2 py-1 rounded-md font-bold shrink-0">
                        {cls.classCode}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate">{cls.classDescription || '—'}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {cls.classificationType} · {cls.premOpsPremiumBasis || cls.prodCompOpsPremiumBasis || '—'}{(cls.premOpsExposure || cls.prodCompOpsExposure) ? ` · Exp: ${cls.premOpsExposure || cls.prodCompOpsExposure}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4 shrink-0">
                      <button
                        type="button"
                        title="Edit classification"
                        onClick={() => { setManageOpen(false); openManageClasses(manageStateId, manageLocId2, cls) }}
                        className="p-1.5 text-stone-300 hover:text-ink-600 hover:bg-stone-100 rounded transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete classification"
                        aria-label="Delete classification"
                        onClick={() => deleteClass(manageStateId, manageLocId2, cls.id)}
                        className="p-1.5 text-stone-300 hover:text-crimson-600 hover:bg-crimson-50 rounded transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal>
        )
      })()}
    </>
    </div>

    {/* Progress sidebar */}
    <div className="w-56 shrink-0 hidden lg:block">
      <div className="sticky top-20 rounded-xl border border-stone-200 bg-white overflow-hidden shadow-card">
        <div className="px-4 py-3 border-b border-stone-100">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Section Progress</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">States</span>
            <span className="font-mono text-sm font-bold text-ink-800">{schedule.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Locations</span>
            <span className="font-mono text-sm font-bold text-ink-800">{totalLocations}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">Classifications</span>
            <span className="font-mono text-sm font-bold text-ink-800">
              {schedule.reduce((sum, s) => sum + (s.locations || []).reduce((ls, l) => ls + (l.classifications || []).length, 0), 0)}
            </span>
          </div>
          <div className="border-t border-stone-100 pt-3 space-y-2">
            {schedule.map(entry => {
              const locs = entry.locations || []
              const clsCount = locs.reduce((s, l) => s + (l.classifications || []).length, 0)
              const allHaveClass = locs.length > 0 && locs.every(l => (l.classifications || []).length > 0)
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setActiveStateId(entry.id)}
                  className={[
                    'w-full text-left px-3 py-2 rounded-lg text-xs transition-colors',
                    entry.id === activeStateId ? 'bg-ink-50 border border-ink-200' : 'hover:bg-stone-50',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-800">{entry.stateCode}</span>
                    {allHaveClass ? (
                      <Check className="h-3.5 w-3.5 text-sage-500" />
                    ) : locs.length === 0 ? (
                      <span className="w-2 h-2 rounded-full bg-stone-300" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    )}
                  </div>
                  <span className="text-stone-400">{locs.length} loc · {clsCount} cls</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
