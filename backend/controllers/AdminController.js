const AuctionFacade = require('../facades/AuctionFacade');
const { Auction, Ticket } = require('../models');

/**
 * Controller — AdminController
 * Handles admin-only operations like analytics.
 * Delegates to AuctionFacade.
 */
class AdminController {

    /**
     * GET /api/admin/analytics — Get platform analytics
     */
    static async getAnalytics(req, res) {
        try {
            const analytics = await AuctionFacade.getAnalytics();
            res.json(analytics);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * GET /api/admin/auctions — Get all auctions for admin management
     */
    static async getAllAuctions(req, res) {
        try {
            const auctions = await Auction.findAll({
                include: [{ model: Ticket, as: 'ticket' }],
                order: [['createdAt', 'DESC']]
            });
            res.json(auctions);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AdminController;
