// ENHANCED UI VERSION - To revert, restore from previous version
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import IssueForm from './components/IssueForm';
import IssueList from './components/IssueList';
import api from './api';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>⚠️ Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(Date.now());

  const fetchIssues = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const response = await api.get('/');
      
      // Handle both paginated and non-paginated responses
      const issuesData = response.data.issues || response.data;
      setIssues(Array.isArray(issuesData) ? issuesData : []);
      setLastFetch(Date.now());
      
    } catch (error) {
      console.error('Error fetching issues:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load issues';
      setError(errorMessage);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const deleteIssue = useCallback(async (id) => {
    try {
      await api.delete(`/${id}`);
      // Optimistic update
      setIssues(prevIssues => prevIssues.filter(issue => issue._id !== id));
    } catch (error) {
      console.error('Error deleting issue:', error);
      // Revert optimistic update by refetching
      fetchIssues(false);
      throw error;
    }
  }, [fetchIssues]);

  const updateStatus = useCallback(async (id, status) => {
    try {
      const response = await api.put(`/${id}`, { status });
      // Optimistic update
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue._id === id ? { ...issue, ...response.data } : issue
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert optimistic update by refetching
      fetchIssues(false);
      throw error;
    }
  }, [fetchIssues]);

  const handleIssueAdded = useCallback(() => {
    fetchIssues(false);
  }, [fetchIssues]);

  const retryFetch = useCallback(() => {
    fetchIssues(true);
  }, [fetchIssues]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: issues.length,
      open: 0,
      inProgress: 0,
      resolved: 0
    };

    issues.forEach(issue => {
      switch (issue.status) {
        case 'Open': stats.open++; break;
        case 'In Progress': stats.inProgress++; break;
        case 'Resolved': stats.resolved++; break;
      }
    });

    return stats;
  }, [issues]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchIssues();
    
    const interval = setInterval(() => {
      fetchIssues(false);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchIssues]);

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state">
          <div className="error-content">
            <h2>⚠️ Error Loading Issues</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={retryFetch} className="btn btn-primary">
                🔄 Retry
              </button>
            </div>
            <small className="error-timestamp">
              Last attempted: {new Date(lastFetch).toLocaleTimeString()}
            </small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-container">
        <div className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              <span className="title-icon">🚀</span>
              Issue Tracker
            </h1>
            <p className="app-subtitle">Manage and track community issues efficiently</p>
            <div className="header-actions">
              <button 
                onClick={() => fetchIssues(false)} 
                className="btn btn-outline refresh-btn"
                disabled={loading}
                aria-label="Refresh issues"
              >
                <span className={`refresh-icon ${loading ? 'spinning' : ''}`}>🔄</span>
                Refresh
              </button>
              <small className="last-updated">
                Last updated: {new Date(lastFetch).toLocaleTimeString()}
              </small>
            </div>
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
                <IssueForm onIssueAdded={handleIssueAdded} />
              </div>
            </div>

            <div className="list-section">
              <div className="list-header">
                <h2 className="list-title">Active Issues</h2>
                <div className="list-stats">
                  <span className="stat-item">
                    <span className="stat-number">{statistics.total}</span>
                    <span className="stat-label">Total Issues</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-number">{statistics.open}</span>
                    <span className="stat-label">Open</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-number">{statistics.inProgress}</span>
                    <span className="stat-label">In Progress</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-number">{statistics.resolved}</span>
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
                <IssueList 
                  issues={issues} 
                  onDelete={deleteIssue} 
                  onStatusChange={updateStatus} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;