// Central HTTP client. Every service (auth, tickets) funnels through this
// file, so it's the only place that needs to know the backend's URL, how
// to attach the auth token, and how to unwrap error responses.

const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:4000/api'

const TOKEN_KEY = 'helpdesk_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  } catch (err) {
    // The browser's raw "Failed to fetch" / "NetworkError" means the request
    // never reached a server at all - almost always because the backend
    // (helpdesk-server) isn't running, or VITE_API_BASE_URL points somewhere
    // nothing is listening. Surface something actionable instead.
    throw new Error(
      `Can't reach the server at ${BASE_URL}. Make sure the backend is running ` +
        `(cd helpdesk-server && npm install && npm start) and that VITE_API_BASE_URL ` +
        `points at it.`
    )
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`)
  }

  return data
}

// For endpoints that return a file (e.g. the admin PDF export) instead of
// JSON. Fetches it as a blob, using the same auth header as every other
// request, then triggers a normal browser "Save As" download. A plain
// `<a href="...">` can't be used here because the endpoint requires the
// Authorization header - only fetch() can attach that.
async function download(path, fallbackFilename) {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, { headers })
  } catch (err) {
    throw new Error(
      `Can't reach the server at ${BASE_URL}. Make sure the backend is running ` +
        `(cd helpdesk-server && npm install && npm start).`
    )
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Download failed (${response.status})`)
  }

  const disposition = response.headers.get('Content-Disposition') || ''
  const match = disposition.match(/filename="([^"]+)"/)
  const filename = match ? match[1] : fallbackFilename

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const api = {
  baseUrl: BASE_URL,
  token: {
    get: getToken,
    set: setToken,
    clear: () => setToken(null)
  },
  get(path) {
    return request('GET', path)
  },
  post(path, body) {
    return request('POST', path, body)
  },
  patch(path, body) {
    return request('PATCH', path, body)
  },
  download(path, fallbackFilename) {
    return download(path, fallbackFilename)
  }
}
