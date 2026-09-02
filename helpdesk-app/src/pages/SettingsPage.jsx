import { Settings } from 'lucide-react'
import ComingSoonPanel from '../components/ComingSoonPanel.jsx'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your profile, notification preferences, and security options.</p>
      </div>
      <ComingSoonPanel
        icon={Settings}
        title="Account settings coming soon"
        description="Profile details, password changes, and notification preferences will be configurable from here."
      />
    </div>
  )
}
