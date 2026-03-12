import { SearchX } from 'lucide-react'

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'No results found',
  description = 'Try adjusting your search or filter criteria',
  action,
  actionLabel,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-stone-300" />
      </div>
      <p className="text-sm font-medium text-stone-500 text-center">{title}</p>
      {description && (
        <p className="text-xs text-stone-400 mt-1.5 text-center max-w-xs">{description}</p>
      )}
      {action && actionLabel && (
        <button
          onClick={action}
          className="mt-4 px-4 py-2 text-xs font-semibold text-ink-700 bg-ink-50 border border-ink-200 rounded-lg hover:bg-ink-100 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
