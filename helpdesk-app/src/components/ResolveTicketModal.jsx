import { useState } from 'react'
import { ticketId } from '../utils/helpers'

export default function ResolveTicketModal({ ticket, onSubmit, onCancel, submitting }) {
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  if (!ticket) return null

  async function handleSubmit(event) {
    event.preventDefault()
    if (!notes.trim()) {
      setError('Add a short remark describing how this was resolved.')
      return
    }
    setError('')
    await onSubmit(notes.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink-950/40" onClick={onCancel} aria-hidden="true" />
      <div className="card relative w-full max-w-md p-5 sm:p-6">
        <div className="mb-4">
          <span className="font-mono text-xs text-slate-400">{ticketId(ticket.id)}</span>
          <h2 className="mt-0.5 text-base font-semibold text-ink-900">Resolve: {ticket.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add a remark explaining how the issue was solved. This will be visible to the employee who
            submitted the ticket.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="resolutionNotes" className="mb-1.5 block text-sm font-medium text-ink-800">
              Resolution remarks
            </label>
            <textarea
              id="resolutionNotes"
              rows={4}
              className="input-field resize-none"
              placeholder="e.g. Replaced the network cable and confirmed the connection is stable."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              autoFocus
            />
            {error && <p className="mt-1.5 text-xs text-signal-coral">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Mark resolved'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
