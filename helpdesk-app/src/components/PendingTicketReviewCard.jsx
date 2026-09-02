import { CalendarClock, Layers, UserRound, X, Check, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { PRIORITY_STYLES, SUPER_ADMIN_EMPLOYEE_ID } from '../utils/constants'
import { ticketId, formatDateTime } from '../utils/helpers'

// Only Mughees Khalid dispatches tickets out to other team members -
// everyone else can only accept a ticket for themselves. Matched by
// Employee ID (same SUPER_ADMIN_EMPLOYEE_ID used for password resets), not
// by name, since a display name can be edited or misspelled.

export default function PendingTicketReviewCard({ ticket, users, currentUser, onAcceptAndAssign, onReject, busy }) {
  const [showAssignOptions, setShowAssignOptions] = useState(false)
  const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.Medium
  const isDispatcher = currentUser?.employeeId === SUPER_ADMIN_EMPLOYEE_ID

  const handleAcceptToMe = async () => {
    // Always use the real signed-in user's name - this used to fall back
    // to a hardcoded "Admin" placeholder whenever a different person
    // clicked this button, which is why many unrelated tickets ended up
    // recorded under the same generic "Admin" name instead of each
    // person's own name.
    await onAcceptAndAssign(ticket.id, currentUser?.name)
    setShowAssignOptions(false)
  }

  // The rest of the staff directory, minus whoever is currently signed
  // in - they're already covered by "Assign to Myself" above, so this
  // keeps every name appearing exactly once instead of twice.
  const otherAdmins = users.filter((u) => u.role === 'admin' && u.name !== currentUser?.name)

  return (
    <div className="card card-hover p-5 border-l-4 border-purple-500">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-xs font-medium text-purple-600">{ticketId(ticket.id)}</span>
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

      <div className="mt-5">
        {!showAssignOptions ? (
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => onReject(ticket.id)}
              disabled={busy}
              className="btn-danger text-sm"
            >
              <X className="h-4 w-4" /> Reject
            </button>
            <button
              type="button"
              onClick={() => setShowAssignOptions(true)}
              disabled={busy}
              className="btn-primary text-sm"
            >
              <Check className="h-4 w-4" /> Accept & Assign
            </button>
          </div>
        ) : (
          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-ink-900">Assign ticket to:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAcceptToMe}
                disabled={busy}
                className="btn-primary w-full justify-center text-sm"
              >
                <UserCheck className="h-4 w-4" /> Assign to Myself
              </button>

              {isDispatcher && otherAdmins.length > 0 && (
                <>
                  <p className="text-xs text-slate-500 px-2">Or assign to another team member:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {otherAdmins.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={async () => {
                          await onAcceptAndAssign(ticket.id, user.name)
                          setShowAssignOptions(false)
                        }}
                        disabled={busy}
                        className="btn-secondary text-xs py-2 truncate"
                        title={user.name}
                      >
                        {user.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAssignOptions(false)}
              disabled={busy}
              className="btn-secondary w-full text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
