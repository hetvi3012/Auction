const express = require('express');
const { protect } = require('../utils/authMiddleware');
const { adminGuard } = require('../utils/roleMiddleware');
const { Auction, Bid, User, Ticket } = require('../models');
const { sequelize } = require('../models');

const router = express.Router();

// Get real-time analytics dashboard data
router.get('/analytics', protect, adminGuard, async (req, res) => {
    try {
        // 1. Total Trading Volume (Sum of all winning bids in Closed auctions)
        const volumeQuery = await Auction.findAll({
            where: { status: 'Closed' },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('currentHighestBid')), 'totalVolume']
            ]
        });
        const totalVolume = volumeQuery[0].dataValues.totalVolume || 0;

        // 2. Active Platform Users
        const totalUsers = await User.count();

        // 3. System Health (Active vs Closed Auctions)
        const activeAuctions = await Auction.count({ where: { status: 'Active' }});
        const closedAuctions = await Auction.count({ where: { status: 'Closed' }});

        res.json({
            status: "HEALTHY",
            metrics: {
                totalVolume,
                totalUsers,
                auctions: {
                   active: activeAuctions,
                   completed: closedAuctions
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
