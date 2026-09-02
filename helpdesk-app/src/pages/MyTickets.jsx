import { useMemo, useState } from 'react'
import TicketCard from '../components/TicketCard.jsx'
import { useAuth } from '../hooks/useAuth'
import { useTickets } from '../hooks/useTickets'
import { ROLES } from '../utils/constants'

const FILTERS = ['All', 'Open', 'Pending Approval', 'In Progress', 'Resolved', 'Closed', 'Rejected']

export default function MyTickets() {
  const { user } = useAuth()
  const { tickets, loading } = useTickets()
  const [filter, setFilter] = useState('All')

  const mine = useMemo(() => {
    if (!user) return []
    if (user.role === ROLES.EMPLOYEE) return tickets.filter((t) => t.requester === user.name)
    if (user.role === ROLES.ENGINEER) return tickets.filter((t) => t.assignee === user.name)
    return tickets
  }, [tickets, user])

  const filtered = filter === 'All' ? mine : mine.filter((t) => t.status === filter)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">My Tickets</h1>
        <p className="mt-1 text-sm text-slate-500">Every ticket tied to your account, in one place.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === option
                ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                : 'border-slate-200 text-slate-600 hover:border-brand-primary/40 hover:bg-brand-primary/5'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading && <p className="text-sm text-slate-500">Loading tickets...</p>}
        {!loading && filtered.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-slate-500">No tickets match this filter.</p>
        )}
      </div>
    </div>
  )
}
