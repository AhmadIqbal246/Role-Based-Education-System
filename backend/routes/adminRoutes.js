const express = require('express');
const router = express.Router();
const { createTeacher, changeRole, editUser, getUsers } = require('../controllers/adminController'); // Adjust the path as needed

// Middleware to authenticate and authorize admin (you can use your existing middleware)
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/create-teacher', authMiddleware, adminMiddleware, createTeacher);
router.post('/change-role', authMiddleware, adminMiddleware, changeRole);
router.put('/edit-user', authMiddleware, adminMiddleware, editUser);
router.get('/users', authMiddleware, adminMiddleware, getUsers);

module.exports = router;
