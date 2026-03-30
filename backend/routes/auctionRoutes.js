const express = require('express');
const { protect } = require('../utils/authMiddleware');
const AuctionController = require('../controllers/AuctionController');

const router = express.Router();

// Create an auction
router.post('/', protect, AuctionController.create);

// Get active auctions
router.get('/', AuctionController.getActive);

// Close auction manually (trigger settlement)
router.post('/:id/close', protect, AuctionController.close);

module.exports = router;
