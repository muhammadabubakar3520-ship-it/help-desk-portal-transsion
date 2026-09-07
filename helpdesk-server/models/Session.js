import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: () => new Date().toISOString(),
    expires: 604800 // 7 days in seconds - MongoDB will auto-delete expired sessions
  }
}, { timestamps: false })

export const Session = mongoose.model('Session', sessionSchema)
