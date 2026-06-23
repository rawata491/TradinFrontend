import { PublicFooter } from '@/components/public/PublicFooter'
import { PublicHeader } from '@/components/public/PublicHeader'

interface PublicPageLayoutProps {
  children: React.ReactNode
  /** Show subtle page backdrop gradient (landing, pricing) */
  withBackdrop?: boolean
  headerVariant?: 'marketing' | 'minimal'
  headerWidth?: '5xl' | '7xl'
  showFooter?: boolean
}

export function PublicPageLayout({
  children,
  withBackdrop = false,
  headerVariant = 'marketing',
  headerWidth = '7xl',
  showFooter = true,
}: PublicPageLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-dark-950 text-dark-50">
      {withBackdrop && (
        <>
          <div className="dark:hidden fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100" aria-hidden />
          <div className="hidden dark:fixed dark:inset-0 dark:-z-10 dark:bg-gradient-to-b dark:from-dark-900 dark:to-dark-950" aria-hidden />
        </>
      )}
      <PublicHeader variant={headerVariant} maxWidth={headerWidth} />
      <main id="main-content" className="flex-1 w-full">
        {children}
      </main>
      {showFooter && <PublicFooter />}
    </div>
  )
}
