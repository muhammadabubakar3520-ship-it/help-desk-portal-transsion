import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TicketForm from '../components/TicketForm.jsx'
import { useAuth } from '../hooks/useAuth'
import { useTickets } from '../hooks/useTickets'

export default function CreateTicket() {
  const { user } = useAuth()
  const { createTicket } = useTickets()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(form) {
    setSubmitting(true)
    try {
      await createTicket({ ...form, requester: user.name })
      setSuccess(true)
      setTimeout(() => navigate('/my-tickets'), 900)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Create a Ticket</h1>
        <p className="mt-1 text-sm text-slate-500">
          Give as much detail as you can so it reaches the right person the first time.
        </p>
      </div>

      {success && (
        <div className="badge-approved w-fit px-4 py-2.5 text-sm">
          Ticket submitted. Redirecting to your tickets...
        </div>
      )}

      <TicketForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  )
}
