// Importing the dependencies
const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');

// Create
router.post('/', async (req, res) => {
    try {
        const newIssue = new Issue(req.body);
        const savedIssue = await newIssue.save();
        res.status(201).json(savedIssue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read all
router.get('/', async (req, res) => {
    try {
        const issues = await Issue.find();
        res.json(issues);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update (including status)
router.put('/:id', async (req, res) => {
    try {
        const updatedIssue = await Issue.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedIssue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete
router.delete('/:id', async (req, res) => {
    try {
        await Issue.findByIdAndDelete(req.params.id);
        res.json({ message: 'Issue Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 