# Help Desk API (backend)

A small REST API for the Help Desk Portal. It has **zero external
dependencies** - it only uses Node.js's built-in `http` and `crypto`
modules - so there's nothing to `npm install` beyond Node itself.

## Storage

Data is stored in human-readable plain-text (`.txt`) files inside `data/`
(created automatically the first time the server runs):

- `data/users.txt` - registered accounts (employee/engineer/admin), one
  block per user. Passwords are **never stored in plain text** - each one
  is hashed with scrypt (a salted, slow hash function) using Node's
  built-in `crypto` module, and only the hash is written to disk.
- `data/tickets.txt` - all help desk tickets, one block per ticket.
- `data/sessions.txt` - active login tokens, one block per session.

Each record is written as a block of `Label: value` lines separated by a
divider, for example:

```
User ID: 1
Name: Ali
Email: ali@gmail.com
PasswordHash: 9f2a...:7c3e...
Role: Employee
Department: General
Created At: 2026-07-24T10:45:00.000Z
----------------------------------
```

This is a genuine shared backend: every browser/device that talks to this
server sees the same accounts and tickets (unlike a localStorage-only
version, which would keep each browser's data separate).

For a larger, production deployment you'd eventually swap this file store
for a real database (Postgres, MySQL, etc.) - the route handlers only call
`db.read()` / `db.write()` (or the `readUsers()` / `writeUsers()` /
`readTickets()` / `writeTickets()` helpers), so that swap wouldn't touch
any of the HTTP or auth logic.

## Running it

```bash
cd helpdesk-server
node index.js
```

You should see:

```
Help Desk API listening on http://localhost:4000
```

Set a different port with `PORT=5000 node index.js` if 4000 is taken.

## API summary

| Method | Path                     | Auth? | Description                          |
|--------|--------------------------|-------|---------------------------------------|
| POST   | /api/auth/register       | no    | Create an account (employee/engineer/admin) |
| POST   | /api/auth/login          | no    | Sign in, returns a token               |
| POST   | /api/auth/logout         | yes   | Invalidate the current token           |
| GET    | /api/auth/session        | yes   | Return the signed-in user              |
| GET    | /api/users               | yes   | List all registered users (directory)  |
| GET    | /api/tickets             | yes   | List tickets (optional ?status=&requester=&assignee=) |
| GET    | /api/tickets/:id         | yes   | Get one ticket                         |
| POST   | /api/tickets             | yes   | Create a ticket                        |
| PATCH  | /api/tickets/:id/status  | yes   | Update a ticket's status               |
| PATCH  | /api/tickets/:id/assign  | yes   | Assign a ticket                        |
| POST   | /api/tickets/:id/approve | yes   | Approve a pending ticket               |
| POST   | /api/tickets/:id/reject  | yes   | Reject a pending ticket                |

Authenticated requests send `Authorization: Bearer <token>` (the token
returned by register/login).
