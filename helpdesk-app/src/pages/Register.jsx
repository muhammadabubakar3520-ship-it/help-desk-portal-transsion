import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import Logo from '../assets/logo.jsx'
import { useAuth } from '../hooks/useAuth'

// Checks that the full name looks like a real name
function validateFullName(raw) {
  const name = raw.trim().replace(/\s+/g, ' ')
  if (!name) return 'Please enter your full name.'
  if (name.length < 5) return 'Full name is too short.'
  if (name.length > 50) return 'Full name is too long.'
  if (!/^[A-Za-z][A-Za-z.' -]*$/.test(name))
    return 'Name can contain only letters and spaces (no numbers or symbols).'
  const words = name.split(' ').filter((w) => /[A-Za-z]/.test(w))
  if (words.length < 2) return 'Please enter your first and last name (e.g. Bilal Ahmed).'
  if (!words.some((w) => w.replace(/[.'-]/g, '').length >= 3))
    return 'Please enter your complete name, not initials only.'
  if (/(.)\1\1/i.test(name.replace(/\s/g, ''))) return 'Please enter your real name.'
  return ''
}

// Cleans the name: "bilal   ahmed" -> "Bilal Ahmed"
function formatName(raw) {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [department, setDepartment] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [nameError, setNameError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const nameProblem = validateFullName(name)
    if (nameProblem) {
      setNameError(nameProblem)
      setError(nameProblem)
      return
    }
    const cleanName = formatName(name)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      await register({ name: cleanName, employeeId: employeeId.trim(), password, department: department.trim() })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Unable to create account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center lg:hidden">
        <Logo className="h-11 w-11" />
        <h1 className="mt-4 text-xl font-semibold text-ink-900">TRANSSION HOLDINGS</h1>
        <p className="mt-1 text-sm text-slate-500">Create your help desk account</p>
      </div>

      <div className="hidden lg:block">
        <h2 className="text-2xl font-semibold text-ink-900">Create an account</h2>
        <p className="mt-1.5 text-sm text-slate-500">Sign up for employee access.</p>
      </div>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6 sm:p-7">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-800">
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            autoComplete="name"
            maxLength={50}
            className="input-field"
            placeholder="Bilal Ahmed"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) setNameError('')
            }}
            onBlur={() => {
              if (!name.trim()) return
              const problem = validateFullName(name)
              setNameError(problem)
              if (!problem) setName(formatName(name))
            }}
          />
          {nameError ? (
            <p className="mt-1 text-xs font-medium text-signal-coral">{nameError}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">Enter your first and last name as on your company ID.</p>
          )}
        </div>

        <div>
          <label htmlFor="employeeId" className="mb-1.5 block text-sm font-medium text-ink-800">
            Employee ID
          </label>
          <input
            id="employeeId"
            type="text"
            required
            className="input-field"
            placeholder="e.g. 19222951"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-ink-800">
            Department <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="department"
            type="text"
            className="input-field"
            placeholder="IT Support"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-800">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="input-field"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-ink-800">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            className="input-field"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm font-medium text-signal-coral">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          <UserPlus className="h-4 w-4" />
          {submitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
