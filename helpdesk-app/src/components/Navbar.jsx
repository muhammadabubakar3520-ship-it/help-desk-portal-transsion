import { useState } from 'react'
import { Menu, Search, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { initials } from '../utils/helpers'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 shadow-nav backdrop-blur sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink-700 hover:bg-slate-100 lg:hidden"
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden flex-1 max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 transition focus-within:border-brand-accent focus-within:ring-2 focus-within:ring-brand-accent/20 sm:flex">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="text"
          placeholder="Search tickets, requesters, tags..."
          className="w-full bg-transparent text-sm text-ink-800 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-lg border border-transparent px-1.5 py-1 hover:border-slate-200 hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white">
              {initials(user?.name)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-ink-900">{user?.name}</span>
              <span className="block text-xs capitalize leading-tight text-slate-500">{user?.role}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-card border border-slate-200 bg-white py-1 shadow-card-hover">
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-ink-800 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
