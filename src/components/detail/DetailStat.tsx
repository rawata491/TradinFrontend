import { formatCompact } from '@/utils/formatCompact'

export function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="stat-label">{label}</p>
      <p className="stat-value text-lg">{value}</p>
    </div>
  )
}

export function DetailStatGrid({
  stats,
}: {
  stats: Array<{ label: string; value: string | number; format?: 'compact' | 'raw' }>
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map(({ label, value, format = 'raw' }) => (
        <DetailStat
          key={label}
          label={label}
          value={
            format === 'compact' && typeof value === 'number'
              ? `$${formatCompact(value)}`
              : String(value)
          }
        />
      ))}
    </div>
  )
}
