// Importing the Mongoose Library
const mongoose = require('mongoose');

// Define the schema for an Issue
const issueSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' }
});

// Creating the mongoose model
module.exports = mongoose.model('Issue', issueSchema); 