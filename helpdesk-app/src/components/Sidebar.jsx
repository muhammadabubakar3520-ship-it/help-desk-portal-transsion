import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CirclePlus,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  Building2,
  BarChart3,
  Users,
  Boxes,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'
import Logo from '../assets/logo.jsx'
import { useAuth } from '../hooks/useAuth'
import { NAV_ITEMS } from '../utils/constants'
import { classNames } from '../utils/helpers'

const ICONS = {
  LayoutDashboard,
  CirclePlus,
  Ticket,
  ShieldCheck,
  CheckCircle2,
  Building2,
  BarChart3,
  Users,
  Boxes,
  BookOpen,
  Bell,
  Settings
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const items = NAV_ITEMS[user?.role] || []
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-brand-secondary text-slate-200',
          'transition-[transform,width] duration-200 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-20' : 'w-72'
        )}
        style={{ backgroundImage: 'linear-gradient(180deg, #003B73 0%, #00294f 100%)' }}
      >
        <div className="flex h-[68px] items-center gap-2.5 border-b border-white/10 px-5">
          <Logo className="h-8 w-8 shrink-0" />
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold tracking-wide text-white">TRANSSION HOLDINGS</p>
              <p className="truncate text-[11px] font-medium text-brand-accent">Help Desk Management</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon] || Ticket
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  classNames(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-white text-brand-secondary shadow-sm'
                      : 'text-slate-200/85 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-white/10 px-3 py-3">
          <button
            type="button"
            onClick={logout}
            className={classNames(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200/85 transition hover:bg-white/10 hover:text-white'
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="hidden items-center justify-center gap-2 border-t border-white/10 py-3 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white lg:flex"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && 'Collapse'}
        </button>

        {!collapsed && (
          <div className="border-t border-white/10 px-5 py-4 text-xs text-slate-300">
            Signed in as
            <div className="mt-0.5 truncate font-semibold text-white">{user?.department || user?.name}</div>
          </div>
        )}
      </aside>
    </>
  )
}
