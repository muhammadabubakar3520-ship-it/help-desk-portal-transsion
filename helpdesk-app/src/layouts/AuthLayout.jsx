import { Navigate, Outlet } from 'react-router-dom'
import { ShieldCheck, Headset, Workflow } from 'lucide-react'
import Logo from '../assets/logo.jsx'
import { useAuth } from '../hooks/useAuth'

const FEATURES = [
  { icon: Headset, label: 'Unified IT & department support desk' },
  { icon: Workflow, label: 'Streamlined approval & escalation workflows' },
  { icon: ShieldCheck, label: 'Enterprise-grade security & access control' }
]

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left brand panel */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden px-12 py-12 text-white lg:flex"
        style={{ backgroundImage: 'linear-gradient(160deg, #005BAC 0%, #003B73 100%)' }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <Logo className="h-10 w-10" />
          <div className="leading-tight">
            <p className="text-lg font-bold tracking-wide">TRANSSION HOLDINGS</p>
            <p className="text-xs font-medium text-brand-accent">Enterprise Technology Group</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-3xl font-semibold leading-tight">
            IT Help Desk Management System
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            A single, secure workspace for employees, IT support, and department leaders to raise,
            track, and resolve requests across the organization.
          </p>
          <div className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-sm text-white/90">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">
          &copy; {new Date().getFullYear()} TRANSSION HOLDINGS. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-1 items-center justify-center px-4 py-10 lg:w-1/2">
        <Outlet />
      </div>
    </div>
  )
}
