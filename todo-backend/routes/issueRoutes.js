const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const Joi = require('joi');

// Validation schemas
const issueValidationSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().min(1).max(2000).required(),
    location: Joi.string().trim().min(1).max(500).required(),
    status: Joi.string().valid('Open', 'In Progress', 'Resolved').default('Open'),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').default('Medium'),
    reportedBy: Joi.string().trim().max(100).default('Anonymous')
});

const updateValidationSchema = Joi.object({
    title: Joi.string().trim().min(1).max(200),
    description: Joi.string().trim().min(1).max(2000),
    location: Joi.string().trim().min(1).max(500),
    status: Joi.string().valid('Open', 'In Progress', 'Resolved'),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical'),
    reportedBy: Joi.string().trim().max(100)
}).min(1); // At least one field must be provided

// GET all issues with filtering, pagination, and sorting
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            priority, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            query.$text = { $search: search };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortObj = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        // Execute query with pagination
        const [issues, total] = await Promise.all([
            Issue.find(query)
                .sort(sortObj)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(), // Use lean() for better performance
            Issue.countDocuments(query)
        ]);

        // Set caching headers
        res.set({
            'Cache-Control': 'public, max-age=60', // Cache for 1 minute
            'ETag': `"${Date.now()}"` // Simple ETag based on timestamp
        });

        res.json({
            issues,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalIssues: total,
                hasNext: skip + parseInt(limit) < total,
                hasPrev: parseInt(page) > 1
            }
        });
    } catch (err) {
        console.error('Error fetching issues:', err);
        res.status(500).json({ 
            message: 'Failed to fetch issues',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// GET single issue by ID
router.get('/:id', async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }
        
        res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        res.json(issue);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid issue ID format' });
        }
        console.error('Error fetching issue:', err);
        res.status(500).json({ 
            message: 'Failed to fetch issue',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// POST a new issue
router.post('/', async (req, res) => {
    try {
        // Validate input
        const { error, value } = issueValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                message: 'Validation error',
                details: error.details.map(detail => detail.message)
            });
        }

        const issue = new Issue(value);
        const newIssue = await issue.save();
        
        res.status(201).json(newIssue);
    } catch (err) {
        console.error('Error creating issue:', err);
        
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error',
                details: Object.values(err.errors).map(e => e.message)
            });
        }
        
        res.status(500).json({ 
            message: 'Failed to create issue',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// PUT update an issue
router.put('/:id', async (req, res) => {
    try {
        // Validate input
        const { error, value } = updateValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                message: 'Validation error',
                details: error.details.map(detail => detail.message)
            });
        }

        const updatedIssue = await Issue.findByIdAndUpdate(
            req.params.id,
            value,
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!updatedIssue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        res.json(updatedIssue);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid issue ID format' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error',
                details: Object.values(err.errors).map(e => e.message)
            });
        }
        
        console.error('Error updating issue:', err);
        res.status(500).json({ 
            message: 'Failed to update issue',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// DELETE an issue
router.delete('/:id', async (req, res) => {
    try {
        const deletedIssue = await Issue.findByIdAndDelete(req.params.id);
        
        if (!deletedIssue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        res.json({ 
            message: 'Issue deleted successfully',
            deletedIssue: { _id: deletedIssue._id, title: deletedIssue.title }
        });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid issue ID format' });
        }
        
        console.error('Error deleting issue:', err);
        res.status(500).json({ 
            message: 'Failed to delete issue',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

// GET issues statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await Issue.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$count' },
                    statusBreakdown: {
                        $push: {
                            status: '$_id',
                            count: '$count'
                        }
                    }
                }
            }
        ]);

        const result = stats[0] || { total: 0, statusBreakdown: [] };
        
        res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        res.json(result);
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ 
            message: 'Failed to fetch statistics',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
});

module.exports = router;
