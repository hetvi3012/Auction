const express = require('express');
const { protect } = require('../utils/authMiddleware');
const TicketController = require('../controllers/TicketController');

const router = express.Router();

// Create a ticket
router.post('/', protect, TicketController.create);

// Get all available tickets
router.get('/', TicketController.getAvailable);

module.exports = router;
