import { useState } from 'react'
import { TICKET_CATEGORIES, TICKET_PRIORITY } from '../utils/constants'

const emptyForm = {
  title: '',
  category: TICKET_CATEGORIES[0],
  priority: TICKET_PRIORITY.MEDIUM,
  description: ''
}

export default function TicketForm({ onSubmit, submitting }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    const next = {}
    if (!form.title.trim()) next.title = 'Give the ticket a short, clear title.'
    if (!form.description.trim()) next.description = 'Describe the issue so it can be triaged.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    await onSubmit(form)
    setForm(emptyForm)
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-5 sm:p-6">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-ink-800">
          Title
        </label>
        <input
          id="title"
          type="text"
          className="input-field"
          placeholder="e.g. Monitor flickering on second display"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
        />
        {errors.title && <p className="mt-1.5 text-xs text-signal-coral">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-ink-800">
            Category
          </label>
          <select
            id="category"
            className="input-field"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
          >
            {TICKET_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="mb-1.5 block text-sm font-medium text-ink-800">
            Priority
          </label>
          <select
            id="priority"
            className="input-field"
            value={form.priority}
            onChange={(e) => update('priority', e.target.value)}
          >
            {Object.values(TICKET_PRIORITY).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink-800">
          Description
        </label>
        <textarea
          id="description"
          rows={5}
          className="input-field resize-none"
          placeholder="What's happening? Include steps to reproduce, error messages, or when it started."
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
        />
        {errors.description && <p className="mt-1.5 text-xs text-signal-coral">{errors.description}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button type="reset" className="btn-secondary" onClick={() => setForm(emptyForm)}>
          Clear
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit ticket'}
        </button>
      </div>
    </form>
  )
}
