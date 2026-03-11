// ---------------------------------------------------------------------------
// Skeleton — shimmer loading placeholders
// ---------------------------------------------------------------------------

/**
 * Skeleton line/block placeholder with shimmer animation.
 *
 * @param {object}  props
 * @param {string}  [props.className]  — additional classes (height, width, rounded, etc.)
 * @param {'line'|'circle'|'rect'} [props.variant='line'] — shape preset
 * @param {number}  [props.count=1]    — repeat N skeleton lines
 */
export default function Skeleton({ className = '', variant = 'line', count = 1 }) {
  const base = 'animate-shimmer bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 bg-[length:200%_100%]'

  const variantClass = {
    line:   'h-4 rounded',
    circle: 'rounded-full',
    rect:   'rounded-xl',
  }[variant] || 'h-4 rounded'

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${base} ${variantClass} ${className}`} />
        ))}
      </div>
    )
  }

  return <div className={`${base} ${variantClass} ${className}`} />
}

// ---------------------------------------------------------------------------
// Pre-built skeleton composites for common page layouts
// ---------------------------------------------------------------------------

/** Skeleton for a stats card row (like Dashboard KPI cards) */
export function SkeletonCardRow({ count = 4 }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

/** Skeleton for a data table (like Submissions table) */
export function SkeletonTable({ rows = 6, cols = 7 }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-stone-50 border-b border-stone-100 px-4 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-stone-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-4 py-4 flex gap-6 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={`h-4 flex-1 ${c === 0 ? 'max-w-[100px]' : ''}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Skeleton for a form section */
export function SkeletonForm({ fields = 6 }) {
  return (
    <div className="space-y-5">
      <Skeleton className="h-5 w-48 mb-4" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" variant="rect" />
          </div>
        ))}
      </div>
    </div>
  )
}
