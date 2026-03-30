const AuctionFacade = require('../facades/AuctionFacade');

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
}

module.exports = AdminController;
