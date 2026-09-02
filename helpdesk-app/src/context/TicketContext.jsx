import { createContext, useCallback, useEffect, useState } from 'react'
import { ticketService } from '../services/ticketService'

export const TicketContext = createContext(null)

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async (filters) => {
    setLoading(true)
    const data = await ticketService.list(filters)
    setTickets(data)
    setLoading(false)
    return data
  }, [])

  // Refetches tickets in the background (no loading spinner). This is what
  // keeps a status change - e.g. an admin marking a ticket Resolved or Not
  // Resolved - showing up automatically in the Admin Console and in the
  // employee's My Tickets/Dashboard views, without anyone needing to
  // manually reload the page.
  const silentRefresh = useCallback(async () => {
    try {
      const data = await ticketService.list()
      setTickets(data)
    } catch {
      // Ignore transient errors on background polling (e.g. briefly
      // logged out) - the next successful poll will catch up.
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const interval = setInterval(silentRefresh, 8000)
    return () => clearInterval(interval)
  }, [silentRefresh])

  const createTicket = useCallback(
    async (payload) => {
      const ticket = await ticketService.create(payload)
      await refresh()
      return ticket
    },
    [refresh]
  )

  const approveTicket = useCallback(
    async (id) => {
      await ticketService.approve(id)
      await refresh()
    },
    [refresh]
  )

  const rejectTicket = useCallback(
    async (id) => {
      await ticketService.reject(id)
      await refresh()
    },
    [refresh]
  )

  const assignTicket = useCallback(
    async (id, assignee) => {
      await ticketService.assign(id, assignee)
      await refresh()
    },
    [refresh]
  )

  const updateStatus = useCallback(
    async (id, status, resolutionNotes) => {
      await ticketService.updateStatus(id, status, resolutionNotes)
      await refresh()
    },
    [refresh]
  )

  const acceptAndAssign = useCallback(
    async (id, assignee) => {
      await ticketService.acceptAndAssign(id, assignee)
      await refresh()
    },
    [refresh]
  )

  const updateRemarks = useCallback(
    async (id, remarks) => {
      await ticketService.setRemarks(id, remarks)
      await refresh()
    },
    [refresh]
  )

  const value = {
    tickets,
    loading,
    refresh,
    createTicket,
    approveTicket,
    rejectTicket,
    assignTicket,
    updateStatus,
    acceptAndAssign,
    updateRemarks
  }

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>
}
