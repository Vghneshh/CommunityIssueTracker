const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');

// GET all issues
router.get('/', async (req, res) => {
    try {
        const issues = await Issue.find();
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new issue
router.post('/', async (req, res) => {
    const issue = new Issue({
        title: req.body.title,
        description: req.body.description,
        completed: req.body.completed || false
    });

    try {
        const newIssue = await issue.save();
        res.status(201).json(newIssue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
