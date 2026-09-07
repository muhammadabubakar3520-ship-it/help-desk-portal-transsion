// MongoDB database layer using Mongoose
// Replaces the plain-text file storage system with MongoDB for scalability and reliability
//
// This module maintains the same API as the original (db.read / db.write) for backward
// compatibility, but stores data in MongoDB instead of .txt files.

import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { Ticket } from '../models/Ticket.js'
import { Session } from '../models/Session.js'

let dbConnected = false

// Initialize MongoDB connection
export async function initDatabase() {
  if (dbConnected) return

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not set!')
    console.error('Please add MONGODB_URI to your .env file')
    console.error('Example: mongodb+srv://username:password@cluster.mongodb.net/helpdesk-db')
    throw new Error('MongoDB URI not configured')
  }

  try {
    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000
    })
    dbConnected = true
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message)
    throw error
  }
}

// Generic collection read/write - maintains backward compatibility
export const db = {
  read: async (name, fallback = []) => {
    try {
      switch (name) {
        case 'users':
          return await readUsers()
        case 'tickets':
          return await readTickets()
        case 'sessions':
          return await readSessions()
        default:
          return fallback
      }
    } catch (error) {
      console.error(`[db] Failed to read ${name}:`, error.message)
      return structuredClone(fallback)
    }
  },

  write: async (name, data) => {
    try {
      switch (name) {
        case 'users':
          return await writeUsers(data)
        case 'tickets':
          return await writeTickets(data)
        case 'sessions':
          return await writeSessions(data)
      }
    } catch (error) {
      console.error(`[db] Failed to write ${name}:`, error.message)
    }
  }
}

// User operations
export async function readUsers() {
  try {
    const users = await User.find({}).lean()
    return users || []
  } catch (error) {
    console.error('[db] Failed to read users:', error.message)
    return []
  }
}

export async function writeUsers(users) {
  try {
    if (!Array.isArray(users)) return

    // Clear existing users
    await User.deleteMany({})

    // Insert new users
    if (users.length > 0) {
      await User.insertMany(users, { ordered: false })
    }
  } catch (error) {
    console.error('[db] Failed to write users:', error.message)
    throw error
  }
}

// Ticket operations
export async function readTickets() {
  try {
    const tickets = await Ticket.find({}).lean()
    return tickets || []
  } catch (error) {
    console.error('[db] Failed to read tickets:', error.message)
    return []
  }
}

export async function writeTickets(tickets) {
  try {
    if (!Array.isArray(tickets)) return

    // Update or insert tickets
    for (const ticket of tickets) {
      if (ticket.id) {
        await Ticket.findOneAndUpdate(
          { id: ticket.id },
          ticket,
          { upsert: true, new: true }
        )
      } else {
        await Ticket.create(ticket)
      }
    }
  } catch (error) {
    console.error('[db] Failed to write tickets:', error.message)
    throw error
  }
}

// Session operations
export async function readSessions() {
  try {
    const sessionDocs = await Session.find({}).lean()
    const sessions = {}
    sessionDocs.forEach(doc => {
      sessions[doc.token] = {
        userId: doc.userId,
        createdAt: doc.createdAt
      }
    })
    return sessions
  } catch (error) {
    console.error('[db] Failed to read sessions:', error.message)
    return {}
  }
}

export async function writeSessions(sessions) {
  try {
    // Clear existing sessions
    await Session.deleteMany({})

    // Insert new sessions
    if (sessions && typeof sessions === 'object') {
      const sessionArray = Object.entries(sessions).map(([token, data]) => ({
        token,
        userId: data.userId,
        createdAt: data.createdAt
      }))

      if (sessionArray.length > 0) {
        await Session.insertMany(sessionArray, { ordered: false })
      }
    }
  } catch (error) {
    console.error('[db] Failed to write sessions:', error.message)
    throw error
  }
}

// Initialize storage (creates data directory structure for backward compatibility)
// This is now async due to MongoDB connection
export async function initStorage() {
  await initDatabase()
  // Ensure collections exist by creating indexes
  try {
    await User.collection.createIndex({ id: 1 })
    await User.collection.createIndex({ email: 1 })
    await User.collection.createIndex({ employeeId: 1 })

    await Ticket.collection.createIndex({ id: 1 })
    await Ticket.collection.createIndex({ status: 1 })
    await Ticket.collection.createIndex({ requester: 1 })
    await Ticket.collection.createIndex({ assignee: 1 })

    await Session.collection.createIndex({ token: 1 })
    await Session.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 })

    console.log('✅ Database indexes created')
  } catch (error) {
    console.error('⚠️ Warning: Failed to create indexes:', error.message)
  }

  return []
}
