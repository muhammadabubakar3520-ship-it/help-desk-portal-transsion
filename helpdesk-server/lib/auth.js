// Password hashing (scrypt, salted, timing-safe compare) and opaque
// session tokens - all built on Node's built-in `crypto` module so no
// third-party package (bcrypt, jsonwebtoken, etc.) is required.

import crypto from 'node:crypto'
import { readSessions, writeSessions } from './db.js'

const SCRYPT_KEYLEN = 64

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

export function createSession(userId) {
  const sessions = readSessions()
  const token = createToken()
  sessions[token] = { userId, createdAt: new Date().toISOString() }
  writeSessions(sessions)
  return token
}

export function destroySession(token) {
  const sessions = readSessions()
  delete sessions[token]
  writeSessions(sessions)
}

export function getUserIdForToken(token) {
  if (!token) return null
  const sessions = readSessions()
  return sessions[token]?.userId ?? null
}
