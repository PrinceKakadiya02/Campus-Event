const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Note: In a production app, remember to hash the password here (e.g., using bcrypt)
    const newUser = await User.create({
      username,
      email,
      password,
      role: 'student'
    });

    res.status(201).json({ message: 'Student registered successfully', user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

module.exports = router;
