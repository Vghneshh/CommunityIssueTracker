// ENHANCED UI VERSION - To revert, restore from previous version
import React, { useState, useCallback, memo } from 'react';
import api from '../api';

const IssueForm = memo(({ onIssueAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    priority: 'Medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
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
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length > 200) newErrors.title = 'Title cannot exceed 200 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length > 2000) newErrors.description = 'Description cannot exceed 2000 characters';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.location.length > 500) newErrors.location = 'Location cannot exceed 500 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const showSuccessFeedback = useCallback((submitBtn) => {
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '✓ Issue Reported!';
    submitBtn.style.background = 'linear-gradient(135deg, var(--success-color), #059669)';
    
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.style.background = '';
    }, 2000);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/', formData);
      setFormData({ title: '', description: '', location: '', priority: 'Medium' });
      setErrors({});
      onIssueAdded();
      
      // Show success feedback
      const submitBtn = e.target.querySelector('button[type="submit"]');
      showSuccessFeedback(submitBtn);
      
    } catch (error) {
      console.error('Error submitting issue:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit issue. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onIssueAdded, showSuccessFeedback]);

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
          maxLength={200}
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
          maxLength={2000}
        />
        <small className="char-count">
          {formData.description.length}/2000 characters
        </small>
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
          maxLength={500}
        />
        {errors.location && <span className="error-message">{errors.location}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="priority" className="form-label">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="input select"
          disabled={isSubmitting}
        >
          <option value="Low">🟢 Low</option>
          <option value="Medium">🟡 Medium</option>
          <option value="High">🟠 High</option>
          <option value="Critical">🔴 Critical</option>
        </select>
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
});

IssueForm.displayName = 'IssueForm';

export default IssueForm; 