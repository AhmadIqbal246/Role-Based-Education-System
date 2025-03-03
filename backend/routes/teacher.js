const express = require("express");
const mongoose = require("mongoose"); // Import mongoose
const authenticateUser = require("../middleware/authMiddleware");
const verifyTeacher = require("../middleware/verifyTeacher");
const Class = require("../models/Class");
const Lesson = require("../models/Lesson");
const Question = require("../models/Question");
const Result = require("../models/Result"); // Ensure the path is correct

const router = express.Router();

// Create a new class (Teachers only)
router.post(
  "/create-class",
  authenticateUser,
  verifyTeacher,
  async (req, res) => {
    try {
      const { name } = req.body;
      console.log(
        `Creating class with name: ${name}, for teacher ID: ${req.user.id}`
      );
      const newClass = new Class({ name, teacherId: req.user.id });
      await newClass.save();
      res.json(newClass);
    } catch (err) {
      console.error("Error creating class:", err.message);
      res.status(500).json({ error: "Failed to create class" });
    }
  }
);

// Fetch all classes for the teacher
router.get("/classes", authenticateUser, verifyTeacher, async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user.id });
    res.json(classes);
  } catch (err) {
    console.error("Error fetching classes:", err.message);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// Edit a class
router.put("/classes/:classId/edit", authenticateUser, verifyTeacher, async (req, res) => {
  try {
    const { classId } = req.params;
    const { name } = req.body;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ error: "Invalid classId" });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { name },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.json(updatedClass);
  } catch (err) {
    console.error("Error editing class:", err.message);
    res.status(500).json({ error: "Failed to edit class" });
  }
});

// Delete a class
router.delete("/classes/:classId/delete", authenticateUser, verifyTeacher, async (req, res) => {
  try {
    const { classId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ error: "Invalid classId" });
    }

    const deletedClass = await Class.findByIdAndDelete(classId);

    if (!deletedClass) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    console.error("Error deleting class:", err.message);
    res.status(500).json({ error: "Failed to delete class" });
  }
});

// Create a new lesson in a class
router.post(
  "/classes/:classId/create-lesson",
  authenticateUser,
  verifyTeacher,
  async (req, res) => {
    try {
      const { title, dateScheduled, description, materials, duration } = req.body;
      const { classId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({ error: "Invalid classId" });
      }

      const newLesson = new Lesson({
        title,
        classId,
        teacherId: req.user.id,
        dateScheduled, // This field is now optional
        description,
        materials,
        duration
      });
      await newLesson.save();

      res.json(newLesson);
    } catch (err) {
      console.error("Error creating lesson:", err.message);
      res.status(500).json({ error: "Failed to create lesson" });
    }
  }
);


// Edit a lesson
router.put("/lessons/:lessonId/edit", authenticateUser, verifyTeacher, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title } = req.body;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ error: "Invalid lessonId" });
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { title },
      { new: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.json(updatedLesson);
  } catch (err) {
    console.error("Error editing lesson:", err.message);
    res.status(500).json({ error: "Failed to edit lesson" });
  }
});

// Delete a lesson
router.delete("/lessons/:lessonId/delete", authenticateUser, verifyTeacher, async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ error: "Invalid lessonId" });
    }

    const deletedLesson = await Lesson.findByIdAndDelete(lessonId);

    if (!deletedLesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    console.error("Error deleting lesson:", err.message);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
});

// Create a question in a lesson
router.post(
  "/lessons/:lessonId/create-question",
  authenticateUser,
  verifyTeacher,
  async (req, res) => {
    try {
      const { lessonId } = req.params;
      const { type, questionText, options, correctAnswer } = req.body;

      if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        return res.status(400).json({ error: "Invalid lessonId format" });
      }

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      const newQuestion = new Question({
        type,
        questionText,
        options,
        correctAnswer,
        lessonId,
      });

      await newQuestion.save();
      res.status(201).json(newQuestion);
    } catch (err) {
      console.error("Error creating question:", err);
      res
        .status(500)
        .json({ error: "Server error. Failed to create question." });
    }
  }
);

// Edit a question
router.put("/questions/:questionId/edit", authenticateUser, verifyTeacher, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { type, questionText, options, correctAnswer } = req.body;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ error: "Invalid questionId" });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { type, questionText, options, correctAnswer },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(updatedQuestion);
  } catch (err) {
    console.error("Error editing question:", err.message);
    res.status(500).json({ error: "Failed to edit question" });
  }
});

// Delete a question
router.delete("/questions/:questionId/delete", authenticateUser, verifyTeacher, async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ error: "Invalid questionId" });
    }

    const deletedQuestion = await Question.findByIdAndDelete(questionId);

    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.error("Error deleting question:", err.message);
    res.status(500).json({ error: "Failed to delete question" });
  }
});
// Fetch all questions for a lesson
router.get(
  "/lessons/:lessonId/questions",
  authenticateUser,
  verifyTeacher,
  async (req, res) => {
    try {
      const { lessonId } = req.params;

      // Validate lessonId format
      if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        return res.status(400).json({ error: "Invalid lessonId format" });
      }

      // Check if the lesson exists
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Lesson not found" });
      }

      // Fetch questions related to the lesson
      const questions = await Question.find({ lessonId });
      res.status(200).json(questions);
    } catch (err) {
      console.error("Error fetching questions:", err);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  }
);
// Fetch all lessons for a class
router.get(
  "/classes/:classId/lessons",
  authenticateUser,
  verifyTeacher,
  async (req, res) => {
    try {
      const lessons = await Lesson.find({ classId: req.params.classId });
      res.json(lessons);
    } catch (err) {
      console.error("Error fetching lessons:", err.message);
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  }
);

// Assign students to a class
router.post(
  "/classes/:classId/assign-students",
  authenticateUser,
  verifyTeacher,
  async (req, res) => {
    try {
      const { studentIds } = req.body;
      await Class.findByIdAndUpdate(req.params.classId, {
        $addToSet: { studentIds: { $each: studentIds } },
      });
      res.json({ message: "Students assigned successfully" });
    } catch (err) {
      console.error("Error assigning students:", err.message);
      res.status(500).json({ error: "Failed to assign students" });
    }
  }
);

// Fetch results for all lessons created by the teacher
router.get("/results", authenticateUser, verifyTeacher, async (req, res) => {
  try {
    const teacherId = req.user.id;

    const lessons = await Lesson.find({ teacherId });

    if (!lessons || lessons.length === 0) {
      return res.status(404).json({ error: "No lessons found for this teacher" });
    }

    const lessonIds = lessons.map((lesson) => lesson._id);
    const results = await Result.find({ lessonId: { $in: lessonIds } })
      .populate("studentId", "name")
      .populate("lessonId", "title");

    if (!results || results.length === 0) {
      return res.status(404).json({ error: "No results found for these lessons" });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

module.exports = router;
