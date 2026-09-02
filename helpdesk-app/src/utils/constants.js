export const ROLES = {
  EMPLOYEE: 'employee',
  ADMIN: 'admin'
}

// The one account allowed to reset another user's password (any employee
// or admin) - Mughees Khalid. This only controls whether the UI shows the
// "Reset Password" action; the server (see requireSuperAdmin in
// helpdesk-server/routes/auth.js) enforces the same check independently,
// so this being client-side is not itself a security boundary.
export const SUPER_ADMIN_EMPLOYEE_ID = '19221160'

export const TICKET_STATUS = {
  NEWLY_CREATED: 'Newly Created',
  OPEN: 'Open',
  PENDING_APPROVAL: 'Pending Approval',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected'
}

export const TICKET_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
}

// Priority indicator colors
const badgeBase = 'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset'
export const PRIORITY_STYLES = {
  Low: { bar: 'bg-signal-teal', badge: `${badgeBase} bg-emerald-50 text-emerald-700 ring-emerald-200` },
  Medium: { bar: 'bg-brand-accent', badge: `${badgeBase} bg-sky-50 text-sky-700 ring-sky-200` },
  High: { bar: 'bg-signal-amber', badge: `${badgeBase} bg-amber-50 text-amber-700 ring-amber-200` },
  Urgent: { bar: 'bg-signal-coral', badge: `${badgeBase} bg-red-50 text-red-700 ring-red-200` }
}

// Status badges — exact spec mapping:
// Newly Created (Purple), Pending (Yellow), Approved/Resolved (Green), In Progress (Blue), Rejected (Red), Closed (Gray)
export const STATUS_STYLES = {
  'Newly Created': 'badge-newly-created',
  Open: 'badge-open',
  'Pending Approval': 'badge-pending',
  'In Progress': 'badge-progress',
  Resolved: 'badge-approved',
  Closed: 'badge-closed',
  Rejected: 'badge-rejected'
}

export const TICKET_CATEGORIES = [
  'Hardware',
  'Software',
  'Network',
  'Access Request',
  'Account',
  'Other'
]

// Sidebar navigation, grouped by role
export const NAV_ITEMS = {
  employee: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Create Ticket', path: '/create-ticket', icon: 'CirclePlus' },
    { label: 'My Tickets', path: '/my-tickets', icon: 'Ticket' },
    { label: 'Notifications', path: '/notifications', icon: 'Bell' },
    { label: 'Settings', path: '/settings', icon: 'Settings' }
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Admin Console', path: '/admin', icon: 'ShieldCheck' },
    { label: 'My Tickets', path: '/my-tickets', icon: 'Ticket' },
    { label: 'Ticket Approval', path: '/ticket-approval', icon: 'CheckCircle2' },
    { label: 'Department Requests', path: '/department-requests', icon: 'Building2' },
    { label: 'Reports', path: '/reports', icon: 'BarChart3' },
    { label: 'User Management', path: '/user-management', icon: 'Users' }
  ]
}
