import { getCoinColor } from '@/utils/formatters'

interface CoinAvatarProps {
  symbol: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

export function CoinAvatar({ symbol, size = 'md', className = '' }: CoinAvatarProps) {
  const color = getCoinColor(symbol)
  const initials = symbol.slice(0, 3)

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold flex-shrink-0 ${SIZE_CLASSES[size]} ${className}`}
      style={{ backgroundColor: color, color: '#ffffff' }}
      title={symbol}
    >
      {initials}
    </div>
  )
}
