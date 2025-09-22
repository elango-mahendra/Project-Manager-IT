import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['web', 'mobile', 'desktop', 'api', 'other'],
    default: 'web'
  },
  complexity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  code: {
    type: String,
    unique: true,
    default: () => uuidv4().substring(0, 8).toUpperCase()
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'developer', 'viewer'],
      default: 'developer'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  stats: {
    components: { type: Number, default: 0 },
    issues: { type: Number, default: 0 },
    milestones: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 }
  }
}, {
  timestamps: true
})

// Index for faster queries
projectSchema.index({ code: 1 })
projectSchema.index({ owner: 1 })
projectSchema.index({ 'members.user': 1 })

export default mongoose.model('Project', projectSchema)