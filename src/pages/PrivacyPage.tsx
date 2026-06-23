import { Link } from 'react-router-dom'
import { PublicPageShell } from '@/components/PublicPageShell'

export function PrivacyPage() {
  return (
    <PublicPageShell centered={false} showFooter>
      <article className="max-w-3xl mx-auto public-prose">
        <h1>Privacy Policy</h1>
        <p className="text-dark-400">Last updated: {new Date().toISOString().slice(0, 10)}</p>

        <h2>Data we collect</h2>
        <ul>
          <li>Account info: username, email, password (hashed)</li>
          <li>Usage data: watchlists, portfolios, alerts, scripts, paper trades</li>
          <li>Technical data: IP address and user-agent on login (audit log)</li>
        </ul>

        <h2>How we use data</h2>
        <p>
          To provide the service, enforce rate limits, send transactional emails (verification,
          password reset), and improve reliability.
        </p>

        <h2>Third-party services</h2>
        <p>
          We integrate with market data providers (Coinbase, Gate.io), optional OpenAI for AI insights,
          CoinGecko/DexScreener for token data, and optional Telegram for alerts.
        </p>

        <h2>Storage & security</h2>
        <p>
          Passwords are bcrypt-hashed. JWT access tokens are stored in your browser localStorage.
        </p>

        <h2>Your rights</h2>
        <p>
          You may delete your account from Account Settings (GDPR right to erasure).
        </p>

        <p><Link to="/welcome" className="link-brand">← Back to home</Link></p>
      </article>
    </PublicPageShell>
  )
}
