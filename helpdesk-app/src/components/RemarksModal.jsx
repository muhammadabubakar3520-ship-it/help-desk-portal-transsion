import { useState } from 'react'
import { ticketId } from '../utils/helpers'

export default function RemarksModal({ ticket, onSubmit, onCancel, submitting }) {
  const [notes, setNotes] = useState(ticket?.adminRemarks || '')
  const [error, setError] = useState('')

  if (!ticket) return null

  async function handleSubmit(event) {
    event.preventDefault()
    if (!notes.trim()) {
      setError('Add a short remark or overview before saving.')
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
          <h2 className="mt-0.5 text-base font-semibold text-ink-900">Remarks: {ticket.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Leave a short overview or update on this ticket. This is visible to the employee who
            submitted it, and can be updated any time regardless of status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="adminRemarks" className="mb-1.5 block text-sm font-medium text-ink-800">
              Remarks / overview
            </label>
            <textarea
              id="adminRemarks"
              rows={4}
              className="input-field resize-none"
              placeholder="e.g. Picked this up, waiting on a part to arrive - will update by Friday."
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
              {submitting ? 'Saving...' : 'Save remarks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
