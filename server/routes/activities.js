import express from 'express'
import Activity from '../models/Activity.js'
import { auth, projectAuth } from '../middleware/auth.js'

const router = express.Router()

// Get all actions for a project (recent activity)
router.get('/:projectId/activities', auth, projectAuth, async (req, res) => {
  try {
    const actions = await Activity.find({ project: req.params.projectId })
      .sort({ createdAt: -1 })
      .populate('user', 'username email')
      // .limit(20) // You can adjust the number of recent actions to return

    res.json(actions)
  } catch (error) {
    console.error('Error fetching project actions:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
