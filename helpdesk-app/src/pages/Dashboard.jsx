import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Ticket,
  FolderOpen,
  Clock,
  Loader,
  CheckCircle2,
  XCircle,
  CalendarDays,
  CirclePlus,
  FileBarChart,
  ShieldCheck,
  Activity
} from 'lucide-react'
import MiniLineChart from '../components/charts/MiniLineChart.jsx'
import MiniBarChart from '../components/charts/MiniBarChart.jsx'
import MiniDonutChart from '../components/charts/MiniDonutChart.jsx'
import { useAuth } from '../hooks/useAuth'
import { useTickets } from '../hooks/useTickets'
import { ROLES, STATUS_STYLES, TICKET_STATUS } from '../utils/constants'
import { ticketId, timeAgo, formatDate } from '../utils/helpers'

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone.bg}`}>
          <Icon className={`h-[18px] w-[18px] ${tone.text}`} />
        </span>
      </div>
      <p className="font-display text-3xl font-bold text-ink-900">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { tickets, loading } = useTickets()

  const scoped = useMemo(() => {
    if (!user) return []
    if (user.role === ROLES.EMPLOYEE) return tickets.filter((t) => t.requester === user.name)
    return tickets
  }, [tickets, user])

  const stats = useMemo(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    return {
      total: scoped.length,
      open: scoped.filter((t) => t.status === TICKET_STATUS.OPEN).length,
      pending: scoped.filter((t) => t.status === TICKET_STATUS.PENDING_APPROVAL).length,
      inProgress: scoped.filter((t) => t.status === TICKET_STATUS.IN_PROGRESS).length,
      resolved: scoped.filter((t) => t.status === TICKET_STATUS.RESOLVED).length,
      rejected: scoped.filter((t) => t.status === TICKET_STATUS.REJECTED).length,
      today: scoped.filter((t) => new Date(t.createdAt) >= startOfToday).length
    }
  }, [scoped])

  const trend = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      days.push(d)
    }
    return days.map((day) => {
      const next = new Date(day)
      next.setDate(next.getDate() + 1)
      const value = scoped.filter((t) => {
        const created = new Date(t.createdAt)
        return created >= day && created < next
      }).length
      return { label: day.toLocaleDateString('en-US', { weekday: 'short' }), value }
    })
  }, [scoped])

  const byCategory = useMemo(() => {
    const palette = ['#005BAC', '#00A3E0', '#16A34A', '#F59E0B', '#7C6CF0', '#DC2626']
    const counts = {}
    scoped.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1
    })
    return Object.entries(counts).map(([label, value], i) => ({
      label,
      value,
      color: palette[i % palette.length]
    }))
  }, [scoped])

  const byStatus = useMemo(
    () => [
      { label: 'Open', value: stats.open, color: '#2563EB' },
      { label: 'Pending', value: stats.pending, color: '#F59E0B' },
      { label: 'In Progress', value: stats.inProgress, color: '#00A3E0' },
      { label: 'Resolved', value: stats.resolved, color: '#16A34A' },
      { label: 'Rejected', value: stats.rejected, color: '#DC2626' }
    ],
    [stats]
  )

  const recent = useMemo(
    () => [...scoped].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6),
    [scoped]
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening across the help desk today.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {user?.role !== ROLES.ADMIN && (
            <Link to="/create-ticket" className="btn-primary">
              <CirclePlus className="h-4 w-4" /> Create Ticket
            </Link>
          )}
          {user?.role === ROLES.ADMIN && (
            <Link to="/admin" className="btn-secondary">
              <ShieldCheck className="h-4 w-4" /> Admin Console
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total Tickets" value={stats.total} icon={Ticket} tone={{ bg: 'bg-brand-primary/10', text: 'text-brand-primary' }} />
        <StatCard label="Open" value={stats.open} icon={FolderOpen} tone={{ bg: 'bg-blue-50', text: 'text-blue-600' }} />
        <StatCard label="Pending Approval" value={stats.pending} icon={Clock} tone={{ bg: 'bg-amber-50', text: 'text-amber-600' }} />
        <StatCard label="In Progress" value={stats.inProgress} icon={Loader} tone={{ bg: 'bg-sky-50', text: 'text-sky-600' }} />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone={{ bg: 'bg-emerald-50', text: 'text-emerald-600' }} />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} tone={{ bg: 'bg-red-50', text: 'text-red-600' }} />
        <StatCard label="Today's Requests" value={stats.today} icon={CalendarDays} tone={{ bg: 'bg-violet-50', text: 'text-violet-600' }} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-ink-900">Ticket Volume — Last 7 Days</h2>
              <p className="text-xs text-slate-500">Daily submissions across the organization</p>
            </div>
            <FileBarChart className="h-4 w-4 text-slate-300" />
          </div>
          <MiniLineChart data={trend} />
        </div>

        <div className="card p-5">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-ink-900">Status Distribution</h2>
            <p className="text-xs text-slate-500">Share of tickets by current status</p>
          </div>
          <MiniDonutChart data={byStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-ink-900">Requests by Category</h2>
            <p className="text-xs text-slate-500">Where tickets are coming from</p>
          </div>
          {byCategory.length > 0 ? (
            <MiniBarChart data={byCategory} width={560} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No data yet</p>
          )}
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-primary" />
            <h2 className="text-sm font-semibold text-ink-900">Recent Activity</h2>
          </div>
          <ol className="relative space-y-5 border-l border-slate-200 pl-4">
            {recent.slice(0, 5).map((t) => (
              <li key={t.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-accent" />
                <p className="text-xs font-medium text-ink-800">{t.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {ticketId(t.id)} &middot; {t.status} &middot; {timeAgo(t.updatedAt)}
                </p>
              </li>
            ))}
            {recent.length === 0 && <p className="text-sm text-slate-400">No recent activity.</p>}
          </ol>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-ink-900">Recent Tickets</h2>
          <Link to="/my-tickets" className="text-sm font-medium text-brand-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-400">
                    Loading tickets...
                  </td>
                </tr>
              )}
              {!loading &&
                recent.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="font-mono text-xs text-brand-primary">{ticketId(t.id)}</span>
                      <p className="font-medium text-ink-900">{t.title}</p>
                    </td>
                    <td className="text-slate-600">{t.category}</td>
                    <td className="text-slate-600">{t.priority}</td>
                    <td>
                      <span className={STATUS_STYLES[t.status] || STATUS_STYLES.Open}>{t.status}</span>
                    </td>
                    <td className="text-slate-500">{formatDate(t.updatedAt)}</td>
                  </tr>
                ))}
              {!loading && recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-sm text-slate-400">
                    No tickets to show yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
