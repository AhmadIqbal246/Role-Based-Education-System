const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true, // Removes whitespace from both ends of the title
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class', // References the Class model
    required: [true, 'Class ID is required'],
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model (assuming teachers are users)
    required: [true, 'Teacher ID is required'],
  },
  description: {
    type: String,
    trim: true, // Optional field for a brief description of the lesson
  },
  materials: {
    type: [String], // Array of URLs or paths to lesson materials/resources
  },
  duration: {
    type: Number, // Duration of the lesson in minutes (optional)
    default: 60, // Default duration is 60 minutes
  },
  dateScheduled: {
    type: Date, // Date and time when the lesson is scheduled
    // Remove the required attribute to make it optional
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
});

// Middleware to log when a lesson is about to be saved
lessonSchema.pre('save', function(next) {
  console.log(`Lesson titled "${this.title}" is about to be saved.`);
  next();
});

// Middleware to log after a lesson has been saved
lessonSchema.post('save', function(doc, next) {
  console.log(`Lesson titled "${doc.title}" has been saved.`);
  next();
});

// Static method to find lessons by classId
lessonSchema.statics.findByClassId = function(classId) {
  return this.find({ classId }).populate('classId').populate('teacherId');
};

module.exports = mongoose.model('Lesson', lessonSchema);