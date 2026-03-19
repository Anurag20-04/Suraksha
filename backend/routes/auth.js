// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, updateLocation } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);
router.patch('/location', protect, updateLocation);
module.exports = router;
