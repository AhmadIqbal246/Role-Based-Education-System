const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Body parser to handle JSON bodies

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/online-education-platform';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Basic Route to Confirm Server is Running
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Import and Use Routes
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const teacherRouter = require('./routes/teacher');
const studentRouter = require('./routes/student');


app.use('/api/auth', authRouter); // Auth routes
app.use('/api/admin', adminRouter); // Admin routes
app.use('/api/teacher', teacherRouter); // Teacher routes
app.use('/api/student', studentRouter);

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 