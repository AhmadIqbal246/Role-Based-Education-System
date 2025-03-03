const express = require('express');
const mongoose = require('mongoose');
const authenticateUser = require('../middleware/authMiddleware'); 
const Lesson = require('../models/Lesson');
const Question = require('../models/Question');
const Result = require('../models/Result'); 

const router = express.Router();
router.get('/lessons/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    console.log('Received classId:', classId); // Log the classId for debugging

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ error: 'Invalid classId format' });
    }

    // Convert classId to ObjectId using `new` keyword
    const lessons = await Lesson.find({ classId: new mongoose.Types.ObjectId(classId) })
                                .populate('classId')
                                .populate('teacherId');
    
    console.log('Queried Lessons:', lessons); // Log the fetched lessons

    if (!lessons.length) {
      return res.status(404).json({ error: 'No lessons found for this class' });
    }

    res.status(200).json(lessons);
  } catch (err) {
    console.error('Error fetching lessons:', err);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});
// Fetch all questions for a specific lesson
router.get('/lessons/:lessonId/questions', authenticateUser, async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ error: 'Invalid lessonId format' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const questions = await Question.find({ lessonId });
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Submit answers and score them
router.post('/lessons/:lessonId/submit-answers', authenticateUser, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body;
    const studentId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ error: 'Invalid lessonId format' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const questions = await Question.find({ lessonId });
    let score = 0;

    questions.forEach((question) => {
      const studentAnswer = answers[question._id];
      if (studentAnswer === question.correctAnswer) {
        score += 2; // Increment score for correct answers
      }
    });

    // Save the result in the database
    const result = new Result({
      studentId,
      lessonId,
      score,
      dateAttempted: new Date(),
    });

    await result.save();

    res.status(200).json({ score });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit answers' });
  }
});

// Fetch results for the student
router.get('/results', authenticateUser, async (req, res) => {
  try {
    const studentId = req.user.id;
    const results = await Result.find({ studentId }).populate('lessonId', 'title');

    if (!results.length) {
      return res.status(404).json({ error: 'No results found' });
    }

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

module.exports = router;
