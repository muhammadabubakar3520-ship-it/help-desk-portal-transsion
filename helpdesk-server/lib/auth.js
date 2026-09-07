// Password hashing (scrypt, salted, timing-safe compare) and opaque
// session tokens - all built on Node's built-in `crypto` module so no
// third-party package (bcrypt, jsonwebtoken, etc.) is required.

import crypto from 'node:crypto'
import { readSessions, writeSessions } from './db.js'

const SCRYPT_KEYLEN = 64

// In-memory session cache for faster lookups (sessions are short-lived anyway)
let sessionCache = {}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':')
  if (!salt || !hash) return false
  const candidate = crypto.scryptSync(password, salt, SCRYPT_KEYLEN)
  const expected = Buffer.from(hash, 'hex')
  if (candidate.length !== expected.length) return false
  return crypto.timingSafeEqual(candidate, expected)
}

export function createToken() {
  return crypto.randomBytes(32).toString('hex')
}

export async function createSession(userId) {
  const sessions = await readSessions()
  const token = createToken()
  sessions[token] = { userId, createdAt: new Date().toISOString() }
  sessionCache[token] = sessions[token]
  await writeSessions(sessions)
  return token
}

export async function destroySession(token) {
  const sessions = await readSessions()
  delete sessions[token]
  delete sessionCache[token]
  await writeSessions(sessions)
}

export function getUserIdForToken(token) {
  if (!token) return null
  // Try in-memory cache first (fast path)
  if (sessionCache[token]) {
    return sessionCache[token].userId
  }
  return null
}

// Initialize session cache on startup
export async function initSessionCache() {
  try {
    sessionCache = await readSessions()
  } catch (error) {
    console.error('[auth] Failed to initialize session cache:', error.message)
    sessionCache = {}
  }
}
