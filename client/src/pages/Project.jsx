import React, { useEffect } from 'react'
import { useParams, Outlet, NavLink } from 'react-router-dom'
import { useProject } from '../contexts/ProjectContext'
import Sidebar from '../components/Sidebar'

const Project = () => {
  const { id } = useParams()
  const { currentProject, loading, fetchProject } = useProject()

  useEffect(() => {
    if (id) {
      fetchProject(id)
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading"></div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Project not found</h2>
          <p className="text-gray-600">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="project-layout">
      <Sidebar project={currentProject} />
      <main className="project-main p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default Project
