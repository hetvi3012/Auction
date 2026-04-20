const express = require('express');
const { protect } = require('../utils/authMiddleware');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Register
router.post('/register', AuthController.register);

// Login
router.post('/login', AuthController.login);

// Wallet top-up (protected)
router.post('/topup', protect, AuthController.topUp);

// Get profile with bid history (protected)
router.get('/profile', protect, AuthController.getProfile);

module.exports = router;
