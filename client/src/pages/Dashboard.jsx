import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users,User, Settings, LogOut, Search, Filter } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useProject } from '../contexts/ProjectContext'
import CreateProjectModal from '../components/CreateProjectModal'
import JoinProjectModal from '../components/JoinProjectModal'

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isOpenSetting,setOpenSetting]=useState(false)

  const { user, logout } = useAuth()
  const { projects, loading, fetchProjects } = useProject()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || project.type === filterType
    return matchesSearch && matchesFilter
  })

  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase()
  }

  const handleSettingClick=()=>{
    setOpenSetting(!isOpenSetting)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'badge-primary'
      case 'admin': return 'badge-warning'
      case 'developer': return 'badge-secondary'
      default: return 'badge-secondary'
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="container">
          <nav className="dashboard-nav">
            <div className="dashboard-logo">ProjectFlow</div>
            <div className="dashboard-user">
              <span className="text-gray-600">Welcome, {user?.username}</span>
              <div className="dropdown">
                <button className="btn btn-outline" onClick={()=>handleSettingClick()}>
                  <Settings size={16} />
                </button>
                {isOpenSetting && 
                  <div className="dropdown-content">
                    <button 
                      className="dropdown-item"
                      onClick={() => navigate('/profile')}
                    >
                      <User size={20} />
                      Profile
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      Logout
                    </button> 
                  </div>
                }
              </div> 
            </div>
          </nav>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <div className="dashboard-welcome">
            <h1>Your Projects</h1>
            <p>Manage and collaborate on your projects with ease</p>
          </div>

          <div className="dashboard-actions">
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={20} />
              Create Project
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowJoinModal(true)}
            >
              <Users size={20} />
              Join Project
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="select"
              >
                <option value="all">All Types</option>
                <option value="web">Web Application</option>
                <option value="mobile">Mobile App</option>
                <option value="desktop">Desktop App</option>
                <option value="api">API/Backend</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="loading"></div>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="projects-grid">
              {filteredProjects.map(project => (
                <div 
                  key={project._id}
                  className="project-card hover-shadow"
                  onClick={() => navigate(`/project/${project._id}`)}
                >
                  <div className="project-card-header">
                    <div>
                      <h3 className="project-card-title">{project.name}</h3>
                      <div className="project-card-meta">
                        <span className={`badge ${getRoleColor(project.userRole)}`}>
                          {project.userRole}
                        </span>
                        <span className="badge badge-secondary">
                          {project.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="project-card-description">
                    {project.description || 'No description provided'}
                  </p>
                  
                  <div className="project-card-footer">
                    <div className="project-members">
                      <Users size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {project.members?.length || 0} members
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Plus size={48} />
              </div>
              <h3 className="empty-state-title">No projects found</h3>
              <p className="empty-state-description">
                {searchTerm || filterType !== 'all' 
                  ? 'No projects match your current filters' 
                  : 'Create your first project or join an existing one'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <div className="flex gap-4">
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <Plus size={16} />
                    Create Project
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowJoinModal(true)}
                  >
                    <Users size={16} />
                    Join Project
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
      <JoinProjectModal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)} 
      />
    </div>
  )
}

export default Dashboard