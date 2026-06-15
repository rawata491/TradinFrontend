import { Link } from 'react-router-dom'
import { Search, Home } from 'lucide-react'
import { UnifiedSearchBar } from '@/components/token-search/UnifiedSearchBar'

export function NotFoundPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-6 animate-fade-in pb-20 md:pb-6">
      <p className="text-6xl font-bold text-dark-700">404</p>
      <h1 className="text-xl font-semibold text-dark-50">Page not found</h1>
      <p className="text-sm text-dark-400">
        The page you requested doesn&apos;t exist or may have moved.
      </p>
      <div className="flex justify-center">
        <UnifiedSearchBar />
      </div>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home className="h-4 w-4" /> Dashboard
        </Link>
        <Link to="/discover" className="btn-ghost inline-flex items-center gap-2">
          <Search className="h-4 w-4" /> Discover
        </Link>
      </div>
    </div>
  )
}
