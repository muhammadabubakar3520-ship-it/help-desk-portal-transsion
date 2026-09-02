import { useState } from 'react'

// Super-admin-only action (see SUPER_ADMIN_EMPLOYEE_ID in utils/constants.js):
// lets Mughees Khalid set a new password for any employee or admin account.
// The server independently re-checks this permission on every submit, so
// this modal being reachable in the UI is not itself the security boundary.
export default function ResetPasswordModal({ account, onSubmit, onCancel, submitting }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  if (!account) return null

  async function handleSubmit(event) {
    event.preventDefault()
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    await onSubmit(newPassword)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-ink-950/40" onClick={onCancel} aria-hidden="true" />
      <div className="card relative w-full max-w-md p-5 sm:p-6">
        <div className="mb-4">
          <span className="font-mono text-xs text-slate-400">{account.employeeId}</span>
          <h2 className="mt-0.5 text-base font-semibold text-ink-900">Reset password: {account.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Set a new password for this account. They'll need to sign in with it next time - this
            does not notify them automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-ink-800">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              className="input-field"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="mb-1.5 block text-sm font-medium text-ink-800">
              Confirm new password
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              className="input-field"
              placeholder="Re-enter the new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p className="mt-1.5 text-xs text-signal-coral">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Reset password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
