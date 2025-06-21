// ENHANCED UI VERSION - To revert, restore from previous version
import React, { useState } from 'react';

function IssueList({ issues, onDelete, onStatusChange }) {
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const nextStatus = (current) => {
    if (current === 'Open') return 'In Progress';
    if (current === 'In Progress') return 'Resolved';
    return 'Open';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return '🔴';
      case 'In Progress': return '🟡';
      case 'Resolved': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Open': return 'badge-open';
      case 'In Progress': return 'badge-progress';
      case 'Resolved': return 'badge-resolved';
      default: return 'badge-open';
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await onStatusChange(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

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
      {issues.map((issue, index) => (
        <div 
          key={issue._id} 
          className={`card issue-card fade-in`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="issue-header">
            <div className="issue-title-section">
              <h3 className="issue-title">{issue.title}</h3>
              <div className="issue-meta">
                <span className="issue-date">
                  {new Date(issue.createdAt || Date.now()).toLocaleDateString()}
                </span>
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
              onClick={() => handleStatusChange(issue._id, nextStatus(issue.status))}
              className="btn btn-secondary action-btn"
              disabled={updatingId === issue._id}
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
              onClick={() => handleDelete(issue._id)}
              className="btn btn-danger action-btn"
              disabled={deletingId === issue._id}
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
      ))}
    </div>
  );
}

export default IssueList; 