// Importing all the required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

//Initializing the app and setting the PORT
const app = express();
const PORT = process.env.PORT || 5000 //or 3000

//Setting up the middleware
app.use(express.json());
app.use(cors());

// Connecting to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URI, {
    tlsAllowInvalidCertificates: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err))

//Routing
app.get('/', (req, res) => {
    res.send('Hi from Express Server');
});

const issueroutes = require('./routes/issueRoutes');
app.use('/api/issues', issueroutes);

// Start the Server
app.listen(PORT, () => console.log(`Server running succesfully on port ${PORT}`));