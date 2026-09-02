import { useEffect, useMemo, useState } from 'react'
import ApprovalCard from '../components/ApprovalCard.jsx'
import PendingTicketReviewCard from '../components/PendingTicketReviewCard.jsx'
import ResolveTicketModal from '../components/ResolveTicketModal.jsx'
import RemarksModal from '../components/RemarksModal.jsx'
import TicketCard from '../components/TicketCard.jsx'
import { authService } from '../services/authService'
import { reportService } from '../services/reportService'
import { useAuth } from '../hooks/useAuth'
import { useTickets } from '../hooks/useTickets'
import { Download, Ticket as TicketIcon, Clock, Users2, AlertCircle } from 'lucide-react'
import { PRIORITY_STYLES, STATUS_STYLES, TICKET_STATUS, SUPER_ADMIN_EMPLOYEE_ID } from '../utils/constants'
import { ticketId, formatDateTime } from '../utils/helpers'

export default function Admin() {
  const { user } = useAuth()
  const {
    tickets,
    loading,
    approveTicket,
    rejectTicket,
    assignTicket,
    updateStatus,
    acceptAndAssign,
    updateRemarks
  } = useTickets()
  const [busyId, setBusyId] = useState(null)
  const [users, setUsers] = useState([])
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [resolvingTicket, setResolvingTicket] = useState(null)
  const [resolving, setResolving] = useState(false)
  const [remarksTicket, setRemarksTicket] = useState(null)
  const [savingRemarks, setSavingRemarks] = useState(false)

  useEffect(() => {
    let cancelled = false
    authService.listUsers().then((data) => {
      if (!cancelled) setUsers(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Only Mughees Khalid (matched by Employee ID, same as
  // SUPER_ADMIN_EMPLOYEE_ID used for password resets - never by name, since
  // a display name can be edited or misspelled) dispatches tickets to other
  // team members - see helpdesk-server/routes/tickets.js, which enforces
  // the same rule server-side. Everyone else can only accept a ticket for
  // themselves.
  const isDispatcher = user?.employeeId === SUPER_ADMIN_EMPLOYEE_ID
  const otherStaff = useMemo(
    () => users.filter((u) => u.role === 'admin' && u.name !== user?.name),
    [users, user]
  )

  const totals = useMemo(
    () => ({
      total: tickets.length,
      users: users.length,
      newlyCreated: tickets.filter((t) => t.status === TICKET_STATUS.NEWLY_CREATED).length,
      pending: tickets.filter((t) => t.status === TICKET_STATUS.PENDING_APPROVAL).length
    }),
    [tickets, users]
  )

  const newlyCreated = useMemo(
    () => tickets.filter((t) => t.status === TICKET_STATUS.NEWLY_CREATED),
    [tickets]
  )

  const pending = useMemo(
    () => tickets.filter((t) => t.status === TICKET_STATUS.PENDING_APPROVAL),
    [tickets]
  )

  const unassigned = useMemo(
    () => tickets.filter((t) => t.status === TICKET_STATUS.OPEN && !t.assignee),
    [tickets]
  )

  // Tickets the admin has assigned to themself - shown under "My Active Tickets".
  const adminAssigned = useMemo(
    () =>
      tickets.filter(
        (t) => t.assignee === user?.name && t.status !== TICKET_STATUS.RESOLVED && t.status !== TICKET_STATUS.CLOSED
      ),
    [tickets, user]
  )

  // Tickets the admin has assigned to someone else - kept under their own
  // heading so it's clear at a glance who picked up what.
  const assignedToOthers = useMemo(
    () =>
      tickets.filter(
        (t) =>
          t.assignee &&
          t.assignee !== user?.name &&
          t.status !== TICKET_STATUS.RESOLVED &&
          t.status !== TICKET_STATUS.CLOSED
      ),
    [tickets, user]
  )

  // Resolved tickets waiting on the admin's final sign-off: "Cleared" closes
  // the ticket out for good, "Not Cleared" sends it back to the assignee.
  const resolvedAwaitingClearance = useMemo(
    () => tickets.filter((t) => t.status === TICKET_STATUS.RESOLVED),
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

  async function handleAcceptAndAssign(id, assignee) {
    setBusyId(id)
    await acceptAndAssign(id, assignee)
    setBusyId(null)
  }

  async function handleResolveSubmit(notes) {
    setResolving(true)
    try {
      await updateStatus(resolvingTicket.id, TICKET_STATUS.RESOLVED, notes)
      setResolvingTicket(null)
    } finally {
      setResolving(false)
    }
  }

  async function handleRemarksSubmit(notes) {
    setSavingRemarks(true)
    try {
      await updateRemarks(remarksTicket.id, notes)
      setRemarksTicket(null)
    } finally {
      setSavingRemarks(false)
    }
  }

  // Explicitly keeps a ticket at "In Progress" - the counterpart to the
  // Resolved action. Useful when an admin wants to confirm/flag that a
  // ticket is still being worked on and isn't resolved yet.
  async function handleMarkNotResolved(id) {
    setBusyId(id)
    try {
      await updateStatus(id, TICKET_STATUS.IN_PROGRESS)
    } finally {
      setBusyId(null)
    }
  }

  async function handleClearance(id, cleared) {
    setBusyId(id)
    try {
      // Cleared -> Closed (fully done). Not Cleared -> back to In Progress
      // so the assignee can pick the work back up.
      await updateStatus(id, cleared ? TICKET_STATUS.CLOSED : TICKET_STATUS.IN_PROGRESS)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDownloadReport() {
    setDownloading(true)
    setDownloadError('')
    try {
      await reportService.downloadAdminReport()
    } catch (err) {
      setDownloadError(err.message || 'Failed to generate the report')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Admin Console</h1>
          <p className="mt-1 text-sm text-slate-500">
            Directory, approvals, and ticket oversight across TRANSSION HOLDINGS.
          </p>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={downloading}
            className="btn-primary whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            {downloading ? 'Preparing PDF...' : 'Download PDF Report'}
          </button>
          <p className="mt-1 text-xs text-slate-400">Users, tickets, and active sessions</p>
          {downloadError && <p className="mt-1 text-xs text-signal-coral">{downloadError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Tickets</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10">
              <TicketIcon className="h-[18px] w-[18px] text-brand-primary" />
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-ink-900">{totals.total}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Newly Created</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
              <AlertCircle className="h-[18px] w-[18px] text-purple-600" />
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-ink-900">{totals.newlyCreated}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending Approval</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
              <Clock className="h-[18px] w-[18px] text-amber-600" />
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-ink-900">{totals.pending}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Users</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
              <Users2 className="h-[18px] w-[18px] text-sky-600" />
            </span>
          </div>
          <p className="font-display text-3xl font-bold text-ink-900">{totals.users}</p>
        </div>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">Newly Created Tickets</h2>
          <p className="mt-0.5 text-sm text-slate-500">Review and assign new tickets submitted by users.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {loading && <p className="text-sm text-slate-500">Loading new tickets...</p>}
          {!loading &&
            newlyCreated.map((ticket) => (
              <PendingTicketReviewCard
                key={ticket.id}
                ticket={ticket}
                users={users}
                currentUser={user}
                onAcceptAndAssign={handleAcceptAndAssign}
                onReject={handleReject}
                busy={busyId === ticket.id}
              />
            ))}
          {!loading && newlyCreated.length === 0 && (
            <p className="text-sm text-slate-500">No new tickets to review.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">Approvals</h2>
          <p className="mt-0.5 text-sm text-slate-500">Requests waiting on sign-off before work begins.</p>
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
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">My Active Tickets</h2>
          <p className="mt-0.5 text-sm text-slate-500">Tickets you've assigned to yourself.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {!loading && adminAssigned.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              action={
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={() => setRemarksTicket(ticket)}
                  >
                    {ticket.adminRemarks ? 'Edit remarks' : 'Add remarks'}
                  </button>
                  <button
                    type="button"
                    className="btn-primary text-xs"
                    onClick={() => setResolvingTicket(ticket)}
                    disabled={busyId === ticket.id}
                  >
                    Resolved
                  </button>
                  <button
                    type="button"
                    className="btn-danger text-xs"
                    onClick={() => handleMarkNotResolved(ticket.id)}
                    disabled={busyId === ticket.id}
                  >
                    {busyId === ticket.id ? 'Updating...' : 'Not Resolved'}
                  </button>
                </div>
              }
            />
          ))}
          {!loading && adminAssigned.length === 0 && <p className="text-sm text-slate-500">Nothing assigned to you right now.</p>}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">Assigned to Other Team Members</h2>
          <p className="mt-0.5 text-sm text-slate-500">Tickets you've assigned to other admins or engineers.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {!loading && assignedToOthers.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              action={
                <button
                  type="button"
                  className="btn-secondary text-xs"
                  onClick={() => setRemarksTicket(ticket)}
                >
                  {ticket.adminRemarks ? 'Edit remarks' : 'Add remarks'}
                </button>
              }
            />
          ))}
          {!loading && assignedToOthers.length === 0 && (
            <p className="text-sm text-slate-500">You haven't assigned anything to another team member yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">Resolved Tickets &middot; Clearance</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Review resolved tickets and mark them Cleared to close them out, or Not Cleared to send them back.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {!loading &&
            resolvedAwaitingClearance.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                action={
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-primary text-xs"
                      onClick={() => handleClearance(ticket.id, true)}
                      disabled={busyId === ticket.id}
                    >
                      Cleared
                    </button>
                    <button
                      type="button"
                      className="btn-danger text-xs"
                      onClick={() => handleClearance(ticket.id, false)}
                      disabled={busyId === ticket.id}
                    >
                      Not Cleared
                    </button>
                  </div>
                }
              />
            ))}
          {!loading && resolvedAwaitingClearance.length === 0 && (
            <p className="text-sm text-slate-500">Nothing waiting on clearance right now.</p>
          )}
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
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn-primary text-xs"
                    onClick={() => assignTicket(ticket.id, user.name)}
                  >
                    Assign to me
                  </button>
                  {isDispatcher && (
                    <select
                      className="input-field text-xs py-1.5"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) assignTicket(ticket.id, e.target.value)
                        e.target.value = ''
                      }}
                    >
                      <option value="" disabled>
                        Assign to team member...
                      </option>
                      {otherStaff.map((account) => (
                        <option key={account.id} value={account.name}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              }
            />
          ))}
          {!loading && unassigned.length === 0 && <p className="text-sm text-slate-500">Queue is clear.</p>}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-ink-900">User Directory</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {users.length === 0 && (
            <p className="px-5 py-4 text-sm text-slate-500">No registered users yet.</p>
          )}
          {users.map((account) => (
            <div key={account.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p className="font-medium text-ink-900">{account.name}</p>
                <p className="text-xs text-slate-500">{account.email}</p>
              </div>
              <div className="text-right">
                <p className="capitalize text-ink-800">{account.role}</p>
                <p className="text-xs text-slate-500">{account.department}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-ink-900">All Tickets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Requester</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading &&
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-slate-400">{ticketId(ticket.id)}</span>
                      <p className="font-medium text-ink-900">{ticket.title}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{ticket.requester}</td>
                    <td className="px-5 py-3">
                      <span className={(PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.Medium).badge}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={STATUS_STYLES[ticket.status] || STATUS_STYLES.Open}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDateTime(ticket.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
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

      {remarksTicket && (
        <RemarksModal
          ticket={remarksTicket}
          onSubmit={handleRemarksSubmit}
          onCancel={() => setRemarksTicket(null)}
          submitting={savingRemarks}
        />
      )}
    </div>
  )
}
