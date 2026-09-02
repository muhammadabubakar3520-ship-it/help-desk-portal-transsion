import { useMemo, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import MiniBarChart from '../components/charts/MiniBarChart.jsx'
import MiniDonutChart from '../components/charts/MiniDonutChart.jsx'
import { reportService } from '../services/reportService'
import { useTickets } from '../hooks/useTickets'
import { TICKET_STATUS } from '../utils/constants'

export default function Reports() {
  const { tickets } = useTickets()
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')

  const byCategory = useMemo(() => {
    const palette = ['#005BAC', '#00A3E0', '#16A34A', '#F59E0B', '#7C6CF0', '#DC2626']
    const counts = {}
    tickets.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1
    })
    return Object.entries(counts).map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }))
  }, [tickets])

  const byStatus = useMemo(() => {
    const counts = {}
    tickets.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1
    })
    const colors = {
      [TICKET_STATUS.OPEN]: '#2563EB',
      [TICKET_STATUS.PENDING_APPROVAL]: '#F59E0B',
      [TICKET_STATUS.IN_PROGRESS]: '#00A3E0',
      [TICKET_STATUS.RESOLVED]: '#16A34A',
      [TICKET_STATUS.CLOSED]: '#94A3B8',
      [TICKET_STATUS.REJECTED]: '#DC2626'
    }
    return Object.entries(counts).map(([label, value]) => ({ label, value, color: colors[label] || '#005BAC' }))
  }, [tickets])

  const resolutionRate = useMemo(() => {
    if (tickets.length === 0) return 0
    const resolved = tickets.filter((t) => t.status === TICKET_STATUS.RESOLVED).length
    return Math.round((resolved / tickets.length) * 100)
  }, [tickets])

  async function handleDownload() {
    setDownloading(true)
    setError('')
    try {
      await reportService.downloadAdminReport()
    } catch (err) {
      setError(err.message || 'Failed to generate the report')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Analytics across ticket categories, statuses, and resolution performance.</p>
        </div>
        <div className="text-right">
          <button type="button" onClick={handleDownload} disabled={downloading} className="btn-primary">
            <Download className="h-4 w-4" />
            {downloading ? 'Preparing PDF...' : 'Export PDF'}
          </button>
          {error && <p className="mt-1 text-xs text-signal-coral">{error}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Tickets</p>
          <p className="font-display text-3xl font-bold text-ink-900">{tickets.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resolution Rate</p>
          <p className="font-display text-3xl font-bold text-emerald-600">{resolutionRate}%</p>
        </div>
        <div className="stat-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categories Tracked</p>
          <p className="font-display text-3xl font-bold text-ink-900">{byCategory.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-primary" />
            <h2 className="text-sm font-semibold text-ink-900">Department-wise / Category Requests</h2>
          </div>
          {byCategory.length > 0 ? (
            <MiniBarChart data={byCategory} width={560} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No data yet</p>
          )}
        </div>
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Ticket Categories by Status</h2>
          {byStatus.length > 0 ? (
            <MiniDonutChart data={byStatus} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No data yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
