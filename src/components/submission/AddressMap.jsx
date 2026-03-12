import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, ZoomControl } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon (Leaflet + bundlers issue)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom red Google-style marker
const redMarkerIcon = new L.Icon({
  iconUrl:       'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:      [25, 41],
  iconAnchor:    [12, 41],
  popupAnchor:   [1, -34],
  shadowSize:    [41, 41],
})

// Alabama center & US bounds
const ALABAMA_CENTER = [32.3182, -86.9023] // Montgomery, AL
const US_BOUNDS = L.latLngBounds([24.396308, -125.0], [49.384358, -66.93457])

// ─── Reverse geocode via Nominatim ────────────────────────────────────────────
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) return null
  return res.json()
}

// ─── Forward geocode via Nominatim ────────────────────────────────────────────
async function forwardGeocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1&countrycodes=us`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) return null
  const data = await res.json()
  return data[0] || null
}

// ─── Search addresses (multi-result) for autocomplete ─────────────────────────
export async function searchAddresses(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=us`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) return []
  const data = await res.json()
  return data.map(r => {
    const addr = r.address || {}
    return {
      displayName:  r.display_name,
      lat:          parseFloat(r.lat),
      lng:          parseFloat(r.lon),
      addressLine1: [addr.house_number, addr.road].filter(Boolean).join(' '),
      city:         addr.city || addr.town || addr.village || '',
      state:        addr.state || '',
      county:       addr.county?.replace(' County', '') || '',
      zipcode:      addr.postcode || '',
      country:      addr.country_code?.toUpperCase() || 'US',
    }
  })
}

// ─── Zip code lookup via zippopotam.us ────────────────────────────────────────
export async function lookupZip(zip) {
  if (!/^\d{5}$/.test(zip)) return null
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
  if (!res.ok) return null
  const data = await res.json()
  const place = data.places?.[0]
  if (!place) return null
  return {
    city:  place['place name'],
    state: place['state abbreviation'],
    lat:   parseFloat(place.latitude),
    lng:   parseFloat(place.longitude),
  }
}

// ─── Forward geocode address → lat/lng ────────────────────────────────────────
export async function geocodeAddress(address) {
  const result = await forwardGeocode(address)
  if (!result) return null
  const addr = result.address || {}
  return {
    lat:          parseFloat(result.lat),
    lng:          parseFloat(result.lon),
    addressLine1: [addr.house_number, addr.road].filter(Boolean).join(' '),
    city:         addr.city || addr.town || addr.village || '',
    state:        addr.state || '',
    county:       addr.county?.replace(' County', '') || '',
    zipcode:      addr.postcode || '',
    country:      addr.country_code?.toUpperCase() || 'US',
  }
}

// ─── Reverse geocode map click → address fields ──────────────────────────────
export async function reverseGeocodeLatLng(lat, lng) {
  const result = await reverseGeocode(lat, lng)
  if (!result) return null
  const addr = result.address || {}
  return {
    fullAddress:  result.display_name || '',
    addressLine1: [addr.house_number, addr.road].filter(Boolean).join(' '),
    city:         addr.city || addr.town || addr.village || '',
    state:        addr.state || '',
    county:       addr.county?.replace(' County', '') || '',
    zipcode:      addr.postcode || '',
    country:      addr.country_code?.toUpperCase() || 'US',
  }
}

// ─── Internal: fly map to new center ──────────────────────────────────────────
function FlyTo({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1 })
  }, [center, map])
  return null
}

// ─── Internal: capture map clicks ─────────────────────────────────────────────
function ClickHandler({ onClick }) {
  useMapEvents({ click: e => onClick(e.latlng) })
  return null
}

// ─── Internal: restrict panning to US bounds ─────────────────────────────────
function BoundsEnforcer() {
  const map = useMap()
  useEffect(() => {
    map.setMaxBounds(US_BOUNDS.pad(0.1))
    map.setMinZoom(4)
  }, [map])
  return null
}

// ─── AddressMap component ─────────────────────────────────────────────────────
export default function AddressMap({ center, onMapClick }) {
  const [marker, setMarker] = useState(center)

  useEffect(() => {
    if (center) setMarker(center)
  }, [center])

  const handleClick = async latlng => {
    setMarker([latlng.lat, latlng.lng])
    onMapClick?.([latlng.lat, latlng.lng])
  }

  const defaultCenter = center || ALABAMA_CENTER
  const defaultZoom   = center ? 15 : 7  // zoom level 7 shows Alabama nicely

  return (
    <div className="mt-3 rounded-xl border border-stone-200 overflow-hidden shadow-sm" style={{ height: '260px' }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer
          attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, DeLorme, NAVTEQ'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
        <BoundsEnforcer />
        <ZoomControl position="bottomright" />
        <FlyTo center={center} />
        <ClickHandler onClick={handleClick} />
        {marker && <Marker position={marker} icon={redMarkerIcon} />}
      </MapContainer>
    </div>
  )
}
