const mongoose = require('mongoose');

// Define the Result schema
const resultSchema = new mongoose.Schema({
  // Reference to the User model (student who attempted the lesson)
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Reference to the Lesson model (lesson attempted by the student)
  lessonId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson', 
    required: true 
  },
  // Score achieved by the student for the lesson
  score: { 
    type: Number, 
    required: true 
  },
  // Date when the lesson was attempted
  dateAttempted: { 
    type: Date, 
    default: Date.now 
  },
}, {
  timestamps: true // Automatically adds `createdAt` and `updatedAt` fields
});

// Create the Result model from the schema
const Result = mongoose.model('Result', resultSchema);

module.exports = Result;