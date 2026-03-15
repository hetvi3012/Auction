const express = require('express');
const { protect } = require('../utils/authMiddleware');
const { Auction, Ticket, User } = require('../models');
const AuctionSettlementService = require('../services/AuctionSettlementService');

const router = express.Router();

// Create an auction
router.post('/', protect, async (req, res) => {
    try {
        const { ticketId, strategyType, startingPrice, endTime } = req.body;
        
        const ticket = await Ticket.findByPk(ticketId);
        if (!ticket || ticket.sellerId !== req.user.id) {
            return res.status(404).json({ message: 'Ticket not found or unauthorized' });
        }
        if (ticket.status !== 'Available') {
            return res.status(400).json({ message: 'Ticket is already in an auction or sold' });
        }

        const auction = await Auction.create({
            ticketId,
            strategyType,
            startingPrice,
            endTime,
            status: 'Active',
            currentHighestBid: startingPrice
        });

        ticket.status = 'In_Auction';
        await ticket.save();

        res.status(201).json(auction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get active auctions
router.get('/', async (req, res) => {
    try {
        const auctions = await Auction.findAll({
            where: { status: 'Active' },
            include: [{ model: Ticket, as: 'ticket' }]
        });
        res.json(auctions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Close auction manually (trigger settlement)
router.post('/:id/close', protect, async (req, res) => {
    try {
        const result = await AuctionSettlementService.settleAuction(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
