# Help Desk Portal

Responsive help desk / ticketing web app built with React + Vite + Tailwind CSS,
following the ticket lifecycle and approval flow from the provided screenshots
(employee submits → admin approves → engineer resolves, with the admin also
running the full admin console).

## Getting started

This app talks to a real backend (`../helpdesk-server`) - it is **not** mocked
data anymore, so you need to run **both** the server and the frontend, in two
separate terminals:

```bash
# Terminal 1 - backend API (http://localhost:4000)
cd ../helpdesk-server
npm install
npm start

# Terminal 2 - frontend (http://localhost:5173)
cd helpdesk-app
npm install
npm run dev
```

If you only start the frontend, sign-in and registration will fail with
`Failed to fetch` because there's nothing listening on port 4000.

Open the printed local URL and register a new account (or sign in with an
account you've already created - there are no seeded demo accounts; every
account lives in `helpdesk-server/data/users.txt`).

Optionally copy `.env.example` to `.env` if your backend runs somewhere other
than `http://localhost:4000/api`.

## Folder structure

```
src/
  components/     Reusable UI: Navbar, Sidebar, Footer, TicketCard, TicketForm, ApprovalCard
  pages/          Route-level screens: Login, Dashboard, CreateTicket, MyTickets,
                  Engineer, Admin
  layouts/        Page shells: MainLayout (sidebar+navbar+footer), AuthLayout, RoleRoute guard
  hooks/          useAuth, useTickets, useMediaQuery
  services/       api.js (mock HTTP client), authService.js, ticketService.js
  context/        AuthContext, TicketContext (React context + providers)
  utils/          constants.js (roles/statuses/priority), helpers.js
  assets/         Logo mark
  styles/         variables.css — CSS custom properties mirroring the Tailwind theme
```

## Notes

- Data is mocked in-memory via `services/ticketService.js` and `services/authService.js`,
  each routed through `services/api.js` so a real backend can be swapped in later
  by replacing that one file's implementation.
- Routing and role-based access (`employee`, `engineer`, `admin`) is handled
  in `App.jsx` via `layouts/RoleRoute.jsx`. The admin role now also owns ticket
  approvals (accept/reject) alongside the user directory and ticket oversight —
  there is no separate manager role.
- Tailwind theme (`tailwind.config.js`) defines the full color/typography token system;
  `src/styles/variables.css` mirrors the same tokens as CSS variables for non-Tailwind use.
