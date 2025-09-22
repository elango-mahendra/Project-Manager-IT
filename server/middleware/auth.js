import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export const projectAuth = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const Project = (await import('../models/Project.js')).default
    
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const member = project.members.find(m => m.user.toString() === req.user._id.toString())
    if (!member) {
      return res.status(403).json({ message: 'Access denied' })
    }

    req.project = project
    req.userRole = member.role
    next()
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }
    next()
  }
}