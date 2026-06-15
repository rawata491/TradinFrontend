import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react'
import type { RiskLevel } from '@/types/discovery'

interface RiskBadgeProps {
  level: RiskLevel | string
  compact?: boolean
}

const CONFIG: Record<string, { label: string; className: string; Icon: typeof Shield }> = {
  low: { label: 'Low risk', className: 'bg-positive/15 text-positive', Icon: ShieldCheck },
  medium: { label: 'Med risk', className: 'bg-yellow-500/15 text-yellow-400', Icon: Shield },
  high: { label: 'High risk', className: 'bg-negative/15 text-negative', Icon: ShieldAlert },
}

export function RiskBadge({ level, compact = false }: RiskBadgeProps) {
  const cfg = CONFIG[level] || CONFIG.high
  const Icon = cfg.Icon

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium ${cfg.className} ${
        compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
      title="DYOR — discovery signals are not financial advice"
    >
      <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {!compact && cfg.label}
    </span>
  )
}
