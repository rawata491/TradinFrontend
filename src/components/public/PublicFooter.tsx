import { Link } from 'react-router-dom'

export function PublicFooter() {
  return (
    <footer className="relative z-10 border-t border-dark-800 dark:border-white/5 py-8 px-6 text-center text-xs text-dark-400 dark:text-dark-400">
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-3">
        <Link to="/terms" className="hover:text-dark-200 transition-colors">Terms</Link>
        <Link to="/privacy" className="hover:text-dark-200 transition-colors">Privacy</Link>
        <Link to="/pricing" className="hover:text-dark-200 transition-colors">Pricing</Link>
      </div>
      <p>© {new Date().getFullYear()} Tradin — Market intelligence, not a trading platform.</p>
    </footer>
  )
}
