import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['project', 'component', 'issue', 'milestone', 'user'],
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'assigned', 'completed', 'joined', 'left'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'type'
  },
  entityTitle: {
    type: String,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
})

// Index for faster queries
activitySchema.index({ project: 1, createdAt: 1 })
activitySchema.index({ user: 1, createdAt: 1 })

export default mongoose.model('Activity', activitySchema)