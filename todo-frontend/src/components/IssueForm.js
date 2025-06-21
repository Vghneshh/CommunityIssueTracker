// ENHANCED UI VERSION - To revert, restore from previous version
import React, { useState } from 'react';
import api from '../api';

function IssueForm({ onIssueAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/', formData);
      setFormData({ title: '', description: '', location: '' });
      setErrors({});
      onIssueAdded();
      
      // Show success feedback
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '✓ Issue Reported!';
      submitBtn.style.background = 'linear-gradient(135deg, var(--success-color), #059669)';
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = '';
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting issue:', error);
      setErrors({ submit: 'Failed to submit issue. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="issue-form">
      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Issue Title <span className="required">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="Brief description of the issue"
          value={formData.title}
          onChange={handleChange}
          className={`input ${errors.title ? 'input-error' : ''}`}
          disabled={isSubmitting}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description <span className="required">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Detailed description of the issue"
          value={formData.description}
          onChange={handleChange}
          className={`input textarea ${errors.description ? 'input-error' : ''}`}
          rows="4"
          disabled={isSubmitting}
        />
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="location" className="form-label">
          Location <span className="required">*</span>
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="Where did you encounter this issue?"
          value={formData.location}
          onChange={handleChange}
          className={`input ${errors.location ? 'input-error' : ''}`}
          disabled={isSubmitting}
        />
        {errors.location && <span className="error-message">{errors.location}</span>}
      </div>

      {errors.submit && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {errors.submit}
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary submit-btn"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="loading-dots"></span>
            Submitting...
          </>
        ) : (
          <>
            <span className="btn-icon">📝</span>
            Report Issue
          </>
        )}
      </button>
    </form>
  );
}

export default IssueForm; 