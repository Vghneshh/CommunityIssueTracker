const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
        index: true // Index for text search
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        maxlength: [500, 'Location cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved'],
        default: 'Open',
        index: true // Index for filtering by status
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    reportedBy: {
        type: String,
        default: 'Anonymous'
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for efficient queries
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ title: 'text', description: 'text' }); // Text search index

// Virtual for days since creation
issueSchema.virtual('daysSinceCreated').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
issueSchema.pre('save', function(next) {
    // Auto-complete if status is Resolved
    if (this.status === 'Resolved') {
        this.completed = true;
    }
    next();
});

// Static methods for common queries
issueSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

issueSchema.statics.findRecent = function(limit = 10) {
    return this.find().sort({ createdAt: -1 }).limit(limit);
};

module.exports = mongoose.model('Issue', issueSchema);
