const AuctionFacade = require('../facades/AuctionFacade');

/**
 * Controller — BidController
 * Handles bid placement and proxy bid configuration.
 * Delegates all business logic to the AuctionFacade.
 */
class BidController {
    
    /**
     * POST /api/bids — Place a new manual bid
     */
    static async placeBid(req, res) {
        try {
            const { auctionId, amount } = req.body;
            const result = await AuctionFacade.placeBid(auctionId, amount, req.user.id);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * POST /api/bids/proxy — Set a proxy bid limit
     */
    static async setProxyLimit(req, res) {
        try {
            const { auctionId, maxWillingToPay } = req.body;
            const result = await AuctionFacade.setProxyBidLimit(auctionId, req.user.id, maxWillingToPay);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = BidController;
