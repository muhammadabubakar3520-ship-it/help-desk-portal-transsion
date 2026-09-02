import { CalendarClock, Layers, UserRound, X, Check } from 'lucide-react'
import { PRIORITY_STYLES } from '../utils/constants'
import { ticketId, formatDateTime } from '../utils/helpers'

export default function ApprovalCard({ ticket, onApprove, onReject, busy }) {
  const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.Medium

  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-xs font-medium text-brand-primary">{ticketId(ticket.id)}</span>
          <h3 className="mt-0.5 text-sm font-semibold text-ink-900">{ticket.title}</h3>
        </div>
        <span className={priorityStyle.badge}>{ticket.priority}</span>
      </div>

      <p className="mt-2.5 line-clamp-2 text-sm text-slate-500">{ticket.description}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500 sm:grid-cols-3">
        <div className="flex items-start gap-1.5">
          <UserRound className="mt-0.5 h-3.5 w-3.5 text-slate-400" />
          <div>
            <dt className="text-slate-400">Requester</dt>
            <dd className="mt-0.5 font-medium text-ink-800">{ticket.requester}</dd>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <Layers className="mt-0.5 h-3.5 w-3.5 text-slate-400" />
          <div>
            <dt className="text-slate-400">Category</dt>
            <dd className="mt-0.5 font-medium text-ink-800">{ticket.category}</dd>
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <CalendarClock className="mt-0.5 h-3.5 w-3.5 text-slate-400" />
          <div>
            <dt className="text-slate-400">Submitted</dt>
            <dd className="mt-0.5 font-medium text-ink-800">{formatDateTime(ticket.createdAt)}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => onReject(ticket.id)}
          disabled={busy}
          className="btn-danger"
        >
          <X className="h-4 w-4" /> Reject
        </button>
        <button type="button" onClick={() => onApprove(ticket.id)} disabled={busy} className="btn-primary">
          <Check className="h-4 w-4" /> Approve
        </button>
      </div>
    </div>
  )
}
