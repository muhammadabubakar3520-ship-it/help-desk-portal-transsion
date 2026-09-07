import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    sparse: true
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'engineer', 'employee'],
    default: 'employee'
  },
  department: {
    type: String
  },
  createdAt: {
    type: Date,
    default: () => new Date().toISOString()
  }
}, { timestamps: false })

export const User = mongoose.model('User', userSchema)
