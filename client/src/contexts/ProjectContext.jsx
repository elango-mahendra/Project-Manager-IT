import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'

const ProjectContext = createContext()

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData) => {
    try {
      const response = await axios.post('/api/projects', projectData)
      setProjects(prev => [...prev, response.data])
      return { success: true, project: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Project creation failed' 
      }
    }
  }

  const joinProject = async (projectCode) => {
    try {
      const response = await axios.post('/api/projects/join', { code: projectCode })
      setProjects(prev => [...prev, response.data])
      return { success: true, project: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to join project' 
      }
    }
  }

  const fetchProject = async (projectId) => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/projects/${projectId}`)
      setCurrentProject(response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching project:', error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateProject = async (projectId, projectData) => {
    try {
      const response = await axios.put(`/api/projects/${projectId}`, projectData)
      setCurrentProject(response.data)
      setProjects(prev => prev.map(p => p._id === projectId ? response.data : p))
      return { success: true, project: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Project update failed' 
      }
    }
  }

  const deleteProject = async (projectId) => {
    try {
      await axios.delete(`/api/projects/${projectId}`)
      setProjects(prev => prev.filter(p => p._id !== projectId))
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Project deletion failed' 
      }
    }
  }

  const value = {
    projects,
    currentProject,
    loading,
    fetchProjects,
    createProject,
    joinProject,
    fetchProject,
    updateProject,
    deleteProject,
    setCurrentProject
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}