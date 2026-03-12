export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex border-b border-stone-200 ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            'px-5 py-3 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap',
            activeTab === tab.id
              ? 'border-ink-600 text-ink-700'
              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300',
          ].join(' ')}
        >
          {tab.label}
          {tab.badge != null && (
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab.id ? 'bg-ink-100 text-ink-700' : 'bg-stone-100 text-stone-500'}`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function SubTabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
            activeTab === tab.id
              ? 'bg-ink-900 text-white'
              : 'text-stone-600 hover:bg-stone-100',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
