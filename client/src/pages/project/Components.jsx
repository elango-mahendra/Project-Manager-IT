import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, Folder, File, FileText } from 'lucide-react'
import axios from 'axios'
import Modal from '../../components/Modal'
import { useProject } from '../../contexts/ProjectContext'

const Components = () => {
  const { currentProject } = useProject()
  const [components, setComponents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingComponent, setEditingComponent] = useState(null)
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [draggedItemId, setDraggedItemId] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'backlog',
    parentId: null,
    type: 'component'
  })

  useEffect(() => {
    if (currentProject?._id) fetchComponents()
  }, [currentProject?._id])

  const fetchComponents = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/projects/${currentProject._id}/components`)
      setComponents(response.data)
      console.log('Fetched components:', response.data)
    } catch (error) {
      console.error('Error fetching components:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingComponent) {
        await axios.put(`/api/projects/${currentProject._id}/components/${editingComponent._id}`, formData)
      } else {
        await axios.post(`/api/projects/${currentProject._id}/components`, formData)
      }
      fetchComponents()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving component:', error)
    }
  }

  const handleDelete = async (componentId) => {
    if (window.confirm('Are you sure you want to delete this component?')) {
      try {
        await axios.delete(`/api/projects/${currentProject._id}/components/${componentId}`)
        fetchComponents()
      } catch (error) {
        console.error('Error deleting component:', error)
      }
    }
  }

  const handleEdit = (component) => {
    setEditingComponent(component)
    setFormData({
      title: component.title,
      description: component.description,
      priority: component.priority,
      status: component.status,
      parentId: component.parentId,
      type: component.type
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingComponent(null)
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'backlog',
      parentId: null,
      type: 'component'
    })
  }

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems)
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id)
    setExpandedItems(newExpanded)
  }

  const buildTree = (items, parentId = null) => {
    return items
      .filter(item => {
        // Handle both null parentId and self-referencing folders
        if (parentId === null) {
          return item.parentId === null || item.parentId === item._id
        }
        return item.parentId === parentId && item.parentId !== item._id
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(item => ({
        ...item,
        children: buildTree(items, item._id)
      }))
  }

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id)
    setDraggedItemId(id)
  }

  const handleDrop = async (e, dropStatus) => {
    // e.preventDefault()
    // const id = e.dataTransfer.getData('text/plain') || draggedItemId

    // try {
    //   await axios.put(`/api/projects/${currentProject._id}/components/${id}`, { status: dropStatus })
    //   fetchComponents()
    // } catch (error) {
    //   console.error('Error updating component status:', error)
    // }
    // setDraggedItemId(null)
  }

  const renderTree = (tree, level = 0) => {
    return tree.map(item => (
      <div
        key={item._id}
        className={`tree-item ${level > 0 ? 'ml-6' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, item._id)}
        onDrop={(e) => handleDrop(e, item.status)}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <button
            onClick={() => toggleExpanded(item._id)}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={item.children.length === 0}
          >
            {item.children.length > 0 ? (
              expandedItems.has(item._id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center gap-2">
            {item.type === 'folder' ? (
              <Folder size={16} className="text-yellow-600" />
            ) : (
              <File size={16} className="text-blue-600" />
            )}
            <span className="font-medium">{item.title}</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className={`badge priority-${item.priority}`}>{item.priority}</span>
            <span className={`badge status-${item.status.replace(' ', '-')}`}>{item.status}</span>
            <button onClick={() => handleEdit(item)} className="p-1 hover:bg-gray-100 rounded">
              <Edit size={14} />
            </button>
            <button onClick={() => handleDelete(item._id)} className="p-1 hover:bg-gray-100 rounded text-red-600">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {item.description && <p className="text-sm text-gray-600 mt-2 ml-6">{item.description}</p>}

        {expandedItems.has(item._id) && item.children.length > 0 && (
          <div className="mt-2">{renderTree(item.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  const componentTree = buildTree(components)

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
        <h2 className="text-2xl font-bold">Components</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={20} /> Add Component
        </button>
      </div>

      {componentTree.length > 0 ? (
        <div className="space-y-4">{renderTree(componentTree)}</div>
      ) : (
        <div className="empty-state text-center">
          <FileText size={48} className="mx-auto mb-2 text-gray-400" />
          <h3 className="text-lg font-semibold">No components yet</h3>
          <p className="text-gray-500 mb-4">Create your first component to get started</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add Component
          </button>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingComponent ? 'Edit Component' : 'Add Component'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="form-label">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="select"
              >
                <option value="component">Component</option>
                <option value="folder">Folder</option>
              </select>
            </div>

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

          <div className="form-group">
            <label className="form-label">Parent Folder</label>
            <select
              value={formData.parentId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, parentId: e.target.value || null }))}
              className="select"
            >
              <option value="">None</option>
              {components.filter(c => c.type === 'folder').map(folder => (
                <option key={folder._id} value={folder._id}>{folder.title}</option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={handleCloseModal} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingComponent ? 'Update' : 'Create'} Component
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Components