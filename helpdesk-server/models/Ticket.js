import mongoose from 'mongoose'

const ticketSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  requester: {
    type: String,
    required: true
  },
  requesterEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  assignee: {
    type: String,
    default: null
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    required: true
  },
  status: {
    type: String,
    enum: ['Newly Created', 'Open', 'Pending Approval', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
    default: 'Newly Created'
  },
  resolutionNotes: {
    type: String,
    default: null
  },
  adminRemarks: {
    type: String,
    default: null
  },
  adminRemarksBy: {
    type: String,
    default: null
  },
  adminRemarksAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: () => new Date().toISOString()
  },
  updatedAt: {
    type: Date,
    default: () => new Date().toISOString()
  }
}, { timestamps: false })

export const Ticket = mongoose.model('Ticket', ticketSchema)
