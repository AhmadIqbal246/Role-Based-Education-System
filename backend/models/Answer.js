const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  answers: { type: Map, of: String }, // Store answers as a map {questionId: answer}
  score: { type: Number, default: 0 },
});

const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;
