import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/useThemeStore'

interface ThemeToggleProps {
  /** 'icon' = bare icon button; 'switch' = animated pill with label */
  variant?: 'icon' | 'switch'
  className?: string
}

export function ThemeToggle({ variant = 'switch', className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`p-2 rounded-lg text-dark-400 hover:text-dark-50 hover:bg-dark-800
                    transition-colors duration-150 focus:outline-none
                    focus:ring-2 focus:ring-brand-500 ${className}`}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded-lg
                  transition-all duration-200 select-none
                  focus:outline-none focus:ring-2 focus:ring-brand-500
                  ${isDark
                    ? 'bg-dark-800 border border-dark-700 hover:bg-dark-700 hover:border-dark-600'
                    : 'bg-white border border-dark-800 hover:border-dark-700 shadow-sm hover:shadow-md'
                  }
                  ${className}`}
    >
      {/* Animated icon */}
      <span className="relative h-4 w-4 flex-shrink-0">
        <Sun
          className={`absolute inset-0 h-4 w-4 text-amber-500 transition-all duration-300 ${
            isDark ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'
          }`}
        />
        <Moon
          className={`absolute inset-0 h-4 w-4 text-brand-400 transition-all duration-300 ${
            isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'
          }`}
        />
      </span>

      {/* Sliding pill */}
      <div
        className={`relative h-[18px] w-8 rounded-full flex-shrink-0 transition-colors duration-300 ${
          isDark ? 'bg-brand-600' : 'bg-dark-700'
        }`}
      >
        <span
          className={`absolute top-[1px] h-4 w-4 rounded-full shadow-sm
                       transform transition-transform duration-300
                       ${isDark ? 'translate-x-[14px] bg-white' : 'translate-x-[1px] bg-white'}`}
        />
      </div>

      {/* Label */}
      <span
        className={`text-xs font-medium w-9 text-left flex-shrink-0 transition-colors duration-200 ${
          isDark ? 'text-dark-300' : 'text-dark-400'
        }`}
      >
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  )
}
