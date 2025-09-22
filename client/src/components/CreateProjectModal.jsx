import React, { useState } from 'react'
import { useProject } from '../contexts/ProjectContext'
import Modal from './Modal'

const CreateProjectModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'web',
    complexity: 'medium'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { createProject } = useProject()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createProject(formData)
    
    if (result.success) {
      onClose()
      setFormData({ name: '', description: '', type: 'web', complexity: 'medium' })
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
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
            placeholder="Enter project name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="textarea"
            placeholder="Describe your project..."
            rows={4}
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
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="modal-footer">
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <div className="loading"></div> : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateProjectModal