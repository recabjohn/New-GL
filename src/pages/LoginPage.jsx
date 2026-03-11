import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ---------------------------------------------------------------------------
// LoginPage — split-panel design matching Solartis layout
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) { triggerError('Username is required.'); return }
    if (!password)        { triggerError('Password is required.'); return }

    setLoading(true)

    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 600))

    const result = login(username.trim(), password)
    setLoading(false)

    if (result.success) {
      navigate('/', { replace: true })
    } else {
      triggerError(result.error)
    }
  }

  const triggerError = (msg) => {
    setError(msg)
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* ================================================================== */}
      {/* LEFT PANEL — Branded                                                */}
      {/* ================================================================== */}
      <div className="hidden lg:flex lg:w-[48%] relative bg-ink-950 flex-col justify-between p-10 overflow-hidden">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-ink-800/30 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 rounded-full bg-flame-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-ink-700/20 blur-2xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-flame-500 flex items-center justify-center shadow-lg">
            <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xl font-bold text-white tracking-tight">Solaris</p>
            <p className="text-[10px] text-ink-500 font-semibold uppercase tracking-[0.2em]">Insurance Platform</p>
          </div>
        </div>

        {/* Heading */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome to<br />
            <span className="text-flame-400">Solaris Insure!</span>
          </h1>
          <p className="text-ink-300 text-lg leading-relaxed">
            We Transform Your Insurance Policy Administration.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['GL Underwriting', 'Rating Engine', 'Policy Issuance', 'Claims Management'].map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-ink-900/80 border border-ink-800 text-ink-300 text-xs font-medium backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-ink-600">
          <p>© 2026 Solaris. All Rights Reserved.</p>
          <div className="flex gap-4">
            <button className="hover:text-ink-400 transition-colors">Terms</button>
            <button className="hover:text-ink-400 transition-colors">Privacy</button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* RIGHT PANEL — Sign-In Form                                          */}
      {/* ================================================================== */}
      <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 px-6">

        {/* Mobile logo (hidden on lg+) */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-flame-500 flex items-center justify-center shadow-lg">
            <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xl font-bold text-ink-900 tracking-tight">Solaris</p>
            <p className="text-[10px] text-ink-500 font-semibold uppercase tracking-[0.2em]">Insurance Platform</p>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Heading */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-ink-900 mb-1">Sign In</h2>
            <p className="text-sm text-stone-400">Enter your credentials to access the platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className={`space-y-5 ${shake ? 'animate-shake' : ''}`}>
              {/* Username */}
              <div>
                <label htmlFor="login-username" className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                  Username <span className="text-crimson-500">*</span>
                </label>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 placeholder-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
                  Password <span className="text-crimson-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 pr-11 text-sm text-stone-800 placeholder-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-ink-400 focus:border-ink-400 transition-colors"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-crimson-50 border border-crimson-200 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-crimson-500 shrink-0" />
                <p className="text-xs font-medium text-crimson-700">{error}</p>
              </div>
            )}

            {/* Forgot password + Sign In */}
            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                className="text-sm font-medium text-ink-500 hover:text-ink-700 transition-colors"
              >
                Forgot Password
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-2.5 rounded-lg bg-flame-500 text-white text-sm font-bold uppercase tracking-wider shadow-sm hover:bg-flame-600 active:bg-flame-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-flame-400 focus:ring-offset-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing In…
                  </>
                ) : (
                  'SIGN IN'
                )}
              </button>
            </div>
          </form>

          {/* Hint */}
          <div className="mt-10 p-3 bg-ink-25 border border-ink-100 rounded-lg">
            <p className="text-[11px] text-ink-400 text-center leading-relaxed">
              <span className="font-semibold text-ink-600">Demo credentials:</span>{' '}
              username <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-ink-100 text-ink-700">admin</code>{' / '}
              password <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-ink-100 text-ink-700">admin</code>
            </p>
          </div>
        </div>

        {/* Mobile footer */}
        <p className="lg:hidden mt-12 text-xs text-stone-400">© 2026 Solaris. All Rights Reserved.</p>
      </div>

      {/* Shake animation (injected once) */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}
