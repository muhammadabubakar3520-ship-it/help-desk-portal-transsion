import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'
import Logo from '../assets/logo.jsx'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(identifier, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Unable to sign in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center lg:hidden">
        <Logo className="h-11 w-11" />
        <h1 className="mt-4 text-xl font-semibold text-ink-900">TRANSSION HOLDINGS</h1>
        <p className="mt-1 text-sm text-slate-500">IT Help Desk Management System</p>
      </div>

      <div className="hidden lg:block">
        <h2 className="text-2xl font-semibold text-ink-900">Welcome back</h2>
        <p className="mt-1.5 text-sm text-slate-500">Sign in to view and manage your help desk tickets.</p>
      </div>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6 sm:p-7">
        <div>
          <label htmlFor="identifier" className="mb-1.5 block text-sm font-medium text-ink-800">
            Employee ID
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="identifier"
              type="text"
              required
              className="input-field pl-10"
              placeholder="Employee ID"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-800">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type="password"
              required
              className="input-field pl-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-accent"
            />
            Remember me
          </label>
          <a href="#" className="font-medium text-brand-primary hover:underline">
            Forgot password?
          </a>
        </div>

        {error && <p className="text-sm font-medium text-signal-coral">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          <LogIn className="h-4 w-4" />
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-primary hover:underline">
            Create one
          </Link>
        </p>
      </form>
    </div>
  )
}
