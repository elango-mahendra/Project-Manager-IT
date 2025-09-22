import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Copy } from 'lucide-react'
import { 
  Home, 
  Settings, 
  Users, 
  FileText, 
  CheckSquare, 
  AlertCircle, 
  Target,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Sidebar = ({ project }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [success, setSuccess] = useState('')
  

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { icon: Home, label: 'Overview', path: 'overview' },
    { icon: FileText, label: 'Components', path: 'components' },
    { icon: CheckSquare, label: 'Dev Status', path: 'dev-status' },
    { icon: AlertCircle, label: 'Issues', path: 'issues' },
    { icon: Target, label: 'Milestones', path: 'milestones' },
    { icon: Users, label: 'Team', path: 'team' },
    { icon: Settings, label: 'Settings', path: 'settings' }
  ]

  const handleCopyCode = () => {
    navigator.clipboard.writeText(project.code)
    setSuccess('Project code copied to clipboard')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <>
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`project-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-section">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            {project?.name}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {project?.description}
          </p>
          
          <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-4 py-2 rounded font-mono text-lg border flex-1">
                {project.code}
              </code>
              <button
                onClick={handleCopyCode}
                className="btn btn-outline"
                >
                <Copy size={16} />
                Copy
              </button>
            </div>
          {success && <div className="success-message">{success}</div>}
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Navigation</h3>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `sidebar-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-section">
          <button 
            onClick={handleLogout}
            className="sidebar-nav-link w-full text-left"
            style={{ color: 'var(--error)' }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

    </>
  )
}

export default Sidebar