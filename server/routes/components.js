import express from 'express'
import Component from '../models/Component.js'
import { auth, projectAuth, requireRole } from '../middleware/auth.js'
import { validateComponent, validateRequest } from '../middleware/validation.js'
import { createActivity } from '../utils/helpers.js'
import {updateProjectStats} from '../utils/helpers.js'
const router = express.Router()

// Get all components for a project
router.get('/:projectId/components', auth, projectAuth, async (req, res) => {
  try {
    const { status, priority, assignee, type } = req.query
    
    // Build filter query
    const filter = { project: req.params.projectId }
    
    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (assignee) filter.assignee = assignee
    if (type) filter.type = type
    
    const components = await Component.find(filter)
    .populate('assignee', 'username email')
    .populate('createdBy', 'username email')
    .sort({ order: 1, createdAt: -1 })
    
    res.json(components)
  } catch (error) {
    console.error('Get components error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single component
router.get('/:projectId/components/:componentId', auth, projectAuth, async (req, res) => {
  try {
    const component = await Component.findOne({
      _id: req.params.componentId,
      project: req.params.projectId
    })
    .populate('assignee', 'username email')
    .populate('createdBy', 'username email')
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' })
    }
    
    res.json(component)
  } catch (error) {
    console.error('Get component error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new component
router.post('/:projectId/components', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), validateComponent, validateRequest, async (req, res) => {
  try {
    const { title, description, type, priority, status, parentId, assigneeId, tags, dueDate } = req.body
    
    // Validate parent component if provided
    if (parentId) {
      const parent = await Component.findOne({
        _id: parentId,
        project: req.params.projectId
      })
      if (!parent) {
        return res.status(400).json({ message: 'Parent component not found' })
      }
    }
    
    const component = new Component({
      title,
      description,
      type,
      priority,
      status,
      project: req.params.projectId,
      parentId: parentId || null,
      assignee: assigneeId || null,
      createdBy: req.user._id,
      tags: tags || [],
      dueDate: dueDate || null,
      order: await Component.countDocuments({ project: req.params.projectId, parentId: parentId || null })
    })
    
    await component.save()
    await component.populate('assignee', 'username email')
    await component.populate('createdBy', 'username email')
    
    // Create activity log
    await createActivity({
      type: 'component',
      action: 'created',
      entityId: component._id,
      entityTitle: component.title,
      project: req.params.projectId,
      user: req.user._id
    })
    await updateProjectStats(req.params.projectId)
    
    res.status(201).json(component)
  } catch (error) {
    console.error('Create component error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update component
router.put('/:projectId/components/:componentId', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), validateComponent, validateRequest, async (req, res) => {
  try {
    const { title, description, type, priority, status, parentId, assigneeId, tags, dueDate } = req.body

    // Validate parent component if provided
    if (parentId) {
      const parent = await Component.findOne({
        _id: parentId,
        project: req.params.projectId
      })
      if (!parent) {
        return res.status(400).json({ message: 'Parent component not found' })
      }
    }

    const updateData = {
      title,
      description,
      type,
      priority,
      status,
      parentId: parentId || null,
      assignee: assigneeId || null,
      tags: tags || [],
      dueDate: dueDate || null
    }
    
    // Set completion date if status is completed
    if (status === 'completed') {
      updateData.completedAt = new Date()
    } else if (status !== 'completed') {
      updateData.completedAt = null
    }

    const component = await Component.findOneAndUpdate(
      { _id: req.params.componentId, project: req.params.projectId },
      updateData,
      { new: true, runValidators: true }
    )
    .populate('assignee', 'username email')
    .populate('createdBy', 'username email')
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' })
    }
    
    // Create activity log
    await createActivity({
      type: 'component',
      action: 'updated',
      entityId: component._id,
      entityTitle: component.title,
      project: req.params.projectId,
      user: req.user._id
    })

    await updateProjectStats(req.params.projectId)
    res.json(component)
  } catch (error) {
    console.error('Update component error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete component
router.delete('/:projectId/components/:componentId', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), async (req, res) => {
  try {
    const component = await Component.findOne({
      _id: req.params.componentId,
      project: req.params.projectId
    })
    
    if (!component) {
      return res.status(404).json({ message: 'Component not found' })
    }
    
    // Check if component has children
    const hasChildren = await Component.countDocuments({
      parentId: req.params.componentId,
      project: req.params.projectId
    })

    if (hasChildren > 0) {
      return res.status(400).json({ message: 'Cannot delete component with sub-components' })
    }

    await Component.findByIdAndDelete(req.params.componentId)

    // Create activity log
    await createActivity({
      type: 'component',
      action: 'deleted',
      entityId: req.params.componentId,
      entityTitle: component.title,
      project: req.params.projectId,
      user: req.user._id
    })

    await updateProjectStats(req.params.projectId)
    res.json({ message: 'Component deleted successfully' })
  } catch (error) {
    console.error('Delete component error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update component order (for drag and drop)
router.put('/:projectId/components/:componentId/order', auth, projectAuth, requireRole(['owner', 'admin', 'developer']), async (req, res) => {
  try {
    const { newOrder, newParentId } = req.body

    const component = await Component.findOne({
      _id: req.params.componentId,
      project: req.params.projectId
    })

    if (!component) {
      return res.status(404).json({ message: 'Component not found' })
    }

    // Update component order and parent
    component.order = newOrder
    component.parentId = newParentId || null
    await component.save()

    // Reorder other components
    const siblings = await Component.find({
      project: req.params.projectId,
      parentId: newParentId || null,
      _id: { $ne: req.params.componentId }
    }).sort({ order: 1 })

    // Update orders for siblings
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i]
      const newSiblingOrder = i >= newOrder ? i + 1 : i
      if (sibling.order !== newSiblingOrder) {
        sibling.order = newSiblingOrder
        await sibling.save()
      }
    }

    res.json({ message: 'Component order updated successfully' })
  } catch (error) {
    console.error('Update component order error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router