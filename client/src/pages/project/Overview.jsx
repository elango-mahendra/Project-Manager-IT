import { Calendar, Users, FileText, CheckSquare, AlertCircle, Target } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import axios from 'axios';

const Overview = () => {
  const { currentProject} = useProject();
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 5
  const [activities, setActivities] = useState([]);
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  
  
  
  useEffect(() => {
    if (currentProject._id) {
      fetchActivities();
    }
  }, [currentProject._id]);
  
  const fetchActivities = async () => {
    try {
      const res = await axios.get(`/api/projects/${currentProject._id}/activities`);
      const sortedData = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActivities(sortedData);

      // console.log('Activities fetched:', res.data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };
  
  useEffect(() => {
  const container = document.querySelector('.overview-activity-list');
  if (container) container.scrollIntoView({ behavior: 'smooth' });
  }, [currentPage]);
  if (!currentProject) {
    return <p className="overview-empty-state">Project data not available.</p>;
  }

  const stats = [
    { 
      icon: FileText, 
      label: 'Components', 
      value: currentProject.stats?.components || 0,
      color: 'overview-stat-icon-blue'
    },
    { 
      icon: CheckSquare, 
      label: 'Tasks', 
      value: currentProject.stats?.tasks || 0,
      color: 'overview-stat-icon-green'
    },
    { 
      icon: AlertCircle, 
      label: 'Issues', 
      value: currentProject.stats?.issues || 0,
      color: 'overview-stat-icon-red'
    },
    { 
      icon: Target, 
      label: 'Milestones', 
      value: currentProject.stats?.milestones || 0,
      color: 'overview-stat-icon-purple'
    }
  ];

  return (
    <div className="overview-container">
      <div className="overview-header">
        <h1 className="overview-title">{currentProject.name}</h1>
        <p className="overview-description">{currentProject.description}</p>
      </div>

      <div className="overview-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="overview-stat-card">
            <div className="overview-stat-content">
              <div className="overview-stat-info">
                <p className="overview-stat-label">{stat.label}</p>
                <p className="overview-stat-value">{stat.value}</p>
              </div>
              <stat.icon size={24} className={`overview-stat-icon ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="overview-details-grid">
        <div className="overview-info-card">
          <div className="overview-card-header">
            <h3 className="overview-card-title">Project Information</h3>
          </div>
          <div className="overview-card-body">
            <div className="overview-info-grid">
              <div className="overview-info-item">
                <label className="overview-info-label">Type</label>
                <p className="overview-info-value capitalize">{currentProject.type}</p>
              </div>
              <div className="overview-info-item">
                <label className="overview-info-label">Complexity</label>
                <p className="overview-info-value capitalize">{currentProject.complexity}</p>
              </div>
              <div className="overview-info-item">
                <label className="overview-info-label">Created</label>
                <p className="overview-info-value">{new Date(currentProject.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="overview-info-item">
                <label className="overview-info-label">Team Size</label>
                <p className="overview-info-value">{currentProject.members?.length || 0} members</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overview-activity-card">
          <div className="overview-card-header">
            <h3 className="overview-card-title">Recent Activity</h3>
          </div>
          <div className="overview-card-body">
            {activities.length > 0 ? (
              <>
                <div className="overview-activity-list">
                  {activities
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((activity, index) => (
                      <div key={index} className="overview-activity-item">
                        <div className="overview-activity-bullet"></div>
                        <div className="overview-activity-content">
                          <p className="overview-activity-text">
                            <span className="overview-activity-action">{activity.action}</span> - {activity.entityTitle}
                          </p>
                          <p className="overview-activity-meta">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="pagination-controls">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ◀ Prev
                  </button>
                  <span>
                    Page {currentPage} of {Math.ceil(activities.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next ▶
                  </button>
                </div>
              </>
            ) : (
              <div className="overview-empty-state">
                <p className="overview-empty-text">No recent activity</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Overview;