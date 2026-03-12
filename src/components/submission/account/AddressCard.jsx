import { useState, useCallback, useRef, useEffect } from 'react'
import Card from '../../ui/Card'
import Input from '../../ui/Input'
import Select from '../../ui/Select'
import { usStates } from '../../../data/mockData'
import { MapPin, Check, Loader2 } from 'lucide-react'
import AddressMap, { lookupZip, searchAddresses, reverseGeocodeLatLng } from '../AddressMap'

export default function AddressCard({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v })
  const [verified, setVerified]   = useState(false)
  const [verifying, setVerifying] = useState(false)

  // Full-address autocomplete state
  const [fullAddress, setFullAddress] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [mapCenter, setMapCenter]     = useState(null)
  const suggestionsRef = useRef(null)
  const searchRef      = useRef(null)
  const zipRef         = useRef(null)

  // Autocomplete: search as user types
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

  // Select a suggestion → fill all fields
  const handleSelectSuggestion = useCallback((s) => {
    setFullAddress(s.displayName)
    onChange({
      ...data,
      line1:    s.addressLine1,
      city:     s.city,
      state:    s.state,
      county:   s.county,
      zip:      s.zipcode,
      country:  s.country,
    })
    setMapCenter([s.lat, s.lng])
    setSuggestions([])
    setVerified(false)
  }, [data, onChange])

  // Map click → reverse geocode → fill fields
  const handleMapClick = useCallback(async ([lat, lng]) => {
    const result = await reverseGeocodeLatLng(lat, lng)
    if (result) {
      setFullAddress(result.fullAddress)
      onChange({
        ...data,
        line1:    result.addressLine1,
        city:     result.city,
        state:    result.state,
        county:   result.county,
        zip:      result.zipcode,
        country:  result.country,
      })
      setMapCenter([lat, lng])
      setVerified(false)
    }
  }, [data, onChange])

  // Zip auto-fill
  const handleZipChange = useCallback(async (e) => {
    const val = e.target.value
    set('zip', val)
    setVerified(false)
    if (zipRef.current) clearTimeout(zipRef.current)
    if (/^\d{5}$/.test(val)) {
      zipRef.current = setTimeout(async () => {
        const info = await lookupZip(val)
        if (info) {
          onChange({ ...data, zip: val, city: info.city, state: info.state })
          setMapCenter([info.lat, info.lng])
        }
      }, 300)
    }
  }, [data, onChange])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleVerify = async () => {
    setVerifying(true)
    await new Promise(r => setTimeout(r, 900))
    setVerifying(false)
    setVerified(true)
  }

  const verifyAction = verified ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-sage-50 text-sage-700 border border-sage-200 px-2.5 py-1 rounded-full">
      <Check className="h-3 w-3" /> USPS Verified
    </span>
  ) : (
    <button
      onClick={handleVerify}
      disabled={verifying}
      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white text-stone-600 border border-stone-200 px-2.5 py-1 rounded-full hover:border-ink-400 hover:text-ink-600 transition-colors disabled:opacity-60"
    >
      {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3" />}
      {verifying ? 'Verifying…' : 'Verify Address'}
    </button>
  )

  return (
    <Card title="Mailing Address" actions={verifyAction}>
      <div className="space-y-3">
        {/* Full address search with autocomplete */}
        <div className="relative" ref={suggestionsRef}>
          <Input
            label="Enter Full Address"
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

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Address Line 1" required
              value={data.line1}
              onChange={e => { set('line1', e.target.value); setVerified(false) }}
              placeholder="Street address"
            />
          </div>
          <Input
            label="Line 2"
            value={data.line2}
            onChange={e => set('line2', e.target.value)}
            placeholder="Suite, unit…"
          />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-2">
            <Input
              label="City" required
              value={data.city}
              onChange={e => { set('city', e.target.value); setVerified(false) }}
            />
          </div>
          <Select
            label="State" required searchable
            options={usStates}
            value={data.state}
            onChange={v => { set('state', v); setVerified(false) }}
          />
          <Input
            label="ZIP" required
            value={data.zip}
            onChange={handleZipChange}
            placeholder="00000"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input label="County" value={data.county} onChange={e => set('county', e.target.value)} />
          <Select label="Country" options={['US', 'CA', 'MX']} value={data.country} onChange={v => set('country', v)} />
          <div />
        </div>

        {verified && (
          <div className="rounded-xl bg-stone-25 border border-stone-200 p-3.5 flex items-start gap-3">
            <MapPin className="h-4 w-4 text-ink-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-stone-800">{data.line1}{data.line2 ? `, ${data.line2}` : ''}</p>
              <p className="text-sm text-stone-600">{data.city}, {data.state} {data.zip}</p>
              <p className="text-xs text-stone-400 mt-0.5">{data.county} County · {data.country}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
