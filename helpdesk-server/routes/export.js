import { readUsers, readTickets, readSessions } from '../lib/db.js'
import { requireUser } from './auth.js'
import { HttpError } from '../lib/http.js'
import { buildPdf, heading, textLine, table } from '../lib/pdf.js'


const REPORT_TIMEZONE = 'Asia/Karachi'

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: REPORT_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
})

function formatDate(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  const parts = Object.fromEntries(dateFormatter.formatToParts(d).map((p) => [p.type, p.value]))
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} PKT`
}

// Sessions hold live login tokens - never put the full token in an
// exported document. Show just enough to tell entries apart.
function maskToken(token) {
  if (!token) return '-'
  return `${token.slice(0, 8)}...`
}

export const exportRoutes = {
  // GET /api/admin/export.pdf - admin-only. Builds a single PDF report
  // covering the user directory, every ticket, and active sessions,
  // straight from the database.
  async pdf(req) {
    const userId = requireUser(req)
    const users = await readUsers()
    const user = users.find((u) => u.id === userId)
    if (!user) throw new HttpError(401, 'Not authenticated')
    if (user.role !== 'admin') throw new HttpError(403, 'Admins only')

    // Sort every section by a stable, predictable key before laying it out,
    // rather than trusting on-disk order (which only happens to be
    // insertion order, and isn't guaranteed once records are edited). This
    // is what keeps the report itself organized regardless of how the
    // underlying data is arranged.
    const allUsers = users.slice().sort((a, b) => a.id - b.id)
    const tickets = (await readTickets()).slice().sort((a, b) => a.id - b.id)
    const sessions = await readSessions() // { [token]: { userId, createdAt } }

    const usersById = new Map(allUsers.map((u) => [u.id, u]))
    const sessionRows = Object.entries(sessions)
      .map(([token, session]) => {
        const sessionUser = usersById.get(session.userId)
        return {
          cells: [maskToken(token), sessionUser ? sessionUser.name : `User #${session.userId}`, formatDate(session.createdAt)],
          createdAt: session.createdAt || ''
        }
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((row) => row.cells)

    // Quick-reference counts up front, so a reader can see the shape of the
    // data before wading into the full listings below.
    const ticketsByStatus = new Map()
    for (const t of tickets) {
      ticketsByStatus.set(t.status, (ticketsByStatus.get(t.status) || 0) + 1)
    }
    const adminCount = allUsers.filter((u) => u.role === 'admin').length

    const lines = []
    lines.push(heading('Help Desk Portal - Admin Data Export', 16))
    lines.push(textLine(`Generated ${formatDate(new Date().toISOString())}`, 9))

    lines.push(heading('Summary', 12))
    lines.push(textLine(`Users: ${allUsers.length} total (${adminCount} admin, ${allUsers.length - adminCount} employee)`, 10))
    lines.push(textLine(`Tickets: ${tickets.length} total`, 10))
    for (const [status, count] of [...ticketsByStatus.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      lines.push(textLine(`  - ${status}: ${count}`, 9))
    }
    lines.push(textLine(`Active sessions: ${sessionRows.length}`, 10))

    lines.push(heading(`Users (${allUsers.length}), sorted by ID`, 12))
    lines.push(
      ...table(
        ['ID', 'Name', 'Email', 'Role', 'Department'],
        allUsers.map((u) => [u.id, u.name, u.email, u.role, u.department]),
        [5, 20, 28, 12, 14]
      )
    )

    lines.push(heading(`Tickets (${tickets.length}), sorted by ID`, 12))
    lines.push(
      ...table(
        ['ID', 'Title', 'Requester', 'Priority', 'Status', 'Created'],
        tickets.map((t) => [t.id, t.title, t.requester, t.priority, t.status, formatDate(t.createdAt)]),
        [5, 20, 14, 10, 12, 24]
      )
    )

    lines.push(heading(`Active sessions (${sessionRows.length}), sorted by login time`, 12))
    lines.push(
      ...table(['Token', 'User', 'Created'], sessionRows, [12, 22, 24])
    )

    const pdfBuffer = buildPdf(lines)
    const filename = `helpdesk-report-${new Date().toISOString().slice(0, 10)}.pdf`

    return {
      statusCode: 200,
      raw: true,
      contentType: 'application/pdf',
      filename,
      body: pdfBuffer
    }
  }
}
