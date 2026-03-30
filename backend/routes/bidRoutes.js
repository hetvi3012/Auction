const express = require('express');
const { protect } = require('../utils/authMiddleware');
const BidController = require('../controllers/BidController');

const router = express.Router();

// Place a new manual bid
router.post('/', protect, BidController.placeBid);

// Configure a proxy bid limit
router.post('/proxy', protect, BidController.setProxyLimit);

module.exports = router;
