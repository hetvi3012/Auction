const express = require('express');
const { protect } = require('../utils/authMiddleware');
const { Ticket, User } = require('../models');

const router = express.Router();

// Create a ticket
router.post('/', protect, async (req, res) => {
    try {
        const { eventId, seatInfo } = req.body;
        const ticket = await Ticket.create({
            sellerId: req.user.id,
            eventId,
            seatInfo
        });
        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all available tickets
router.get('/', async (req, res) => {
    try {
        const tickets = await Ticket.findAll({
            where: { status: 'Available' },
            include: [{ model: User, as: 'seller', attributes: ['name'] }]
        });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
