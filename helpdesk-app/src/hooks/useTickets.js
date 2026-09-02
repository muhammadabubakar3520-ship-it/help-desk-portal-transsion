import { useContext } from 'react'
import { TicketContext } from '../context/TicketContext'

export function useTickets() {
  const ctx = useContext(TicketContext)
  if (!ctx) throw new Error('useTickets must be used within a TicketProvider')
  return ctx
}
