export function AuthDivider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-dark-800 dark:border-white/10" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-dark-900 px-3 text-dark-500 dark:bg-dark-950">or</span>
      </div>
    </div>
  )
}
