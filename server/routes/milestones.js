import express from 'express'
import Milestone from '../models/Milestone.js'
import { auth, projectAuth, requireRole } from '../middleware/auth.js'
import { validateMilestone, validateRequest } from '../middleware/validation.js'
import { createActivity } from '../utils/helpers.js'
import {updateProjectStats} from '../utils/helpers.js'
const router = express.Router()

// Get all milestones for a project
router.get('/:projectId/milestones', auth, projectAuth, async (req, res) => {
  try {
    const { status } = req.query

    // Build filter query
    const filter = { project: req.params.projectId }
    
    if (status) filter.status = status
    
    const milestones = await Milestone.find(filter)
    .populate('createdBy', 'username email')
    .populate('linkedIssues', 'title status')
      .populate('linkedComponents', 'title status')
      .sort({ dueDate: 1, createdAt: -1 })
      
      res.json(milestones)
    } catch (error) {
      console.error('Get milestones error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single milestone
router.get('/:projectId/milestones/:milestoneId', auth, projectAuth, async (req, res) => {
  try {
    const milestone = await Milestone.findOne({
      _id: req.params.milestoneId,
      project: req.params.projectId
    })
    .populate('createdBy', 'username email')
    .populate('linkedIssues', 'title status')
    .populate('linkedComponents', 'title status')
    
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' })
    }
    
    res.json(milestone)
  } catch (error) {
    console.error('Get milestone error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new milestone
router.post('/:projectId/milestones', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), validateMilestone, validateRequest, async (req, res) => {
  try {
    const { title, description, status, dueDate, linkedIssues, linkedComponents } = req.body
    
    const milestone = new Milestone({
      title,
      description,
      status,
      project: req.params.projectId,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      linkedIssues: linkedIssues || [],
      linkedComponents: linkedComponents || []
    })
    
    await milestone.save()
    await milestone.populate('createdBy', 'username email')
    await milestone.populate('linkedIssues', 'title status')
    await milestone.populate('linkedComponents', 'title status')
    
    // Create activity log
    await createActivity({
      type: 'milestone',
      action: 'created',
      entityId: milestone._id,
      entityTitle: milestone.title,
      project: req.params.projectId,
      user: req.user._id
    })
    await updateProjectStats(req.params.projectId)
    
    res.status(201).json(milestone)
  } catch (error) {
    console.error('Create milestone error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update milestone
router.put('/:projectId/milestones/:milestoneId', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), validateMilestone, validateRequest, async (req, res) => {
  try {
    const { title, description, status, dueDate, progress, linkedIssues, linkedComponents } = req.body
    
    const updateData = {
      title,
      description,
      status,
      dueDate: dueDate || null,
      progress: progress || 0,
      linkedIssues: linkedIssues || [],
      linkedComponents: linkedComponents || []
    }

    // Set completion date if status is completed
    if (status === 'completed') {
      updateData.completedAt = new Date()
    } else if (status !== 'completed') {
      updateData.completedAt = null
    }
    
    const milestone = await Milestone.findOneAndUpdate(
      { _id: req.params.milestoneId, project: req.params.projectId },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'username email')
    .populate('linkedIssues', 'title status')
    .populate('linkedComponents', 'title status')
    
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' })
    }
    
    // Create activity log
    await createActivity({
      type: 'milestone',
      action: 'updated',
      entityId: milestone._id,
      entityTitle: milestone.title,
      project: req.params.projectId,
      user: req.user._id
    })
    
    await updateProjectStats(req.params.projectId)
    res.json(milestone)
  } catch (error) {
    console.error('Update milestone error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete milestone
router.delete('/:projectId/milestones/:milestoneId', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), async (req, res) => {
  try {
    const milestone = await Milestone.findOne({
      _id: req.params.milestoneId,
      project: req.params.projectId
    })
    
    await updateProjectStats(req.params.projectId)
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' })
    }
    /**
 * Deletes an issue from a project.
    *
 * @param {string} req.params.projectId - The ID of the project.
 * @param {string} req.params.issueId - The ID of the issue to delete.
 * @param {object} req.user - The authenticated user making the request.
 * @param {object} res - The response object.
 *
 * @returns {object} - Returns a JSON object with a success message or an error message.
    *
    * @throws Will throw an error if the issue is not found or if the user does not have the required permissions.
    */
   router.delete('/:projectId/issues/:issueId', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), async (req, res) => {
     try {
       const issue = await Issue.findOne({
         _id: req.params.issueId,
         project: req.params.projectId
        })
        
        if (!issue) {
          await updateProjectStats(req.params.projectId)
          return res.status(404).json({ message: 'Issue not found' })
        }
        
        await Issue.findByIdAndDelete(req.params.issueId)
        
        // Create activity log
        await createActivity({
          type: 'issue',
      action: 'deleted',
      entityId: req.params.issueId,
      entityTitle: issue.title,
      project: req.params.projectId,
      user: req.user._id
    })
    
    res.json({ message: 'Issue deleted successfully' })
    await updateProjectStats(req.params.projectId)
  } catch (error) {
    console.error('Delete issue error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})
await Milestone.findByIdAndDelete(req.params.milestoneId)

// Create activity log
await createActivity({
  type: 'milestone',
  action: 'deleted',
      entityId: req.params.milestoneId,
      entityTitle: milestone.title,
      project: req.params.projectId,
      user: req.user._id
    })
    
  await updateProjectStats(req.params.projectId)
    res.json({ message: 'Milestone deleted successfully' })
  } catch (error) {
    console.error('Delete milestone error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update milestone progress
router.put('/:projectId/milestones/:milestoneId/progress', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), async (req, res) => {
  try {
    const { progress } = req.body

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' })
    }

    const milestone = await Milestone.findOneAndUpdate(
      { _id: req.params.milestoneId, project: req.params.projectId },
      { progress },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'username email')
    .populate('linkedIssues', 'title status')
    .populate('linkedComponents', 'title status')

    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' })
    }

    // Auto-update status based on progress
    if (progress === 100 && milestone.status !== 'completed') {
      milestone.status = 'completed'
      milestone.completedAt = new Date()
      await milestone.save()
    } else if (progress > 0 && milestone.status === 'not-started') {
      milestone.status = 'in-progress'
      await milestone.save()
    }

    res.json(milestone)
  } catch (error) {
    console.error('Update milestone progress error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router