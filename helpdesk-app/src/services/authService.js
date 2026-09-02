import { api } from './api'

// Talks to the real backend (see /helpdesk-server) instead of storing
// users in this browser's localStorage. The only thing kept client-side
// now is the session token, so the account data itself (name, email,
// role, hashed password) lives on the server and is shared across every
// browser/device that signs in.

export const authService = {
  async register({ name, employeeId, password, department }) {
    const data = await api.post('/auth/register', { name, employeeId, password, department })
    api.token.set(data.token)
    return data
  },

  async login(identifier, password) {
    const data = await api.post('/auth/login', { identifier, password })
    api.token.set(data.token)
    return data
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      api.token.clear()
    }
  },

  // Validates the stored token against the server and returns the current
  // session, or null if there isn't one / it's no longer valid.
  async getSession() {
    if (!api.token.get()) return null
    try {
      const { user } = await api.get('/auth/session')
      return { user, token: api.token.get() }
    } catch {
      api.token.clear()
      return null
    }
  },

  async listUsers() {
    return api.get('/users')
  },

  // Super-admin-only (Mughees Khalid): sets a new password for any
  // employee or admin account. The server re-checks this permission on
  // every call, so a non-super-admin token gets a 403 no matter what the
  // UI shows.
  async resetPassword(userId, newPassword) {
    return api.post(`/admin/users/${userId}/reset-password`, { newPassword })
  }
}
