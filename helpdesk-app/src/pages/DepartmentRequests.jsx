import { useMemo } from 'react'
import TicketCard from '../components/TicketCard.jsx'
import { useTickets } from '../hooks/useTickets'

export default function DepartmentRequests() {
  const { tickets, loading } = useTickets()

  const departmentRequests = useMemo(
    () => tickets.filter((t) => t.category === 'Access Request' || t.category === 'Account'),
    [tickets]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Department Requests</h1>
        <p className="mt-1 text-sm text-slate-500">
          Access and account requests routed from HR, Finance, Security, Procurement, and Warehouse.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading && <p className="text-sm text-slate-500">Loading requests...</p>}
        {!loading && departmentRequests.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
        {!loading && departmentRequests.length === 0 && (
          <p className="text-sm text-slate-500">No department requests right now.</p>
        )}
      </div>
    </div>
  )
}
