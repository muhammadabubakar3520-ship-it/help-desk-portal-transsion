import { Boxes } from 'lucide-react'
import ComingSoonPanel from '../components/ComingSoonPanel.jsx'

export default function AssetManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Asset Management</h1>
        <p className="mt-1 text-sm text-slate-500">Track company hardware, software licenses, and assignments.</p>
      </div>
      <ComingSoonPanel
        icon={Boxes}
        title="Asset inventory is on its way"
        description="Soon you'll be able to register devices, assign them to employees, and track warranty and maintenance status here."
      />
    </div>
  )
}
