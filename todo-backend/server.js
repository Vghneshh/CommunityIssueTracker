const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    tlsAllowInvalidCertificates: true
}).then(() => {
    console.log('✅ MongoDB Connected');
}).catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
});

// Routes
app.get('/', (req, res) => {
    res.send('✅ Hello from Express server!');
});

const issueRoutes = require('./routes/issueRoutes');
app.use('/api/issues', issueRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
