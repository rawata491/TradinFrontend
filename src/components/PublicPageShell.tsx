import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicFooter } from '@/components/public/PublicFooter'

export function PublicGlassPanel({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`w-full rounded-2xl border border-dark-800 bg-dark-900 backdrop-blur-xl p-8 shadow-xl
                  dark:border-white/10 dark:shadow-2xl dark:shadow-black/30 ${className}`}
    >
      {children}
    </div>
  )
}

export function PublicPageShell({
  children,
  centered = true,
  showFooter = false,
}: {
  children: React.ReactNode
  centered?: boolean
  showFooter?: boolean
}) {
  return (
    <div className="min-h-screen flex flex-col bg-dark-950 text-dark-50">
      <div className="dark:hidden fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100" aria-hidden />
      <PublicHeader variant="minimal" maxWidth="5xl" />
      <main
        id="main-content"
        className={`flex-1 px-4 pb-12 ${centered ? 'min-h-[calc(100vh-4rem)] flex items-center justify-center' : 'py-8 max-w-5xl mx-auto w-full'}`}
      >
        {children}
      </main>
      {showFooter && <PublicFooter />}
    </div>
  )
}
