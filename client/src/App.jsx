import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Project from './pages/Project'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import Overview from './pages/project/Overview'
import Components from './pages/project/Components'
import DevStatus from './pages/project/DevStatus'
import Issues from './pages/project/Issues'
import Milestones from './pages/project/Milestones'
import Team from './pages/project/Team'
import Settings from './pages/project/Settings'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              <Route path="/project/:id" element={
                <ProtectedRoute>
                  <Project />
                </ProtectedRoute>
              }>
                {/* Nested Routes inside Project */}
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<Overview />} />
                <Route path="components" element={<Components />} />
                <Route path="dev-status" element={<DevStatus />} />
                <Route path="issues" element={<Issues />} />
                <Route path="milestones" element={<Milestones />} />
                <Route path="team" element={<Team />} />
                <Route path="settings" element={<Settings />} />
              </Route> 

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </ProjectProvider>
    </AuthProvider>
  )
}

export default App
