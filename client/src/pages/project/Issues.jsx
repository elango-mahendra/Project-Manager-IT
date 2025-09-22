import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import axios from 'axios'
import Modal from '../../components/Modal'
import { useProject } from '../../contexts/ProjectContext'
const Issues = ({ project }) => {
  const { currentProject } = useProject()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingIssue, setEditingIssue] = useState(null)
  const [filter, setFilter] = useState('all')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'backlog',
    assigneeId: ''
  })

  useEffect(() => {
    fetchIssues()
  }, [currentProject._id])

  const fetchIssues = async () => {
    try {
      const response = await axios.get(`/api/projects/${currentProject._id}/issues`)
      setIssues(response.data)
    } catch (error) {
      console.error('Error fetching issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingIssue) {
        await axios.put(`/api/projects/${currentProject._id}/issues/${editingIssue._id}`, formData)
      } else {
        await axios.post(`/api/projects/${currentProject._id}/issues`, formData)
      }
      fetchIssues()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving issue:', error)
    }
  }

  const handleDelete = async (issueId) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await axios.delete(`/api/projects/${currentProject._id}/issues/${issueId}`)
        fetchIssues()
      } catch (error) {
        console.error('Error deleting issue:', error)
      }
    }
  }

  const handleEdit = (issue) => {
    setEditingIssue(issue)
    setFormData({
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
      status: issue.status,
      assigneeId: issue.assignee?._id || ''
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingIssue(null)
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'backlog',
      assigneeId: ''
    })
  }

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true
    return issue.status === filter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading"></div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Issues</h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Add Issue
        </button>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          >
            All ({issues.length})
          </button>
          <button
            onClick={() => setFilter('backlog')}
            className={`btn ${filter === 'backlog' ? 'btn-primary' : 'btn-outline'}`}
          >
            Backlog ({issues.filter(i => i.status === 'backlog').length})
          </button>
          <button
            onClick={() => setFilter('dev-progress')}
            className={`btn ${filter === 'dev-progress' ? 'btn-primary' : 'btn-outline'}`}
          >
            In Progress ({issues.filter(i => i.status === 'dev-progress').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
          >
            Completed ({issues.filter(i => i.status === 'completed').length})
          </button>
        </div>
      </div>

      {filteredIssues.length > 0 ? (
        <div className="space-y-4">
          {filteredIssues.map(issue => (
            <div key={issue._id} className="card">
              <div className="card-body">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <h3 className="font-semibold">{issue.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge priority-${issue.priority}`}>
                      {issue.priority}
                    </span>
                    <span className={`badge status-${issue.status.replace(' ', '-')}`}>
                      {issue.status}
                    </span>
                    <button
                      onClick={() => handleEdit(issue)}
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(issue._id)}
                      className="btn btn-danger"
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {issue.description && (
                  <p className="text-gray-700 mb-3">{issue.description}</p>
                )}

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>
                    Created {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                  {issue.assignee && (
                    <div className="flex items-center gap-2">
                      <span>Assigned to:</span>
                      <div className="project-avatar">
                        {issue.assignee.username.charAt(0).toUpperCase()}
                      </div>
                      <span>{issue.assignee.username}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">
            <AlertCircle size={48} />
          </div>
          <h3 className="empty-state-title">No issues found</h3>
          <p className="empty-state-description">
            {filter === 'all' 
              ? 'Create your first issue to get started' 
              : `No issues in ${filter} status`
            }
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} />
            Add Issue
          </button>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingIssue ? 'Edit Issue' : 'Add Issue'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="textarea"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="select"
              >
                <option value="backlog">Backlog</option>
                <option value="dev-ready">Dev Ready</option>
                <option value="dev-progress">Dev In Progress</option>
                <option value="dev-done">Dev Done</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingIssue ? 'Update' : 'Create'} Issue
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Issues