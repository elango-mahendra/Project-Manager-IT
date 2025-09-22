import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Target, Calendar, ChevronDown, ChevronRight, X } from 'lucide-react';
import axios from 'axios';
import Modal from '../../components/Modal';
import { useProject } from '../../contexts/ProjectContext';

const Milestones = () => {
  const { currentProject } = useProject();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    dueDate: '', 
    status: 'not-started' 
  });
  const [issues, setIssues] = useState([]);
  const [components, setComponents] = useState([]);

  useEffect(() => {
    if (currentProject._id) {
      fetchMilestones();
      fetchAssets();
    }
  }, [currentProject._id]);

  const fetchMilestones = async () => {    try {
      const res = await axios.get(`/api/projects/${currentProject._id}/milestones`);
      setMilestones(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    const [iRes, cRes] = await Promise.all([
      axios.get(`/api/projects/${currentProject._id}/issues`),
      axios.get(`/api/projects/${currentProject._id}/components`)
    ]);
    setIssues(iRes.data);
    setComponents(cRes.data);
  };

  const calculateProgress = (milestone) => {
    const all = [...milestone.linkedIssues, ...milestone.linkedComponents];
    if (!all.length) return 0;
    const done = all.filter(item => item.status === 'completed').length;
    return Math.round((done / all.length) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMilestone) {
        await axios.put(`/api/projects/${currentProject._id}/milestones/${editingMilestone._id}`, {
          ...formData,
          linkedIssues: editingMilestone.linkedIssues?.map(i => i._id),
          linkedComponents: editingMilestone.linkedComponents?.map(c => c._id)
        });
      } else {
        await axios.post(`/api/projects/${currentProject._id}/milestones`, formData);
      }
      fetchMilestones();
      handleCloseModal();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    await axios.delete(`/api/projects/${currentProject._id}/milestones/${id}`);
    fetchMilestones();
  };

  const handleEdit = (milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description,
      dueDate: milestone.dueDate?.split('T')[0] || '',
      status: milestone.status
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMilestone(null);
    setFormData({ title: '', description: '', dueDate: '', status: 'not-started' });
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleLink = async (type, milestone, itemId) => {
    const updated = {
      linkedIssues: milestone.linkedIssues.map(i => i._id),
      linkedComponents: milestone.linkedComponents.map(c => c._id)
    };
    if (type === 'issue' && !updated.linkedIssues.includes(itemId)) updated.linkedIssues.push(itemId);
    if (type === 'component' && !updated.linkedComponents.includes(itemId)) updated.linkedComponents.push(itemId);

    const progress = calculateProgress({
      ...milestone,
      linkedIssues: issues.filter(i => updated.linkedIssues.includes(i._id)),
      linkedComponents: components.filter(c => updated.linkedComponents.includes(c._id))
    });

    await axios.put(`/api/projects/${currentProject._id}/milestones/${milestone._id}`, {
      ...milestone,
      ...updated,
      progress
    });
    fetchMilestones();
  };

  const handleUnlink = async (type, milestone, itemId) => {
    const updated = {
      linkedIssues: milestone.linkedIssues.map(i => i._id).filter(id => !(type === 'issue' && id === itemId)),
      linkedComponents: milestone.linkedComponents.map(c => c._id).filter(id => !(type === 'component' && id === itemId))
    };

    const progress = calculateProgress({
      ...milestone,
      linkedIssues: issues.filter(i => updated.linkedIssues.includes(i._id)),
      linkedComponents: components.filter(c => updated.linkedComponents.includes(c._id))
    });

    await axios.put(`/api/projects/${currentProject._id}/milestones/${milestone._id}`, {
      ...milestone,
      ...updated,
      progress
    });
    fetchMilestones();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'milestone-status-completed';
      case 'in-progress': return 'milestone-status-in-progress';
      default: return 'milestone-status-not-started';
    }
  };

  if (loading) return <div className="milestones-loading">Loading...</div>;

  return (
    <div className="milestones-container">
      <div className="milestones-header">
        <h2 className="milestones-title">Milestones</h2>
        <button 
          onClick={() => setShowModal(true)} 
          className="milestones-add-button"
        >
          <Plus size={18} /> Add Milestone
        </button>
      </div>

      {milestones.map(m => (
        <div key={m._id} className="milestone-card">
          <div className="milestone-card-header">
            <div 
              className="milestone-title-container" 
              onClick={() => toggleExpand(m._id)}
            >
              {expandedIds.includes(m._id) ? 
                <ChevronDown size={16} className="milestone-expand-icon" /> : 
                <ChevronRight size={16} className="milestone-expand-icon" />
              }
              <Target size={16} className="milestone-target-icon" />
              <h3 className="milestone-name">{m.title}</h3>
              <span className={`milestone-status ${getStatusColor(m.status)}`}>
                {m.status.replace('-', ' ')}
              </span>
            </div>
            <div className="milestone-actions">
              <button 
                onClick={() => handleEdit(m)} 
                className="milestone-edit-button"
              >
                <Edit size={14} />
              </button>
              <button 
                onClick={() => handleDelete(m._id)} 
                className="milestone-delete-button"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <p className="milestone-description">{m.description}</p>

          <div className="milestone-meta">
            <div className="milestone-dates">
              <span>Created: {new Date(m.createdAt).toLocaleDateString()}</span>
              {m.dueDate && (
                <span className="milestone-due-date">
                  <Calendar size={14} className="milestone-calendar-icon" /> 
                  Due: {new Date(m.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="milestone-progress-container">
              <span className="milestone-progress-label">Progress:</span>
              <div className="milestone-progress-bar">
                <div 
                  className="milestone-progress-fill" 
                  style={{ width: `${calculateProgress(m)}%` }}
                ></div>
              </div>
              <span className="milestone-progress-percent">{calculateProgress(m)}%</span>
            </div>
          </div>

          {expandedIds.includes(m._id) && (
            <div className="milestone-details">
              <div className="milestone-linked-section">
                <h4 className="milestone-linked-title">Linked Issues</h4>
                <div className="milestone-linked-items">
                  {m.linkedIssues?.map(issue => (
                    <div key={issue._id} className="milestone-linked-item">
                      <span className="milestone-linked-item-text">
                        • {issue.title} <span className="milestone-linked-item-status">({issue.status})</span>
                      </span>
                      <button 
                        onClick={() => handleUnlink('issue', m, issue._id)} 
                        className="milestone-unlink-button"
                        title="Unlink"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <select 
                  onChange={e => handleLink('issue', m, e.target.value)} 
                  className="milestone-link-select"
                >
                  <option value="">+ Link issue</option>
                  {issues.filter(i => !m.linkedIssues.some(l => l._id === i._id)).map(i => (
                    <option key={i._id} value={i._id}>{i.title}</option>
                  ))}
                </select>
              </div>

              <div className="milestone-linked-section">
                <h4 className="milestone-linked-title">Linked Components</h4>
                <div className="milestone-linked-items">
                  {m.linkedComponents?.map(comp => (
                    <div key={comp._id} className="milestone-linked-item">
                      <span className="milestone-linked-item-text">
                        • {comp.title} <span className="milestone-linked-item-status">({comp.status})</span>
                      </span>
                      <button 
                        onClick={() => handleUnlink('component', m, comp._id)} 
                        className="milestone-unlink-button"
                        title="Unlink"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <select 
                  onChange={e => handleLink('component', m, e.target.value)} 
                  className="milestone-link-select"
                >
                  <option value="">+ Link component</option>
                  {components.filter(c => !m.linkedComponents.some(l => l._id === c._id)).map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      ))}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingMilestone ? 'Edit Milestone' : 'Add Milestone'}>
        <form onSubmit={handleSubmit} className="milestone-form">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.title} 
              onChange={e => setFormData({ ...formData, title: e.target.value })} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea" 
              value={formData.description} 
              onChange={e => setFormData({ ...formData, description: e.target.value })} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.dueDate} 
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-select" 
                value={formData.status} 
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="form-cancel-button" 
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="form-submit-button"
            >
              {editingMilestone ? 'Update' : 'Create'} Milestone
            </button>
          </div>
        </form>
      </Modal>


    </div>
  );
};

export default Milestones;