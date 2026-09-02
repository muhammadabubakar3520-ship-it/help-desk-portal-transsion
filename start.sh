#!/usr/bin/env bash
# One-click launcher for the Help Desk Portal.
# Starts the backend API and the frontend dev server, each installing its
# own dependencies first if needed. Leave this terminal window open while
# you use the site; press Ctrl+C to stop both servers.

set -e
cd "$(dirname "$0")"

echo "== Help Desk Portal =="

echo
echo "[1/2] Backend (helpdesk-server) — http://localhost:4000"
(
  cd helpdesk-server
  npm install
  npm start
) &
SERVER_PID=$!

# Give the backend a moment's head start.
sleep 1

echo
echo "[2/2] Frontend (helpdesk-app) — http://localhost:5173"
(
  cd helpdesk-app
  npm install
  npm run dev
) &
APP_PID=$!

cleanup() {
  echo
  echo "Stopping servers..."
  kill "$SERVER_PID" "$APP_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait
