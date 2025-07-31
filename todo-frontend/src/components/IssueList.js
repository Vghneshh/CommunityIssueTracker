// ENHANCED UI VERSION - To revert, restore from previous version
import React, { useState, useCallback, memo, useMemo } from 'react';

const IssueItem = memo(({ issue, onDelete, onStatusChange, deletingId, updatingId, index }) => {
  const nextStatus = useCallback((current) => {
    if (current === 'Open') return 'In Progress';
    if (current === 'In Progress') return 'Resolved';
    return 'Open';
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'Open': return '🔴';
      case 'In Progress': return '🟡';
      case 'Resolved': return '🟢';
      default: return '⚪';
    }
  }, []);

  const getStatusBadgeClass = useCallback((status) => {
    switch (status) {
      case 'Open': return 'badge-open';
      case 'In Progress': return 'badge-progress';
      case 'Resolved': return 'badge-resolved';
      default: return 'badge-open';
    }
  }, []);

  const getPriorityIcon = useCallback((priority) => {
    switch (priority) {
      case 'Low': return '🟢';
      case 'Medium': return '🟡';
      case 'High': return '🟠';
      case 'Critical': return '🔴';
      default: return '⚪';
    }
  }, []);

  const formatDate = useCallback((dateString) => {
    try {
      return new Date(dateString || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  }, []);

  const handleDelete = useCallback(() => {
    onDelete(issue._id);
  }, [issue._id, onDelete]);

  const handleStatusChange = useCallback(() => {
    onStatusChange(issue._id, nextStatus(issue.status));
  }, [issue._id, issue.status, nextStatus, onStatusChange]);

  return (
    <div 
      className={`card issue-card fade-in`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="issue-header">
        <div className="issue-title-section">
          <h3 className="issue-title">{issue.title}</h3>
          <div className="issue-meta">
            <span className="issue-date">
              {formatDate(issue.createdAt)}
            </span>
            {issue.priority && (
              <span className="priority-badge">
                <span className="priority-icon">{getPriorityIcon(issue.priority)}</span>
                {issue.priority}
              </span>
            )}
            {issue.daysSinceCreated !== undefined && (
              <span className="days-since">
                {issue.daysSinceCreated} days ago
              </span>
            )}
          </div>
        </div>
        <div className="issue-status">
          <span className={`badge ${getStatusBadgeClass(issue.status)}`}>
            <span className="status-icon">{getStatusIcon(issue.status)}</span>
            {issue.status}
          </span>
        </div>
      </div>

      <div className="issue-content">
        <p className="issue-description">{issue.description}</p>
        <div className="issue-location">
          <span className="location-icon">📍</span>
          <span>{issue.location}</span>
        </div>
      </div>

      <div className="issue-actions">
        <button
          onClick={handleStatusChange}
          className="btn btn-secondary action-btn"
          disabled={updatingId === issue._id}
          aria-label={`Set status to ${nextStatus(issue.status)}`}
        >
          {updatingId === issue._id ? (
            <>
              <span className="loading-dots"></span>
              Updating...
            </>
          ) : (
            <>
              <span className="btn-icon">🔄</span>
              Set as {nextStatus(issue.status)}
            </>
          )}
        </button>

        <button
          onClick={handleDelete}
          className="btn btn-danger action-btn"
          disabled={deletingId === issue._id}
          aria-label="Delete issue"
        >
          {deletingId === issue._id ? (
            <>
              <span className="loading-dots"></span>
              Deleting...
            </>
          ) : (
            <>
              <span className="btn-icon">🗑️</span>
              Delete
            </>
          )}
        </button>
      </div>
    </div>
  );
});

IssueItem.displayName = 'IssueItem';

const IssueList = memo(({ issues, onDelete, onStatusChange }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const handleDelete = useCallback(async (id) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }, [onDelete]);

  const handleStatusChange = useCallback(async (id, status) => {
    setUpdatingId(id);
    try {
      await onStatusChange(id, status);
    } finally {
      setUpdatingId(null);
    }
  }, [onStatusChange]);

  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => {
      // Sort by priority first (Critical > High > Medium > Low)
      const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by status (Open > In Progress > Resolved)
      const statusOrder = { 'Open': 3, 'In Progress': 2, 'Resolved': 1 };
      const statusDiff = (statusOrder[b.status] || 1) - (statusOrder[a.status] || 1);
      if (statusDiff !== 0) return statusDiff;
      
      // Finally by creation date (newest first)
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [issues]);

  const issueStats = useMemo(() => {
    const stats = {
      total: issues.length,
      open: 0,
      inProgress: 0,
      resolved: 0,
      byPriority: { 'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0 }
    };

    issues.forEach(issue => {
      switch (issue.status) {
        case 'Open': stats.open++; break;
        case 'In Progress': stats.inProgress++; break;
        case 'Resolved': stats.resolved++; break;
      }
      
      if (issue.priority) {
        stats.byPriority[issue.priority]++;
      }
    });

    return stats;
  }, [issues]);

  if (issues.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3 className="empty-title">No Issues Found</h3>
        <p className="empty-description">
          Great! It looks like there are no active issues at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="issues-container">
      <div className="issues-stats-summary">
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-number">{issueStats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{issueStats.open}</span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{issueStats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{issueStats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
        
        <div className="priority-stats">
          <span className="priority-stat">
            🔴 {issueStats.byPriority.Critical} Critical
          </span>
          <span className="priority-stat">
            🟠 {issueStats.byPriority.High} High
          </span>
          <span className="priority-stat">
            🟡 {issueStats.byPriority.Medium} Medium
          </span>
          <span className="priority-stat">
            🟢 {issueStats.byPriority.Low} Low
          </span>
        </div>
      </div>

      <div className="issues-list">
        {sortedIssues.map((issue, index) => (
          <IssueItem
            key={issue._id}
            issue={issue}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            deletingId={deletingId}
            updatingId={updatingId}
            index={index}
          />
        ))}
      </div>
    </div>
  );
});

IssueList.displayName = 'IssueList';

export default IssueList; 