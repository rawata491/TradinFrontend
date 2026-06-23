import { GoogleLogin } from '@react-oauth/google'

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void | Promise<void>
  onError?: (message: string) => void
  disabled?: boolean
}

export function GoogleSignInButton({ onSuccess, onError, disabled }: GoogleSignInButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) return null

  return (
    <div className={`flex justify-center ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
      <GoogleLogin
        onSuccess={(response) => {
          if (response.credential) {
            void onSuccess(response.credential)
            return
          }
          onError?.('Google sign-in did not return a credential')
        }}
        onError={() => onError?.('Google sign-in failed')}
        useOneTap={false}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  )
}

export function isGoogleSignInEnabled(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)
}
