import { useEffect, useState } from 'react'
import { UserRound, KeyRound } from 'lucide-react'
import { authService } from '../services/authService'
import { initials } from '../utils/helpers'
import { useAuth } from '../hooks/useAuth'
import { SUPER_ADMIN_EMPLOYEE_ID } from '../utils/constants'
import ResetPasswordModal from '../components/ResetPasswordModal'

export default function UserManagement() {
  const { user } = useAuth()
  const isSuperAdmin = user?.employeeId === SUPER_ADMIN_EMPLOYEE_ID

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [resetTarget, setResetTarget] = useState(null)
  const [resetting, setResetting] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    let cancelled = false
    authService.listUsers().then((data) => {
      if (!cancelled) {
        setUsers(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.department || ''}`.toLowerCase().includes(query.toLowerCase())
  )

  async function handleResetPassword(newPassword) {
    setResetting(true)
    try {
      await authService.resetPassword(resetTarget.id, newPassword)
      setFeedback(`Password updated for ${resetTarget.name}.`)
      setResetTarget(null)
    } catch (err) {
      setFeedback(err.message || 'Could not reset the password.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">Directory of every employee and admin registered on the platform.</p>
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or department..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {feedback && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-ink-700">
          {feedback}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-enterprise">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Email</th>
                {isSuperAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={isSuperAdmin ? 5 : 4} className="px-5 py-6 text-center text-sm text-slate-400">
                    Loading users...
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white">
                          {initials(account.name)}
                        </span>
                        <span className="font-medium text-ink-900">{account.name}</span>
                      </div>
                    </td>
                    <td className="capitalize text-ink-700">{account.role}</td>
                    <td className="text-slate-600">{account.department || '—'}</td>
                    <td className="text-slate-500">{account.email}</td>
                    {isSuperAdmin && (
                      <td>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
                          onClick={() => {
                            setFeedback('')
                            setResetTarget(account)
                          }}
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Reset password
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={isSuperAdmin ? 5 : 4} className="px-5 py-6 text-center text-sm text-slate-400">
                    <UserRound className="mx-auto mb-2 h-5 w-5 text-slate-300" />
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isSuperAdmin && (
        <ResetPasswordModal
          account={resetTarget}
          submitting={resetting}
          onCancel={() => setResetTarget(null)}
          onSubmit={handleResetPassword}
        />
      )}
    </div>
  )
}
