import { Bell } from 'lucide-react'
import ComingSoonPanel from '../components/ComingSoonPanel.jsx'

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Notifications</h1>
        <p className="mt-1 text-sm text-slate-500">A full history of approvals, alerts, and system announcements.</p>
      </div>
      <ComingSoonPanel
        icon={Bell}
        title="Notification center in progress"
        description="For now, check the bell icon in the top navigation for your latest alerts."
      />
    </div>
  )
}
