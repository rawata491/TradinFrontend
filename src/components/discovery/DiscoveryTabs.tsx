import { DISCOVERY_TABS, type DiscoveryCategory } from '@/types/discovery'

interface DiscoveryTabsProps {
  active: DiscoveryCategory
  counts?: Partial<Record<DiscoveryCategory, number>>
  onChange: (tab: DiscoveryCategory) => void
}

export function DiscoveryTabs({ active, counts, onChange }: DiscoveryTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DISCOVERY_TABS.map((tab) => {
        const isActive = active === tab.id
        const count = counts?.[tab.id]

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-600 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-dark-100 hover:bg-dark-700'
            }`}
          >
            {tab.label}
            {count !== undefined && count > 0 && (
              <span className={`ml-2 text-xs ${isActive ? 'text-white/80' : 'text-dark-500'}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
