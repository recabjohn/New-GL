const statusColors = {
  'In Progress': 'bg-amber-100 text-amber-700 ring-amber-200',
  'Offered':     'bg-sage-50 text-sage-700 ring-sage-200',
  'Registered':  'bg-ink-50 text-ink-700 ring-ink-200',
  'Clearance':   'bg-flame-50 text-flame-700 ring-flame-200',
  'Cancelled':   'bg-crimson-50 text-crimson-700 ring-crimson-200',
  'Bound':       'bg-sage-100 text-sage-800 ring-sage-300',
  'Issued':      'bg-ink-100 text-ink-700 ring-ink-200',
  'Declined':    'bg-crimson-50 text-crimson-700 ring-crimson-200',
  'Expired':     'bg-stone-100 text-stone-500 ring-stone-200',
}

const priorityColors = {
  HIGH:   'bg-crimson-50 text-crimson-700 ring-crimson-200',
  MEDIUM: 'bg-amber-50 text-amber-700 ring-amber-200',
  LOW:    'bg-sage-50 text-sage-600 ring-sage-200',
}

export function StatusBadge({ status }) {
  const cls = statusColors[status] || 'bg-stone-100 text-stone-600 ring-stone-200'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const cls = priorityColors[priority] || 'bg-stone-100 text-stone-600 ring-stone-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wide ring-1 ${cls}`}>
      {priority}
    </span>
  )
}

export function FormTypeBadge({ type }) {
  return type === 'o' ? (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-flame-50 text-flame-700 ring-1 ring-flame-200">Optional</span>
  ) : (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-500 ring-1 ring-stone-200">Mandatory</span>
  )
}

export default function Badge({ children, color = 'default' }) {
  const colorMap = {
    default: 'bg-stone-100 text-stone-600',
    blue:    'bg-ink-50 text-ink-700',
    orange:  'bg-flame-50 text-flame-700',
    green:   'bg-sage-50 text-sage-700',
    red:     'bg-crimson-50 text-crimson-700',
    amber:   'bg-amber-50 text-amber-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorMap[color]}`}>
      {children}
    </span>
  )
}
