// ENHANCED UI VERSION - To revert, restore from previous version
import React, { useEffect, useState } from 'react';
import IssueForm from './components/IssueForm';
import IssueList from './components/IssueList';
import api from './api';

function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await api.get('/');
      setIssues(res.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteIssue = async (id) => {
    try {
      await api.delete(`/${id}`);
      fetchIssues();
    } catch (error) {
      console.error('Error deleting issue:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/${id}`, { status });
      fetchIssues();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <div className="app-container">
      <div className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">🚀</span>
            Issue Tracker
          </h1>
          <p className="app-subtitle">Manage and track community issues efficiently</p>
        </div>
      </div>

      <div className="app-content">
        <div className="content-grid">
          <div className="form-section">
            <div className="card form-card">
              <div className="card-header">
                <h2 className="card-title">Report New Issue</h2>
                <p className="card-subtitle">Help us improve by reporting issues you encounter</p>
              </div>
              <IssueForm onIssueAdded={fetchIssues} />
            </div>
          </div>

          <div className="list-section">
            <div className="list-header">
              <h2 className="list-title">Active Issues</h2>
              <div className="list-stats">
                <span className="stat-item">
                  <span className="stat-number">{issues.length}</span>
                  <span className="stat-label">Total Issues</span>
                </span>
                <span className="stat-item">
                  <span className="stat-number">{issues.filter(i => i.status === 'Open').length}</span>
                  <span className="stat-label">Open</span>
                </span>
                <span className="stat-item">
                  <span className="stat-number">{issues.filter(i => i.status === 'In Progress').length}</span>
                  <span className="stat-label">In Progress</span>
                </span>
                <span className="stat-item">
                  <span className="stat-number">{issues.filter(i => i.status === 'Resolved').length}</span>
                  <span className="stat-label">Resolved</span>
                </span>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading issues...</p>
              </div>
            ) : (
              <IssueList issues={issues} onDelete={deleteIssue} onStatusChange={updateStatus} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;