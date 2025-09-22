  import React, { useState, useEffect } from 'react'
  import { useProject } from '../../contexts/ProjectContext'
  import { Plus } from 'lucide-react'
  import axios from 'axios'
  // import styles from './DevStatus.module.css'

  const DevStatus = () => {
    const { currentProject } = useProject()
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)

    const columns = [
      { id: 'backlog', title: 'Backlog', color: 'bg-gray-200' },
      { id: 'dev-ready', title: 'Dev Ready', color: 'bg-blue-200' },
      { id: 'dev-progress', title: 'In Progress', color: 'bg-yellow-200' },
      { id: 'dev-done', title: 'Dev Done', color: 'bg-green-200' },
      { id: 'completed', title: 'Completed', color: 'bg-green-300' }
    ]

    useEffect(() => {
      if (currentProject?._id) fetchIssues()
    }, [currentProject?._id])

    const fetchIssues = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/api/projects/${currentProject._id}/issues`)
        setIssues(res.data)
      } catch (err) {
        console.error('Error fetching issues:', err)
      } finally {
        setLoading(false)
      }
    }

    const handleDragStart = (e, issueId) => {
      e.dataTransfer.setData('text/plain', issueId)
    }

   const handleDrop = async (e, newStatus) => {
  e.preventDefault()
  const issueId = e.dataTransfer.getData('text/plain')
  const draggedIssue = issues.find(i => i._id === issueId)

  if (!draggedIssue) return

  try {
    await axios.put(`/api/projects/${currentProject._id}/issues/${issueId}`, {
      title: draggedIssue.title,
      description: draggedIssue.description,
      priority: draggedIssue.priority,
      status: newStatus,
      type: draggedIssue.type,
      componentId: draggedIssue.component?._id || null,
      assigneeId: draggedIssue.assignee?._id || null,
      tags: draggedIssue.tags || [],
      dueDate: draggedIssue.dueDate || null,
      estimatedHours: draggedIssue.estimatedHours || null,
      actualHours: draggedIssue.actualHours || null
    })
    fetchIssues()
  } catch (err) {
    console.error('Error updating status:', err)
    console.log(err.response?.data)
  }
}

    const handleDragOver = (e) => e.preventDefault()

    const getIssuesByStatus = (status) => issues.filter(issue => issue.status === status)

    if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>

  return (
    <div className="dev-status-container">
      <div className="dev-status-header">
        <h2>Development Status</h2>
      </div>

      <div className="dev-status-board">
        {columns.map(column => (
          <div
            key={column.id}
            className="dev-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`dev-column-header ${column.color}`}>
              <h3>{column.title}</h3>
              <span>({getIssuesByStatus(column.id).length})</span>
            </div>

            <div className="dev-column-body">
              {getIssuesByStatus(column.id).map(issue => (
                <div
                  key={issue._id}
                  className="dev-issue-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, issue._id)}
                >
                  <div className="dev-issue-header">
                    <h4>{issue.title}</h4>
                    <span className={`priority-badge ${issue.priority}`}>{issue.priority}</span>
                  </div>

                  {issue.description && (
                    <p className="dev-issue-description">
                      {issue.description.substring(0, 100)}...
                    </p>
                  )}

                  <div className="dev-issue-footer">
                    <span>#{issue._id.slice(0, 8)}</span>
                    {issue.assignee && (
                      <div className="avatar">
                        {issue.assignee.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  }
  export default DevStatus
