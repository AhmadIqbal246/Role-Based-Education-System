const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: [String], // Assuming an array of strings for options
  correctAnswer: {
    type: String,
    required: true,
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Lesson',
    required: true
  }
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
