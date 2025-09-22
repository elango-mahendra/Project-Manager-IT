import mongoose from 'mongoose'

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['backlog', 'dev-ready', 'dev-progress', 'dev-done', 'completed'],
    default: 'backlog'
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'task', 'improvement'],
    default: 'task'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  component: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Component'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
})

// Index for faster queries
issueSchema.index({ project: 1, status: 1 })
issueSchema.index({ assignee: 1 })

export default mongoose.model('Issue', issueSchema)