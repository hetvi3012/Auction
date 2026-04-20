const express = require('express');
const { protect } = require('../utils/authMiddleware');
const { adminGuard } = require('../utils/roleMiddleware');
const AdminController = require('../controllers/AdminController');

const router = express.Router();

// Get real-time analytics dashboard data
router.get('/analytics', protect, adminGuard, AdminController.getAnalytics);

// Get all auctions for admin management
router.get('/auctions', protect, adminGuard, AdminController.getAllAuctions);

module.exports = router;
