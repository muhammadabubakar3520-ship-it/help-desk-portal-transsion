import { readTickets, writeTickets, readUsers } from '../lib/db.js'
import { HttpError } from '../lib/http.js'
import { requireUser, requireAdmin } from './auth.js'

// Only Mughess Khalid dispatches tickets to other team members - everyone
// else can only pick up a ticket for themselves. Matched by Employee ID
// (not name) so this keeps working even if his display name is ever
// edited.
const DISPATCHER_EMPLOYEE_ID = '19221160'

// Resolves a requested "assign to" name against the real staff directory
// and checks permission. This is what guarantees a ticket is always
// assigned using one person's exact, canonical name - never a typo'd or
// made-up stand-in (e.g. the old "Admin" placeholder) - and that only the
// dispatcher can hand work to someone other than themselves.
function resolveAssignee(rawAssignee, requester) {
  const clean = String(rawAssignee || '').trim()
  if (!clean) return null

  const staff = readUsers().filter((u) => u.role === 'admin')
  const match = staff.find((u) => u.name.toLowerCase() === clean.toLowerCase())
  if (!match) {
    throw new HttpError(400, 'Tickets can only be assigned to a registered staff member')
  }

  if (match.name !== requester.name && requester.employeeId !== DISPATCHER_EMPLOYEE_ID) {
    throw new HttpError(403, 'Only Mughess Khalid can assign tickets to other team members')
  }

  return match.name
}

const TICKET_STATUS = {
  NEWLY_CREATED: 'Newly Created',
  OPEN: 'Open',
  PENDING_APPROVAL: 'Pending Approval',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected'
}

const TICKET_PRIORITY = {
  URGENT: 'Urgent'
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

export const ticketRoutes = {
  async list(req) {
    requireUser(req)
    const { status, requester, assignee } = req.query
    let tickets = readTickets()
    if (status) tickets = tickets.filter((t) => t.status === status)
    if (requester) tickets = tickets.filter((t) => t.requester === requester)
    if (assignee) tickets = tickets.filter((t) => t.assignee === assignee)
    tickets = tickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    return { statusCode: 200, body: tickets }
  },

  async getById(req, id) {
    requireUser(req)
    const ticket = readTickets().find((t) => t.id === Number(id))
    if (!ticket) throw new HttpError(404, 'Ticket not found')
    return { statusCode: 200, body: ticket }
  },

  async create(req) {
    const user = requireUser(req)
    const { title, description, category, priority } = req.body || {}
    if (!title || !category || !priority) {
      throw new HttpError(400, 'Title, category, and priority are required')
    }

    const tickets = readTickets()
    const now = new Date().toISOString()
    const ticket = {
      id: nextId(tickets),
      title: String(title).trim(),
      description: String(description || '').trim(),
      category,
      priority,
      status: TICKET_STATUS.NEWLY_CREATED,
      requester: user.name,
      requesterEmail: user.email,
      assignee: null,
      resolutionNotes: null,
      // Freeform overview/remarks the admin can leave on a ticket at any
      // point (not tied to a status change), visible to the employee who
      // created the ticket.
      adminRemarks: null,
      createdAt: now,
      updatedAt: now
    }

    writeTickets([ticket, ...tickets])
    return { statusCode: 201, body: ticket }
  },

  async updateStatus(req, id) {
    const requester = requireUser(req)
    const { status, resolutionNotes } = req.body || {}
    if (!Object.values(TICKET_STATUS).includes(status)) {
      throw new HttpError(400, 'Invalid status')
    }

    const tickets = readTickets()
    const ticket = tickets.find((t) => t.id === Number(id))
    if (!ticket) throw new HttpError(404, 'Ticket not found')

    // Marking a ticket Resolved is restricted to whoever it's assigned to -
    // nobody else (including other admins) can close out someone else's
    // work. This mirrors the same "assign" permission check above: the
    // assignment decides who owns the ticket, and only that person can
    // report it done.
    if (status === TICKET_STATUS.RESOLVED && ticket.assignee !== requester.name) {
      throw new HttpError(403, 'Only the team member this ticket is assigned to can mark it as resolved')
    }

    // When a ticket is being marked Resolved, require the admin/engineer to
    // leave a remark describing how it was solved, so the employee who
    // opened the ticket can see what was done.
    const trimmedNotes = String(resolutionNotes || '').trim()
    if (status === TICKET_STATUS.RESOLVED && !trimmedNotes) {
      throw new HttpError(400, 'Resolution remarks are required to mark a ticket as resolved')
    }

    ticket.status = status
    if (trimmedNotes) {
      ticket.resolutionNotes = trimmedNotes
    }
    ticket.updatedAt = new Date().toISOString()
    writeTickets(tickets)
    return { statusCode: 200, body: ticket }
  },

  async assign(req, id) {
    const requester = requireUser(req)
    const { assignee } = req.body || {}
    const tickets = readTickets()
    const ticket = tickets.find((t) => t.id === Number(id))
    if (!ticket) throw new HttpError(404, 'Ticket not found')
    ticket.assignee = resolveAssignee(assignee, requester)
    ticket.status = TICKET_STATUS.IN_PROGRESS
    ticket.updatedAt = new Date().toISOString()
    writeTickets(tickets)
    return { statusCode: 200, body: ticket }
  },

  async setRemarks(req, id) {
    // Any admin can leave (or update) a general remark/overview on a
    // ticket, independent of its status. This is separate from
    // resolutionNotes (which is only captured when a ticket is marked
    // Resolved) - remarks can be added at any stage, e.g. right after
    // assignment, to keep the requester in the loop.
    const admin = requireAdmin(req)
    const { remarks } = req.body || {}
    const trimmed = String(remarks || '').trim()
    if (!trimmed) throw new HttpError(400, 'Remarks cannot be empty')

    const tickets = readTickets()
    const ticket = tickets.find((t) => t.id === Number(id))
    if (!ticket) throw new HttpError(404, 'Ticket not found')
    ticket.adminRemarks = trimmed
    ticket.adminRemarksBy = admin.name
    ticket.adminRemarksAt = new Date().toISOString()
    ticket.updatedAt = new Date().toISOString()
    writeTickets(tickets)
    return { statusCode: 200, body: ticket }
  },

  async approve(req, id) {
    return ticketRoutes.updateStatus(
      { ...req, body: { status: TICKET_STATUS.OPEN } },
      id
    )
  },

  async reject(req, id) {
    return ticketRoutes.updateStatus(
      { ...req, body: { status: TICKET_STATUS.REJECTED } },
      id
    )
  },

  async acceptAndAssign(req, id) {
    const requester = requireUser(req)
    const { assignee } = req.body || {}
    const tickets = readTickets()
    const ticket = tickets.find((t) => t.id === Number(id))
    if (!ticket) throw new HttpError(404, 'Ticket not found')

    // Accept ticket (change from Newly Created to In Progress)
    ticket.status = TICKET_STATUS.IN_PROGRESS
    ticket.assignee = resolveAssignee(assignee, requester)
    ticket.updatedAt = new Date().toISOString()
    writeTickets(tickets)
    return { statusCode: 200, body: ticket }
  }
}
