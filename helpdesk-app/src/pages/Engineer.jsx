import { useMemo, useState } from 'react'
import ResolveTicketModal from '../components/ResolveTicketModal.jsx'
import TicketCard from '../components/TicketCard.jsx'
import { useAuth } from '../hooks/useAuth'
import { useTickets } from '../hooks/useTickets'
import { TICKET_STATUS } from '../utils/constants'

export default function Engineer() {
  const { user } = useAuth()
  const { tickets, loading, assignTicket, updateStatus } = useTickets()
  const [resolvingTicket, setResolvingTicket] = useState(null)
  const [resolving, setResolving] = useState(false)

  const unassigned = useMemo(
    () => tickets.filter((t) => t.status === TICKET_STATUS.OPEN && !t.assignee),
    [tickets]
  )
  const mine = useMemo(
    () =>
      tickets.filter(
        (t) => t.assignee === user?.name && t.status !== TICKET_STATUS.RESOLVED && t.status !== TICKET_STATUS.CLOSED
      ),
    [tickets, user]
  )

  async function handleResolveSubmit(notes) {
    setResolving(true)
    try {
      await updateStatus(resolvingTicket.id, TICKET_STATUS.RESOLVED, notes)
      setResolvingTicket(null)
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Engineer Queue</h1>
        <p className="mt-1 text-sm text-slate-500">Pick up open tickets and move your active work forward.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-900">My Active Tickets</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {!loading && mine.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              action={
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => setResolvingTicket(ticket)}
                >
                  Mark resolved
                </button>
              }
            />
          ))}
          {!loading && mine.length === 0 && <p className="text-sm text-slate-500">Nothing assigned to you right now.</p>}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-900">Unassigned Tickets</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {!loading && unassigned.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              action={
                <button
                  type="button"
                  className="btn-primary text-xs"
                  onClick={() => assignTicket(ticket.id, user.name)}
                >
                  Assign to me
                </button>
              }
            />
          ))}
          {!loading && unassigned.length === 0 && <p className="text-sm text-slate-500">Queue is clear.</p>}
        </div>
      </section>

      {resolvingTicket && (
        <ResolveTicketModal
          ticket={resolvingTicket}
          onSubmit={handleResolveSubmit}
          onCancel={() => setResolvingTicket(null)}
          submitting={resolving}
        />
      )}
    </div>
  )
}
