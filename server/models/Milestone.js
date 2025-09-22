import mongoose from 'mongoose'

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  linkedIssues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }],
  linkedComponents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Component'
  }]
}, {
  timestamps: true
})

// Index for faster queries
milestoneSchema.index({ project: 1 })

export default mongoose.model('Milestone', milestoneSchema)