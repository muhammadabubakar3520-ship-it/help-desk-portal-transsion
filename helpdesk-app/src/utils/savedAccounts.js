// Purely client-side "remembered accounts" list for the login screen's
// account picker (Windows/Gmail style). This never touches the backend or
// users.txt — it only stores what's needed to render the picker (name,
// email, role, last login time) so returning users can skip retyping
// their email.

const STORAGE_KEY = 'helpdesk_saved_accounts'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(accounts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch {
    // localStorage unavailable (private browsing, quota, etc.) — fail silently,
    // the login form still works without the account picker.
  }
}

// Returns saved accounts, most-recently-used first.
export function getSavedAccounts() {
  return readAll().sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin))
}

// Saves/updates a remembered account after a successful login or registration.
export function saveAccount(user) {
  if (!user?.email) return
  const cleanEmail = String(user.email).trim().toLowerCase()
  const accounts = readAll().filter((acc) => acc.email.toLowerCase() !== cleanEmail)
  accounts.push({
    name: user.name || cleanEmail,
    email: cleanEmail,
    role: user.role || '',
    lastLogin: new Date().toISOString()
  })
  writeAll(accounts)
}

// Removes one remembered account from this browser only. Does NOT delete the
// underlying user record from users.txt on the server.
export function removeSavedAccount(email) {
  const cleanEmail = String(email || '').trim().toLowerCase()
  writeAll(readAll().filter((acc) => acc.email.toLowerCase() !== cleanEmail))
}
