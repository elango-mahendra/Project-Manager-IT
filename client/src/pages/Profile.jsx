import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Lock, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    const updateData = {
      username: formData.username,
      email: formData.email
    }

    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword
      updateData.newPassword = formData.newPassword
    }

    const result = await updateProfile(updateData)
    
    if (result.success) {
      setSuccess('Profile updated successfully')
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
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
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card">
            <div className="card-header">
              <h1 className="text-2xl font-bold">Profile Settings</h1>
              <p className="text-gray-600">Update your account information</p>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User size={20} />
                    Personal Information
                  </h3>
                  
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Lock size={20} />
                    Change Password
                  </h3>
                  
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="input"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="input"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="input"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? <div className="loading"></div> : (
                    <>
                      <Save size={20} />
                      Update Profile
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile