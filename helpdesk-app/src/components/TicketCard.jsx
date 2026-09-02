import { Link } from 'react-router-dom'
import { Calendar, UserRound } from 'lucide-react'
import { PRIORITY_STYLES, STATUS_STYLES } from '../utils/constants'
import { ticketId, timeAgo, formatDateTime } from '../utils/helpers'

export default function TicketCard({ ticket, action }) {
  const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.Medium
  const statusClass = STATUS_STYLES[ticket.status] || STATUS_STYLES.Open

  return (
    <div className="card card-hover flex overflow-hidden">
      <span className={`w-1.5 shrink-0 ${priorityStyle.bar}`} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-mono text-xs font-medium text-brand-primary">{ticketId(ticket.id)}</span>
            <h3 className="mt-0.5 text-sm font-semibold text-ink-900">
              <Link to="/my-tickets" className="hover:text-brand-primary hover:underline">
                {ticket.title}
              </Link>
            </h3>
          </div>
          <span className={statusClass}>{ticket.status}</span>
        </div>

        <p className="line-clamp-2 text-sm text-slate-500">{ticket.description}</p>

        {ticket.adminRemarks && (
          <div className="rounded-lg border border-sky-200 bg-sky-50/60 px-3 py-2.5">
            <p className="text-xs font-semibold text-sky-700">
              Admin remarks{ticket.adminRemarksBy ? ` \u00b7 ${ticket.adminRemarksBy}` : ''}
            </p>
            <p className="mt-1 text-sm text-ink-800">{ticket.adminRemarks}</p>
          </div>
        )}

        {ticket.resolutionNotes && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2.5">
            <p className="text-xs font-semibold text-emerald-700">Resolution remarks</p>
            <p className="mt-1 text-sm text-ink-800">{ticket.resolutionNotes}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <span className={priorityStyle.badge}>{ticket.priority}</span>
            <span className="font-medium text-ink-700">{ticket.category}</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formatDateTime(ticket.createdAt)}
            </span>
            <span>&middot; updated {timeAgo(ticket.updatedAt)}</span>
          </div>
          {ticket.assignee && (
            <span className="inline-flex items-center gap-1 font-medium text-slate-500">
              <UserRound className="h-3.5 w-3.5" /> {ticket.assignee}
            </span>
          )}
        </div>

        {action && <div className="pt-1">{action}</div>}
      </div>
    </div>
  )
}
