import React, { useState } from 'react'
import { Save, Trash2, Copy, Settings as SettingsIcon } from 'lucide-react'
// import { useProject } from '../../contexts/ProjectContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../../contexts/ProjectContext'

const Settings = ({ project }) => {
  const { currentProject } = useProject()
  const [formData, setFormData] = useState({
    name: currentProject.name,
    description: currentProject.description,
    type: currentProject.type,
    complexity: currentProject.complexity
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { updateProject, deleteProject } = useProject()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const result = await updateProject(currentProject._id, formData)
    
    if (result.success) {
      setSuccess('Project updated successfully')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      const result = await deleteProject(currentProject._id)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error)
      }
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentProject.code)
    setSuccess('Project code copied to clipboard')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const isOwner = currentProject.members?.find(m => m.user._id === user._id)?.role === 'owner'

  return (
    <div className="fade-in">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon size={24} />
        <h2 className="text-2xl font-bold">Project Settings</h2>
      </div>

      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Project Information</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  required
                  disabled={!isOwner}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea"
                  rows={4}
                  disabled={!isOwner}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="select"
                    disabled={!isOwner}
                  >
                    <option value="web">Web Application</option>
                    <option value="mobile">Mobile App</option>
                    <option value="desktop">Desktop App</option>
                    <option value="api">API/Backend</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Complexity</label>
                  <select
                    name="complexity"
                    value={formData.complexity}
                    onChange={handleChange}
                    className="select"
                    disabled={!isOwner}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              {isOwner && (
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? <div className="loading"></div> : (
                    <>
                      <Save size={20} />
                      Update Project
                    </>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Project Code</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-600 mb-4">
              Share this code with team members to let them join the project
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-4 py-2 rounded font-mono text-lg border flex-1">
                {currentProject.code}
              </code>
              <button
                onClick={handleCopyCode}
                className="btn btn-outline"
              >
                <Copy size={16} />
                Copy
              </button>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
            </div>
            <div className="card-body">
              <p className="text-gray-600 mb-4">
                Once you delete a project, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
              >
                <Trash2 size={20} />
                Delete Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Settings