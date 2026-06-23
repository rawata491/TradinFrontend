/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Use class strategy: add/remove .dark on <html>
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /*
         * The dark-* palette is driven by CSS custom properties so the
         * entire scale can be flipped for light mode without touching any
         * component classes.  In dark mode the values match the original
         * slate-based dark scale; in light mode the scale is inverted so
         * dark-950 (deepest background) maps to white and dark-50 (lightest)
         * maps to near-black, making every bg-dark-*, text-dark-*, and
         * border-dark-* utility work correctly in both themes.
         */
        dark: {
          50:  'rgb(var(--tw-dark-50)  / <alpha-value>)',
          100: 'rgb(var(--tw-dark-100) / <alpha-value>)',
          200: 'rgb(var(--tw-dark-200) / <alpha-value>)',
          300: 'rgb(var(--tw-dark-300) / <alpha-value>)',
          400: 'rgb(var(--tw-dark-400) / <alpha-value>)',
          500: 'rgb(var(--tw-dark-500) / <alpha-value>)',
          600: 'rgb(var(--tw-dark-600) / <alpha-value>)',
          700: 'rgb(var(--tw-dark-700) / <alpha-value>)',
          800: 'rgb(var(--tw-dark-800) / <alpha-value>)',
          900: 'rgb(var(--tw-dark-900) / <alpha-value>)',
          950: 'rgb(var(--tw-dark-950) / <alpha-value>)',
        },
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        positive: '#22c55e',
        negative: '#ef4444',
        warning: '#f59e0b',
        intelligence: '#7c3aed',
        signal: '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'pulse-once': 'pulse 0.6s ease-in-out 1',
        'price-up':   'priceUp 0.6s ease-in-out',
        'price-down': 'priceDown 0.6s ease-in-out',
        'marquee':        'marquee 35s linear infinite',
        'marquee-slow':   'marquee 55s linear infinite',
        'float':          'float 5s ease-in-out infinite',
        'pulse-glow':     'pulseGlow 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        priceUp: {
          '0%':   { backgroundColor: 'transparent' },
          '30%':  { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        priceDown: {
          '0%':   { backgroundColor: 'transparent' },
          '30%':  { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
          '100%': { backgroundColor: 'transparent' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%':      { opacity: '0.6', transform: 'scale(1.08)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':       { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
