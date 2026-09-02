import { useMemo, useState } from 'react'
import ApprovalCard from '../components/ApprovalCard.jsx'
import { useTickets } from '../hooks/useTickets'
import { TICKET_STATUS } from '../utils/constants'

export default function TicketApproval() {
  const { tickets, loading, approveTicket, rejectTicket } = useTickets()
  const [busyId, setBusyId] = useState(null)

  const pending = useMemo(
    () => tickets.filter((t) => t.status === TICKET_STATUS.PENDING_APPROVAL),
    [tickets]
  )

  async function handleApprove(id) {
    setBusyId(id)
    await approveTicket(id)
    setBusyId(null)
  }

  async function handleReject(id) {
    setBusyId(id)
    await rejectTicket(id)
    setBusyId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Ticket Approval</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and sign off on requests that need approval before work can begin.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading && <p className="text-sm text-slate-500">Loading approvals...</p>}
        {!loading &&
          pending.map((ticket) => (
            <ApprovalCard
              key={ticket.id}
              ticket={ticket}
              onApprove={handleApprove}
              onReject={handleReject}
              busy={busyId === ticket.id}
            />
          ))}
        {!loading && pending.length === 0 && (
          <p className="text-sm text-slate-500">Nothing waiting on approval right now.</p>
        )}
      </div>
    </div>
  )
}
