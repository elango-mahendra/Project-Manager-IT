import Activity from '../models/Activity.js'

// utils/helpers.js or wherever your helpers live

import Project from '../models/Project.js'
import Milestone from '../models/Milestone.js'
import Issue from '../models/Issue.js'
import Component from '../models/Component.js'

export const updateProjectStats = async (projectId) => {
  try {
    const [issues, components, milestones] = await Promise.all([
      Issue.find({ project: projectId }),
      Component.find({ project: projectId }),
      Milestone.find({ project: projectId })
    ])

    const totalIssues = issues.length
    const totalComponents = components.length
    const totalMilestones = milestones.length

    // count completed issues and components (used for completedTasks)
    const completedIssues = issues.filter(i => i.status === 'completed').length
    const completedComponents = components.filter(c => c.status === 'completed').length
    const completedTasks = completedIssues + completedComponents

    await Project.findByIdAndUpdate(projectId, {
      stats: {
        components: totalComponents,
        issues: totalIssues,
        milestones: totalMilestones,
        completedTasks
      }
    })

    return true
  } catch (error) {
    console.error('Error updating project stats:', error)
  }
}



export const createActivity = async (data) => {
  try {
    const activity = new Activity(data)
    await activity.save()
    return activity
  } catch (error) {
    console.error('Error creating activity:', error)
  }
}

export const generateProjectCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export const calculateProgress = (total, completed) => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export const formatDate = (date) => {
  if (!date) return null
  return new Date(date).toISOString().split('T')[0]
}

export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  return input.trim().replace(/[<>]/g, '')
}

export const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit
  return query.skip(skip).limit(limit)
}

export const buildSortQuery = (sortBy, sortOrder = 'desc') => {
  const sortObj = {}
  sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1
  return sortObj
}