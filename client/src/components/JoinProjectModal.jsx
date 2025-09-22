import React, { useState } from 'react'
import { useProject } from '../contexts/ProjectContext'
import Modal from './Modal'

const JoinProjectModal = ({ isOpen, onClose }) => {
  const [projectCode, setProjectCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { joinProject } = useProject()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await joinProject(projectCode)
    
    if (result.success) {
      onClose()
      setProjectCode('')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Project">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Project Code</label>
          <input
            type="text"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            className="input"
            required
            placeholder="Enter project code"
            style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}
          />
          <div className="text-sm text-gray-600" style={{ marginTop: '0.5rem' }}>
            Ask the project owner for the unique project code
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
            disabled={loading || !projectCode.trim()}
          >
            {loading ? <div className="loading"></div> : 'Join Project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default JoinProjectModal