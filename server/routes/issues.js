import express from 'express'
import Issue from '../models/Issue.js'
import { auth, projectAuth, requireRole } from '../middleware/auth.js'
import { validateIssue, validateRequest } from '../middleware/validation.js'
import { createActivity } from '../utils/helpers.js'
import {updateProjectStats} from '../utils/helpers.js'

const router = express.Router()

// Get all issues for a project
router.get('/:projectId/issues', auth, projectAuth, async (req, res) => {
  try {
    const { status, priority, assignee, type, component } = req.query
    
    // Build filter query
    const filter = { project: req.params.projectId }
    
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (assignee) filter.assignee = assignee
    if (type) filter.type = type
    if (component) filter.component = component
    
    const issues = await Issue.find(filter)
    .populate('assignee', 'username email')
    .populate('createdBy', 'username email')
    .populate('component', 'title')
    .sort({ createdAt: -1 })

    res.json(issues)
  } catch (error) {
    console.error('Get issues error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single issue
router.get('/:projectId/issues/:issueId', auth, projectAuth, async (req, res) => {
  try {
    const issue = await Issue.findOne({
      _id: req.params.issueId,
      project: req.params.projectId
    })
    .populate('assignee', 'username email')
    .populate('createdBy', 'username email')
    .populate('component', 'title')

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' })
    }

    res.json(issue)
  } catch (error) {
    console.error('Get issue error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new issue
router.post('/:projectId/issues', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), validateIssue, validateRequest, async (req, res) => {
  try {
    const { title, description, priority, status, type, componentId, assigneeId, tags, dueDate, estimatedHours } = req.body

    const issue = new Issue({
      title,
      description,
      priority,
      status,
      type: type || 'task',
      project: req.params.projectId,
      component: componentId || null,
      assignee: assigneeId || null,
      createdBy: req.user._id,
      tags: tags || [],
      dueDate: dueDate || null,
      estimatedHours: estimatedHours || null
    })

    await issue.save()
    await issue.populate('assignee', 'username email')
    await issue.populate('createdBy', 'username email')
    await issue.populate('component', 'title')
    
    // Create activity log
    await createActivity({
      type: 'issue',
      action: 'created',
      entityId: issue._id,
      entityTitle: issue.title,
      project: req.params.projectId,
      user: req.user._id
    })
    await updateProjectStats(req.params.projectId)
    
    res.status(201).json(issue)
  } catch (error) {
    console.error('Create issue error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update issue
router.put('/:projectId/issues/:issueId', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), validateIssue, validateRequest, async (req, res) => {
  try {
    const { title, description, priority, status, type, componentId, assigneeId, tags, dueDate, estimatedHours, actualHours } = req.body

    const updateData = {
      title,
      description,
      priority,
      status,
      type: type || 'task',
      component: componentId || null,
      assignee: assigneeId || null,
      tags: tags || [],
      dueDate: dueDate || null,
      estimatedHours: estimatedHours || null,
      actualHours: actualHours || null
    }
    
    // Set completion date if status is completed
    if (status === 'completed') {
      updateData.completedAt = new Date()
    } else if (status !== 'completed') {
      updateData.completedAt = null
    }

    const issue = await Issue.findOneAndUpdate(
      { _id: req.params.issueId, project: req.params.projectId },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('assignee', 'username email')
    .populate('createdBy', 'username email')
    .populate('component', 'title')
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' })
    }

    // Create activity log
    await createActivity({
      type: 'issue',
      action: 'updated',
      entityId: issue._id,
      entityTitle: issue.title,
      project: req.params.projectId,
      user: req.user._id
    })
    
    await updateProjectStats(req.params.projectId)
    res.json(issue)
  } catch (error) {
    console.error('Update issue error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete issue
router.delete('/:projectId/issues/:issueId', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), async (req, res) => {
  try {
    const issue = await Issue.findOne({
      _id: req.params.issueId,
      project: req.params.projectId
    })
    await updateProjectStats(req.params.projectId)
    
    if (!issue) {
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
  } catch (error) {
    console.error('Delete issue error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Assign issue to user
router.put('/:projectId/issues/:issueId/assign', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), async (req, res) => {
  try {
    const { assigneeId } = req.body

    const issue = await Issue.findOneAndUpdate(
      { _id: req.params.issueId, project: req.params.projectId },
      { assignee: assigneeId },
      { new: true, runValidators: true }
    )
    .populate('assignee', 'username email')
    .populate('createdBy', 'username email')
    .populate('component', 'title')

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' })
    }

    // Create activity log
    await createActivity({
      type: 'issue',
      action: 'assigned',
      entityId: issue._id,
      entityTitle: issue.title,
      project: req.params.projectId,
      user: req.user._id,
      details: { assigneeId }
    })

    res.json(issue)
  } catch (error) {
    console.error('Assign issue error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get issues by status for kanban board
router.get('/:projectId/issues/status/:status', auth, projectAuth, async (req, res) => {
  try {
    const issues = await Issue.find({
      project: req.params.projectId,
      status: req.params.status
    })
    .populate('assignee', 'username email')
    .populate('createdBy', 'username email')
    .populate('component', 'title')
    .sort({ createdAt: -1 })

    res.json(issues)
  } catch (error) {
    console.error('Get issues by status error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router