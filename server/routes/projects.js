import express from 'express'
import Project from '../models/Project.js'
import User from '../models/User.js'
import { auth, projectAuth, requireRole } from '../middleware/auth.js'
import { validateProject, validateRequest } from '../middleware/validation.js'
import { createActivity, generateProjectCode } from '../utils/helpers.js'

const router = express.Router()

// Get all projects for current user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id,
      isActive: true
    })
    .populate('owner', 'username email')
    .populate('members.user', 'username email')
    .sort({ updatedAt: -1 })

    // Add user's role to each project
    const projectsWithRole = projects.map(project => {
      const userMember = project.members.find(m => m.user._id.toString() === req.user._id.toString())
      return {
        ...project.toObject(),
        userRole: userMember ? userMember.role : 'viewer'
      }
    })

    res.json(projectsWithRole)
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get single project
router.get('/:projectId', auth, projectAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'username email')
      .populate('members.user', 'username email')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create new project
router.post('/', auth, validateProject, validateRequest, async (req, res) => {
  try {
    const { name, description, type, complexity } = req.body

    const project = new Project({
      name,
      description,
      type,
      complexity,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'owner'
      }]
    })

    await project.save()
    await project.populate('owner', 'username email')
    await project.populate('members.user', 'username email')

    // Create activity log
    await createActivity({
      type: 'project',
      action: 'created',
      entityId: project._id,
      entityTitle: project.name,
      project: project._id,
      user: req.user._id
    })

    res.status(201).json(project)
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update project
router.put('/:projectId', auth, projectAuth, requireRole(['owner', 'admin']), validateProject, validateRequest, async (req, res) => {
  try {
    const { name, description, type, complexity } = req.body

    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { name, description, type, complexity },
      { new: true, runValidators: true }
    )
    .populate('owner', 'username email')
    .populate('members.user', 'username email')

    // Create activity log
    await createActivity({
      type: 'project',
      action: 'updated',
      entityId: project._id,
      entityTitle: project.name,
      project: project._id,
      user: req.user._id
    })

    res.json(project)
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete project
router.delete('/:projectId', auth, projectAuth, requireRole(['owner']), async (req, res) => {
  try {
    await Project.findByIdAndUpdate(
      req.params.projectId,
      { isActive: false },
      { new: true }
    )

    // Create activity log
    await createActivity({
      type: 'project',
      action: 'deleted',
      entityId: req.params.projectId,
      entityTitle: req.project.name,
      project: req.params.projectId,
      user: req.user._id
    })

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Join project by code
router.post('/join', auth, async (req, res) => {
  try {
    const { code } = req.body

    if (!code) {
      return res.status(400).json({ message: 'Project code is required' })
    }

    const project = await Project.findOne({ code: code.toUpperCase(), isActive: true })
    if (!project) {
      return res.status(404).json({ message: 'Invalid project code' })
    }

    // Check if user is already a member
    const existingMember = project.members.find(m => m.user.toString() === req.user._id.toString())
    if (existingMember) {
      return res.status(400).json({ message: 'You are already a member of this project' })
    }

    // Add user to project
    project.members.push({
      user: req.user._id,
      role: 'developer'
    })

    await project.save()
    await project.populate('owner', 'username email')
    await project.populate('members.user', 'username email')

    // Create activity log
    await createActivity({
      type: 'user',
      action: 'joined',
      entityId: req.user._id,
      entityTitle: req.user.username,
      project: project._id,
      user: req.user._id
    })

    res.json(project)
  } catch (error) {
    console.error('Join project error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get project members
router.get('/:projectId/members', auth, projectAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('members.user', 'username email')

    res.json(project.members)
  } catch (error) {
    console.error('Get members error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Invite member to project
router.post('/:projectId/invite', auth, projectAuth, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { email, role } = req.body

    if (!email || !role) {
      return res.status(400).json({ message: 'Email and role are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user is already a member
    const existingMember = req.project.members.find(m => m.user.toString() === user._id.toString())
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member' })
    }

    // Add user to project
    req.project.members.push({
      user: user._id,
      role
    })

    await req.project.save()
    await req.project.populate('members.user', 'username email')

    // Create activity log
    await createActivity({
      type: 'user',
      action: 'joined',
      entityId: user._id,
      entityTitle: user.username,
      project: req.project._id,
      user: req.user._id
    })

    res.json(req.project.members)
  } catch (error) {
    console.error('Invite member error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update member role
router.put('/:projectId/members/:memberId', auth, projectAuth, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { role } = req.body

    if (!role || !['admin', 'developer', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    const member = req.project.members.id(req.params.memberId)
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }

    // Can't change owner role
    if (member.role === 'owner') {
      return res.status(400).json({ message: 'Cannot change owner role' })
    }

    member.role = role
    await req.project.save()
    await req.project.populate('members.user', 'username email')

    res.json(req.project.members)
  } catch (error) {
    console.error('Update member role error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Remove member from project
router.delete('/:projectId/members/:memberId', auth, projectAuth, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const member = req.project.members.id(req.params.memberId)
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }

    // Can't remove owner
    if (member.role === 'owner') {
      return res.status(400).json({ message: 'Cannot remove project owner' })
    }

    // Can't remove yourself
    if (member.user.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot remove yourself' })
    }

    await req.project.members.id(req.params.memberId).remove()
    await req.project.save()

    // Create activity log
    await createActivity({
      type: 'user',
      action: 'left',
      entityId: member.user,
      entityTitle: member.user.username,
      project: req.project._id,
      user: req.user._id
    })

    res.json({ message: 'Member removed successfully' })
  } catch (error) {
    console.error('Remove member error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router