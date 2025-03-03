const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Result = require('../models/Result'); // Import the Result model
const authenticateUser = require('../middleware/authMiddleware');
const verifyAdmin = require('../middleware/verifyAdmin');

const router = express.Router();

// Route to fetch all users
router.get('/users', authenticateUser, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

// Route to create a new teacher account
router.post(
  '/create-teacher',
  [
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('name', 'Name must be at least 3 characters').isLength({ min: 3 })
  ],
  authenticateUser, 
  verifyAdmin,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create and hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new teacher account
      user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'Teacher' // Explicitly set the role to Teacher
      });

      await user.save();

      res.json({ message: 'Teacher account created successfully' });
    } catch (err) {
      console.error('Error creating teacher account:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Route to change user role
router.post('/change-role', authenticateUser, verifyAdmin, async (req, res) => {
  const { userId, newRole } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = newRole;
    await user.save();

    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating user role' });
  }
});

// Route to edit user information
router.put('/edit-user', authenticateUser, verifyAdmin, async (req, res) => {
  const { userId, name, email } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name;
    user.email = email;
    await user.save();

    res.json({ message: 'User information updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating user information' });
  }
});

// Route to fetch all results for all lessons
router.get('/results', authenticateUser, verifyAdmin, async (req, res) => {
  try {
    const results = await Result.find({})
      .populate('studentId', 'name')
      .populate('lessonId', 'title');

    if (!results.length) {
      return res.status(404).json({ error: 'No results found' });
    }

    res.json(results);
  } catch (err) {
    console.error('Error fetching results:', err.message); // Log the error message for debugging
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

module.exports = router;