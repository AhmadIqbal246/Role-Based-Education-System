const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: function() {
      return this.role !== 'Teacher'; // Conditionally require `class` field based on user role
    }
  }
});

module.exports = mongoose.model('User', UserSchema);