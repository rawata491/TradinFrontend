import { Link } from 'react-router-dom'
import { PublicPageShell } from '@/components/PublicPageShell'

export function TermsPage() {
  return (
    <PublicPageShell centered={false} showFooter>
      <article className="max-w-3xl mx-auto public-prose">
        <h1>Terms of Service</h1>
        <p className="text-dark-400">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <h2>1. Service description</h2>
        <p>
          Tradin provides cryptocurrency market research, analytics, alerts, strategy backtesting,
          and simulated (paper) trading. Tradin is not a broker and does not execute live trades
          on your behalf.
        </p>

        <h2>2. Accounts</h2>
        <p>
          You must provide accurate registration information and keep your credentials secure.
          You are responsible for activity under your account.
        </p>

        <h2>3. Acceptable use</h2>
        <p>
          Do not abuse API rate limits, attempt unauthorized access, scrape the service at scale,
          or use Tradin for unlawful purposes.
        </p>

        <h2>4. Disclaimer</h2>
        <p>
          Market data and AI insights are for informational purposes only. Not financial advice.
          Past backtest performance does not guarantee future results.
        </p>

        <h2>5. Termination</h2>
        <p>
          You may delete your account at any time from Account Settings. We may suspend accounts
          that violate these terms.
        </p>

        <p><Link to="/welcome" className="link-brand">← Back to home</Link></p>
      </article>
    </PublicPageShell>
  )
}
