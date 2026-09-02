# Help Desk Portal — TRANSSION HOLDINGS

This project is **two separate programs that must both be running at the
same time**:

| Folder            | What it is                          | Runs on                 |
|--------------------|--------------------------------------|--------------------------|
| `helpdesk-server`  | Backend API (plain Node.js, no deps) | http://localhost:4000    |
| `helpdesk-app`     | Frontend website (React + Vite)      | http://localhost:5173    |

## ⚠️ Why "opening index.html" shows a blank page

This is **not** a plain HTML website you can double-click to open. It's a
React application built with Vite. Modern browsers block JavaScript modules
and stylesheets from loading when a page is opened directly from disk
(`file://...`) — you'll get a blank white screen with CORS errors in the
console, and no obvious error message. This is a browser security rule, not
a bug, and it can't be worked around by editing the code — the site has to
be served over `http://` by a real (even if local) web server, which is
exactly what the steps below do.

## ✅ How to run it

You need [Node.js](https://nodejs.org) 18+ installed. Then:

### Easiest — one command

- **Mac/Linux:** double-click `start.sh`, or run `./start.sh` in a terminal
- **Windows:** double-click `start.bat`

This installs whatever is missing and starts both the backend and the
frontend, then opens your browser automatically to the login page.
Leave both terminal windows open while you use the site — closing them
stops the servers.

### Manual — two terminals

```bash
# Terminal 1 — backend API
cd helpdesk-server
npm install
npm start

# Terminal 2 — frontend
cd helpdesk-app
npm install
npm run dev
```

Then open the URL Vite prints (normally http://localhost:5173).

## First login

There are no seeded demo accounts other than the built-in default admin
(see `helpdesk-server/routes/auth.js`). Click **"Create one"** on the login
page to register a new account, or sign in with an account already created
in `helpdesk-server/data/users.txt`.

## Ticket assignment & resolution rules

- Only **Mughees Khalid** (matched by Employee ID `19221160`, the same
  account used for password resets) can hand a ticket to another admin.
  When he opens an unassigned/newly-created ticket, he sees a dropdown/list
  of every other admin's name to assign it to. Every other admin only ever
  sees "Assign to myself."
- Whoever a ticket is assigned to is the only person who can mark it
  **Resolved** — enforced on the server (`PATCH /api/tickets/:id/status`),
  not just hidden in the UI, so no one (not even Mughees Khalid himself)
  can resolve a ticket assigned to someone else.

## Notes on this copy

- `node_modules/` was **removed** from `helpdesk-app` before this was
  zipped up. It previously shipped with only Linux/Windows x64 native
  binaries baked in (for the `esbuild`/Vite toolchain) — on any other
  machine (e.g. a Mac, or Windows/Linux ARM), `npm run dev` would fail to
  start with no visible error, which looks exactly like "no output." Run
  `npm install` fresh (or just use the start script) so npm fetches the
  correct binaries for whatever machine you're on.
- `helpdesk-app/.env` was added (copied from `.env.example`) so the
  frontend has an explicit, guaranteed API URL instead of relying on a
  fallback default.
