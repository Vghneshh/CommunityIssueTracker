// Importing the dependencies
const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// Create
router.post('/', async(req, res) => {
    try {
        const newTodo = new Todo(req.body);
        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo) // Respond with saved Todo
    } catch(err) {
        res.status(500).json({error: err.message}); // Server Error
    }
});

// Read
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.json(todos);
    } catch(err) {
        res.status(500).json({error: err.message});
    }
});

// Update
router.put('/:id', async (req, res) => {
    try {
        const UpdatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new: true}
        );
        res.json(UpdatedTodo);
    } catch(err) {
        res.status(500).json({error: err.message});
    }
});

//Delete
router.delete('/:id', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.json({message: 'Todo Deleted'});
    } catch(err) {
        res.status(500).json({error: err.message});
    }
});

module.exports = router;