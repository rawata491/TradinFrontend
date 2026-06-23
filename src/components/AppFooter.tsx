import { Link } from 'react-router-dom'

export function AppFooter() {
  return (
    <footer className="border-t border-dark-800 py-4 px-6 text-center text-xs text-dark-600 space-y-1">
      <div className="space-x-3">
        <Link to="/terms" className="text-dark-500 hover:text-dark-300">Terms</Link>
        <Link to="/privacy" className="text-dark-500 hover:text-dark-300">Privacy</Link>
        <Link to="/account" className="text-dark-500 hover:text-dark-300">Account</Link>
      </div>
      <p>
        Tradin — Market data via{' '}
        <a href="https://www.gate.io/docs/developers/apiv4/" target="_blank" rel="noopener noreferrer"
          className="text-dark-500 hover:text-dark-300 underline">Gate.io API</a>.
        Not a trading platform.
      </p>
    </footer>
  )
}
