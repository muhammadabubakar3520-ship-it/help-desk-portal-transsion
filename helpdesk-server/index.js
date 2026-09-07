import 'dotenv/config.js'
import http from 'node:http'
import { URL } from 'node:url'
import { readJsonBody, sendJson, sendBinary, applyCors, getBearerToken, HttpError } from './lib/http.js'
import { authRoutes, ensureDefaultAdmin, ensureLegacyEmployeeIds, initSessionCache } from './routes/auth.js'
import { ticketRoutes } from './routes/tickets.js'
import { exportRoutes } from './routes/export.js'
import { initStorage } from './lib/db.js'

const PORT = process.env.PORT || 4000

// Initialize application with async MongoDB connection
async function startServer() {
  try {
    // Initialize MongoDB and ensure collections/indexes exist
    await initStorage()

    // Initialize session cache from database
    await initSessionCache()

    // Make sure the hardcoded default admin account exists, and that any
    // pre-existing account without an Employee ID gets one assigned. Both are
    // safe to call on every boot - they no-op once done.
    await ensureDefaultAdmin()
    await ensureLegacyEmployeeIds()

    // path pattern -> handler. `:id` segments are captured into req.params.
    const routes = [
      { method: 'POST', pattern: '/api/auth/register', handler: authRoutes.register },
      { method: 'POST', pattern: '/api/auth/login', handler: authRoutes.login },
      { method: 'POST', pattern: '/api/auth/logout', handler: authRoutes.logout },
      { method: 'GET', pattern: '/api/auth/session', handler: authRoutes.session },
      { method: 'GET', pattern: '/api/users', handler: authRoutes.listUsers },
      { method: 'POST', pattern: '/api/admin/users/:id/reset-password', handler: (req, params) => authRoutes.resetPassword(req, params.id) },

      { method: 'GET', pattern: '/api/tickets', handler: ticketRoutes.list },
      { method: 'GET', pattern: '/api/tickets/:id', handler: (req, params) => ticketRoutes.getById(req, params.id) },
      { method: 'POST', pattern: '/api/tickets', handler: ticketRoutes.create },
      { method: 'PATCH', pattern: '/api/tickets/:id/status', handler: (req, params) => ticketRoutes.updateStatus(req, params.id) },
      { method: 'PATCH', pattern: '/api/tickets/:id/assign', handler: (req, params) => ticketRoutes.assign(req, params.id) },
      { method: 'PATCH', pattern: '/api/tickets/:id/remarks', handler: (req, params) => ticketRoutes.setRemarks(req, params.id) },
      { method: 'POST', pattern: '/api/tickets/:id/approve', handler: (req, params) => ticketRoutes.approve(req, params.id) },
      { method: 'POST', pattern: '/api/tickets/:id/reject', handler: (req, params) => ticketRoutes.reject(req, params.id) },
      { method: 'POST', pattern: '/api/tickets/:id/accept-and-assign', handler: (req, params) => ticketRoutes.acceptAndAssign(req, params.id) },

      { method: 'GET', pattern: '/api/admin/export.pdf', handler: exportRoutes.pdf }
    ]

    function matchRoute(method, pathname) {
      const pathParts = pathname.split('/').filter(Boolean)
      for (const route of routes) {
        if (route.method !== method) continue
        const patternParts = route.pattern.split('/').filter(Boolean)
        if (patternParts.length !== pathParts.length) continue

        const params = {}
        const isMatch = patternParts.every((part, i) => {
          if (part.startsWith(':')) {
            params[part.slice(1)] = pathParts[i]
            return true
          }
          return part === pathParts[i]
        })

        if (isMatch) return { route, params }
      }
      return null
    }

    const server = http.createServer(async (req, res) => {
      applyCors(req, res)

      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        return res.end()
      }

      const url = new URL(req.url, `http://${req.headers.host}`)
      const match = matchRoute(req.method, url.pathname)

      if (!match) {
        return sendJson(res, 404, { error: 'Not found' })
      }

      try {
        const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readJsonBody(req) : {}
        const query = Object.fromEntries(url.searchParams.entries())
        const token = getBearerToken(req)

        const request = { body, query, token, headers: req.headers }
        const result = await match.route.handler(request, match.params)

        if (result.raw) {
          sendBinary(res, result.statusCode, result.body, result.contentType, result.filename)
        } else {
          sendJson(res, result.statusCode, result.body)
        }
      } catch (err) {
        if (err instanceof HttpError) {
          sendJson(res, err.statusCode, { error: err.message })
        } else {
          console.error(err)
          sendJson(res, 500, { error: 'Internal server error' })
        }
      }
    })

    server.listen(PORT, () => {
      console.log(`✅ Help Desk API listening on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
