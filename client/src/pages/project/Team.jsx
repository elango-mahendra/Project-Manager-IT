import React, { useState, useEffect } from 'react'
import { Users, UserPlus, UserMinus, Mail, Crown, Shield, Code, Eye } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useProject } from '../../contexts/ProjectContext'

const Team = ({ project }) => {
  const { currentProject } = useProject()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('developer')
  const [inviting, setInviting] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    fetchMembers()
  }, [currentProject._id])

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`/api/projects/${currentProject._id}/members`)
      setMembers(response.data)
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    
    try {
      await axios.post(`/api/projects/${currentProject._id}/invite`, {
        email: inviteEmail,
        role: inviteRole
      })
      setInviteEmail('')
      setInviteRole('developer')
      fetchMembers()
    } catch (error) {
      console.error('Error inviting member:', error)
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await axios.delete(`/api/projects/${currentProject._id}/members/${memberId}`)
        fetchMembers()
      } catch (error) {
        console.error('Error removing member:', error)
      }
    }
  }

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await axios.put(`/api/projects/${currentProject._id}/members/${memberId}`, {
        role: newRole
      })
      fetchMembers()
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Crown size={16} className="text-yellow-500" />
      case 'admin': return <Shield size={16} className="text-blue-500" />
      case 'developer': return <Code size={16} className="text-green-500" />
      case 'viewer': return <Eye size={16} className="text-gray-500" />
      default: return <Eye size={16} className="text-gray-500" />
    }
  }

  const canManageMembers = (userRole) => {
    return userRole === 'owner' || userRole === 'admin'
  }

  const userRole = members.find(m => m.user._id === user._id)?.role || 'viewer'

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
        <h2 className="text-2xl font-bold">Team Members</h2>
        <div className="flex items-center gap-2">
          <Users size={20} className="text-gray-500" />
          <span className="text-gray-600">{members.length} members</span>
        </div>
      </div>

      {canManageMembers(userRole) && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Invite New Member</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleInvite} className="form-row">
              <div className="form-group flex-1">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="form-group">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="select"
                >
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={inviting}
              >
                {inviting ? <div className="loading"></div> : <UserPlus size={16} />}
                Invite
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {members.map(member => (
          <div key={member._id} className="card">
            <div className="card-body">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="project-avatar">
                    {member.user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold">{member.user.username}</h4>
                    <p className="text-sm text-gray-600">{member.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {getRoleIcon(member.role)}
                    {canManageMembers(userRole) && member.role !== 'owner' ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member._id, e.target.value)}
                        className="select"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        <option value="developer">Developer</option>
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="text-sm font-medium capitalize">{member.role}</span>
                    )}
                  </div>

                  {canManageMembers(userRole) && member.role !== 'owner' && member.user._id !== user._id && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <UserMinus size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Users size={48} />
          </div>
          <h3 className="empty-state-title">No team members</h3>
          <p className="empty-state-description">
            Invite team members to collaborate on this project
          </p>
        </div>
      )}
    </div>
  )
}

export default Team