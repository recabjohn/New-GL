import { useState, useCallback, useRef, useEffect } from 'react'
import Card from '../../ui/Card'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import { usStates } from '../../../data/mockData'
import { MapPin } from 'lucide-react'
import AddressMap, { lookupZip, searchAddresses, reverseGeocodeLatLng } from '../AddressMap'

const legalEntities = [
  'Association','Corporation','C Corporation','S Corporation','Domestic Profit Corporation',
  'Foreign Corporation','Foreign Limited Liability Company','Foreign Limited Partnership',
  'General Partnership','Governmental Unit','Individual','Joint Venture','Limited Corporation',
  'Limited Liability Company','Limited Liability Partnership','Limited Partnership',
  'Nonprofit Corporation','Partnership','Professional Corporation','Religious Organization',
  'Sole Proprietor','Other',
]
const industries = ['Agriculture', 'Construction', 'Education', 'Entertainment', 'Finance', 'Food & Beverage', 'Healthcare', 'Hospitality', 'Manufacturing', 'Professional Services', 'Real Estate', 'Retail', 'Technology', 'Transportation', 'Other']

function SectionRule({ color, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-0.5 h-4 rounded-full ${color}`} />
      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{children}</span>
    </div>
  )
}

function ScoreBar({ value = 0, max = 100, colorClass }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold font-mono text-stone-700 w-7 text-right">{value}</span>
    </div>
  )
}

export default function AccountInfoCard({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  const setAddr = (k, v) => onChange({ ...data, address: { ...data.address, [k]: v } })

  // Full-address autocomplete state
  const [fullAddress, setFullAddress] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [mapCenter, setMapCenter]     = useState(null)
  const suggestionsRef = useRef(null)
  const searchRef      = useRef(null)
  const zipRef         = useRef(null)

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

  const handleSelectSuggestion = useCallback((s) => {
    setFullAddress(s.displayName)
    onChange({
      ...data,
      address: {
        ...data.address,
        line1: s.addressLine1,
        city: s.city,
        state: s.state,
        county: s.county,
        zip: s.zipcode,
        country: s.country,
      },
    })
    setMapCenter([s.lat, s.lng])
    setSuggestions([])
  }, [data, onChange])

  const handleMapClick = useCallback(async ([lat, lng]) => {
    const result = await reverseGeocodeLatLng(lat, lng)
    if (result) {
      setFullAddress(result.fullAddress)
      onChange({
        ...data,
        address: {
          ...data.address,
          line1: result.addressLine1,
          city: result.city,
          state: result.state,
          county: result.county,
          zip: result.zipcode,
          country: result.country,
        },
      })
      setMapCenter([lat, lng])
    }
  }, [data, onChange])

  const handleZipChange = useCallback(async (e) => {
    const val = e.target.value
    setAddr('zip', val)
    if (zipRef.current) clearTimeout(zipRef.current)
    if (/^\d{5}$/.test(val)) {
      zipRef.current = setTimeout(async () => {
        const info = await lookupZip(val)
        if (info) {
          onChange({ ...data, address: { ...data.address, zip: val, city: info.city, state: info.state } })
          setMapCenter([info.lat, info.lng])
        }
      }, 300)
    }
  }, [data, onChange])

  useEffect(() => {
    const handler = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) setSuggestions([])
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <Card title="Account Information">
      <div className="space-y-5">
        {/* New account toggle */}
        <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
          <input
            type="checkbox"
            id="newAccount"
            className="w-4 h-4 rounded border-stone-300 text-ink-700 focus:ring-ink-400"
          />
          <label htmlFor="newAccount" className="text-sm font-medium text-stone-700">New Account</label>
        </div>

        {/* Business identity */}
        <div>
          <SectionRule color="bg-ink-400">Business Identity</SectionRule>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                label="Account Name" required
                value={data.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Legal business name"
              />
            </div>
            <Input
              label="DBA"
              value={data.dba}
              onChange={e => set('dba', e.target.value)}
              placeholder="Trade name"
            />
          </div>
        </div>

        {/* Address with map + autocomplete */}
        <div>
          <SectionRule color="bg-ink-400">Mailing Address</SectionRule>
          <div className="relative" ref={suggestionsRef}>
            <Input
              label="Enter Full Address" required
              value={fullAddress}
              onChange={handleAddressSearch}
              placeholder="Start typing to search..."
            />
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
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="col-span-2">
              <Input label="Address Line 1" required value={data.address?.line1 || ''} onChange={e => setAddr('line1', e.target.value)} placeholder="Street address" />
            </div>
            <Input label="Line 2" value={data.address?.line2 || ''} onChange={e => setAddr('line2', e.target.value)} placeholder="Suite, unit…" />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-3">
            <div className="col-span-2">
              <Input label="City" required value={data.address?.city || ''} onChange={e => setAddr('city', e.target.value)} />
            </div>
            <Select label="State" required searchable options={usStates} value={data.address?.state || ''} onChange={v => setAddr('state', v)} />
            <Input label="ZIP" required value={data.address?.zip || ''} onChange={handleZipChange} placeholder="00000" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <Input label="County" value={data.address?.county || ''} onChange={e => setAddr('county', e.target.value)} />
            <Select label="Country" options={['US', 'CA', 'MX']} value={data.address?.country || 'US'} onChange={v => setAddr('country', v)} />
          </div>
        </div>

        {/* Legal & tax */}
        <div>
          <SectionRule color="bg-ink-400">Legal &amp; Tax</SectionRule>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Legal Entity"
              options={legalEntities}
              value={data.legalEntity}
              onChange={v => set('legalEntity', v)}
            />
            <Input
              label="FEIN / Tax ID"
              value={data.fein}
              onChange={e => set('fein', e.target.value)}
              placeholder="XX-XXXXXXX"
            />
          </div>
        </div>

        {/* Contact */}
        <div>
          <SectionRule color="bg-sage-400">Contact</SectionRule>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Phone" type="tel"
              value={data.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="(000) 000-0000"
            />
            <div className="col-span-2">
              <Input
                label="Email" type="email"
                value={data.email}
                onChange={e => set('email', e.target.value)}
                placeholder="contact@company.com"
              />
            </div>
          </div>
        </div>

        {/* Business details */}
        <div>
          <SectionRule color="bg-amber-400">Business Details</SectionRule>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <Input
              label="NAICS Code"
              value={data.naicsCode}
              onChange={e => set('naicsCode', e.target.value)}
              placeholder="000000"
            />
            <div className="col-span-2">
              <Input
                label="NAICS Description"
                value={data.naicsDescription}
                onChange={e => set('naicsDescription', e.target.value)}
                placeholder="Industry description"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Industry"
              options={industries}
              value={data.industry}
              onChange={v => set('industry', v)}
            />
            <Input
              label="Business Start Date" type="date"
              value={data.businessStartDate ? (() => { const [m,d,y] = (data.businessStartDate||'').split('/'); return y&&m&&d ? `${y}-${m}-${d}` : '' })() : ''}
              onChange={e => {
                const [y,m,d] = e.target.value.split('-')
                set('businessStartDate', y&&m&&d ? `${m}/${d}/${y}` : '')
              }}
            />
          </div>
        </div>

        {/* Description of operations */}
        <div>
          <label className="form-label mb-1.5">Description of Operations</label>
          <textarea
            rows={3}
            value={data.descriptionOfOps || ''}
            onChange={e => set('descriptionOfOps', e.target.value)}
            placeholder="Describe the insured's primary business operations…"
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 bg-stone-50 placeholder-stone-300 resize-none"
          />
        </div>

        {/* Financial indicators */}
        <div>
          <SectionRule color="bg-crimson-400">Financial Indicators</SectionRule>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <Input
              label="Intelliscore (0–100)" type="number"
              value={data.intelliscore ?? ''}
              onChange={e => set('intelliscore', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0–100"
            />
            <Input
              label="Financial Stability Score (0–100)" type="number"
              value={data.financialStabilityScore ?? ''}
              onChange={e => set('financialStabilityScore', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0–100"
            />
          </div>
          <div className="space-y-2 bg-stone-50 rounded-xl p-3 border border-stone-100">
            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Intelliscore</p>
              <ScoreBar value={data.intelliscore ?? 0} colorClass="bg-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Financial Stability</p>
              <ScoreBar value={data.financialStabilityScore ?? 0} colorClass="bg-sage-400" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
