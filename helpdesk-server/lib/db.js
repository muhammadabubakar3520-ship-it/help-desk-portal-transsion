// Tiny plain-text "database". No external dependencies (no SQLite driver,
// no ORM) so the server runs with nothing but stock Node.js. Good enough
// for a small internal tool; swap this module out for a real database
// (Postgres, MySQL, etc.) later without touching the route handlers, since
// they only ever call the functions exported here.
//
// Every collection is stored as a human-readable .txt file. Each record is
// written as a block of "Label: value" lines, with blocks separated by a
// divider line, e.g.:
//
//   User ID: 1
//   Name: Ali
//   Email: ali@gmail.com
//   PasswordHash: xxxxxxxxx
//   Role: Employee
//   Created At: 2026-07-24
//   --------------------------------
//
// This keeps the data fully readable/editable in any text editor while the
// public API (db.read / db.write) keeps a stable signature, so nothing
// outside this file needs to know or care that storage is plain text.
// This module contains 100% of the storage logic - no other backend file
// touches the filesystem or knows about the .txt format.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')

const DIVIDER = '-'.repeat(34)
const DIVIDER_RE = /^-{3,}$/

// ---------------------------------------------------------------------------
// Field schemas: define the on-disk label + type for every field of every
// collection, in the exact order they should appear in the .txt file. This
// is what makes the files human-readable ("User ID" instead of "id", etc.)
// while still round-tripping perfectly back into JS objects.
// ---------------------------------------------------------------------------

const USERS_SCHEMA = [
  { key: 'id', label: 'User ID', type: 'number' },
  { key: 'employeeId', label: 'Employee ID', type: 'nullableString' },
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'email', label: 'Email', type: 'string' },
  { key: 'passwordHash', label: 'PasswordHash', type: 'string' },
  { key: 'role', label: 'Role', type: 'string' },
  { key: 'department', label: 'Department', type: 'string' },
  { key: 'createdAt', label: 'Created At', type: 'string' }
]

const TICKETS_SCHEMA = [
  { key: 'id', label: 'Ticket ID', type: 'number' },
  { key: 'title', label: 'Title', type: 'string' },
  { key: 'description', label: 'Description', type: 'string' },
  { key: 'category', label: 'Category', type: 'string' },
  { key: 'requester', label: 'Created By', type: 'string' },
  { key: 'requesterEmail', label: 'Requester Email', type: 'string' },
  { key: 'assignee', label: 'Assigned To', type: 'nullableString' },
  { key: 'priority', label: 'Priority', type: 'string' },
  { key: 'status', label: 'Status', type: 'string' },
  { key: 'resolutionNotes', label: 'Resolution Notes', type: 'nullableString' },
  { key: 'adminRemarks', label: 'Admin Remarks', type: 'nullableString' },
  { key: 'adminRemarksBy', label: 'Admin Remarks By', type: 'nullableString' },
  { key: 'adminRemarksAt', label: 'Admin Remarks At', type: 'nullableString' },
  { key: 'createdAt', label: 'Created At', type: 'string' },
  { key: 'updatedAt', label: 'Updated At', type: 'string' }
]

// Sessions are stored as { [token]: { userId, createdAt } } in memory, but
// on disk they're just another block-per-record text file.
const SESSIONS_SCHEMA = [
  { key: 'token', label: 'Token', type: 'string' },
  { key: 'userId', label: 'User ID', type: 'number' },
  { key: 'createdAt', label: 'Created At', type: 'string' }
]

const SCHEMAS = {
  users: USERS_SCHEMA,
  tickets: TICKETS_SCHEMA,
  sessions: SESSIONS_SCHEMA
}

// Collections that are conceptually a dictionary (keyed by a field) rather
// than a plain array. Only `sessions` needs this today.
const DICT_COLLECTIONS = new Set(['sessions'])
const DICT_KEY_FIELD = { sessions: 'token' }

// ---------------------------------------------------------------------------
// Low-level text <-> records (de)serialization
// ---------------------------------------------------------------------------

function labelize(key) {
  if (key.toLowerCase() === 'id') return 'ID'
  const withSpaces = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1)
}

// Best-effort schema for a collection we don't have an explicit schema for,
// inferred from a sample record. Keeps the store usable even if a new
// collection is added later without updating this file.
function inferSchema(sampleRecord) {
  if (!sampleRecord || typeof sampleRecord !== 'object') return []
  return Object.keys(sampleRecord).map((key) => ({ key, label: labelize(key), type: 'string' }))
}

function coerce(rawValue, type) {
  if (type === 'number') return rawValue === '' ? null : Number(rawValue)
  if (type === 'nullableString') return rawValue === '' ? null : rawValue
  return rawValue
}

function serializeRecords(records, schema) {
  if (!records.length) return ''
  return (
    records
      .map((record) => {
        const lines = schema.map(({ key, label }) => {
          const value = record[key]
          return `${label}: ${value === null || value === undefined ? '' : value}`
        })
        return `${lines.join('\n')}\n${DIVIDER}`
      })
      .join('\n') + '\n'
  )
}

function parseRecords(raw, schema) {
  if (!raw || !raw.trim()) return []

  const labelToField = new Map(schema.map((field) => [field.label.toLowerCase(), field]))
  const lines = raw.split(/\r?\n/)

  const records = []
  let current = {}
  let hasContent = false

  const flush = () => {
    if (hasContent) records.push(current)
    current = {}
    hasContent = false
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    if (DIVIDER_RE.test(line)) {
      flush()
      continue
    }
    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) continue

    const label = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    const field = labelToField.get(label.toLowerCase())
    if (!field) continue // unknown label - ignore rather than corrupt the record

    current[field.key] = coerce(value, field.type)
    hasContent = true
  }
  flush() // handle a file that doesn't end with a trailing divider

  return records
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

function filePath(name) {
  return path.join(DATA_DIR, `${name}.txt`)
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function toRecords(name, data) {
  if (DICT_COLLECTIONS.has(name)) {
    const keyField = DICT_KEY_FIELD[name]
    return Object.entries(data || {}).map(([key, value]) => ({ [keyField]: key, ...value }))
  }
  return Array.isArray(data) ? data : []
}

function fromRecords(name, records) {
  if (DICT_COLLECTIONS.has(name)) {
    const keyField = DICT_KEY_FIELD[name]
    const dict = {}
    for (const record of records) {
      const { [keyField]: key, ...rest } = record
      if (key) dict[key] = rest
    }
    return dict
  }
  return records
}

// ---------------------------------------------------------------------------
// Public API (unchanged signatures - db.read(name, fallback) / db.write(name, data))
// ---------------------------------------------------------------------------

function readCollection(name, fallback = []) {
  ensureDataDir()

  const file = filePath(name)
  if (!fs.existsSync(file)) {
    // Never crash because a file is missing - create it (empty) on first
    // access and hand back the fallback value.
    writeCollection(name, fallback)
    return structuredClone(fallback)
  }

  const schema = SCHEMAS[name] || inferSchema(toRecords(name, fallback)[0])

  let raw
  try {
    raw = fs.readFileSync(file, 'utf8')
  } catch (err) {
    // File exists but couldn't be read (permissions, disk error, etc.) -
    // degrade gracefully instead of crashing the server.
    console.error(`[db] Failed to read ${file}:`, err.message)
    return structuredClone(fallback)
  }

  try {
    const records = parseRecords(raw, schema)
    return fromRecords(name, records)
  } catch (err) {
    // A malformed/corrupted .txt file should never take the server down -
    // log it and fall back to an empty collection rather than throwing.
    console.error(`[db] Failed to parse ${file}, treating as empty:`, err.message)
    return structuredClone(fallback)
  }
}

function writeCollection(name, data) {
  ensureDataDir()
  const records = toRecords(name, data)
  const schema = SCHEMAS[name] || inferSchema(records[0])
  fs.writeFileSync(filePath(name), serializeRecords(records, schema))
}

// Ensures the data directory and every known collection's .txt file exist
// before the server starts accepting requests, so nothing needs to be
// created manually and the very first request never has to lazily create
// a file mid-flight. Existing files/data are never touched or overwritten.
const DEFAULT_FALLBACKS = { users: [], tickets: [], sessions: {} }

export function initStorage() {
  ensureDataDir()
  for (const name of Object.keys(DEFAULT_FALLBACKS)) {
    const file = filePath(name)
    if (!fs.existsSync(file)) {
      writeCollection(name, DEFAULT_FALLBACKS[name])
    }
  }
  return Object.keys(DEFAULT_FALLBACKS).map((name) => filePath(name))
}

export const db = {
  read: readCollection,
  write: writeCollection
}

// Explicit, named helpers per the requested storage-layer API. These are
// thin, self-documenting wrappers around db.read/db.write for the two
// primary collections; routes are free to use either form.
export function readUsers() {
  return db.read('users', [])
}

export function writeUsers(users) {
  db.write('users', users)
}

export function readTickets() {
  return db.read('tickets', [])
}

export function writeTickets(tickets) {
  db.write('tickets', tickets)
}

export function readSessions() {
  return db.read('sessions', {})
}

export function writeSessions(sessions) {
  db.write('sessions', sessions)
}
