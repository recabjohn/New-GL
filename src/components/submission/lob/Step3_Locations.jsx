import { useState, useEffect, useRef } from 'react'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Modal from '../../ui/Modal'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import { deductibleOptions, usStates } from '../../../data/mockData'
import { Plus, X, MoreVertical, MapPin, AlertTriangle, Pencil, Check } from 'lucide-react'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const premiumBasisOpts     = ['Gross Sales', 'Payroll', 'Area (Sq Ft)', 'Units', 'Admissions', 'Other']
const classTypeOpts        = ['Mercantile', 'Service', 'Contractor', 'Manufacturing', 'Other']
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

// ZIP code lookup (representative US ZIPs)
const ZIP_DB = {
  '60601': { city: 'Chicago',        state: 'IL' }, '60609': { city: 'Chicago',        state: 'IL' },
  '60714': { city: 'Niles',          state: 'IL' }, '10001': { city: 'New York',       state: 'NY' },
  '10036': { city: 'New York',       state: 'NY' }, '11201': { city: 'Brooklyn',       state: 'NY' },
  '90001': { city: 'Los Angeles',    state: 'CA' }, '90210': { city: 'Beverly Hills',  state: 'CA' },
  '94102': { city: 'San Francisco',  state: 'CA' }, '95101': { city: 'San Jose',       state: 'CA' },
  '92101': { city: 'San Diego',      state: 'CA' }, '77001': { city: 'Houston',        state: 'TX' },
  '75201': { city: 'Dallas',         state: 'TX' }, '78201': { city: 'San Antonio',    state: 'TX' },
  '78701': { city: 'Austin',         state: 'TX' }, '79901': { city: 'El Paso',        state: 'TX' },
  '85001': { city: 'Phoenix',        state: 'AZ' }, '85701': { city: 'Tucson',         state: 'AZ' },
  '85281': { city: 'Tempe',          state: 'AZ' }, '19101': { city: 'Philadelphia',   state: 'PA' },
  '15201': { city: 'Pittsburgh',     state: 'PA' }, '30301': { city: 'Atlanta',        state: 'GA' },
  '28201': { city: 'Charlotte',      state: 'NC' }, '27601': { city: 'Raleigh',        state: 'NC' },
  '80201': { city: 'Denver',         state: 'CO' }, '80014': { city: 'Aurora',         state: 'CO' },
  '32801': { city: 'Orlando',        state: 'FL' }, '33101': { city: 'Miami',          state: 'FL' },
  '33601': { city: 'Tampa',          state: 'FL' }, '32201': { city: 'Jacksonville',   state: 'FL' },
  '98101': { city: 'Seattle',        state: 'WA' }, '97201': { city: 'Portland',       state: 'OR' },
  '02101': { city: 'Boston',         state: 'MA' }, '02902': { city: 'Providence',     state: 'RI' },
  '48201': { city: 'Detroit',        state: 'MI' }, '49503': { city: 'Grand Rapids',   state: 'MI' },
  '89101': { city: 'Las Vegas',      state: 'NV' }, '89501': { city: 'Reno',           state: 'NV' },
  '40201': { city: 'Louisville',     state: 'KY' }, '37201': { city: 'Nashville',      state: 'TN' },
  '38101': { city: 'Memphis',        state: 'TN' }, '53201': { city: 'Milwaukee',      state: 'WI' },
  '53701': { city: 'Madison',        state: 'WI' }, '70112': { city: 'New Orleans',    state: 'LA' },
  '70801': { city: 'Baton Rouge',    state: 'LA' }, '43201': { city: 'Columbus',       state: 'OH' },
  '44101': { city: 'Cleveland',      state: 'OH' }, '45201': { city: 'Cincinnati',     state: 'OH' },
  '73101': { city: 'Oklahoma City',  state: 'OK' }, '74101': { city: 'Tulsa',          state: 'OK' },
  '67201': { city: 'Wichita',        state: 'KS' }, '46201': { city: 'Indianapolis',   state: 'IN' },
  '63101': { city: 'St. Louis',      state: 'MO' }, '64101': { city: 'Kansas City',    state: 'MO' },
  '55401': { city: 'Minneapolis',    state: 'MN' }, '55101': { city: 'St. Paul',       state: 'MN' },
  '84101': { city: 'Salt Lake City', state: 'UT' }, '87101': { city: 'Albuquerque',    state: 'NM' },
  '35201': { city: 'Birmingham',     state: 'AL' }, '36101': { city: 'Montgomery',     state: 'AL' },
  '72201': { city: 'Little Rock',    state: 'AR' }, '39201': { city: 'Jackson',        state: 'MS' },
  '29201': { city: 'Columbia',       state: 'SC' }, '29401': { city: 'Charleston',     state: 'SC' },
  '23220': { city: 'Richmond',       state: 'VA' }, '20001': { city: 'Washington',     state: 'DC' },
  '21201': { city: 'Baltimore',      state: 'MD' }, '06101': { city: 'Hartford',       state: 'CT' },
  '07101': { city: 'Newark',         state: 'NJ' }, '08101': { city: 'Camden',         state: 'NJ' },
  '58501': { city: 'Bismarck',       state: 'ND' }, '57101': { city: 'Sioux Falls',    state: 'SD' },
  '59101': { city: 'Billings',       state: 'MT' }, '83701': { city: 'Boise',          state: 'ID' },
  '99501': { city: 'Anchorage',      state: 'AK' }, '96801': { city: 'Honolulu',       state: 'HI' },
}

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
    productCoverageOnly: false, highHazardCode: false, ifAnyBasis: false,
    premiumBasis: 'Gross Sales', exposure: '',
    premOpsBIDeductible: 'No Deductible', premOpsPDDeductible: 'No Deductible', premOpsBIandPDDeductible: 'No Deductible',
    prodCompOpsBIDeductible: 'No Deductible', prodCompOpsPDDeductible: 'No Deductible', prodCompOpsBIandPDDeductible: 'No Deductible',
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
  const [zipAutoFillCity, setZipAutoFillCity] = useState(null)
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

  const handleZipChange = zip => {
    const match = zip.length === 5 ? ZIP_DB[zip] : null
    setLocForm(f => ({ ...f, zip, ...(match ? { city: match.city } : {}) }))
    setZipAutoFillCity(match ? match.city : null)
  }

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
    setZipAutoFillCity(null)
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
    setZipAutoFillCity(null)
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
        highHazardCode: cls.highHazardCode || false, ifAnyBasis: cls.ifAnyBasis || false,
        premiumBasis: cls.premiumBasis || 'Gross Sales', exposure: cls.exposure || '',
        premOpsBIDeductible: cls.premOpsBIDeductible || 'No Deductible',
        premOpsPDDeductible: cls.premOpsPDDeductible || 'No Deductible',
        premOpsBIandPDDeductible: cls.premOpsBIandPDDeductible || 'No Deductible',
        prodCompOpsBIDeductible: cls.prodCompOpsBIDeductible || 'No Deductible',
        prodCompOpsPDDeductible: cls.prodCompOpsPDDeductible || 'No Deductible',
        prodCompOpsBIandPDDeductible: cls.prodCompOpsBIandPDDeductible || 'No Deductible',
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
    const updatedSchedule = schedule.map(s => {
      if (s.id !== classTargetStateId) return s
      return {
        ...s,
        locations: (s.locations || []).map(l => {
          if (l.id !== classTargetLocId) return l
          if (editingClassId) {
            return { ...l, classifications: (l.classifications || []).map(c => c.id === editingClassId ? { ...classForm, id: c.id } : c) }
          }
          return { ...l, classifications: [...(l.classifications || []), { ...classForm, id: Date.now() }] }
        }),
      }
    })
    setSchedule(updatedSchedule)
    if (editingClassId) {
      setEditingClassId(null)
      setClassOpen(false)
    } else {
      setClassForm(blankClassForm())
      setClassCodeKnown(false)
    }
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
          <Input
            label="Location Name"
            value={locForm.name}
            onChange={e => setLF('name', e.target.value)}
            placeholder="e.g. Main Office"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Address Line 1" value={locForm.address} onChange={e => setLF('address', e.target.value)} placeholder="e.g. 123 Main St" />
            <Input label="Address Line 2" value={locForm.address2} onChange={e => setLF('address2', e.target.value)} placeholder="Suite, Floor, etc." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* City — shows auto-fill badge when filled from ZIP */}
            <div>
              <Input
                label="City"
                value={locForm.city}
                onChange={e => { setLF('city', e.target.value); setZipAutoFillCity(null) }}
              />
              {zipAutoFillCity && locForm.city === zipAutoFillCity && (
                <AutoFillHint>Auto-filled from ZIP — you may edit</AutoFillHint>
              )}
            </div>
            {/* ZIP — triggers city auto-fill */}
            <div>
              <Input
                label="ZIP Code"
                value={locForm.zip}
                onChange={e => handleZipChange(e.target.value)}
                placeholder="e.g. 60609"
                maxLength={5}
              />
              {zipAutoFillCity && (
                <AutoFillHint>City matched to {zipAutoFillCity}</AutoFillHint>
              )}
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

        {/* ── Territory Codes ── */}
        {(showPremOps || showProdComp) && (
          <>
            <SectionHeading>Territory Codes</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              {showPremOps  && <Input label="Prem/Ops Territory Code"     value={locForm.premOpsTerritoryCode}     onChange={e => setLF('premOpsTerritoryCode', e.target.value)}     placeholder="e.g. 001" />}
              {showProdComp && <Input label="Prod/Comp Ops Territory Code" value={locForm.prodCompOpsTerritoryCode} onChange={e => setLF('prodCompOpsTerritoryCode', e.target.value)} placeholder="e.g. 999" />}
            </div>
          </>
        )}

        {/* ── Prem/Ops Deductibles ── */}
        {showPremOps && (
          <>
            <SectionHeading>Prem/Ops Deductibles</SectionHeading>
            <div className="grid grid-cols-3 gap-4">
              <Select label="BI Deductible"      searchable options={deductibleOptions} value={locForm.premOpsBI}      onChange={v => setLF('premOpsBI', v)} />
              <Select label="PD Deductible"      searchable options={deductibleOptions} value={locForm.premOpsPD}      onChange={v => setLF('premOpsPD', v)} />
              <Select label="BI & PD Deductible" searchable options={deductibleOptions} value={locForm.premOpsBIandPD} onChange={v => setLF('premOpsBIandPD', v)} />
            </div>
          </>
        )}

        {/* ── Prod/Comp Ops Deductibles ── */}
        {showProdComp && (
          <>
            <SectionHeading>Prod/Comp Ops Deductibles</SectionHeading>
            <div className="grid grid-cols-3 gap-4">
              <Select label="BI Deductible"      searchable options={deductibleOptions} value={locForm.prodCompOpsBI}      onChange={v => setLF('prodCompOpsBI', v)} />
              <Select label="PD Deductible"      searchable options={deductibleOptions} value={locForm.prodCompOpsPD}      onChange={v => setLF('prodCompOpsPD', v)} />
              <Select label="BI & PD Deductible" searchable options={deductibleOptions} value={locForm.prodCompOpsBIandPD} onChange={v => setLF('prodCompOpsBIandPD', v)} />
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
            <Button variant="secondary" onClick={() => { setClassOpen(false); setEditingClassId(null) }}>
              {editingClassId ? 'Cancel' : 'Done'}
            </Button>
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
                        {cls.classificationType} · {cls.premiumBasis} · Exposure: {cls.exposure || '—'}
                      </p>
                    </div>
                  </div>
                  <button type="button"
                    onClick={() => deleteClass(classTargetStateId, classTargetLocId, cls.id)}
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

        {/* Class Code + Description with autofill */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Class Code" required
              value={classForm.classCode}
              onChange={e => handleClassCodeChange(e.target.value)}
              placeholder="e.g. 18078"
            />
            {classCodeKnown && <AutoFillHint>Known ISO GL code</AutoFillHint>}
          </div>
          <div>
            <Input
              label="Class Description"
              value={classForm.classDescription}
              onChange={e => setCF('classDescription', e.target.value)}
              placeholder="e.g. Ship Chandler Stores"
            />
            {classCodeKnown && <AutoFillHint>Description auto-filled — you may edit</AutoFillHint>}
          </div>
        </div>

        {/* Classification Type */}
        <div className="mt-4">
          <Select label="Classification Type" options={classTypeOpts} value={classForm.classificationType} onChange={v => setCF('classificationType', v)} />
        </div>

        {/* Product Coverage Only + High Hazard Code */}
        <div className="grid grid-cols-2 gap-6 mt-5">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Product Coverage Only</p>
            <YesNo value={classForm.productCoverageOnly} onChange={v => setCF('productCoverageOnly', v)} />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">High Hazard Code?</p>
            <YesNo value={classForm.highHazardCode} onChange={v => setCF('highHazardCode', v)} />
          </div>
        </div>

        {/* ── Prem/Ops Deductibles ── */}
        {clsShowPremOps && (
          <>
            <SectionHeading>Prem/Ops Deductibles</SectionHeading>
            <div className="grid grid-cols-3 gap-4">
              <Select label="BI Deductible"      searchable options={deductibleOptions} value={classForm.premOpsBIDeductible}      onChange={v => setCF('premOpsBIDeductible', v)} />
              <Select label="PD Deductible"      searchable options={deductibleOptions} value={classForm.premOpsPDDeductible}      onChange={v => setCF('premOpsPDDeductible', v)} />
              <Select label="BI & PD Deductible" searchable options={deductibleOptions} value={classForm.premOpsBIandPDDeductible} onChange={v => setCF('premOpsBIandPDDeductible', v)} />
            </div>
          </>
        )}

        {/* ── Prod/Comp Ops Deductibles ── */}
        {clsShowProdComp && (
          <>
            <SectionHeading>Prod/Comp Ops Deductibles</SectionHeading>
            <div className="grid grid-cols-3 gap-4">
              <Select label="BI Deductible"      searchable options={deductibleOptions} value={classForm.prodCompOpsBIDeductible}      onChange={v => setCF('prodCompOpsBIDeductible', v)} />
              <Select label="PD Deductible"      searchable options={deductibleOptions} value={classForm.prodCompOpsPDDeductible}      onChange={v => setCF('prodCompOpsPDDeductible', v)} />
              <Select label="BI & PD Deductible" searchable options={deductibleOptions} value={classForm.prodCompOpsBIandPDDeductible} onChange={v => setCF('prodCompOpsBIandPDDeductible', v)} />
            </div>
          </>
        )}

        {/* ── Rating Basis ── */}
        <SectionHeading>Rating Basis</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Premium Basis" options={premiumBasisOpts} value={classForm.premiumBasis} onChange={v => setCF('premiumBasis', v)} />
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">'If Any' Basis</p>
            <YesNo value={classForm.ifAnyBasis} onChange={v => setCF('ifAnyBasis', v)} />
          </div>
        </div>
        <div className="mt-4">
          <Input
            label="Exposure" required
            value={classForm.exposure}
            onChange={e => setCF('exposure', e.target.value)}
            placeholder="e.g. 1,000,000"
          />
        </div>

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
                          {cls.classificationType} · {cls.premiumBasis}
                          {cls.exposure ? ` · Exposure: ${cls.exposure}` : ''}
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
  )
}
