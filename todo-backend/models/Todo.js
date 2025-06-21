// To create Mongoose Schema

// Importing the Mongoose Library
const mongoose = require('mongoose');

// Defined the schema
const todoSchema = new mongoose.Schema({
    title: {type: String, required: true},
    completed: {type: Boolean, default: false}
});

// Creating the mongoose model
module.exports = mongoose.model('Todo', todoSchema);