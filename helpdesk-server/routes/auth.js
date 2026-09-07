import { readUsers, writeUsers } from '../lib/db.js'
import { hashPassword, verifyPassword, createSession, destroySession, getUserIdForToken, initSessionCache } from '../lib/auth.js'
import { HttpError } from '../lib/http.js'

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user
  return publicUser
}

// Export initSessionCache for server startup
export { initSessionCache }

// ---------------------------------------------------------------------------
// Built-in default admin
//
// This one account is hardcoded into the backend so there is always at
// least one working admin login, even on a brand-new/empty data store (e.g.
// after a fresh deploy where data/users.txt hasn't been created yet). It is
// seeded once on server startup (see ensureDefaultAdmin, called from
// index.js) and is looked up by Employee ID rather than email.
//
// Everyone else who signs up through the website's Register page is always
// created with role "employee" - see register() below, which ignores any
// role value sent from the client.
const DEFAULT_ADMIN = {
  employeeId: '19222951',
  name: 'Muhammad Abubakar',
  email: 'm.abubakar@transsion.com',
  password: 'Abubakar1921@',
  department: 'IT'
}

export async function ensureDefaultAdmin() {
  const users = await readUsers()
  const already = users.find((u) => u.employeeId === DEFAULT_ADMIN.employeeId)

  if (already) {
    // Keep it locked to admin even if the record was somehow edited.
    if (already.role !== 'admin') {
      already.role = 'admin'
      await writeUsers(users)
    }
    return
  }

  const user = {
    id: nextId(users),
    employeeId: DEFAULT_ADMIN.employeeId,
    name: DEFAULT_ADMIN.name,
    email: DEFAULT_ADMIN.email,
    passwordHash: hashPassword(DEFAULT_ADMIN.password),
    role: 'admin',
    department: DEFAULT_ADMIN.department,
    createdAt: new Date().toISOString()
  }

  users.push(user)
  await writeUsers(users)
}

// ---------------------------------------------------------------------------
// Legacy accounts
//
// Accounts created before this Employee-ID login system existed don't have
// an employeeId on file, and login is now Employee ID + password only - so
// without this they'd be locked out. On every boot, any user missing an
// employeeId gets one generated (EMP + their numeric user id, e.g. EMP002).
// This runs once per user; already-migrated accounts are left untouched.
export async function ensureLegacyEmployeeIds() {
  const users = await readUsers()
  let changed = false
  for (const user of users) {
    if (!user.employeeId) {
      user.employeeId = `EMP${String(user.id).padStart(3, '0')}`
      changed = true
    }
  }
  if (changed) await writeUsers(users)
}

export function requireUser(req) {
  const token = req.token
  const userId = getUserIdForToken(token)
  if (!userId) throw new HttpError(401, 'Not authenticated')
  // Note: This function is called synchronously but we need to fetch users
  // For now, we'll need to handle this differently - see routes below
  return userId
}

export function requireAdmin(req) {
  const userId = requireUser(req)
  // Note: Role checking is done in the actual route handlers after fetching users
  return userId
}

// ---------------------------------------------------------------------------
// Password administration
//
// Resetting someone else's password is more sensitive than ordinary admin
// actions (it can lock the real owner out and hand control of their account
// to whoever did the reset), so it isn't granted to every admin. It's scoped
// to one named account - Mughees Khalid (Employee ID 19221160) - the same
// way the built-in default admin above is identified: by Employee ID, not by
// a role, so it can't be gained by editing a "role" field on disk.
const SUPER_ADMIN_EMPLOYEE_ID = '19221160' // Mughees Khalid

export function isSuperAdmin(user) {
  return Boolean(user && user.employeeId === SUPER_ADMIN_EMPLOYEE_ID)
}

export function requireSuperAdmin(req) {
  const user = requireAdmin(req)
  if (!isSuperAdmin(user)) {
    throw new HttpError(403, 'Only Mughees Khalid can reset another account\'s password')
  }
  return user
}

export const authRoutes = {
  async register(req) {
    const { name, employeeId, password, department } = req.body || {}

    const cleanName = String(name || '').trim()
    const cleanEmployeeId = String(employeeId || '').trim()

    if (!cleanName || !cleanEmployeeId || !password) {
      throw new HttpError(400, 'Name, Employee ID, and password are required')
    }
    if (String(password).length < 6) {
      throw new HttpError(400, 'Password must be at least 6 characters')
    }

    const users = await readUsers()
    if (users.some((u) => u.employeeId && u.employeeId.toLowerCase() === cleanEmployeeId.toLowerCase())) {
      throw new HttpError(409, 'An account with this Employee ID already exists')
    }

    // The website no longer collects an email address at signup (login is
    // Employee ID + password only), but a handful of internal screens
    // (User Management, ticket records) still display/store a `email`
    // field on the user record, so one is generated here rather than
    // reworking that plumbing.
    const generatedEmail = `${cleanEmployeeId.toLowerCase()}@transsion.com`

    // Self-service signups are always employees, no matter what (if
    // anything) the client sends. The only admin account is the hardcoded
    // one seeded by ensureDefaultAdmin() below.
    const user = {
      id: nextId(users),
      employeeId: cleanEmployeeId,
      name: cleanName,
      email: generatedEmail,
      role: 'employee',
      department: String(department || '').trim() || 'General',
      passwordHash: hashPassword(String(password)),
      createdAt: new Date().toISOString()
    }

    users.push(user)
    await writeUsers(users)

    const token = await createSession(user.id)
    return { statusCode: 201, body: { user: toPublicUser(user), token } }
  },

  async login(req) {
    // Everyone signs in with their Employee ID + password - never email.
    const { identifier, employeeId, password } = req.body || {}
    const cleanIdentifier = String(identifier || employeeId || '').trim().toLowerCase()

    if (!cleanIdentifier || !password) {
      throw new HttpError(400, 'Invalid Employee ID or password')
    }

    const users = await readUsers()
    const user = users.find((u) => u.employeeId && u.employeeId.toLowerCase() === cleanIdentifier)
    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      throw new HttpError(401, 'Invalid Employee ID or password')
    }

    const token = await createSession(user.id)
    return { statusCode: 200, body: { user: toPublicUser(user), token } }
  },

  async logout(req) {
    if (req.token) await destroySession(req.token)
    return { statusCode: 200, body: { ok: true } }
  },

  async session(req) {
    const userId = requireUser(req)
    const users = await readUsers()
    const user = users.find((u) => u.id === userId)
    if (!user) throw new HttpError(401, 'Not authenticated')
    return { statusCode: 200, body: { user: toPublicUser(user) } }
  },

  async listUsers(req) {
    const userId = requireUser(req) // must be signed in to view the directory
    const users = await readUsers()
    const requester = users.find((u) => u.id === userId)
    if (!requester) throw new HttpError(401, 'Not authenticated')
    
    // The staff directory (User Management page, Admin dashboard "User
    // Directory" panel) is only meant to show the fixed roster of approved
    // staff, not every account. Self-service signups via Register are
    // always created with role "employee" (see register() above) and are
    // deliberately excluded here so a new employee logging in doesn't add
    // their name to this list - only the pre-approved admin accounts show.
    //
    // Exception: the super admin (see requireSuperAdmin below) also needs
    // to find employee accounts in order to reset their passwords, so they
    // get the full roster instead of the admins-only view.
    const directoryUsers = isSuperAdmin(requester) ? users : users.filter((u) => u.role === 'admin')
    return { statusCode: 200, body: directoryUsers.map(toPublicUser) }
  },

  // POST /api/admin/users/:id/reset-password - super-admin-only. Lets
  // Mughees Khalid set a new password for any employee or admin account
  // (including other admins) without needing to know their current one -
  // e.g. when someone is locked out. Everyone else gets a 403 from
  // requireSuperAdmin before any user data is touched.
  async resetPassword(req, targetId) {
    const userId = requireUser(req)
    const users = await readUsers()
    const requester = users.find((u) => u.id === userId)
    if (!requester) throw new HttpError(401, 'Not authenticated')
    if (requester.role !== 'admin') throw new HttpError(403, 'Admins only')
    if (!isSuperAdmin(requester)) {
      throw new HttpError(403, 'Only Mughees Khalid can reset another account\'s password')
    }

    const id = Number(targetId)
    const { newPassword } = req.body || {}
    if (!newPassword || String(newPassword).length < 6) {
      throw new HttpError(400, 'New password must be at least 6 characters')
    }

    const target = users.find((u) => u.id === id)
    if (!target) throw new HttpError(404, 'User not found')

    target.passwordHash = hashPassword(String(newPassword))
    await writeUsers(users)

    return { statusCode: 200, body: { ok: true, user: toPublicUser(target) } }
  }
}
