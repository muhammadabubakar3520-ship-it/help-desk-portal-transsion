import { api } from './api'

// Talks to the real backend (see /helpdesk-server) instead of an
// in-memory mock array, so tickets now persist on the server and are
// shared across everyone using the app.

function toQueryString(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.requester) params.set('requester', filters.requester)
  if (filters.assignee) params.set('assignee', filters.assignee)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export const ticketService = {
  async list(filters = {}) {
    return api.get(`/tickets${toQueryString(filters)}`)
  },

  async getById(id) {
    return api.get(`/tickets/${id}`)
  },

  async create(payload) {
    return api.post('/tickets', payload)
  },

  async updateStatus(id, status, resolutionNotes) {
    return api.patch(`/tickets/${id}/status`, { status, resolutionNotes })
  },

  async assign(id, assignee) {
    return api.patch(`/tickets/${id}/assign`, { assignee })
  },

  // General admin overview/remarks on a ticket - can be added or updated at
  // any point, independent of status, and is shown to the employee who
  // raised the ticket.
  async setRemarks(id, remarks) {
    return api.patch(`/tickets/${id}/remarks`, { remarks })
  },

  async approve(id) {
    return api.post(`/tickets/${id}/approve`)
  },

  async reject(id) {
    return api.post(`/tickets/${id}/reject`)
  },

  async acceptAndAssign(id, assignee) {
    return api.post(`/tickets/${id}/accept-and-assign`, { assignee })
  }
}
