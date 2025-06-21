import React from 'react';

function IssueList({ issues, onDelete, onStatusChange }) {
  const nextStatus = (current) => {
    if (current === 'Open') return 'In Progress';
    if (current === 'In Progress') return 'Resolved';
    return 'Open';
  };

  return (
    <ul>
      {issues.map(issue => (
        <li key={issue._id} style={{ marginBottom: 16, border: '1px solid #ccc', padding: 8 }}>
          <strong>{issue.title}</strong> <br />
          <span>{issue.description}</span> <br />
          <span>Location: {issue.location}</span> <br />
          <span>Status: {issue.status}</span> <br />
          <button onClick={() => onStatusChange(issue._id, nextStatus(issue.status))}>
            Set as {nextStatus(issue.status)}
          </button>
          <button onClick={() => onDelete(issue._id)} style={{ marginLeft: 8 }}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

export default IssueList;