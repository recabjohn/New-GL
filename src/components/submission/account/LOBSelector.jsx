import Card from '../../ui/Card'
import { Info, ShieldAlert, Car, Building2, Globe, Umbrella, Users, Package, Layers } from 'lucide-react'

const lobs = [
  { id: 'GL',       label: 'General Liability',  desc: 'Premises, operations',   icon: ShieldAlert, color: 'text-ink-600',     bg: 'bg-ink-50' },
  { id: 'CA',       label: 'Commercial Auto',     desc: 'Business vehicles',      icon: Car,         color: 'text-amber-600',   bg: 'bg-amber-50' },
  { id: 'CP',       label: 'Commercial Property', desc: 'Buildings & contents',   icon: Building2,   color: 'text-sage-600',    bg: 'bg-sage-50' },
  { id: 'Cyber',    label: 'Cyber',               desc: 'Data breach, ransomware',icon: Globe,       color: 'text-crimson-600', bg: 'bg-crimson-50' },
  { id: 'Umbrella', label: 'Umbrella',            desc: 'Excess liability',        icon: Umbrella,    color: 'text-ink-500',     bg: 'bg-stone-100' },
  { id: 'EPLI',     label: 'EPLI',                desc: 'Employment practices',   icon: Users,       color: 'text-flame-600',   bg: 'bg-flame-50' },
  { id: 'BOP',      label: 'BOP',                 desc: 'Business owner pkg',     icon: Package,     color: 'text-stone-600',   bg: 'bg-stone-100' },
  { id: 'Excess',   label: 'Excess',              desc: 'Excess over primary',    icon: Layers,      color: 'text-ink-500',     bg: 'bg-ink-50' },
]

export default function LOBSelector({ selected = [], onChange }) {
  const toggle = (id) => {
    if (!onChange) return
    if (selected.includes(id)) {
      onChange(selected.filter(s => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <Card title="Lines of Business">
      <div className="space-y-5">
        <div>
          <label className="form-label mb-2">Selected Lines of Business</label>
          {selected.length > 1 && (
            <div className="flex items-center gap-1.5 mb-2 text-xs text-ink-600 bg-ink-50 rounded-lg px-3 py-1.5">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Multi-LOB — each line will be quoted separately.
            </div>
          )}
          <div className="grid grid-cols-2 gap-1.5">
            {lobs.map(lob => {
              const active = selected.includes(lob.id)
              const Icon   = lob.icon
              return (
                <button
                  key={lob.id}
                  type="button"
                  onClick={() => toggle(lob.id)}
                  className={[
                    'flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-150',
                    active
                      ? 'bg-ink-800 border-ink-800 text-white shadow-sm'
                      : 'bg-white border-stone-200 opacity-40 hover:opacity-70 hover:border-stone-300',
                    onChange ? 'cursor-pointer' : 'cursor-default',
                  ].join(' ')}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-white/10' : lob.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : lob.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold leading-tight ${active ? 'text-white' : 'text-stone-800'}`}>{lob.label}</p>
                    <p className={`text-[10px] leading-tight truncate ${active ? 'text-ink-200' : 'text-stone-400'}`}>{lob.desc}</p>
                  </div>
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${active ? 'bg-flame-400 border-flame-400' : 'border-stone-300'}`}>
                    {active && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {selected.includes('GL') && (
          <div className="rounded-xl bg-flame-50 border border-flame-200 px-4 py-3">
            <p className="text-xs font-bold text-flame-700 mb-0.5">General Liability selected</p>
            <p className="text-xs text-flame-600">Product: <strong>Solartis ISO — GL V1</strong></p>
          </div>
        )}
      </div>
    </Card>
  )
}
